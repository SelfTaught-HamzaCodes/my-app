/**
 * Storage keys for the Peacefully app.
 * All data is kept locally (AsyncStorage); we use a single prefix so keys are easy to find and clear.
 */
export const STORAGE_KEYS = {
  REFLECTIONS: '@peacefully/reflections',
  ONBOARDING_DONE: '@peacefully/onboarding_done',
  USER_NAME: '@peacefully/user_name',
  DAILY_REMINDER_ENABLED: '@peacefully/daily_reminder_enabled',
  REMINDER_TIME: '@peacefully/reminder_time',
  DARK_MODE: '@peacefully/dark_mode',
};
