import React from 'react';
import { Circle, G, Rect, Svg, Text as SvgText } from '@react-pdf/renderer';
import type { ReportThemeTokens } from '../../../../../data/reportThemeTokens';
import { formatExportChartValue } from '../formatValue';
import type { ExportChartSpec } from '../types';

const CHART_W = 480;
const CHART_H = 280;

function rowColor(theme: ReportThemeTokens, color: string | undefined, index: number): string {
  return color || theme.chartPalette[index % theme.chartPalette.length] || theme.chartPrimary;
}

function HBarsChart({
  rows,
  theme,
  valueFormat,
}: {
  rows: { label: string; value: number; color?: string }[];
  theme: ReportThemeTokens;
  valueFormat?: 'money' | 'number' | 'compact';
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  const rowH = Math.min(28, Math.floor(CHART_H / Math.max(rows.length, 1)));
  const labelW = 120;
  const valueW = 64;
  const barMax = CHART_W - labelW - valueW - 16;

  return (
    <Svg width={CHART_W} height={rows.length * rowH}>
      {rows.map((row, i) => {
        const y = i * rowH;
        const barW = Math.max(2, (row.value / max) * barMax);
        return (
          <G key={`${row.label}-${i}`}>
            <SvgText
              x={labelW - 6}
              y={y + rowH / 2 + 3}
              style={{ fontSize: 8, fill: theme.textSecondary }}
              textAnchor="end"
            >
              {row.label.length > 22 ? `${row.label.slice(0, 20)}…` : row.label}
            </SvgText>
            <Rect
              x={labelW}
              y={y + 5}
              width={barMax}
              height={rowH - 10}
              fill={theme.pageBg}
              rx={3}
              ry={3}
            />
            <Rect
              x={labelW}
              y={y + 5}
              width={barW}
              height={rowH - 10}
              fill={rowColor(theme, row.color, i)}
              rx={3}
              ry={3}
            />
            <SvgText
              x={CHART_W - 2}
              y={y + rowH / 2 + 3}
              style={{ fontSize: 8, fill: theme.textPrimary }}
              textAnchor="end"
            >
              {formatExportChartValue(row.value, valueFormat)}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

function VBarsChart({
  rows,
  theme,
  valueFormat,
}: {
  rows: { label: string; value: number; color?: string }[];
  theme: ReportThemeTokens;
  valueFormat?: 'money' | 'number' | 'compact';
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  const padL = 8;
  const padB = 36;
  const padT = 16;
  const chartInnerH = CHART_H - padB - padT;
  const gap = 6;
  const barW = Math.max(8, (CHART_W - padL * 2 - gap * (rows.length - 1)) / Math.max(rows.length, 1));

  return (
    <Svg width={CHART_W} height={CHART_H}>
      {rows.map((row, i) => {
        const h = Math.max(2, (row.value / max) * chartInnerH);
        const x = padL + i * (barW + gap);
        const y = padT + chartInnerH - h;
        return (
          <G key={`${row.label}-${i}`}>
            <Rect x={x} y={y} width={barW} height={h} fill={rowColor(theme, row.color, i)} rx={2} ry={2} />
            <SvgText
              x={x + barW / 2}
              y={y - 4}
              style={{ fontSize: 7, fill: theme.textPrimary }}
              textAnchor="middle"
            >
              {formatExportChartValue(row.value, valueFormat)}
            </SvgText>
            <SvgText
              x={x + barW / 2}
              y={CHART_H - 10}
              style={{ fontSize: 6, fill: theme.textMuted }}
              textAnchor="middle"
            >
              {row.label.length > 10 ? `${row.label.slice(0, 8)}…` : row.label}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

function DonutChart({
  rows,
  theme,
  centerLabel,
  valueFormat,
}: {
  rows: { label: string; value: number; color?: string }[];
  theme: ReportThemeTokens;
  centerLabel?: string;
  valueFormat?: 'money' | 'number' | 'compact';
}) {
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  const cx = 110;
  const cy = 120;
  const r = 70;
  const stroke = 22;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <Svg width={CHART_W} height={240}>
      {rows.map((row, i) => {
        const len = (row.value / total) * circ;
        const seg = (
          <Circle
            key={`${row.label}-${i}`}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={rowColor(theme, row.color, i)}
            strokeWidth={stroke}
            strokeDasharray={`${len} ${circ - len}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
        offset += len;
        return seg;
      })}
      <SvgText x={cx} y={cy - 2} style={{ fontSize: 9, fill: theme.textMuted }} textAnchor="middle">
        {centerLabel ?? ''}
      </SvgText>
      <SvgText x={cx} y={cy + 14} style={{ fontSize: 11, fill: theme.textPrimary }} textAnchor="middle">
        {formatExportChartValue(total, valueFormat)}
      </SvgText>
      {rows.slice(0, 8).map((row, i) => (
        <G key={`leg-${row.label}-${i}`}>
          <Rect x={240} y={28 + i * 22} width={10} height={10} fill={rowColor(theme, row.color, i)} rx={2} ry={2} />
          <SvgText x={256} y={37 + i * 22} style={{ fontSize: 8, fill: theme.textSecondary }}>
            {`${row.label.length > 28 ? `${row.label.slice(0, 26)}…` : row.label}  ${formatExportChartValue(row.value, valueFormat)}`}
          </SvgText>
        </G>
      ))}
    </Svg>
  );
}

function GapChart({
  rows,
  theme,
  valueFormat,
}: {
  rows: { label: string; need: number; response: number }[];
  theme: ReportThemeTokens;
  valueFormat?: 'money' | 'number' | 'compact';
}) {
  const max = Math.max(...rows.map((r) => Math.max(r.need, r.response)), 1);
  const rowH = Math.min(30, Math.floor(CHART_H / Math.max(rows.length, 1)));
  const labelW = 90;
  const barMax = CHART_W - labelW - 70;

  return (
    <Svg width={CHART_W} height={rows.length * rowH + 20}>
      {rows.map((row, i) => {
        const y = i * rowH;
        return (
          <G key={`${row.label}-${i}`}>
            <SvgText
              x={labelW - 4}
              y={y + rowH / 2 + 3}
              style={{ fontSize: 8, fill: theme.textSecondary }}
              textAnchor="end"
            >
              {row.label}
            </SvgText>
            <Rect
              x={labelW}
              y={y + 4}
              width={(row.need / max) * barMax}
              height={10}
              fill={theme.chartTertiary}
              rx={2}
              ry={2}
            />
            <Rect
              x={labelW}
              y={y + 16}
              width={(row.response / max) * barMax}
              height={10}
              fill={theme.chartPrimary}
              rx={2}
              ry={2}
            />
            <SvgText x={labelW + barMax + 6} y={y + 12} style={{ fontSize: 7, fill: theme.textMuted }}>
              {formatExportChartValue(row.need, valueFormat)}
            </SvgText>
            <SvgText x={labelW + barMax + 6} y={y + 24} style={{ fontSize: 7, fill: theme.textPrimary }}>
              {formatExportChartValue(row.response, valueFormat)}
            </SvgText>
          </G>
        );
      })}
      <SvgText x={labelW} y={rows.length * rowH + 14} style={{ fontSize: 7, fill: theme.chartTertiary }}>
        Need
      </SvgText>
      <SvgText x={labelW + 40} y={rows.length * rowH + 14} style={{ fontSize: 7, fill: theme.chartPrimary }}>
        Response
      </SvgText>
    </Svg>
  );
}

function TreemapBlocks({
  rows,
  theme,
  valueFormat,
}: {
  rows: { label: string; value: number; color?: string }[];
  theme: ReportThemeTokens;
  valueFormat?: 'money' | 'number' | 'compact';
}) {
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  let x = 0;
  const h = 160;

  return (
    <Svg width={CHART_W} height={h + 80}>
      {rows.map((row, i) => {
        const w = Math.max(24, (row.value / total) * CHART_W);
        const block = (
          <G key={`${row.label}-${i}`}>
            <Rect x={x} y={0} width={w - 2} height={h} fill={rowColor(theme, row.color, i)} />
            {w > 50 ? (
              <>
                <SvgText x={x + 6} y={24} style={{ fontSize: 8, fill: '#ffffff' }}>
                  {row.label.length > 14 ? `${row.label.slice(0, 12)}…` : row.label}
                </SvgText>
                <SvgText x={x + 6} y={40} style={{ fontSize: 9, fill: '#ffffff' }}>
                  {formatExportChartValue(row.value, valueFormat)}
                </SvgText>
              </>
            ) : null}
          </G>
        );
        x += w;
        return block;
      })}
      {rows.map((row, i) => (
        <G key={`leg-${row.label}-${i}`}>
          <Rect x={0} y={h + 12 + i * 14} width={8} height={8} fill={rowColor(theme, row.color, i)} />
          <SvgText x={14} y={h + 20 + i * 14} style={{ fontSize: 7, fill: theme.textSecondary }}>
            {`${row.label}: ${formatExportChartValue(row.value, valueFormat)}`}
          </SvgText>
        </G>
      ))}
    </Svg>
  );
}

export function PdfExportChart({
  chart,
  theme,
}: {
  chart: ExportChartSpec;
  theme: ReportThemeTokens;
}) {
  switch (chart.kind) {
    case 'hbars':
      return <HBarsChart rows={chart.rows} theme={theme} valueFormat={chart.valueFormat} />;
    case 'vbars':
      return <VBarsChart rows={chart.rows} theme={theme} valueFormat={chart.valueFormat} />;
    case 'donut':
      return (
        <DonutChart
          rows={chart.rows}
          theme={theme}
          centerLabel={chart.centerLabel}
          valueFormat={chart.valueFormat}
        />
      );
    case 'gap':
      return <GapChart rows={chart.rows} theme={theme} valueFormat={chart.valueFormat} />;
    case 'treemapBlocks':
      return <TreemapBlocks rows={chart.rows} theme={theme} valueFormat={chart.valueFormat} />;
    case 'table':
      return null;
    default:
      return null;
  }
}
