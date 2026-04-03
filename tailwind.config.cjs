/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--color-brand-50)',
          100: 'var(--color-brand-100)',
          200: 'var(--color-brand-200)',
          300: 'var(--color-brand-300)',
          400: 'var(--color-brand-400)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
          800: 'var(--color-brand-800)',
          900: 'var(--color-brand-900)'
        },
        canvas: 'var(--color-bg-canvas)',
        surface: {
          DEFAULT: 'var(--color-bg-surface)',
          raised: 'var(--color-bg-raised)',
          inverse: 'var(--color-bg-inverse)'
        },
        ink: {
          DEFAULT: 'var(--color-fg-default)',
          muted: 'var(--color-fg-muted)',
          subtle: 'var(--color-fg-subtle)',
          inverse: 'var(--color-fg-inverse)'
        },
        line: {
          DEFAULT: 'var(--color-border-default)',
          strong: 'var(--color-border-strong)',
          focus: 'var(--color-border-focus)'
        },
        success: 'var(--color-status-success)',
        warning: 'var(--color-status-warning)',
        danger: 'var(--color-status-error)',
        info: 'var(--color-status-info)'
      },
      fontFamily: {
        sans: ['var(--font-family-sans)']
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)'
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)'
      },
      zIndex: {
        base: 'var(--z-base)',
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        app: 'var(--z-app-bar)',
        drawer: 'var(--z-drawer)',
        modal: 'var(--z-modal)',
        toast: 'var(--z-toast)',
        tooltip: 'var(--z-tooltip)'
      }
    }
  },
  plugins: []
};
