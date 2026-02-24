import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useReflections } from '../../hooks/useReflections';
import LineWithDiamond from '../../components/LineWithDiamond';
import ThemeIcon from '../../components/ThemeIcon';
import SubtlePatternBackground from '../../components/SubtlePatternBackground';
import { THEME_KEYS, THEME_LABELS } from '../../data/prompts';
import { useTheme } from '../../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');
const CHIP_ACTIVE_COLOR = '#C8B79E';
const PREVIEW_LEN = 80;

const CHIP_THEME_COLORS_LIGHT = {
  patience: '#EBF2F7',
  gratitude: '#FDF5EF',
  growth: '#EDF2EC',
  reflection: '#EBEAE8',
  hope: '#FEF8E8',
};
const CHIP_THEME_COLORS_DARK = {
  patience: 'rgba(91, 143, 181, 0.22)',
  gratitude: 'rgba(180, 130, 90, 0.22)',
  growth: 'rgba(90, 127, 90, 0.22)',
  reflection: 'rgba(140, 138, 135, 0.22)',
  hope: 'rgba(201, 168, 76, 0.22)',
};
const THEME_ICON_COLORS_LIGHT = {
  patience: '#5B8FB5',
  gratitude: '#C9956B',
  growth: '#5A7F5A',
  reflection: '#7A7876',
  hope: '#C9A84C',
};
const THEME_ICON_COLORS_DARK = {
  patience: '#7BAED4',
  gratitude: '#D4A87A',
  growth: '#6E996E',
  reflection: '#9A9896',
  hope: '#D4B85C',
};

