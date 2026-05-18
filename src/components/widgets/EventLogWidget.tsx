import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { LogEntry } from '../../types';
import CrystalCard from '../geometry/CrystalCard';

interface Props {
  logs: LogEntry[];
}

const TYPE_CONFIG = {
  info:    { color: COLORS.violet, bg: COLORS.violetSoft, shape: '◆' },
  warning: { color: COLORS.gold,   bg: COLORS.goldSoft,   shape: '◈' },
  danger:  { color: COLORS.magenta, bg: COLORS.magentaSoft, shape: '◇' },
  normal:  { color: COLORS.cyan,   bg: COLORS.cyanSoft,   shape: '◆' },
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
}

export default function EventLogWidget({ logs }: Props) {
  return (
    <CrystalCard accentColor={COLORS.violet} glowColor={COLORS.violetGlow} cutCorner="topRight">
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: COLORS.violetSoft }]}>
          <Text style={styles.headerEmoji}>◈</Text>
        </View>
        <View>
          <Text style={styles.title}>Log Kejadian</Text>
          <Text style={styles.subtitle}>{logs.length} entri terbaru</Text>
        </View>
      </View>

      {logs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Belum ada kejadian tercatat.</Text>
        </View>
      ) : (
        logs.map((entry, idx) => {
          const cfg = TYPE_CONFIG[entry.type];
          return (
            <View key={entry.id} style={[styles.logRow, idx < logs.length - 1 && styles.logRowBorder]}>
              {/* Timeline node — diamond */}
              <View style={styles.timelineCol}>
                <View style={[styles.timelineDot, { borderColor: cfg.color }]}>
                  <Text style={[styles.timelineShape, { color: cfg.color }]}>{cfg.shape}</Text>
                </View>
                {idx < logs.length - 1 && <View style={[styles.timelineLine, { backgroundColor: cfg.color }]} />}
              </View>

              {/* Content */}
              <View style={styles.logContent}>
                <Text style={styles.logMessage}>{entry.message}</Text>
                <View style={styles.logMeta}>
                  <Text style={styles.logTime}>{formatTime(entry.timestamp)}</Text>
                  <View style={[styles.typeBadge, { backgroundColor: cfg.bg, borderColor: cfg.color }]}>
                    <Text style={[styles.typeBadgeText, { color: cfg.color }]}>{entry.type.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })
      )}
    </CrystalCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerIcon: {
    width: 36, height: 36, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  headerEmoji: { fontSize: 16, color: COLORS.violet, fontWeight: '900' },
  title: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  subtitle: { fontSize: 10, color: COLORS.textSecondary },
  empty: { padding: SPACING.lg, alignItems: 'center' },
  emptyText: { color: COLORS.textMuted, fontSize: 12 },
  logRow: {
    flexDirection: 'row', gap: SPACING.sm,
    paddingVertical: 8,
  },
  logRowBorder: { borderBottomWidth: 0 },
  timelineCol: { alignItems: 'center', width: 28 },
  timelineDot: {
    width: 20, height: 20,
    transform: [{ rotate: '45deg' }],
    borderWidth: 1.5, borderRadius: 4,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bg,
  },
  timelineShape: {
    fontSize: 8, fontWeight: '900',
    transform: [{ rotate: '-45deg' }],
  },
  timelineLine: {
    width: 1, flex: 1, marginTop: 4, opacity: 0.2,
  },
  logContent: { flex: 1 },
  logMessage: { fontSize: 11, color: COLORS.textPrimary, lineHeight: 16 },
  logMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  logTime: { fontSize: 9, color: COLORS.textMuted },
  typeBadge: {
    borderWidth: 1, borderRadius: RADIUS.sm,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  typeBadgeText: { fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
});
