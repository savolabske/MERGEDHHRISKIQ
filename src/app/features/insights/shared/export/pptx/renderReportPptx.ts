import PptxGenJS from 'pptxgenjs';
import { downloadBlob, yieldToUi } from '../downloadBlob';
import { exportTheme, formatExportFilename } from '../theme';
import type { ExportChartSpec, ReportExportDocument, ReportExportScene } from '../types';

const W = 13.333;
const H = 7.5;

function addCoverSlide(pptx: PptxGenJS, doc: ReportExportDocument) {
  const theme = exportTheme(doc);
  const slide = pptx.addSlide();
  slide.background = { color: theme.pageBg.replace('#', '') };

  slide.addText('HUMANITY HUB', {
    x: 0.7,
    y: 1.4,
    w: 11,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: theme.accent.replace('#', ''),
    fontFace: 'Arial',
    charSpacing: 4,
  });

  slide.addText(doc.meta.title, {
    x: 0.7,
    y: 1.9,
    w: 11.5,
    h: 0.9,
    fontSize: 32,
    bold: true,
    color: theme.textPrimary.replace('#', ''),
    fontFace: 'Arial',
  });

  slide.addText(doc.meta.subtitle, {
    x: 0.7,
    y: 2.9,
    w: 10,
    h: 0.7,
    fontSize: 14,
    color: theme.textSecondary.replace('#', ''),
    fontFace: 'Arial',
  });

  slide.addText('Applied filters', {
    x: 0.7,
    y: 3.9,
    w: 4,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: theme.textMuted.replace('#', ''),
    fontFace: 'Arial',
  });

  doc.meta.filterLabels.forEach((f, i) => {
    const x = 0.7 + (i % 4) * 3;
    const y = 4.3 + Math.floor(i / 4) * 0.85;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: 2.8,
      h: 0.7,
      fill: { color: theme.accentSubtle.replace('#', '') },
      line: { color: theme.accentBorder.replace('#', ''), width: 1 },
      rectRadius: 0.08,
    });
    slide.addText(`${f.label}\n${f.value}`, {
      x: x + 0.12,
      y: y + 0.1,
      w: 2.55,
      h: 0.5,
      fontSize: 11,
      color: theme.accentDark.replace('#', ''),
      fontFace: 'Arial',
      bold: true,
    });
  });

  slide.addText(`Generated ${doc.meta.generatedAt}`, {
    x: 0.7,
    y: 6.7,
    w: 8,
    h: 0.3,
    fontSize: 11,
    color: theme.textMuted.replace('#', ''),
    fontFace: 'Arial',
  });
}

function addKpiSlide(pptx: PptxGenJS, doc: ReportExportDocument) {
  const theme = exportTheme(doc);
  const slide = pptx.addSlide();
  slide.background = { color: theme.pageBg.replace('#', '') };

  slide.addText('KPI summary', {
    x: 0.6,
    y: 0.35,
    w: 12,
    h: 0.45,
    fontSize: 22,
    bold: true,
    color: theme.textPrimary.replace('#', ''),
    fontFace: 'Arial',
  });

  doc.kpis.forEach((kpi, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.6 + col * 4.1;
    const y = 1.1 + row * 2.8;

    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: 3.9,
      h: 2.5,
      fill: { color: theme.cardBg.replace('#', '') },
      line: { color: theme.cardBorder.replace('#', ''), width: 1 },
      rectRadius: 0.1,
    });
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.25,
      y: y + 0.3,
      w: 0.22,
      h: 0.22,
      fill: { color: kpi.accent.replace('#', '') },
      line: { color: kpi.accent.replace('#', '') },
    });
    slide.addText(kpi.label, {
      x: x + 0.25,
      y: y + 0.7,
      w: 3.4,
      h: 0.35,
      fontSize: 12,
      color: theme.textMuted.replace('#', ''),
      fontFace: 'Arial',
    });
    slide.addText(kpi.value, {
      x: x + 0.25,
      y: y + 1.1,
      w: 3.4,
      h: 0.5,
      fontSize: 24,
      bold: true,
      color: theme.textPrimary.replace('#', ''),
      fontFace: 'Arial',
    });
    slide.addText(kpi.sub, {
      x: x + 0.25,
      y: y + 1.7,
      w: 3.4,
      h: 0.45,
      fontSize: 12,
      color: theme.textSecondary.replace('#', ''),
      fontFace: 'Arial',
    });
  });
}

function addChartToSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  chart: ExportChartSpec,
  theme: ReturnType<typeof exportTheme>,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const hex = (c: string) => c.replace('#', '');

  if (chart.kind === 'table') {
    slide.addTable(
      [
        chart.columns.map((c) => ({
          text: c,
          options: { bold: true, color: hex(theme.textMuted), fill: { color: hex(theme.pageBg) } },
        })),
        ...chart.rows.map((row) =>
          row.map((cell) => ({
            text: cell,
            options: { color: hex(theme.textSecondary) },
          })),
        ),
      ],
      {
        x,
        y,
        w,
        h,
        border: [{ pt: 0.5, color: hex(theme.cardBorder) }],
        fontFace: 'Arial',
        fontSize: 10,
        colW: chart.columns.map(() => w / chart.columns.length),
      },
    );
    return;
  }

  if (chart.kind === 'gap') {
    slide.addChart(pptx.charts.BAR, [
      {
        name: 'Need',
        labels: chart.rows.map((r) => r.label),
        values: chart.rows.map((r) => r.need),
      },
      {
        name: 'Response',
        labels: chart.rows.map((r) => r.label),
        values: chart.rows.map((r) => r.response),
      },
    ], {
      x,
      y,
      w,
      h,
      barGrouping: 'clustered',
      barDir: 'bar',
      showValue: false,
      showLegend: true,
      chartColors: [hex(theme.chartTertiary), hex(theme.chartPrimary)],
      fontFace: 'Arial',
    });
    return;
  }

  if (chart.kind === 'donut') {
    slide.addChart(pptx.charts.DOUGHNUT, [
      {
        name: 'Share',
        labels: chart.rows.map((r) => r.label),
        values: chart.rows.map((r) => r.value),
      },
    ], {
      x,
      y,
      w,
      h,
      showPercent: false,
      showLegend: true,
      legendPos: 'r',
      chartColors: chart.rows.map((r, i) =>
        hex(r.color || theme.chartPalette[i % theme.chartPalette.length]),
      ),
      fontFace: 'Arial',
    });
    return;
  }

  // hbars, vbars, treemapBlocks → bar chart (treemap as ranked bars)
  const rows =
    chart.kind === 'treemapBlocks' || chart.kind === 'hbars' || chart.kind === 'vbars'
      ? chart.rows
      : [];
  if (!rows.length) return;

  const isHorizontal = chart.kind === 'hbars' || chart.kind === 'treemapBlocks';
  slide.addChart(pptx.charts.BAR, [
    {
      name: 'Value',
      labels: rows.map((r) => r.label),
      values: rows.map((r) => r.value),
    },
  ], {
    x,
    y,
    w,
    h: h - 0.3,
    barGrouping: 'clustered',
    barGapWidthPct: 40,
    showValue: false,
    showLegend: false,
    chartColors: rows.map((r, i) =>
      hex(r.color || theme.chartPalette[i % theme.chartPalette.length]),
    ),
    fontFace: 'Arial',
    barDir: isHorizontal ? 'bar' : 'col',
  });
}

function addSceneSlide(pptx: PptxGenJS, doc: ReportExportDocument, scene: ReportExportScene) {
  const theme = exportTheme(doc);
  const slide = pptx.addSlide();
  slide.background = { color: theme.pageBg.replace('#', '') };
  const hex = (c: string) => c.replace('#', '');

  slide.addText(scene.num, {
    x: 0.55,
    y: 0.28,
    w: 2,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: hex(theme.sectionStep),
    fontFace: 'Arial',
  });

  slide.addText(scene.title, {
    x: 0.55,
    y: 0.55,
    w: 5.4,
    h: 0.55,
    fontSize: 20,
    bold: true,
    color: hex(theme.textPrimary),
    fontFace: 'Arial',
  });

  slide.addText(scene.stat, {
    x: 0.55,
    y: 1.15,
    w: 5.4,
    h: 0.5,
    fontSize: 28,
    bold: true,
    color: hex(theme.sectionStat),
    fontFace: 'Arial',
  });

  slide.addText(scene.statLbl, {
    x: 0.55,
    y: 1.65,
    w: 5.4,
    h: 0.35,
    fontSize: 12,
    color: hex(theme.textMuted),
    fontFace: 'Arial',
  });

  slide.addText(scene.body, {
    x: 0.55,
    y: 2.15,
    w: 5.4,
    h: 1.8,
    fontSize: 12,
    color: hex(theme.textSecondary),
    fontFace: 'Arial',
    valign: 'top',
  });

  slide.addText(scene.bullets.map((b) => `• ${b}`).join('\n'), {
    x: 0.55,
    y: 4.1,
    w: 5.4,
    h: 2.4,
    fontSize: 12,
    color: hex(theme.textSecondary),
    fontFace: 'Arial',
    valign: 'top',
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.2,
    y: 0.45,
    w: 6.5,
    h: 6.4,
    fill: { color: hex(theme.cardBg) },
    line: { color: hex(theme.cardBorder), width: 1 },
    rectRadius: 0.1,
  });

  slide.addText(scene.chartCap.toUpperCase(), {
    x: 6.45,
    y: 0.65,
    w: 6,
    h: 0.25,
    fontSize: 10,
    bold: true,
    color: hex(theme.textMuted),
    fontFace: 'Arial',
  });

  slide.addText(scene.chartTitle, {
    x: 6.45,
    y: 0.9,
    w: 6,
    h: 0.35,
    fontSize: 13,
    bold: true,
    color: hex(theme.textPrimary),
    fontFace: 'Arial',
  });

  addChartToSlide(pptx, slide, scene.chart, theme, 6.4, 1.4, 6.1, 5.1);
}

export async function renderReportPptx(doc: ReportExportDocument): Promise<void> {
  await yieldToUi();
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'WIDESCREEN_16x9', width: W, height: H });
  pptx.layout = 'WIDESCREEN_16x9';
  pptx.author = 'Humanity Hub';
  pptx.title = doc.meta.title;
  pptx.subject = doc.meta.subtitle;

  addCoverSlide(pptx, doc);
  addKpiSlide(pptx, doc);
  doc.scenes.forEach((scene) => addSceneSlide(pptx, doc, scene));

  const blob = (await pptx.write({ outputType: 'blob' })) as Blob;
  downloadBlob(blob, formatExportFilename(doc.meta.slug, 'pptx'));
}
