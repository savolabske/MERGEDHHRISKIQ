import React, { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { COLORS, SJF_DATA } from '../data/sjfData';
import { fmtM } from '../hooks/useSjfFilters';
import { pbiAgg, pbiDonors, pbiYearTotals, scenarioTotals } from '../data/sjfPbiUtils';
import { cn } from '../../../../components/ui/utils';
import { DonorTrendChart, DonorYearBars } from './DonorTrendChart';
import { HBars } from './SjfCharts';
import { ProjectDonut } from './ProjectDonut';
import { ScenarioTable } from './ScenarioTable';

type PbiTab = 'totals' | 'scenarios' | 't2025' | 't2026';
type PbiYearFilter = 'all' | '2025' | '2026' | '2027';

function PbiSummary({
  donor,
  year,
}: {
  donor: string | null;
  year: PbiYearFilter;
}) {
  const donorLabel = donor ?? 'all donors';
  const yearLabel = year === 'all' ? '2025–2027 combined' : year;
  let total = 0;
  SJF_DATA.pbi.rows.forEach((r) => {
    if (donor && r[0] !== donor) return;
    if (year === '2025') total += r[2];
    else if (year === '2026') total += r[3];
    else if (year === '2027') total += r[4];
    else total += r[2] + r[3] + r[4];
  });
  const windows = pbiAgg(donor, year === 'all' ? null : year);
  const topWin = windows[0];

  if (total === 0) {
    return (
      <div className="mb-4 rounded-xl border border-[#B8D9EE] bg-gradient-to-br from-[#E5F3FB] to-[#ecf2f8] p-3.5 text-[13px] leading-relaxed text-[#324559]">
        <div className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-[#00689D]">
          Plain summary
        </div>
        Showing <b>{donorLabel}</b> for <b>{yearLabel}</b>. No commitments recorded for this selection.
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-xl border border-[#B8D9EE] bg-gradient-to-br from-[#E5F3FB] to-[#ecf2f8] p-3.5 text-[13px] leading-relaxed text-[#324559]">
      <div className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-[#00689D]">
        Plain summary
      </div>
      Showing <b>{donorLabel}</b> for <b>{yearLabel}</b>. Total commitment: <b>{fmtM(total)}</b>
      {topWin ? (
        <>
          {' '}
          — largest window is <b>
            {topWin[0]} ({fmtM(topWin[1])})
          </b>
        </>
      ) : null}
      .
      {donor === 'Balance C/F'
        ? ' Balance C/F is funds carried forward from prior years, already inside the fund.'
        : donor
          ? ` ${donor} is a new commitment from this donor for the selected period.`
          : null}
    </div>
  );
}

function TotalCards({ donor }: { donor: string | null }) {
  const { y25, y26, y27 } = pbiYearTotals(donor);
  const totAll = y25 + y26 + y27;
  const label = donor ?? 'all donors';

  return (
    <div className="mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      {[
        { lbl: '2025 Total', val: y25, sub: label },
        { lbl: '2026 Total', val: y26, sub: label },
        { lbl: '2027 Total', val: y27, sub: label },
        { lbl: '3-Year Total', val: totAll, sub: '2025+2026+2027', gold: true },
      ].map((c) => (
        <div
          key={c.lbl}
          className={cn(
            'rounded-xl border p-3.5',
            c.gold
              ? 'border-[#F3C742] bg-gradient-to-br from-white to-[#fdf3e0]'
              : 'border-[#C5E0F1] bg-gradient-to-br from-white to-[#F5FAFD]',
          )}
        >
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-[#6f8094]">
            {c.lbl}
          </div>
          <div
            className="mt-0.5 text-[24px] font-semibold tracking-tight"
            style={{ color: c.gold ? COLORS.gold : COLORS.brand }}
          >
            {fmtM(c.val)}
          </div>
          <div className="mt-0.5 text-[11px] text-[#6f8094]">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

function TotalsTab({
  donor,
  setDonor,
  year,
  setYear,
}: {
  donor: string | null;
  setDonor: (d: string | null) => void;
  year: PbiYearFilter;
  setYear: (y: PbiYearFilter) => void;
}) {
  const donors = pbiDonors();
  const winRows = pbiAgg(donor, year === 'all' ? null : year);
  const winTotal = winRows.reduce((s, w) => s + w[1], 0);

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-4 rounded-xl border border-[#e2e6ee] bg-gradient-to-b from-[#fafbfd] to-[#f4f6fa] p-3.5">
        <div className="min-w-[140px] flex-1">
          <div className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[#6f8094]">
            Filter by donor
          </div>
          <div className="flex flex-wrap gap-1">
            <Pill active={donor === null} onClick={() => setDonor(null)}>
              All donors
            </Pill>
            {donors.map((d) => (
              <Pill key={d} active={donor === d} onClick={() => setDonor(d)}>
                {d}
              </Pill>
            ))}
          </div>
        </div>
        <div className="min-w-[200px]">
          <div className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[#6f8094]">
            Filter by year
          </div>
          <div className="flex flex-wrap gap-1">
            {(
              [
                ['all', 'All years'],
                ['2025', '2025'],
                ['2026', '2026'],
                ['2027', '2027'],
              ] as const
            ).map(([k, lbl]) => (
              <Pill key={k} active={year === k} onClick={() => setYear(k)}>
                {lbl}
              </Pill>
            ))}
          </div>
        </div>
      </div>
      <PbiSummary donor={donor} year={year} />
      <TotalCards donor={donor} />
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <div className="rounded-xl border border-[#e2e6ee] bg-[#f4f6fa] p-4">
          <h4 className="text-[13.5px] font-semibold text-[#0b1a2c]">
            Contributions by donor {year !== 'all' ? `(${year})` : '(2025–2027)'}
          </h4>
          <p className="mb-4 text-[11.5px] leading-relaxed text-[#6f8094]">
            {year === 'all'
              ? 'New commitments per year, plus Balance C/F highlighted in gold'
              : 'New donor commitments alongside Balance C/F (carried forward)'}
          </p>
          <div className="rounded-lg border border-[#e2e6ee]/80 bg-white p-3 sm:p-4">
            {year === 'all' ? (
              <DonorTrendChart />
            ) : (
              <DonorYearBars year={year} />
            )}
          </div>
        </div>
        <div className="rounded-xl border border-[#e2e6ee] bg-[#f4f6fa] p-4">
          <h4 className="text-[13.5px] font-semibold text-[#0b1a2c]">
            Contributions breakdown by window
          </h4>
          <p className="mb-3 text-[11.5px] text-[#6f8094]">
            {donor ? `${donor} — ` : ''}
            {year === 'all' ? 'all years' : year}
          </p>
          {winRows.length ? (
            <table className="w-full border-collapse text-[13px] leading-[18px]">
              <thead>
                <tr>
                  <th className="border-b border-[#e2e6ee] bg-white px-2.5 py-2 text-left text-[12px] leading-4 font-semibold text-[#6f8094]">
                    Window
                  </th>
                  <th className="border-b border-[#e2e6ee] bg-white px-2.5 py-2 text-right text-[12px] leading-4 font-semibold text-[#6f8094]">
                    {year === 'all' ? '2025–27' : year}
                  </th>
                  <th className="border-b border-[#e2e6ee] bg-white px-2.5 py-2 text-right text-[12px] leading-4 font-semibold text-[#6f8094]">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {winRows.map(([w, v]) => (
                  <tr key={w} className="transition-colors hover:bg-[#f8fafc]">
                    <td className="border-b border-[#eef1f7] px-2.5 py-2.5 text-[14px] leading-5 font-medium text-[#0b1a2c]">
                      {w}
                    </td>
                    <td className="border-b border-[#eef1f7] px-2.5 py-2.5 text-right font-medium tabular-nums whitespace-nowrap text-[#324559]">
                      {fmtM(v)}
                    </td>
                    <td className="border-b border-[#eef1f7] px-2.5 py-2.5 text-right font-medium tabular-nums whitespace-nowrap text-[#324559]">
                      {((v / winTotal) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-[#e2e6ee] font-semibold">
                  <td className="px-2.5 py-2.5 text-[14px] leading-5">Total</td>
                  <td className="px-2.5 py-2.5 text-right tabular-nums whitespace-nowrap">{fmtM(winTotal)}</td>
                  <td className="px-2.5 py-2.5 text-right tabular-nums whitespace-nowrap">100%</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="py-5 text-center text-[13px] text-[#6f8094]">No data for this filter.</div>
          )}
        </div>
      </div>
    </>
  );
}

function ScenariosTab() {
  const totals = scenarioTotals();
  return (
    <>
      <div className="mb-4 rounded-xl border border-[#B8D9EE] bg-gradient-to-br from-[#E5F3FB] to-[#ecf2f8] p-3.5 text-[13px] leading-relaxed text-[#324559]">
        <div className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-[#00689D]">
          Plain summary
        </div>
        <b>The SJF team models three funding scenarios for 2026.</b> If all targeted donors deliver (
        <b>Best Case</b>), the fund can allocate <b>{fmtM(totals.best)}</b> across 14 programmes. If
        donor renewals come in as expected (<b>Most Likely</b>), the allocation is{' '}
        <b>{fmtM(totals.most)}</b>. If only confirmed commitments materialise (<b>Worst Case</b>),
        only <b>{fmtM(totals.worst)}</b> can be allocated — a gap of{' '}
        <b>{fmtM(totals.best - totals.worst)}</b> from best case.
      </div>
      <div className="mb-4 grid grid-cols-1 gap-2.5 md:grid-cols-3">
        {[
          {
            lbl: 'Best Case',
            val: totals.best,
            sub: 'all donors deliver as targeted',
            bg: 'from-white to-[#E5F3FB]',
            border: '#B8D9EE',
            color: COLORS.brand,
          },
          {
            lbl: 'Most Likely',
            val: totals.most,
            sub: 'expected donor renewals',
            bg: 'from-white to-[#ecf2f8]',
            border: '#BFD9EC',
            color: COLORS.navy,
          },
          {
            lbl: 'Worst Case',
            val: totals.worst,
            sub: 'only confirmed commitments',
            bg: 'from-white to-[#FDEBE4]',
            border: '#F8CBBF',
            color: COLORS.coral,
          },
        ].map((c) => (
          <div
            key={c.lbl}
            className={cn('rounded-xl border bg-gradient-to-br p-3.5', c.bg)}
            style={{ borderColor: c.border }}
          >
            <div className="text-[10.5px] font-semibold uppercase tracking-wide text-[#6f8094]">
              {c.lbl}
            </div>
            <div className="mt-0.5 text-[24px] font-semibold" style={{ color: c.color }}>
              {fmtM(c.val)}
            </div>
            <div className="mt-0.5 text-[11px] text-[#6f8094]">{c.sub}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-[#e2e6ee] bg-[#f4f6fa] p-4">
        <h4 className="text-[13.5px] font-semibold text-[#0b1a2c]">
          2026 allocations under each scenario
        </h4>
        <p className="mb-3 text-[11.5px] text-[#6f8094]">
          Each programme shows its approved budget and net-funded baseline, then how much would be
          allocated in 2026 under each scenario.
        </p>
        <ScenarioTable />
      </div>
    </>
  );
}

function TransfersTab({ year }: { year: 2025 | 2026 }) {
  const data = year === 2025 ? SJF_DATA.pbi.transfers2025 : SJF_DATA.pbi.transfers2026;
  const tot = data.reduce((s, r) => s + r[1], 0);
  const top = data[0];

  return (
    <>
      <div className="mb-4 rounded-xl border border-[#B8D9EE] bg-gradient-to-br from-[#E5F3FB] to-[#ecf2f8] p-3.5 text-[13px] leading-relaxed text-[#324559]">
        <div className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-[#00689D]">
          Plain summary
        </div>
        <b>
          In {year}, the SJF transferred {fmtM(tot)} to {data.length} programmes.
        </b>{' '}
        <b>{top[0]}</b> received the most at{' '}
        <b>
          {fmtM(top[1])} ({((top[1] / tot) * 100).toFixed(1)}%)
        </b>
        .{' '}
        {year === 2025
          ? '2025 transfers are spread across 10 programmes — the broadest distribution to date.'
          : '2026 transfers concentrate on fewer programmes — Maareynta takes the top slot as the climate-governance flagship scales up.'}
      </div>
      <div className="mb-4 grid max-w-xl grid-cols-3 gap-2.5">
        {[
          { lbl: 'Total Transferred', val: fmtM(tot), sub: String(year) },
          { lbl: 'Programmes', val: String(data.length), sub: 'receiving funds' },
          { lbl: 'Top recipient', val: top[0], sub: fmtM(top[1]) },
        ].map((c) => (
          <div
            key={c.lbl}
            className="rounded-xl border border-[#C5E0F1] bg-gradient-to-br from-white to-[#F5FAFD] p-3.5"
          >
            <div className="text-[10.5px] font-semibold uppercase tracking-wide text-[#6f8094]">
              {c.lbl}
            </div>
            <div
              className={cn(
                'mt-0.5 font-semibold text-[#00689D]',
                c.lbl === 'Top recipient' ? 'text-[17px]' : 'text-[24px]',
              )}
            >
              {c.val}
            </div>
            <div className="mt-0.5 text-[11px] text-[#6f8094]">{c.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <div className="rounded-xl border border-[#e2e6ee] bg-[#f4f6fa] p-4">
          <h4 className="mb-3 text-[13.5px] font-semibold text-[#0b1a2c]">
            {year} transfers by programme
          </h4>
          <HBars rows={data.map(([n, v]) => [n, v, COLORS.brand])} />
        </div>
        <div className="rounded-xl border border-[#e2e6ee] bg-[#f4f6fa] p-4">
          <h4 className="mb-3 text-[13.5px] font-semibold text-[#0b1a2c]">Share of total</h4>
          <ProjectDonut year={year} label={String(year)} />
        </div>
      </div>
    </>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition',
        active
          ? 'border-[#00689D] bg-[#00689D] text-white'
          : 'border-[#e2e6ee] bg-white text-[#324559] hover:border-[#00689D] hover:text-[#00689D]',
      )}
    >
      {children}
    </button>
  );
}

export function SjfPbiMirror() {
  const [tab, setTab] = useState<PbiTab>('totals');
  const [donor, setDonor] = useState<string | null>(null);
  const [year, setYear] = useState<PbiYearFilter>('all');

  const tabs = useMemo(
    () =>
      [
        ['totals', 'Totals'],
        ['scenarios', 'Scenarios'],
        ['t2025', '2025 Transfers'],
        ['t2026', '2026 Transfers'],
      ] as const,
    [],
  );

  return (
    <section className="mt-8 scroll-mt-20 rounded-[18px] border border-[#e2e6ee] bg-white p-6 shadow-sm">
      <h2 className="report-display-title text-[21px] font-semibold text-[#0b1a2c]">
        SJF Team Dashboard — Forward Plan 2025–2027
      </h2>
      <p className="mb-4 text-[13px] text-[#6f8094]">
        Every metric from the SJF team&apos;s working Power BI, with filters and plain-language
        summaries. Source data: SJF team Power BI export.
      </p>
      <div className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-[#B8D9EE] bg-[#E5F3FB] px-3 py-1.5 text-[11px] font-semibold text-[#00689D]">
        <Info size={13} />
        Forward-looking commitment plan — separate from historical deposits shown in the scrolling
        story above
      </div>
      <div className="mb-4 flex gap-1.5 rounded-xl border border-[#e2e6ee] bg-[#f4f6fa] p-1">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'flex-1 rounded-lg px-3 py-2.5 text-center text-[12.5px] font-semibold transition',
              tab === id
                ? 'bg-[#00689D] text-white shadow-sm'
                : 'text-[#6f8094] hover:bg-[#e8ecf3] hover:text-[#324559]',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'totals' && (
        <TotalsTab donor={donor} setDonor={setDonor} year={year} setYear={setYear} />
      )}
      {tab === 'scenarios' && <ScenariosTab />}
      {tab === 't2025' && <TransfersTab year={2025} />}
      {tab === 't2026' && <TransfersTab year={2026} />}
    </section>
  );
}
