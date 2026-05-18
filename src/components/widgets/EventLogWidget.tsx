import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../constants/theme';
import { LogEntry } from '../../types';

interface Props {
  logs: LogEntry[];
}

const TYPE_CONFIG = {
  info:    { color: COLORS.chartBlue,  bg: COLORS.chartBlueSoft,  label: 'Info' },
  warning: { color: COLORS.amber,      bg: COLORS.amberSoft,      label: 'Waspada' },
  danger:  { color: COLORS.red,        bg: COLORS.redSoft,        label: 'Darurat' },
  normal:  { color: COLORS.green,      bg: COLORS.greenSoft,      label: 'Normal' },
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
}

export default function EventLogWidget({ logs }: Props) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: COLORS.accentSoft }]}>
          <Text style={styles.headerEmoji}>📋</Text>
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
              {/* Timeline */}
              <View style={styles.timelineCol}>
                <View style={[styles.timelineDot, { backgroundColor: cfg.color }]} />
                {idx < logs.length - 1 && <View style={styles.timelineLine} />}
              </View>

              {/* Content */}
              <View style={styles.logContent}>
                <Text style={styles.logMessage}>{entry.message}</Text>
                <View style={styles.logMeta}>
                  <Text style={styles.logTime}>{formatTime(entry.timestamp)}</Text>
                  <View style={[styles.typeBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.typeBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })
      )}
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
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEmoji: { fontSize: 18 },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  empty: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  logRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  logRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  timelineCol: {
    alignItems: 'center',
    width: 20,
    paddingTop: 4,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineLine: {
    width: 1,
    flex: 1,
    backgroundColor: COLORS.border,
    marginTop: 4,
  },
  logContent: {
    flex: 1,
  },
  logMessage: {
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  logTime: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  typeBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
