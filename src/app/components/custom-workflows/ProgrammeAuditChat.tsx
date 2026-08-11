import { Sparkles } from 'lucide-react';
import {
  PROGRAMME_STATUS_META,
  type ComplianceAreaDetail,
  type ProgrammeAudit,
} from '../../data/customWorkflowsMock';
import { cn } from '../ui/utils';

export type ProgrammeChatRole = 'user' | 'assistant';

export interface ProgrammeChatMessage {
  id: string;
  role: ProgrammeChatRole;
  content: string;
}

function statusPhrase(status: ComplianceAreaDetail['status']): string {
  if (status === 'action_needed') return 'action needed';
  if (status === 'attention') return 'attention';
  if (status === 'pending') return 'not assessed yet';
  return 'compliant';
}

function firstOpenCheck(area: ComplianceAreaDetail) {
  return (
    area.checks.find((check) => check.status === 'action_needed') ??
    area.checks.find((check) => check.status === 'attention') ??
    null
  );
}

export function buildProgrammeSuggestedPrompts(programme: ProgrammeAudit): string[] {
  const prompts: string[] = [];

  if (programme.status === 'scanning' && programme.scanProgress) {
    prompts.push(
      `What has the sweep found so far across the ${programme.scanProgress.assessed} assessed areas?`,
    );
    prompts.push('Which areas are still waiting to be assessed?');
  }

  const actionArea = programme.areas.find((area) => area.status === 'action_needed');
  const attentionArea = programme.areas.filter((area) => area.status === 'attention')[0];

  if (actionArea) {
    prompts.push(`Why is ${actionArea.shortLabel} action needed, and what should we fix first?`);
  }
  if (attentionArea) {
    prompts.push(`What is driving attention on ${attentionArea.shortLabel}?`);
  }
  if (programme.priorityAction) {
    prompts.push('What is the single most important action for leadership this week?');
  }

  prompts.push('Give me a short leadership brief for this programme');

  return [...new Set(prompts)].slice(0, 4);
}

