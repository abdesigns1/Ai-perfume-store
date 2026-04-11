"use client";

// app/cart/page.tsx
// Full cart page — cart items, order summary, promo code, recommended products.

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "../../hooks/useTheme";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useCart } from "@/lib/cartContext";
import { allProducts } from "../../lib/mockData";
import { fonts } from "../../lib/theme";
import { formatPrice } from "../../utils/format";
import GlobalStyles from "../../components/GlobalStyles";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";

// ── Valid promo codes ────────────────────────────────────────────────────────
const PROMO_CODES: Record<string, number> = {
  SCENT10: 0.1,
  WELCOME20: 0.2,
  LUXURY15: 0.15,
};

const DELIVERY_FEE = 3500;
const DELIVERY_THRESHOLD = 20000;

export default function CartPage() {
  const { theme: t, toggleTheme } = useTheme(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  const discount = promoCode ? subtotal * (PROMO_CODES[promoCode] ?? 0) : 0;
  const discountedSub = subtotal - discount;
  const deliveryFee = discountedSub >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = discountedSub + deliveryFee;

  const recommended = allProducts
    .filter((p) => !items.find((i) => i.product.id === p.id))
    .slice(0, 4);

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setPromoCode(code);
      setPromoError("");
      setPromoSuccess(
        `✦ ${Math.round(PROMO_CODES[code] * 100)}% discount applied!`,
      );
    } else {
      setPromoError("Invalid code. Try SCENT10 or WELCOME20.");
      setPromoSuccess("");
    }
  };

  const removePromo = () => {
    setPromoCode("");
    setPromoInput("");
    setPromoError("");
    setPromoSuccess("");
  };

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

      {/* ── Page header ── */}
      <div
        style={{
          paddingTop: 100,
          paddingBottom: 32,
          paddingLeft: "5vw",
          paddingRight: "5vw",
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 10,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: t.gold,
            marginBottom: 12,
          }}
        >
          Shopping
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 300,
              letterSpacing: "0.02em",
            }}
          >
            Your Cart
            {items.length > 0 && (
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 14,
                  color: t.muted,
                  marginLeft: 16,
                  fontWeight: 300,
                }}
              >
                ({items.length} {items.length === 1 ? "item" : "items"})
              </span>
            )}
          </h1>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              style={{
                background: "none",
                border: "none",
                fontFamily: fonts.sans,
                fontSize: 11,
                letterSpacing: "0.15em",
                color: t.muted,
                cursor: "pointer",
                textDecoration: "underline",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "#e25555")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color = t.muted)
              }
            >
              Clear cart
            </button>
          )}
        </div>
      </div>

      {/* ── Empty state ── */}
      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "100px 5vw" }}>
          <p style={{ fontSize: 48, marginBottom: 20 }}>✦</p>
          <h2 style={{ fontSize: 28, fontWeight: 300, marginBottom: 16 }}>
            Your cart is empty
          </h2>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 14,
              color: t.muted,
              marginBottom: 40,
            }}
          >
            Discover our curated collection of luxury fragrances.
          </p>
          <Link
            href="/products"
            style={{
              fontFamily: fonts.sans,
              fontSize: 11,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              background: t.gold,
              color: t.dark ? "#0a0a0a" : "#fff",
              padding: "15px 40px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Browse Collection
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 40,
            padding: "40px 5vw 80px",
            maxWidth: 1300,
            margin: "0 auto",
            alignItems: "flex-start",
          }}
        >
          {/* ── Left: cart items ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Free delivery progress */}
            <div
              style={{
                padding: "16px 20px",
                marginBottom: 24,
                background: t.card,
                border: `1px solid ${t.border}`,
              }}
            >
              {discountedSub >= DELIVERY_THRESHOLD ? (
                <p
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 12,
                    color: t.gold,
                    letterSpacing: "0.1em",
                  }}
                >
                  ✦ You've unlocked free delivery!
                </p>
              ) : (
                <>
                  <p
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 12,
                      color: t.muted,
                      marginBottom: 10,
                      letterSpacing: "0.06em",
                    }}
                  >
                    Add {formatPrice(DELIVERY_THRESHOLD - discountedSub)} more
                    for free delivery
                  </p>
                  <div
                    style={{ height: 3, background: t.border, borderRadius: 2 }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(100, (discountedSub / DELIVERY_THRESHOLD) * 100)}%`,
                        background: t.gold,
                        borderRadius: 2,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Cart items */}
            {items.map(({ product: p, quantity }) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  gap: isMobile ? 16 : 24,
                  padding: "24px 0",
                  borderBottom: `1px solid ${t.border}`,
                }}
              >
                {/* Image */}
                <Link href={`/products/${p.id}`} style={{ flexShrink: 0 }}>
                  <div
                    style={{
                      width: isMobile ? 88 : 120,
                      height: isMobile ? 110 : 150,
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
                        transition: "transform 0.3s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.transform =
                          "scale(1.05)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.transform =
                          "scale(1)")
                      }
                    />
                  </div>
                </Link>

                {/* Details */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: 9,
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        color: t.gold,
                        marginBottom: 6,
                      }}
                    >
                      {p.category} · {p.scent_type}
                    </p>
                    <Link
                      href={`/products/${p.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <h3
                        style={{
                          fontSize: isMobile ? 18 : 22,
                          fontWeight: 400,
                          marginBottom: 4,
                        }}
                      >
                        {p.name}
                      </h3>
                    </Link>
                    <p
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: 11,
                        color: t.muted,
                      }}
                    >
                      50ml EDP
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 12,
                      marginTop: 16,
                    }}
                  >
                    {/* Qty + remove */}
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 16 }}
                    >
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
                            width: 36,
                            height: 40,
                            fontSize: 16,
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
                            fontSize: 13,
                            width: 36,
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
                            width: 36,
                            height: 40,
                            fontSize: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(p.id)}
                        style={{
                          background: "none",
                          border: "none",
                          fontFamily: fonts.sans,
                          fontSize: 10,
                          letterSpacing: "0.1em",
                          color: t.muted,
                          cursor: "pointer",
                          textDecoration: "underline",
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
                        Remove
                      </button>
                    </div>

                    {/* Line total */}
                    <div style={{ textAlign: "right" }}>
                      {quantity > 1 && (
                        <p
                          style={{
                            fontFamily: fonts.sans,
                            fontSize: 11,
                            color: t.muted,
                            marginBottom: 2,
                          }}
                        >
                          {formatPrice(p.price)} each
                        </p>
                      )}
                      <span
                        style={{ fontSize: 20, color: t.gold, fontWeight: 400 }}
                      >
                        {formatPrice(p.price * quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 32 }}>
              <Link
                href="/products"
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: t.muted,
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = t.gold)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = t.muted)
                }
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* ── Right: order summary ── */}
          <div
            style={{
              width: isMobile ? "100%" : 360,
              flexShrink: 0,
              position: isMobile ? "relative" : "sticky",
              top: 100,
            }}
          >
            <div
              style={{
                background: t.card,
                border: `1px solid ${t.border}`,
                padding: "32px 28px",
              }}
            >
              <h2
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 11,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: t.gold,
                  marginBottom: 28,
                }}
              >
                Order Summary
              </h2>

              {/* Summary rows */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                <SummaryRow
                  label="Subtotal"
                  value={formatPrice(subtotal)}
                  theme={t}
                />
                {discount > 0 && (
                  <SummaryRow
                    label={`Promo (${promoCode})`}
                    value={`− ${formatPrice(discount)}`}
                    theme={t}
                    highlight
                  />
                )}
                <SummaryRow
                  label="Delivery"
                  value={deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
                  theme={t}
                  highlight={deliveryFee === 0}
                />
              </div>

              <div
                style={{ height: 1, background: t.border, margin: "20px 0" }}
              />

              {/* Total */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 28,
                }}
              >
                <span
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 12,
                    letterSpacing: "0.1em",
                  }}
                >
                  Total
                </span>
                <span style={{ fontSize: 28, fontWeight: 400, color: t.gold }}>
                  {formatPrice(total)}
                </span>
              </div>

              {/* ── Promo code ── */}
              <div style={{ marginBottom: 24 }}>
                <p
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: t.muted,
                    marginBottom: 10,
                  }}
                >
                  Promo Code
                </p>

                {promoCode ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      background: t.subtle,
                      border: `1px solid ${t.gold}`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: 12,
                        color: t.gold,
                        letterSpacing: "0.1em",
                      }}
                    >
                      {promoCode} — {Math.round(PROMO_CODES[promoCode] * 100)}%
                      off
                    </span>
                    <button
                      onClick={removePromo}
                      style={{
                        background: "none",
                        border: "none",
                        color: t.muted,
                        cursor: "pointer",
                        fontSize: 16,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex" }}>
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        setPromoError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                      style={{
                        flex: 1,
                        background: t.bg,
                        border: `1px solid ${promoError ? "#e25555" : t.border}`,
                        borderRight: "none",
                        color: t.text,
                        fontFamily: fonts.sans,
                        fontSize: 12,
                        letterSpacing: "0.05em",
                        padding: "10px 14px",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={applyPromo}
                      style={{
                        background: t.gold,
                        color: t.dark ? "#0a0a0a" : "#fff",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: fonts.sans,
                        fontSize: 10,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        padding: "10px 16px",
                      }}
                    >
                      Apply
                    </button>
                  </div>
                )}

                {promoError && (
                  <p
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 11,
                      color: "#e25555",
                      marginTop: 8,
                    }}
                  >
                    {promoError}
                  </p>
                )}
                {promoSuccess && (
                  <p
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 11,
                      color: t.gold,
                      marginTop: 8,
                    }}
                  >
                    {promoSuccess}
                  </p>
                )}
              </div>

              {/* Checkout button */}
              <Link
                href="/checkout"
                style={{
                  display: "block",
                  textAlign: "center",
                  background: t.gold,
                  color: t.dark ? "#0a0a0a" : "#fff",
                  fontFamily: fonts.sans,
                  fontSize: 11,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  padding: "16px",
                  textDecoration: "none",
                  marginBottom: 12,
                }}
              >
                Proceed to Checkout
              </Link>

              {/* Trust badges */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 20,
                  marginTop: 20,
                  flexWrap: "wrap",
                }}
              >
                {["🔒 Secure", "↩ Free Returns", "✦ Authentic"].map((badge) => (
                  <span
                    key={badge}
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 10,
                      color: t.muted,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Recommended products ── */}
      {recommended.length > 0 && (
        <section
          style={{
            padding: "60px 5vw 80px",
            borderTop: `1px solid ${t.border}`,
            background: t.subtle,
          }}
        >
          <div style={{ maxWidth: 1300, margin: "0 auto" }}>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 10,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: t.gold,
                marginBottom: 14,
              }}
            >
              You May Also Like
            </p>
            <h2
              style={{
                fontSize: "clamp(22px, 3vw, 32px)",
                fontWeight: 300,
                marginBottom: 36,
              }}
            >
              Recommended For You
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(2, 1fr)"
                  : "repeat(4, 1fr)",
                gap: isMobile ? 16 : 24,
              }}
            >
              {recommended.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  theme={t}
                  animationDelay={i * 0.1}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer theme={t} />
    </div>
  );
}

function SummaryRow({
  label,
  value,
  theme: t,
  highlight = false,
}: {
  label: string;
  value: string;
  theme: any;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontFamily: fonts.sans,
          fontSize: 12,
          color: t.muted,
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: fonts.sans,
          fontSize: 13,
          color: highlight ? t.gold : t.text,
          letterSpacing: "0.05em",
        }}
      >
        {value}
      </span>
    </div>
  );
}
