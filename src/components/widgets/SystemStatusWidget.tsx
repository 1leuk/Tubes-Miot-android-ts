import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../constants/theme';
import { SystemStatus } from '../../types';

type OverrideState = 'auto' | 'manual-open' | 'manual-closed';
type BuzzerOverrideState = 'auto' | 'manual-on' | 'manual-off';

interface Props {
  status: SystemStatus;
  portalOpen: boolean;
  buzzerActive: boolean;
  portalOverride: OverrideState;
  buzzerOverride: BuzzerOverrideState;
  onPortalToggle: (open: boolean) => void;
  onPortalReset: () => void;
  onBuzzerToggle: (active: boolean) => void;
  onBuzzerReset: () => void;
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

export default function SystemStatusWidget({
  status, portalOpen, buzzerActive,
  portalOverride, buzzerOverride,
  onPortalToggle, onPortalReset,
  onBuzzerToggle, onBuzzerReset,
}: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cfg = STATUS_CONFIG[status];

  const isPortalManual = portalOverride !== 'auto';
  const isBuzzerManual = buzzerOverride !== 'auto';

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

      {/* ── Status row ── */}
      <View style={styles.topRow}>
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

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Portal Control ── */}
      <View style={styles.actuatorBlock}>
        <View style={styles.actuatorLabelRow}>
          <Text style={styles.actuatorTitle}>🚧  Portal</Text>
          <View style={styles.actuatorBadgeRow}>
            {/* State badge */}
            <View style={[
              styles.stateBadge,
              { backgroundColor: portalOpen ? COLORS.greenSoft : COLORS.accentSoft },
            ]}>
              <View style={[
                styles.stateDot,
                { backgroundColor: portalOpen ? COLORS.green : COLORS.textMuted },
              ]} />
              <Text style={[
                styles.stateBadgeText,
                { color: portalOpen ? COLORS.green : COLORS.textSecondary },
              ]}>
                {portalOpen ? 'Terbuka' : 'Tertutup'}
              </Text>
            </View>
            {/* Override label */}
            {isPortalManual && (
              <View style={styles.overrideBadge}>
                <Text style={styles.overrideBadgeText}>Override Manual</Text>
              </View>
            )}
            {!isPortalManual && (
              <View style={styles.autoBadge}>
                <Text style={styles.autoBadgeText}>Otomatis</Text>
              </View>
            )}
          </View>
        </View>

        {/* Portal buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btn, portalOpen && !isPortalManual ? styles.btnActiveGreen :
              portalOpen && isPortalManual ? styles.btnActiveGreen : styles.btnInactive]}
            onPress={() => onPortalToggle(true)}
            activeOpacity={0.75}
          >
            <Text style={[styles.btnText, portalOpen ? styles.btnTextActive : styles.btnTextInactive]}>
              Buka
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, !portalOpen && isPortalManual ? styles.btnActiveRed :
              !portalOpen && !isPortalManual ? styles.btnInactive : styles.btnInactive]}
            onPress={() => onPortalToggle(false)}
            activeOpacity={0.75}
          >
            <Text style={[styles.btnText, !portalOpen && isPortalManual ? styles.btnTextActive : styles.btnTextInactive]}>
              Tutup
            </Text>
          </TouchableOpacity>

          {isPortalManual && (
            <TouchableOpacity
              style={styles.btnReset}
              onPress={onPortalReset}
              activeOpacity={0.75}
            >
              <Text style={styles.btnResetText}>↺ Otomatis</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Buzzer Control ── */}
      <View style={[styles.actuatorBlock, { marginBottom: 0 }]}>
        <View style={styles.actuatorLabelRow}>
          <Text style={styles.actuatorTitle}>🔔  Buzzer</Text>
          <View style={styles.actuatorBadgeRow}>
            {/* State badge */}
            <View style={[
              styles.stateBadge,
              { backgroundColor: buzzerActive ? COLORS.redSoft : COLORS.accentSoft },
            ]}>
              <View style={[
                styles.stateDot,
                { backgroundColor: buzzerActive ? COLORS.red : COLORS.textMuted },
              ]} />
              <Text style={[
                styles.stateBadgeText,
                { color: buzzerActive ? COLORS.red : COLORS.textSecondary },
              ]}>
                {buzzerActive ? 'Aktif' : 'Mati'}
              </Text>
            </View>
            {/* Override label */}
            {isBuzzerManual && (
              <View style={styles.overrideBadge}>
                <Text style={styles.overrideBadgeText}>Override Manual</Text>
              </View>
            )}
            {!isBuzzerManual && (
              <View style={styles.autoBadge}>
                <Text style={styles.autoBadgeText}>Otomatis</Text>
              </View>
            )}
          </View>
        </View>

        {/* Buzzer buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btn, buzzerActive && isBuzzerManual ? styles.btnActiveRed : styles.btnInactive]}
            onPress={() => onBuzzerToggle(true)}
            activeOpacity={0.75}
          >
            <Text style={[styles.btnText, buzzerActive && isBuzzerManual ? styles.btnTextActive : styles.btnTextInactive]}>
              Aktifkan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, !buzzerActive && isBuzzerManual ? styles.btnActiveGray : styles.btnInactive]}
            onPress={() => onBuzzerToggle(false)}
            activeOpacity={0.75}
          >
            <Text style={[styles.btnText, !buzzerActive && isBuzzerManual ? styles.btnTextActive : styles.btnTextInactive]}>
              Matikan
            </Text>
          </TouchableOpacity>

          {isBuzzerManual && (
            <TouchableOpacity
              style={styles.btnReset}
              onPress={onBuzzerReset}
              activeOpacity={0.75}
            >
              <Text style={styles.btnResetText}>↺ Otomatis</Text>
            </TouchableOpacity>
          )}
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

  // ── Status section ──
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
    gap: 5,
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

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.sm,
  },

  // ── Actuator blocks ──
  actuatorBlock: {
    marginBottom: SPACING.sm,
  },
  actuatorLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actuatorTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  actuatorBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  // State badge (terbuka/tertutup/aktif/mati)
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stateBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Override label
  overrideBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: COLORS.amberSoft,
    borderWidth: 1,
    borderColor: COLORS.amberBorder,
  },
  overrideBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.amber,
    letterSpacing: 0.2,
  },

  // Auto label
  autoBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: COLORS.accentSoft,
  },
  autoBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // ── Buttons ──
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  btn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  btnInactive: {
    backgroundColor: COLORS.surfaceHigh,
    borderColor: COLORS.border,
  },
  btnActiveGreen: {
    backgroundColor: COLORS.greenSoft,
    borderColor: COLORS.greenBorder,
  },
  btnActiveRed: {
    backgroundColor: COLORS.redSoft,
    borderColor: COLORS.redBorder,
  },
  btnActiveGray: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.border,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  btnTextActive: {
    color: COLORS.textPrimary,
  },
  btnTextInactive: {
    color: COLORS.textMuted,
  },
  btnReset: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceHigh,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  btnResetText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
