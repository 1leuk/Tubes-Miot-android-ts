import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

interface Props {
  mq2Value: number;    // 0–4095 (analog ADC)
  smokeDetected: boolean;
}

const THRESHOLD = 800; // smoke alarm threshold
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

  const color = smokeDetected ? COLORS.amber : COLORS.cyan;
  const bg = smokeDetected ? COLORS.amberSoft : COLORS.cyanSoft;

  const barColor = fillPct > 0.75 ? COLORS.red : fillPct > THRESHOLD / MAX_VAL ? COLORS.amber : COLORS.cyan;

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // percentage safety level (inverted: 0% MQ2 = 100% safe)
  const safetyPct = Math.round((1 - fillPct) * 100);

  return (
    <View style={[styles.card, { flex: 1 }]}>
      <View style={[styles.iconBox, { backgroundColor: bg }]}>
        <Text style={[styles.icon, { color }]}>💨</Text>
      </View>
      <Text style={styles.label}>MQ-2 Asap/Gas</Text>
      <Text style={styles.valueLarge}>
        <Text style={[styles.num, { color }]}>{mq2Value}</Text>
        <Text style={styles.unit}> ADC</Text>
      </Text>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: barWidth, backgroundColor: barColor }]} />
        {/* Threshold marker */}
        <View style={[styles.thresholdLine, { left: `${(THRESHOLD / MAX_VAL) * 100}%` as any }]} />
      </View>
      <View style={[styles.statusChip, { backgroundColor: bg }]}>
        <Text style={[styles.statusText, { color }]}>
          {smokeDetected ? '⚠️ Asap Terdeteksi!' : '✅ Udara Bersih'}
        </Text>
      </View>
      <Text style={styles.safety}>Keamanan udara: {safetyPct}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  icon: { fontSize: 22 },
  label: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  valueLarge: { marginBottom: SPACING.sm },
  num: { fontSize: 32, fontWeight: '900' },
  unit: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  barTrack: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'visible',
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  barFill: { height: 6, borderRadius: RADIUS.full },
  thresholdLine: {
    position: 'absolute',
    top: -3,
    width: 2,
    height: 12,
    backgroundColor: COLORS.amber,
    borderRadius: 1,
  },
  statusChip: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 4,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  safety: { fontSize: 10, color: COLORS.textMuted },
});
