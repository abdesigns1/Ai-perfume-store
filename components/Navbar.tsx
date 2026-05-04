"use client";

// components/Navbar.tsx
// Desktop: top navbar with links, cart, auth
// Mobile: top bar (logo + cart + auth) + bottom tab bar for navigation

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { fonts, type Theme } from "../lib/theme";
import { useScrolled } from "../hooks/useScrolled";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useCart } from "../lib/cartContext";
import { useAuth } from "../hooks/useAuth";
import CartDrawer from "./CartDrawer";

type Props = {
  theme: Theme;
  onToggleTheme: () => void;
};

const NAV_LINKS = [
  { label: "Collection", href: "/products" },
  { label: "Scentara AI", href: "/ai" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const BOTTOM_TABS = [
  { label: "Home", href: "/", icon: "⌂" },
  { label: "Shop", href: "/products", icon: "✦" },
  { label: "AI Guide", href: "/ai", icon: "◈" },
  { label: "Account", href: "/account", icon: "◉" },
];

export default function Navbar({ theme: t, onToggleTheme }: Props) {
  const scrolled = useScrolled(60);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, toggleCart } = useCart();
  const { user, signOut, displayName, initials, loading } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ── Top Navbar ── */}
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
          padding: isMobile ? "0 20px" : "0 40px",
          height: 72,
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
            gap: 10,
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
              fontSize: isMobile ? 16 : 18,
              fontWeight: 500,
              letterSpacing: "0.15em",
              color: t.text,
              fontFamily: fonts.sans,
            }}
          >
            SCENTAI
          </span>
        </Link>

        {/* Desktop nav links */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 36 }}>
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="nav-link"
                style={{ color: isActive(href) ? t.gold : undefined }}
              >
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Right actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 12 : 16,
          }}
        >
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

          {/* Cart */}
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
                }}
              >
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>

          {/* Auth — desktop only shows avatar, mobile shows nothing (account is in bottom tab) */}
          {!loading &&
            mounted &&
            (!isMobile ? (
              user ? (
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
                    }}
                    title={displayName}
                  >
                    {initials}
                  </button>

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
                        {[
                          { label: "My Orders", href: "/account" },
                          { label: "My Account", href: "/account" },
                          { label: "Wishlist", href: "/account" },
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
                              (
                                e.currentTarget as HTMLElement
                              ).style.background = t.subtle;
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.color =
                                t.muted;
                              (
                                e.currentTarget as HTMLElement
                              ).style.background = "transparent";
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
                              ((
                                e.currentTarget as HTMLElement
                              ).style.background = t.subtle)
                            }
                            onMouseLeave={(e) =>
                              ((
                                e.currentTarget as HTMLElement
                              ).style.background = "transparent")
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
                <Link
                  href="/auth/login"
                  className="btn-gold"
                  style={{ padding: "10px 22px", fontSize: "10px" }}
                >
                  Sign In
                </Link>
              )
            ) : null)}
        </div>
      </nav>

      {/* ── Mobile Bottom Tab Bar ── */}
      {isMobile && (
        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: t.dark
              ? "rgba(10,10,10,0.97)"
              : "rgba(250,248,244,0.97)",
            backdropFilter: "blur(16px)",
            borderTop: `1px solid ${t.border}`,
            display: "flex",
            alignItems: "stretch",
            height: 64,
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {BOTTOM_TABS.map((tab) => {
            const active = isActive(tab.href);
            const isAccount = tab.href === "/account";

            return (
              <button
                key={tab.label}
                onClick={() => {
                  if (isAccount && !user) {
                    router.push("/auth/login");
                    return;
                  }
                  router.push(tab.href);
                }}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  borderTop: `2px solid ${active ? t.gold : "transparent"}`,
                  transition: "border-color 0.2s",
                  padding: "8px 0",
                }}
              >
                <span
                  style={{
                    fontSize: 20,
                    color: active ? t.gold : t.muted,
                    transition: "color 0.2s",
                    lineHeight: 1,
                  }}
                >
                  {/* Special cart icon with badge */}
                  {tab.label === "Shop" ? (
                    <span
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      {tab.icon}
                    </span>
                  ) : (
                    tab.icon
                  )}
                </span>
                <span
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 9,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: active ? t.gold : t.muted,
                    transition: "color 0.2s",
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* Cart tab with badge */}
          <button
            onClick={toggleCart}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
              borderTop: `2px solid transparent`,
              padding: "8px 0",
              position: "relative",
            }}
          >
            <span
              style={{
                fontSize: 20,
                color: t.muted,
                lineHeight: 1,
                position: "relative",
              }}
            >
              🛒
              {mounted && totalItems > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -8,
                    background: t.gold,
                    color: t.dark ? "#0a0a0a" : "#fff",
                    fontFamily: fonts.sans,
                    fontSize: 8,
                    fontWeight: 700,
                    minWidth: 16,
                    height: 16,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </span>
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: 9,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: t.muted,
              }}
            >
              Cart
            </span>
          </button>
        </nav>
      )}

      {/* Add bottom padding on mobile so content isn't hidden behind tab bar */}
      {isMobile && <div style={{ height: 64 }} />}

      <CartDrawer theme={t} />
    </>
  );
}
