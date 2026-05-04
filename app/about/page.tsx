"use client";

// app/about/page.tsx
// About Us page — brand story, values, team, and mission.

import { useTheme } from "../../hooks/useTheme";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { fonts } from "../../lib/theme";
import GlobalStyles from "../../components/GlobalStyles";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";

const VALUES = [
  {
    icon: "✦",
    title: "Curation Over Quantity",
    body: "We don't stock everything. Every fragrance in our collection is hand-selected by our team of scent experts for its quality, character, and story. We would rather offer you 50 extraordinary fragrances than 5,000 forgettable ones.",
  },
  {
    icon: "◈",
    title: "Authenticity Guaranteed",
    body: "Every bottle we sell is 100% authentic, sourced directly from authorised distributors and brand houses. We have zero tolerance for counterfeits. Your trust is the foundation of everything we do.",
  },
  {
    icon: "◎",
    title: "Education First",
    body: "Fragrance is an art form with a rich vocabulary. We believe every Nigerian deserves to understand and appreciate that art — which is why we built Scentara, our AI guide, to educate alongside every recommendation.",
  },
  {
    icon: "♡",
    title: "Made for Nigeria",
    body: "Our catalogue, pricing in Naira, and delivery network are built specifically for the Nigerian market. We understand the climate, the culture, and the occasions that matter to you.",
  },
];

const MILESTONES = [
  {
    year: "2023",
    event:
      "ScentAI founded in Lagos with a vision to bring luxury fragrance discovery online",
  },
  {
    year: "2024",
    event:
      "Launched our curated catalogue of 50+ premium fragrances sourced from global houses",
  },
  {
    year: "2024",
    event:
      "Expanded delivery to Abuja, Port Harcourt, and 18 other Nigerian cities",
  },
  {
    year: "2025",
    event: "Launched Scentara — Nigeria's first AI-powered fragrance assistant",
  },
];

