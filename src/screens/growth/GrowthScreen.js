import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import LineWithDiamond from '../../components/LineWithDiamond';
import SubtlePatternBackground from '../../components/SubtlePatternBackground';
import { useReflections } from '../../hooks/useReflections';
import { getCurrentStreak, getLongestStreak } from '../../data/streak';
import { THEME_KEYS, THEME_LABELS } from '../../data/prompts';
import { useTheme } from '../../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');
const CHIP_ACTIVE_COLOR = '#C8B79E';
const CHART_HEIGHT = 120;

const THEME_CHART_COLORS = {
  patience: '#B8D4E6',
  gratitude: '#E8D4C4',
  growth: '#B8CCB8',
  reflection: '#D4D3D2',
  hope: '#E8E0C4',
};

function getStartOfWeekForOffset(weekOffset) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay() + 1);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + weekOffset * 7);
  return start;
}

/** Per day (0=Mon..6=Sun), count per theme for the week at weekOffset (0 = this week, -1 = last, etc.) */
function getWeekDataByTheme(reflections, weekOffset = 0) {
  const startOfWeek = getStartOfWeekForOffset(weekOffset);
  const out = Array.from({ length: 7 }, () => {
    const day = {};
    THEME_KEYS.forEach((t) => { day[t] = 0; });
    return day;
  });
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  reflections.forEach((r) => {
    const d = new Date(r.date);
    if (d < startOfWeek) return;
    if (d >= endOfWeek) return;
    const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
    if (r.theme && out[dayIndex][r.theme] !== undefined) {
      out[dayIndex][r.theme]++;
    }
  });
  return out;
}

function formatWeekRange(weekOffset) {
  const start = getStartOfWeekForOffset(weekOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d) => d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  return `${fmt(start)} – ${fmt(end)}`;
}

function getReflectionsThisWeek(reflections) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return reflections.filter((r) => new Date(r.date) >= weekAgo).length;
}

function getTotalWords(reflections) {
  return reflections.reduce((sum, r) => sum + (r.wordCount ?? 0), 0);
}

/**
 * Growth / stats screen: summary cards (reflections count, streak, words), then a weekly bar chart
 * by theme with prev/next week. Shows “No data logged this week” when the selected week is empty.
 */
