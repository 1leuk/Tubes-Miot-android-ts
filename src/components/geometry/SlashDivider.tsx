import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/theme';

interface Props {
  angle?: number;
  color?: string;
  thickness?: number;
  style?: ViewStyle;
}

/**
 * A diagonal slash line divider — breaks up the mundane horizontal layout.
 */
export default function SlashDivider({
  angle = -15,
  color = COLORS.borderGlow,
  thickness = 2,
  style,
}: Props) {
  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.line,
          {
            backgroundColor: color,
            height: thickness,
            transform: [{ rotate: `${angle}deg` }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 24,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  line: {
    width: '120%',
    marginLeft: '-10%',
  },
});
