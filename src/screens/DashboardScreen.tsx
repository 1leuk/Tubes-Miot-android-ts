import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { SensorData, LogEntry, SystemStatus } from '../types';

import SystemStatusWidget from '../components/widgets/SystemStatusWidget';
import UltrasonicWidget from '../components/widgets/UltrasonicWidget';
import MQ2Widget from '../components/widgets/MQ2Widget';
import FlameWidget from '../components/widgets/FlameWidget';
import SensorChartWidget from '../components/widgets/SensorChartWidget';
import SummaryStatsWidget from '../components/widgets/SummaryStatsWidget';
import EventLogWidget from '../components/widgets/EventLogWidget';
import GlitchText from '../components/geometry/GlitchText';
import SlashDivider from '../components/geometry/SlashDivider';

// ─── Thresholds ───────────────────────────────────────────────────────────────
const SMOKE_THRESHOLD = 800;
const VEHICLE_THRESHOLD = 50;

// ─── Helpers ──────────────────────────────────────────────────────────────────
let logIdCounter = 1;
function makeLog(type: LogEntry['type'], message: string): LogEntry {
  return { id: String(logIdCounter++), timestamp: new Date(), type, message };
}

function simulateSensor(prev: SensorData): SensorData {
  let newCm = prev.ultrasonicCm + (Math.random() - 0.5) * 20;
  newCm = Math.max(10, Math.min(400, newCm));

  let newMq2 = prev.mq2Value + (Math.random() - 0.5) * 80;
  if (Math.random() < 0.04) newMq2 = Math.min(4095, newMq2 + 600);
  newMq2 = Math.max(0, Math.min(4095, newMq2));

  const newFlame = Math.random() < 0.03;
  const smokeDetected = newMq2 > SMOKE_THRESHOLD;
  const isOccupied = newCm < VEHICLE_THRESHOLD;

  let status: SystemStatus = 'normal';
  if (newFlame) status = 'danger';
  else if (smokeDetected) status = 'warning';

  return {
    timestamp: new Date(),
    ultrasonicCm: Math.round(newCm),
    mq2Value: Math.round(newMq2),
    flameDetected: newFlame,
    smokeDetected,
    systemStatus: status,
    portalOpen: status === 'danger',
    buzzerActive: status !== 'normal',
  };
}

// ─── Initial state ────────────────────────────────────────────────────────────
const INITIAL_SENSOR: SensorData = {
  timestamp: new Date(),
  ultrasonicCm: 250,
  mq2Value: 300,
  flameDetected: false,
  smokeDetected: false,
  systemStatus: 'normal',
  portalOpen: false,
  buzzerActive: false,
};

const MAX_HISTORY = 20;
const MAX_LOGS = 15;

