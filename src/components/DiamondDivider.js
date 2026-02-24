import React from 'react';
import { View, StyleSheet } from 'react-native';

/** Small diamond shape used as a visual divider (optional; LineWithDiamond is used more often). */
export default function DiamondDivider() {
  return <View style={styles.diamond} />;
}

const styles = StyleSheet.create({
  diamond: {
    width: 8,
    height: 8,
    marginVertical: 8,
    backgroundColor: '#6E7F5F',
    transform: [{ rotate: '45deg' }],
    opacity: 0.8,
  },
});
