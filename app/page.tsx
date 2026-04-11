"use client";

// app/page.tsx
// Landing page — fetches real featured products from Supabase.

import { useState, useEffect } from "react";
import { useTheme } from "../hooks/useTheme";
import { getFeaturedProducts } from "../lib/api";
import { testimonials } from "../lib/mockData";
import { fonts } from "../lib/theme";
import type { Product } from "../types";

import GlobalStyles from "../components/GlobalStyles";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import MarqueeStrip from "../components/MarqueeStrip";
import FeaturedProducts from "../components/FeaturedProducts";
import AiSection from "../components/AiSection";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      style={{
        background: theme.bg,
        color: theme.text,
        fontFamily: fonts.serif,
        minHeight: "100vh",
        transition: "background 0.4s, color 0.4s",
      }}
    >
      <GlobalStyles theme={theme} />
      <div className="grain" />
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <HeroSection theme={theme} />
      <MarqueeStrip theme={theme} />

      {loading ? (
        <SkeletonGrid theme={theme} />
      ) : (
        <FeaturedProducts products={products} theme={theme} />
      )}

      <AiSection theme={theme} />
      <Testimonials testimonials={testimonials} theme={theme} />
      <Footer theme={theme} />
    </div>
  );
}

function SkeletonGrid({ theme: t }: { theme: any }) {
  return (
    <section
      style={{ padding: "100px 40px", maxWidth: 1200, margin: "0 auto" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: t.card,
              border: `1px solid ${t.border}`,
              aspectRatio: "3/4",
              opacity: 0.5,
              animation: "pulse 1.5s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.5}50%{opacity:.2}}`}</style>
    </section>
  );
}
