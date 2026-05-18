// ═══════════════════════════════════════════════════════════════════════════════
// CLEAN MINIMAL THEME — Neutral & Elegant
// ═══════════════════════════════════════════════════════════════════════════════

export const COLORS = {
  // ── Base ─────────────────────────────────────────────────────────────────────
  bg:          '#F2F2F7',   // iOS-like off-white background
  surface:     '#FFFFFF',   // white card surface
  surfaceHigh: '#F8F8FA',   // slightly lifted surface
  border:      '#E5E5EA',   // subtle border
  borderLight: '#F0F0F5',   // very light border

  // ── Brand / Accent ───────────────────────────────────────────────────────────
  accent:      '#1C1C1E',   // near-black (primary actions)
  accentSoft:  'rgba(28, 28, 30, 0.06)',

  // ── Status Colors ────────────────────────────────────────────────────────────
  // Normal / OK
  green:       '#22C55E',
  greenSoft:   'rgba(34, 197, 94, 0.10)',
  greenBorder: 'rgba(34, 197, 94, 0.25)',

  // Warning
  amber:       '#F59E0B',
  amberSoft:   'rgba(245, 158, 11, 0.10)',
  amberBorder: 'rgba(245, 158, 11, 0.30)',

  // Danger
  red:         '#EF4444',
  redSoft:     'rgba(239, 68, 68, 0.10)',
  redBorder:   'rgba(239, 68, 68, 0.28)',

  // ── Chart Colors ─────────────────────────────────────────────────────────────
  chartBlue:   '#3B82F6',
  chartBlueSoft: 'rgba(59, 130, 246, 0.12)',
  chartOrange: '#F97316',
  chartOrangeSoft: 'rgba(249, 115, 22, 0.12)',

  // ── Typography ──────────────────────────────────────────────────────────────
  textPrimary:   '#1C1C1E',   // almost black
  textSecondary: '#6C6C70',   // medium gray
  textMuted:     '#AEAEB2',   // light gray

  // ── Shadow (for elevation simulation) ───────────────────────────────────────
  shadow:      '#000000',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const RADIUS = {
  sm:   8,
  md:   14,
  lg:   18,
  xl:   24,
  full: 999,
};

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 4,
  },
};
