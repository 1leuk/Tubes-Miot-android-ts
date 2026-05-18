import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/theme';

interface Props {
  size?: number;
  color?: string;
  dotCount?: number;
  speed?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * An orbital ring with animated rotating dots, encircling children.
 * Creates a sci-fi "scanning" effect around sensor values.
 */
export default function OrbitalRing({
  size = 120,
  color = COLORS.cyan,
  dotCount = 6,
  speed = 6000,
  children,
  style,
}: Props) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: speed,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [speed]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const radius = size / 2;
  const dots = Array.from({ length: dotCount }, (_, i) => {
    const angle = (i / dotCount) * Math.PI * 2;
    const x = Math.cos(angle) * (radius - 6) + radius - 3;
    const y = Math.sin(angle) * (radius - 6) + radius - 3;
    const dotSize = i % 2 === 0 ? 6 : 4;
    const opacity = 0.4 + (i / dotCount) * 0.6;
    return { x, y, dotSize, opacity };
  });

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      {/* Orbital ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            transform: [{ rotate: rotation }],
          },
        ]}
      >
        {dots.map((dot, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                left: dot.x,
                top: dot.y,
                width: dot.dotSize,
                height: dot.dotSize,
                borderRadius: dot.dotSize / 2,
                backgroundColor: color,
                opacity: dot.opacity,
              },
            ]}
          />
        ))}
      </Animated.View>
      {/* Center content */}
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  dot: {
    position: 'absolute',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
