import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Eye, Pencil, Sparkles } from 'lucide-react';
import type { ManagedReport, ReportSection } from '../../data/reportsAdminMock';
import { KPI_ICON_MAP } from '../../data/reportsAdminMock';
import {
  resolveKpiPreviewDisplay,
  resolveSectionPreviewDisplay,
} from '../../data/reportsAdminMock';
import { getReportThemeTokens, type ReportThemeTokens } from '../../data/reportThemeTokens';
import { ChartSkeletonGraphic } from '../manage-reports/reportSkeletonGraphics';
import { ChartFilledGraphic } from '../manage-reports/reportFilledGraphics';
import { PageBreadcrumb } from '../ui/page-breadcrumb';
import { filterTriggerClass } from '../ui/interaction';
import { cn } from '../ui/utils';
import {
  AID_FLOW_CHAT_PROMPT_THEME,
  AID_FLOW_EXTENDED_KNOWLEDGE_THEME,
  AID_FLOW_FILTER_THEME,
  MIGRATION_CHAT_PROMPT_THEME,
  MIGRATION_EXTENDED_KNOWLEDGE_THEME,
  MIGRATION_FILTER_THEME,
  ReportChatHeaderCollapse,
  ReportChatLayout,
  ReportChatPromptInput,
  ReportChatScrollSync,
  ReportChipButton,
  ReportExtendedKnowledgeToggle,
  ReportFilterBar,
  ReportPageShell,
  SJF_CHAT_PROMPT_THEME,
  SJF_EXTENDED_KNOWLEDGE_THEME,
  SJF_FILTER_THEME,
  reportChatLayoutShellClassName,
  reportHeaderClassName,
  reportHeaderPaddingClassName,
  reportMainPaddingClassName,
  reportMobileHeaderClassName,
  reportTitleFilterRowClassName,
  type ReportChatLayoutHandle,
} from '../../features/insights/shared';

interface ManagedReportViewProps {
  report: ManagedReport;
  onBack: () => void;
  isPreviewMode?: boolean;
  onEdit?: () => void;
}

type ChatMessage =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string };

const PERIOD_OPTIONS = ['All periods', 'Last 12 months', '2024 – 2026', '2023 – 2026'] as const;
const SCOPE_OPTIONS = ['All sources', 'Primary resource', 'Linked knowledge'] as const;

function chromeForTheme(themeId: string) {
  if (themeId === 'migration') {
    return {
      filter: MIGRATION_FILTER_THEME,
      chatPrompt: MIGRATION_CHAT_PROMPT_THEME,
      extended: MIGRATION_EXTENDED_KNOWLEDGE_THEME,
      filterIdle: 'border-[#ece6df] bg-white text-[#1a1410]',
      filterActive: 'border-[#c2562a] bg-[#fbeee5] text-[#a3461f]',
    };
  }
  if (themeId === 'sjf') {
    return {
      filter: SJF_FILTER_THEME,
      chatPrompt: SJF_CHAT_PROMPT_THEME,
      extended: SJF_EXTENDED_KNOWLEDGE_THEME,
      filterIdle: 'border-[#e2e6ee] bg-white text-[#0b1a2c]',
      filterActive: 'border-[#00689D] bg-[#e8f3f8] text-[#00689D]',
    };
  }
  return {
    filter: AID_FLOW_FILTER_THEME,
    chatPrompt: AID_FLOW_CHAT_PROMPT_THEME,
    extended: AID_FLOW_EXTENDED_KNOWLEDGE_THEME,
    filterIdle: 'border-[#e6e9ef] bg-white text-[#0d1b2a]',
    filterActive: 'border-[#1f6feb] bg-[#eaf1fe] text-[#1550b3]',
  };
}

function buildSuggestionChips(report: ManagedReport): string[] {
  const fromKpis = report.kpiTiles
    .map((t) => t.prompt.trim())
    .filter(Boolean)
    .slice(0, 3);
  const fromSections = [...report.sections]
    .sort((a, b) => a.order - b.order)
    .map((s) => s.prompt.trim())
    .filter(Boolean)
    .slice(0, 3);
  const chips = [...fromKpis, ...fromSections];
  if (chips.length > 0) return chips.slice(0, 6);
  return [
    `Summarise ${report.title}`,
    'What are the key drivers?',
    'Where are the biggest gaps?',
  ];
}

