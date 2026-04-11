"use client";

// components/AiSection.tsx
// The "AI Scent Advisor" section with a mock chat preview.
// Will be wired to /api/ai in Phase 8.

import Link from "next/link";
import { type Theme } from "../lib/theme";

type Props = { theme: Theme };

const mockMessages = [
  {
    role: "ai",
    text: "Hi! Describe your ideal scent or the occasion you're dressing for.",
  },
  {
    role: "user",
    text: "I want something warm and sensual for a dinner date.",
  },
  {
    role: "ai",
    text: "✦ I recommend Oud Noir — deep, woody and magnetic. Perfect for an evening out.",
  },
];

export default function AiSection({ theme: t }: Props) {
  return (
    <section
      id="ai-section"
      style={{
        background: t.subtle,
        borderTop: `1px solid ${t.border}`,
        borderBottom: `1px solid ${t.border}`,
        padding: "100px 40px",
      }}
    >
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <p
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: 10,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: t.gold,
            marginBottom: 20,
          }}
        >
          Powered by AI
        </p>

        <h2
          style={{
            fontSize: "clamp(30px, 5vw, 48px)",
            fontWeight: 300,
            marginBottom: 20,
            lineHeight: 1.2,
            color: t.text,
          }}
        >
          Your Personal
          <br />
          <em style={{ color: t.gold }}>Scent Advisor</em>
        </h2>

        <p
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: 16,
            color: t.muted,
            lineHeight: 1.9,
            fontWeight: 300,
            marginBottom: 48,
          }}
        >
          Tell our AI how you feel, where you're going, or what memory you want
          to evoke. It will recommend the perfect fragrance from our curated
          collection — in seconds.
        </p>

        {/* Mock chat preview */}
        <div
          style={{
            background: t.card,
            border: `1px solid ${t.border}`,
            padding: "32px",
            textAlign: "left",
            marginBottom: 40,
          }}
        >
          {mockMessages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  maxWidth: "75%",
                  background: msg.role === "user" ? t.gold : t.surface,
                  color:
                    msg.role === "user"
                      ? t.dark
                        ? "#0a0a0a"
                        : "#fff"
                      : t.text,
                  padding: "12px 18px",
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: 13,
                  lineHeight: 1.6,
                  fontWeight: 300,
                  border: msg.role === "ai" ? `1px solid ${t.border}` : "none",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <Link href="/products" className="btn-gold">
          Try the AI Finder
        </Link>
      </div>
    </section>
  );
}
