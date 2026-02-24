import React from 'react';
import { Ionicons } from '@expo/vector-icons';

/** Maps each reflection theme to a simple icon (leaf, flower, etc.) for chips and cards */
const THEME_ICONS = {
  patience: 'leaf',
  gratitude: 'flower',
  growth: 'partly-sunny',
  reflection: 'moon',
  hope: 'sunny',
};

export default function ThemeIcon({ theme, size = 20, color = '#6E7F5F' }) {
  const name = THEME_ICONS[theme] || 'leaf';
  return <Ionicons name={name} size={size} color={color} />;
}
