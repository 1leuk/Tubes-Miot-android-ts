import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../constants/theme';
import { SystemStatus } from '../../types';

interface Props {
  status: SystemStatus;
  portalOpen: boolean;
  buzzerActive: boolean;
}

const STATUS_CONFIG: Record<SystemStatus, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
  desc: string;
}> = {
  normal: {
    label: 'Normal',
    color: COLORS.green,
    bg: COLORS.greenSoft,
    border: COLORS.greenBorder,
    icon: '✓',
    desc: 'Sistem berjalan normal. Tidak ada ancaman terdeteksi.',
  },
  warning: {
    label: 'Waspada',
    color: COLORS.amber,
    bg: COLORS.amberSoft,
    border: COLORS.amberBorder,
    icon: '!',
    desc: 'Asap atau gas terdeteksi oleh sensor MQ-2. Harap waspada.',
  },
  danger: {
    label: 'Darurat',
    color: COLORS.red,
    bg: COLORS.redSoft,
    border: COLORS.redBorder,
    icon: '!!',
    desc: 'API TERDETEKSI! Portal terbuka otomatis. Buzzer aktif. Segera evakuasi!',
  },
};

export default function SystemStatusWidget({ status, portalOpen, buzzerActive }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cfg = STATUS_CONFIG[status];

  useEffect(() => {
    if (status !== 'normal') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.01, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status]);

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: pulseAnim }] }, { borderLeftColor: cfg.color }]}>
      {/* Status row */}
      <View style={styles.topRow}>
        {/* Status icon */}
        <View style={[styles.iconCircle, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.iconText, { color: cfg.color }]}>{cfg.icon}</Text>
        </View>

        <View style={styles.textBlock}>
          <View style={styles.labelRow}>
            <View style={[styles.dot, { backgroundColor: cfg.color }]} />
            <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label.toUpperCase()}</Text>
          </View>
          <Text style={styles.descText}>{cfg.desc}</Text>
        </View>
      </View>

      {/* Actuator row */}
      <View style={styles.actuatorRow}>
        <View style={[styles.actuatorChip, portalOpen && { borderColor: cfg.color, backgroundColor: cfg.bg }]}>
          <View style={[styles.chipDot, { backgroundColor: portalOpen ? cfg.color : COLORS.textMuted }]} />
          <Text style={[styles.actuatorLabel, { color: portalOpen ? cfg.color : COLORS.textSecondary }]}>
            Portal: {portalOpen ? 'Terbuka' : 'Tertutup'}
          </Text>
        </View>

        <View style={[styles.actuatorChip, buzzerActive && { borderColor: COLORS.red, backgroundColor: COLORS.redSoft }]}>
          <View style={[styles.chipDot, { backgroundColor: buzzerActive ? COLORS.red : COLORS.textMuted }]} />
          <Text style={[styles.actuatorLabel, { color: buzzerActive ? COLORS.red : COLORS.textSecondary }]}>
            Buzzer: {buzzerActive ? 'Aktif' : 'Mati'}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
    fontWeight: '700',
  },
  textBlock: {
    flex: 1,
    gap: 6,
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
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  descText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  actuatorRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actuatorChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingVertical: 8,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.surfaceHigh,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  actuatorLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
