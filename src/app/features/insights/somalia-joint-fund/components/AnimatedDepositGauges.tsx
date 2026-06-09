import React, { useMemo } from 'react';
import { useAnimateOnView } from '../../shared/animations/useAnimateOnView';
import { usePrefersReducedMotion } from '../../shared/animations/motionPrefs';
import { COLORS } from '../data/sjfData';
import type { SjfDonorH1 } from '../types';
import { fmtM } from '../hooks/useSjfFilters';

const BAR_STAGGER_MS = 60;

export function AnimatedDepositGauges({ rows }: { rows: SjfDonorH1[] }) {
  const { ref, inView } = useAnimateOnView();
  const reduced = usePrefersReducedMotion();
  const max = useMemo(() => (rows.length > 0 ? Math.max(...rows.map((d) => d[1])) : 0), [rows]);
  const totalDeposits = rows.reduce((s, d) => s + d[2], 0);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#c4dcd5] p-4 text-[12px] text-[#6f8094]">
        No data for selected filters.
      </div>
    );
  }

  return (
    <div ref={ref as React.RefCallback<HTMLDivElement>}>
      {rows.map(([name, commit, deposit, rate], index) => {
        const commitPct = max > 0 ? (commit / max) * 100 : 0;
        const depositPct = max > 0 ? (deposit / max) * 100 : 0;
        const active = inView || reduced;
        const delay = reduced ? 0 : index * BAR_STAGGER_MS;

        return (
          <div key={name} className="mb-2 flex items-center gap-2">
            <div className="w-[130px] shrink-0 text-right text-[12px] font-medium text-[#324559]">
              {name}
            </div>
            <div className="relative h-[22px] flex-1 overflow-hidden rounded-md bg-[#eef1f7]">
              <div
                className={`report-animate-bar-fill absolute left-0 top-0 h-full rounded-md bg-[#cfdee0] ${active ? 'is-visible' : ''}`}
                style={
                  {
                    '--bar-target-width': `${commitPct}%`,
                    transitionDelay: `${delay}ms`,
                  } as React.CSSProperties
                }
              />
              <div
                className={`report-animate-bar-fill absolute left-0 top-0 h-full rounded-md ${active ? 'is-visible' : ''}`}
                style={
                  {
                    '--bar-target-width': `${depositPct}%`,
                    backgroundColor: COLORS.brand,
                    transitionDelay: `${delay + 60}ms`,
                  } as React.CSSProperties
                }
              />
            </div>
            <div className="w-[60px] shrink-0 text-right text-[11px] text-[#6f8094]">{rate}%</div>
          </div>
        );
      })}
      <div className="mt-3 flex flex-wrap gap-3 text-[12px] text-[#324559]">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-sm bg-[#cfdee0]" />
          Commitment
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLORS.brand }} />
          Deposit · {fmtM(totalDeposits)}
        </span>
      </div>
    </div>
  );
}
