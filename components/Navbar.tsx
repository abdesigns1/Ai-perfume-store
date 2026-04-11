"use client";

// components/Navbar.tsx
// Top navigation bar — cart icon opens the CartDrawer, badge shows item count.

import Link from "next/link";
import { fonts, type Theme } from "../lib/theme";
import { useScrolled } from "../hooks/useScrolled";
import { useCart } from "../lib/cartContext";
import CartDrawer from "./CartDrawer";

type Props = {
  theme: Theme;
  onToggleTheme: () => void;
};

export default function Navbar({ theme: t, onToggleTheme }: Props) {
  const scrolled = useScrolled(60);
  const { totalItems, toggleCart } = useCart();

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: scrolled
            ? t.dark
              ? "rgba(10,10,10,0.95)"
              : "rgba(250,248,244,0.95)"
            : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? `1px solid ${t.border}` : "none",
          transition: "background 0.3s, border 0.3s",
          padding: "0 40px",
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: `1px solid ${t.gold}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: t.gold,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: fonts.sans,
                letterSpacing: "0.1em",
              }}
            >
              S
            </span>
          </div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: "0.15em",
              color: t.text,
              fontFamily: fonts.sans,
            }}
          >
            SCENTAI
          </span>
        </Link>

        {/* Nav links */}
        <div className="hide-mobile" style={{ display: "flex", gap: 36 }}>
          {[
            { label: "Home", href: "/" },
            { label: "Collection", href: "/products" },
            { label: "Discover", href: "/#ai-section" },
            { label: "About", href: "#" },
            { label: "Contact", href: "#" },
          ].map(({ label, href }) => (
            <Link key={label} href={href} className="nav-link">
              {label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            title="Toggle theme"
            style={{
              background: "none",
              border: `1px solid ${t.border}`,
              color: t.muted,
              cursor: "pointer",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              transition: "border-color 0.2s",
            }}
          >
            {t.dark ? "☀" : "☾"}
          </button>

          {/* Cart icon with badge */}
          <button
            onClick={toggleCart}
            title="Open cart"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 4,
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>🛒</span>
            {totalItems > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  background: t.gold,
                  color: t.dark ? "#0a0a0a" : "#fff",
                  fontFamily: fonts.sans,
                  fontSize: 9,
                  fontWeight: 700,
                  minWidth: 18,
                  height: 18,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>

          <Link
            href="/auth/login"
            className="btn-gold"
            style={{ padding: "10px 22px", fontSize: "10px" }}
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Cart drawer rendered here so it's available on every page */}
      <CartDrawer theme={t} />
    </>
  );
}
