import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

/** Simple card container with theme background and rounded corners; accepts optional style override. */
export default function Card({ children, style }) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surfaceSecondary },
        isDark && { borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 24,
    borderWidth: 0,
    shadowColor: '#8A8580',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
  },
});
