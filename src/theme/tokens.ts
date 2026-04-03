export const themeStorageKey = 'app-theme-mode';
export const themeAttribute = 'data-theme';
export const themeModes = ['light', 'dark'] as const;

export type ThemeMode = (typeof themeModes)[number];

export const tokenVars = {
  color: {
    brand: {
      50: '--color-brand-50',
      100: '--color-brand-100',
      200: '--color-brand-200',
      300: '--color-brand-300',
      400: '--color-brand-400',
      500: '--color-brand-500',
      600: '--color-brand-600',
      700: '--color-brand-700',
      800: '--color-brand-800',
      900: '--color-brand-900'
    },
    gray: {
      0: '--color-gray-0',
      25: '--color-gray-25',
      50: '--color-gray-50',
      100: '--color-gray-100',
      200: '--color-gray-200',
      300: '--color-gray-300',
      400: '--color-gray-400',
      500: '--color-gray-500',
      600: '--color-gray-600',
      700: '--color-gray-700',
      800: '--color-gray-800',
      900: '--color-gray-900',
      950: '--color-gray-950'
    },
    background: {
      canvas: '--color-bg-canvas',
      surface: '--color-bg-surface',
      raised: '--color-bg-raised',
      inverse: '--color-bg-inverse'
    },
    foreground: {
      default: '--color-fg-default',
      muted: '--color-fg-muted',
      subtle: '--color-fg-subtle',
      inverse: '--color-fg-inverse'
    },
    border: {
      default: '--color-border-default',
      strong: '--color-border-strong',
      focus: '--color-border-focus'
    },
    status: {
      success: '--color-status-success',
      warning: '--color-status-warning',
      error: '--color-status-error',
      info: '--color-status-info'
    }
  },
  font: {
    sans: '--font-family-sans',
    sizeXs: '--font-size-xs',
    sizeSm: '--font-size-sm',
    sizeMd: '--font-size-md',
    sizeLg: '--font-size-lg',
    sizeXl: '--font-size-xl',
    size2xl: '--font-size-2xl',
    size3xl: '--font-size-3xl',
    size4xl: '--font-size-4xl',
    weightRegular: '--font-weight-regular',
    weightMedium: '--font-weight-medium',
    weightSemibold: '--font-weight-semibold',
    weightBold: '--font-weight-bold',
    lineHeightTight: '--line-height-tight',
    lineHeightNormal: '--line-height-normal',
    lineHeightRelaxed: '--line-height-relaxed'
  },
  space: {
    unit: '--space-unit',
    0: '--space-0',
    1: '--space-1',
    2: '--space-2',
    3: '--space-3',
    4: '--space-4',
    5: '--space-5',
    6: '--space-6',
    8: '--space-8',
    10: '--space-10',
    12: '--space-12',
    16: '--space-16',
    20: '--space-20',
    24: '--space-24'
  },
  radius: {
    sm: '--radius-sm',
    md: '--radius-md',
    lg: '--radius-lg',
    xl: '--radius-xl',
    full: '--radius-full'
  },
  shadow: {
    xs: '--shadow-xs',
    sm: '--shadow-sm',
    md: '--shadow-md',
    lg: '--shadow-lg',
    xl: '--shadow-xl'
  },
  zIndex: {
    base: '--z-base',
    dropdown: '--z-dropdown',
    sticky: '--z-sticky',
    appBar: '--z-app-bar',
    drawer: '--z-drawer',
    modal: '--z-modal',
    toast: '--z-toast',
    tooltip: '--z-tooltip'
  }
} as const;

export const cssVar = (tokenName: string) => `var(${tokenName})`;
