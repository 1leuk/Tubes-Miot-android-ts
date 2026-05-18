import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../constants/theme';

interface Props {
  mq2History: number[];
  ultraHistory: number[];
}

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_H = 80;

function Sparkline({ values, color, maxVal }: { values: number[]; color: string; maxVal: number }) {
  if (values.length < 2) return null;
  const w = SCREEN_W - SPACING.md * 2 - SPACING.md * 2 - 2; // account for card and chart padding
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
    <View style={{ height: CHART_H, position: 'relative' }}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((pct, i) => (
        <View
          key={`g${i}`}
          style={{
            position: 'absolute',
            top: CHART_H * (1 - pct),
            left: 0, right: 0,
            height: 1,
            backgroundColor: COLORS.border,
          }}
        />
      ))}

      {/* Line segments */}
      {segments.map((seg, i) => {
        const dx = seg.x1 - seg.x0;
        const dy = seg.y1 - seg.y0;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const isRecent = i >= segments.length - 5;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: seg.x0,
              top: seg.y0,
              width: length,
              height: 2,
              backgroundColor: color,
              opacity: isRecent ? 1 : 0.35,
              borderRadius: 1,
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: '0 0',
            }}
          />
        );
      })}

      {/* Last value dot */}
      {normalized.length > 0 && (() => {
        const lastY = normalized[normalized.length - 1];
        return (
          <View
            style={{
              position: 'absolute',
              left: (normalized.length - 1) * stepX - 4,
              top: CHART_H - lastY * CHART_H - 4,
              width: 8, height: 8,
              borderRadius: 4,
              backgroundColor: color,
              borderWidth: 2,
              borderColor: COLORS.surface,
            }}
          />
        );
      })()}
    </View>
  );
}

export default function SensorChartWidget({ mq2History, ultraHistory }: Props) {
  const lastMq2 = mq2History[mq2History.length - 1] ?? 0;
  const lastUltra = ultraHistory[ultraHistory.length - 1] ?? 0;

  return (
    <View style={styles.card}>
      {/* MQ-2 */}
      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <View style={styles.labelRow}>
            <View style={[styles.dot, { backgroundColor: COLORS.chartOrange }]} />
            <Text style={[styles.chartLabel, { color: COLORS.chartOrange }]}>MQ-2 Asap/Gas</Text>
          </View>
          <Text style={[styles.currentVal, { color: COLORS.chartOrange }]}>{lastMq2} ADC</Text>
        </View>
        <View style={styles.chartArea}>
          <Sparkline values={mq2History} color={COLORS.chartOrange} maxVal={4095} />
        </View>
      </View>

      <View style={styles.separator} />

      {/* Ultrasonic */}
      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <View style={styles.labelRow}>
            <View style={[styles.dot, { backgroundColor: COLORS.chartBlue }]} />
            <Text style={[styles.chartLabel, { color: COLORS.chartBlue }]}>Ultrasonik</Text>
          </View>
          <Text style={[styles.currentVal, { color: COLORS.chartBlue }]}>{lastUltra} cm</Text>
        </View>
        <View style={styles.chartArea}>
          <Sparkline values={ultraHistory} color={COLORS.chartBlue} maxVal={400} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  chartSection: {
    marginBottom: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  currentVal: {
    fontSize: 16,
    fontWeight: '700',
  },
  chartArea: {
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    overflow: 'hidden',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
});
