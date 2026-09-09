import {
  formatAidMoney,
  formatCompactCount,
  type MapAlertPoint,
  type MapDataLayerId,
  type MapRegionIntelligence,
  ALERT_SEVERITY_COLORS,
} from '../../data/mapLayersMock';

export function buildRegionHoverCardHtml(
  region: MapRegionIntelligence,
  selectedLayers: Set<MapDataLayerId>,
): string {
  const rows: string[] = [];

  if (selectedLayers.has('aid')) {
    rows.push(statRow('Aid', formatAidMoney(region.aidTrackedM), true));
    rows.push(mutedLine(`Funding recorded for ${region.aidPeriod}`));
    rows.push(mutedLine(`Share of tracked aid: ${region.aidSharePct}%`));
    rows.push(
      mutedLine(
        `Direct: ${formatAidMoney(region.aidDirectM)} · Shared (est.): ≈${formatAidMoney(region.aidSharedEstM)}`,
      ),
    );
    rows.push(mutedLine('Multi-region funds split evenly — estimate'));
    rows.push(mutedLine('Change: ±$0 vs 28 Aug 2026'));
  }

  if (selectedLayers.has('risk')) {
    rows.push(
      statRow(
        'Risk',
        `${region.riskBand} · ${region.riskScore.toFixed(1)} / ${region.riskMax}`,
        !selectedLayers.has('aid'),
      ),
    );
    if (region.trend7d !== 0) {
      rows.push(
        mutedLine(
          `7-day change: ${region.trend7d > 0 ? '+' : ''}${region.trend7d.toFixed(1)}`,
        ),
      );
    }
  }

  if (selectedLayers.has('displacement')) {
    rows.push(
      statRow(
        'Displacement',
        formatCompactCount(region.displacementPop),
        rows.length === 0,
      ),
    );
    rows.push(
      mutedLine(
        `Arrivals ${formatCompactCount(region.arrivals)} · Departures ${formatCompactCount(region.departures)}`,
      ),
    );
  }

  if (selectedLayers.has('drought')) {
    rows.push(statRow('Drought', region.drought, rows.length === 0));
  }

  if (selectedLayers.has('floods')) {
    rows.push(
      statRow('Flood risk', `${region.floodRisk.toFixed(1)} / 10`, rows.length === 0),
    );
  }

  if (rows.length === 0) {
    rows.push(statRow('Region', region.name, true));
    rows.push(mutedLine('Click for full intelligence dossier'));
  }

  return `
    <div style="min-width:220px;max-width:280px;padding:12px 14px;font-family:Inter,system-ui,sans-serif;">
      <div style="font-weight:700;font-size:14px;color:#0f172a;margin-bottom:6px;">${escapeHtml(region.name)}</div>
      ${rows.join('')}
    </div>
  `;
}

export function buildAlertHoverCardHtml(alert: MapAlertPoint): string {
  const color = ALERT_SEVERITY_COLORS[alert.severity];
  return `
    <div style="min-width:200px;max-width:260px;padding:12px 14px;font-family:Inter,system-ui,sans-serif;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="width:8px;height:8px;border-radius:999px;background:${color};flex-shrink:0;"></span>
        <div style="font-weight:700;font-size:13px;color:#0f172a;">${escapeHtml(alert.name)}</div>
      </div>
      <div style="font-size:12px;color:#475569;line-height:1.45;margin-bottom:6px;">${escapeHtml(alert.summary)}</div>
      <div style="font-size:11px;color:#94a3b8;text-transform:capitalize;">${alert.severity} · ${escapeHtml(alert.updatedLabel)}</div>
    </div>
  `;
}

function statRow(label: string, value: string, emphasize: boolean): string {
  if (emphasize) {
    return `<div style="font-size:13px;color:#0f172a;margin-bottom:4px;"><span style="font-weight:600;">${escapeHtml(label)}:</span> <span style="font-weight:700;">${escapeHtml(value)}</span></div>`;
  }
  return `<div style="display:flex;justify-content:space-between;gap:12px;font-size:12px;margin-top:4px;"><span style="color:#64748b;">${escapeHtml(label)}</span><span style="font-weight:600;color:#0f172a;white-space:nowrap;">${escapeHtml(value)}</span></div>`;
}

function mutedLine(text: string): string {
  return `<div style="font-size:11px;color:#64748b;line-height:1.4;margin-top:3px;">${escapeHtml(text)}</div>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
