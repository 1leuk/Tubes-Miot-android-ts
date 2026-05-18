import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/theme';

interface Props {
  size?: number;
  color?: string;
  glowColor?: string;
  spinning?: boolean;
  children?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * A diamond (45° rotated square) frame with optional glow and spin animation.
 * Used as a decorative wrapper for icons and small content.
 */
export default function DiamondFrame({
  size = 56,
  color = COLORS.violet,
  glowColor = COLORS.violetGlow,
  spinning = false,
  children,
  style,
}: Props) {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (spinning) {
      const loop = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => loop.stop();
    }
  }, [spinning]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['45deg', '405deg'],
  });

  return (
    <View style={[styles.wrapper, { width: size + 16, height: size + 16 }, style]}>
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.outerRing,
          {
            width: size + 12,
            height: size + 12,
            borderColor: glowColor,
            transform: spinning ? [{ rotate }] : [{ rotate: '45deg' }],
          },
        ]}
      />
      {/* Inner diamond */}
      <View
        style={[
          styles.diamond,
          {
            width: size,
            height: size,
            borderColor: color,
            backgroundColor: glowColor,
          },
        ]}
      >
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderRadius: 6,
  },
  diamond: {
    transform: [{ rotate: '45deg' }],
    borderWidth: 1.5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
