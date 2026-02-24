import React from 'react';
import { View, StyleSheet } from 'react-native';

const DEFAULT_COLOR = '#6E7F5F';

/**
 * Decorative separator: a thin line with a small diamond in the middle.
 * Used under screen titles (e.g. Reflect, Journey). Pass diamondColor from theme for light/dark.
 */
export default function LineWithDiamond({ flush = false, diamondColor = DEFAULT_COLOR }) {
  return (
    <View style={[styles.container, flush && styles.containerFlush]}>
      <View style={[styles.line, { backgroundColor: diamondColor }]} />
      <View style={[styles.diamond, { borderColor: diamondColor, backgroundColor: diamondColor }]} />
      <View style={[styles.line, { backgroundColor: diamondColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginVertical: 12,
  },
  containerFlush: {
    marginVertical: 0,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E6DFD5',
  },
  diamond: {
    width: 8,
    height: 8,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: DEFAULT_COLOR,
    transform: [{ rotate: '45deg' }],
    backgroundColor: DEFAULT_COLOR,
  },
});
