import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getUserName } from '../../data/storage';
import { getRandomPrompt, THEME_KEYS, THEME_LABELS } from '../../data/prompts';
import { getCurrentStreak } from '../../data/streak';
import { useReflections } from '../../hooks/useReflections';
import LineWithDiamond from '../../components/LineWithDiamond';
import Card from '../../components/Card';
import ThemeIcon from '../../components/ThemeIcon';
import SubtlePatternBackground from '../../components/SubtlePatternBackground';
import SmoothBottomModal from '../../components/SmoothBottomModal';
import { useTheme } from '../../contexts/ThemeContext';

// Greeting changes with time of day (morning / afternoon / evening / night)
function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
}

function getWordCount(text) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

const { width: screenWidth } = Dimensions.get('window');
const CHIP_GAP = 8;
const chipWidth = ((screenWidth - 24 * 2 - CHIP_GAP * 2) / 3) * 0.78;

/** Very subtle background tints per theme (inactive chip) */
const CHIP_THEME_COLORS = {
  patience: '#EBF2F7',
  gratitude: '#FDF5EF',
  growth: '#EDF2EC',
  reflection: '#EBEAE8',
  hope: '#FEF8E8',
};

/** Darker theme colors for icons and diamond (same hue, visible) */
const THEME_ICON_COLORS = {
  patience: '#5B8FB5',
  gratitude: '#C9956B',
  growth: '#5A7F5A',
  reflection: '#7A7876',
  hope: '#C9A84C',
};

/** Same brownish as Save Reflection button (selected chip) */
const CHIP_ACTIVE_COLOR = '#C8B79E';
/** Modern black for primary buttons in dark mode */
const DARK_BUTTON_BG = '#1A1A1A';

const TRUNCATE_LEN = 100;

function truncatePreview(text) {
  const t = text.trim();
  if (t.length <= TRUNCATE_LEN) return t;
  return t.slice(0, TRUNCATE_LEN).trim() + '…';
}

/**
 * Main reflection screen: greeting, theme chips, prompt, and a “Write” area that opens a modal.
 * Saving adds a reflection and clears the draft; streak is derived from reflection dates.
 */