function answerForPrompt(report: ManagedReport, query: string): string {
  const q = query.toLowerCase();
  const matchingSection = [...report.sections]
    .sort((a, b) => a.order - b.order)
    .find(
      (s) =>
        s.prompt.toLowerCase().includes(q.slice(0, 24)) ||
        s.title.toLowerCase().includes(q.slice(0, 24)) ||
        (s.body && q.split(/\s+/).some((w) => w.length > 4 && s.body!.toLowerCase().includes(w))),
    );
  if (matchingSection?.body?.trim()) {
    return matchingSection.body.trim();
  }
  const matchingKpi = report.kpiTiles.find(
    (t) =>
      t.prompt.toLowerCase().includes(q.slice(0, 24)) ||
      (t.label && t.label.toLowerCase().includes(q.slice(0, 24))),
  );
  if (matchingKpi?.value) {
    return `${matchingKpi.label ?? 'Metric'}: ${matchingKpi.value}${
      matchingKpi.sub ? ` — ${matchingKpi.sub}` : ''
    }.`;
  }
  if (report.description.trim()) {
    return `${report.description.trim()} Ask about a specific section or KPI for a tighter read.`;
  }
  return `I can walk through “${report.title}” using the sections and metrics on this report. Try one of the suggested prompts.`;
}

function PreviewFlag({
  label,
  tone,
}: {
  label: string;
  tone: 'warning' | 'muted';
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        tone === 'warning'
          ? 'bg-warning-subtle text-warning-text'
          : 'bg-muted text-muted-foreground',
      )}
    >
      {label}
    </span>
  );
}

