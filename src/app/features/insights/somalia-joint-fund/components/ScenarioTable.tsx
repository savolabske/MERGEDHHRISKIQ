import React from 'react';
import { SJF_DATA } from '../data/sjfData';
import { scenarioTotals } from '../data/sjfPbiUtils';
import { fmtM } from '../hooks/useSjfFilters';

function fmtCell(v: number) {
  return v === 0 ? '—' : fmtM(v);
}

export function ScenarioTable() {
  const programmes = SJF_DATA.pbi.scenarios.programmes;
  const totals = scenarioTotals(programmes);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px] leading-[18px]">
        <thead>
          <tr>
            <th className="border-b border-[#e2e6ee] bg-[#f4f6fa] px-2.5 py-2.5 text-left text-[12px] leading-4 font-semibold text-[#6f8094]">
              Window / programme
            </th>
            <th className="border-b border-[#e2e6ee] bg-[#f4f6fa] px-2.5 py-2.5 text-right text-[12px] leading-4 font-semibold text-[#6f8094]">
              Approved budget
            </th>
            <th className="border-b border-[#e2e6ee] bg-[#f4f6fa] px-2.5 py-2.5 text-right text-[12px] leading-4 font-semibold text-[#6f8094]">
              Net funded
            </th>
            <th className="border-b border-[#e2e6ee] bg-[#E5F3FB] px-2.5 py-2.5 text-right text-[12px] leading-4 font-semibold text-[#19486A]">
              Best case
            </th>
            <th className="border-b border-[#e2e6ee] bg-[#ecf2f8] px-2.5 py-2.5 text-right text-[12px] leading-4 font-semibold text-[#19486A]">
              Most likely
            </th>
            <th className="border-b border-[#e2e6ee] bg-[#FDEBE4] px-2.5 py-2.5 text-right text-[12px] leading-4 font-semibold text-[#C5192D]">
              Worst case
            </th>
          </tr>
        </thead>
        <tbody>
          {programmes.map((p) => (
            <tr key={`${p[0]}-${p[1]}`} className="transition-colors hover:bg-[#f8fafc]">
              <td className="border-b border-[#eef1f7] px-2.5 py-2.5 text-[14px] leading-5 font-medium text-[#0b1a2c]">
                <span className="mb-0.5 block text-[12px] leading-4 font-normal text-[#6f8094]">
                  {p[0]}
                </span>
                {p[1]}
              </td>
              <td className="border-b border-[#eef1f7] px-2.5 py-2.5 text-right font-medium tabular-nums whitespace-nowrap text-[#324559]">
                {p[2] > 0 ? fmtM(p[2]) : '—'}
              </td>
              <td className="border-b border-[#eef1f7] px-2.5 py-2.5 text-right font-medium tabular-nums whitespace-nowrap text-[#324559]">
                {p[3] > 0 ? fmtM(p[3]) : '—'}
              </td>
              <td className="border-b border-[#eef1f7] bg-[#EEF7FC] px-2.5 py-2.5 text-right font-semibold tabular-nums whitespace-nowrap text-[#19486A]">
                {fmtCell(p[4])}
              </td>
              <td className="border-b border-[#eef1f7] bg-[#f5f8fc] px-2.5 py-2.5 text-right font-semibold tabular-nums whitespace-nowrap text-[#19486A]">
                {fmtCell(p[5])}
              </td>
              <td className="border-b border-[#eef1f7] bg-[#FEF0EA] px-2.5 py-2.5 text-right font-semibold tabular-nums whitespace-nowrap text-[#C5192D]">
                {fmtCell(p[6])}
              </td>
            </tr>
          ))}
          <tr className="border-t-2 border-[#e2e6ee] font-semibold">
            <td className="px-2.5 py-2.5 text-[14px] leading-5 text-[#0b1a2c]">Total 2026 allocation</td>
            <td />
            <td />
            <td className="bg-[#EEF7FC] px-2.5 py-2.5 text-right tabular-nums whitespace-nowrap text-[#19486A]">{fmtM(totals.best)}</td>
            <td className="bg-[#f5f8fc] px-2.5 py-2.5 text-right tabular-nums whitespace-nowrap text-[#19486A]">{fmtM(totals.most)}</td>
            <td className="bg-[#FEF0EA] px-2.5 py-2.5 text-right tabular-nums whitespace-nowrap text-[#C5192D]">{fmtM(totals.worst)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
