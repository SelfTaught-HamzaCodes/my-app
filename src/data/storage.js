import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/keys';

// -----------------------------------------------------------------------------
// Onboarding & user
// -----------------------------------------------------------------------------

export async function getOnboardingDone() {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE);
    return value === 'true';
  } catch (e) {
    return false;
  }
}

export async function setOnboardingDone() {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
  } catch (e) {
    console.warn('Failed to set onboarding done', e);
  }
}

export async function clearOnboardingDone() {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'false');
  } catch (e) {
    console.warn('Failed to clear onboarding done', e);
  }
}

export async function getUserName() {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER_NAME) ?? '';
  } catch (e) {
    return '';
  }
}

export async function setUserName(name) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, name ?? '');
  } catch (e) {
    console.warn('Failed to set user name', e);
  }
}

// -----------------------------------------------------------------------------
// Daily reminder (notification time and on/off)
// -----------------------------------------------------------------------------

export async function getDailyReminderEnabled() {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_REMINDER_ENABLED);
    return value === 'true';
  } catch (e) {
    return false;
  }
}

export async function setDailyReminderEnabled(enabled) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_REMINDER_ENABLED, enabled ? 'true' : 'false');
  } catch (e) {
    console.warn('Failed to set daily reminder', e);
  }
}

export async function getReminderTime() {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.REMINDER_TIME);
    return value ?? '09:00';
  } catch (e) {
    return '09:00';
  }
}

export async function setReminderTime(time) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REMINDER_TIME, time ?? '09:00');
  } catch (e) {
    console.warn('Failed to set reminder time', e);
  }
}

// -----------------------------------------------------------------------------
// Dark mode preference
// -----------------------------------------------------------------------------

export async function getDarkMode() {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE);
    return value === 'true';
  } catch (e) {
    return false;
  }
}

export async function setDarkMode(enabled) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.DARK_MODE, enabled ? 'true' : 'false');
  } catch (e) {
    console.warn('Failed to set dark mode', e);
  }
}

export async function clearAllReflections() {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REFLECTIONS, '[]');
  } catch (e) {
    console.warn('Failed to clear reflections', e);
  }
}

// -----------------------------------------------------------------------------
// Reflections (list and CRUD)
// -----------------------------------------------------------------------------

export async function getReflections() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.REFLECTIONS);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

export async function saveReflection(reflection) {
  const list = await getReflections();
  list.unshift(reflection);
  await AsyncStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(list));
}

export async function updateReflection(updated) {
  const list = await getReflections();
  const idx = list.findIndex((r) => r.id === updated.id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...updated };
  await AsyncStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(list));
}

export async function deleteReflection(id) {
  const list = await getReflections();
  const next = list.filter((r) => r.id !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(next));
}
