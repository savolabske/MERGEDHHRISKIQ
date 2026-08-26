import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Clock, Sparkles } from 'lucide-react';
import {
  answerWorkflowAdviser,
  getWorkflowAdviserContext,
  type WorkflowAdviserMode,
} from '../../data/workflowAdviserMock';
import type { WorkflowWizardStep } from '../../data/workflowAdminMock';
import {
  AID_FLOW_CHAT_PROMPT_THEME,
  ReportChatHeaderCollapse,
  ReportChatLayout,
  ReportChatPromptInput,
  ReportChatScrollSync,
  ReportDetailShell,
  reportChatLayoutShellClassName,
  type ReportChatLayoutHandle,
} from '../../features/insights/shared';
import { cn } from '../ui/utils';

type ChatMessage =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string };

interface WorkflowAdviserLayoutProps {
  mode: WorkflowAdviserMode;
  workflowName?: string;
  step?: WorkflowWizardStep;
  children: ReactNode;
  /** Extra classes on the main scroll column (padding etc.). */
  mainClassName?: string;
}

export function WorkflowAdviserLayout({
  mode,
  workflowName,
  step,
  children,
  mainClassName,
}: WorkflowAdviserLayoutProps) {
  const context = getWorkflowAdviserContext(mode, { workflowName, step });
  const contextKey = `${mode}:${step ?? 0}:${workflowName?.trim() || ''}`;

  const [promptInput, setPromptInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: context.intro },
  ]);
  const [isQuerying, setIsQuerying] = useState(false);

  const chatLayoutRef = useRef<ReportChatLayoutHandle>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const queryTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setMessages([{ role: 'assistant', text: context.intro }]);
    setPromptInput('');
    setIsQuerying(false);
    if (queryTimeoutRef.current !== null) {
      window.clearTimeout(queryTimeoutRef.current);
      queryTimeoutRef.current = null;
    }
  }, [contextKey, context.intro]);

  useEffect(() => {
    return () => {
      if (queryTimeoutRef.current !== null) window.clearTimeout(queryTimeoutRef.current);
    };
  }, []);

  const runPrompt = (query?: string) => {
    const q = (query ?? promptInput).trim();
    if (!q || isQuerying) return;
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setPromptInput('');
    setIsQuerying(true);
    chatLayoutRef.current?.openChat();
    if (queryTimeoutRef.current !== null) window.clearTimeout(queryTimeoutRef.current);
    queryTimeoutRef.current = window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: answerWorkflowAdviser(q) },
      ]);
      setIsQuerying(false);
      queryTimeoutRef.current = null;
    }, 450);
  };

  const hasUser = messages.some((m) => m.role === 'user');
  const chips = context.chips;

  return (
    <ReportDetailShell>
      <ReportChatLayout
        ref={chatLayoutRef}
        className={cn(reportChatLayoutShellClassName, 'bg-background')}
        mainClassName={cn(
          'px-4 sm:px-8 pt-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-10',
          mainClassName,
        )}
        chatLabel="Copilot"
        dockHint={
          messages.length > 1
            ? `Open Workflow Copilot · ${messages.length} messages`
            : 'Ask Workflow Copilot'
        }
        sheetMinimizeLabel="Show workflow"
        messageCount={messages.length}
        sidebarWidthPx={360}
        sidebarClassName="border-l border-border bg-card"
        initialCollapsed
        chatHeader={
          <div className="shrink-0 space-y-3 border-b border-border px-4 py-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary text-white">
                  <Sparkles size={16} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-foreground">Workflow Copilot</p>
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Knows the page you&apos;re on
                  </p>
                </div>
              </div>
              <ReportChatHeaderCollapse />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-2.5 py-2 text-[11.5px] font-medium text-primary">
              <Clock size={14} strokeWidth={1.8} className="shrink-0" />
              <span className="min-w-0 truncate">{context.contextLabel}</span>
            </div>
          </div>
        }
        chatFeed={
          <div
            ref={chatScrollRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-card p-4"
          >
            <ReportChatScrollSync
              scrollRef={chatScrollRef}
              deps={[messages, isQuerying, contextKey]}
            />
            <div className="flex flex-col gap-3.5">
              {messages.map((msg, i) =>
                msg.role === 'user' ? (
                  <div
                    key={`msg-${i}`}
                    className="ml-auto max-w-[85%] rounded-[13px_13px_4px_13px] bg-primary px-3.5 py-2.5 text-[13.5px] leading-relaxed text-white"
                  >
                    {msg.text}
                  </div>
                ) : (
                  <div
                    key={`msg-${i}`}
                    className="max-w-full rounded-[4px_13px_13px_13px] bg-muted/70 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-foreground"
                  >
                    {msg.text}
                  </div>
                ),
              )}

              {!hasUser && !isQuerying ? (
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                    Try asking
                  </p>
                  <div className="flex flex-col gap-2">
                    {chips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => runPrompt(chip)}
                        className="w-full rounded-[11px] border border-border bg-background px-3.5 py-2.5 text-left text-[13px] font-medium leading-snug text-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {isQuerying ? (
                <div className="max-w-full rounded-[4px_13px_13px_13px] bg-muted/50 px-3.5 py-3 text-[13px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    Thinking
                    <span className="inline-flex items-center gap-1" aria-hidden>
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="report-thinking-dot h-[6px] w-[6px] rounded-full bg-primary"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </span>
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        }
        promptInput={
          <ReportChatPromptInput
            value={promptInput}
            onChange={setPromptInput}
            onSubmit={() => runPrompt()}
            onStop={() => {
              if (queryTimeoutRef.current !== null) {
                window.clearTimeout(queryTimeoutRef.current);
                queryTimeoutRef.current = null;
              }
              setIsQuerying(false);
            }}
            isGenerating={isQuerying}
            disabled={isQuerying}
            placeholder="Ask Workflow Copilot…"
            theme={AID_FLOW_CHAT_PROMPT_THEME}
          />
        }
      >
        {children}
      </ReportChatLayout>
    </ReportDetailShell>
  );
}
