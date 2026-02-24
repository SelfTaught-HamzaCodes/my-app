import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { getDailyReminderEnabled, getReminderTime } from '../data/storage';

/**
 * Daily reminder: one local notification per day at the user-chosen time.
 * Uses a fixed identifier so we can cancel and reschedule without leaving duplicates.
 *
 * Note: Android push support was removed from Expo Go in SDK 53. We lazy-load
 * expo-notifications so it's never loaded on Android in Expo Go, avoiding the
 * "Use a development build" error. Reminders are no-ops there; they work in
 * dev builds and on iOS.
 */
const DAILY_REMINDER_ID = 'peacefully-daily-reminder';
const ANDROID_CHANNEL_ID = 'peacefully-daily-reminder';

const isExpoGoOnAndroid =
  Platform.OS === 'android' && Constants.appOwnership === 'expo';

let notificationsModule = null;

async function getNotifications() {
  if (notificationsModule !== null) return notificationsModule;
  if (isExpoGoOnAndroid) return null;
  const mod = await import('expo-notifications');
  notificationsModule = mod.default ?? mod;
  // Set handler once when we first load the module
  notificationsModule.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  return notificationsModule;
}

export async function requestNotificationPermission() {
  const Notifications = await getNotifications();
  if (!Notifications) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function ensureAndroidChannel(Notifications) {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Daily reminder',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: true,
  });
}

/**
 * Schedule a daily reminder at the given hour (0-23) and minute (0-59).
 * Cancels any existing daily reminder first.
 */
export async function scheduleDailyReminder(hour, minute) {
  const Notifications = await getNotifications();
  if (!Notifications) return;
  await cancelDailyReminder();
  await ensureAndroidChannel(Notifications);

  const trigger = {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour: Number(hour),
    minute: Number(minute),
    ...(Platform.OS === 'android' && { channelId: ANDROID_CHANNEL_ID }),
  };

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: 'Time to reflect',
      body: 'Take a moment for your daily reflection.',
      sound: true,
    },
    trigger,
  });
}

/**
 * Cancel the daily reminder notification.
 */
export async function cancelDailyReminder() {
  const Notifications = await getNotifications();
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
  } catch (e) {
    // Ignore if not scheduled
  }
}

/**
 * Reschedule from storage (e.g. on app start). If daily reminder is enabled, schedules at saved time.
 */
export async function rescheduleFromStorage() {
  try {
    const enabled = await getDailyReminderEnabled();
    if (!enabled) {
      await cancelDailyReminder();
      return;
    }
    const timeStr = await getReminderTime();
    const [h, m] = (timeStr || '09:00').split(':').map(Number);
    const hour = Number.isNaN(h) ? 9 : h;
    const minute = Number.isNaN(m) ? 0 : m;
    await scheduleDailyReminder(hour, minute);
  } catch (e) {
    console.warn('Reminder reschedule failed', e);
  }
}
