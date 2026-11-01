// Tokens visuais do Anchor. Mesmas cores do protótipo de design.

export const Colors = {
  light: {
    background: '#F7F4EE',
    surface: '#FFFFFF',
    border: '#D9D3C7',
    borderSoft: '#ECE6DA',
    text: '#1E2A2B',
    textSecondary: '#4A5859',
    textMuted: '#5E6B6C',
    primary: '#1F5F63',
    primarySoft: '#E3EDEC',
    onPrimary: '#FFFFFF',
    action: '#F2B04B',
    onAction: '#1E2A2B',
    pinBg: '#FBEBD0',
    pin: '#8A5A12',
    danger: '#B3261E',
  },
  dark: {
    background: '#121A1B',
    surface: '#1C2627',
    border: '#344344',
    borderSoft: '#273334',
    text: '#EEF2F1',
    textSecondary: '#B9C6C5',
    textMuted: '#9AA9A8',
    primary: '#5FB3B8',
    primarySoft: '#1F3A3C',
    onPrimary: '#0E1A1B',
    action: '#F2B04B',
    onAction: '#1E2A2B',
    pinBg: '#3A2E1A',
    pin: '#F2C27A',
    danger: '#F2B8B5',
  },
} as const;

export type Palette = { [K in keyof typeof Colors.light]: string };

export const Font = {
  regular: 'Lexend_400Regular',
  medium: 'Lexend_500Medium',
  semibold: 'Lexend_600SemiBold',
  bold: 'Lexend_700Bold',
} as const;

export const Space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

/** Altura mínima de toque, pensada para quem tem pressa e pouca atenção. */
export const TouchHeight = 56;
