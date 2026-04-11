"use client";

// app/dashboard/page.tsx
// Admin dashboard — Overview, Products, Orders, Users.
// Protected route — add Supabase session + role check in Phase 6.

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { allProducts } from "@/lib/mockData";
import { fonts } from "@/lib/theme";
import { formatPrice } from "@/utils/format";
import GlobalStyles from "@/components/GlobalStyles";

// ── Mock data ────────────────────────────────────────────────────────────────
const mockOrders = [
  {
    id: "ORD-001",
    customer: "Aisha M.",
    email: "aisha@email.com",
    total: 37000,
    status: "delivered",
    date: "Apr 8, 2025",
    items: 2,
  },
  {
    id: "ORD-002",
    customer: "Emeka O.",
    email: "emeka@email.com",
    total: 18500,
    status: "processing",
    date: "Apr 9, 2025",
    items: 1,
  },
  {
    id: "ORD-003",
    customer: "Zara K.",
    email: "zara@email.com",
    total: 52700,
    status: "shipped",
    date: "Apr 9, 2025",
    items: 3,
  },
  {
    id: "ORD-004",
    customer: "Tunde A.",
    email: "tunde@email.com",
    total: 21000,
    status: "pending",
    date: "Apr 10, 2025",
    items: 1,
  },
  {
    id: "ORD-005",
    customer: "Ngozi B.",
    email: "ngozi@email.com",
    total: 14200,
    status: "cancelled",
    date: "Apr 10, 2025",
    items: 1,
  },
  {
    id: "ORD-006",
    customer: "Chidi O.",
    email: "chidi@email.com",
    total: 29300,
    status: "delivered",
    date: "Apr 7, 2025",
    items: 2,
  },
];

const mockUsers = [
  {
    id: "USR-001",
    name: "Aisha M.",
    email: "aisha@email.com",
    joined: "Jan 2025",
    orders: 4,
    spent: 89000,
    status: "active",
  },
  {
    id: "USR-002",
    name: "Emeka O.",
    email: "emeka@email.com",
    joined: "Feb 2025",
    orders: 2,
    spent: 37000,
    status: "active",
  },
  {
    id: "USR-003",
    name: "Zara K.",
    email: "zara@email.com",
    joined: "Mar 2025",
    orders: 6,
    spent: 124000,
    status: "active",
  },
  {
    id: "USR-004",
    name: "Tunde A.",
    email: "tunde@email.com",
    joined: "Mar 2025",
    orders: 1,
    spent: 21000,
    status: "active",
  },
  {
    id: "USR-005",
    name: "Ngozi B.",
    email: "ngozi@email.com",
    joined: "Apr 2025",
    orders: 1,
    spent: 14200,
    status: "inactive",
  },
];

const STATUS_COLORS: Record<string, string> = {
  delivered: "#7abf7a",
  processing: "#C9A84C",
  shipped: "#7ab3bf",
  pending: "#888880",
  cancelled: "#e25555",
  active: "#7abf7a",
  inactive: "#888880",
};

type Tab = "overview" | "products" | "orders" | "users";

