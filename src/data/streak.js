/**
 * Streak logic: one reflection per calendar day counts as one day.
 * Multiple reflections on the same day still count as a single day for the streak.
 */

/** Turn an ISO date string into YYYY-MM-DD for consistent day comparison */
function toDateKey(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Sorted list of unique days (YYYY-MM-DD) that have at least one reflection */
export function getUniqueReflectionDays(reflections) {
  const set = new Set();
  reflections.forEach((r) => {
    const key = toDateKey(r.date);
    if (key) set.add(key);
  });
  return Array.from(set).sort();
}

/** Current streak: how many consecutive days up to and including today (0 if today has no reflection) */
export function getCurrentStreak(reflections) {
  const days = getUniqueReflectionDays(reflections);
  if (days.length === 0) return 0;
  const today = toDateKey(new Date().toISOString());
  if (!days.includes(today)) return 0;
  let count = 0;
  const oneDay = 24 * 60 * 60 * 1000;
  let prev = new Date(today).getTime();
  for (let i = days.indexOf(today); i >= 0; i--) {
    const curr = new Date(days[i]).getTime();
    if (prev - curr > oneDay + 1) break;
    count++;
    prev = curr;
  }
  return count;
}

/** Longest run of consecutive days with at least one reflection (over all time) */
export function getLongestStreak(reflections) {
  const days = getUniqueReflectionDays(reflections);
  if (days.length === 0) return 0;
  let max = 1;
  let current = 1;
  const oneDay = 24 * 60 * 60 * 1000;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]).getTime();
    const curr = new Date(days[i]).getTime();
    if (curr - prev <= oneDay + 1) {
      current++;
    } else {
      max = Math.max(max, current);
      current = 1;
    }
  }
  return Math.max(max, current);
}
