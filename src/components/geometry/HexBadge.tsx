import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

interface Props {
  label: string;
  color?: string;
  bg?: string;
  style?: ViewStyle;
}

/**
 * A hexagonal-ish badge for status labels.
 * Uses clipped corner styling to approximate a hex shape.
 */
export default function HexBadge({
  label,
  color = COLORS.violet,
  bg = COLORS.violetSoft,
  style,
}: Props) {
  return (
    <View style={[styles.outer, style]}>
      {/* Left chevron */}
      <View style={[styles.chevronLeft, { borderRightColor: bg }]} />
      {/* Center body */}
      <View style={[styles.body, { backgroundColor: bg }]}>
        <Text style={[styles.text, { color }]}>{label}</Text>
      </View>
      {/* Right chevron */}
      <View style={[styles.chevronRight, { borderLeftColor: bg }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  chevronLeft: {
    width: 0,
    height: 0,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderRightWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  body: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    height: 24,
    justifyContent: 'center',
  },
  chevronRight: {
    width: 0,
    height: 0,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderLeftWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  text: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
