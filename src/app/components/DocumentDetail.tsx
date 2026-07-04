import { useState, useEffect, useRef, FormEvent } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Database,
  Download,
  ExternalLink,
  Eye,
  File,
  FileText,
  Globe,
  Maximize2,
  Minus,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { hubCard } from './home-dashboard/hubStyles';
import { Button } from './ui/button';
import { BackLink } from './ui/back-link';
import { PageBreadcrumb } from './ui/page-breadcrumb';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn } from './ui/utils';
import { getDocumentContent, type DocumentContent } from '../data/documentDetailData';
import type { AppView } from '../types/navigation';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isThinking?: boolean;
  thinkingPhase?: string;
  webIntelligenceSummary?: string;
  isExtended?: boolean;
}

export type DocumentChatMessage = ChatMessage;

interface DocumentDetailProps {
  documentId: string;
  onBack: () => void;
  onOpenDocument?: (documentId: string) => void;
  breadcrumbParent?: { label: string; onClick: () => void };
  breadcrumbCurrentOnClick?: () => void;
  breadcrumbChildLabel?: string;
  initialChatOpen?: boolean;
  initialMessages?: DocumentChatMessage[];
  onMessagesChange?: (messages: DocumentChatMessage[], resourceTitle: string) => void;
}

function renderInlineBold(text: string): Array<string | JSX.Element> {
  const parts = text.split(/(\*\*.*?\*\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`bold-${index}`} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function renderFormattedAssistantText(content: string): JSX.Element[] {
  const lines = content.replace(/\\n/g, '\n').split('\n');
  const elements: JSX.Element[] = [];
  let key = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      elements.push(<div key={`spacer-${key++}`} className="h-2" />);
      continue;
    }

    const bulletMatch = line.match(/^(?:•|-)\s+(.*)$/);
    if (bulletMatch) {
      elements.push(
        <div key={`bullet-${key++}`} className="flex gap-2 text-sm leading-7 mb-1">
          <span className="text-primary shrink-0">-</span>
          <span className="text-secondary-foreground">{renderInlineBold(bulletMatch[1])}</span>
        </div>,
      );
      continue;
    }

    const isSectionTitle = line.endsWith(':');
    elements.push(
      <p
        key={`line-${key++}`}
        className={`text-sm leading-7 ${
          isSectionTitle ? 'font-semibold text-foreground mt-1' : 'text-secondary-foreground'
        }`}
      >
        {renderInlineBold(line)}
      </p>,
    );
  }

  return elements;
}

function generateDocumentResponse(query: string, content: DocumentContent): string {
  const lower = query.toLowerCase();
  const title = content.title.toLowerCase();

  if (title.includes('security') || title.includes('sop') || title.includes('incident')) {
    if (lower.includes('region') || lower.includes('district') || lower.includes('where')) {
      return `From the ${content.title}, highest-risk areas include Lower Shabelle (Afgooye–Marka corridor), parts of Banadir after 19:00, and rural routes near Qoryooley. Mogadishu remains manageable in government-controlled districts with escort protocols.\n\nWould you like recommended movement restrictions or escort requirements?`;
    }
    if (lower.includes('recommend') || lower.includes('mitigation') || lower.includes('protocol')) {
      return `Key mitigations referenced in this document:\n\n• Mandatory armed escort on secondary routes in Lower Shabelle\n• UNDSS journey clearance 48 hours ahead for high-risk districts\n• Real-time incident reporting within 2 hours of any security event\n• Avoid night movements in Banadir and Marka districts\n\nI can break these down by agency role if helpful.`;
    }
  }

  if (title.includes('hct') || title.includes('meeting') || lower.includes('coordination')) {
    return `The ${content.title} covers HCT coordination frameworks, sector updates, and 2026 strategic priorities for Somalia operations.\n\nWould you like decisions, funding status, or sector-specific follow-ups?`;
  }

  if (title.includes('wash') || lower.includes('cholera') || lower.includes('water')) {
    return `According to the ${content.title}, WASH coverage is weakest in Bay and Bakool, with cholera preparedness active in Baidoa IDP sites. Hygiene kit and chemical pipeline delays at Mogadishu port are affecting response timelines.\n\nShould I summarize partner gaps or site-level needs?`;
  }

  if (title.includes('map') || title.includes('access') || title.includes('mogadishu')) {
    return `The ${content.title} describes restricted corridors, open routes, and checkpoint locations in the Mogadishu operational area.\n\nWould you like corridor-level detail or movement recommendations?`;
  }

  if (title.includes('strategy') || title.includes('mitigation') || lower.includes('risk reduction')) {
    return `The ${content.title} sets long-term risk reduction objectives aligned with HCT priorities across the Somalia mission portfolio.\n\nWould you like objectives by sector or implementation timeline?`;
  }

  return `Based on your question about "${query}" in the context of ${content.title}:\n\n${content.summary.slice(0, 280)}…\n\nAsk a more specific question about regions, timelines, or recommended actions.`;
}

