import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../constants/theme';

interface Props {
  distance: number;
  isOccupied: boolean;
}

export default function UltrasonicWidget({ distance, isOccupied }: Props) {
  const barAnim = useRef(new Animated.Value(0)).current;
  const dotAnim = useRef(new Animated.Value(0.4)).current;

  const MAX_CM = 400;
  const fillPct = Math.max(0, Math.min(1, 1 - distance / MAX_CM));

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: fillPct,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [fillPct]);

  useEffect(() => {
    if (isOccupied) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(dotAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      dotAnim.setValue(0.4);
    }
  }, [isOccupied]);

  const color = isOccupied ? COLORS.amber : COLORS.green;
  const colorSoft = isOccupied ? COLORS.amberSoft : COLORS.greenSoft;
  const barColor = isOccupied ? COLORS.amber : COLORS.chartBlue;

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.card, { flex: 1 }]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: colorSoft }]}>
          <Text style={[styles.iconEmoji, { color }]}>📡</Text>
        </View>
        <Text style={styles.cardLabel}>Ultrasonik</Text>
      </View>

      {/* Value */}
      <View style={styles.valueRow}>
        <Text style={[styles.valueNum, { color: COLORS.textPrimary }]}>{distance}</Text>
        <Text style={styles.valueUnit}>cm</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: barWidth, backgroundColor: barColor }]} />
      </View>

      {/* Status chip */}
      <View style={[styles.statusChip, { backgroundColor: colorSoft }]}>
        <Animated.View style={[styles.chipDot, { backgroundColor: color, opacity: dotAnim }]} />
        <Text style={[styles.statusText, { color }]}>
          {isOccupied ? 'Kendaraan Terdeteksi' : 'Slot Kosong'}
        </Text>
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
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  barFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
