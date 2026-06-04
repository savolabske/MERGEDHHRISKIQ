import React from 'react';
import { MigrationDisplacementProps } from '../types';
import { MIGRATION_THEME } from '../data/migrationData';
import { useMigrationFilters } from '../hooks/useMigrationFilters';

export function MigrationDisplacementScaffold({ onBack }: MigrationDisplacementProps) {
  const { startYear, endYear } = useMigrationFilters();

  return (
    <div className="rounded-xl border border-dashed border-[#cfd7e3] bg-white p-6">
      <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6b7a8d]">
        Next Phase Scaffold
      </div>
      <h2 className="text-[20px] font-semibold text-[#0d1b2a]">{MIGRATION_THEME.title}</h2>
      <p className="mt-2 text-[13px] text-[#4f6176]">{MIGRATION_THEME.subtitle}</p>
      <p className="mt-4 text-[12px] text-[#6b7a8d]">
        Planned native filter model starts with year range: {startYear} - {endYear}
      </p>
      {onBack ? (
        <button
          onClick={onBack}
          className="mt-4 rounded-md border border-[#d8e2f3] bg-[#eef4ff] px-3 py-2 text-[12px] font-medium text-[#1550b3]"
        >
          Back to Reports
        </button>
      ) : null}
    </div>
  );
}
