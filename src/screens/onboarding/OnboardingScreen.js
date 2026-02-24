import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { setOnboardingDone, setUserName, setDailyReminderEnabled } from '../../data/storage';
import LineWithDiamond from '../../components/LineWithDiamond';
import SubtlePatternBackground from '../../components/SubtlePatternBackground';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * First-time onboarding: app name, tagline, name input, and “remind me” toggle. On Begin we save
 * name and reminder preference, mark onboarding done, and replace with the main tab navigator.
 * Supports both light and dark theme.
 */
export default function OnboardingScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [remindMe, setRemindMe] = useState(true);

  async function handleBeginJourney() {
    await setUserName(name.trim());
    await setDailyReminderEnabled(remindMe);
    await setOnboardingDone();
    navigation.replace('Main');
  }

  const width = Dimensions.get('window').width;
  const arcRadius = width / 2;
  const curveHeight = arcRadius + insets.top;
  const arcOffsetUp = 48;

  const dynamicStyles = {
    wrapper: { backgroundColor: colors.background },
    topCurve: { backgroundColor: colors.surface },
    heroCircle: { backgroundColor: colors.surface },
    appName: { color: colors.text },
    heading: { color: colors.text },
    subtitle: { color: colors.textSecondary },
    label: { color: colors.textSecondary },
    input: { backgroundColor: colors.surface, color: colors.text },
    segmented: { backgroundColor: colors.surface },
    segmentTextInactive: { color: colors.textSecondary },
    footer: { backgroundColor: colors.surface },
    footerLine1: { color: colors.text },
    footerLine2: { color: colors.textSecondary },
  };

  return (
    <View style={[styles.wrapper, dynamicStyles.wrapper]}>
      <SubtlePatternBackground />
      {/* Perfect semicircle arc (half circle at bottom) */}
      <View
        style={[
          styles.topCurve,
          dynamicStyles.topCurve,
          {
            top: -arcOffsetUp,
            height: curveHeight,
            borderBottomLeftRadius: arcRadius,
            borderBottomRightRadius: arcRadius,
          },
        ]}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + arcRadius + 24 - arcOffsetUp,
              paddingBottom: 24 + 90 + insets.bottom,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero: circle overlapping curve + app name */}
          <View style={styles.hero}>
            <View style={[styles.heroCircle, dynamicStyles.heroCircle]}>
              <Ionicons name="leaf" size={44} color={colors.accent} />
            </View>
            <Text style={[styles.appName, dynamicStyles.appName]}>Peacefully</Text>
          </View>

          {/* Separator: thin line with unfilled diamond in center */}
          <LineWithDiamond diamondColor={colors.accent} />

          <Text style={[styles.heading, dynamicStyles.heading]}>Pause, Reflect and Grow</Text>
          <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
            A quiet space to build awareness and strengthen consistency in your journey.
          </Text>

          <Text style={[styles.label, dynamicStyles.label]}>What should we call you?</Text>
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <Text style={[styles.label, dynamicStyles.label]}>Would you want us to remind you?</Text>
          <View style={[styles.segmented, dynamicStyles.segmented]}>
            <Pressable
              style={[styles.segment, remindMe && styles.segmentActive]}
              onPress={() => setRemindMe(true)}
            >
              <Text style={[remindMe ? styles.segmentTextActive : styles.segmentTextInactive, !remindMe && dynamicStyles.segmentTextInactive]}>Yes</Text>
            </Pressable>
            <Pressable
              style={[styles.segment, !remindMe && styles.segmentActive]}
              onPress={() => setRemindMe(false)}
            >
              <Text style={[!remindMe ? styles.segmentTextActive : styles.segmentTextInactive, remindMe && dynamicStyles.segmentTextInactive]}>No</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handleBeginJourney}
          >
            <Text style={styles.buttonText}>Begin Your Journey</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer: fixed to bottom, does not rise with keyboard */}
      <View style={[styles.footer, dynamicStyles.footer, { paddingBottom: 20 + insets.bottom }]}>
        <Text style={[styles.footerLine1, dynamicStyles.footerLine1]}>Your Reflections are solely yours</Text>
        <Text style={[styles.footerLine2, dynamicStyles.footerLine2]}>Your reflections don't leave your device</Text>
      </View>
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
  topCurve: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  hero: {
    alignItems: 'center',
    marginTop: -72,
    marginBottom: 0,
  },
  heroCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#2F2F2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  appName: {
    fontSize: 36,
    color: '#2F2F2F',
    letterSpacing: 0.5,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  heading: {
    fontSize: 26,
    color: '#2F2F2F',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  subtitle: {
    fontSize: 17,
    color: '#6A6A6A',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    paddingHorizontal: 8,
    fontFamily: 'Inter_400Regular',
  },
  label: {
    fontSize: 22,
    color: '#6A6A6A',
    alignSelf: 'stretch',
    marginBottom: 8,
    fontFamily: 'CormorantGaramond_600SemiBold',
    textAlign: 'center',
  },
  input: {
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    color: '#2F2F2F',
    marginBottom: 20,
    fontFamily: 'Inter_400Regular',
    shadowColor: '#2F2F2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  segmented: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginBottom: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#2F2F2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  segmentActive: {
    backgroundColor: '#C8B79E',
    shadowColor: '#2F2F2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  segmentTextActive: {
    fontSize: 19,
    color: '#FFFFFF',
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  segmentTextInactive: {
    fontSize: 19,
    color: '#6A6A6A',
    fontFamily: 'CormorantGaramond_400Regular',
  },
  button: {
    backgroundColor: '#C8B79E',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    shadowColor: '#2F2F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  footerLine1: {
    fontSize: 20,
    color: '#2F2F2F',
    marginBottom: 6,
    fontFamily: 'CormorantGaramond_600SemiBold',
    textAlign: 'center',
  },
  footerLine2: {
    fontSize: 18,
    color: '#6A6A6A',
    fontFamily: 'CormorantGaramond_400Regular',
    textAlign: 'center',
  },
});
