"use client";

// app/account/page.tsx
// User account dashboard — Orders, Addresses, Wishlist, Account Settings.

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "../../hooks/useTheme";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useCart } from "../../lib/cartContext";
import { supabase } from "../../lib/supabase";
import { fonts } from "../../lib/theme";
import { formatPrice } from "../../utils/format";
import GlobalStyles from "../../components/GlobalStyles";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

type Tab = "orders" | "addresses" | "wishlist" | "settings";

const ORDER_STATUS_COLORS: Record<string, string> = {
  delivered: "#7abf7a",
  processing: "#C9A84C",
  shipped: "#7ab3bf",
  pending: "#888880",
  cancelled: "#e25555",
};

export default function AccountPage() {
  const { theme: t, toggleTheme } = useTheme(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { addItem, openCart } = useCart();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Data
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);

  // Settings form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [settingLoad, setSettingLoad] = useState(false);
  const [settingMsg, setSettingMsg] = useState("");
  const [settingError, setSettingError] = useState("");

  // Address form
  const [addrForm, setAddrForm] = useState({
    full_name: "",
    phone: "",
    address_line: "",
    city: "",
    state: "",
    country: "Nigeria",
  });
  const [addrModal, setAddrModal] = useState(false);
  const [addrLoading, setAddrLoading] = useState(false);
  const [editAddrId, setEditAddrId] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    const check = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/auth/login");
        return;
      }
      setUser(session.user);

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      setProfile(prof);
      setFullName(prof?.full_name ?? "");
      setPhone(prof?.phone ?? "");

      // Load all data in parallel
      const [ordersRes, addrRes, wishRes] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false }),
        supabase.from("addresses").select("*").eq("user_id", session.user.id),
        supabase
          .from("wishlist")
          .select(
            "*, products(id, name, price, image_url, scent_type, category_id, categories(name))",
          )
          .eq("user_id", session.user.id),
      ]);

      setOrders(ordersRes.data ?? []);
      setAddresses(addrRes.data ?? []);
      setWishlist(
        (wishRes.data ?? []).map((w: any) => ({
          ...w,
          product: w.products
            ? { ...w.products, category: w.products.categories?.name ?? "" }
            : null,
        })),
      );
      setLoading(false);
    };
    check();
  }, [router]);

  // Settings save
  const handleSaveSettings = async () => {
    if (!fullName.trim()) {
      setSettingError("Full name is required.");
      return;
    }
    if (newPassword && newPassword !== confirmPass) {
      setSettingError("Passwords do not match.");
      return;
    }
    if (newPassword && newPassword.length < 8) {
      setSettingError("Password must be at least 8 characters.");
      return;
    }

    setSettingLoad(true);
    setSettingError("");
    setSettingMsg("");

    // Update profile
    await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", user.id);

    // Update password if provided
    if (newPassword) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        setSettingError(error.message);
        setSettingLoad(false);
        return;
      }
    }

    setSettingLoad(false);
    setSettingMsg("Profile updated successfully!");
    setNewPassword("");
    setConfirmPass("");
    setTimeout(() => setSettingMsg(""), 3000);
  };

  // Address save
  const handleSaveAddress = async () => {
    if (
      !addrForm.full_name ||
      !addrForm.address_line ||
      !addrForm.city ||
      !addrForm.country
    )
      return;
    setAddrLoading(true);

    if (editAddrId) {
      const { data } = await supabase
        .from("addresses")
        .update({ ...addrForm, user_id: user.id })
        .eq("id", editAddrId)
        .select()
        .single();
      setAddresses((prev) => prev.map((a) => (a.id === editAddrId ? data : a)));
    } else {
      const { data } = await supabase
        .from("addresses")
        .insert({ ...addrForm, user_id: user.id })
        .select()
        .single();
      if (data) setAddresses((prev) => [...prev, data]);
    }

    setAddrLoading(false);
    setAddrModal(false);
    setAddrForm({
      full_name: "",
      phone: "",
      address_line: "",
      city: "",
      state: "",
      country: "Nigeria",
    });
    setEditAddrId(null);
  };

  const handleDeleteAddress = async (id: string) => {
    await supabase.from("addresses").delete().eq("id", id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const openEditAddr = (addr: any) => {
    setAddrForm({
      full_name: addr.full_name,
      phone: addr.phone ?? "",
      address_line: addr.address_line,
      city: addr.city,
      state: addr.state ?? "",
      country: addr.country,
    });
    setEditAddrId(addr.id);
    setAddrModal(true);
  };

  // Wishlist
  const handleRemoveWishlist = async (id: string) => {
    await supabase.from("wishlist").delete().eq("id", id);
    setWishlist((prev) => prev.filter((w) => w.id !== id));
  };

  const handleWishlistToCart = (product: any) => {
    if (!product) return;
    addItem(product, 1);
    openCart();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "orders", label: "My Orders", icon: "◎" },
    { id: "addresses", label: "Addresses", icon: "⌖" },
    { id: "wishlist", label: "Wishlist", icon: "♡" },
    { id: "settings", label: "Settings", icon: "⚙" },
  ];

  const displayName = profile?.full_name ?? user?.email ?? "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (loading || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: t.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "2px solid #2a2a2a",
            borderTopColor: "#C9A84C",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
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

      {/* Address modal */}
      {addrModal && (
        <>
          <div
            onClick={() => {
              setAddrModal(false);
              setEditAddrId(null);
            }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              zIndex: 300,
              backdropFilter: "blur(4px)",
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: "min(520px,95vw)",
              background: t.bg,
              border: `1px solid ${t.border}`,
              zIndex: 301,
              padding: "36px 40px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 300 }}>
                {editAddrId ? "Edit Address" : "Add Address"}
              </h3>
              <button
                onClick={() => {
                  setAddrModal(false);
                  setEditAddrId(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: t.muted,
                  cursor: "pointer",
                  fontSize: 20,
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <AccInput
                label="Full Name *"
                value={addrForm.full_name}
                onChange={(v) => setAddrForm((f) => ({ ...f, full_name: v }))}
                placeholder="Delivery recipient name"
                theme={t}
              />
              <AccInput
                label="Phone"
                value={addrForm.phone}
                onChange={(v) => setAddrForm((f) => ({ ...f, phone: v }))}
                placeholder="+234 800 000 0000"
                theme={t}
              />
              <AccInput
                label="Address Line *"
                value={addrForm.address_line}
                onChange={(v) =>
                  setAddrForm((f) => ({ ...f, address_line: v }))
                }
                placeholder="Street address, apartment, etc."
                theme={t}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <AccInput
                  label="City *"
                  value={addrForm.city}
                  onChange={(v) => setAddrForm((f) => ({ ...f, city: v }))}
                  placeholder="Lagos"
                  theme={t}
                />
                <AccInput
                  label="State"
                  value={addrForm.state}
                  onChange={(v) => setAddrForm((f) => ({ ...f, state: v }))}
                  placeholder="Lagos State"
                  theme={t}
                />
              </div>
              <AccInput
                label="Country *"
                value={addrForm.country}
                onChange={(v) => setAddrForm((f) => ({ ...f, country: v }))}
                placeholder="Nigeria"
                theme={t}
              />
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => {
                    setAddrModal(false);
                    setEditAddrId(null);
                  }}
                  style={{
                    flex: 1,
                    background: "none",
                    border: `1px solid ${t.border}`,
                    color: t.muted,
                    cursor: "pointer",
                    fontFamily: fonts.sans,
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    padding: "12px",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAddress}
                  disabled={addrLoading}
                  style={{
                    flex: 2,
                    background: addrLoading ? t.border : t.gold,
                    color: t.dark ? "#0a0a0a" : "#fff",
                    border: "none",
                    cursor: addrLoading ? "not-allowed" : "pointer",
                    fontFamily: fonts.sans,
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    padding: "12px",
                  }}
                >
                  {addrLoading
                    ? "Saving..."
                    : editAddrId
                      ? "Save Changes"
                      : "Add Address"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Page header */}
      <div
        style={{
          paddingTop: 96,
          paddingBottom: 0,
          background: t.surface,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 5vw" }}>
          {/* User info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              paddingBottom: 28,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                background: t.gold,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: fonts.sans,
                fontSize: 20,
                fontWeight: 700,
                color: t.dark ? "#0a0a0a" : "#fff",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div>
              <h1
                style={{
                  fontSize: "clamp(20px, 3vw, 28px)",
                  fontWeight: 300,
                  marginBottom: 4,
                }}
              >
                {displayName}
              </h1>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  color: t.muted,
                  letterSpacing: "0.05em",
                }}
              >
                {user.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              style={{
                marginLeft: "auto",
                background: "none",
                border: `1px solid ${t.border}`,
                color: t.muted,
                cursor: "pointer",
                fontFamily: fonts.sans,
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "8px 16px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#e25555";
                (e.currentTarget as HTMLElement).style.color = "#e25555";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = t.border;
                (e.currentTarget as HTMLElement).style.color = t.muted;
              }}
            >
              Sign Out
            </button>
          </div>

          {/* Tab nav */}
          <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 24px",
                  background: "none",
                  border: "none",
                  borderBottom: `2px solid ${activeTab === tab.id ? t.gold : "transparent"}`,
                  color: activeTab === tab.id ? t.text : t.muted,
                  cursor: "pointer",
                  fontFamily: fonts.sans,
                  fontSize: 11,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  transition: "color 0.2s, border-color 0.2s",
                }}
              >
                <span
                  style={{ color: activeTab === tab.id ? t.gold : t.muted }}
                >
                  {tab.icon}
                </span>
                {!isMobile && tab.label}
                {tab.id === "orders" && orders.length > 0 && (
                  <span
                    style={{
                      background: t.gold,
                      color: t.dark ? "#0a0a0a" : "#fff",
                      fontFamily: fonts.sans,
                      fontSize: 9,
                      padding: "2px 7px",
                      borderRadius: 10,
                    }}
                  >
                    {orders.length}
                  </span>
                )}
                {tab.id === "wishlist" && wishlist.length > 0 && (
                  <span
                    style={{
                      background: t.gold,
                      color: t.dark ? "#0a0a0a" : "#fff",
                      fontFamily: fonts.sans,
                      fontSize: 9,
                      padding: "2px 7px",
                      borderRadius: 10,
                    }}
                  >
                    {wishlist.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 5vw 80px" }}
      >
        {/* ── ORDERS ── */}
        {activeTab === "orders" && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 300, marginBottom: 28 }}>
              My Orders
            </h2>
            {orders.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  border: `1px dashed ${t.border}`,
                }}
              >
                <p style={{ fontSize: 36, marginBottom: 16 }}>◎</p>
                <p
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 14,
                    color: t.muted,
                    marginBottom: 24,
                  }}
                >
                  You haven't placed any orders yet.
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
                    padding: "13px 32px",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Browse Collection
                </Link>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {orders.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      background: t.card,
                      border: `1px solid ${t.border}`,
                      padding: "24px 28px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: 12,
                        marginBottom: 16,
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontFamily: fonts.sans,
                            fontSize: 10,
                            color: t.gold,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            marginBottom: 4,
                          }}
                        >
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p
                          style={{
                            fontFamily: fonts.sans,
                            fontSize: 12,
                            color: t.muted,
                          }}
                        >
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString(
                                "en-NG",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )
                            : "—"}
                        </p>
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
                            fontSize: 20,
                            fontWeight: 400,
                            color: t.gold,
                          }}
                        >
                          {formatPrice(order.total_price)}
                        </span>
                        <span
                          style={{
                            fontFamily: fonts.sans,
                            fontSize: 10,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            color: ORDER_STATUS_COLORS[order.status] ?? t.muted,
                            border: `1px solid ${ORDER_STATUS_COLORS[order.status] ?? t.border}33`,
                            padding: "4px 12px",
                          }}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 12,
                          color: t.muted,
                        }}
                      >
                        Delivery: {order.delivery_method ?? "Standard"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ADDRESSES ── */}
        {activeTab === "addresses" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 28,
              }}
            >
              <h2 style={{ fontSize: 22, fontWeight: 300 }}>
                Delivery Addresses
              </h2>
              <button
                onClick={() => {
                  setAddrForm({
                    full_name: "",
                    phone: "",
                    address_line: "",
                    city: "",
                    state: "",
                    country: "Nigeria",
                  });
                  setEditAddrId(null);
                  setAddrModal(true);
                }}
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
                + Add Address
              </button>
            </div>
            {addresses.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  border: `1px dashed ${t.border}`,
                }}
              >
                <p style={{ fontSize: 36, marginBottom: 16 }}>⌖</p>
                <p
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 14,
                    color: t.muted,
                    marginBottom: 24,
                  }}
                >
                  No delivery addresses saved yet.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                  gap: 20,
                }}
              >
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    style={{
                      background: t.card,
                      border: `1px solid ${t.border}`,
                      padding: "24px",
                    }}
                  >
                    <p
                      style={{ fontSize: 16, fontWeight: 400, marginBottom: 8 }}
                    >
                      {addr.full_name}
                    </p>
                    {addr.phone && (
                      <p
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 12,
                          color: t.muted,
                          marginBottom: 4,
                        }}
                      >
                        {addr.phone}
                      </p>
                    )}
                    <p
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: 13,
                        color: t.muted,
                        lineHeight: 1.7,
                      }}
                    >
                      {addr.address_line}
                      <br />
                      {addr.city}
                      {addr.state ? `, ${addr.state}` : ""}
                      <br />
                      {addr.country}
                    </p>
                    <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                      <button
                        onClick={() => openEditAddr(addr)}
                        style={{
                          background: "none",
                          border: `1px solid ${t.border}`,
                          color: t.muted,
                          cursor: "pointer",
                          fontFamily: fonts.sans,
                          fontSize: 10,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          padding: "7px 16px",
                          transition: "all 0.2s",
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
                        onClick={() => handleDeleteAddress(addr.id)}
                        style={{
                          background: "none",
                          border: "1px solid rgba(226,85,85,0.3)",
                          color: "#e25555",
                          cursor: "pointer",
                          fontFamily: fonts.sans,
                          fontSize: 10,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          padding: "7px 16px",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── WISHLIST ── */}
        {activeTab === "wishlist" && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 300, marginBottom: 28 }}>
              Wishlist
            </h2>
            {wishlist.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  border: `1px dashed ${t.border}`,
                }}
              >
                <p style={{ fontSize: 36, marginBottom: 16 }}>♡</p>
                <p
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 14,
                    color: t.muted,
                    marginBottom: 24,
                  }}
                >
                  Your wishlist is empty.
                </p>
                <Link
                  href="/products"
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 11,
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    border: `1px solid ${t.gold}`,
                    color: t.gold,
                    padding: "13px 32px",
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
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "repeat(2,1fr)"
                    : "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: isMobile ? 16 : 24,
                }}
              >
                {wishlist.map(
                  (item) =>
                    item.product && (
                      <div
                        key={item.id}
                        style={{
                          background: t.card,
                          border: `1px solid ${t.border}`,
                        }}
                      >
                        <Link
                          href={`/products/${item.product.id}`}
                          style={{ display: "block", textDecoration: "none" }}
                        >
                          <div
                            style={{ aspectRatio: "3/4", overflow: "hidden" }}
                          >
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                transition: "transform 0.3s",
                              }}
                              onMouseEnter={(e) =>
                                ((
                                  e.currentTarget as HTMLElement
                                ).style.transform = "scale(1.05)")
                              }
                              onMouseLeave={(e) =>
                                ((
                                  e.currentTarget as HTMLElement
                                ).style.transform = "scale(1)")
                              }
                            />
                          </div>
                        </Link>
                        <div style={{ padding: "16px" }}>
                          <p
                            style={{
                              fontFamily: fonts.sans,
                              fontSize: 9,
                              color: t.gold,
                              letterSpacing: "0.2em",
                              textTransform: "uppercase",
                              marginBottom: 4,
                            }}
                          >
                            {item.product.category}
                          </p>
                          <p
                            style={{
                              fontSize: 18,
                              fontWeight: 400,
                              marginBottom: 10,
                            }}
                          >
                            {item.product.name}
                          </p>
                          <p
                            style={{
                              color: t.gold,
                              fontSize: 16,
                              fontWeight: 500,
                              marginBottom: 12,
                            }}
                          >
                            {formatPrice(item.product.price)}
                          </p>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => handleWishlistToCart(item.product)}
                              style={{
                                flex: 1,
                                background: t.gold,
                                color: t.dark ? "#0a0a0a" : "#fff",
                                border: "none",
                                cursor: "pointer",
                                fontFamily: fonts.sans,
                                fontSize: 9,
                                letterSpacing: "0.15em",
                                textTransform: "uppercase",
                                padding: "9px 0",
                                transition: "opacity 0.2s",
                              }}
                            >
                              Add to Cart
                            </button>
                            <button
                              onClick={() => handleRemoveWishlist(item.id)}
                              style={{
                                background: "none",
                                border: `1px solid ${t.border}`,
                                color: t.muted,
                                cursor: "pointer",
                                padding: "9px 12px",
                                fontSize: 14,
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
                    ),
                )}
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS ── */}
        {activeTab === "settings" && (
          <div style={{ maxWidth: 560 }}>
            <h2 style={{ fontSize: 22, fontWeight: 300, marginBottom: 32 }}>
              Account Settings
            </h2>

            {settingMsg && (
              <div
                style={{
                  background: "rgba(122,191,122,0.15)",
                  border: "1px solid rgba(122,191,122,0.4)",
                  padding: "12px 16px",
                  marginBottom: 24,
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  color: "#7abf7a",
                }}
              >
                {settingMsg}
              </div>
            )}
            {settingError && (
              <div
                style={{
                  background: "rgba(226,85,85,0.1)",
                  border: "1px solid rgba(226,85,85,0.4)",
                  padding: "12px 16px",
                  marginBottom: 24,
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  color: "#e25555",
                }}
              >
                {settingError}
              </div>
            )}

            <div
              style={{
                background: t.card,
                border: `1px solid ${t.border}`,
                padding: "28px",
                marginBottom: 24,
              }}
            >
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 300,
                  marginBottom: 24,
                  paddingBottom: 16,
                  borderBottom: `1px solid ${t.border}`,
                }}
              >
                Personal Information
              </h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                <AccInput
                  label="Full Name"
                  value={fullName}
                  onChange={setFullName}
                  placeholder="Your full name"
                  theme={t}
                />
                <div>
                  <label
                    style={{
                      display: "block",
                      fontFamily: fonts.sans,
                      fontSize: 10,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: t.muted,
                      marginBottom: 8,
                    }}
                  >
                    Email Address
                  </label>
                  <input
                    value={user.email}
                    disabled
                    style={{
                      width: "100%",
                      background: t.subtle,
                      border: `1px solid ${t.border}`,
                      color: t.muted,
                      fontFamily: fonts.sans,
                      fontSize: 13,
                      padding: "13px 16px",
                      cursor: "not-allowed",
                      boxSizing: "border-box",
                    }}
                  />
                  <p
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 11,
                      color: t.muted,
                      marginTop: 6,
                    }}
                  >
                    Email cannot be changed.
                  </p>
                </div>
                <AccInput
                  label="Phone Number"
                  value={phone}
                  onChange={setPhone}
                  placeholder="+234 800 000 0000"
                  theme={t}
                />
              </div>
            </div>

            <div
              style={{
                background: t.card,
                border: `1px solid ${t.border}`,
                padding: "28px",
                marginBottom: 28,
              }}
            >
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 300,
                  marginBottom: 24,
                  paddingBottom: 16,
                  borderBottom: `1px solid ${t.border}`,
                }}
              >
                Change Password
              </h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontFamily: fonts.sans,
                      fontSize: 10,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: t.muted,
                      marginBottom: 8,
                    }}
                  >
                    New Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPass ? "text" : "password"}
                      value={newPassword}
                      placeholder="Leave blank to keep current"
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{
                        width: "100%",
                        background: t.bg,
                        border: `1px solid ${t.border}`,
                        color: t.text,
                        fontFamily: fonts.sans,
                        fontSize: 13,
                        padding: "13px 52px 13px 16px",
                        outline: "none",
                        transition: "border-color 0.2s",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor = t.gold)
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor = t.border)
                      }
                    />
                    <button
                      onClick={() => setShowPass(!showPass)}
                      style={{
                        position: "absolute",
                        right: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: t.muted,
                        cursor: "pointer",
                        fontFamily: fonts.sans,
                        fontSize: 10,
                      }}
                    >
                      {showPass ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                {newPassword && (
                  <AccInput
                    label="Confirm New Password"
                    type={showPass ? "text" : "password"}
                    value={confirmPass}
                    onChange={setConfirmPass}
                    placeholder="Repeat new password"
                    theme={t}
                  />
                )}
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={settingLoad}
              style={{
                width: "100%",
                background: settingLoad ? t.border : t.gold,
                color: t.dark ? "#0a0a0a" : "#fff",
                border: "none",
                cursor: settingLoad ? "not-allowed" : "pointer",
                fontFamily: fonts.sans,
                fontSize: 11,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                padding: "16px",
                transition: "background 0.2s",
              }}
            >
              {settingLoad ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      <Footer theme={t} />
    </div>
  );
}

function AccInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  theme: t,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  theme: any;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontFamily: fonts.sans,
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: t.muted,
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          background: t.card,
          border: `1px solid ${t.border}`,
          color: t.text,
          fontFamily: fonts.sans,
          fontSize: 13,
          padding: "13px 16px",
          outline: "none",
          transition: "border-color 0.2s",
          boxSizing: "border-box",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = t.gold)}
        onBlur={(e) => (e.currentTarget.style.borderColor = t.border)}
      />
    </div>
  );
}
