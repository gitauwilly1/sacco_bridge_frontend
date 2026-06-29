const FONT_SIZE_KEY = 'font-size';
const REDUCE_MOTION_KEY = 'reduce-motion';
const HIGH_CONTRAST_KEY = 'high-contrast';

export function applyFontSize(size = 'medium') {
  const root = document.documentElement;
  root.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
  root.classList.add(`font-size-${size}`);
  localStorage.setItem(FONT_SIZE_KEY, size);
}

export function applyReduceMotion(enabled) {
  const root = document.documentElement;
  if (enabled) {
    root.classList.add('reduce-motion');
  } else {
    root.classList.remove('reduce-motion');
  }
  localStorage.setItem(REDUCE_MOTION_KEY, enabled ? 'true' : 'false');
}

export function applyHighContrast(enabled) {
  if (enabled) {
    document.body.classList.add('high-contrast');
  } else {
    document.body.classList.remove('high-contrast');
  }
  localStorage.setItem(HIGH_CONTRAST_KEY, enabled ? 'true' : 'false');
}

/** Apply saved appearance prefs before React mounts (also called from inline script). */
export function initAppearanceFromStorage() {
  if (typeof window === 'undefined') return;

  const fontSize = localStorage.getItem(FONT_SIZE_KEY) || 'medium';
  applyFontSize(fontSize);
  applyReduceMotion(localStorage.getItem(REDUCE_MOTION_KEY) === 'true');
  applyHighContrast(localStorage.getItem(HIGH_CONTRAST_KEY) === 'true');
}

export function getStoredFontSize() {
  return localStorage.getItem(FONT_SIZE_KEY) || 'medium';
}

export function getStoredReduceMotion() {
  return localStorage.getItem(REDUCE_MOTION_KEY) === 'true';
}

export function getStoredHighContrast() {
  return localStorage.getItem(HIGH_CONTRAST_KEY) === 'true';
}