export function buildProgrammeAssistantReply(
  programme: ProgrammeAudit,
  prompt: string,
): string {
  const statusLabel = PROGRAMME_STATUS_META[programme.status].label.toLowerCase();
  const actionAreas = programme.areas.filter((area) => area.status === 'action_needed');
  const attentionAreas = programme.areas.filter((area) => area.status === 'attention');
  const pendingAreas = programme.areas.filter((area) => area.status === 'pending');
  const greenAreas = programme.areas.filter((area) => area.status === 'compliant');
  const lower = prompt.toLowerCase();

  if (lower.includes('leadership') || lower.includes('summary') || lower.includes('brief')) {
    const scoreLine =
      programme.score === null
        ? `${programme.title} is still in its first sweep (${programme.scanProgress?.assessed ?? 0} of ${programme.scanProgress?.total ?? 9} areas assessed).`
        : `${programme.title} sits at ${programme.score} out of 100 and is rated ${statusLabel}.`;

    return [
      scoreLine,
      programme.summary,
      programme.priorityAction
        ? `Do this first: ${programme.priorityAction.title}\n${programme.priorityAction.description}`
        : actionAreas.length > 0
          ? `Priority focus: clear ${actionAreas.map((a) => a.shortLabel).join(', ')} before the next checkpoint.`
          : attentionAreas.length > 0
            ? `No red blockers. Keep an eye on amber areas: ${attentionAreas.map((a) => a.shortLabel).join(', ')}.`
            : 'No red or amber blockers right now.',
      greenAreas.length > 0
        ? `Already clear: ${greenAreas.map((a) => a.shortLabel).join(', ')}.`
        : null,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (lower.includes('waiting') || lower.includes('not assessed') || lower.includes('still')) {
    if (pendingAreas.length === 0) {
      return 'All nine compliance areas have been assessed. Focus on red and amber items next.';
    }
    return [
      `Still waiting on ${pendingAreas.length} area${pendingAreas.length === 1 ? '' : 's'}: ${pendingAreas
        .map((area) => area.shortLabel)
        .join(', ')}.`,
      'Assessed ratings stay visible while the sweep continues. Empty cells mean not assessed yet — not a severity.',
    ].join('\n\n');
  }

  if (lower.includes('sweep') || lower.includes('so far') || (programme.status === 'scanning' && !lower.includes('approvals'))) {
    const assessed = programme.areas.filter((area) => area.status !== 'pending');
    const lines = assessed.map(
      (area) =>
        `• ${area.shortLabel}: ${statusPhrase(area.status)} (${area.clearCount} of ${area.totalCount} clear)`,
    );
    return [
      `Sweep progress: ${programme.scanProgress?.assessed ?? assessed.length} of ${programme.scanProgress?.total ?? 9} areas assessed.`,
      lines.length > 0 ? lines.join('\n') : 'No areas assessed yet.',
      pendingAreas.length > 0
        ? `Still to come: ${pendingAreas.map((a) => a.shortLabel).join(', ')}.`
        : 'All areas are assessed.',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  const matchedArea = programme.areas.find(
    (area) =>
      lower.includes(area.shortLabel.toLowerCase()) ||
      lower.includes(area.fullLabel.toLowerCase()) ||
      lower.includes(area.area.toLowerCase()) ||
      (area.shortLabel === 'Safeguard' && lower.includes('safeguarding')),
  );

  if (matchedArea) {
    if (matchedArea.status === 'pending') {
      return `${matchedArea.fullLabel} has not been assessed yet. It will fill in once the sweep reaches this area.`;
    }

    const openCheck = firstOpenCheck(matchedArea);
    const lines = [
      `${matchedArea.fullLabel} is currently ${statusPhrase(matchedArea.status)} — ${matchedArea.clearCount} of ${matchedArea.totalCount} checks clear.`,
      matchedArea.summary,
    ];

    if (openCheck) {
      lines.push(
        `What to fix first: ${openCheck.title}.`,
        openCheck.fix.kind === 'required'
          ? openCheck.fix.description
          : openCheck.problem,
      );
    } else {
      lines.push('No open checks in this area — evidence looks complete.');
    }

    return lines.join('\n\n');
  }

  if (
    programme.priorityAction &&
    (lower.includes('priority') ||
      lower.includes('fix first') ||
      lower.includes('do this') ||
      lower.includes('important action') ||
      lower.includes('this week'))
  ) {
    return [
      programme.priorityAction.title,
      programme.priorityAction.description,
      actionAreas.length > 0
        ? `That will help clear: ${actionAreas.map((a) => a.shortLabel).join(', ')}.`
        : null,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (actionAreas.length > 0) {
    const top = actionAreas[0];
    const openCheck = firstOpenCheck(top);
    return [
      `${programme.title} is ${statusLabel}${programme.score !== null ? ` at ${programme.score}%` : ''}.`,
      programme.summary,
      `Biggest blocker right now: ${top.shortLabel} (${top.clearCount} of ${top.totalCount} clear).`,
      openCheck
        ? `Start with “${openCheck.title}”. ${
            openCheck.fix.kind === 'required' ? openCheck.fix.description : openCheck.problem
          }`
        : programme.priorityAction
          ? `Do this first: ${programme.priorityAction.title}`
          : null,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    `${programme.title} is ${statusLabel}${programme.score !== null ? ` at ${programme.score}%` : ''}.`,
    programme.summary,
    attentionAreas.length > 0
      ? `Amber watchlist: ${attentionAreas.map((a) => a.shortLabel).join(', ')}.`
      : pendingAreas.length > 0
        ? `${pendingAreas.length} areas still show as not assessed.`
        : 'No critical gaps flagged right now. Keep the evidence pack current for the next review.',
  ].join('\n\n');
}

interface ProgrammeAuditChatFeedProps {
  messages: ProgrammeChatMessage[];
  isQuerying: boolean;
  suggestedPrompts?: string[];
  onPrompt?: (prompt: string) => void;
}

export function ProgrammeAuditTryAsking({
  prompts,
  onPrompt,
  disabled = false,
}: {
  prompts: string[];
  onPrompt: (prompt: string) => void;
  disabled?: boolean;
}) {
  if (prompts.length === 0) return null;

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
        <span
          className="inline-flex size-4 shrink-0 rounded-[5px] bg-gradient-to-br from-primary to-primary/70"
          aria-hidden
        />
        Try asking
      </div>
      <div className="flex flex-col items-start gap-1.5">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={disabled}
            onClick={() => onPrompt(prompt)}
            className={cn(
              'max-w-full rounded-full border border-border bg-card px-3.5 py-2 text-left text-[12px] font-medium leading-snug text-foreground transition-colors',
              'hover:border-primary/40 hover:bg-primary-subtle/50 hover:text-primary',
              'disabled:pointer-events-none disabled:opacity-50',
            )}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProgrammeAuditChatFeed({
  messages,
  isQuerying,
  suggestedPrompts = [],
  onPrompt,
}: ProgrammeAuditChatFeedProps) {
  const showSuggestions =
    messages.length === 0 && !isQuerying && suggestedPrompts.length > 0 && Boolean(onPrompt);

  return (
    <div className="space-y-4">
      {showSuggestions ? (
        <ProgrammeAuditTryAsking
          prompts={suggestedPrompts}
          onPrompt={onPrompt!}
          disabled={isQuerying}
        />
      ) : null}

      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex flex-col gap-1.5',
            message.role === 'user' ? 'items-end' : 'items-start',
          )}
        >
          {message.role === 'assistant' && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
              <Sparkles size={12} className="text-primary" />
              Audit assistant
            </div>
          )}
          <div
            className={cn(
              'max-w-[92%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
              message.role === 'user'
                ? 'rounded-br-md bg-primary text-primary-foreground'
                : 'rounded-bl-md border border-border bg-muted/40 text-foreground',
            )}
          >
            {message.content}
          </div>
        </div>
      ))}

      {isQuerying && (
        <div className="flex flex-col gap-1.5 items-start">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <Sparkles size={12} className="text-primary" />
            Audit assistant
          </div>
          <div className="rounded-2xl rounded-bl-md border border-border bg-muted/40 px-3.5 py-3 text-[13px] text-muted-foreground">
            Checking the audit…
          </div>
        </div>
      )}
    </div>
  );
}