function generateExtendedWebIntelligence(query: string, content: DocumentContent): string {
  return `**Web Intelligence** (supplementary, unverified)\n\nBroader context beyond ${content.title}: recent field reporting and open-source updates suggest overlapping signals across Bay, Bakool, and Banadir that may refine how you interpret this resource. For "${query}", cross-reporting from partner networks indicates operational conditions can shift faster than static document timelines.\n\nUse this layer to stress-test assumptions from the resource — not as a substitute for verified internal data.`;
}

function DocumentChatComposer({
  chatQuery,
  isTyping,
  isConnectedToPanel,
  isExtendedKnowledgeMode,
  onExtendedKnowledgeChange,
  onChange,
  onFocus,
  onSubmit,
}: {
  chatQuery: string;
  isTyping: boolean;
  isChatOpen: boolean;
  isConnectedToPanel?: boolean;
  isExtendedKnowledgeMode: boolean;
  onExtendedKnowledgeChange: (enabled: boolean) => void;
  onChange: (value: string) => void;
  onFocus: () => void;
  onSubmit: (e: FormEvent) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canSend = Boolean(chatQuery.trim()) && !isTyping;

  return (
    <form
      onSubmit={onSubmit}
      className={isConnectedToPanel ? 'px-4 sm:px-6 py-3' : undefined}
    >
      <div
        role="presentation"
        data-composite-field
        onClick={() => inputRef.current?.focus()}
        className={cn(
          'relative w-full rounded-2xl border border-border bg-card transition-colors cursor-text',
          'hover:border-primary',
          'focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/10',
          'min-h-[96px]',
        )}
      >
        <div className="absolute bottom-3 left-4 z-10 flex max-w-[calc(100%-4.5rem)] flex-wrap items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-pressed={isExtendedKnowledgeMode}
                onClick={(event) => {
                  event.stopPropagation();
                  const nextState = !isExtendedKnowledgeMode;
                  onExtendedKnowledgeChange(nextState);
                  toast.success(
                    nextState ? 'Extended Knowledge is on' : 'Extended Knowledge is off',
                  );
                }}
                className={cn(
                  'inline-flex max-w-[230px] items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  isExtendedKnowledgeMode
                    ? 'border-primary bg-primary-subtle text-primary hover:bg-sidebar-accent'
                    : 'border-border bg-card text-foreground hover:bg-muted/30',
                )}
              >
                <Sparkles size={12} />
                <span className="truncate ml-1.5">
                  {isExtendedKnowledgeMode ? 'Extended Knowledge ON' : 'Extended Knowledge'}
                </span>
                {isExtendedKnowledgeMode ? (
                  <span className="ml-1.5">
                    <X size={12} />
                  </span>
                ) : null}
              </button>
            </TooltipTrigger>
            <TooltipContent
              variant="muted"
              side="top"
              sideOffset={8}
              className="w-[320px] max-w-[320px] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-normal shadow-lg"
            >
              Enabling Extended Knowledge allows the model to enhance responses with its broader internal knowledge, providing additional context beyond your selected documents while still keeping answers grounded in your data.
            </TooltipContent>
          </Tooltip>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={chatQuery}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          placeholder={
            isExtendedKnowledgeMode
              ? 'Ask in Extended Knowledge mode...'
              : 'Ask about this resource…'
          }
          disabled={isTyping}
          className="focus-ring-container-control h-[96px] w-full border-0 bg-transparent pl-6 pr-16 pt-4 pb-12 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:outline-none focus:ring-0 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!canSend}
          className={cn(
            'absolute right-2 bottom-3 inline-flex h-10 w-10 items-center justify-center rounded-xl text-white transition-colors',
            canSend ? 'bg-primary hover:bg-primary-hover' : 'bg-muted cursor-not-allowed',
          )}
          aria-label="Send message"
        >
          <Send size={16} className={canSend ? 'text-white' : 'text-text-subtle'} />
        </button>
      </div>
      {isExtendedKnowledgeMode && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          AI can make mistakes. Check important info.
        </p>
      )}
    </form>
  );
}

