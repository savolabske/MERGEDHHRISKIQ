import React from 'react';
import type { ReportQueryingMode } from '../../shared';
import { MIGRATION_CHIPS } from '../data/migrationData';
import type { MigrationChatMessage } from '../types';

interface MigrationChatFeedProps {
  messages: MigrationChatMessage[];
  isQuerying: boolean;
  queryingMode?: ReportQueryingMode;
  onChipClick: (prompt: string) => void;
}

function AnalystIcon() {
  return (
    <span className="inline-flex h-4 w-4 shrink-0 rounded-[5px] bg-gradient-to-br from-[#c2562a] to-[#d99a21]" />
  );
}

function ChipButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-[#ece6df] bg-white px-3 py-1.5 text-[11.5px] font-medium text-[#4a3f38] transition hover:border-[#c2562a] hover:text-[#c2562a]"
    >
      {label}
    </button>
  );
}

function MigrationThinkingIndicator({ queryingMode }: { queryingMode: ReportQueryingMode }) {
  const isChat = queryingMode === 'chat';

  return (
    <div className="max-w-[92%]">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#8a7d72]">
        <AnalystIcon />
        Displacement · {isChat ? 'looking up' : 'analysing'}
      </div>
      <div className="flex items-center gap-2 rounded-[4px_13px_13px_13px] border border-[#ece6df] bg-[#faf7f2] px-3 py-3.5 text-[12.5px] text-[#8a7d72]">
        <span className="inline-flex items-center gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="report-thinking-dot h-[7px] w-[7px] rounded-full bg-[#c2562a]"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </span>
        {isChat ? 'Looking that up…' : 'Reading DTM data, choosing charts…'}
      </div>
    </div>
  );
}

export function MigrationChatFeed({
  messages,
  isQuerying,
  queryingMode = 'dashboard',
  onChipClick,
}: MigrationChatFeedProps) {
  const hasUserMessages = messages.some((m) => m.role === 'user');

  return (
    <div className="space-y-3.5">
      {!hasUserMessages && !isQuerying && (
        <div className="max-w-[92%]">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#8a7d72]">
            <AnalystIcon />
            Try asking
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MIGRATION_CHIPS.map((chip) => (
              <ChipButton key={chip} label={chip} onClick={() => onChipClick(chip)} />
            ))}
          </div>
        </div>
      )}

      {messages.map((msg, i) => {
        if (msg.role === 'user') {
          return (
            <div key={`msg-${i}`} className="ml-auto max-w-[92%] self-end">
              <div className="rounded-[13px_13px_4px_13px] bg-[#fbeee5] px-3 py-2.5 text-[12.5px] font-medium text-[#a3461f]">
                {msg.text}
              </div>
            </div>
          );
        }

        if (msg.lane === 'chat') {
          return (
            <div key={`msg-${i}`} className="max-w-[92%]">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#8a7d72]">
                <AnalystIcon />
                Displacement · AI Analyst
              </div>
              <div className="rounded-[4px_13px_13px_13px] border border-[#ece6df] bg-[#faf7f2] px-3 py-3 text-[12.8px] leading-relaxed text-[#4a3f38]">
                {msg.body}
                {msg.chips?.length ? (
                  <>
                    <div className="mt-2.5 text-[11px] font-medium text-[#8a7d72]">
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
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#8a7d72]">
              <AnalystIcon />
              Displacement · AI Analyst
            </div>
            <div className="rounded-[4px_13px_13px_13px] border border-[#ece6df] bg-[#faf7f2] px-3 py-3 text-[12.8px] text-[#4a3f38]">
              <b className="text-[#1a1410]">{msg.title}.</b> View updated on the left.
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
        <MigrationThinkingIndicator queryingMode={queryingMode} />
      ) : null}
    </div>
  );
}