function ManagedSectionBlock({
  section,
  index,
  total,
  theme,
  onAsk,
  isPreviewMode = false,
}: {
  section: ReportSection;
  index: number;
  total: number;
  theme: ReportThemeTokens;
  onAsk: (prompt: string) => void;
  isPreviewMode?: boolean;
}) {
  const sectionNum = String(index + 1).padStart(2, '0');
  const totalNum = String(total).padStart(2, '0');
  const preview = isPreviewMode ? resolveSectionPreviewDisplay(section) : null;
  const isGenerated = isPreviewMode
    ? Boolean(
        preview?.body?.trim() ||
          preview?.stat?.trim() ||
          preview?.chartData?.length ||
          section.chartData?.length,
      )
    : Boolean(section.body?.trim()) ||
      Boolean(section.stat?.trim()) ||
      Boolean(section.chartData?.length);
  const narrativeBody = isPreviewMode
    ? preview?.body
    : section.body?.trim() || (!isGenerated ? section.prompt?.trim() : undefined);
  const narrativeStat = isPreviewMode ? preview?.stat : section.stat;
  const narrativeStatLabel = isPreviewMode ? preview?.statLabel : section.statLabel;
  const narrativeBullets = isPreviewMode ? preview?.bullets : section.bullets;
  const chartCaption = isPreviewMode ? preview?.chartCaption ?? section.chartCaption : section.chartCaption;
  const chartTitle = isPreviewMode ? preview?.chartTitle ?? section.chartTitle : section.chartTitle;
  const chartData =
    isPreviewMode && preview?.chartData?.length
      ? preview.chartData
      : section.chartData;
  const showChart = Boolean(chartData?.length);

  if (section.layout === 'tile_grid') {
    const tiles = section.tiles ?? [];
    const tilesGenerated = tiles.some((t) => Boolean(t.value?.trim()));
    return (
      <section
        className="mt-8 rounded-[18px] p-6 text-white"
        style={{
          background: `linear-gradient(135deg, ${theme.forwardLookBg} 0%, ${theme.forwardLookBorder} 100%)`,
        }}
      >
        <h2 className="report-display-title text-[20px] font-semibold">{section.title}</h2>
        {tilesGenerated ? (
          <p className="mb-5 mt-1 text-[13px] opacity-80">
            Predictive insights from attached sources.
          </p>
        ) : null}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {tiles.map((tile, tileIndex) => {
            const Icon = KPI_ICON_MAP[tile.iconKey];
            const accent = theme.kpiAccents[tileIndex % 6];
            const generated = Boolean(tile.value?.trim());
            return (
              <div
                key={tile.id}
                className="rounded-[14px] border border-white/10 p-4"
                style={{ backgroundColor: theme.forwardLookTileBg }}
              >
                <div className="mb-3 inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-white/15">
                  <Icon size={17} style={{ color: accent }} />
                </div>
                {generated ? (
                  <>
                    <div className="text-[14px] font-semibold">{tile.label ?? 'Insight'}</div>
                    <div className="mt-2 text-[24px] font-semibold">{tile.value}</div>
                    {tile.sub ? (
                      <p className="mt-2 text-[12.5px] opacity-75">{tile.sub}</p>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm opacity-70">{tile.prompt.trim() || 'Insight pending'}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section
      className="grid grid-cols-1 gap-4 border-t border-dashed py-6 first:border-t-0 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-[26px] lg:py-[30px]"
      style={{ borderColor: theme.pageBorder }}
    >
      <div
        className="relative z-0 flex w-full min-w-0 flex-col rounded-[18px] border p-4 shadow-sm sm:p-6 lg:sticky lg:top-6 lg:min-h-[430px] lg:justify-center"
        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
      >
        <div
          className="text-[11.5px] font-semibold uppercase tracking-[0.05em]"
          style={{ color: theme.textMuted }}
        >
          {isGenerated && chartCaption
            ? chartCaption
            : `${sectionNum} / ${totalNum}`}
        </div>
        {isGenerated && chartTitle ? (
          <div
            className="mb-4 mt-1 text-base font-semibold sm:mb-5 sm:text-[18px]"
            style={{ color: theme.textPrimary }}
          >
            {chartTitle}
          </div>
        ) : (
          <div
            className="mb-4 mt-1 text-base font-semibold sm:mb-5 sm:text-[18px]"
            style={{ color: theme.textPrimary }}
          >
            {section.title}
          </div>
        )}
        {showChart ? (
          <ChartFilledGraphic
            chartType={section.chartType}
            data={chartData!}
            palette={theme.chartPalette}
            muted={theme.chartMuted}
            accent={theme.sectionStat}
          />
        ) : (
          <ChartSkeletonGraphic
            chartType={section.chartType}
            palette={theme.chartPalette}
            muted={theme.chartMuted}
          />
        )}
      </div>

      <div className="relative z-10 min-w-0">
        <div
          className="text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{ color: theme.sectionStep }}
        >
          {sectionNum} / {totalNum}
        </div>
        <h3
          className="mt-2 text-[20px] font-semibold leading-[1.12] lg:text-[22px]"
          style={{ color: theme.textPrimary }}
        >
          {section.title}
        </h3>
        {isPreviewMode && preview ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {preview.isSampleContent ? <PreviewFlag label="Sample content" tone="muted" /> : null}
            {preview.missingPrompt ? <PreviewFlag label="No prompt" tone="warning" /> : null}
            {preview.hasGenerationError ? (
              <PreviewFlag label="Generation error" tone="warning" />
            ) : null}
          </div>
        ) : null}
        {isGenerated ? (
          <>
            {narrativeStat ? (
              <div
                className="mt-2 block text-[28px] font-semibold leading-none sm:mt-3 sm:text-[36px] lg:text-[38px]"
                style={{ color: theme.sectionStat }}
              >
                {narrativeStat}
              </div>
            ) : null}
            {narrativeStatLabel ? (
              <p className="mt-1 text-[12.5px]" style={{ color: theme.textMuted }}>
                {narrativeStatLabel}
              </p>
            ) : null}
            {narrativeBody ? (
              <p className="mt-4 text-[14.5px]" style={{ color: theme.textSecondary }}>
                {narrativeBody}
              </p>
            ) : null}
            {narrativeBullets && narrativeBullets.length > 0 ? (
              <ul className="mt-2">
                {narrativeBullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-3 border-t py-2 text-[13.5px]"
                    style={{ borderColor: theme.pageBorder, color: theme.textSecondary }}
                  >
                    <span
                      className="mt-[7px] inline-block h-[8px] w-[8px] shrink-0 rounded-[2px]"
                      style={{ backgroundColor: theme.accent }}
                    />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : section.prompt.trim() ? (
          <p className="mt-4 text-[14.5px]" style={{ color: theme.textSecondary }}>
            {section.prompt}
          </p>
        ) : null}
        {section.prompt.trim() ? (
          <button
            type="button"
            onClick={() => onAsk(section.prompt.trim())}
            className="mt-4 inline-flex w-full max-w-full items-start gap-2 whitespace-normal rounded-lg border px-3 py-2 text-left text-[12px] font-semibold leading-snug sm:w-auto sm:text-[12.5px]"
            style={{
              borderColor: theme.accentBorder,
              backgroundColor: theme.accentSubtle,
              color: theme.accentDark,
            }}
          >
            <Sparkles size={13} className="mt-0.5 shrink-0" />
            Ask: &quot;{section.prompt.trim()}&quot;
          </button>
        ) : null}
      </div>
    </section>
  );
}

function ManagedChatFeed({
  messages,
  isQuerying,
  suggestions,
  accent,
  muted,
  onChipClick,
}: {
  messages: ChatMessage[];
  isQuerying: boolean;
  suggestions: string[];
  accent: string;
  muted: string;
  onChipClick: (prompt: string) => void;
}) {
  const hasUser = messages.some((m) => m.role === 'user');

  return (
    <div className="space-y-3.5">
      {!hasUser && !isQuerying ? (
        <div className="max-w-[92%]">
          <div
            className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold"
            style={{ color: muted }}
          >
            <span
              className="inline-flex h-4 w-4 shrink-0 rounded-[5px]"
              style={{ background: `linear-gradient(135deg, ${accent}, ${muted})` }}
            />
            Try asking
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((chip) => (
              <ReportChipButton
                key={chip}
                label={chip}
                onClick={() => onChipClick(chip)}
                className="border-border text-muted-foreground hover:border-primary hover:!text-primary"
              />
            ))}
          </div>
        </div>
      ) : null}

      {messages.map((msg, i) =>
        msg.role === 'user' ? (
          <div key={`msg-${i}`} className="ml-auto max-w-[92%] self-end">
            <div
              className="rounded-[13px_13px_4px_13px] px-3 py-2.5 text-[12.5px] font-medium"
              style={{ backgroundColor: `${accent}18`, color: accent }}
            >
              {msg.text}
            </div>
          </div>
        ) : (
          <div key={`msg-${i}`} className="max-w-[92%]">
            <div
              className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold"
              style={{ color: muted }}
            >
              <span
                className="inline-flex h-4 w-4 shrink-0 rounded-[5px]"
                style={{ background: `linear-gradient(135deg, ${accent}, ${muted})` }}
              />
              Report assistant
            </div>
            <div className="rounded-[4px_13px_13px_13px] border border-border bg-card px-3 py-2.5 text-[12.5px] text-foreground">
              {msg.text}
            </div>
          </div>
        ),
      )}

      {isQuerying ? (
        <div className="max-w-[92%]">
          <div
            className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold"
            style={{ color: muted }}
          >
            Report assistant · analysing
          </div>
          <div className="flex items-center gap-2 rounded-[4px_13px_13px_13px] border border-border bg-muted/40 px-3 py-3.5 text-[12.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="report-thinking-dot h-[7px] w-[7px] rounded-full"
                  style={{ backgroundColor: accent, animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </span>
            Reading report sections…
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Read-only hub view for custom published managed reports. */
export function ManagedReportView({
  report,
  onBack,
  isPreviewMode = false,
  onEdit,
}: ManagedReportViewProps) {
  const theme = getReportThemeTokens(report.themeId);
  const chrome = chromeForTheme(theme.id);
  const sections = useMemo(
    () => [...report.sections].sort((a, b) => a.order - b.order),
    [report.sections],
  );
  const suggestions = useMemo(() => buildSuggestionChips(report), [report]);

  const [period, setPeriod] = useState<(typeof PERIOD_OPTIONS)[number]>('All periods');
  const [scope, setScope] = useState<(typeof SCOPE_OPTIONS)[number]>('All sources');
  const [openMenu, setOpenMenu] = useState<'period' | 'scope' | null>(null);
  const [promptInput, setPromptInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [extendedKnowledge, setExtendedKnowledge] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const chatLayoutRef = useRef<ReportChatLayoutHandle>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const queryTimeoutRef = useRef<number | null>(null);

  const hasAppliedFilters = period !== 'All periods' || scope !== 'All sources';
  const chatLabel = `Ask ${report.title.split(/\s+/).slice(0, 2).join(' ') || 'Report'}`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!filterRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

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
      setMessages((prev) => [...prev, { role: 'assistant', text: answerForPrompt(report, q) }]);
      setIsQuerying(false);
      queryTimeoutRef.current = null;
    }, 900);
  };

  const clearAllFilters = () => {
    setPeriod('All periods');
    setScope('All sources');
    setOpenMenu(null);
  };

  return (
    <div className="h-full min-h-0 w-full" style={{ backgroundColor: theme.pageBg }}>
    <ReportPageShell>
      <header
        className={cn(
          reportHeaderClassName,
          reportMobileHeaderClassName,
          'shrink-0 border-b',
          reportHeaderPaddingClassName,
        )}
        style={{
          backgroundColor: `${theme.pageBg}f2`,
          borderColor: theme.pageBorder,
        }}
      >
        <PageBreadcrumb
          className="mb-3 lg:mb-4"
          items={[
            { label: 'Reports', onClick: onBack },
            { label: report.title },
          ]}
        />
        <div className={reportTitleFilterRowClassName}>
          <div className="lg:min-w-0 lg:flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1
                className="report-display-title truncate text-[22px] leading-[1.05] font-semibold sm:text-[30px]"
                style={{ color: theme.textPrimary }}
              >
                {report.title}
              </h1>
              {isPreviewMode ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning-subtle px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-warning-text">
                  <Eye size={12} />
                  Preview
                </span>
              ) : null}
            </div>
            {report.description ? (
              <p
                className="mt-1 hidden max-w-[580px] text-[13.5px] lg:block"
                style={{ color: theme.textMuted }}
              >
                {report.description}
              </p>
            ) : null}
          </div>
          <ReportFilterBar
            filterRef={filterRef}
            mode="explore"
            theme={chrome.filter}
            hasAppliedFilters={hasAppliedFilters}
            onClearAll={clearAllFilters}
            trailingAction={
              isPreviewMode && onEdit ? (
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-[12.5px] font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Pencil size={14} className="shrink-0" />
                  Edit
                </button>
              ) : null
            }
          >
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu((m) => (m === 'period' ? null : 'period'))}
                className={filterTriggerClass(
                  openMenu === 'period' || period !== 'All periods',
                  chrome.filterIdle,
                  chrome.filterActive,
                )}
              >
                {period}
                <ChevronDown size={13} />
              </button>
              {openMenu === 'period' ? (
                <div
                  className="absolute right-0 z-40 mt-1 min-w-[180px] rounded-xl border bg-card py-1 shadow-lg"
                  style={{ borderColor: theme.cardBorder }}
                >
                  {PERIOD_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setPeriod(opt);
                        setOpenMenu(null);
                      }}
                      className={cn(
                        'block w-full px-3 py-2 text-left text-[13px] hover:bg-muted',
                        period === opt && 'font-semibold',
                      )}
                      style={{ color: theme.textPrimary }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu((m) => (m === 'scope' ? null : 'scope'))}
                className={filterTriggerClass(
                  openMenu === 'scope' || scope !== 'All sources',
                  chrome.filterIdle,
                  chrome.filterActive,
                )}
              >
                {scope}
                <ChevronDown size={13} />
              </button>
              {openMenu === 'scope' ? (
                <div
                  className="absolute right-0 z-40 mt-1 min-w-[180px] rounded-xl border bg-card py-1 shadow-lg"
                  style={{ borderColor: theme.cardBorder }}
                >
                  {SCOPE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setScope(opt);
                        setOpenMenu(null);
                      }}
                      className={cn(
                        'block w-full px-3 py-2 text-left text-[13px] hover:bg-muted',
                        scope === opt && 'font-semibold',
                      )}
                      style={{ color: theme.textPrimary }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </ReportFilterBar>
        </div>
        {isPreviewMode ? (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-warning-subtle px-3 py-2.5 text-[12.5px] text-warning-text">
            <Eye size={14} className="mt-0.5 shrink-0" />
            <span>
              Preview mode — sections without prompts and generation errors are flagged below.
              End users never see them.
            </span>
          </div>
        ) : null}
      </header>

      <ReportChatLayout
        ref={chatLayoutRef}
        className={reportChatLayoutShellClassName}
        mainClassName={reportMainPaddingClassName}
        chatLabel={chatLabel}
        messageCount={messages.length}
        sidebarClassName="border-l bg-white"
        chatHeader={
          <div
            className="shrink-0 border-b bg-white px-4 py-3"
            style={{ borderColor: theme.pageBorder }}
          >
            <ReportChatScrollSync
              scrollRef={chatScrollRef}
              deps={[messages, isQuerying]}
            />
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] font-medium text-muted-foreground">Assistant</span>
              <ReportChatHeaderCollapse />
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
                }}
              >
                <Sparkles size={14} />
              </span>
              <h3 className="text-[15px] font-semibold" style={{ color: theme.textPrimary }}>
                {chatLabel}
              </h3>
            </div>
            <ReportExtendedKnowledgeToggle
              enabled={extendedKnowledge}
              onToggle={() => setExtendedKnowledge((v) => !v)}
              theme={chrome.extended}
            />
          </div>
        }
        chatFeed={
          <div
            ref={chatScrollRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white p-4"
          >
            <ManagedChatFeed
              messages={messages}
              isQuerying={isQuerying}
              suggestions={suggestions}
              accent={theme.accent}
              muted={theme.textMuted}
              onChipClick={runPrompt}
            />
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
            placeholder={`Ask anything about ${report.title.toLowerCase()}...`}
            theme={chrome.chatPrompt}
          />
        }
      >
        <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          {report.kpiTiles.map((tile, index) => {
            const Icon = KPI_ICON_MAP[tile.iconKey];
            const accent = theme.kpiAccents[index] ?? theme.accent;
            const iconBg = theme.kpiIconBgs[index] ?? theme.accentSubtle;
            const iconColor = theme.kpiIconColors[index] ?? theme.accent;
            const kpiDisplay = isPreviewMode
              ? resolveKpiPreviewDisplay(tile, index)
              : null;
            const isGenerated = isPreviewMode
              ? Boolean(kpiDisplay?.value?.trim() || kpiDisplay?.promptDraft)
              : Boolean(tile.value?.trim());

            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => {
                  if (tile.prompt.trim()) runPrompt(tile.prompt.trim());
                }}
                className="relative rounded-[14px] border px-[18px] pb-[16px] pt-[14px] text-left transition hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.cardBorder,
                }}
              >
                <div
                  className="mb-3 inline-flex h-[30px] w-[30px] items-center justify-center rounded-[9px]"
                  style={{ backgroundColor: iconBg }}
                >
                  <Icon size={14} style={{ color: iconColor }} />
                </div>
                {isPreviewMode && kpiDisplay ? (
                  <>
                    {kpiDisplay.isSampleContent || kpiDisplay.missingPrompt ? (
                      <div className="mb-2 flex flex-wrap gap-1">
                        {kpiDisplay.isSampleContent ? (
                          <PreviewFlag label="Sample" tone="muted" />
                        ) : null}
                        {kpiDisplay.missingPrompt ? (
                          <PreviewFlag label="No prompt" tone="warning" />
                        ) : null}
                      </div>
                    ) : null}
                    {kpiDisplay.value ? (
                      <>
                        <div
                          className="mb-1 text-[10.5px] uppercase tracking-[0.04em]"
                          style={{ color: theme.textMuted }}
                        >
                          {kpiDisplay.label ?? 'Metric'}
                        </div>
                        <div
                          className="text-[23px] font-semibold"
                          style={{ color: theme.textPrimary }}
                        >
                          {kpiDisplay.value}
                        </div>
                        {kpiDisplay.sub ? (
                          <div className="mt-1 text-[11px]" style={{ color: theme.textMuted }}>
                            {kpiDisplay.sub}
                          </div>
                        ) : null}
                      </>
                    ) : kpiDisplay.promptDraft ? (
                      <p className="text-sm leading-snug" style={{ color: theme.textSecondary }}>
                        {kpiDisplay.promptDraft}
                      </p>
                    ) : null}
                  </>
                ) : isGenerated ? (
                  <>
                    <div
                      className="mb-1 text-[10.5px] uppercase tracking-[0.04em]"
                      style={{ color: theme.textMuted }}
                    >
                      {tile.label ?? 'Metric'}
                    </div>
                    <div
                      className="text-[23px] font-semibold"
                      style={{ color: theme.textPrimary }}
                    >
                      {tile.value}
                    </div>
                    {tile.sub ? (
                      <div className="mt-1 text-[11px]" style={{ color: theme.textMuted }}>
                        {tile.sub}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm leading-snug" style={{ color: theme.textSecondary }}>
                    {tile.prompt.trim() || 'KPI insight'}
                  </p>
                )}
                <span
                  className="absolute right-[12px] top-[12px] h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: accent }}
                />
              </button>
            );
          })}
        </section>

        <section>
          {sections
            .filter((s) => s.layout !== 'tile_grid')
            .map((section, index, list) => (
              <ManagedSectionBlock
                key={section.id}
                section={section}
                index={index}
                total={list.length}
                theme={theme}
                onAsk={runPrompt}
                isPreviewMode={isPreviewMode}
              />
            ))}
        </section>

        {sections
          .filter((s) => s.layout === 'tile_grid')
          .map((section) => (
            <ManagedSectionBlock
              key={section.id}
              section={section}
              index={0}
              total={1}
              theme={theme}
              onAsk={runPrompt}
              isPreviewMode={isPreviewMode}
            />
          ))}
      </ReportChatLayout>
    </ReportPageShell>
    </div>
  );
}