export default function DashboardPage() {
  const { theme: t, toggleTheme } = useTheme(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const totalRevenue = mockOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);
  const totalOrders = mockOrders.length;
  const totalUsers = mockUsers.length;
  const totalProducts = allProducts.length;

  const filteredProducts = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()),
  );
  const filteredOrders = mockOrders.filter(
    (o) =>
      o.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase()),
  );
  const filteredUsers = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const navItems: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "◈" },
    { id: "products", label: "Products", icon: "✦" },
    { id: "orders", label: "Orders", icon: "◎" },
    { id: "users", label: "Users", icon: "◉" },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: t.bg,
        color: t.text,
        fontFamily: fonts.serif,
        transition: "background 0.4s, color 0.4s",
      }}
    >
      <GlobalStyles theme={t} />
      <div className="grain" />

      {/* ── Sidebar ── */}
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

      <aside
        style={
          isMobile
            ? {
                position: "fixed",
                top: 0,
                left: 0,
                height: "100vh",
                width: 240,
                background: t.surface,
                borderRight: `1px solid ${t.border}`,
                zIndex: 201,
                transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
                display: "flex",
                flexDirection: "column",
              }
            : {
                width: 240,
                flexShrink: 0,
                background: t.surface,
                borderRight: `1px solid ${t.border}`,
                display: "flex",
                flexDirection: "column",
                position: "sticky",
                top: 0,
                height: "100vh",
                overflowY: "auto",
              }
        }
      >
        {/* Sidebar logo */}
        <div
          style={{
            padding: "28px 24px 24px",
            borderBottom: `1px solid ${t.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 6,
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
                  fontFamily: fonts.sans,
                  fontWeight: 600,
                }}
              >
                S
              </span>
            </div>
            <span
              style={{
                fontSize: 16,
                fontFamily: fonts.sans,
                letterSpacing: "0.15em",
                color: t.text,
                fontWeight: 500,
              }}
            >
              SCENTAI
            </span>
          </div>
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 9,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: t.dark ? "#0a0a0a" : "#fff",
              background: t.gold,
              padding: "3px 10px",
            }}
          >
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "20px 12px" }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (isMobile) setSidebarOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "12px 14px",
                background: activeTab === item.id ? t.subtle : "none",
                border:
                  activeTab === item.id
                    ? `1px solid ${t.border}`
                    : "1px solid transparent",
                color: activeTab === item.id ? t.text : t.muted,
                cursor: "pointer",
                marginBottom: 4,
                fontFamily: fonts.sans,
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                textAlign: "left",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.id)
                  (e.currentTarget as HTMLElement).style.color = t.text;
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id)
                  (e.currentTarget as HTMLElement).style.color = t.muted;
              }}
            >
              <span
                style={{
                  color: activeTab === item.id ? t.gold : t.muted,
                  fontSize: 14,
                }}
              >
                {item.icon}
              </span>
              {item.label}
              {item.id === "orders" && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: t.gold,
                    color: t.dark ? "#0a0a0a" : "#fff",
                    fontFamily: fonts.sans,
                    fontSize: 9,
                    padding: "2px 7px",
                    borderRadius: 10,
                  }}
                >
                  {mockOrders.filter((o) => o.status === "pending").length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div
          style={{ padding: "16px 12px", borderTop: `1px solid ${t.border}` }}
        >
          <button
            onClick={toggleTheme}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "10px 14px",
              background: "none",
              border: "none",
              color: t.muted,
              cursor: "pointer",
              fontFamily: fonts.sans,
              fontSize: 11,
              letterSpacing: "0.1em",
            }}
          >
            {t.dark ? "☀" : "☾"} {t.dark ? "Light Mode" : "Dark Mode"}
          </button>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              fontFamily: fonts.sans,
              fontSize: 11,
              letterSpacing: "0.1em",
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
            ← Back to Store
          </Link>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "10px 14px",
              background: "none",
              border: "none",
              color: "#e25555",
              cursor: "pointer",
              fontFamily: fonts.sans,
              fontSize: 11,
              letterSpacing: "0.1em",
            }}
          >
            ⎋ Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflowX: "hidden",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 32px",
            borderBottom: `1px solid ${t.border}`,
            background: t.surface,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: "none",
                  border: `1px solid ${t.border}`,
                  color: t.muted,
                  cursor: "pointer",
                  width: 32,
                  height: 32,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ☰
              </button>
            )}
            <div>
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 300,
                  letterSpacing: "0.03em",
                }}
              >
                {navItems.find((n) => n.id === activeTab)?.label}
              </h1>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 10,
                  color: t.muted,
                  letterSpacing: "0.1em",
                  marginTop: 2,
                }}
              >
                {new Date().toLocaleDateString("en-NG", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Admin info */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 11,
                  color: t.text,
                  letterSpacing: "0.05em",
                }}
              >
                Admin User
              </p>
              <p
                style={{ fontFamily: fonts.sans, fontSize: 10, color: t.muted }}
              >
                admin@scentai.com
              </p>
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                background: t.gold,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: fonts.sans,
                fontSize: 13,
                fontWeight: 700,
                color: t.dark ? "#0a0a0a" : "#fff",
              }}
            >
              A
            </div>
          </div>
        </div>

        {/* ── Tab content ── */}
        <div
          style={{
            flex: 1,
            padding: isMobile ? "24px 16px" : "32px",
            overflowY: "auto",
          }}
        >
          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div>
              {/* Stat cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "repeat(2, 1fr)"
                    : "repeat(4, 1fr)",
                  gap: 16,
                  marginBottom: 40,
                }}
              >
                {[
                  {
                    label: "Total Revenue",
                    value: formatPrice(totalRevenue),
                    change: "+12%",
                    icon: "₦",
                  },
                  {
                    label: "Total Orders",
                    value: totalOrders,
                    change: "+8%",
                    icon: "◎",
                  },
                  {
                    label: "Products",
                    value: totalProducts,
                    change: "+2",
                    icon: "✦",
                  },
                  {
                    label: "Customers",
                    value: totalUsers,
                    change: "+5%",
                    icon: "◉",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: t.card,
                      border: `1px solid ${t.border}`,
                      padding: "24px 20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 12,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 10,
                          color: t.muted,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                        }}
                      >
                        {stat.label}
                      </span>
                      <span style={{ color: t.gold, fontSize: 16 }}>
                        {stat.icon}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 28,
                        fontWeight: 300,
                        color: t.text,
                        marginBottom: 8,
                      }}
                    >
                      {stat.value}
                    </p>
                    <p
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: 11,
                        color: "#7abf7a",
                      }}
                    >
                      {stat.change} this month
                    </p>
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              <div style={{ marginBottom: 40 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <h2 style={{ fontSize: 20, fontWeight: 300 }}>
                    Recent Orders
                  </h2>
                  <button
                    onClick={() => setActiveTab("orders")}
                    style={{
                      background: "none",
                      border: "none",
                      fontFamily: fonts.sans,
                      fontSize: 11,
                      color: t.gold,
                      cursor: "pointer",
                      letterSpacing: "0.1em",
                    }}
                  >
                    View all →
                  </button>
                </div>
                <OrderTable
                  orders={mockOrders.slice(0, 4)}
                  theme={t}
                  isMobile={isMobile}
                />
              </div>

              {/* Low stock alert */}
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 300, marginBottom: 20 }}>
                  Low Stock Alert
                </h2>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {allProducts
                    .filter((p) => (p.stock ?? 0) <= 6)
                    .map((p) => (
                      <div
                        key={p.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "14px 20px",
                          background: t.card,
                          border: `1px solid ${t.border}`,
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                          }}
                        >
                          <img
                            src={p.image_url}
                            alt={p.name}
                            style={{
                              width: 40,
                              height: 48,
                              objectFit: "cover",
                              border: `1px solid ${t.border}`,
                            }}
                          />
                          <div>
                            <p style={{ fontSize: 16, fontWeight: 400 }}>
                              {p.name}
                            </p>
                            <p
                              style={{
                                fontFamily: fonts.sans,
                                fontSize: 10,
                                color: t.muted,
                                letterSpacing: "0.1em",
                              }}
                            >
                              {p.category}
                            </p>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: fonts.sans,
                              fontSize: 13,
                              color: "#e25555",
                            }}
                          >
                            {p.stock} left
                          </span>
                          <span
                            style={{
                              color: t.gold,
                              fontSize: 14,
                              fontWeight: 500,
                            }}
                          >
                            {formatPrice(p.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PRODUCTS ── */}
          {activeTab === "products" && (
            <div>
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
                <SearchInput
                  value={productSearch}
                  onChange={setProductSearch}
                  placeholder="Search products..."
                  theme={t}
                />
                <button
                  style={{
                    background: t.gold,
                    color: t.dark ? "#0a0a0a" : "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: fonts.sans,
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    padding: "10px 20px",
                  }}
                >
                  + Add Product
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {/* Header */}
                {!isMobile && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "60px 1fr 120px 100px 80px 100px",
                      gap: 16,
                      padding: "10px 16px",
                      fontFamily: fonts.sans,
                      fontSize: 9,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: t.muted,
                      borderBottom: `1px solid ${t.border}`,
                    }}
                  >
                    {[
                      "",
                      "Product",
                      "Category",
                      "Price",
                      "Stock",
                      "Actions",
                    ].map((h) => (
                      <span key={h}>{h}</span>
                    ))}
                  </div>
                )}

                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "60px 1fr 80px"
                        : "60px 1fr 120px 100px 80px 100px",
                      gap: 16,
                      padding: "14px 16px",
                      borderBottom: `1px solid ${t.border}`,
                      alignItems: "center",
                      background: t.card,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        t.subtle)
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        t.card)
                    }
                  >
                    <img
                      src={p.image_url}
                      alt={p.name}
                      style={{
                        width: 48,
                        height: 56,
                        objectFit: "cover",
                        border: `1px solid ${t.border}`,
                      }}
                    />
                    <div>
                      <p
                        style={{
                          fontSize: 16,
                          fontWeight: 400,
                          marginBottom: 2,
                        }}
                      >
                        {p.name}
                      </p>
                      {isMobile && (
                        <p
                          style={{
                            fontFamily: fonts.sans,
                            fontSize: 10,
                            color: t.muted,
                          }}
                        >
                          {p.category}
                        </p>
                      )}
                    </div>
                    {!isMobile && (
                      <span
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 11,
                          color: t.muted,
                        }}
                      >
                        {p.category}
                      </span>
                    )}
                    {!isMobile && (
                      <span style={{ color: t.gold, fontSize: 14 }}>
                        {formatPrice(p.price)}
                      </span>
                    )}
                    {!isMobile && (
                      <span
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 12,
                          color: (p.stock ?? 0) <= 6 ? "#e25555" : t.text,
                        }}
                      >
                        {p.stock} units
                      </span>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        style={{
                          background: "none",
                          border: `1px solid ${t.border}`,
                          color: t.muted,
                          cursor: "pointer",
                          fontFamily: fonts.sans,
                          fontSize: 9,
                          letterSpacing: "0.1em",
                          padding: "5px 10px",
                          transition: "border-color 0.2s, color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor =
                            t.gold;
                          (e.currentTarget as HTMLElement).style.color = t.gold;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor =
                            t.border;
                          (e.currentTarget as HTMLElement).style.color =
                            t.muted;
                        }}
                      >
                        Edit
                      </button>
                      <button
                        style={{
                          background: "none",
                          border: "1px solid rgba(226,85,85,0.3)",
                          color: "#e25555",
                          cursor: "pointer",
                          fontFamily: fonts.sans,
                          fontSize: 9,
                          letterSpacing: "0.1em",
                          padding: "5px 10px",
                        }}
                      >
                        Del
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {activeTab === "orders" && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <SearchInput
                  value={orderSearch}
                  onChange={setOrderSearch}
                  placeholder="Search orders or customers..."
                  theme={t}
                />
              </div>

              {/* Status filter pills */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 24,
                  flexWrap: "wrap",
                }}
              >
                {[
                  "All",
                  "Pending",
                  "Processing",
                  "Shipped",
                  "Delivered",
                  "Cancelled",
                ].map((s) => (
                  <span
                    key={s}
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 10,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      padding: "5px 14px",
                      border: `1px solid ${s === "All" ? t.gold : t.border}`,
                      color: s === "All" ? t.gold : t.muted,
                      cursor: "pointer",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>

              <OrderTable
                orders={filteredOrders}
                theme={t}
                isMobile={isMobile}
              />
            </div>
          )}

          {/* ── USERS ── */}
          {activeTab === "users" && (
            <div>
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
                <SearchInput
                  value={userSearch}
                  onChange={setUserSearch}
                  placeholder="Search users..."
                  theme={t}
                />
                <p
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 12,
                    color: t.muted,
                  }}
                >
                  {filteredUsers.length}{" "}
                  {filteredUsers.length === 1 ? "user" : "users"}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {!isMobile && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 180px 80px 120px 80px",
                      gap: 16,
                      padding: "10px 20px",
                      fontFamily: fonts.sans,
                      fontSize: 9,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: t.muted,
                      borderBottom: `1px solid ${t.border}`,
                    }}
                  >
                    {[
                      "Customer",
                      "Joined",
                      "Orders",
                      "Total Spent",
                      "Status",
                    ].map((h) => (
                      <span key={h}>{h}</span>
                    ))}
                  </div>
                )}

                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "1fr 80px"
                        : "1fr 180px 80px 120px 80px",
                      gap: 16,
                      padding: "16px 20px",
                      borderBottom: `1px solid ${t.border}`,
                      alignItems: "center",
                      background: t.card,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        t.subtle)
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        t.card)
                    }
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          background: t.subtle,
                          border: `1px solid ${t.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: fonts.sans,
                          fontSize: 13,
                          color: t.gold,
                          flexShrink: 0,
                        }}
                      >
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontSize: 16, fontWeight: 400 }}>
                          {u.name}
                        </p>
                        <p
                          style={{
                            fontFamily: fonts.sans,
                            fontSize: 11,
                            color: t.muted,
                          }}
                        >
                          {u.email}
                        </p>
                      </div>
                    </div>
                    {!isMobile && (
                      <span
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 12,
                          color: t.muted,
                        }}
                      >
                        {u.joined}
                      </span>
                    )}
                    {!isMobile && (
                      <span
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 12,
                          color: t.text,
                          textAlign: "center",
                        }}
                      >
                        {u.orders}
                      </span>
                    )}
                    {!isMobile && (
                      <span style={{ color: t.gold, fontSize: 14 }}>
                        {formatPrice(u.spent)}
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: 9,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: STATUS_COLORS[u.status],
                        border: `1px solid ${STATUS_COLORS[u.status]}`,
                        padding: "3px 10px",
                        display: "inline-block",
                      }}
                    >
                      {u.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function OrderTable({
  orders,
  theme: t,
  isMobile,
}: {
  orders: typeof mockOrders;
  theme: any;
  isMobile: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {!isMobile && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "100px 1fr 140px 100px 90px",
            gap: 16,
            padding: "10px 20px",
            fontFamily: fonts.sans,
            fontSize: 9,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: t.muted,
            borderBottom: `1px solid ${t.border}`,
          }}
        >
          {["Order ID", "Customer", "Date", "Total", "Status"].map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>
      )}
      {orders.map((o) => (
        <div
          key={o.id}
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr 90px"
              : "100px 1fr 140px 100px 90px",
            gap: 16,
            padding: "14px 20px",
            borderBottom: `1px solid ${t.border}`,
            alignItems: "center",
            background: t.card,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = t.subtle)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = t.card)
          }
        >
          {!isMobile && (
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: 11,
                color: t.gold,
                letterSpacing: "0.05em",
              }}
            >
              {o.id}
            </span>
          )}
          <div>
            <p style={{ fontSize: 15, fontWeight: 400 }}>{o.customer}</p>
            <p style={{ fontFamily: fonts.sans, fontSize: 10, color: t.muted }}>
              {isMobile ? o.id : o.email}
            </p>
          </div>
          {!isMobile && (
            <span
              style={{ fontFamily: fonts.sans, fontSize: 12, color: t.muted }}
            >
              {o.date}
            </span>
          )}
          {!isMobile && (
            <span style={{ color: t.gold, fontSize: 14 }}>
              {formatPrice(o.total)}
            </span>
          )}
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 9,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: STATUS_COLORS[o.status],
              border: `1px solid ${STATUS_COLORS[o.status]}33`,
              padding: "4px 10px",
              display: "inline-block",
            }}
          >
            {o.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function SearchInput({
  value,
  onChange,
  placeholder,
  theme: t,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  theme: any;
}) {
  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: t.card,
          border: `1px solid ${t.border}`,
          color: t.text,
          fontFamily: fonts.sans,
          fontSize: 12,
          letterSpacing: "0.05em",
          padding: "10px 40px 10px 16px",
          width: 280,
          outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = t.gold)}
        onBlur={(e) => (e.currentTarget.style.borderColor = t.border)}
      />
      <span
        style={{
          position: "absolute",
          right: 14,
          top: "50%",
          transform: "translateY(-50%)",
          color: t.muted,
          fontSize: 14,
          pointerEvents: "none",
        }}
      >
        ⌕
      </span>
    </div>
  );
}