export default function DashboardScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sensor, setSensor] = useState<SensorData>(INITIAL_SENSOR);
  const [mq2History, setMq2History] = useState<number[]>([300]);
  const [ultraHistory, setUltraHistory] = useState<number[]>([250]);
  const [logs, setLogs] = useState<LogEntry[]>([
    makeLog('info', 'Sistem parkir pintar aktif. Semua sensor terhubung.'),
  ]);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [uptimeMinutes, setUptimeMinutes] = useState(0);
  const startTime = useRef(Date.now());

  const prevOccupied = useRef(false);
  const prevStatus = useRef<SystemStatus>('normal');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  // ── Entrance animation — staggered geometric reveal ──
  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
      Animated.timing(headerSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Clock ──
  useEffect(() => {
    const t = setInterval(() => {
      setCurrentTime(new Date());
      setUptimeMinutes(Math.floor((Date.now() - startTime.current) / 60000));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // ── Sensor simulation ──
  useEffect(() => {
    const t = setInterval(() => {
      setSensor(prev => {
        const next = simulateSensor(prev);
        setMq2History(h => [...h.slice(-MAX_HISTORY + 1), next.mq2Value]);
        setUltraHistory(h => [...h.slice(-MAX_HISTORY + 1), next.ultrasonicCm]);

        const occupied = next.ultrasonicCm < VEHICLE_THRESHOLD;
        const newEntries: LogEntry[] = [];

        if (occupied && !prevOccupied.current) {
          newEntries.push(makeLog('info', `◆ Kendaraan masuk area parkir (${next.ultrasonicCm} cm).`));
          setTotalVehicles(v => v + 1);
        } else if (!occupied && prevOccupied.current) {
          newEntries.push(makeLog('info', `◇ Kendaraan keluar. Slot kembali kosong.`));
        }

        if (next.systemStatus !== prevStatus.current) {
          if (next.systemStatus === 'danger') {
            newEntries.push(makeLog('danger', '◈ API TERDETEKSI! Mode darurat aktif. Portal terbuka, buzzer menyala.'));
            setTotalAlerts(a => a + 1);
          } else if (next.systemStatus === 'warning') {
            newEntries.push(makeLog('warning', `◈ Asap/gas terdeteksi! MQ-2: ${next.mq2Value} ADC. Harap waspada.`));
            setTotalAlerts(a => a + 1);
          } else if (prevStatus.current !== 'normal') {
            newEntries.push(makeLog('normal', '◆ Kondisi kembali normal. Semua sensor aman.'));
          }
        }

        prevOccupied.current = occupied;
        prevStatus.current = next.systemStatus;
        if (newEntries.length > 0) {
          setLogs(l => [...newEntries.reverse(), ...l].slice(0, MAX_LOGS));
        }
        return next;
      });
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  const formatDate = (d: Date) =>
    d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const isOccupied = sensor.ultrasonicCm < VEHICLE_THRESHOLD;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Background geometric decorations */}
      <View style={styles.bgDeco1} />
      <View style={styles.bgDeco2} />
      <View style={styles.bgDeco3} />

      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Geometric Header ── */}
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: headerSlide }] }]}>
            <View style={styles.headerLeft}>
              {/* Diamond logo */}
              <View style={styles.logoDiamond}>
                <View style={styles.logoInner}>
                  <Text style={styles.logoText}>◆</Text>
                </View>
              </View>
              <View>
                <GlitchText
                  text="SMART PARKING"
                  style={styles.title}
                  glitchColor={COLORS.magenta}
                  intensity="low"
                />
                <Text style={styles.subtitle}>Dashboard Monitoring IoT</Text>
              </View>
            </View>
            <View style={styles.clockBox}>
              <Text style={styles.clock}>{formatTime(currentTime)}</Text>
              <Text style={styles.clockDate}>{formatDate(currentTime)}</Text>
              {/* Pulsing corner accents */}
              <View style={[styles.clockCorner, styles.clockCornerTL]} />
              <View style={[styles.clockCorner, styles.clockCornerBR]} />
            </View>
          </Animated.View>

          {/* ── System Status ── */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <SystemStatusWidget
              status={sensor.systemStatus}
              portalOpen={sensor.portalOpen}
              buzzerActive={sensor.buzzerActive}
            />
          </Animated.View>

          {/* ── Summary Stats ── */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <SummaryStatsWidget
              totalVehicles={totalVehicles}
              totalAlerts={totalAlerts}
              uptimeMinutes={uptimeMinutes}
              lastUpdate={sensor.timestamp}
            />
          </Animated.View>

          {/* ── Geometric Section Label ── */}
          <SlashDivider color={COLORS.violet} angle={-8} />
          <View style={styles.sectionRow}>
            <View style={[styles.sectionDiamond, { borderColor: COLORS.violet }]} />
            <Text style={styles.sectionLabel}>SENSOR REALTIME</Text>
            <View style={[styles.sectionLine, { backgroundColor: COLORS.violet }]} />
          </View>

          {/* ── Sensor Widgets ── */}
          <Animated.View style={[styles.row, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <UltrasonicWidget distance={sensor.ultrasonicCm} isOccupied={isOccupied} />
            <MQ2Widget mq2Value={sensor.mq2Value} smokeDetected={sensor.smokeDetected} />
          </Animated.View>

          {/* ── Flame ── */}
          <Animated.View style={[styles.row, { opacity: fadeAnim }]}>
            <FlameWidget flameDetected={sensor.flameDetected} />
          </Animated.View>

          {/* ── Charts ── */}
          <SlashDivider color={COLORS.cyan} angle={8} />
          <View style={styles.sectionRow}>
            <View style={[styles.sectionDiamond, { borderColor: COLORS.cyan }]} />
            <Text style={styles.sectionLabel}>GRAFIK SENSOR</Text>
            <View style={[styles.sectionLine, { backgroundColor: COLORS.cyan }]} />
          </View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <SensorChartWidget mq2History={mq2History} ultraHistory={ultraHistory} />
          </Animated.View>

          {/* ── Event Log ── */}
          <SlashDivider color={COLORS.magenta} angle={-12} />
          <View style={styles.sectionRow}>
            <View style={[styles.sectionDiamond, { borderColor: COLORS.magenta }]} />
            <Text style={styles.sectionLabel}>LOG KEJADIAN</Text>
            <View style={[styles.sectionLine, { backgroundColor: COLORS.magenta }]} />
          </View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <EventLogWidget logs={logs} />
          </Animated.View>

          {/* Bottom spacing */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm },

  // ── Background geometric decorations ──
  bgDeco1: {
    position: 'absolute',
    width: 200, height: 200,
    borderWidth: 1,
    borderColor: COLORS.violetGlow,
    borderRadius: 20,
    transform: [{ rotate: '45deg' }],
    top: -60, right: -80,
    opacity: 0.15,
  },
  bgDeco2: {
    position: 'absolute',
    width: 140, height: 140,
    borderWidth: 1,
    borderColor: COLORS.cyanGlow,
    borderRadius: 12,
    transform: [{ rotate: '30deg' }],
    top: SCREEN_H * 0.4, left: -60,
    opacity: 0.1,
  },
  bgDeco3: {
    position: 'absolute',
    width: 100, height: 100,
    borderWidth: 1,
    borderColor: COLORS.magentaGlow,
    borderRadius: 8,
    transform: [{ rotate: '60deg' }],
    bottom: 100, right: -30,
    opacity: 0.1,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoDiamond: {
    width: 40, height: 40,
    transform: [{ rotate: '45deg' }],
    borderWidth: 2,
    borderColor: COLORS.violet,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.violetGlow,
  },
  logoInner: {
    transform: [{ rotate: '-45deg' }],
  },
  logoText: {
    fontSize: 18,
    color: COLORS.violet,
    fontWeight: '900',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
    letterSpacing: 1,
  },
  clockBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'flex-end',
    position: 'relative',
    overflow: 'hidden',
  },
  clock: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.cyan,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  clockDate: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  clockCorner: {
    position: 'absolute',
    width: 6, height: 6,
    borderColor: COLORS.cyan,
    opacity: 0.5,
  },
  clockCornerTL: {
    top: 2, left: 2,
    borderLeftWidth: 1.5,
    borderTopWidth: 1.5,
  },
  clockCornerBR: {
    bottom: 2, right: 2,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
  },

  // ── Section labels ──
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  sectionDiamond: {
    width: 8, height: 8,
    transform: [{ rotate: '45deg' }],
    borderWidth: 1.5,
    borderRadius: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textSecondary,
    letterSpacing: 3,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    opacity: 0.2,
  },

  // ── Layout ──
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
});
