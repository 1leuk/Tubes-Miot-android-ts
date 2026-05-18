import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../constants/theme';

interface Props {
  mq2Value: number;
  smokeDetected: boolean;
}

const THRESHOLD = 800;
const MAX_VAL = 4095;

export default function MQ2Widget({ mq2Value, smokeDetected }: Props) {
  const barAnim = useRef(new Animated.Value(0)).current;
  const fillPct = Math.min(mq2Value / MAX_VAL, 1);

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: fillPct,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [fillPct]);

  const color = smokeDetected ? COLORS.amber : COLORS.green;
  const colorSoft = smokeDetected ? COLORS.amberSoft : COLORS.greenSoft;
  const barColor =
    fillPct > 0.75 ? COLORS.red :
    fillPct > THRESHOLD / MAX_VAL ? COLORS.amber :
    COLORS.chartBlue;

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const safetyPct = Math.round((1 - fillPct) * 100);

  return (
    <View style={[styles.card, { flex: 1 }]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: colorSoft }]}>
          <Text style={styles.iconEmoji}>💨</Text>
        </View>
        <Text style={styles.cardLabel}>MQ-2 Gas</Text>
      </View>

      {/* Value */}
      <View style={styles.valueRow}>
        <Text style={styles.valueNum}>{mq2Value}</Text>
        <Text style={styles.valueUnit}>ADC</Text>
      </View>

      {/* Progress bar with threshold */}
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: barWidth, backgroundColor: barColor }]} />
        <View style={[styles.thresholdLine, { left: `${(THRESHOLD / MAX_VAL) * 100}%` as any }]} />
      </View>

      {/* Status chip */}
      <View style={[styles.statusChip, { backgroundColor: colorSoft }]}>
        <Text style={[styles.statusText, { color }]}>
          {smokeDetected ? 'Asap Terdeteksi' : 'Udara Bersih'}
        </Text>
      </View>

      <Text style={styles.safetyText}>Keamanan: {safetyPct}%</Text>
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
    ...SHADOW.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 18 },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    marginBottom: SPACING.sm,
  },
  valueNum: {
    fontSize: 34,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  valueUnit: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 5,
  },
  barTrack: {
    width: '100%',
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'visible',
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  barFill: {
    height: 5,
    borderRadius: RADIUS.full,
  },
  thresholdLine: {
    position: 'absolute',
    top: -3,
    width: 2,
    height: 11,
    backgroundColor: COLORS.amber,
    borderRadius: 1,
    opacity: 0.7,
  },
  statusChip: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  safetyText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
});