function formatDate(iso) {
  const d = new Date(iso);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (isToday) return 'Today';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function truncate(text, len) {
  const t = (text || '').trim();
  if (t.length <= len) return t;
  return t.slice(0, len).trim() + '…';
}

/**
 * Journey list: filter chips (All + one per theme with count), then cards for each reflection.
 * Tapping a card goes to Detail. We refresh the list when the screen comes into focus.
 */
export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const { reflections, refresh } = useReflections();
  const [filterTheme, setFilterTheme] = useState(null);

  // Chip colors and borders differ in dark mode for readability
  const chipThemeColors = isDark ? CHIP_THEME_COLORS_DARK : CHIP_THEME_COLORS_LIGHT;
  const themeIconColors = isDark ? THEME_ICON_COLORS_DARK : THEME_ICON_COLORS_LIGHT;
  const activeChipBorder = isDark ? colors.border : '#B5A48A';

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const filteredReflections = useMemo(() => {
    if (!filterTheme) return reflections;
    return reflections.filter((r) => r.theme === filterTheme);
  }, [reflections, filterTheme]);

  const themeCounts = useMemo(() => {
    const counts = {};
    THEME_KEYS.forEach((t) => { counts[t] = 0; });
    reflections.forEach((r) => {
      if (r.theme && counts[r.theme] !== undefined) counts[r.theme]++;
    });
    return counts;
  }, [reflections]);

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <SubtlePatternBackground />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 0, paddingBottom: 40 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.topSection,
            { paddingTop: insets.top + 6, width: screenWidth, backgroundColor: colors.surface },
            isDark && { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
          ]}
        >
          <Text style={[styles.heading, { color: colors.text }]}>Journey</Text>
        </View>
        <View style={[styles.lineOnEdge, { width: screenWidth }]}>
          <LineWithDiamond flush diamondColor={colors.accent} />
        </View>
        <View style={styles.paddedContent}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipScroll}
            style={styles.chipScrollWrap}
          >
            <Pressable
              style={[
                styles.filterChip,
                {
                  backgroundColor: filterTheme === null ? colors.accent : colors.surfaceSecondary,
                  borderColor: filterTheme === null ? activeChipBorder : colors.border,
                },
                filterTheme === null && styles.filterChipActive,
              ]}
              onPress={() => setFilterTheme(null)}
              android_ripple={null}
            >
              <Text style={[styles.filterChipText, { color: filterTheme === null ? colors.text : colors.textSecondary }, filterTheme === null && styles.filterChipTextActive]}>
                All · {reflections.length}
              </Text>
            </Pressable>
            {THEME_KEYS.map((t) => (
              <Pressable
                key={t}
                style={[
                  styles.filterChip,
                  { backgroundColor: filterTheme === t ? colors.accent : chipThemeColors[t], borderColor: filterTheme === t ? activeChipBorder : colors.border },
                  filterTheme === t && styles.filterChipActive,
                ]}
                onPress={() => setFilterTheme(filterTheme === t ? null : t)}
                android_ripple={null}
              >
                <ThemeIcon
                  theme={t}
                  size={14}
                  color={filterTheme === t ? '#FFFFFF' : themeIconColors[t]}
                />
                <Text style={[styles.filterChipText, { color: filterTheme === t ? colors.text : colors.textSecondary }, filterTheme === t && styles.filterChipTextActive]}>
                  {THEME_LABELS[t]} · {themeCounts[t] ?? 0}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          {filteredReflections.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {filterTheme
                ? `No reflections for ${THEME_LABELS[filterTheme]}.`
                : 'No reflections yet. Start from Reflect.'}
            </Text>
          ) : (
            filteredReflections.map((r) => (
              <Pressable
                key={r.id}
                style={[styles.card, { backgroundColor: colors.surface }, isDark && styles.darkCard]}
                onPress={() => navigation.navigate('Detail', { reflection: r })}
              >
                {r.prompt ? (
                  <Text style={[styles.cardQuestion, { color: colors.text }]} numberOfLines={2}>
                    {r.prompt}
                  </Text>
                ) : null}
                <View style={[styles.cardMeta, { borderBottomColor: colors.border }]}>
                  <View style={styles.cardTheme}>
                    <ThemeIcon theme={r.theme} size={16} color={colors.accent} />
                    <Text style={[styles.cardThemeLabel, { color: colors.accent }]}>{THEME_LABELS[r.theme] || r.theme}</Text>
                  </View>
                  <Text style={[styles.cardDate, { color: colors.textMuted }]}>{formatDate(r.date)}</Text>
                </View>
                <Text style={[styles.cardPreview, { color: colors.text }]} numberOfLines={3}>
                  {truncate(r.content, PREVIEW_LEN)}
                </Text>
                <Text style={[styles.cardWords, { color: colors.textMuted }]}>{r.wordCount ?? 0} words</Text>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F4EFE7',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  topSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: -24,
    paddingBottom: 6,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    color: '#2F2F2F',
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  lineOnEdge: {
    marginHorizontal: -24,
    marginTop: -4,
    zIndex: 1,
  },
  paddedContent: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  chipScrollWrap: {
    marginHorizontal: -24,
    marginBottom: 16,
  },
  chipScroll: {
    paddingHorizontal: 24,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#F0EDE8',
    shadowColor: '#8A8580',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  filterChipActive: {
    backgroundColor: CHIP_ACTIVE_COLOR,
    borderColor: '#B5A48A',
    shadowColor: '#B5A48A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  filterChipText: {
    fontSize: 15,
    color: '#6A6A6A',
    fontFamily: 'Inter_500Medium',
  },
  filterChipTextActive: {
    color: '#2F2F2F',
    fontFamily: 'Inter_600SemiBold',
  },
  emptyText: {
    fontSize: 19,
    color: '#6A6A6A',
    fontFamily: 'CormorantGaramond_400Regular',
    textAlign: 'center',
    marginTop: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    borderWidth: 0,
    shadowColor: '#8A8580',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
  },
  cardQuestion: {
    fontSize: 19,
    color: '#2F2F2F',
    fontFamily: 'CormorantGaramond_600SemiBold',
    lineHeight: 26,
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  cardTheme: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardThemeLabel: {
    fontSize: 16,
    color: CHIP_ACTIVE_COLOR,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  cardDate: {
    fontSize: 15,
    color: '#8A8580',
    fontFamily: 'Inter_500Medium',
  },
  cardPreview: {
    fontSize: 18,
    color: '#2F2F2F',
    fontFamily: 'CormorantGaramond_400Regular',
    lineHeight: 26,
  },
  cardWords: {
    fontSize: 14,
    color: '#8A8580',
    fontFamily: 'Inter_400Regular',
    marginTop: 8,
  },
  darkCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowOpacity: 0,
  },
});