function WebIntelligenceCard({ content }: { content: string }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mt-3 border border-border rounded-xl bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted transition-colors border-b border-border"
      >
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Web Intelligence</span>
          <span className="text-xs text-text-subtle font-normal">Supplementary, unverified</span>
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={16} className="text-muted-foreground" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 py-3">
          <div className="space-y-0.5">{renderFormattedAssistantText(content)}</div>
        </div>
      )}
    </div>
  );
}

export function DocumentDetail({
  documentId,
  onBack,
  onOpenDocument,
  breadcrumbParent,
  breadcrumbCurrentOnClick,
  breadcrumbChildLabel,
  initialChatOpen = false,
  initialMessages,
  onMessagesChange,
}: DocumentDetailProps) {
  const content = getDocumentContent(documentId);
  const [chatQuery, setChatQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages ?? []);
  const [isTyping, setIsTyping] = useState(false);
  const [isExtendedKnowledgeMode, setIsExtendedKnowledgeMode] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(initialChatOpen);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Keep chat collapsed when opening a document detail view, even if history exists.
    setIsChatOpen(false);
    setIsChatExpanded(false);
    setMessages(initialMessages ?? []);
    setChatQuery('');
    // Remount via `key` handles thread switches; only sync when the document id changes in-place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isChatOpen, isChatExpanded]);

  useEffect(() => {
    if (!onMessagesChange || messages.length === 0) return;
    onMessagesChange(messages, content.title);
  }, [messages, content.title, onMessagesChange]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim() || isTyping) return;

    const userQuery = chatQuery.trim();
    const useExtendedKnowledge = isExtendedKnowledgeMode;
    setChatQuery('');
    setIsChatOpen(true);
    setMessages((prev) => [...prev, { role: 'user', content: userQuery }]);
    setIsTyping(true);

    if (useExtendedKnowledge) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '',
          isThinking: true,
          thinkingPhase: 'Looking through knowledge base...',
        },
      ]);

      window.setTimeout(() => {
        setMessages((prev) =>
          prev.map((message, index) =>
            index === prev.length - 1 && message.isThinking
              ? { ...message, thinkingPhase: 'Searching web sources...' }
              : message,
          ),
        );
      }, 900);

      window.setTimeout(() => {
        setMessages((prev) =>
          prev.map((message, index) =>
            index === prev.length - 1 && message.isThinking
              ? { ...message, thinkingPhase: 'Preparing answer...' }
              : message,
          ),
        );
      }, 1800);

      window.setTimeout(() => {
        setMessages((prev) => {
          const withoutThinking = prev.filter((message) => !message.isThinking);
          return [
            ...withoutThinking,
            {
              role: 'assistant',
              content: generateDocumentResponse(userQuery, content),
              webIntelligenceSummary: generateExtendedWebIntelligence(userQuery, content),
              isExtended: true,
            },
          ];
        });
        setIsTyping(false);
      }, 2700);
      return;
    }

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: generateDocumentResponse(userQuery, content) },
      ]);
      setIsTyping(false);
    }, 900);
  };

  const renderChatMessages = () => (
    <>
      {messages.map((message, index) => (
        <div key={index}>
          {message.role === 'user' ? (
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl bg-primary text-primary-foreground px-4 py-2.5 text-sm leading-relaxed shadow-sm">
                {message.content}
              </div>
            </div>
          ) : (
            <div className="max-w-full">
              {message.isExtended && (
                <div className="mb-3 border border-border rounded-xl bg-card overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-muted/40">
                    <div className="flex items-center gap-2">
                      <Database size={14} className="text-primary" />
                      <span className="text-sm font-semibold text-foreground">Knowledge Base</span>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <div className="space-y-0.5">{renderFormattedAssistantText(message.content)}</div>
                  </div>
                </div>
              )}
              {!message.isExtended && (
                <div className="px-1 text-sm text-secondary-foreground whitespace-pre-wrap leading-relaxed">
                  {message.isThinking ? (
                    <span className="inline-flex items-center gap-2 text-primary">
                      <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                      {message.thinkingPhase || 'Thinking…'}
                    </span>
                  ) : (
                    <div className="space-y-0.5">{renderFormattedAssistantText(message.content)}</div>
                  )}
                </div>
              )}
              {message.webIntelligenceSummary && !message.isThinking && (
                <WebIntelligenceCard content={message.webIntelligenceSummary} />
              )}
            </div>
          )}
        </div>
      ))}
      {isTyping && !messages.some((message) => message.isThinking) && (
        <div>
          <div className="px-1">
            <div className="flex gap-1">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderEmptyChat = () => (
    <div className="text-center py-12">
      <Sparkles size={40} className="text-border mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">Ask anything about this resource</p>
    </div>
  );

  const fileIconForType = (fileType: DocumentContent['files'][number]['fileType']) => {
    if (fileType === 'pdf' || fileType === 'doc') return FileText;
    return File;
  };

  const handleFileDownload = (fileName: string) => {
    toast.success(`Download started for ${fileName}`);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden relative">
      <div
        className={`flex-1 flex flex-col min-h-0 transition-[margin] duration-300 ${
          isChatExpanded ? 'lg:mr-[420px]' : ''
        }`}
      >
        <div className={`flex-1 overflow-y-auto min-h-0 ${isChatExpanded ? '' : 'pb-4'}`}>
          <div className="px-4 sm:px-8 pt-6">
            {!breadcrumbParent && <BackLink onClick={onBack} className="mb-4" />}
            {breadcrumbParent ? (
              <PageBreadcrumb
                className="mb-6"
                items={[
                  { label: breadcrumbParent.label, onClick: breadcrumbParent.onClick },
                  { label: content.title, onClick: breadcrumbCurrentOnClick },
                  ...(breadcrumbChildLabel ? [{ label: breadcrumbChildLabel }] : []),
                ]}
              />
            ) : null}

            <div className="max-w-[900px] mx-auto w-full space-y-6">
              <div className={`${hubCard} p-6 sm:p-8`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-semibold text-foreground leading-tight mb-4">
                      {content.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <FileText size={15} className="text-primary" />
                        {content.fileCount === 1
                          ? `${content.fileCount} file`
                          : `${content.fileCount} files`}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Eye size={15} />
                        {content.views} views
                      </span>
                      {content.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-subtle text-primary-text"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={15} />
                        Added {content.createdAt}
                      </span>
                    </div>
                  </div>
                  {breadcrumbCurrentOnClick && (
                    <Button
                      type="button"
                      className="shrink-0 gap-2"
                      onClick={breadcrumbCurrentOnClick}
                    >
                      Open Resource
                      <ExternalLink size={16} />
                    </Button>
                  )}
                </div>
              </div>

              <section>
                <h2 className="mb-3 text-sm font-semibold text-foreground">Description</h2>
                <p className="text-sm text-foreground leading-relaxed">
                  {content.summary}
                </p>
              </section>

              {content.webLinks.length > 0 && (
                <section>
                  <h2 className="mb-3 text-sm font-semibold text-foreground">
                    Web Links in this resource ({content.webLinks.length})
                  </h2>
                  <ul className="divide-y divide-border">
                    {content.webLinks.map((link) => (
                      <li key={link.id}>
                        <div className="py-4 pr-5 sm:pr-6">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline max-w-full"
                          >
                            <Globe size={14} className="shrink-0" />
                            <span className="truncate">{link.url}</span>
                            <ExternalLink size={12} className="shrink-0" />
                          </a>
                          <p className="text-xs text-muted-foreground mt-1.5">
                            Added {link.addedAt}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {content.files.length > 0 && (
                <section>
                  <h2 className="mb-0 pb-2 text-sm font-semibold text-foreground">
                    Files in this resource ({content.files.length})
                  </h2>
                  <ul className="divide-y divide-border">
                    {content.files.map((file) => {
                      const RelIcon = fileIconForType(file.fileType);
                      return (
                        <li key={file.id}>
                          <div className="group w-full flex items-center gap-4 pr-5 sm:pr-6 py-4 hover:bg-muted/50 transition-colors">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-subtle border border-border">
                              <RelIcon size={18} className="text-primary" />
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-medium leading-6 text-foreground">
                                {file.name}
                              </span>
                              <span className="block text-sm text-muted-foreground mt-0.5">
                                {file.type} • {file.size} • Uploaded {file.uploadedAt}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleFileDownload(file.name)}
                              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-foreground hover:bg-muted transition-all"
                              aria-label={`Download ${file.name}`}
                              title="Download"
                            >
                              <Download size={16} />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </div>

        {!isChatExpanded && (
          <div className="shrink-0 px-4 sm:px-8 pb-4 pt-2">
            <div className="max-w-[900px] mx-auto w-full">
              {!isChatOpen && messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-muted transition-colors"
                >
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Resume chat ({messages.length})
                </button>
              )}

              {isChatOpen ? (
                <div className="overflow-hidden rounded-[20px] border border-border bg-card shadow-xl">
                  <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-muted/40 shrink-0">
                    <span className="text-sm font-medium text-foreground truncate pr-2">Chat</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsChatExpanded(true);
                          setIsChatOpen(true);
                        }}
                        className="p-1.5 rounded-md hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                        title="Expand to side panel"
                        aria-label="Expand chat"
                      >
                        <Maximize2 size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsChatOpen(false)}
                        className="p-1.5 rounded-md hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                        title="Minimize"
                        aria-label="Minimize chat"
                      >
                        <Minus size={18} />
                      </button>
                    </div>
                  </div>
                  <div
                    ref={chatScrollRef}
                    className="h-[420px] overflow-y-auto px-4 sm:px-6 py-5 space-y-5"
                  >
                    {messages.length === 0 ? renderEmptyChat() : renderChatMessages()}
                  </div>
                  <DocumentChatComposer
                    chatQuery={chatQuery}
                    isTyping={isTyping}
                    isChatOpen={isChatOpen}
                    isConnectedToPanel
                    isExtendedKnowledgeMode={isExtendedKnowledgeMode}
                    onExtendedKnowledgeChange={setIsExtendedKnowledgeMode}
                    onChange={setChatQuery}
                    onFocus={() => setIsChatOpen(true)}
                    onSubmit={handleSendMessage}
                  />
                </div>
              ) : (
                <DocumentChatComposer
                  chatQuery={chatQuery}
                  isTyping={isTyping}
                  isChatOpen={isChatOpen}
                  isExtendedKnowledgeMode={isExtendedKnowledgeMode}
                  onExtendedKnowledgeChange={setIsExtendedKnowledgeMode}
                  onChange={setChatQuery}
                  onFocus={() => setIsChatOpen(true)}
                  onSubmit={handleSendMessage}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {isChatExpanded && (
        <div className="fixed inset-y-0 right-0 z-50 flex flex-col w-full lg:w-[420px] bg-card border-l border-border shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-muted/40 shrink-0 pt-4">
            <span className="text-sm font-medium text-foreground truncate pr-2">Chat</span>
            <button
              type="button"
              onClick={() => {
                setIsChatExpanded(false);
                setIsChatOpen(true);
              }}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Collapse to bottom panel"
              aria-label="Collapse chat"
            >
              <Minus size={18} />
            </button>
          </div>
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 min-h-0"
          >
            {messages.length === 0 ? renderEmptyChat() : renderChatMessages()}
          </div>
          <div className="shrink-0 bg-card">
            <DocumentChatComposer
              chatQuery={chatQuery}
              isTyping={isTyping}
              isChatOpen
              isConnectedToPanel
              isExtendedKnowledgeMode={isExtendedKnowledgeMode}
              onExtendedKnowledgeChange={setIsExtendedKnowledgeMode}
              onChange={setChatQuery}
              onFocus={() => setIsChatOpen(true)}
              onSubmit={handleSendMessage}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export type DocumentReturnView = AppView | 'aiSearch';
