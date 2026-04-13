"use client";

// app/products/page.tsx
// Product listing with 12-per-page pagination + prev/next.
// Sidebar is inside the flex container for correct alignment.

import { useState, useMemo, useEffect } from "react";
import { useTheme } from "../../hooks/useTheme";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useCart } from "../../lib/cartContext";
import { getProducts, getCategories } from "../../lib/api";
import { fonts } from "../../lib/theme";
import type { Product, Category } from "../../types";
import GlobalStyles from "../../components/GlobalStyles";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";

const SCENT_TYPES = [
  "All",
  "Woody",
  "Floral",
  "Warm",
  "Earthy",
  "Citrus",
  "Musky",
  "Spicy",
  "Fresh",
];
const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under ₦12,000", min: 0, max: 12000 },
  { label: "₦12,000 – ₦18,000", min: 12000, max: 18000 },
  { label: "₦18,000 – ₦25,000", min: 18000, max: 25000 },
  { label: "Above ₦25,000", min: 25000, max: Infinity },
];
const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Name: A → Z", value: "name-asc" },
];
const PER_PAGE = 12;

export default function ProductsPage() {
  const { theme: t, toggleTheme } = useTheme(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { addItem, openCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [scentType, setScentType] = useState("All");
  const [priceRange, setPriceRange] = useState(0);
  const [sortBy, setSortBy] = useState("featured");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()]).then(([prods, cats]) => {
      setProducts(prods);
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [category, scentType, priceRange, sortBy, search]);

  const categoryNames = ["All", ...categories.map((c) => c.name)];
  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    openCart();
  };

  const filtered = useMemo(() => {
    const range = PRICE_RANGES[priceRange];
    let result = products.filter((p) => {
      const matchCat = category === "All" || p.category === category;
      const matchScent = scentType === "All" || p.scent_type === scentType;
      const matchPrice = p.price >= range.min && p.price < range.max;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchScent && matchPrice && matchSearch;
    });
    if (sortBy === "price-asc")
      result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc")
      result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === "name-asc")
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, category, scentType, priceRange, sortBy, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const resetFilters = () => {
    setCategory("All");
    setScentType("All");
    setPriceRange(0);
    setSortBy("featured");
    setSearch("");
  };
  const hasActiveFilters =
    category !== "All" || scentType !== "All" || priceRange !== 0;
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

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

      {/* ── Page header with background image ── */}
      <div
        style={{
          position: "relative",
          paddingTop: 160,
          paddingBottom: 60,
          paddingLeft: "5vw",
          paddingRight: "5vw",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url(https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1600&q=85)",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.5) 100%)",
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background: t.gold,
            opacity: 0.4,
            zIndex: 2,
          }}
        />
        <div style={{ position: "relative", zIndex: 3 }}>
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
            Our Collection
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "clamp(28px, 4vw, 52px)",
                  fontWeight: 300,
                  letterSpacing: "0.02em",
                  color: "#ffffff",
                  marginBottom: 10,
                }}
              >
                All Fragrances
              </h1>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.5)",
                  fontWeight: 300,
                  letterSpacing: "0.05em",
                }}
              >
                {loading
                  ? "Loading..."
                  : `${products.length} curated scents — find yours`}
              </p>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search fragrances..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#ffffff",
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  letterSpacing: "0.05em",
                  padding: "11px 40px 11px 16px",
                  width: isMobile ? "100%" : 260,
                  outline: "none",
                  backdropFilter: "blur(8px)",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = t.gold)}
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)")
                }
              />
              <span
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 16,
                  pointerEvents: "none",
                }}
              >
                ⌕
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer backdrop ── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 200,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* ── Body: sidebar + grid TOGETHER in one flex container ── */}
      <div
        style={{
          display: "flex",
          padding: "0 5vw",
          maxWidth: 1400,
          margin: "0 auto",
          gap: 40,
          alignItems: "flex-start",
        }}
      >
        {/* ── Sidebar — inside the flex container ── */}
        <aside
          style={
            isMobile
              ? {
                  // Mobile: fixed drawer
                  position: "fixed",
                  top: 0,
                  left: 0,
                  height: "100vh",
                  width: 300,
                  background: t.bg,
                  borderRight: `1px solid ${t.border}`,
                  zIndex: 201,
                  overflowY: "auto",
                  padding: "88px 28px 60px",
                  transform: sidebarOpen
                    ? "translateX(0)"
                    : "translateX(-100%)",
                  transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
                  boxShadow: sidebarOpen
                    ? "8px 0 40px rgba(0,0,0,0.35)"
                    : "none",
                }
              : {
                  // Desktop: inline collapsible
                  width: sidebarOpen ? 240 : 0,
                  minWidth: sidebarOpen ? 240 : 0,
                  overflow: "hidden",
                  paddingTop: sidebarOpen ? 40 : 0,
                  paddingBottom: 60,
                  flexShrink: 0,
                  transition: "width 0.3s, min-width 0.3s",
                }
          }
        >
          <div style={{ width: isMobile ? "100%" : 240 }}>
            {/* Mobile close button */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
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
                }}
              >
                ×
              </button>
            )}

            {/* Sidebar header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 32,
              }}
            >
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 10,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: t.gold,
                }}
              >
                Filters
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  style={{
                    background: "none",
                    border: "none",
                    fontFamily: fonts.sans,
                    fontSize: 10,
                    color: t.muted,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Category */}
            <FilterGroup title="Category">
              {categoryNames.map((cat) => (
                <FilterChip
                  key={cat}
                  label={cat}
                  active={category === cat}
                  theme={t}
                  onClick={() => setCategory(cat)}
                />
              ))}
            </FilterGroup>
            <Divider color={t.border} />

            {/* Price */}
            <FilterGroup title="Price Range">
              {PRICE_RANGES.map((range, i) => (
                <RadioRow
                  key={range.label}
                  label={range.label}
                  checked={priceRange === i}
                  theme={t}
                  onClick={() => setPriceRange(i)}
                />
              ))}
            </FilterGroup>
            <Divider color={t.border} />

            {/* Scent type */}
            <FilterGroup title="Scent Type">
              {SCENT_TYPES.map((scent) => (
                <FilterChip
                  key={scent}
                  label={scent}
                  active={scentType === scent}
                  theme={t}
                  onClick={() => setScentType(scent)}
                />
              ))}
            </FilterGroup>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div
          style={{ flex: 1, paddingTop: 40, paddingBottom: 80, minWidth: 0 }}
        >
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  background: "none",
                  border: `1px solid ${t.border}`,
                  color: t.muted,
                  cursor: "pointer",
                  fontFamily: fonts.sans,
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  padding: "8px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
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
                ☰ {sidebarOpen ? "Hide" : "Show"} Filters
              </button>
              <span
                style={{ fontFamily: fonts.sans, fontSize: 12, color: t.muted }}
              >
                {loading ? "Loading..." : `${filtered.length} results`}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 11,
                  color: t.muted,
                  letterSpacing: "0.1em",
                }}
              >
                Sort by
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: t.card,
                  border: `1px solid ${t.border}`,
                  color: t.text,
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  padding: "8px 14px",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 24,
              }}
            >
              {category !== "All" && (
                <ActivePill
                  label={`Category: ${category}`}
                  theme={t}
                  onRemove={() => setCategory("All")}
                />
              )}
              {scentType !== "All" && (
                <ActivePill
                  label={`Scent: ${scentType}`}
                  theme={t}
                  onRemove={() => setScentType("All")}
                />
              )}
              {priceRange !== 0 && (
                <ActivePill
                  label={PRICE_RANGES[priceRange].label}
                  theme={t}
                  onRemove={() => setPriceRange(0)}
                />
              )}
            </div>
          )}

          {/* Product grid */}
          {loading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 24,
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  style={{
                    background: t.card,
                    border: `1px solid ${t.border}`,
                    aspectRatio: "3/4",
                    opacity: 0.5,
                    animation: "pulse 1.5s ease-in-out infinite",
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
              <style>{`@keyframes pulse{0%,100%{opacity:.5}50%{opacity:.2}}`}</style>
            </div>
          ) : paginated.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(2, 1fr)"
                  : "repeat(auto-fill, minmax(220px, 1fr))",
                gap: isMobile ? 16 : 24,
              }}
            >
              {paginated.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  theme={t}
                  animationDelay={i * 0.04}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                border: `1px dashed ${t.border}`,
              }}
            >
              <p style={{ fontSize: 32, marginBottom: 16 }}>✦</p>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 14,
                  color: t.muted,
                  marginBottom: 24,
                }}
              >
                No fragrances match your filters.
              </p>
              <button onClick={resetFilters} className="btn-outline">
                Clear Filters
              </button>
            </div>
          )}

          {/* ── Pagination ── */}
          {!loading && totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 12,
                marginTop: 56,
              }}
            >
              {/* Prev */}
              <button
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  scrollToTop();
                }}
                disabled={page === 1}
                style={{
                  background: "none",
                  border: `1px solid ${page === 1 ? t.border : t.gold}`,
                  color: page === 1 ? t.muted : t.gold,
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  fontFamily: fonts.sans,
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  padding: "10px 20px",
                  transition: "all 0.2s",
                  opacity: page === 1 ? 0.4 : 1,
                }}
              >
                ← Prev
              </button>

              {/* Page numbers with ellipsis */}
              <div style={{ display: "flex", gap: 8 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                  )
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                      acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span
                        key={`e-${i}`}
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 12,
                          color: t.muted,
                          padding: "10px 4px",
                        }}
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => {
                          setPage(p as number);
                          scrollToTop();
                        }}
                        style={{
                          width: 40,
                          height: 40,
                          background: page === p ? t.gold : "none",
                          color:
                            page === p
                              ? t.dark
                                ? "#0a0a0a"
                                : "#fff"
                              : t.muted,
                          border: `1px solid ${page === p ? t.gold : t.border}`,
                          cursor: "pointer",
                          fontFamily: fonts.sans,
                          fontSize: 12,
                          transition: "all 0.2s",
                        }}
                      >
                        {p}
                      </button>
                    ),
                  )}
              </div>

              {/* Next */}
              <button
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  scrollToTop();
                }}
                disabled={page === totalPages}
                style={{
                  background: "none",
                  border: `1px solid ${page === totalPages ? t.border : t.gold}`,
                  color: page === totalPages ? t.muted : t.gold,
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                  fontFamily: fonts.sans,
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  padding: "10px 20px",
                  transition: "all 0.2s",
                  opacity: page === totalPages ? 0.4 : 1,
                }}
              >
                Next →
              </button>
            </div>
          )}

          {/* Page count info */}
          {!loading && totalPages > 1 && (
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 11,
                color: t.muted,
                textAlign: "center",
                marginTop: 16,
                letterSpacing: "0.08em",
              }}
            >
              Showing {(page - 1) * PER_PAGE + 1}–
              {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}{" "}
              fragrances
            </p>
          )}
        </div>
      </div>

      <Footer theme={t} />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p
        style={{
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: 10,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "#888880",
          marginBottom: 14,
        }}
      >
        {title}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  theme: t,
  onClick,
}: {
  label: string;
  active: boolean;
  theme: any;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'Josefin Sans', sans-serif",
        fontSize: 10,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        background: active ? t.gold : "transparent",
        color: active ? (t.dark ? "#0a0a0a" : "#fff") : t.muted,
        border: `1px solid ${active ? t.gold : t.border}`,
        padding: "6px 14px",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      {label}
    </button>
  );
}

