import React from 'react';
import type { ReportQueryingMode } from '../../shared';
import { AI_CHIPS } from '../data/sjfData';
import type { SjfChatMessage } from '../types';

interface SjfChatFeedProps {
  messages: SjfChatMessage[];
  isQuerying: boolean;
  queryingMode?: ReportQueryingMode;
  extendedKnowledge: boolean;
  onChipClick: (prompt: string) => void;
}

function AnalystIcon() {
  return (
    <span className="inline-flex h-4 w-4 shrink-0 rounded-[5px] bg-gradient-to-br from-[#00689D] to-[#19486A]" />
  );
}

function ChipButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-[#e2e6ee] bg-white px-3 py-1.5 text-[11.5px] font-medium text-[#324559] transition hover:border-[#00689D] hover:text-[#00689D]"
    >
      {label}
    </button>
  );
}

function SjfThinkingIndicator({
  queryingMode,
  extendedKnowledge,
}: {
  queryingMode: ReportQueryingMode;
  extendedKnowledge: boolean;
}) {
  const isChat = queryingMode === 'chat';

  return (
    <div className="max-w-[92%]">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#6f8094]">
        <AnalystIcon />
        SJF · {isChat ? 'looking up' : 'analysing'}
      </div>
      <div className="flex items-center gap-2 rounded-[4px_13px_13px_13px] border border-[#e2e6ee] bg-[#f8fafc] px-3 py-3.5 text-[12.5px] text-[#6f8094]">
        <span className="inline-flex items-center gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="report-thinking-dot h-[7px] w-[7px] rounded-full bg-[#00689D]"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </span>
        {isChat
          ? 'Looking that up…'
          : extendedKnowledge
            ? 'Reading data, cross-checking linked reports…'
            : 'Reading data, choosing charts…'}
      </div>
    </div>
  );
}

export function SjfChatFeed({
  messages,
  isQuerying,
  queryingMode = 'dashboard',
  extendedKnowledge,
  onChipClick,
}: SjfChatFeedProps) {
  const hasUserMessages = messages.some((m) => m.role === 'user');

  return (
    <div className="space-y-3.5">
      {!hasUserMessages && !isQuerying && (
        <div className="max-w-[92%]">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#6f8094]">
            <AnalystIcon />
            Try asking
          </div>
          <div className="flex flex-wrap gap-1.5">
            {AI_CHIPS.map((chip) => (
              <ChipButton key={chip} label={chip} onClick={() => onChipClick(chip)} />
            ))}
          </div>
        </div>
      )}

      {messages.map((msg, i) => {
        if (msg.role === 'user') {
          return (
            <div key={`msg-${i}`} className="ml-auto max-w-[92%] self-end">
              <div className="rounded-[13px_13px_4px_13px] bg-[#E5F3FB] px-3 py-2.5 text-[12.5px] font-medium text-[#19486A]">
                {msg.text}
                {msg.extended && (
                  <span className="ml-2 rounded-full bg-[#DDA63A] px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
                    EXT
                  </span>
                )}
              </div>
            </div>
          );
        }

        if (msg.role === 'system') {
          return (
            <div key={`msg-${i}`} className="max-w-[92%]">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#6f8094]">
                <AnalystIcon />
                SJF · system
              </div>
              <div
                className="rounded-[4px_13px_13px_13px] border border-[#e2e6ee] bg-[#f8fafc] px-3 py-3 text-[12.8px] text-[#324559]"
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
            </div>
          );
        }

        if (msg.lane === 'chat') {
          return (
            <div key={`msg-${i}`} className="max-w-[92%]">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#6f8094]">
                <AnalystIcon />
                SJF · AI Analyst
                {msg.extended && (
                  <span className="rounded-full bg-[#DDA63A] px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
                    EXT
                  </span>
                )}
              </div>
              <div className="rounded-[4px_13px_13px_13px] border border-[#e2e6ee] bg-[#f8fafc] px-3 py-3 text-[12.8px] leading-relaxed text-[#324559]">
                {msg.body}
                {msg.chips?.length ? (
                  <>
                    <div className="mt-2.5 text-[11px] font-medium text-[#6f8094]">
                      Open a full view:
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {msg.chips.map((chip) => (
                        <ChipButton key={chip} label={chip} onClick={() => onChipClick(chip)} />
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          );
        }

        return (
          <div key={`msg-${i}`} className="max-w-[92%]">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#6f8094]">
              <AnalystIcon />
              SJF · AI Analyst
              {msg.extended && (
                <span className="rounded-full bg-[#DDA63A] px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
                  EXT
                </span>
              )}
            </div>
            <div className="rounded-[4px_13px_13px_13px] border border-[#e2e6ee] bg-[#f8fafc] px-3 py-3 text-[12.8px] text-[#324559]">
              <b className="text-[#0b1a2c]">{msg.title}.</b> View updated on the left.
              {msg.chips?.length ? ' Drill further:' : ''}
              {msg.chips?.length ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.chips.map((chip) => (
                    <ChipButton key={chip} label={chip} onClick={() => onChipClick(chip)} />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}

      {isQuerying && queryingMode ? (
        <SjfThinkingIndicator queryingMode={queryingMode} extendedKnowledge={extendedKnowledge} />
      ) : null}
    </div>
  );
}
