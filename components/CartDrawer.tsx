"use client";

// components/CartDrawer.tsx
// Slide-over cart drawer triggered from the Navbar cart icon.

import Link from "next/link";
import { useCart } from "../lib/cartContext";
import { fonts, type Theme } from "../lib/theme";
import { formatPrice } from "../utils/format";

type Props = { theme: Theme };

export default function CartDrawer({ theme: t }: Props) {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    totalItems,
    isOpen,
    closeCart,
    isSyncing,
    userId,
  } = useCart();

  const DELIVERY_THRESHOLD = 20000;
  const remaining = Math.max(0, DELIVERY_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / DELIVERY_THRESHOLD) * 100);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={closeCart}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 300,
            backdropFilter: "blur(3px)",
          }}
        />
      )}

      {/* Drawer panel */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "min(420px, 100vw)",
          background: t.bg,
          borderLeft: `1px solid ${t.border}`,
          zIndex: 301,
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: isOpen ? "-8px 0 48px rgba(0,0,0,0.3)" : "none",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px 28px",
            borderBottom: `1px solid ${t.border}`,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h2
              style={{ fontSize: 20, fontWeight: 300, letterSpacing: "0.05em" }}
            >
              Your Cart
            </h2>
            {isSyncing ? (
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 9,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: t.muted,
                  animation: "pulse 1s ease-in-out infinite",
                }}
              >
                Syncing...
              </span>
            ) : (
              totalItems > 0 && (
                <span
                  style={{
                    background: t.gold,
                    color: t.dark ? "#0a0a0a" : "#fff",
                    fontFamily: fonts.sans,
                    fontSize: 10,
                    fontWeight: 600,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {totalItems}
                </span>
              )
            )}
          </div>
          <button
            onClick={closeCart}
            style={{
              background: "none",
              border: `1px solid ${t.border}`,
              color: t.muted,
              cursor: "pointer",
              width: 36,
              height: 36,
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = t.gold;
              (e.currentTarget as HTMLElement).style.color = t.gold;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = t.border;
              (e.currentTarget as HTMLElement).style.color = t.muted;
            }}
          >
            ×
          </button>
        </div>

        {/* ── Sync status banner ── */}
        {userId && !isSyncing && (
          <div
            style={{
              padding: "8px 28px",
              background: t.subtle,
              borderBottom: `1px solid ${t.border}`,
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <span style={{ color: t.gold, fontSize: 10 }}>✦</span>
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: 10,
                color: t.muted,
                letterSpacing: "0.1em",
              }}
            >
              Cart saved to your account
            </span>
          </div>
        )}

        {/* ── Free delivery progress bar ── */}
        {subtotal > 0 && (
          <div
            style={{
              padding: "14px 28px",
              borderBottom: `1px solid ${t.border}`,
              flexShrink: 0,
            }}
          >
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 11,
                color: remaining === 0 ? t.gold : t.muted,
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              {remaining === 0
                ? "✦ You've unlocked free delivery!"
                : `Add ${formatPrice(remaining)} more for free delivery`}
            </p>
            <div style={{ height: 2, background: t.border, borderRadius: 2 }}>
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: t.gold,
                  borderRadius: 2,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>
        )}

        {/* ── Items list ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ fontSize: 36, marginBottom: 16 }}>✦</p>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  color: t.muted,
                  marginBottom: 24,
                }}
              >
                Your cart is empty
              </p>
              <Link
                href="/products"
                onClick={closeCart}
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: t.gold,
                  textDecoration: "none",
                  border: `1px solid ${t.gold}`,
                  padding: "10px 24px",
                  display: "inline-block",
                }}
              >
                Browse Collection
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {items.map(({ product: p, quantity }) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    gap: 16,
                    paddingBottom: 20,
                    borderBottom: `1px solid ${t.border}`,
                  }}
                >
                  <Link
                    href={`/products/${p.id}`}
                    onClick={closeCart}
                    style={{ flexShrink: 0 }}
                  >
                    <div
                      style={{
                        width: 80,
                        height: 100,
                        overflow: "hidden",
                        border: `1px solid ${t.border}`,
                      }}
                    >
                      <img
                        src={p.image_url}
                        alt={p.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: 9,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: t.gold,
                        marginBottom: 4,
                      }}
                    >
                      {p.category}
                    </p>
                    <p
                      style={{ fontSize: 16, fontWeight: 400, marginBottom: 4 }}
                    >
                      {p.name}
                    </p>
                    <p
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: 11,
                        color: t.muted,
                        marginBottom: 12,
                      }}
                    >
                      50ml EDP
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      {/* Quantity */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: `1px solid ${t.border}`,
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(p.id, quantity - 1)}
                          style={{
                            background: "none",
                            border: "none",
                            color: t.muted,
                            cursor: "pointer",
                            width: 28,
                            height: 28,
                            fontSize: 14,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          −
                        </button>
                        <span
                          style={{
                            fontFamily: fonts.sans,
                            fontSize: 12,
                            width: 28,
                            textAlign: "center",
                            color: t.text,
                          }}
                        >
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(p.id, quantity + 1)}
                          style={{
                            background: "none",
                            border: "none",
                            color: t.muted,
                            cursor: "pointer",
                            width: 28,
                            height: 28,
                            fontSize: 14,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          +
                        </button>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <span
                          style={{
                            color: t.gold,
                            fontSize: 15,
                            fontWeight: 500,
                          }}
                        >
                          {formatPrice(p.price * quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(p.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: t.muted,
                            cursor: "pointer",
                            fontSize: 15,
                            padding: 0,
                            transition: "color 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.color =
                              "#e25555")
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.color =
                              t.muted)
                          }
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer: subtotal + CTAs ── */}
        {items.length > 0 && (
          <div
            style={{
              padding: "20px 28px 32px",
              borderTop: `1px solid ${t.border}`,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  color: t.muted,
                  letterSpacing: "0.1em",
                }}
              >
                Subtotal
              </span>
              <span style={{ fontSize: 22, fontWeight: 400, color: t.gold }}>
                {formatPrice(subtotal)}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link
                href="/checkout"
                onClick={closeCart}
                style={{
                  display: "block",
                  textAlign: "center",
                  background: t.gold,
                  color: t.dark ? "#0a0a0a" : "#fff",
                  fontFamily: fonts.sans,
                  fontSize: 11,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  padding: "15px",
                  textDecoration: "none",
                }}
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                style={{
                  display: "block",
                  textAlign: "center",
                  background: "transparent",
                  color: t.gold,
                  border: `1px solid ${t.gold}`,
                  fontFamily: fonts.sans,
                  fontSize: 11,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  padding: "13px",
                  textDecoration: "none",
                }}
              >
                View Full Cart
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
