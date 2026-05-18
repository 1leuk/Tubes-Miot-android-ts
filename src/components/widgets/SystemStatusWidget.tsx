import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { SystemStatus } from '../../types';
import CrystalCard from '../geometry/CrystalCard';
import DiamondFrame from '../geometry/DiamondFrame';
import HexBadge from '../geometry/HexBadge';

interface Props {
  status: SystemStatus;
  portalOpen: boolean;
  buzzerActive: boolean;
}

const STATUS_CONFIG: Record<SystemStatus, {
  label: string; color: string; bg: string; glow: string; icon: string; desc: string;
}> = {
  normal: {
    label: 'NORMAL',
    color: COLORS.cyan,
    bg: COLORS.cyanSoft,
    glow: COLORS.cyanGlow,
    icon: '◆',
    desc: 'Sistem berjalan normal. Tidak ada ancaman terdeteksi.',
  },
  warning: {
    label: 'WASPADA',
    color: COLORS.gold,
    bg: COLORS.goldSoft,
    glow: COLORS.orangeGlow,
    icon: '◈',
    desc: 'Asap/gas terdeteksi oleh sensor MQ-2. Harap waspada!',
  },
  danger: {
    label: 'DARURAT',
    color: COLORS.magenta,
    bg: COLORS.magentaSoft,
    glow: COLORS.magentaGlow,
    icon: '◇',
    desc: 'API TERDETEKSI! Portal terbuka. Buzzer aktif. Segera evakuasi!',
  },
};

export default function SystemStatusWidget({ status, portalOpen, buzzerActive }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const cfg = STATUS_CONFIG[status];

  useEffect(() => {
    if (status !== 'normal') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 0.8, duration: 600, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();
      glow.start();
      return () => { pulse.stop(); glow.stop(); };
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0.3);
    }
  }, [status]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <CrystalCard accentColor={cfg.color} glowColor={cfg.glow} cutCorner="both">
        <View style={styles.inner}>
          {/* Diamond icon */}
          <DiamondFrame size={48} color={cfg.color} glowColor={cfg.glow} spinning={status !== 'normal'}>
            <Text style={[styles.iconText, { color: cfg.color }]}>{cfg.icon}</Text>
          </DiamondFrame>

          <View style={styles.textBlock}>
            <HexBadge label={`● ${cfg.label}`} color={cfg.color} bg={cfg.bg} />
            <Text style={styles.descText}>{cfg.desc}</Text>
          </View>
        </View>

        {/* Actuator row with geometric chips */}
        <View style={styles.actuatorRow}>
          <View style={[styles.actuatorChip, { borderColor: portalOpen ? cfg.color : COLORS.border }]}>
            <View style={[styles.chipDot, { backgroundColor: portalOpen ? cfg.color : COLORS.textMuted }]} />
            <Text style={[styles.actuatorLabel, { color: portalOpen ? cfg.color : COLORS.textSecondary }]}>
              Portal: {portalOpen ? 'TERBUKA' : 'TERTUTUP'}
            </Text>
          </View>
          <View style={[styles.chipConnector, { backgroundColor: cfg.color }]} />
          <View style={[styles.actuatorChip, { borderColor: buzzerActive ? COLORS.magenta : COLORS.border }]}>
            <View style={[styles.chipDot, { backgroundColor: buzzerActive ? COLORS.magenta : COLORS.textMuted }]} />
            <Text style={[styles.actuatorLabel, { color: buzzerActive ? COLORS.magenta : COLORS.textSecondary }]}>
              Buzzer: {buzzerActive ? 'AKTIF' : 'MATI'}
            </Text>
          </View>
        </View>
      </CrystalCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  iconText: {
    fontSize: 20,
    fontWeight: '900',
  },
  textBlock: {
    flex: 1,
    gap: 8,
  },
  descText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  actuatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  actuatorChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingVertical: 8,
    backgroundColor: COLORS.bg,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipConnector: {
    width: 12,
    height: 2,
    opacity: 0.3,
  },
  actuatorLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
