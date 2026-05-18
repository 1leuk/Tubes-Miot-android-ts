// ─── System Status ────────────────────────────────────────────────────────────
export type SystemStatus = 'normal' | 'warning' | 'danger';

// ─── Parking Slot ─────────────────────────────────────────────────────────────
export interface ParkingSlot {
  id: string;
  label: string;
  distance: number; // cm from ultrasonic
  isOccupied: boolean;
}

// ─── Sensor Reading ───────────────────────────────────────────────────────────
export interface SensorData {
  timestamp: Date;
  ultrasonicCm: number;      // distance in cm
  mq2Value: number;          // analog 0–4095
  flameDetected: boolean;    // digital HIGH/LOW
  smokeDetected: boolean;    // derived from mq2Value threshold
  systemStatus: SystemStatus;
  portalOpen: boolean;
  buzzerActive: boolean;
}

// ─── Event Log Entry ──────────────────────────────────────────────────────────
export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'danger' | 'normal';
  message: string;
}
