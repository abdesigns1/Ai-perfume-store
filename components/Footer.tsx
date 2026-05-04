"use client";

// components/Footer.tsx
// Site-wide footer with logo, link columns, and copyright.

import { type Theme } from "../lib/theme";

type Props = { theme: Theme };

const footerLinks = [
  {
    title: "Shop",
    links: ["All Fragrances", "New Arrivals", "Best Sellers", "Gift Sets"],
  },
  {
    title: "Company",
    links: ["About Us", "Blog", "Careers", "Privacy Policy"],
  },
  { title: "Support", links: ["FAQ", "Shipping", "Returns", "Contact"] },
];

export default function Footer({ theme: t }: Props) {
  return (
    <footer
      style={{
        borderTop: `1px solid ${t.border}`,
        padding: "60px 40px 40px",
        background: t.surface,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 40,
        }}
      >
        {/* Brand */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                border: `1px solid ${t.gold}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: t.gold,
                  fontSize: 12,
                  fontFamily: "'Josefin Sans', sans-serif",
                }}
              >
                S
              </span>
            </div>
            <span
              style={{
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: "0.15em",
                color: t.text,
                fontFamily: "'Josefin Sans', sans-serif",
              }}
            >
              SCENTAI
            </span>
          </div>
          <p
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: 16,
              color: t.muted,
              maxWidth: 240,
              lineHeight: 1.8,
              fontWeight: 300,
            }}
          >
            AI-powered fragrance discovery. Find the scent that tells your
            story.
          </p>
        </div>

        {/* Link columns */}
        {footerLinks.map((col) => (
          <div key={col.title}>
            <p
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: 16,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: t.gold,
                marginBottom: 20,
              }}
            >
              {col.title}
            </p>
            {col.links.map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  display: "block",
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: 17,
                  color: t.muted,
                  textDecoration: "none",
                  marginBottom: 12,
                  letterSpacing: "0.05em",
                  fontWeight: 300,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = t.gold)}
                onMouseLeave={(e) => (e.currentTarget.style.color = t.muted)}
              >
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: 1100,
          margin: "40px auto 0",
          borderTop: `1px solid ${t.border}`,
          paddingTop: 24,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <p
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: 14,
            color: t.muted,
            letterSpacing: "0.1em",
          }}
        >
          © 2025 ScentAI. All rights reserved.
        </p>
        <p
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: 14,
            color: t.muted,
            letterSpacing: "0.1em",
          }}
        >
          Crafted with intention ✦ Abuja, Nigeria
        </p>
      </div>
    </footer>
  );
}
