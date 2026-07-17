export function formatExportChartValue(
  value: number,
  format: 'money' | 'number' | 'compact' = 'number',
): string {
  if (format === 'money') {
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (Math.abs(value) >= 1e3) return `$${Math.round(value / 1e3)}k`;
    return `$${Math.round(value).toLocaleString()}`;
  }
  if (format === 'compact') {
    if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (Math.abs(value) >= 1e3) return `${Math.round(value / 1e3)}k`;
    return Math.round(value).toLocaleString();
  }
  return Math.round(value).toLocaleString();
}
