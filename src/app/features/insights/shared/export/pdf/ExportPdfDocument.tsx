import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { ReportThemeTokens } from '../../../../../data/reportThemeTokens';
import type { ReportExportDocument, ReportExportScene } from '../types';
import { PdfExportChart } from './charts';

function buildStyles(theme: ReportThemeTokens) {
  return StyleSheet.create({
    page: {
      paddingTop: 40,
      paddingBottom: 40,
      paddingHorizontal: 40,
      backgroundColor: theme.pageBg,
      fontFamily: 'Helvetica',
      color: theme.textPrimary,
    },
    coverBrand: {
      fontSize: 11,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: theme.accent,
      marginBottom: 18,
      fontWeight: 700,
    },
    coverTitle: {
      fontSize: 28,
      fontWeight: 700,
      color: theme.textPrimary,
      marginBottom: 10,
      lineHeight: 1.2,
    },
    coverSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 28,
      lineHeight: 1.45,
      maxWidth: 420,
    },
    sectionLabel: {
      fontSize: 9,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: theme.textMuted,
      marginBottom: 8,
      fontWeight: 700,
    },
    filterRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 24,
    },
    filterChip: {
      borderWidth: 1,
      borderColor: theme.accentBorder,
      backgroundColor: theme.accentSubtle,
      borderRadius: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    filterChipLabel: {
      fontSize: 8,
      color: theme.textMuted,
      marginBottom: 2,
    },
    filterChipValue: {
      fontSize: 10,
      color: theme.accentDark,
      fontWeight: 700,
    },
    timestamp: {
      fontSize: 10,
      color: theme.textMuted,
      marginTop: 12,
    },
    pageTitle: {
      fontSize: 18,
      fontWeight: 700,
      marginBottom: 16,
      color: theme.textPrimary,
    },
    kpiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    kpiCard: {
      width: '48%',
      backgroundColor: theme.cardBg,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 10,
      padding: 12,
      marginBottom: 4,
    },
    kpiAccent: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginBottom: 8,
    },
    kpiLabel: {
      fontSize: 9,
      color: theme.textMuted,
      marginBottom: 4,
    },
    kpiValue: {
      fontSize: 16,
      fontWeight: 700,
      color: theme.textPrimary,
      marginBottom: 4,
    },
    kpiSub: {
      fontSize: 9,
      color: theme.textSecondary,
    },
    sceneNum: {
      fontSize: 10,
      color: theme.sectionStep,
      fontWeight: 700,
      marginBottom: 6,
    },
    sceneTitle: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 8,
      color: theme.textPrimary,
    },
    sceneStat: {
      fontSize: 22,
      fontWeight: 700,
      color: theme.sectionStat,
      marginBottom: 4,
    },
    sceneStatLbl: {
      fontSize: 10,
      color: theme.textMuted,
      marginBottom: 12,
    },
    sceneBody: {
      fontSize: 10,
      color: theme.textSecondary,
      lineHeight: 1.5,
      marginBottom: 10,
    },
    bullet: {
      fontSize: 9,
      color: theme.textSecondary,
      marginBottom: 4,
      paddingLeft: 8,
    },
    chartCard: {
      marginTop: 14,
      backgroundColor: theme.cardBg,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 10,
      padding: 12,
    },
    chartCap: {
      fontSize: 8,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: theme.textMuted,
      marginBottom: 4,
      fontWeight: 700,
    },
    chartTitle: {
      fontSize: 11,
      fontWeight: 700,
      color: theme.textPrimary,
      marginBottom: 10,
    },
    table: {
      marginTop: 4,
    },
    tableHeader: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.cardBorder,
      paddingBottom: 6,
      marginBottom: 4,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.pageBorder,
      paddingVertical: 5,
    },
    tableCell: {
      fontSize: 8,
      color: theme.textSecondary,
      flexGrow: 1,
      flexBasis: 0,
      paddingRight: 4,
    },
    tableHeaderCell: {
      fontSize: 8,
      color: theme.textMuted,
      fontWeight: 700,
      flexGrow: 1,
      flexBasis: 0,
      paddingRight: 4,
    },
    footer: {
      position: 'absolute',
      bottom: 24,
      left: 40,
      right: 40,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    footerText: {
      fontSize: 8,
      color: theme.textMuted,
    },
  });
}

