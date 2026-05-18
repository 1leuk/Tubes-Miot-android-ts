import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import CrystalCard from '../geometry/CrystalCard';
import DiamondFrame from '../geometry/DiamondFrame';

interface Props {
  flameDetected: boolean;
}

export default function FlameWidget({ flameDetected }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (flameDetected) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      );
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ])
      );
      pulse.start();
      glow.start();
      return () => { pulse.stop(); glow.stop(); };
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0.4);
    }
  }, [flameDetected]);

  const color = flameDetected ? COLORS.magenta : COLORS.cyan;
  const glow = flameDetected ? COLORS.magentaGlow : COLORS.cyanGlow;
  const soft = flameDetected ? COLORS.magentaSoft : COLORS.cyanSoft;

  return (
    <View style={{ flex: 1 }}>
      <CrystalCard accentColor={color} glowColor={glow} cutCorner="both">
        <Animated.View style={[styles.inner, { transform: [{ scale: pulseAnim }] }]}>
          <DiamondFrame size={52} color={color} glowColor={glow} spinning={flameDetected}>
            <Animated.Text style={[styles.iconText, { opacity: flameDetected ? glowAnim : 1 }]}>
              {flameDetected ? '◆' : '◇'}
            </Animated.Text>
          </DiamondFrame>

          <View style={styles.infoBlock}>
            <View style={styles.labelRow}>
              <View style={[styles.labelDiamond, { backgroundColor: color }]} />
              <Text style={styles.label}>FLAME SENSOR</Text>
            </View>

            <View style={[styles.statusBox, { backgroundColor: soft, borderColor: color }]}>
              <Text style={[styles.statusText, { color }]}>
                {flameDetected ? '◆ API TERDETEKSI' : '◇ AMAN'}
              </Text>
            </View>

            <Text style={styles.hint}>
              {flameDetected ? 'Segera ambil tindakan darurat!' : 'Tidak ada nyala api terdeteksi.'}
            </Text>
          </View>
        </Animated.View>
      </CrystalCard>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.magenta,
  },
  infoBlock: {
    flex: 1,
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelDiamond: {
    width: 5,
    height: 5,
    transform: [{ rotate: '45deg' }],
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },
  statusBox: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  hint: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
});
