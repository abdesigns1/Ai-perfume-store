"use client";

// app/ai/page.tsx
// Dedicated full-page AI assistant.

import { useTheme } from "../../hooks/useTheme";
import { fonts } from "../../lib/theme";
import GlobalStyles from "../../components/GlobalStyles";
import Navbar from "../../components/Navbar";
import AiChat from "../../components/AiChat";

export default function AiPage() {
  const { theme: t, toggleTheme } = useTheme(true);

  return (
    <div
      style={{
        background: t.bg,
        color: t.text,
        fontFamily: fonts.serif,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        transition: "background 0.4s, color 0.4s",
      }}
    >
      <GlobalStyles theme={t} />
      <div className="grain" />
      <Navbar theme={t} onToggleTheme={toggleTheme} />

      {/* Banner */}
      <div style={{ position: "relative", paddingTop: 180, flexShrink: 0 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url(https://cdn.tatlerasia.com/tatlerasia/i/2025/09/26014034-ai_cover_1200x630.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.92) 100%)",
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "48px 5vw",
            maxWidth: 900,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                background: "#C9A84C",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                color: "#0a0a0a",
                flexShrink: 0,
              }}
            >
              ✦
            </div>
            <div>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 10,
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  color: "#C9A84C",
                  marginBottom: 4,
                }}
              >
                AI Fragrance Guide
              </p>
              <h1
                style={{
                  fontSize: "clamp(24px, 4vw, 40px)",
                  fontWeight: 300,
                  color: "#ffffff",
                }}
              >
                Meet Scentara
              </h1>
            </div>
          </div>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 13,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.8,
              maxWidth: 520,
              marginBottom: 20,
            }}
          >
            Your personal AI fragrance expert. Describe your mood, personality,
            or occasion and Scentara will find your perfect scent.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              "✦ Personalised Picks",
              "◎ Scent Education",
              "♡ Gifting Advice",
              "◈ Scent Profiles",
            ].map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 9,
                  letterSpacing: "0.15em",
                  color: "rgba(255,255,255,0.4)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: "5px 12px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Chat */}
      <div
        style={{
          flex: 1,
          display: "flex",
          padding: "0 5vw 48px",
          maxWidth: 900,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            flex: 1,
            border: `1px solid ${t.border}`,
            marginTop: 32,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: "calc(100vh - 360px)",
          }}
        >
          <AiChat theme={t} compact={false} />
        </div>
      </div>
    </div>
  );
}
