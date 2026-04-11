"use client";

// components/MarqueeStrip.tsx
// Horizontally scrolling scent-notes ticker strip.

import { type Theme } from "../lib/theme";

type Props = { theme: Theme };

const NOTES =
  "Oud · Rose · Vetiver · Amber · Musk · Jasmine · Sandalwood · Bergamot";

export default function MarqueeStrip({ theme: t }: Props) {
  return (
    <div
      style={{
        borderTop: `1px solid ${t.border}`,
        borderBottom: `1px solid ${t.border}`,
        padding: "25px 0",
        overflow: "hidden",
        background: t.subtle,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 64,
          animation: "marquee 18s linear infinite",
          whiteSpace: "nowrap",
          width: "max-content",
        }}
      >
        {/* Duplicate content for seamless loop */}
        {[0, 1].map((i) => (
          <span
            key={i}
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: 17,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: t.muted,
            }}
          >
            {NOTES} ✦ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {NOTES} ✦ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {NOTES} ✦
          </span>
        ))}
      </div>
    </div>
  );
}