function RadioRow({
  label,
  checked,
  theme: t,
  onClick,
}: {
  label: string;
  checked: boolean;
  theme: any;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "5px 0",
        width: "100%",
        textAlign: "left",
      }}
    >
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          border: `1px solid ${checked ? t.gold : t.border}`,
          background: checked ? t.gold : "transparent",
          flexShrink: 0,
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked && (
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: t.dark ? "#0a0a0a" : "#fff",
            }}
          />
        )}
      </span>
      <span
        style={{
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: 12,
          color: checked ? t.text : t.muted,
          letterSpacing: "0.05em",
          transition: "color 0.2s",
        }}
      >
        {label}
      </span>
    </button>
  );
}

function ActivePill({
  label,
  theme: t,
  onRemove,
}: {
  label: string;
  theme: any;
  onRemove: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: t.subtle,
        border: `1px solid ${t.border}`,
        padding: "5px 12px",
        fontFamily: "'Josefin Sans', sans-serif",
        fontSize: 10,
        letterSpacing: "0.1em",
        color: t.muted,
      }}
    >
      {label}
      <button
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          color: t.muted,
          cursor: "pointer",
          fontSize: 14,
          lineHeight: 1,
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

function Divider({ color }: { color: string }) {
  return (
    <div
      style={{ height: 1, background: color, marginBottom: 28, opacity: 0.5 }}
    />
  );
}
