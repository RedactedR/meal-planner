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
      frozen: '#3D7DB8', pantry: '#7A5BA6', spices: '#B5476B', other: '#8A8077',
    },
    toast: '#2B2622',
    onToast: '#FFFFFF',
  },
  dark: {
    mode: 'dark',
    background: '#141311',
    surface: '#1F1D1A',
    border: '#34302B',
    text: '#F2EDE6',
    muted: '#9C948A',
    primary: '#6FC29A',
    primarySoft: '#1E3329',
    onPrimary: '#0E1A14',
    accent: '#F0965F',
    accentSoft: '#3A261A',
    danger: '#F2B8B5',
    dangerSoft: '#3D1F1D',
    warn: '#F2C26B',
    warnSoft: '#3A2E14',
    categories: {
      protein: '#F0965F', produce: '#6FC29A', dairy: '#E6C65C', bakery: '#D2A27A',
      frozen: '#7DB3E8', pantry: '#B39DDB', spices: '#E886A8', other: '#9C948A',
    },
    toast: '#F2EDE6',
    onToast: '#141311',
  },
};

export const radius = { sm: 8, md: 14, lg: 20 };

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
