"use client";

// app/products/[id]/page.tsx
// Product detail — real gallery images from DB, wishlist toggle, related limited to 4.

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useTheme } from "../../../hooks/useTheme";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { useCart } from "../../../lib/cartContext";
import { supabase } from "../../../lib/supabase";
import {
  getProduct,
  getRelatedProducts,
  getProductImages,
  toggleWishlist,
  isInWishlist,
} from "../../../lib/api";
import { fonts } from "../../../lib/theme";
import { formatPrice } from "../../../utils/format";
import type { Product } from "../../../types";
import GlobalStyles from "../../../components/GlobalStyles";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import ProductCard from "../../../components/ProductCard";

const mockReviews = [
  {
    id: 1,
    name: "Aisha M.",
    location: "Lagos",
    rating: 5,
    date: "March 2025",
    text: "Absolutely stunning. I get compliments every single time I wear this.",
  },
  {
    id: 2,
    name: "Emeka O.",
    location: "Abuja",
    rating: 5,
    date: "February 2025",
    text: "Rich, dark, and powerful. Exactly what I was looking for.",
  },
  {
    id: 3,
    name: "Zara K.",
    location: "London",
    rating: 4,
    date: "January 2025",
    text: "A masterpiece. The opening is intense but settles beautifully. Worth every naira.",
  },
];

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { theme: t, toggleTheme } = useTheme(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { addItem, openCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "scent" | "shipping">(
    "details",
  );
  const [wishlisted, setWishlisted] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      const p = await getProduct(id);
      setProduct(p);
      setLoading(false);
      if (p) {
        const [rel, imgs] = await Promise.all([
          getRelatedProducts(p.category, p.id),
          getProductImages(id),
        ]);
        setRelated(rel.slice(0, 4));
        // Gallery: main image first, then DB gallery images
        setImages([p.image_url, ...imgs]);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (userId && id) {
      isInWishlist(userId, id).then(setWishlisted);
    }
  }, [userId, id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = async () => {
    if (!userId) {
      window.location.href = "/auth/login";
      return;
    }
    if (!product) return;
    setWishLoading(true);
    const nowInWishlist = await toggleWishlist(userId, product.id);
    setWishlisted(nowInWishlist);
    setWishLoading(false);
  };

  const handleAddRelated = (p: Product) => {
    addItem(p, 1);
    openCart();
  };

  const allImages =
    images.length > 0 ? images : product ? [product.image_url] : [];
  const avgRating =
    mockReviews.reduce((s, r) => s + r.rating, 0) / mockReviews.length;

  if (loading) {
    return (
      <div
        style={{
          background: t.bg,
          color: t.text,
          fontFamily: fonts.serif,
          minHeight: "100vh",
        }}
      >
        <GlobalStyles theme={t} />
        <Navbar theme={t} onToggleTheme={toggleTheme} />
        <div
          style={{
            display: "flex",
            gap: 64,
            padding: "120px 5vw 80px",
            maxWidth: 1300,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              flex: "0 0 52%",
              aspectRatio: "4/5",
              background: t.card,
              border: `1px solid ${t.border}`,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
          <div style={{ flex: 1 }}>
            {[200, 120, 80, 300].map((w, i) => (
              <div
                key={i}
                style={{
                  height: 24,
                  width: w,
                  background: t.card,
                  marginBottom: 20,
                  animation: "pulse 1.5s ease-in-out infinite",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:.5}50%{opacity:.2}}`}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        style={{
          background: t.bg,
          color: t.text,
          fontFamily: fonts.serif,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <GlobalStyles theme={t} />
        <Navbar theme={t} onToggleTheme={toggleTheme} />
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>✦</p>
          <h2 style={{ fontSize: 28, fontWeight: 300, marginBottom: 16 }}>
            Product not found
          </h2>
          <Link
            href="/products"
            style={{
              color: t.gold,
              fontFamily: fonts.sans,
              fontSize: 12,
              letterSpacing: "0.15em",
            }}
          >
            ← Back to Collection
          </Link>
        </div>
      </div>
    );
  }

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

      {/* Breadcrumb */}
      <div
        style={{
          paddingTop: 96,
          paddingBottom: 20,
          paddingLeft: "5vw",
          paddingRight: "5vw",
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: product.name, href: "#" },
          ].map((crumb, i, arr) => (
            <span
              key={crumb.label}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <Link
                href={crumb.href}
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 11,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: i === arr.length - 1 ? t.gold : t.muted,
                  textDecoration: "none",
                }}
              >
                {crumb.label}
              </Link>
              {i < arr.length - 1 && (
                <span style={{ color: t.border, fontSize: 10 }}>›</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Main */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 32 : 64,
          padding: isMobile ? "32px 5vw" : "60px 5vw",
          maxWidth: 1300,
          margin: "0 auto",
          alignItems: "flex-start",
        }}
      >
        {/* Gallery */}
        <div
          style={{
            flex: isMobile ? "unset" : "0 0 52%",
            width: isMobile ? "100%" : "52%",
            position: isMobile ? "relative" : "sticky",
            top: isMobile ? "auto" : 100,
          }}
        >
          {/* Main image */}
          <div
            style={{
              position: "relative",
              aspectRatio: "4/5",
              overflow: "hidden",
              background: t.card,
              border: `1px solid ${t.border}`,
              marginBottom: 12,
            }}
          >
            <img
              src={allImages[activeImg]}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "opacity 0.35s ease",
              }}
              onError={(e) => (e.currentTarget.src = product.image_url)}
            />
            <div
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                background: t.gold,
                color: t.dark ? "#0a0a0a" : "#fff",
                fontFamily: fonts.sans,
                fontSize: 9,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "5px 12px",
              }}
            >
              {product.category}
            </div>
            {product.stock !== undefined &&
              product.stock <= 5 &&
              product.stock > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    background: "rgba(200,60,60,0.85)",
                    color: "#fff",
                    fontFamily: fonts.sans,
                    fontSize: 9,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    padding: "5px 12px",
                  }}
                >
                  Only {product.stock} left
                </div>
              )}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImg(
                      (activeImg - 1 + allImages.length) % allImages.length,
                    )
                  }
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(0,0,0,0.45)",
                    border: "none",
                    color: "#fff",
                    width: 36,
                    height: 36,
                    cursor: "pointer",
                    fontSize: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={() =>
                    setActiveImg((activeImg + 1) % allImages.length)
                  }
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(0,0,0,0.45)",
                    border: "none",
                    color: "#fff",
                    width: 36,
                    height: 36,
                    cursor: "pointer",
                    fontSize: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div style={{ display: "flex", gap: 10 }}>
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  style={{
                    flex: 1,
                    aspectRatio: "1",
                    padding: 0,
                    cursor: "pointer",
                    border: `2px solid ${i === activeImg ? t.gold : t.border}`,
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                    background: "none",
                  }}
                >
                  <img
                    src={img}
                    alt={`View ${i + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => (e.currentTarget.src = product.image_url)}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 10,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: t.gold,
              marginBottom: 12,
            }}
          >
            {product.scent_type}
          </p>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 300,
              lineHeight: 1.1,
              letterSpacing: "0.01em",
              marginBottom: 16,
            }}
          >
            {product.name}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", gap: 3 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  style={{
                    color: s <= Math.round(avgRating) ? t.gold : t.border,
                    fontSize: 14,
                  }}
                >
                  ★
                </span>
              ))}
            </div>
            <span
              style={{ fontFamily: fonts.sans, fontSize: 12, color: t.muted }}
            >
              {avgRating.toFixed(1)} · {mockReviews.length} reviews
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              marginBottom: 28,
              paddingBottom: 28,
              borderBottom: `1px solid ${t.border}`,
            }}
          >
            <span style={{ fontSize: 36, fontWeight: 400, color: t.gold }}>
              {formatPrice(product.price)}
            </span>
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: 11,
                color: t.muted,
                letterSpacing: "0.1em",
              }}
            >
              / 50ml EDP
            </span>
          </div>

          <p
            style={{
              fontSize: 17,
              lineHeight: 1.8,
              color: t.muted,
              marginBottom: 32,
              fontWeight: 300,
            }}
          >
            {product.description}
          </p>

          <div style={{ marginBottom: 32 }}>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 10,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: t.muted,
                marginBottom: 12,
              }}
            >
              Scent Notes
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Top: Bergamot", "Heart: Oud", "Base: Sandalwood"].map(
                (note) => (
                  <span
                    key={note}
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      border: `1px solid ${t.border}`,
                      padding: "6px 14px",
                      color: t.muted,
                    }}
                  >
                    {note}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Qty + Add to Cart */}
          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: `1px solid ${t.border}`,
              }}
            >
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{
                  background: "none",
                  border: "none",
                  color: t.text,
                  cursor: "pointer",
                  width: 44,
                  height: 48,
                  fontSize: 18,
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
                  fontSize: 14,
                  width: 40,
                  textAlign: "center",
                  color: t.text,
                }}
              >
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                style={{
                  background: "none",
                  border: "none",
                  color: t.text,
                  cursor: "pointer",
                  width: 44,
                  height: 48,
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              style={{
                flex: 1,
                minWidth: 180,
                background: added ? t.border : t.gold,
                color: t.dark ? "#0a0a0a" : "#fff",
                border: "none",
                cursor: "pointer",
                fontFamily: fonts.sans,
                fontSize: 11,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                padding: "15px 32px",
                transition: "background 0.3s, transform 0.15s",
                transform: added ? "scale(0.98)" : "scale(1)",
              }}
            >
              {added ? "✓ Added to Cart" : "Add to Cart"}
            </button>
          </div>

          {/* Wishlist + Share */}
          <div style={{ display: "flex", gap: 12, marginBottom: 36 }}>
            <button
              onClick={handleWishlist}
              disabled={wishLoading}
              style={{
                flex: 1,
                background: wishlisted ? t.gold : "none",
                border: `1px solid ${wishlisted ? t.gold : t.border}`,
                color: wishlisted ? (t.dark ? "#0a0a0a" : "#fff") : t.muted,
                cursor: wishLoading ? "not-allowed" : "pointer",
                fontFamily: fonts.sans,
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "12px 20px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!wishlisted) {
                  (e.currentTarget as HTMLElement).style.borderColor = t.gold;
                  (e.currentTarget as HTMLElement).style.color = t.gold;
                }
              }}
              onMouseLeave={(e) => {
                if (!wishlisted) {
                  (e.currentTarget as HTMLElement).style.borderColor = t.border;
                  (e.currentTarget as HTMLElement).style.color = t.muted;
                }
              }}
            >
              {wishlisted ? "♥ Wishlisted" : "♡ Wishlist"}
            </button>
            <button
              style={{
                flex: 1,
                background: "none",
                border: `1px solid ${t.border}`,
                color: t.muted,
                cursor: "pointer",
                fontFamily: fonts.sans,
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "12px 20px",
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
              ↗ Share
            </button>
          </div>

          {/* Tabs */}
          <div style={{ borderTop: `1px solid ${t.border}` }}>
            <div style={{ display: "flex" }}>
              {(["details", "scent", "shipping"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    background: "none",
                    border: "none",
                    borderBottom: `2px solid ${activeTab === tab ? t.gold : "transparent"}`,
                    color: activeTab === tab ? t.text : t.muted,
                    cursor: "pointer",
                    fontFamily: fonts.sans,
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    padding: "16px 8px",
                    transition: "color 0.2s, border-color 0.2s",
                  }}
                >
                  {tab === "details"
                    ? "Details"
                    : tab === "scent"
                      ? "Scent Profile"
                      : "Shipping"}
                </button>
              ))}
            </div>
            <div style={{ padding: "24px 0" }}>
              {activeTab === "details" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {[
                    ["Concentration", "Eau de Parfum (EDP)"],
                    ["Volume", "50ml"],
                    ["Origin", "Paris, France"],
                    ["Longevity", "8–12 hours"],
                    ["Sillage", "Moderate to Strong"],
                    ["Season", "Fall / Winter"],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        paddingBottom: 12,
                        borderBottom: `1px solid ${t.border}`,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 12,
                          color: t.muted,
                        }}
                      >
                        {k}
                      </span>
                      <span
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 12,
                          color: t.text,
                        }}
                      >
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "scent" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {[
                    {
                      label: "Top Notes",
                      notes: "Bergamot, Black Pepper, Cardamom",
                      desc: "The opening — what you smell first.",
                    },
                    {
                      label: "Heart Notes",
                      notes: "Oud Wood, Rose, Jasmine",
                      desc: "The core character of the fragrance.",
                    },
                    {
                      label: "Base Notes",
                      notes: "Sandalwood, Amber, Musk, Vanilla",
                      desc: "The lasting dry-down, hours later.",
                    },
                  ].map((n) => (
                    <div
                      key={n.label}
                      style={{
                        padding: "16px 20px",
                        background: t.card,
                        border: `1px solid ${t.border}`,
                      }}
                    >
                      <p
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 10,
                          color: t.gold,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          marginBottom: 8,
                        }}
                      >
                        {n.label}
                      </p>
                      <p
                        style={{
                          fontSize: 16,
                          fontWeight: 400,
                          marginBottom: 6,
                        }}
                      >
                        {n.notes}
                      </p>
                      <p
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 11,
                          color: t.muted,
                        }}
                      >
                        {n.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "shipping" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {[
                    [
                      "Standard Delivery",
                      "3–5 business days · Free above ₦20,000",
                    ],
                    ["Express Delivery", "1–2 business days · ₦3,500"],
                    ["Pickup", "Available in Lagos & Abuja"],
                    ["Returns", "14-day return policy on unopened items"],
                    ["Packaging", "Luxury gift box included"],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 16,
                        paddingBottom: 12,
                        borderBottom: `1px solid ${t.border}`,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 12,
                          color: t.muted,
                        }}
                      >
                        {k}
                      </span>
                      <span
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 12,
                          color: t.text,
                          textAlign: "right",
                        }}
                      >
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section
        style={{
          padding: "80px 5vw",
          borderTop: `1px solid ${t.border}`,
          background: t.subtle,
        }}
      >
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 20,
              marginBottom: 48,
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
                  marginBottom: 12,
                }}
              >
                Customer Reviews
              </p>
              <h2
                style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 300 }}
              >
                What Our Customers Say
              </h2>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 52,
                  fontWeight: 300,
                  color: t.gold,
                  lineHeight: 1,
                }}
              >
                {avgRating.toFixed(1)}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  justifyContent: "center",
                  margin: "8px 0",
                }}
              >
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    style={{
                      color: s <= Math.round(avgRating) ? t.gold : t.border,
                      fontSize: 16,
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p
                style={{ fontFamily: fonts.sans, fontSize: 11, color: t.muted }}
              >
                {mockReviews.length} reviews
              </p>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: 24,
            }}
          >
            {mockReviews.map((review) => (
              <div
                key={review.id}
                style={{
                  background: t.card,
                  border: `1px solid ${t.border}`,
                  padding: "32px 28px",
                }}
              >
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      style={{
                        color: s <= review.rating ? t.gold : t.border,
                        fontSize: 13,
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p
                  style={{
                    fontSize: 16,
                    fontStyle: "italic",
                    lineHeight: 1.75,
                    fontWeight: 300,
                    color: t.text,
                    marginBottom: 24,
                  }}
                >
                  "{review.text}"
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: 12,
                        fontWeight: 500,
                        color: t.text,
                        letterSpacing: "0.08em",
                      }}
                    >
                      {review.name}
                    </p>
                    <p
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: 10,
                        color: t.muted,
                        letterSpacing: "0.1em",
                        marginTop: 4,
                      }}
                    >
                      {review.location}
                    </p>
                  </div>
                  <p
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 10,
                      color: t.muted,
                    }}
                  >
                    {review.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section style={{ padding: "80px 5vw" }}>
          <div style={{ maxWidth: 1300, margin: "0 auto" }}>
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
              You May Also Like
            </p>
            <h2
              style={{
                fontSize: "clamp(24px, 3vw, 36px)",
                fontWeight: 300,
                marginBottom: 40,
              }}
            >
              Related Fragrances
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
              {related.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  theme={t}
                  animationDelay={i * 0.1}
                  onAddToCart={handleAddRelated}
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
