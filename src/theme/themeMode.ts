import { themeAttribute, themeModes, themeStorageKey, type ThemeMode } from '@theme/tokens';

const isThemeMode = (value: string | null): value is ThemeMode =>
  value !== null && themeModes.includes(value as ThemeMode);

export const getPreferredThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedMode = window.localStorage.getItem(themeStorageKey);

  if (isThemeMode(storedMode)) {
    return storedMode;
  }

  if (typeof window.matchMedia !== 'function') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const applyThemeMode = (mode: ThemeMode) => {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.setAttribute(themeAttribute, mode);
  document.documentElement.style.colorScheme = mode;
};

export const persistThemeMode = (mode: ThemeMode) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(themeStorageKey, mode);
};

export const initializeThemeMode = () => {
  const initialMode = getPreferredThemeMode();

  applyThemeMode(initialMode);

  return initialMode;
};
