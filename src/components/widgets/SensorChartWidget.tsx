import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import CrystalCard from '../geometry/CrystalCard';

interface Props {
  mq2History: number[];
  ultraHistory: number[];
}

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_H = 90;

function GeometricSparkline({ values, color, maxVal }: { values: number[]; color: string; maxVal: number }) {
  if (values.length < 2) return null;
  const w = SCREEN_W - 72 - SPACING.md * 2;
  const n = values.length;
  const stepX = w / (n - 1);
  const normalized = values.map(v => Math.min(v / maxVal, 1));

  const segments = normalized.slice(0, -1).map((y0, i) => {
    const y1 = normalized[i + 1];
    const x0 = i * stepX;
    const x1 = (i + 1) * stepX;
    const cy0 = CHART_H - y0 * CHART_H;
    const cy1 = CHART_H - y1 * CHART_H;
    return { x0, y0: cy0, x1, y1: cy1 };
  });

  return (
    <View style={{ height: CHART_H, width: w, position: 'relative' }}>
      {/* Grid lines — dashed style via segments */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
        <View key={`g${i}`} style={{ position: 'absolute', top: CHART_H * (1 - pct), left: 0, right: 0, height: 1, backgroundColor: COLORS.border, opacity: 0.4 }} />
      ))}

      {/* Line segments */}
      {segments.map((seg, i) => {
        const dx = seg.x1 - seg.x0;
        const dy = seg.y1 - seg.y0;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View
            key={i}
            style={{
              position: 'absolute', left: seg.x0, top: seg.y0,
              width: length, height: 2,
              backgroundColor: color,
              opacity: 0.6 + (i / segments.length) * 0.4,
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: '0 0',
            }}
          />
        );
      })}

      {/* Diamond dots on each value */}
      {normalized.map((y, i) => {
        const isLast = i === normalized.length - 1;
        const dotSize = isLast ? 8 : 5;
        return (
          <View
            key={`d${i}`}
            style={{
              position: 'absolute',
              left: i * stepX - dotSize / 2,
              top: CHART_H - y * CHART_H - dotSize / 2,
              width: dotSize, height: dotSize,
              backgroundColor: color,
              transform: [{ rotate: '45deg' }],
              borderRadius: 1,
              opacity: isLast ? 1 : 0.35,
            }}
          />
        );
      })}
    </View>
  );
}

export default function SensorChartWidget({ mq2History, ultraHistory }: Props) {
  const lastMq2 = mq2History[mq2History.length - 1] ?? 0;
  const lastUltra = ultraHistory[ultraHistory.length - 1] ?? 0;

  return (
    <CrystalCard accentColor={COLORS.violet} glowColor={COLORS.violetGlow} cutCorner="topRight">
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: COLORS.violetSoft }]}>
          <Text style={styles.headerEmoji}>◈</Text>
        </View>
        <View>
          <Text style={styles.title}>Grafik Sensor</Text>
          <Text style={styles.subtitle}>Riwayat pembacaan real-time</Text>
        </View>
      </View>

      {/* MQ-2 Chart */}
      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <View style={styles.chartLabelRow}>
            <View style={[styles.labelDiamond, { backgroundColor: COLORS.orange }]} />
            <Text style={[styles.chartLabel, { color: COLORS.orange }]}>MQ-2 (ADC)</Text>
          </View>
          <Text style={[styles.chartCurrent, { color: COLORS.orange }]}>{lastMq2}</Text>
        </View>
        <View style={styles.chartArea}>
          <GeometricSparkline values={mq2History} color={COLORS.orange} maxVal={4095} />
        </View>
      </View>

      {/* Divider line */}
      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: COLORS.violet }]} />
        <View style={[styles.dividerDot, { backgroundColor: COLORS.violet }]} />
        <View style={[styles.dividerLine, { backgroundColor: COLORS.violet }]} />
      </View>

      {/* Ultrasonic Chart */}
      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <View style={styles.chartLabelRow}>
            <View style={[styles.labelDiamond, { backgroundColor: COLORS.cyan }]} />
            <Text style={[styles.chartLabel, { color: COLORS.cyan }]}>Ultrasonic (cm)</Text>
          </View>
          <Text style={[styles.chartCurrent, { color: COLORS.cyan }]}>{lastUltra} cm</Text>
        </View>
        <View style={styles.chartArea}>
          <GeometricSparkline values={ultraHistory} color={COLORS.cyan} maxVal={400} />
        </View>
      </View>
    </CrystalCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  headerIcon: {
    width: 36, height: 36, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  headerEmoji: { fontSize: 18, color: COLORS.violet, fontWeight: '900' },
  title: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  subtitle: { fontSize: 10, color: COLORS.textSecondary },
  chartSection: { marginBottom: 4 },
  chartHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  chartLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  labelDiamond: { width: 6, height: 6, transform: [{ rotate: '45deg' }], borderRadius: 1 },
  chartLabel: { fontSize: 11, fontWeight: '700' },
  chartCurrent: { fontSize: 18, fontWeight: '900' },
  chartArea: {
    height: CHART_H,
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
    overflow: 'hidden',
  },
  divider: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    marginVertical: 8,
  },
  dividerLine: { flex: 1, height: 1, opacity: 0.2 },
  dividerDot: { width: 5, height: 5, borderRadius: 1, transform: [{ rotate: '45deg' }], opacity: 0.4 },
});
