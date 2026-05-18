import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../constants/theme';

interface Props {
  flameDetected: boolean;
}

export default function FlameWidget({ flameDetected }: Props) {
  const dotAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (flameDetected) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(dotAnim, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      dotAnim.setValue(0.4);
    }
  }, [flameDetected]);

  const color = flameDetected ? COLORS.red : COLORS.green;
  const colorSoft = flameDetected ? COLORS.redSoft : COLORS.greenSoft;

  return (
    <View style={[styles.card, { flex: 1 }]}>
      <View style={styles.inner}>
        {/* Icon */}
        <View style={[styles.iconBox, { backgroundColor: colorSoft }]}>
          <Text style={styles.iconEmoji}>{flameDetected ? '🔥' : '🔍'}</Text>
        </View>

        {/* Info */}
        <View style={styles.infoBlock}>
          <Text style={styles.cardLabel}>Flame Sensor</Text>

          <View style={styles.statusRow}>
            <Animated.View style={[styles.dot, { backgroundColor: color, opacity: dotAnim }]} />
            <Text style={[styles.statusText, { color }]}>
              {flameDetected ? 'Api Terdeteksi!' : 'Aman'}
            </Text>
          </View>

          <Text style={styles.hintText}>
            {flameDetected
              ? 'Segera ambil tindakan darurat!'
              : 'Tidak ada nyala api terdeteksi.'}
          </Text>
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
    ...SHADOW.sm,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 26 },
  infoBlock: {
    flex: 1,
    gap: 5,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '700',
  },
  hintText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});
