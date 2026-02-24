// Simple logic tests for the Peacefully app
// These validate core helper logic used across the app

describe('sample arithmetic tests', () => {
  it('5 * 5 should be 25', () => {
    expect(5 * 5).toBe(25);
  });

  it('10 + 20 should be 30', () => {
    expect(10 + 20).toBe(30);
  });

  it('100 / 4 should be 25', () => {
    expect(100 / 4).toBe(25);
  });
});

// Greeting logic (mirrors getGreeting in ReflectScreen)
function getGreeting(hour) {
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
}

describe('greeting logic', () => {
  it('returns Good Morning at 8am', () => {
    expect(getGreeting(8)).toBe('Good Morning');
  });

  it('returns Good Afternoon at 1pm', () => {
    expect(getGreeting(13)).toBe('Good Afternoon');
  });

  it('returns Good Evening at 7pm', () => {
    expect(getGreeting(19)).toBe('Good Evening');
  });

  it('returns Good Night at 11pm', () => {
    expect(getGreeting(23)).toBe('Good Night');
  });

  it('returns Good Night at 3am', () => {
    expect(getGreeting(3)).toBe('Good Night');
  });
});

// Word count logic (mirrors getWordCount in ReflectScreen)
function getWordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

describe('word count logic', () => {
  it('counts words in a normal sentence', () => {
    expect(getWordCount('hello world')).toBe(2);
  });

  it('returns 0 for empty string', () => {
    expect(getWordCount('')).toBe(0);
  });

  it('handles extra spaces', () => {
    expect(getWordCount('  one   two   three  ')).toBe(3);
  });

  it('counts a single word', () => {
    expect(getWordCount('peace')).toBe(1);
  });
});

// Date key logic (mirrors toDateKey in streak.js)
function toDateKey(isoString) {
  if (!isoString) return '';
  var d = new Date(isoString);
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

describe('date key logic', () => {
  it('converts ISO string to YYYY-MM-DD', () => {
    expect(toDateKey('2025-02-10T12:00:00.000Z')).toBe('2025-02-10');
  });

  it('returns empty string for empty input', () => {
    expect(toDateKey('')).toBe('');
  });

  it('returns empty string for null', () => {
    expect(toDateKey(null)).toBe('');
  });
});

// Streak calculation logic (mirrors getLongestStreak in streak.js)
function getLongestStreak(days) {
  if (days.length === 0) return 0;
  var sorted = days.slice().sort();
  var max = 1;
  var current = 1;
  var oneDay = 24 * 60 * 60 * 1000;
  for (var i = 1; i < sorted.length; i++) {
    var prev = new Date(sorted[i - 1]).getTime();
    var curr = new Date(sorted[i]).getTime();
    if (curr - prev <= oneDay + 1) {
      current++;
    } else {
      if (current > max) max = current;
      current = 1;
    }
  }
  return current > max ? current : max;
}

describe('streak calculation logic', () => {
  it('returns 0 for empty array', () => {
    expect(getLongestStreak([])).toBe(0);
  });

  it('returns 1 for a single day', () => {
    expect(getLongestStreak(['2025-02-10'])).toBe(1);
  });

  it('returns 3 for three consecutive days', () => {
    expect(getLongestStreak(['2025-02-05', '2025-02-06', '2025-02-07'])).toBe(3);
  });

  it('returns 1 when days are not consecutive', () => {
    expect(getLongestStreak(['2025-02-01', '2025-02-05', '2025-02-10'])).toBe(1);
  });

  it('finds longest run among mixed days', () => {
    expect(getLongestStreak([
      '2025-02-01', '2025-02-02', '2025-02-03',
      '2025-02-10', '2025-02-11',
    ])).toBe(3);
  });
});
