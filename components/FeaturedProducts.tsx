"use client";

// components/FeaturedProducts.tsx
// "Featured Fragrances" section shown on the landing page.
// Renders a 4-column grid of ProductCards.

import Link from "next/link";
import { type Product } from "../types";
import { type Theme } from "../lib/theme";
import ProductCard from "@/components/ProductCard";
import { useCart } from "../lib/cartContext";

type Props = {
  products: Product[];
  theme: Theme;
};

export default function FeaturedProducts({ products, theme: t }: Props) {
  const { addItem, openCart } = useCart();
  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    openCart();
  };

  return (
    <section
      style={{ padding: "100px 40px", maxWidth: 1500, margin: "0 auto" }}
    >
      {/* Section header */}
      <div style={{ marginBottom: 60 }}>
        <p
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: 10,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: t.gold,
            marginBottom: 16,
          }}
        >
          Curated Selection
        </p>
        <h2
          className="gold-line"
          style={{
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 300,
            letterSpacing: "0.02em",
            color: t.text,
          }}
        >
          Featured Fragrances
        </h2>
      </div>

      {/* Grid */}
      <div
        className="grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
        }}
      >
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            theme={t}
            animationDelay={i * 0.1}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 56 }}>
        <Link href="/products" className="btn-outline">
          View All Fragrances
        </Link>
      </div>
    </section>
  );
}
