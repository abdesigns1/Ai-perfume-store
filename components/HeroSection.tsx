"use client";

// components/HeroSection.tsx
// Full-bleed hero with auto-advancing background carousel and left-aligned text overlay.

import { useState, useEffect } from "react";
import Link from "next/link";
import { type Theme } from "../lib/theme";

type Props = { theme: Theme };

const slides = [
  {
    image:
      "https://media.istockphoto.com/id/1435385078/photo/transparent-perfume-bottle-near-the-aged-weathered-wooden-snag-and-stones-perfume-with-woody.jpg?b=1&s=1024x1024&w=0&k=20&c=uiEm37068r0MR0FonpARvbGu4fYYEwiRz5M434vl1uk=",
    label: "Rose Absolue — Limited Edition",
  },
  {
    image:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1600&q=85",
    label: "Oud Noir Collection",
  },

  {
    image:
      "https://static.vecteezy.com/system/resources/previews/035/989/029/large_2x/ai-generated-a-bottle-of-perfume-on-a-blue-background-with-gold-and-black-free-photo.jpg",
    label: "Ambre Céleste — New Arrival",
  },
  {
    image:
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1600&q=85",
    label: "Vetiver Glacé — Summer Edit",
  },
];

export default function HeroSection({ theme: t }: Props) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [current]);

  const goTo = (index: number) => {
    setFading(true);
    setTimeout(() => {
      setCurrent(index);
      setFading(false);
    }, 400);
  };

  return (
    <section
      style={{
        position: "relative",
        height: "100vh",
        minHeight: 600,
        overflow: "hidden",
      }}
    >
      {/* ── Background carousel images ── */}
      {slides.map((slide, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${slide.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: i === current ? (fading ? 0 : 1) : 0,
            transition: "opacity 0.8s ease",
            zIndex: 0,
          }}
        />
      ))}

      {/* ── Dark gradient overlay — heavy left, light right (matches reference) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(to right, rgba(0,0,0,0.88) 40%, rgba(0,0,0,0.45) 65%, rgba(0,0,0,0.15) 100%)",
        }}
      />

      {/* ── Bottom fade into next section ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 140,
          zIndex: 2,
          background: `linear-gradient(to bottom, transparent, ${t.bg})`,
        }}
      />

      {/* ── Main content — left aligned ── */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 6vw",
        }}
      >
        <div style={{ maxWidth: 680 }}>
          {/* Slide label / eyebrow */}
          <p
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: 11,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#C9A84C",
              marginBottom: 24,
              opacity: fading ? 0 : 1,
              transition: "opacity 0.4s",
            }}
          >
            {slides[current].label}
          </p>

          {/* Main headline — matches reference layout exactly */}
          <h1
            style={{
              fontSize: "clamp(42px, 6.5vw, 84px)",
              fontWeight: 700,
              lineHeight: 0.9,
              letterSpacing: "-0.01em",
              color: "#ffffff",
              marginBottom: 28,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
            }}
          >
            Discover Your{" "}
            <em style={{ color: "#C9A84C", fontStyle: "italic" }}>
              Signature Scent
            </em>
            <br />
            with AI
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: 17,
              color: "rgba(255,255,255,0.62)",
              lineHeight: 1.0,
              fontWeight: 300,
              marginBottom: 44,
              maxWidth: 460,
            }}
          >
            Beyond fragrance, we capture your essence. Our proprietary AI engine
            analyzes your sensory preferences to curate a scent profile as
            unique as your DNA.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {/* Gold filled — "Find Your Scent" */}
            <Link
              href="/#ai-section"
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                background: "#C9A84C",
                color: "#0a0a0a",
                padding: "15px 34px",
                textDecoration: "none",
                fontWeight: 500,
                transition: "background 0.2s, transform 0.15s",
                display: "inline-block",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#E8C97A";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#C9A84C";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
              }}
            >
              Find Your Scent
            </Link>

            {/* Ghost outline — "Shop Collection" */}
            <Link
              href="/products"
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                background: "transparent",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.45)",
                padding: "14px 34px",
                textDecoration: "none",
                fontWeight: 400,
                transition: "border-color 0.2s, color 0.2s",
                display: "inline-block",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#C9A84C";
                (e.currentTarget as HTMLElement).style.color = "#C9A84C";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,0.45)";
                (e.currentTarget as HTMLElement).style.color = "#ffffff";
              }}
            >
              Shop Collection
            </Link>
          </div>
        </div>
      </div>

      {/* ── Carousel dot indicators ── */}
      <div
        style={{
          position: "absolute",
          bottom: 48,
          left: "6vw",
          zIndex: 4,
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: i === current ? 28 : 8,
              height: 2,
              background: i === current ? "#C9A84C" : "rgba(255,255,255,0.35)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "width 0.35s, background 0.3s",
            }}
          />
        ))}
      </div>

      {/* ── Slide counter top-right ── */}
      <div
        style={{
          position: "absolute",
          top: 96,
          right: "5vw",
          zIndex: 4,
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: 11,
          letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.38)",
        }}
      >
        0{current + 1} <span style={{ color: "#C9A84C" }}>/</span> 0
        {slides.length}
      </div>

      {/* ── Progress bar at very bottom ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          zIndex: 5,
          background: "rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "#C9A84C",
            width: `${((current + 1) / slides.length) * 100}%`,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </section>
  );
}
