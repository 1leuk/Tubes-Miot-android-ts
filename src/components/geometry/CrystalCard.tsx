import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  accentColor?: string;
  glowColor?: string;
  style?: ViewStyle;
  /** Which corners get the diagonal cut effect: 'topRight' | 'bottomLeft' | 'both' */
  cutCorner?: 'topRight' | 'bottomLeft' | 'both' | 'none';
}

/**
 * A card with crystalline aesthetics — diagonal cut corners,
 * accent-colored edge strip, and subtle inner glow.
 */
export default function CrystalCard({
  children,
  accentColor = COLORS.violet,
  glowColor = COLORS.violetGlow,
  style,
  cutCorner = 'topRight',
}: Props) {
  return (
    <View style={[styles.outer, style]}>
      {/* Glow border simulation */}
      <View
        style={[
          styles.glowBorder,
          {
            borderColor: accentColor,
            shadowColor: accentColor,
          },
        ]}
      />
      <View style={styles.card}>
        {/* Top accent strip — slanted */}
        <View style={styles.stripContainer}>
          <View
            style={[
              styles.strip,
              {
                backgroundColor: accentColor,
              },
            ]}
          />
          {cutCorner === 'topRight' || cutCorner === 'both' ? (
            <View style={[styles.cutTriangle, { borderBottomColor: COLORS.surface }]} />
          ) : null}
        </View>
        {/* Content */}
        <View style={styles.content}>{children}</View>
        {/* Bottom accent dot */}
        <View style={styles.bottomDeco}>
          <View style={[styles.decoLine, { backgroundColor: accentColor }]} />
          <View style={[styles.decoDot, { backgroundColor: accentColor }]} />
          <View style={[styles.decoLine, { backgroundColor: accentColor }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'relative',
  },
  glowBorder: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: RADIUS.lg + 1,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stripContainer: {
    height: 4,
    width: '100%',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  strip: {
    flex: 1,
    height: 4,
  },
  cutTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderBottomWidth: 4,
    borderLeftColor: 'transparent',
  },
  content: {
    padding: SPACING.md,
  },
  bottomDeco: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
    gap: 6,
  },
  decoLine: {
    width: 20,
    height: 1,
    opacity: 0.3,
  },
  decoDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
  },
});
