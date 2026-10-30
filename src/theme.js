import { createContext, useContext, useMemo } from 'react';
import { StyleSheet } from 'react-native';

export const palettes = {
  light: {
    mode: 'light',
    background: '#FBF7F2',
    surface: '#FFFFFF',
    border: '#ECE4D9',
    text: '#2B2622',
    muted: '#8A8077',
    primary: '#2F6B4F',
    primarySoft: '#E3EFE8',
    onPrimary: '#FFFFFF',
    accent: '#C8622A',
    accentSoft: '#FBE8DC',
    danger: '#B3261E',
    dangerSoft: '#F9DEDC',
    warn: '#A86A00',
    warnSoft: '#FCEFD2',
    categories: {
      protein: '#C8622A', produce: '#2F6B4F', dairy: '#C9A227', bakery: '#9C6B3F',
      frozen: '#3D7DB8', pantry: '#7A5BA6', spices: '#B5476B', snacks: '#4F8A8B', other: '#8A8077',
    },
    toast: '#2B2622',
    onToast: '#FFFFFF',
    raised: '#F3EEE7',
    faint: '#C9BFB3',
    ink: '#0B0D14',
  },
  dark: {
    mode: 'dark',
    background: '#0E0F14',
    surface: '#181A22',
    raised: '#222531',
    border: '#262938',
    text: '#F4F5F8',
    muted: '#A3A8B8',
    faint: '#4A4E60',
    ink: '#0B0D14',
    primary: '#34D27B',
    primarySoft: '#173323',
    onPrimary: '#0B0D14',
    accent: '#FF8A3D',
    accentSoft: '#35241A',
    danger: '#FF5A5F',
    dangerSoft: '#3A1C20',
    warn: '#FFC24D',
    warnSoft: '#382D17',
    categories: {
      protein: '#FF8A3D', produce: '#34D27B', dairy: '#FFC24D', bakery: '#E0A06B',
      frozen: '#4D8DFF', pantry: '#B07CFF', spices: '#FF6FAE', snacks: '#22D3EE', other: '#A3A8B8',
    },
    toast: '#F4F5F8',
    onToast: '#0B0D14',
  },
};

export const radius = { sm: 10, md: 18, lg: 24 };

// Bright recipe colors. Every recipe gets one (see recipeColor.js) so
// lists, squares and the recipe page are color-coded the same way.
export const CAT = {
  veg: '#34D27B',
  keto: '#4D8DFF',
  protein: '#FF8A3D',
  seafood: '#22D3EE',
  snack: '#B07CFF',
  classic: '#FF5A5F',
};

// Soft colored glow under a card or button (dark mode only; a plain
// drop shadow would look muddy on the light background).
export function glow(color, mode = 'dark', size = 22, alpha = '55') {
  if (mode !== 'dark') return null;
  return { boxShadow: `0px ${Math.round(size / 3)}px ${size}px ${color}${alpha}` };
}

export const ThemeContext = createContext(palettes.light);

export function useTheme() {
  return useContext(ThemeContext);
}

// Builds a StyleSheet from the current colors, and rebuilds it only
// when the theme changes.
export function useStyles(factory) {
  const colors = useTheme();
  return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
}
