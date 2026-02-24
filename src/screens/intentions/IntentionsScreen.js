import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  Switch,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import LineWithDiamond from '../../components/LineWithDiamond';
import SubtlePatternBackground from '../../components/SubtlePatternBackground';
import SmoothBottomModal from '../../components/SmoothBottomModal';
import {
  getDailyReminderEnabled,
  setDailyReminderEnabled,
  getReminderTime,
  setReminderTime,
  clearAllReflections,
  clearOnboardingDone,
} from '../../data/storage';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
} from '../../services/reminderNotifications';
import { useReflections } from '../../hooks/useReflections';
import { useTheme } from '../../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const APP_VERSION = '1.0';

const RESET_RED = '#C44B4B';

/**
 * Settings / Intentions: daily reminder (toggle + time picker in a modal), dark mode, developer
 * links, Reset Journey (clears data and sends user back to onboarding). Time row is disabled when
 * reminder is off.
 */
export default function IntentionsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors, isDark, setDarkMode } = useTheme();
  const { refresh } = useReflections();
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderTime, setReminderTimeState] = useState('8:00 pm');
  const [timePickerDate, setTimePickerDate] = useState(() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const timePickerModalRef = useRef(null);

  const formatTimeForDisplay = (timeStr) => {
    if (!timeStr) return '9:00 am';
    const [h, m] = timeStr.split(':').map(Number);
    const hour = h % 12 || 12;
    const ampm = h < 12 ? 'am' : 'pm';
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  useFocusEffect(
    useCallback(() => {
      getDailyReminderEnabled().then(setReminderOn);
      getReminderTime().then((t) => {
        if (t) {
          setReminderTimeState(formatTimeForDisplay(t));
          const [h, m] = t.split(':').map(Number);
          const d = new Date();
          d.setHours(Number(h) || 9, Number(m) || 0, 0, 0);
          setTimePickerDate(d);
        }
      });
    }, [])
  );

  const handleReminderToggle = async (value) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Notifications',
          'Enable notifications in Settings to get daily reminders.'
        );
        return;
      }
      const timeStr = await getReminderTime();
      const [h, m] = (timeStr || '09:00').split(':').map(Number);
      await scheduleDailyReminder(Number(h) || 9, Number(m) || 0);
    } else {
      await cancelDailyReminder();
    }
    setReminderOn(value);
    setDailyReminderEnabled(value);
  };

  const handleTimePickerChange = (event, selectedDate) => {
    if (selectedDate) setTimePickerDate(selectedDate);
  };

  const saveReminderTime = async (date) => {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    await setReminderTime(timeStr);
    setReminderTimeState(formatTimeForDisplay(timeStr));
    if (reminderOn) await scheduleDailyReminder(hour, minute);
  };

  const handleTimePickerDone = () => {
    timePickerModalRef.current?.requestClose?.();
    saveReminderTime(timePickerDate);
  };

  const handleTimePickerClose = () => {
    setShowTimePicker(false);
  };

  const handleDarkModeToggle = (value) => {
    setDarkMode(value);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Journey',
      'This will permanently delete all your reflections and return you to onboarding. You can’t undo this.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearAllReflections();
            await clearOnboardingDone();
            refresh();
            const root = navigation.getParent()?.getParent() ?? navigation;
            root.dispatch(
              CommonActions.reset({ index: 0, routes: [{ name: 'Onboarding' }] })
            );
          },
        },
      ]
    );
  };

  const openLink = (url) => {
    if (url) Linking.openURL(url).catch(() => {});
  };

  const dynamicStyles = {
    wrapper: { backgroundColor: colors.background },
    topSection: { backgroundColor: colors.surface },
    heading: { color: colors.text },
    sectionTitle: { color: colors.text },
    card: { backgroundColor: colors.surface },
    cardBorder: { borderColor: colors.border },
    rowLabel: { color: colors.text },
    rowValue: { color: colors.textSecondary },
    devNoteCard: { backgroundColor: colors.surface },
    devNoteText: { color: colors.text },
    versionText: { color: colors.textMuted },
  };

  return (
    <View style={[styles.wrapper, dynamicStyles.wrapper]}>
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
            dynamicStyles.topSection,
            { paddingTop: insets.top + 6, width: screenWidth },
            isDark && { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
          ]}
        >
          <Text style={[styles.heading, dynamicStyles.heading]}>Intentions</Text>
        </View>
        <View style={[styles.lineOnEdge, { width: screenWidth }]}>
          <LineWithDiamond flush diamondColor={colors.accent} />
        </View>
        <View style={styles.paddedContent}>
          {/* Reminders */}
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Reminders</Text>
          <View style={[styles.card, dynamicStyles.card, isDark && styles.darkCard]}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrap, { backgroundColor: colors.accentMuted }]}>
                  <Ionicons name="notifications-outline" size={22} color={colors.accent} />
                </View>
                <Text style={[styles.rowLabel, dynamicStyles.rowLabel]}>Daily Reminder</Text>
              </View>
              <Switch
                value={reminderOn}
                onValueChange={handleReminderToggle}
                trackColor={{ false: colors.border, true: colors.accentMuted }}
                thumbColor={reminderOn ? colors.accent : colors.surfaceSecondary}
              />
            </View>
            <View style={[styles.divider, dynamicStyles.cardBorder]} />
            <Pressable
              style={[styles.row, !reminderOn && styles.timeRowDisabled]}
              onPress={() => reminderOn && setShowTimePicker(true)}
              disabled={!reminderOn}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrap, { backgroundColor: colors.accentMuted }]}>
                  <Ionicons name="time-outline" size={22} color={reminderOn ? colors.accent : colors.textMuted} />
                </View>
                <Text style={[styles.rowLabel, dynamicStyles.rowLabel, !reminderOn && { color: colors.textMuted }]}>Time</Text>
              </View>
              <Text style={[styles.rowValue, dynamicStyles.rowValue, !reminderOn && { color: colors.textMuted }]}>{reminderTime}</Text>
            </Pressable>
          </View>
          <SmoothBottomModal
            ref={timePickerModalRef}
            visible={showTimePicker}
            onClose={handleTimePickerClose}
            contentContainerStyle={[styles.timePickerModalContent, { backgroundColor: colors.surface, paddingBottom: 24 + insets.bottom }]}
          >
            <Text style={[styles.timePickerModalTitle, dynamicStyles.sectionTitle]}>Reminder time</Text>
            <DateTimePicker
              value={timePickerDate}
              mode="time"
              display="spinner"
              onChange={handleTimePickerChange}
              style={styles.timePicker}
            />
            <View style={styles.timePickerActions}>
              <Pressable
                style={[styles.timePickerButton, styles.timePickerButtonCancel, { borderColor: colors.border }]}
                onPress={() => timePickerModalRef.current?.requestClose?.()}
              >
                <Text style={[styles.timePickerButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.timePickerButton, styles.timePickerButtonDone, { backgroundColor: colors.accent }]}
                onPress={handleTimePickerDone}
              >
                <Text style={styles.timePickerButtonDoneText}>Done</Text>
              </Pressable>
            </View>
          </SmoothBottomModal>

          {/* Theme */}
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Theme</Text>
          <View style={[styles.card, dynamicStyles.card, isDark && styles.darkCard]}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrap, { backgroundColor: colors.accentMuted }]}>
                  <Ionicons name="moon-outline" size={22} color={colors.accent} />
                </View>
                <Text style={[styles.rowLabel, dynamicStyles.rowLabel]}>Dark Mode</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: colors.border, true: colors.accentMuted }}
                thumbColor={isDark ? colors.accent : colors.surfaceSecondary}
              />
            </View>
          </View>

          {/* Developer's Note */}
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Developer's Note</Text>
          <View style={[styles.devNoteCard, dynamicStyles.devNoteCard, dynamicStyles.cardBorder, isDark && styles.darkCard]}>
            <Pressable style={styles.devNoteRow} onPress={() => openLink('https://example.com/terms')}>
              <Text style={[styles.devNoteText, dynamicStyles.devNoteText]}>Terms & Conditions</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
            <View style={[styles.divider, dynamicStyles.cardBorder]} />
            <Pressable style={styles.devNoteRow} onPress={() => openLink('https://example.com/privacy')}>
              <Text style={[styles.devNoteText, dynamicStyles.devNoteText]}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
            <View style={[styles.divider, dynamicStyles.cardBorder]} />
            <Pressable style={styles.devNoteRow} onPress={() => openLink('https://apps.apple.com/app/idXXXXXXXX')}>
              <Text style={[styles.devNoteText, dynamicStyles.devNoteText]}>Leave a review</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          </View>

          <Pressable style={[styles.resetButton, { backgroundColor: RESET_RED }]} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset Journey</Text>
          </Pressable>

          <Text style={[styles.version, dynamicStyles.versionText]}>Version {APP_VERSION}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  topSection: {
    marginHorizontal: -24,
    paddingBottom: 6,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  lineOnEdge: { marginHorizontal: -24, marginTop: -4, zIndex: 1 },
  paddedContent: { paddingTop: 20, paddingBottom: 24 },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'CormorantGaramond_600SemiBold',
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  card: {
    borderRadius: 22,
    paddingVertical: 8,
    marginBottom: 20,
    shadowColor: '#8A8580',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { fontSize: 18, fontFamily: 'CormorantGaramond_600SemiBold' },
  rowValue: { fontSize: 17, fontFamily: 'Inter_500Medium' },
  timeRowDisabled: { opacity: 0.7 },
  divider: { height: 1, marginHorizontal: 20, borderTopWidth: 1 },
  devNoteCard: {
    borderRadius: 22,
    paddingVertical: 4,
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: '#8A8580',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
  },
  devNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  devNoteText: { fontSize: 18, fontFamily: 'Inter_500Medium' },
  resetButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#C44B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  resetButtonText: {
    fontSize: 19,
    color: '#FFFFFF',
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  version: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  timePickerModalContent: {
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  timePickerModalTitle: {
    marginBottom: 12,
    fontSize: 20,
  },
  timePicker: {
    alignSelf: 'center',
    marginVertical: 8,
  },
  timePickerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  timePickerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  timePickerButtonCancel: {
    borderWidth: 1,
  },
  timePickerButtonDone: {},
  timePickerButtonText: {
    fontSize: 18,
    fontFamily: 'Inter_500Medium',
  },
  timePickerButtonDoneText: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: '#2F2F2F',
  },
  darkCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowOpacity: 0,
  },
});