function PageFooter({
  styles,
  title,
  pageLabel,
}: {
  styles: ReturnType<typeof buildStyles>;
  title: string;
  pageLabel: string;
}) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>Humanity Hub · {title}</Text>
      <Text style={styles.footerText}>{pageLabel}</Text>
    </View>
  );
}

function ScenePage({
  scene,
  theme,
  styles,
  docTitle,
}: {
  scene: ReportExportScene;
  theme: ReportThemeTokens;
  styles: ReturnType<typeof buildStyles>;
  docTitle: string;
}) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sceneNum}>{scene.num}</Text>
      <Text style={styles.sceneTitle}>{scene.title}</Text>
      <Text style={styles.sceneStat}>{scene.stat}</Text>
      <Text style={styles.sceneStatLbl}>{scene.statLbl}</Text>
      <Text style={styles.sceneBody}>{scene.body}</Text>
      {scene.bullets.map((b) => (
        <Text key={b} style={styles.bullet}>
          • {b}
        </Text>
      ))}
      <View style={styles.chartCard}>
        <Text style={styles.chartCap}>{scene.chartCap}</Text>
        <Text style={styles.chartTitle}>{scene.chartTitle}</Text>
        {scene.chart.kind === 'table' ? (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              {scene.chart.columns.map((col) => (
                <Text key={col} style={styles.tableHeaderCell}>
                  {col}
                </Text>
              ))}
            </View>
            {scene.chart.rows.map((row, idx) => (
              <View key={`r-${idx}`} style={styles.tableRow}>
                {row.map((cell, cIdx) => (
                  <Text key={`${idx}-${cIdx}`} style={styles.tableCell}>
                    {cell}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ) : (
          <PdfExportChart chart={scene.chart} theme={theme} />
        )}
      </View>
      <PageFooter styles={styles} title={docTitle} pageLabel={scene.num} />
    </Page>
  );
}

export function ExportPdfDocument({
  doc,
  theme,
}: {
  doc: ReportExportDocument;
  theme: ReportThemeTokens;
}) {
  const styles = buildStyles(theme);

  return (
    <Document title={doc.meta.title} author="Humanity Hub" subject={doc.meta.subtitle}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.coverBrand}>Humanity Hub</Text>
        <Text style={styles.coverTitle}>{doc.meta.title}</Text>
        <Text style={styles.coverSubtitle}>{doc.meta.subtitle}</Text>
        <Text style={styles.sectionLabel}>Applied filters</Text>
        <View style={styles.filterRow}>
          {doc.meta.filterLabels.map((f) => (
            <View key={f.label} style={styles.filterChip}>
              <Text style={styles.filterChipLabel}>{f.label}</Text>
              <Text style={styles.filterChipValue}>{f.value}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.timestamp}>Generated {doc.meta.generatedAt}</Text>
        <PageFooter styles={styles} title={doc.meta.title} pageLabel="Cover" />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.pageTitle}>KPI summary</Text>
        <View style={styles.kpiGrid}>
          {doc.kpis.map((kpi) => (
            <View key={kpi.label} style={styles.kpiCard}>
              <View style={[styles.kpiAccent, { backgroundColor: kpi.accent }]} />
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              <Text style={styles.kpiSub}>{kpi.sub}</Text>
            </View>
          ))}
        </View>
        <PageFooter styles={styles} title={doc.meta.title} pageLabel="KPIs" />
      </Page>

      {doc.scenes.map((scene) => (
        <ScenePage
          key={scene.num}
          scene={scene}
          theme={theme}
          styles={styles}
          docTitle={doc.meta.title}
        />
      ))}
    </Document>
  );
}
