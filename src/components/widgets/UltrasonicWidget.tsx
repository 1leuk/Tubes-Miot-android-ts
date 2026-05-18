import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import CrystalCard from '../geometry/CrystalCard';
import OrbitalRing from '../geometry/OrbitalRing';

interface Props {
  distance: number;
  isOccupied: boolean;
}

export default function UltrasonicWidget({ distance, isOccupied }: Props) {
  const barAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isOccupied]);

  const color = isOccupied ? COLORS.violet : COLORS.cyan;
  const glow = isOccupied ? COLORS.violetGlow : COLORS.cyanGlow;
  const soft = isOccupied ? COLORS.violetSoft : COLORS.cyanSoft;

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={{ flex: 1 }}>
      <CrystalCard accentColor={color} glowColor={glow}>
        <Animated.View style={{ alignItems: 'center', transform: [{ scale: pulseAnim }] }}>
          {/* Orbital scanner around value */}
          <OrbitalRing size={100} color={color} dotCount={8} speed={isOccupied ? 3000 : 8000}>
            <View style={styles.valueCenter}>
              <Text style={[styles.valueNum, { color }]}>{distance}</Text>
              <Text style={styles.valueUnit}>cm</Text>
            </View>
          </OrbitalRing>

          {/* Label */}
          <View style={styles.labelRow}>
            <View style={[styles.labelDot, { backgroundColor: color }]} />
            <Text style={styles.label}>ULTRASONIK</Text>
            <View style={[styles.labelDot, { backgroundColor: color }]} />
          </View>

          {/* Geometric progress — trapezoidal bar */}
          <View style={styles.barOuter}>
            <View style={[styles.barTrack, { borderColor: color }]}>
              <Animated.View style={[styles.barFill, { width: barWidth, backgroundColor: color }]} />
            </View>
            {/* Corner dots */}
            <View style={[styles.cornerDot, styles.cornerTL, { backgroundColor: color }]} />
            <View style={[styles.cornerDot, styles.cornerTR, { backgroundColor: color }]} />
            <View style={[styles.cornerDot, styles.cornerBL, { backgroundColor: color }]} />
            <View style={[styles.cornerDot, styles.cornerBR, { backgroundColor: color }]} />
          </View>

          {/* Status badge */}
          <View style={[styles.statusBadge, { backgroundColor: soft, borderColor: color }]}>
            <Text style={[styles.statusText, { color }]}>
              {isOccupied ? '◆ KENDARAAN TERDETEKSI' : '◇ SLOT KOSONG'}
            </Text>
          </View>
        </Animated.View>
      </CrystalCard>
    </View>
  );
}

const styles = StyleSheet.create({
  valueCenter: {
    alignItems: 'center',
  },
  valueNum: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -1,
  },
  valueUnit: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 10,
  },
  labelDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },
  barOuter: {
    width: '100%',
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  barTrack: {
    width: '100%',
    height: 8,
    borderWidth: 1,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: COLORS.bg,
  },
  barFill: {
    height: '100%',
    borderRadius: 1,
    opacity: 0.8,
  },
  cornerDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 1,
    opacity: 0.6,
  },
  cornerTL: { top: -2, left: -2 },
  cornerTR: { top: -2, right: -2 },
  cornerBL: { bottom: -2, left: -2 },
  cornerBR: { bottom: -2, right: -2 },
  statusBadge: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
