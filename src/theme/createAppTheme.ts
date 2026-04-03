import { createTheme, type PaletteMode, type Shadows } from '@mui/material/styles';
import { cssVar, tokenVars, type ThemeMode } from '@theme/tokens';

const readCssColor = (tokenName: string, fallback: string) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const value = getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();

  return value || fallback;
};

const readCssNumber = (tokenName: string, fallback: number) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const value = getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();
  const parsedValue = Number.parseFloat(value);

  return Number.isNaN(parsedValue) ? fallback : parsedValue;
};

const getMuiShadows = (): Shadows => {
  const none = 'none';

  return [
    none,
    cssVar(tokenVars.shadow.xs),
    cssVar(tokenVars.shadow.xs),
    cssVar(tokenVars.shadow.sm),
    cssVar(tokenVars.shadow.sm),
    cssVar(tokenVars.shadow.sm),
    cssVar(tokenVars.shadow.md),
    cssVar(tokenVars.shadow.md),
    cssVar(tokenVars.shadow.md),
    cssVar(tokenVars.shadow.md),
    cssVar(tokenVars.shadow.lg),
    cssVar(tokenVars.shadow.lg),
    cssVar(tokenVars.shadow.lg),
    cssVar(tokenVars.shadow.lg),
    cssVar(tokenVars.shadow.lg),
    cssVar(tokenVars.shadow.xl),
    cssVar(tokenVars.shadow.xl),
    cssVar(tokenVars.shadow.xl),
    cssVar(tokenVars.shadow.xl),
    cssVar(tokenVars.shadow.xl),
    cssVar(tokenVars.shadow.xl),
    cssVar(tokenVars.shadow.xl),
    cssVar(tokenVars.shadow.xl),
    cssVar(tokenVars.shadow.xl),
    cssVar(tokenVars.shadow.xl)
  ];
};

