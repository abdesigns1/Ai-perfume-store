"use client";

// components/Navbar.tsx
// Navbar — shows Sign In button for guests, user avatar + sign out for logged-in users.

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fonts, type Theme } from "../lib/theme";
import { useScrolled } from "../hooks/useScrolled";
import { useCart } from "../lib/cartContext";
import { useAuth } from "../hooks/useAuth";
import CartDrawer from "./CartDrawer";

type Props = {
  theme: Theme;
  onToggleTheme: () => void;
};

export default function Navbar({ theme: t, onToggleTheme }: Props) {
  const scrolled = useScrolled(60);
  const { totalItems, toggleCart } = useCart();
  const { user, signOut, displayName, initials, loading } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    router.push("/");
  };

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
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
            {mounted && totalItems > 0 && (
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

          {/* Auth section */}
          {!loading &&
            (mounted && user ? (
              /* Logged in — show avatar + dropdown */
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    width: 36,
                    height: 36,
                    background: t.gold,
                    color: t.dark ? "#0a0a0a" : "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: fonts.sans,
                    fontSize: 13,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "opacity 0.2s",
                  }}
                  title={displayName}
                >
                  {initials}
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <>
                    <div
                      onClick={() => setUserMenuOpen(false)}
                      style={{ position: "fixed", inset: 0, zIndex: 99 }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 12px)",
                        right: 0,
                        background: t.card,
                        border: `1px solid ${t.border}`,
                        minWidth: 200,
                        zIndex: 100,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                      }}
                    >
                      {/* User info */}
                      <div
                        style={{
                          padding: "16px 20px",
                          borderBottom: `1px solid ${t.border}`,
                        }}
                      >
                        <p
                          style={{
                            fontFamily: fonts.sans,
                            fontSize: 12,
                            color: t.text,
                            letterSpacing: "0.05em",
                            marginBottom: 4,
                          }}
                        >
                          {displayName}
                        </p>
                        <p
                          style={{
                            fontFamily: fonts.sans,
                            fontSize: 10,
                            color: t.muted,
                          }}
                        >
                          {user.email}
                        </p>
                      </div>

                      {/* Menu items */}
                      {[
                        { label: "My Orders", href: "/orders" },
                        { label: "My Account", href: "/account" },
                      ].map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setUserMenuOpen(false)}
                          style={{
                            display: "block",
                            padding: "12px 20px",
                            fontFamily: fonts.sans,
                            fontSize: 11,
                            letterSpacing: "0.1em",
                            color: t.muted,
                            textDecoration: "none",
                            transition: "color 0.2s, background 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.color =
                              t.gold;
                            (e.currentTarget as HTMLElement).style.background =
                              t.subtle;
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.color =
                              t.muted;
                            (e.currentTarget as HTMLElement).style.background =
                              "transparent";
                          }}
                        >
                          {item.label}
                        </Link>
                      ))}

                      <div style={{ borderTop: `1px solid ${t.border}` }}>
                        <button
                          onClick={handleSignOut}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "12px 20px",
                            textAlign: "left",
                            background: "none",
                            border: "none",
                            fontFamily: fonts.sans,
                            fontSize: 11,
                            letterSpacing: "0.1em",
                            color: "#e25555",
                            cursor: "pointer",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.background =
                              t.subtle)
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.background =
                              "transparent")
                          }
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Guest — show Sign In button */
              <Link
                href="/auth/login"
                className="btn-gold"
                style={{ padding: "10px 22px", fontSize: "10px" }}
              >
                Sign In
              </Link>
            ))}
        </div>
      </nav>

      <CartDrawer theme={t} />
    </>
  );
}