export default function AboutPage() {
  const { theme: t, toggleTheme } = useTheme(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div
      style={{
        background: t.bg,
        color: t.text,
        fontFamily: fonts.serif,
        minHeight: "100vh",
        transition: "background 0.4s, color 0.4s",
      }}
    >
      <GlobalStyles theme={t} />
      <div className="grain" />
      <Navbar theme={t} onToggleTheme={toggleTheme} />

      {/* ── Hero ── */}
      <div
        style={{
          position: "relative",
          paddingTop: 96,
          minHeight: 480,
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url(https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=1600&q=85)",
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(0,0,0,0.88) 40%, rgba(0,0,0,0.4) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: isMobile ? "60px 5vw" : "80px 8vw",
            maxWidth: 700,
          }}
        >
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 10,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: t.gold,
              marginBottom: 16,
            }}
          >
            Our Story
          </p>
          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 68px)",
              fontWeight: 300,
              color: "#fff",
              lineHeight: 1.05,
              marginBottom: 24,
              letterSpacing: "-0.01em",
            }}
          >
            Fragrance is not a<br />
            luxury.
            <br />
            <em style={{ color: t.gold }}>It is a language.</em>
          </h1>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 13,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.9,
              maxWidth: 480,
            }}
          >
            We built ScentAI because we believe every Nigerian deserves to speak
            it fluently — to find the scents that tell their story, mark their
            occasions, and leave their signature.
          </p>
        </div>
      </div>

      {/* ── Mission ── */}
      <section
        style={{
          padding: isMobile ? "64px 5vw" : "96px 8vw",
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? 40 : 80,
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 10,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: t.gold,
                marginBottom: 16,
              }}
            >
              Who We Are
            </p>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                fontWeight: 300,
                marginBottom: 28,
                lineHeight: 1.2,
              }}
            >
              Nigeria's premier destination for luxury fragrances
            </h2>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 13,
                color: t.muted,
                lineHeight: 1.9,
                marginBottom: 20,
              }}
            >
              ScentAI was born out of frustration. We were tired of settling —
              for counterfeit bottles, limited selection, and a complete absence
              of guidance when choosing a fragrance online.
            </p>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 13,
                color: t.muted,
                lineHeight: 1.9,
                marginBottom: 20,
              }}
            >
              So we built the store we always wanted. A curated collection of
              authentic, premium fragrances. Fair pricing in Naira. Fast
              delivery across Nigeria. And Scentara — our AI fragrance guide —
              to help you find exactly what you are looking for, even when you
              don't know the words for it yet.
            </p>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 13,
                color: t.muted,
                lineHeight: 1.9,
              }}
            >
              We are a small team of fragrance obsessives, technologists, and
              storytellers based in Lagos. Every decision we make — from which
              fragrances to stock to how the website feels — is guided by one
              question: does this honour our customers?
            </p>
          </div>

          {/* Stats */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
          >
            {[
              { num: "50+", label: "Curated Fragrances" },
              { num: "100%", label: "Authentic Products" },
              { num: "20+", label: "Cities Served" },
              { num: "24/7", label: "AI Fragrance Guide" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: t.card,
                  border: `1px solid ${t.border}`,
                  padding: "32px 24px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "clamp(36px, 4vw, 52px)",
                    fontWeight: 300,
                    color: t.gold,
                    lineHeight: 1,
                    marginBottom: 10,
                  }}
                >
                  {stat.num}
                </p>
                <p
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 11,
                    color: t.muted,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section
        style={{
          padding: isMobile ? "64px 5vw" : "96px 8vw",
          borderBottom: `1px solid ${t.border}`,
          background: t.subtle,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 10,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: t.gold,
                marginBottom: 16,
              }}
            >
              What We Believe
            </p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 300 }}>
              Our Values
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
              gap: 24,
            }}
          >
            {VALUES.map((v) => (
              <div
                key={v.title}
                style={{
                  background: t.card,
                  border: `1px solid ${t.border}`,
                  padding: "36px 32px",
                }}
              >
                <span
                  style={{
                    fontSize: 28,
                    color: t.gold,
                    display: "block",
                    marginBottom: 20,
                  }}
                >
                  {v.icon}
                </span>
                <h3 style={{ fontSize: 22, fontWeight: 400, marginBottom: 14 }}>
                  {v.title}
                </h3>
                <p
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 13,
                    color: t.muted,
                    lineHeight: 1.9,
                  }}
                >
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section
        style={{
          padding: isMobile ? "64px 5vw" : "96px 8vw",
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 10,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: t.gold,
                marginBottom: 16,
              }}
            >
              How We Got Here
            </p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 300 }}>
              Our Journey
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {MILESTONES.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 32,
                  paddingBottom: 40,
                  position: "relative",
                }}
              >
                {/* Line */}
                {i < MILESTONES.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      left: 47,
                      top: 48,
                      bottom: 0,
                      width: 1,
                      background: t.border,
                    }}
                  />
                )}
                {/* Year badge */}
                <div
                  style={{
                    width: 96,
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: t.gold,
                      flexShrink: 0,
                      marginTop: 4,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 12,
                      color: t.gold,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                    }}
                  >
                    {m.year}
                  </span>
                </div>
                {/* Event */}
                <div style={{ flex: 1, paddingTop: 2 }}>
                  <p
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 13,
                      color: t.muted,
                      lineHeight: 1.8,
                    }}
                  >
                    {m.event}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          padding: isMobile ? "64px 5vw" : "96px 8vw",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <p style={{ fontSize: 36, color: t.gold, marginBottom: 20 }}>✦</p>
          <h2
            style={{
              fontSize: "clamp(26px, 4vw, 42px)",
              fontWeight: 300,
              marginBottom: 20,
            }}
          >
            Ready to find your signature scent?
          </h2>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 13,
              color: t.muted,
              lineHeight: 1.9,
              marginBottom: 40,
            }}
          >
            Let Scentara guide you, or browse our curated collection and
            discover something extraordinary.
          </p>
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/ai"
              style={{
                fontFamily: fonts.sans,
                fontSize: 11,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                background: t.gold,
                color: t.dark ? "#0a0a0a" : "#fff",
                padding: "14px 32px",
                textDecoration: "none",
                display: "inline-block",
                transition: "opacity 0.2s",
              }}
            >
              Chat with Scentara
            </Link>
            <Link
              href="/products"
              style={{
                fontFamily: fonts.sans,
                fontSize: 11,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                background: "none",
                border: `1px solid ${t.gold}`,
                color: t.gold,
                padding: "13px 32px",
                textDecoration: "none",
                display: "inline-block",
                transition: "opacity 0.2s",
              }}
            >
              Browse Collection
            </Link>
          </div>
        </div>
      </section>

      <Footer theme={t} />
    </div>
  );
}
