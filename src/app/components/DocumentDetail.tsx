import { useState, useEffect, useRef, FormEvent } from 'react';
import {
  Calendar,
  ExternalLink,
  Eye,
  File,
  FileText,
  Maximize2,
  Minus,
  Send,
  Sparkles,
} from 'lucide-react';
import { hubCard } from './home-dashboard/hubStyles';
import { PageFooter } from './PageFooter';
import { Button } from './ui/button';
import { BackLink } from './ui/back-link';
import { PageBreadcrumb } from './ui/page-breadcrumb';
import { getDocumentContent, type DocumentContent } from '../data/documentDetailData';
import type { AppView } from '../types/navigation';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isThinking?: boolean;
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

function DocumentChatComposer({
  chatQuery,
  isTyping,
  isChatOpen,
  isExpandedLayout,
  isConnectedToPanel,
  onChange,
  onFocus,
  onSubmit,
}: {
  chatQuery: string;
  isTyping: boolean;
  isChatOpen: boolean;
  isExpandedLayout?: boolean;
  isConnectedToPanel?: boolean;
  onChange: (value: string) => void;
  onFocus: () => void;
  onSubmit: (e: FormEvent) => void;
}) {
  const canSend = Boolean(chatQuery.trim()) && !isTyping;

  if (isExpandedLayout) {
    return (
      <form onSubmit={onSubmit} className={`relative ${isConnectedToPanel ? 'px-4 sm:px-6 py-3' : ''}`}>
        <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
          <Sparkles size={18} className="text-muted-foreground" />
        </div>
        <input
          type="text"
          value={chatQuery}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          placeholder="Ask about this document…"
          disabled={isTyping}
          className="focus-ring-container-control w-full bg-card text-sm text-foreground placeholder:text-muted-foreground pl-12 pr-14 focus:outline-none focus:ring-0 transition-all disabled:opacity-60 border border-border rounded-[22px] py-[18px] hover:border-primary focus:border-primary focus:ring-2 focus:ring-ring/10"
        />
        <button
          type="submit"
          disabled={!canSend}
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            canSend ? 'text-primary hover:bg-primary-subtle' : 'text-muted-foreground cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
        <Sparkles size={18} className="text-muted-foreground" />
      </div>
      <input
        type="text"
        value={chatQuery}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder="Ask about this document…"
        disabled={isTyping}
        className={`focus-ring-container-control w-full bg-card text-sm text-foreground placeholder:text-muted-foreground pl-12 pr-14 focus:outline-none focus:ring-0 transition-all disabled:opacity-60 ${
          isConnectedToPanel
            ? 'border border-border rounded-b-[20px] rounded-t-none py-[18px] hover:border-primary focus:border-primary focus:ring-2 focus:ring-ring/10'
            : 'border border-border rounded-full py-[18px] hover:border-primary focus:border-primary focus:ring-2 focus:ring-ring/10'
        }`}
      />
      <button
        type="submit"
        disabled={!canSend}
        className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          canSend
            ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        }`}
        aria-label="Send message"
      >
        <Send size={18} />
      </button>
    </form>
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
    setChatQuery('');
    setIsChatOpen(true);
    setMessages((prev) => [...prev, { role: 'user', content: userQuery }]);
    setIsTyping(true);

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
              <div className="px-1 text-sm text-secondary-foreground whitespace-pre-wrap leading-relaxed">
                {message.isThinking ? (
                  <span className="inline-flex items-center gap-2 text-primary">
                    <Sparkles size={14} className="animate-pulse" />
                    Thinking…
                  </span>
                ) : (
                  <div className="space-y-0.5">{renderFormattedAssistantText(message.content)}</div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
      {isTyping && (
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
      <p className="text-sm text-muted-foreground">Ask anything about this document</p>
    </div>
  );

  const FileIcon = content.fileType === 'pdf' ? FileText : File;

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
                        <FileIcon size={15} className="text-primary" />
                        {content.size}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Eye size={15} />
                        {content.views} views
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-subtle text-primary-text">
                        {content.tag}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={15} />
                        Added {content.createdAt}
                      </span>
                    </div>
                  </div>
                  <Button type="button" className="shrink-0 gap-2">
                    Open Resource
                    <ExternalLink size={16} />
                  </Button>
                </div>
              </div>

              <section>
                <h2 className="mb-3 text-sm font-semibold leading-5 text-[#334155]">
                  Document Summary
                </h2>
                <p className="text-sm text-foreground leading-relaxed">
                  {content.summary}
                </p>
              </section>

              {content.relatedDocs.length > 0 && (
                <section>
                  <div className="pb-2">
                    <h2 className="mb-0 text-sm font-semibold leading-5 text-[#334155]">
                      Related Documents ({content.relatedDocs.length})
                    </h2>
                  </div>
                  <ul className="divide-y divide-border">
                    {content.relatedDocs.map((doc) => {
                      const RelIcon = doc.fileType === 'pdf' ? FileText : File;
                      return (
                        <li key={doc.id}>
                          <button
                            type="button"
                            onClick={() => onOpenDocument?.(doc.id)}
                            className="w-full flex items-start gap-4 pr-5 sm:pr-6 py-4 text-left hover:bg-muted/50 transition-colors group"
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-subtle border border-border">
                              <RelIcon size={18} className="text-primary" />
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-medium leading-6 text-foreground group-hover:text-primary transition-colors">
                                {doc.title}
                              </span>
                              <span className="block text-sm text-muted-foreground mt-0.5">
                                {doc.type} • {doc.size}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </div>
            <PageFooter />
          </div>
        </div>

        {!isChatExpanded && (
          <div className="shrink-0 px-4 sm:px-8 pb-4 pt-2">
            <div className="max-w-[900px] mx-auto w-full relative pointer-events-none">
              {isChatOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-0 flex flex-col h-[420px] overflow-hidden rounded-t-[20px] border border-b-0 border-border bg-card shadow-xl pointer-events-auto">
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
                    className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 min-h-0"
                  >
                    {messages.length === 0 ? renderEmptyChat() : renderChatMessages()}
                  </div>
                </div>
              )}

              {!isChatOpen && messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="absolute bottom-full left-2 mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-muted transition-colors pointer-events-auto"
                >
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Resume chat ({messages.length})
                </button>
              )}

              <div className="pointer-events-auto">
                <DocumentChatComposer
                  chatQuery={chatQuery}
                  isTyping={isTyping}
                  isChatOpen={isChatOpen}
                  isConnectedToPanel={isChatOpen}
                  onChange={setChatQuery}
                  onFocus={() => setIsChatOpen(true)}
                  onSubmit={handleSendMessage}
                />
              </div>
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
          <div className="shrink-0 border-t border-border bg-card">
            <DocumentChatComposer
              chatQuery={chatQuery}
              isTyping={isTyping}
              isChatOpen
              isExpandedLayout
              isConnectedToPanel
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
