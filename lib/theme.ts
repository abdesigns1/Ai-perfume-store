// lib/theme.ts
// Single source of truth for all design tokens.
// Import `getTheme` anywhere you need colors — pass `dark: boolean`.

export type Theme = {
  bg: string;
  surface: string;
  card: string;
  border: string;
  gold: string;
  goldLight: string;
  text: string;
  muted: string;
  subtle: string;
  dark: boolean;
};

export const getTheme = (dark: boolean): Theme =>
  dark
    ? {
        bg: "#0a0a0a",
        surface: "#111111",
        card: "#161616",
        border: "#2a2a2a",
        gold: "#C9A84C",
        goldLight: "#E8C97A",
        text: "#f5f0e8",
        muted: "#888880",
        subtle: "#1e1e1e",
        dark: true,
      }
    : {
        bg: "#faf8f4",
        surface: "#f0ece4",
        card: "#ffffff",
        border: "#e0d8cc",
        gold: "#96710a",
        goldLight: "#b8860b",
        text: "#1a1714",
        muted: "#7a7060",
        subtle: "#e8e2d8",
        dark: false,
      };

export const fonts = {
  serif: "'Cormorant Garamond', 'Georgia', serif",
  sans: "'Josefin Sans', sans-serif",
};
