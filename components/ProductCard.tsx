"use client";

// components/ProductCard.tsx
// Single product card used in the featured grid and product listing page.

import Link from "next/link";
import { type Product } from "../types";
import { type Theme } from "../lib/theme";
import { formatPrice } from "../utils/format";

type Props = {
  product: Product;
  theme: Theme;
  animationDelay?: number;
  onAddToCart?: (product: Product) => void;
};

export default function ProductCard({
  product: p,
  theme: t,
  animationDelay = 0,
  onAddToCart,
}: Props) {
  return (
    <Link
      href={`/products/${p.id}`}
      className="card-hover"
      style={{
        textDecoration: "none",
        color: "inherit",
        background: t.card,
        border: `1px solid ${t.border}`,
        display: "block",
        animation: "fadeUp 0.6s ease forwards",
        animationDelay: `${animationDelay}s`,
        opacity: 0,
      }}
    >
      {/* Image */}
      <div
        style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden" }}
      >
        <img
          src={p.image_url}
          alt={p.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.06)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
        {/* Category badge */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            background: t.gold,
            color: t.dark ? "#0a0a0a" : "#fff",
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: 9,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            padding: "4px 10px",
          }}
        >
          {p.category}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "20px 20px 24px" }}>
        <p
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: t.muted,
            marginBottom: 6,
          }}
        >
          {p.scent_type}
        </p>
        <h3
          style={{
            fontSize: 22,
            fontWeight: 400,
            marginBottom: 12,
            color: t.text,
          }}
        >
          {p.name}
        </h3>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ color: t.gold, fontSize: 18, fontWeight: 500 }}>
            {formatPrice(p.price)}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.(p); // ← call the prop
            }}
            style={{
              background: "none",
              border: "none",
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: 9,
              letterSpacing: "0.2em",
              color: t.muted,
              textTransform: "uppercase",
              cursor: "pointer",
              padding: 0,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = t.gold)}
            onMouseLeave={(e) => (e.currentTarget.style.color = t.muted)}
          >
            Add to Cart →
          </button>
        </div>
      </div>
    </Link>
  );
}