export const createAppTheme = (mode: ThemeMode) =>
  createTheme({
    shape: {
      borderRadius: readCssNumber(tokenVars.radius.lg, 14)
    },
    spacing: (factor: number) => `calc(${cssVar(tokenVars.space.unit)} * ${factor})`,
    typography: {
      fontFamily: cssVar(tokenVars.font.sans),
      h1: {
        fontSize: cssVar(tokenVars.font.size4xl),
        fontWeight: cssVar(tokenVars.font.weightBold),
        lineHeight: cssVar(tokenVars.font.lineHeightTight),
        letterSpacing: '-0.02em'
      },
      h2: {
        fontSize: cssVar(tokenVars.font.size3xl),
        fontWeight: cssVar(tokenVars.font.weightBold),
        lineHeight: cssVar(tokenVars.font.lineHeightTight),
        letterSpacing: '-0.02em'
      },
      h3: {
        fontSize: cssVar(tokenVars.font.size2xl),
        fontWeight: cssVar(tokenVars.font.weightSemibold),
        lineHeight: cssVar(tokenVars.font.lineHeightTight)
      },
      h4: {
        fontSize: cssVar(tokenVars.font.sizeXl),
        fontWeight: cssVar(tokenVars.font.weightSemibold),
        lineHeight: cssVar(tokenVars.font.lineHeightNormal)
      },
      h5: {
        fontSize: cssVar(tokenVars.font.sizeLg),
        fontWeight: cssVar(tokenVars.font.weightSemibold),
        lineHeight: cssVar(tokenVars.font.lineHeightNormal)
      },
      h6: {
        fontSize: cssVar(tokenVars.font.sizeMd),
        fontWeight: cssVar(tokenVars.font.weightSemibold),
        lineHeight: cssVar(tokenVars.font.lineHeightNormal)
      },
      body1: {
        fontSize: cssVar(tokenVars.font.sizeMd),
        lineHeight: cssVar(tokenVars.font.lineHeightRelaxed)
      },
      body2: {
        fontSize: cssVar(tokenVars.font.sizeSm),
        lineHeight: cssVar(tokenVars.font.lineHeightRelaxed)
      },
      button: {
        fontSize: cssVar(tokenVars.font.sizeSm),
        fontWeight: cssVar(tokenVars.font.weightSemibold),
        lineHeight: cssVar(tokenVars.font.lineHeightNormal),
        letterSpacing: '0',
        textTransform: 'none'
      },
      subtitle1: {
        fontSize: cssVar(tokenVars.font.sizeLg),
        fontWeight: cssVar(tokenVars.font.weightMedium)
      },
      subtitle2: {
        fontSize: cssVar(tokenVars.font.sizeSm),
        fontWeight: cssVar(tokenVars.font.weightMedium)
      },
      caption: {
        fontSize: cssVar(tokenVars.font.sizeXs),
        lineHeight: cssVar(tokenVars.font.lineHeightNormal)
      }
    },
    shadows: getMuiShadows(),
    zIndex: {
      appBar: readCssNumber(tokenVars.zIndex.appBar, 1100),
      drawer: readCssNumber(tokenVars.zIndex.drawer, 1200),
      modal: readCssNumber(tokenVars.zIndex.modal, 1300),
      snackbar: readCssNumber(tokenVars.zIndex.toast, 1400),
      tooltip: readCssNumber(tokenVars.zIndex.tooltip, 1500)
    },
    palette: {
      mode: mode as PaletteMode,
      primary: {
        light: readCssColor(tokenVars.color.brand[400], mode === 'dark' ? '#24579c' : '#60a5fa'),
        main: readCssColor(tokenVars.color.brand[600], mode === 'dark' ? '#5b9aff' : '#2563eb'),
        dark: readCssColor(tokenVars.color.brand[700], mode === 'dark' ? '#81b1ff' : '#1d4ed8'),
        contrastText: readCssColor(tokenVars.color.foreground.inverse, mode === 'dark' ? '#0f172a' : '#f8fafc')
      },
      secondary: {
        light: readCssColor(tokenVars.color.gray[300], mode === 'dark' ? '#31425e' : '#cbd5e1'),
        main: readCssColor(tokenVars.color.gray[500], mode === 'dark' ? '#7d8da5' : '#64748b'),
        dark: readCssColor(tokenVars.color.gray[700], mode === 'dark' ? '#cbd5e1' : '#334155'),
        contrastText: readCssColor(tokenVars.color.foreground.inverse, mode === 'dark' ? '#0f172a' : '#f8fafc')
      },
      success: {
        main: readCssColor(tokenVars.color.status.success, mode === 'dark' ? '#4ade80' : '#15803d')
      },
      warning: {
        main: readCssColor(tokenVars.color.status.warning, mode === 'dark' ? '#fbbf24' : '#b45309')
      },
      error: {
        main: readCssColor(tokenVars.color.status.error, mode === 'dark' ? '#f87171' : '#b91c1c')
      },
      info: {
        main: readCssColor(tokenVars.color.status.info, mode === 'dark' ? '#60a5fa' : '#2563eb')
      },
      background: {
        default: readCssColor(tokenVars.color.background.canvas, mode === 'dark' ? '#0f172a' : '#f8fafc'),
        paper: readCssColor(tokenVars.color.background.surface, mode === 'dark' ? '#111827' : '#ffffff')
      },
      text: {
        primary: readCssColor(tokenVars.color.foreground.default, mode === 'dark' ? '#e5edf7' : '#0f172a'),
        secondary: readCssColor(tokenVars.color.foreground.muted, mode === 'dark' ? '#b4c0d3' : '#475569')
      },
      divider: readCssColor(tokenVars.color.border.default, mode === 'dark' ? '#22304a' : '#e2e8f0')
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': {
            colorScheme: mode
          },
          '::selection': {
            backgroundColor: cssVar(tokenVars.color.brand[200]),
            color: cssVar(tokenVars.color.foreground.default)
          },
          body: {
            backgroundColor: cssVar(tokenVars.color.background.canvas),
            color: cssVar(tokenVars.color.foreground.default)
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: cssVar(tokenVars.color.background.surface),
            color: cssVar(tokenVars.color.foreground.default),
            boxShadow: cssVar(tokenVars.shadow.sm),
            borderBottom: `1px solid ${cssVar(tokenVars.color.border.default)}`
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${cssVar(tokenVars.color.border.default)}`
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: cssVar(tokenVars.color.background.surface),
            borderRadius: cssVar(tokenVars.radius.xl),
            boxShadow: cssVar(tokenVars.shadow.sm)
          }
        }
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true
        },
        styleOverrides: {
          root: {
            minHeight: '2.75rem',
            borderRadius: cssVar(tokenVars.radius.md),
            paddingInline: cssVar(tokenVars.space[5])
          },
          contained: {
            boxShadow: 'none'
          },
          outlined: {
            borderColor: cssVar(tokenVars.color.border.strong)
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: cssVar(tokenVars.radius.full),
            fontWeight: cssVar(tokenVars.font.weightMedium),
            color: cssVar(tokenVars.color.foreground.default)
          },
          outlined: {
            borderColor: cssVar(tokenVars.color.border.strong),
            backgroundColor: `color-mix(in srgb, ${cssVar(tokenVars.color.brand[100])} 12%, ${cssVar(tokenVars.color.background.surface)})`
          }
        }
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            color: cssVar(tokenVars.color.foreground.default)
          },
          icon: {
            color: cssVar(tokenVars.color.foreground.muted)
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: cssVar(tokenVars.color.background.surface),
            color: cssVar(tokenVars.color.foreground.default),
            borderRadius: cssVar(tokenVars.radius.md),
            transition: 'border-color 120ms ease, box-shadow 120ms ease, background-color 120ms ease',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: cssVar(tokenVars.color.border.default)
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: cssVar(tokenVars.color.border.strong)
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: cssVar(tokenVars.color.border.focus),
              borderWidth: '1px'
            }
          },
          input: {
            paddingBlock: cssVar(tokenVars.space[3]),
            color: cssVar(tokenVars.color.foreground.default),
            WebkitTextFillColor: cssVar(tokenVars.color.foreground.default)
          }
        }
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: cssVar(tokenVars.color.foreground.muted)
          }
        }
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined'
        }
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: cssVar(tokenVars.color.brand[600]),
            textDecorationColor: cssVar(tokenVars.color.brand[200])
          }
        }
      }
    }
  });