export default function GrowthScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { reflections, refresh } = useReflections();
  const [weekOffset, setWeekOffset] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const consistency = useMemo(() => getCurrentStreak(reflections), [reflections]);
  const weekDataByTheme = useMemo(
    () => getWeekDataByTheme(reflections, weekOffset),
    [reflections, weekOffset]
  );
  const isCurrentWeek = weekOffset === 0;
  const earliestWeekOffset = useMemo(() => {
    if (reflections.length === 0) return 0;
    const minDate = new Date(Math.min(...reflections.map((r) => new Date(r.date).getTime())));
    const startOfCurrent = getStartOfWeekForOffset(0).getTime();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    return Math.floor((minDate.getTime() - startOfCurrent) / msPerWeek);
  }, [reflections]);
  const isEarliestWeek = weekOffset <= earliestWeekOffset;
  const maxBar = useMemo(() => {
    let max = 0;
    weekDataByTheme.forEach((day) => {
      const total = THEME_KEYS.reduce((s, t) => s + (day[t] || 0), 0);
      if (total > max) max = total;
    });
    return Math.max(1, max);
  }, [weekDataByTheme]);

  const hasWeekData = useMemo(() => {
    return weekDataByTheme.some((day) =>
      THEME_KEYS.reduce((s, t) => s + (day[t] || 0), 0) > 0
    );
  }, [weekDataByTheme]);

  const stats = useMemo(() => ({
    total: reflections.length,
    currentStreak: getCurrentStreak(reflections),
    longestStreak: getLongestStreak(reflections),
    totalWords: getTotalWords(reflections),
    thisWeek: getReflectionsThisWeek(reflections),
  }), [reflections]);

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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
          <Text style={[styles.heading, { color: colors.text }]}>Growth</Text>
        </View>
        <View style={[styles.lineOnEdge, { width: screenWidth }]}>
          <LineWithDiamond flush diamondColor={colors.accent} />
        </View>
        <View style={styles.paddedContent}>
          {/* Reflections | This week */}
          <View style={[styles.heroStatCard, { backgroundColor: colors.surface }, isDark && styles.darkCard]}>
            <View style={styles.heroStatHalf}>
              <Text style={[styles.heroStatLabel, { color: colors.textMuted }]}>Reflections</Text>
              <Text style={[styles.heroStatValue, { color: colors.text }]}>{reflections.length}</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: colors.border }]} />
            <View style={styles.heroStatHalf}>
              <Text style={[styles.heroStatLabel, { color: colors.textMuted }]}>This week</Text>
              <Text style={[styles.heroStatValue, { color: colors.text }]}>{stats.thisWeek}</Text>
            </View>
          </View>

          {/* Consistency | Longest streak */}
          <View style={[styles.heroStatCard, { backgroundColor: colors.surface }, isDark && styles.darkCard]}>
            <View style={styles.heroStatHalf}>
              <Text style={[styles.heroStatLabel, { color: colors.textMuted }]}>Consistency</Text>
              <Text style={[styles.heroStatValue, { color: colors.text }]}>
                {consistency} <Text style={[styles.heroStatUnit, { color: colors.textMuted }]}>Days</Text>
              </Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: colors.border }]} />
            <View style={styles.heroStatHalf}>
              <Text style={[styles.heroStatLabel, { color: colors.textMuted }]}>Longest streak</Text>
              <Text style={[styles.heroStatValue, { color: colors.text }]}>
                {stats.longestStreak} <Text style={[styles.heroStatUnit, { color: colors.textMuted }]}>Days</Text>
              </Text>
            </View>
          </View>

          {/* Total words written */}
          <View style={[styles.heroStatCard, { backgroundColor: colors.surface }, isDark && styles.darkCard]}>
            <View style={styles.heroStatHalfFull}>
              <Text style={[styles.heroStatLabel, { color: colors.textMuted }]}>Total words written</Text>
              <Text style={[styles.heroStatValue, { color: colors.text }]}>{stats.totalWords.toLocaleString()}</Text>
            </View>
          </View>

          {/* Weekly Reflections Pattern */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Reflections Pattern</Text>
          <View style={[styles.chartCard, { backgroundColor: colors.surface }, isDark && styles.darkCard]}>
            <View style={[styles.chartWeekRow, { borderBottomColor: colors.border }]}>
              <Pressable
                style={[styles.chartWeekButton, { backgroundColor: colors.accentMuted }, isEarliestWeek && styles.chartWeekButtonDisabled]}
                onPress={() => !isEarliestWeek && setWeekOffset((o) => o - 1)}
                disabled={isEarliestWeek}
              >
                <Ionicons
                  name="chevron-back"
                  size={22}
                  color={isEarliestWeek ? colors.textMuted : colors.accent}
                />
              </Pressable>
              <Text style={[styles.chartWeekRange, { color: colors.text }]} numberOfLines={1}>
                {formatWeekRange(weekOffset)}
              </Text>
              <Pressable
                style={[styles.chartWeekButton, { backgroundColor: colors.accentMuted }, isCurrentWeek && styles.chartWeekButtonDisabled]}
                onPress={() => !isCurrentWeek && setWeekOffset((o) => o + 1)}
                disabled={isCurrentWeek}
              >
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={isCurrentWeek ? colors.textMuted : colors.accent}
                />
              </Pressable>
            </View>
            <View style={styles.chartArea}>
              {hasWeekData ? (
                <>
                  {/* Horizontal grid lines (behind) */}
                  <View style={styles.chartGridBg} pointerEvents="none">
                    {Array.from({ length: maxBar + 1 }, (_, i) => (
                      <View
                        key={i}
                        style={[styles.chartGridLine, { top: (i / maxBar) * CHART_HEIGHT, backgroundColor: colors.border }]}
                      />
                    ))}
                  </View>
                  {/* Y-axis labels (aligned with grid lines) */}
                  <View style={styles.chartYAxis}>
                    {Array.from({ length: maxBar + 1 }, (_, i) => {
                      const val = maxBar - i;
                      const top = (i / maxBar) * CHART_HEIGHT - 7;
                      return (
                        <View key={val} style={[styles.chartYLabelWrap, { top }]}>
                          <Text style={[styles.chartYLabel, { color: colors.textMuted }]}>{val}</Text>
                        </View>
                      );
                    })}
                  </View>
                  {/* Bars */}
                  <View style={styles.chartBars}>
                    {weekDataByTheme.map((day, i) => {
                      const total = THEME_KEYS.reduce((s, t) => s + (day[t] || 0), 0);
                      const barHeight = total > 0 ? (total / maxBar) * CHART_HEIGHT : 0;
                      return (
                        <View key={i} style={styles.chartBarWrap}>
                          <View style={[styles.chartBarStack, { height: barHeight }]}>
                            {THEME_KEYS.filter((t) => (day[t] || 0) > 0).map((t) => {
                              const segmentHeight = (day[t] / total) * barHeight;
                              return (
                                <View
                                  key={t}
                                  style={[
                                    styles.chartBarSegment,
                                    {
                                      height: segmentHeight,
                                      backgroundColor: THEME_CHART_COLORS[t],
                                    },
                                  ]}
                                />
                              );
                            })}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </>
              ) : (
                <View style={styles.chartEmptyWrap}>
                  <Text style={[styles.chartEmptyText, { color: colors.textMuted }]}>
                    No data logged this week
                  </Text>
                </View>
              )}
            </View>
            <View style={[styles.chartLabels, { borderColor: 'transparent' }]}>
              {dayLabels.map((label, i) => (
                <Text key={i} style={[styles.chartLabel, { color: colors.textMuted }]}>{label}</Text>
              ))}
            </View>
            <View style={[styles.chartLegend, { borderTopColor: colors.border }]}>
              {THEME_KEYS.map((t) => (
                <View key={t} style={styles.chartLegendItem}>
                  <View style={[styles.chartLegendSwatch, { backgroundColor: THEME_CHART_COLORS[t] }]} />
                  <Text style={[styles.chartLegendText, { color: colors.textSecondary }]}>{THEME_LABELS[t]}</Text>
                </View>
              ))}
            </View>
          </View>
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
  heroStatCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#8A8580',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
  },
  heroStatHalf: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStatHalfFull: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 4,
  },
  heroStatLabel: {
    fontSize: 15,
    color: '#8A8580',
    fontFamily: 'Inter_500Medium',
    marginBottom: 6,
  },
  heroStatValue: {
    fontSize: 30,
    color: '#2F2F2F',
    fontFamily: 'PlayfairDisplay_600SemiBold',
  },
  heroStatUnit: {
    fontSize: 18,
    color: '#8A8580',
    fontFamily: 'Inter_500Medium',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#2F2F2F',
    fontFamily: 'CormorantGaramond_600SemiBold',
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#8A8580',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
  },
  chartWeekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  chartWeekButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(200, 183, 158, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartWeekButtonDisabled: {
    opacity: 0.5,
  },
  chartWeekRange: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: '#2F2F2F',
    fontFamily: 'CormorantGaramond_600SemiBold',
    marginHorizontal: 8,
  },
  chartArea: {
    flexDirection: 'row',
    height: CHART_HEIGHT,
    marginBottom: 10,
    position: 'relative',
  },
  chartEmptyWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartEmptyText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  chartGridBg: {
    position: 'absolute',
    left: 30,
    right: 0,
    top: 0,
    height: CHART_HEIGHT,
  },
  chartGridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  chartYAxis: {
    width: 28,
    marginRight: 6,
    height: CHART_HEIGHT,
    position: 'relative',
    zIndex: 1,
  },
  chartYLabelWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 14,
    justifyContent: 'center',
  },
  chartYLabel: {
    fontSize: 12,
    color: '#8A8580',
    fontFamily: 'Inter_500Medium',
    textAlign: 'right',
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginHorizontal: 2,
  },
  chartBarWrap: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  chartBarStack: {
    width: '78%',
    minHeight: 2,
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'column-reverse',
  },
  chartBarSegment: {
    width: '100%',
    minHeight: 2,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginLeft: 34,
  },
  chartLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#8A8580',
    fontFamily: 'Inter_500Medium',
  },
  chartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  chartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chartLegendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  chartLegendText: {
    fontSize: 14,
    color: '#6A6A6A',
    fontFamily: 'Inter_500Medium',
  },
  darkCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowOpacity: 0,
  },
});
