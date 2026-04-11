"use client";

// hooks/useTheme.ts
// Manages dark/light mode state across the app.
// Usage: const { dark, theme, toggleTheme } = useTheme();

import { useState } from "react";
import { getTheme, type Theme } from "@/lib/theme";

export const useTheme = (defaultDark = true) => {
  const [dark, setDark] = useState(defaultDark);
  const theme: Theme = getTheme(dark);
  const toggleTheme = () => setDark((prev) => !prev);

  return { dark, theme, toggleTheme };
};