export default function ReflectScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [userName, setUserName] = useState('');
  const [theme, setTheme] = useState('reflection');
  const [content, setContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [writeModalVisible, setWriteModalVisible] = useState(false);
  const writeModalRef = useRef(null);
  const { reflections, addReflection } = useReflections();

  useEffect(() => {
    getUserName().then(setUserName);
  }, []);

  // New random prompt whenever the user switches theme
  useEffect(() => {
    setPrompt(getRandomPrompt(theme));
  }, [theme]);

  const wordCount = useMemo(() => getWordCount(content), [content]);
  const consistency = useMemo(() => getCurrentStreak(reflections), [reflections]);

  async function handleSave() {
    const trimmed = content.trim();
    if (!trimmed) return;
    const reflection = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      theme,
      prompt,
      content: trimmed,
      wordCount,
    };
    await addReflection(reflection);
    setContent('');
    setPrompt(getRandomPrompt(theme));
  }

  function openWriteModal() {
    setWriteModalVisible(true);
  }

  function closeWriteModal() {
    writeModalRef.current?.requestClose();
  }

  const displayName = userName.trim() || 'there';
  const greeting = `${getGreeting()}, ${displayName}`;
  const hasContent = content.trim().length > 0;
  const previewText = truncatePreview(content);

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <SubtlePatternBackground />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: 0,
              paddingBottom: 12,
              flexGrow: 1,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.topSection,
              { paddingTop: insets.top + 6, width: screenWidth, backgroundColor: colors.surface },
              isDark && { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
            ]}
          >
            <View style={styles.hero}>
              <View
                style={[
                  styles.heroCircle,
                  { backgroundColor: colors.surface },
                  isDark && { backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
                ]}
              >
                <Ionicons name="leaf" size={24} color={colors.accent} />
              </View>
            </View>
          </View>
          <View style={[styles.lineOnEdge, { width: screenWidth }]}>
            <LineWithDiamond flush diamondColor={colors.accent} />
          </View>
          <View style={styles.paddedContent}>
          <Text style={[styles.greeting, { color: colors.text }]}>{greeting}</Text>
          <Text style={[styles.consistency, { color: colors.textSecondary }]}>Consistency: {consistency} days</Text>
          <View style={styles.chipSeparatorWrap}>
            <LineWithDiamond diamondColor={colors.accent} />
          </View>
          <Text style={[styles.chooseLabel, { color: colors.textSecondary }]}>Today, choose a theme...</Text>
          <View style={styles.chipGrid}>
            {[THEME_KEYS.slice(0, 3), THEME_KEYS.slice(3, 5)].map((row, ri) => (
              <View key={ri} style={ri === 0 ? styles.chipRow : styles.chipRowCenter}>
                {row.map((t) => {
                  const active = theme === t;
                  return (
                    <Pressable
                      key={t}
                      style={[
                        styles.chip,
                        {
                          width: chipWidth,
                          backgroundColor: active ? THEME_ICON_COLORS[t] : colors.surfaceSecondary,
                          borderColor: active ? THEME_ICON_COLORS[t] : colors.border,
                        },
                        active && styles.chipActive,
                        isDark && !active && { borderColor: 'rgba(255,255,255,0.1)' },
                        isDark && active && { shadowColor: THEME_ICON_COLORS[t], shadowOpacity: 0.4, shadowRadius: 8 },
                      ]}
                      onPress={() => setTheme(t)}
                    >
                      <View style={styles.chipIconWrap}>
                        <ThemeIcon theme={t} size={14} color={active ? '#FFFFFF' : THEME_ICON_COLORS[t]} />
                      </View>
                      <Text
                        style={[
                          styles.chipLabel,
                          { color: active ? '#FFFFFF' : colors.textSecondary },
                          active && styles.chipLabelActive,
                        ]}
                        numberOfLines={1}
                      >
                        {THEME_LABELS[t]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          <Card
            style={[
              styles.reflectionCard,
              { backgroundColor: colors.surface },
              isDark && { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', shadowOpacity: 0 },
            ]}
          >
            {!hasContent ? (
              <>
                <Text style={[styles.promptText, { color: colors.text }]}>{prompt}</Text>
                <Pressable
                  style={[
                    styles.writeCta,
                    isDark && { backgroundColor: DARK_BUTTON_BG, borderColor: 'rgba(255,255,255,0.1)' },
                  ]}
                  onPress={openWriteModal}
                >
                  <Ionicons name="create-outline" size={22} color={colors.text} />
                  <Text style={[styles.writeCtaText, { color: colors.text }]}>Start writing</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={[styles.previewLabel, { color: colors.textMuted }]}>Your reflection</Text>
                <Text style={[styles.previewText, { color: colors.text }]} numberOfLines={4}>
                  {previewText}
                </Text>
                <View style={[styles.previewFooter, { borderTopColor: colors.border }]}>
                  <View style={styles.themeRowCompact}>
                    <ThemeIcon theme={theme} size={14} color={colors.accent} />
                    <Text style={[styles.themeLabelCompact, { color: colors.textSecondary }]}>{THEME_LABELS[theme]}</Text>
                    <Text style={[styles.wordCountCompact, { color: colors.textMuted }]}>· {wordCount} words</Text>
                  </View>
                  <Pressable style={styles.editCta} onPress={openWriteModal}>
                    <Text style={[styles.editCtaText, { color: colors.accent }]}>Edit</Text>
                  </Pressable>
                </View>
              </>
            )}
          </Card>

          {hasContent && (
            <Pressable
              style={[
                styles.button,
                isDark && { backgroundColor: DARK_BUTTON_BG, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
              ]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>Save Reflection</Text>
            </Pressable>
          )}

          <View style={[styles.dateBottomWrap, { paddingBottom: 40 + insets.bottom }]}>
            <View style={styles.dateBottomSpacer} />
            <Text style={[styles.todayDateBottom, { color: colors.textMuted }]}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>

          <SmoothBottomModal
            ref={writeModalRef}
            visible={writeModalVisible}
            onClose={() => setWriteModalVisible(false)}
            contentContainerStyle={{
              paddingTop: insets.top + 12,
              paddingBottom: insets.bottom + 12,
              backgroundColor: colors.surface,
            }}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalQuestion, { color: colors.text }]} numberOfLines={3}>
                {prompt}
              </Text>
              <View style={styles.modalMeta}>
                <ThemeIcon theme={theme} size={18} color={colors.accent} />
                <Text style={[styles.modalThemeLabel, { color: colors.textSecondary }]}>{THEME_LABELS[theme]}</Text>
                <Text style={[styles.modalWordCount, { color: colors.textMuted }]}>{wordCount} words</Text>
              </View>
            </View>
            <TextInput
              style={[
                styles.modalInput,
                { color: colors.text, borderBottomColor: colors.border },
              ]}
              placeholder="Start writing..."
              placeholderTextColor={colors.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              autoFocus
            />
            <Pressable
              style={[
                styles.doneButton,
                isDark && { backgroundColor: DARK_BUTTON_BG, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
              ]}
              onPress={closeWriteModal}
            >
              <Text style={[styles.doneButtonText, { color: colors.text }]}>Done</Text>
            </Pressable>
          </SmoothBottomModal>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F4EFE7',
  },
  keyboardView: {
    flex: 1,
  },
  topSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: -24,
    paddingBottom: 6,
    overflow: 'hidden',
  },
  lineOnEdge: {
    marginHorizontal: -24,
    marginTop: -4,
    zIndex: 1,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 0,
  },
  heroCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8A8580',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  paddedContent: {
    padding: 24,
    paddingTop: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  greeting: {
    fontSize: 28,
    color: '#2F2F2F',
    fontFamily: 'CormorantGaramond_600SemiBold',
    marginBottom: 6,
    textAlign: 'center',
  },
  consistency: {
    fontSize: 16,
    color: '#6A6A6A',
    fontFamily: 'Inter_400Regular',
    marginBottom: 12,
    textAlign: 'center',
  },
  dateBottomWrap: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  dateBottomSpacer: {
    flexGrow: 1,
    minHeight: 24,
  },
  todayDateBottom: {
    fontSize: 20,
    color: '#8A8580',
    fontFamily: 'CormorantGaramond_400Regular',
    textAlign: 'center',
  },
  chooseLabel: {
    fontSize: 21,
    color: '#6A6A6A',
    fontFamily: 'CormorantGaramond_600SemiBold',
    letterSpacing: 0.2,
    marginBottom: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  chipSeparatorWrap: {
    marginVertical: 8,
  },
  chipGrid: {
    marginTop: 16,
    marginBottom: 28,
    alignItems: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    gap: CHIP_GAP,
    marginBottom: CHIP_GAP,
  },
  chipRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: CHIP_GAP,
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#8A8580',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  chipActive: {
    borderWidth: 1.5,
    shadowColor: CHIP_ACTIVE_COLOR,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  chipIconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  chipLabel: {
    fontSize: 12,
    color: '#6A6A6A',
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.15,
  },
  chipLabelActive: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  reflectionCard: {
    marginBottom: 24,
    shadowColor: '#8A8580',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  promptText: {
    fontSize: 22,
    color: '#2F2F2F',
    fontFamily: 'CormorantGaramond_600SemiBold',
    lineHeight: 32,
    letterSpacing: 0.3,
    marginBottom: 20,
    textAlign: 'center',
  },
  writeCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: CHIP_ACTIVE_COLOR,
    borderWidth: 1,
    borderColor: '#B5A48A',
    shadowColor: '#B5A48A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  writeCtaText: {
    fontSize: 19,
    color: '#2F2F2F',
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  previewLabel: {
    fontSize: 15,
    color: '#8A8580',
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 19,
    color: '#2F2F2F',
    fontFamily: 'CormorantGaramond_400Regular',
    lineHeight: 28,
  },
  previewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  themeRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  themeLabelCompact: {
    fontSize: 16,
    color: '#6A6A6A',
    fontFamily: 'CormorantGaramond_400Regular',
  },
  wordCountCompact: {
    fontSize: 15,
    color: '#8A8580',
    fontFamily: 'CormorantGaramond_400Regular',
  },
  editCta: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editCtaText: {
    fontSize: 17,
    color: CHIP_ACTIVE_COLOR,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalQuestion: {
    fontSize: 24,
    color: '#2F2F2F',
    fontFamily: 'CormorantGaramond_600SemiBold',
    lineHeight: 32,
    letterSpacing: 0.3,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalThemeLabel: {
    fontSize: 17,
    color: '#6A6A6A',
    fontFamily: 'CormorantGaramond_400Regular',
  },
  modalWordCount: {
    fontSize: 16,
    color: '#8A8580',
    fontFamily: 'CormorantGaramond_400Regular',
  },
  modalInput: {
    minHeight: 180,
    fontSize: 20,
    color: '#2F2F2F',
    fontFamily: 'CormorantGaramond_400Regular',
    lineHeight: 30,
    paddingVertical: 14,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    backgroundColor: 'transparent',
    marginBottom: 20,
  },
  doneButton: {
    backgroundColor: '#C8B79E',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#B5A48A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  doneButtonText: {
    fontSize: 20,
    color: '#2F2F2F',
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  button: {
    backgroundColor: '#C8B79E',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#B5A48A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#2F2F2F',
    fontSize: 20,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
});
