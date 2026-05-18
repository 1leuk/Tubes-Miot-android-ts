import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
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

// ─── Override types ───────────────────────────────────────────────────────────
type OverrideState = 'auto' | 'manual-open' | 'manual-closed';
type BuzzerOverrideState = 'auto' | 'manual-on' | 'manual-off';

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

  // ── Manual override state ──
  const [portalOverride, setPortalOverride] = useState<OverrideState>('auto');
  const [buzzerOverride, setBuzzerOverride] = useState<BuzzerOverrideState>('auto');

  const prevOccupied = useRef(false);
  const prevStatus = useRef<SystemStatus>('normal');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  // ── Derived effective values ──
  const effectivePortalOpen =
    portalOverride === 'manual-open' ? true :
    portalOverride === 'manual-closed' ? false :
    sensor.portalOpen;

  const effectiveBuzzerActive =
    buzzerOverride === 'manual-on' ? true :
    buzzerOverride === 'manual-off' ? false :
    sensor.buzzerActive;

  // ── Override handlers ──
  const handlePortalToggle = (open: boolean) => {
    const newOverride: OverrideState = open ? 'manual-open' : 'manual-closed';
    setPortalOverride(newOverride);
    setLogs(l => [
      makeLog('info', `Override manual: Portal ${open ? 'DIBUKA' : 'DITUTUP'} secara manual oleh operator.`),
      ...l,
    ].slice(0, MAX_LOGS));
  };

  const handlePortalReset = () => {
    setPortalOverride('auto');
    setLogs(l => [
      makeLog('normal', 'Portal dikembalikan ke kontrol otomatis sistem.'),
      ...l,
    ].slice(0, MAX_LOGS));
  };

  const handleBuzzerToggle = (active: boolean) => {
    const newOverride: BuzzerOverrideState = active ? 'manual-on' : 'manual-off';
    setBuzzerOverride(newOverride);
    setLogs(l => [
      makeLog('info', `Override manual: Buzzer ${active ? 'DIAKTIFKAN' : 'DIMATIKAN'} secara manual oleh operator.`),
      ...l,
    ].slice(0, MAX_LOGS));
  };

  const handleBuzzerReset = () => {
    setBuzzerOverride('auto');
    setLogs(l => [
      makeLog('normal', 'Buzzer dikembalikan ke kontrol otomatis sistem.'),
      ...l,
    ].slice(0, MAX_LOGS));
  };

  // ── Entrance animation ──
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
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
          newEntries.push(makeLog('info', `Kendaraan masuk area parkir (${next.ultrasonicCm} cm).`));
          setTotalVehicles(v => v + 1);
        } else if (!occupied && prevOccupied.current) {
          newEntries.push(makeLog('info', `Kendaraan keluar. Slot kembali kosong.`));
        }

        if (next.systemStatus !== prevStatus.current) {
          if (next.systemStatus === 'danger') {
            newEntries.push(makeLog('danger', 'API TERDETEKSI! Mode darurat aktif. Portal terbuka, buzzer menyala.'));
            setTotalAlerts(a => a + 1);
          } else if (next.systemStatus === 'warning') {
            newEntries.push(makeLog('warning', `Asap/gas terdeteksi! MQ-2: ${next.mq2Value} ADC. Harap waspada.`));
            setTotalAlerts(a => a + 1);
          } else if (prevStatus.current !== 'normal') {
            newEntries.push(makeLog('normal', 'Kondisi kembali normal. Semua sensor aman.'));
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
    d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

  const isOccupied = sensor.ultrasonicCm < VEHICLE_THRESHOLD;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View>
              <Text style={styles.greeting}>Smart Parking</Text>
              <Text style={styles.subtitle}>Dashboard Monitoring IoT</Text>
            </View>
            <View style={styles.clockBox}>
              <Text style={styles.clock}>{formatTime(currentTime)}</Text>
              <Text style={styles.clockDate}>{formatDate(currentTime)}</Text>
            </View>
          </Animated.View>

          {/* ── System Status ── */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <SystemStatusWidget
              status={sensor.systemStatus}
              portalOpen={effectivePortalOpen}
              buzzerActive={effectiveBuzzerActive}
              portalOverride={portalOverride}
              buzzerOverride={buzzerOverride}
              onPortalToggle={handlePortalToggle}
              onPortalReset={handlePortalReset}
              onBuzzerToggle={handleBuzzerToggle}
              onBuzzerReset={handleBuzzerReset}
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

          {/* ── Section: Sensor Realtime ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sensor Realtime</Text>
            <View style={styles.sectionLine} />
          </View>

          {/* ── Sensor Widgets ── */}
          <Animated.View style={[styles.row, { opacity: fadeAnim }]}>
            <UltrasonicWidget distance={sensor.ultrasonicCm} isOccupied={isOccupied} />
            <MQ2Widget mq2Value={sensor.mq2Value} smokeDetected={sensor.smokeDetected} />
          </Animated.View>

          <Animated.View style={[styles.row, { opacity: fadeAnim }]}>
            <FlameWidget flameDetected={sensor.flameDetected} />
          </Animated.View>

          {/* ── Section: Grafik ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Grafik Sensor</Text>
            <View style={styles.sectionLine} />
          </View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <SensorChartWidget mq2History={mq2History} ultraHistory={ultraHistory} />
          </Animated.View>

          {/* ── Section: Log ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Log Kejadian</Text>
            <View style={styles.sectionLine} />
          </View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <EventLogWidget logs={logs} />
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  clockBox: {
    alignItems: 'flex-end',
  },
  clock: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  clockDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },

  // ── Section labels ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },

  // ── Layout ──
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
});
