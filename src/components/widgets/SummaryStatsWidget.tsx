import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

interface StatItem {
  label: string;
  value: string | number;
  color: string;
  bg: string;
  icon: string;
}

interface Props {
  totalVehicles: number;
  totalAlerts: number;
  uptimeMinutes: number;
  lastUpdate: Date;
}

export default function SummaryStatsWidget({ totalVehicles, totalAlerts, uptimeMinutes, lastUpdate }: Props) {
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const stats: StatItem[] = [
    { label: 'Kendaraan\nTercatat', value: totalVehicles, color: COLORS.violet, bg: COLORS.violetSoft, icon: '◆' },
    { label: 'Alert\nTerpicu', value: totalAlerts, color: totalAlerts > 0 ? COLORS.magenta : COLORS.cyan, bg: totalAlerts > 0 ? COLORS.magentaSoft : COLORS.cyanSoft, icon: totalAlerts > 0 ? '◈' : '◇' },
    { label: 'Uptime\n(menit)', value: uptimeMinutes, color: COLORS.cyan, bg: COLORS.cyanSoft, icon: '◇' },
  ];

  const formatLastUpdate = (d: Date) =>
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {stats.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && (
              <View style={styles.dividerWrap}>
                <View style={[styles.dividerDot, { backgroundColor: COLORS.violet }]} />
                <View style={[styles.dividerLine, { backgroundColor: COLORS.border }]} />
                <View style={[styles.dividerDot, { backgroundColor: COLORS.violet }]} />
              </View>
            )}
            <View style={styles.statItem}>
              {/* Diamond icon */}
              <View style={[styles.diamondIcon, { borderColor: s.color }]}>
                <Text style={[styles.diamondText, { color: s.color }]}>{s.icon}</Text>
              </View>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>
      {/* Footer with geometric accents */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <View style={[styles.footerDiamond, { backgroundColor: COLORS.cyan }]} />
          <Text style={styles.footerText}>Update: {formatLastUpdate(lastUpdate)}</Text>
        </View>
        <Animated.View style={[styles.liveDot, { backgroundColor: COLORS.cyan, opacity: pulseAnim }]} />
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
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: SPACING.md,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  diamondIcon: {
    width: 36, height: 36,
    transform: [{ rotate: '45deg' }],
    borderWidth: 1.5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  diamondText: {
    fontSize: 14,
    fontWeight: '900',
    transform: [{ rotate: '-45deg' }],
  },
  statValue: { fontSize: 24, fontWeight: '900' },
  statLabel: {
    fontSize: 9, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 13,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  dividerWrap: {
    alignItems: 'center', gap: 4,
  },
  dividerDot: {
    width: 4, height: 4, borderRadius: 1,
    transform: [{ rotate: '45deg' }], opacity: 0.4,
  },
  dividerLine: { width: 1, height: 40 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerDiamond: {
    width: 5, height: 5,
    transform: [{ rotate: '45deg' }],
    borderRadius: 1,
  },
  footerText: { fontSize: 10, color: COLORS.textSecondary },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
});
