"use client";

// components/Testimonials.tsx
// Customer testimonials section — 3-column card grid.

import { type Testimonial } from "../types";
import { type Theme } from "../lib/theme";

type Props = {
  testimonials: Testimonial[];
  theme: Theme;
};

export default function Testimonials({ testimonials, theme: t }: Props) {
  return (
    <section
      style={{ padding: "100px 40px", maxWidth: 1100, margin: "0 auto" }}
    >
      {/* Header */}
      <div style={{ marginBottom: 60, textAlign: "center" }}>
        <p
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: 10,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: t.gold,
            marginBottom: 16,
          }}
        >
          What They Say
        </p>
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 300,
            color: t.text,
          }}
        >
          Loved by Fragrance Enthusiasts
        </h2>
      </div>

      {/* Grid */}
      <div
        className="grid-3"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
        }}
      >
        {testimonials.map((item, i) => (
          <div
            key={i}
            style={{
              background: t.card,
              border: `1px solid ${t.border}`,
              padding: "36px 32px",
            }}
          >
            <div
              style={{
                color: t.gold,
                fontSize: 24,
                marginBottom: 20,
                letterSpacing: 4,
              }}
            >
              ✦✦✦✦✦
            </div>
            <p
              style={{
                fontSize: 18,
                fontStyle: "italic",
                fontWeight: 300,
                lineHeight: 1.7,
                color: t.text,
                marginBottom: 24,
              }}
            >
              "{item.text}"
            </p>
            <p
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: 12,
                letterSpacing: "0.1em",
                fontWeight: 500,
                color: t.text,
              }}
            >
              {item.name}
            </p>
            <p
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: 10,
                color: t.muted,
                letterSpacing: "0.15em",
                marginTop: 4,
              }}
            >
              {item.location}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
