import React from 'react';
import { View, StyleSheet, ImageBackground, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';

// Asset refs removed for Expo Snack (repo has no assets/). Locally you can require them if present.
const bgLight = null;
const bgDark = null;
const FALLBACK_BG_LIGHT = '#F4EFE7';
const FALLBACK_BG_DARK = '#1a1a1a';

const BLUR_INTENSITY = 5;

/**
 * Full-screen patterned background. We keep both light and dark images mounted and only toggle
 * opacity when the theme changes—that way switching feels instant with no flicker. A light blur
 * on top keeps the pattern from feeling too busy. Taps pass through so it doesn’t block buttons.
 */
export default function SubtlePatternBackground() {
  const { isDark } = useTheme();
  const fallbackColor = isDark ? FALLBACK_BG_DARK : FALLBACK_BG_LIGHT;

  if (!bgLight && !bgDark) {
    return (
      <View
        style={[StyleSheet.absoluteFill, styles.container, { backgroundColor: fallbackColor }]}
        pointerEvents="none"
      />
    );
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <ImageBackground
        source={bgLight}
        style={[StyleSheet.absoluteFill, styles.bg, { opacity: isDark ? 0 : 1 }]}
        resizeMode="cover"
        {...(Platform.OS === 'android' && { resizeMethod: 'resize' })}
      />
      <ImageBackground
        source={bgDark}
        style={[StyleSheet.absoluteFill, styles.bg, { opacity: isDark ? 1 : 0 }]}
        resizeMode="cover"
        {...(Platform.OS === 'android' && { resizeMethod: 'resize' })}
      />
      <BlurView
        intensity={BLUR_INTENSITY}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bg: {
    // both backgrounds stacked; opacity toggles which is visible
  },
});
