import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../constants/theme';

interface Props {
  totalVehicles: number;
  totalAlerts: number;
  uptimeMinutes: number;
  lastUpdate: Date;
}

interface StatItem {
  label: string;
  value: string | number;
  color: string;
  bg: string;
  icon: string;
}

export default function SummaryStatsWidget({ totalVehicles, totalAlerts, uptimeMinutes, lastUpdate }: Props) {
  const dotAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const stats: StatItem[] = [
    {
      label: 'Kendaraan',
      value: totalVehicles,
      color: COLORS.chartBlue,
      bg: COLORS.chartBlueSoft,
      icon: '🚗',
    },
    {
      label: 'Peringatan',
      value: totalAlerts,
      color: totalAlerts > 0 ? COLORS.red : COLORS.textSecondary,
      bg: totalAlerts > 0 ? COLORS.redSoft : COLORS.surfaceHigh,
      icon: '⚠️',
    },
    {
      label: 'Uptime (m)',
      value: uptimeMinutes,
      color: COLORS.green,
      bg: COLORS.greenSoft,
      icon: '⏱️',
    },
  ];

  const formatLastUpdate = (d: Date) =>
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  return (
    <View style={styles.card}>
      {/* Stat items */}
      <View style={styles.statsRow}>
        {stats.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && <View style={styles.divider} />}
            <View style={styles.statItem}>
              <View style={[styles.iconBox, { backgroundColor: s.bg }]}>
                <Text style={styles.iconEmoji}>{s.icon}</Text>
              </View>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Animated.View style={[styles.liveDot, { opacity: dotAnim }]} />
          <Text style={styles.liveText}>Live</Text>
          <Text style={styles.footerText}>· Update: {formatLastUpdate(lastUpdate)}</Text>
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
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  statsRow: {
    flexDirection: 'row',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconEmoji: { fontSize: 20 },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surfaceHigh,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.green,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
