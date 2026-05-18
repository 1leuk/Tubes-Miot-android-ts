import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TextStyle } from 'react-native';
import { COLORS } from '../../constants/theme';

interface Props {
  text: string;
  style?: TextStyle;
  glitchColor?: string;
  intensity?: 'low' | 'high';
}

/**
 * Text with a cyberpunk glitch displacement effect.
 * Layers offset colored copies behind the main text.
 */
export default function GlitchText({
  text,
  style,
  glitchColor = COLORS.magenta,
  intensity = 'low',
}: Props) {
  const offsetAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const maxOffset = intensity === 'high' ? 3 : 1.5;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(offsetAnim, { toValue: maxOffset, duration: 100, useNativeDriver: true }),
        Animated.timing(offsetAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
        Animated.delay(2000 + Math.random() * 3000),
        Animated.timing(offsetAnim, { toValue: -maxOffset, duration: 60, useNativeDriver: true }),
        Animated.timing(offsetAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
        Animated.delay(1500 + Math.random() * 2000),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [intensity]);

  return (
    <View style={styles.wrapper}>
      {/* Glitch layer (behind) */}
      <Animated.Text
        style={[
          styles.glitchLayer,
          style,
          {
            color: glitchColor,
            opacity: 0.4,
            transform: [{ translateX: offsetAnim }],
          },
        ]}
      >
        {text}
      </Animated.Text>
      {/* Second glitch layer */}
      <Animated.Text
        style={[
          styles.glitchLayer,
          style,
          {
            color: COLORS.cyan,
            opacity: 0.3,
            transform: [
              {
                translateX: offsetAnim.interpolate({
                  inputRange: [-3, 0, 3],
                  outputRange: [2, 0, -2],
                }),
              },
            ],
          },
        ]}
      >
        {text}
      </Animated.Text>
      {/* Main text */}
      <Text style={[style]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  glitchLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
