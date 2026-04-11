"use client";

// components/GlobalStyles.tsx
// Injects global CSS and Google Fonts into the page.
// Used once inside the root layout or page wrapper.

import { type Theme } from "../lib/theme";

type Props = { theme: Theme };

export default function GlobalStyles({ theme: t }: Props) {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Josefin+Sans:wght@300;400;500&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }

      .nav-link {
        font-family: 'Josefin Sans', sans-serif;
        font-size: 11px;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        text-decoration: none;
        color: ${t.muted};
        transition: color 0.2s;
      }
      .nav-link:hover { color: ${t.gold}; }

      .btn-gold {
        font-family: 'Josefin Sans', sans-serif;
        font-size: 11px;
        letter-spacing: 0.25em;
        text-transform: uppercase;
        background: ${t.gold};
        color: ${t.dark ? "#0a0a0a" : "#fff"};
        border: none;
        padding: 14px 36px;
        cursor: pointer;
        transition: background 0.2s, transform 0.15s;
        text-decoration: none;
        display: inline-block;
      }
      .btn-gold:hover { background: ${t.goldLight}; transform: translateY(-1px); }

      .btn-outline {
        font-family: 'Josefin Sans', sans-serif;
        font-size: 11px;
        letter-spacing: 0.25em;
        text-transform: uppercase;
        background: transparent;
        color: ${t.gold};
        border: 1px solid ${t.gold};
        padding: 13px 36px;
        cursor: pointer;
        transition: background 0.2s, color 0.2s;
        text-decoration: none;
        display: inline-block;
      }
      .btn-outline:hover { background: ${t.gold}; color: ${t.dark ? "#0a0a0a" : "#fff"}; }

      .card-hover { transition: transform 0.3s, box-shadow 0.3s; }
      .card-hover:hover {
        transform: translateY(-6px);
        box-shadow: 0 24px 48px rgba(0,0,0,0.3);
      }

      .gold-line::after {
        content: '';
        display: block;
        width: 48px;
        height: 1px;
        background: ${t.gold};
        margin-top: 16px;
      }

      .fade-in { animation: fadeUp 0.8s ease forwards; opacity: 0; }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .stagger-1 { animation-delay: 0.1s; }
      .stagger-2 { animation-delay: 0.25s; }
      .stagger-3 { animation-delay: 0.4s; }
      .stagger-4 { animation-delay: 0.55s; }

      .grain {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        opacity: ${t.dark ? "0.03" : "0.04"};
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        background-size: 128px;
      }

      @keyframes marquee {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }

      @media (max-width: 768px) {
        .hero-title    { font-size: clamp(48px, 12vw, 96px) !important; }
        .hero-subtitle { font-size: 14px !important; }
        .grid-4        { grid-template-columns: 1fr 1fr !important; }
        .grid-3        { grid-template-columns: 1fr !important; }
        .hide-mobile   { display: none !important; }
      }
    `}</style>
  );
}
