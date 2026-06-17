import React from 'react';
import { ReportChipButton, type ReportQueryingMode } from '../../shared';
import { AI_CHIPS } from '../data/aidFlowData';
import type { AidFlowChatMessage } from '../types';

interface AidFlowChatFeedProps {
  messages: AidFlowChatMessage[];
  isQuerying: boolean;
  queryingMode?: ReportQueryingMode;
  extendedKnowledge: boolean;
  onChipClick: (prompt: string) => void;
}

function AnalystIcon() {
  return (
    <span className="inline-flex h-4 w-4 shrink-0 rounded-[5px] bg-gradient-to-br from-[#1f6feb] to-[#16a39a]" />
  );
}

const aidFlowChipClassName =
  'border-[#e6e9ef] text-[#3a4a5c] hover:border-[#1f6feb] hover:!text-[#1f6feb]';

function AidFlowThinkingIndicator({
  queryingMode,
  extendedKnowledge,
}: {
  queryingMode: ReportQueryingMode;
  extendedKnowledge: boolean;
}) {
  const isChat = queryingMode === 'chat';

  return (
    <div className="max-w-[92%]">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#6b7a8d]">
        <AnalystIcon />
        Aid Flow · {isChat ? 'looking up' : 'analysing'}
      </div>
      <div className="flex items-center gap-2 rounded-[4px_13px_13px_13px] border border-[#e6e9ef] bg-[#f8f9fb] px-3 py-3.5 text-[12.5px] text-[#6b7a8d]">
        <span className="inline-flex items-center gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="report-thinking-dot h-[7px] w-[7px] rounded-full bg-[#1f6feb]"
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

export function AidFlowChatFeed({
  messages,
  isQuerying,
  queryingMode = 'dashboard',
  extendedKnowledge,
  onChipClick,
}: AidFlowChatFeedProps) {
  const hasUserMessages = messages.some((m) => m.role === 'user');

  return (
    <div className="space-y-3.5">
      {!hasUserMessages && !isQuerying && (
        <div className="max-w-[92%]">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#6b7a8d]">
            <AnalystIcon />
            Try asking
          </div>
          <div className="flex flex-wrap gap-1.5">
            {AI_CHIPS.map((chip) => (
              <ReportChipButton
                key={chip}
                label={chip}
                onClick={() => onChipClick(chip)}
                className={aidFlowChipClassName}
              />
            ))}
          </div>
        </div>
      )}

      {messages.map((msg, i) => {
        if (msg.role === 'user') {
          return (
            <div key={`msg-${i}`} className="ml-auto max-w-[92%] self-end">
              <div className="rounded-[13px_13px_4px_13px] bg-[#eaf1fe] px-3 py-2.5 text-[12.5px] font-medium text-[#1550b3]">
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
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#6b7a8d]">
                <AnalystIcon />
                Aid Flow · system
              </div>
              <div
                className="rounded-[4px_13px_13px_13px] border border-[#e6e9ef] bg-[#f8f9fb] px-3 py-3 text-[12.8px] text-[#3a4a5c]"
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
            </div>
          );
        }

        if (msg.lane === 'chat') {
          return (
            <div key={`msg-${i}`} className="max-w-[92%]">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#6b7a8d]">
                <AnalystIcon />
                Aid Flow · AI Analyst
                {msg.extended && (
                  <span className="rounded-full bg-[#DDA63A] px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
                    EXT
                  </span>
                )}
              </div>
              <div className="rounded-[4px_13px_13px_13px] border border-[#e6e9ef] bg-[#f8f9fb] px-3 py-3 text-[12.8px] leading-relaxed text-[#3a4a5c]">
                {msg.body}
                {msg.chips?.length ? (
                  <>
                    <div className="mt-2.5 text-[11px] font-medium text-[#6b7a8d]">
                      Open a full view:
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {msg.chips.map((chip) => (
                        <ReportChipButton
                key={chip}
                label={chip}
                onClick={() => onChipClick(chip)}
                className={aidFlowChipClassName}
              />
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
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#6b7a8d]">
              <AnalystIcon />
              Aid Flow · AI Analyst
              {msg.extended && (
                <span className="rounded-full bg-[#DDA63A] px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
                  EXT
                </span>
              )}
            </div>
            <div className="rounded-[4px_13px_13px_13px] border border-[#e6e9ef] bg-[#f8f9fb] px-3 py-3 text-[12.8px] text-[#3a4a5c]">
              <b className="text-[#0d1b2a]">{msg.title}.</b> View updated on the left.
              {msg.chips?.length ? ' Drill further:' : ''}
              {msg.chips?.length ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.chips.map((chip) => (
                    <ReportChipButton
                key={chip}
                label={chip}
                onClick={() => onChipClick(chip)}
                className={aidFlowChipClassName}
              />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}

      {isQuerying && queryingMode ? (
        <AidFlowThinkingIndicator queryingMode={queryingMode} extendedKnowledge={extendedKnowledge} />
      ) : null}
    </div>
  );
}
