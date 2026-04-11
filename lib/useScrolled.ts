"use client";

// hooks/useScrolled.ts
// Returns true when the page has scrolled past a given threshold.
// Usage: const scrolled = useScrolled(60);

import { useState, useEffect } from "react";

export const useScrolled = (threshold = 60): boolean => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
};
