import React from 'react';
import { COLORS } from '../data/sjfData';
import type { SjfProgramme } from '../types';
import { fmtM } from '../hooks/useSjfFilters';

function statusColor(status: string): string {
  if (status === 'Active') return COLORS.brand;
  if (status === 'New') return COLORS.wHrg;
  if (status.startsWith('Clos')) return COLORS.coral;
  return COLORS.muted;
}

export function ProgrammeTable({ rows }: { rows: SjfProgramme[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr className="text-left text-[10.5px] font-semibold uppercase tracking-wide text-[#6f8094]">
            <th className="border-b border-[#e2e6ee] px-2.5 py-2">Programme</th>
            <th className="border-b border-[#e2e6ee] px-2.5 py-2">Window</th>
            <th className="border-b border-[#e2e6ee] px-2.5 py-2">Lead orgs</th>
            <th className="border-b border-[#e2e6ee] px-2.5 py-2">Approved</th>
            <th className="border-b border-[#e2e6ee] px-2.5 py-2">Net-funded</th>
            <th className="border-b border-[#e2e6ee] px-2.5 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="hover:bg-[#f7f9fc]">
              <td className="border-b border-[#eef1f7] px-2.5 py-2.5 font-medium text-[#0b1a2c]">
                {r[0]}
              </td>
              <td className="border-b border-[#eef1f7] px-2.5 py-2.5 text-[#324559]">{r[1]}</td>
              <td className="border-b border-[#eef1f7] px-2.5 py-2.5 text-[11.5px] text-[#324559]">
                {r[2]}
              </td>
              <td className="border-b border-[#eef1f7] px-2.5 py-2.5 text-[#324559]">
                {fmtM(r[3])}
              </td>
              <td className="border-b border-[#eef1f7] px-2.5 py-2.5 text-[#324559]">
                {fmtM(r[4])}
              </td>
              <td className="border-b border-[#eef1f7] px-2.5 py-2.5">
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-[10.5px] font-semibold text-white"
                  style={{ backgroundColor: statusColor(r[7]) }}
                >
                  {r[7]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
