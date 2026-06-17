// A small top-5 high-score table persisted in localStorage.
const KEY = 'galaxyfight.highscores';
const MAX = 5;

export function loadScores() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(raw) ? raw.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

export function highScore() {
  const s = loadScores();
  return s.length ? s[0] : 0;
}

// Insert a score, keep the top MAX, persist, and return the new list.
export function saveScore(score) {
  const s = loadScores();
  s.push(score);
  s.sort((a, b) => b - a);
  const top = s.slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(top));
  } catch {
    // ignore storage failures (e.g. private mode)
  }
  return top;
}
