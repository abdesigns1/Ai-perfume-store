"use client";

// app/dashboard/page.tsx
// Admin dashboard — fixed:
// 1. Auth guard checks role === 'admin', redirects others
// 2. Image upload from files via Supabase Storage
// 3. loadData no longer causes infinite re-render loop
// 4. Product add/edit properly handles errors

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { supabase } from "@/lib/supabase";
import { fonts } from "@/lib/theme";
import { formatPrice } from "@/utils/format";
import { uploadProductImage } from "@/lib/storage";
import {
  getOverviewStats,
  adminGetProducts,
  adminGetOrders,
  adminGetUsers,
  adminGetCategories,
  adminAddProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminUpdateOrderStatus,
} from "@/lib/adminApi";
import GlobalStyles from "@/components/GlobalStyles";

type Tab = "overview" | "products" | "orders" | "users";

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const STATUS_COLORS: Record<string, string> = {
  delivered: "#7abf7a",
  processing: "#C9A84C",
  shipped: "#7ab3bf",
  pending: "#888880",
  cancelled: "#e25555",
};

const EMPTY_FORM = {
  name: "",
  price: "",
  category_id: "",
  scent_type: "",
  description: "",
  image_url: "",
  stock: "",
};

export default function DashboardPage() {
  const { theme: t, toggleTheme } = useTheme(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const router = useRouter();

  // ── Auth state ─────────────────────────────────────────────────────────────
  const [authChecked, setAuthChecked] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/dashboard/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name, email")
        .eq("id", session.user.id)
        .single();

      // Fallback: check user metadata if profile read fails due to RLS
      const role = profile?.role ?? session.user.user_metadata?.role;

      if (role !== "admin") {
        await supabase.auth.signOut();
        router.replace("/dashboard/login");
        return;
      }

      setAdminUser({
        ...session.user,
        full_name: profile?.full_name ?? session.user.user_metadata?.full_name,
        email: profile?.email ?? session.user.email,
        role,
      });
      setAuthChecked(true);

      setAdminUser({ ...session.user, ...profile });
      setAuthChecked(true);
    };
    checkAdmin();
  }, [router]);

  // ── Data state ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Search / filter
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("All");

  // Product modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ── Fix #3: use ref to avoid stale closure / infinite loop ─────────────────
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!authChecked || loadedRef.current) return;
    loadedRef.current = true;
    loadAllData();
  }, [authChecked]);

  const loadAllData = async () => {
    setDataLoading(true);
    const [s, p, o, u, c] = await Promise.all([
      getOverviewStats(),
      adminGetProducts(),
      adminGetOrders(),
      adminGetUsers(),
      adminGetCategories(),
    ]);
    setStats(s);
    setProducts(p);
    setOrders(o);
    setUsers(u);
    setCategories(c);
    setDataLoading(false);
  };

  const refreshProducts = async () => {
    const p = await adminGetProducts();
    setProducts(p);
    const s = await getOverviewStats();
    setStats(s);
  };

  // ── Image handling ─────────────────────────────────────────────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setForm((f) => ({ ...f, image_url: "" })); // clear URL input
  };

  // ── Product modal ──────────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview("");
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditProduct(p);
    setForm({
      name: p.name ?? "",
      price: String(p.price ?? ""),
      category_id: p.category_id ?? "",
      scent_type: p.scent_type ?? "",
      description: p.description ?? "",
      image_url: p.image_url ?? "",
      stock: String(p.stock ?? ""),
    });
    setImageFile(null);
    setImagePreview(p.image_url ?? "");
    setFormError("");
    setModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!form.name || !form.price || !form.category_id || !form.stock) {
      setFormError("Name, price, category and stock are required.");
      return;
    }
    setFormLoading(true);
    setFormError("");

    // Upload image if a file was selected
    let finalImageUrl = form.image_url;
    if (imageFile) {
      setUploading(true);
      const uploaded = await uploadProductImage(imageFile);
      setUploading(false);
      if (!uploaded) {
        setFormError("Image upload failed. Please try again.");
        setFormLoading(false);
        return;
      }
      finalImageUrl = uploaded;
    }

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      category_id: form.category_id,
      scent_type: form.scent_type.trim(),
      description: form.description.trim(),
      image_url: finalImageUrl,
      stock: Number(form.stock),
    };

    const result = editProduct
      ? await adminUpdateProduct(editProduct.id, payload)
      : await adminAddProduct(payload);

    setFormLoading(false);

    if (!result) {
      setFormError(
        "Failed to save product. Check that all fields are valid and try again.",
      );
      return;
    }

    setModalOpen(false);
    setImageFile(null);
    setImagePreview("");
    await refreshProducts();
  };

  const handleDelete = async (id: string) => {
    await adminDeleteProduct(id);
    setDeleteId(null);
    await refreshProducts();
  };

  const handleOrderStatus = async (orderId: string, status: string) => {
    await adminUpdateOrderStatus(orderId, status);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
    );
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/dashboard/login");
  };

  // ── Filtered lists ─────────────────────────────────────────────────────────
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()),
  );
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      (o.customer_name ?? "")
        .toLowerCase()
        .includes(orderSearch.toLowerCase()) ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase());
    const matchStatus =
      orderFilter === "All" || o.status === orderFilter.toLowerCase();
    return matchSearch && matchStatus;
  });
  const filteredUsers = users.filter(
    (u) =>
      (u.full_name ?? "").toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(userSearch.toLowerCase()),
  );

  const navItems: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "◈" },
    { id: "products", label: "Products", icon: "✦" },
    { id: "orders", label: "Orders", icon: "◎" },
    { id: "users", label: "Users", icon: "◉" },
  ];

  const displayName = adminUser?.full_name ?? adminUser?.email ?? "Admin";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (!authChecked) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
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

      {/* ── Product Modal ── */}
      {modalOpen && (
        <>
          <div
            onClick={() => setModalOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              zIndex: 400,
              backdropFilter: "blur(4px)",
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(580px, 95vw)",
              maxHeight: "92vh",
              background: t.bg,
              border: `1px solid ${t.border}`,
              zIndex: 401,
              overflowY: "auto",
              padding: "36px 40px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 28,
              }}
            >
              <h2 style={{ fontSize: 22, fontWeight: 300 }}>
                {editProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: t.muted,
                  cursor: "pointer",
                  fontSize: 22,
                }}
              >
                ×
              </button>
            </div>

            {formError && (
              <div
                style={{
                  background: "rgba(226,85,85,0.1)",
                  border: "1px solid rgba(226,85,85,0.4)",
                  padding: "10px 14px",
                  marginBottom: 20,
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  color: "#e25555",
                }}
              >
                {formError}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <FormField
                label="Product Name *"
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder="e.g. Oud Noir"
                theme={t}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
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
                    Category *
                  </label>
                  <select
                    value={form.category_id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category_id: e.target.value }))
                    }
                    style={{
                      width: "100%",
                      background: t.card,
                      border: `1px solid ${t.border}`,
                      color: t.text,
                      fontFamily: fonts.sans,
                      fontSize: 13,
                      padding: "12px 14px",
                      outline: "none",
                      cursor: "pointer",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <FormField
                  label="Scent Type"
                  value={form.scent_type}
                  onChange={(v) => setForm((f) => ({ ...f, scent_type: v }))}
                  placeholder="e.g. Woody"
                  theme={t}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <FormField
                  label="Price (₦) *"
                  type="number"
                  value={form.price}
                  onChange={(v) => setForm((f) => ({ ...f, price: v }))}
                  placeholder="18500"
                  theme={t}
                />
                <FormField
                  label="Stock *"
                  type="number"
                  value={form.stock}
                  onChange={(v) => setForm((f) => ({ ...f, stock: v }))}
                  placeholder="10"
                  theme={t}
                />
              </div>

              {/* ── Image upload section ── */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontFamily: fonts.sans,
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: t.muted,
                    marginBottom: 10,
                  }}
                >
                  Product Image
                </label>

                {/* Upload from file */}
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: "none",
                      border: `1px solid ${t.border}`,
                      color: t.muted,
                      cursor: "pointer",
                      fontFamily: fonts.sans,
                      fontSize: 10,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      padding: "10px 18px",
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
                      (e.currentTarget as HTMLElement).style.color = t.muted;
                    }}
                  >
                    📁 Upload from Files
                  </button>
                  <span
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 11,
                      color: t.muted,
                      alignSelf: "center",
                    }}
                  >
                    or
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: "none" }}
                  />
                </div>

                {/* URL input */}
                <FormField
                  label=""
                  value={form.image_url}
                  onChange={(v) => {
                    setForm((f) => ({ ...f, image_url: v }));
                    setImageFile(null);
                    setImagePreview(v);
                  }}
                  placeholder="Or paste image URL: https://..."
                  theme={t}
                />

                {/* Preview */}
                {(imagePreview || form.image_url) && (
                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 80,
                        height: 100,
                        overflow: "hidden",
                        border: `1px solid ${t.border}`,
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={imagePreview || form.image_url}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 11,
                          color: t.muted,
                          marginBottom: 6,
                        }}
                      >
                        {imageFile
                          ? `Selected: ${imageFile.name}`
                          : "URL image"}
                      </p>
                      <button
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                          setForm((f) => ({ ...f, image_url: "" }));
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#e25555",
                          cursor: "pointer",
                          fontFamily: fonts.sans,
                          fontSize: 10,
                          letterSpacing: "0.1em",
                          padding: 0,
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
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
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Describe the fragrance..."
                  rows={3}
                  style={{
                    width: "100%",
                    background: t.card,
                    border: `1px solid ${t.border}`,
                    color: t.text,
                    fontFamily: fonts.sans,
                    fontSize: 13,
                    padding: "12px 14px",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = t.gold)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = t.border)}
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => setModalOpen(false)}
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
                    padding: "13px",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProduct}
                  disabled={formLoading || uploading}
                  style={{
                    flex: 2,
                    background: formLoading || uploading ? t.border : t.gold,
                    color: t.dark ? "#0a0a0a" : "#fff",
                    border: "none",
                    cursor:
                      formLoading || uploading ? "not-allowed" : "pointer",
                    fontFamily: fonts.sans,
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    padding: "13px",
                    transition: "background 0.2s",
                  }}
                >
                  {uploading
                    ? "Uploading image..."
                    : formLoading
                      ? "Saving..."
                      : editProduct
                        ? "Save Changes"
                        : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Delete confirm ── */}
      {deleteId && (
        <>
          <div
            onClick={() => setDeleteId(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              zIndex: 400,
              backdropFilter: "blur(4px)",
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(400px, 90vw)",
              background: t.bg,
              border: `1px solid ${t.border}`,
              zIndex: 401,
              padding: "36px 40px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 32, marginBottom: 16 }}>⚠</p>
            <h3 style={{ fontSize: 20, fontWeight: 300, marginBottom: 12 }}>
              Delete Product?
            </h3>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 13,
                color: t.muted,
                marginBottom: 28,
                lineHeight: 1.7,
              }}
            >
              This cannot be undone. The product will be permanently removed.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setDeleteId(null)}
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
                onClick={() => handleDelete(deleteId)}
                style={{
                  flex: 1,
                  background: "#e25555",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: fonts.sans,
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  padding: "12px",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}

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
              marginBottom: 8,
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
                marginBottom: 4,
                background: activeTab === item.id ? t.subtle : "none",
                border:
                  activeTab === item.id
                    ? `1px solid ${t.border}`
                    : "1px solid transparent",
                color: activeTab === item.id ? t.text : t.muted,
                cursor: "pointer",
                fontFamily: fonts.sans,
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                textAlign: "left",
                transition: "all 0.2s",
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
              {item.id === "orders" &&
                orders.filter((o) => o.status === "pending").length > 0 && (
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
                    {orders.filter((o) => o.status === "pending").length}
                  </span>
                )}
            </button>
          ))}
        </nav>

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
            onClick={handleSignOut}
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

      {/* ── Main ── */}
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
                {displayName}
              </p>
              <p
                style={{ fontFamily: fonts.sans, fontSize: 10, color: t.muted }}
              >
                {adminUser?.email}
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
              {initials}
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            padding: isMobile ? "24px 16px" : "32px",
            overflowY: "auto",
          }}
        >
          {dataLoading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 16,
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 100,
                    background: t.card,
                    border: `1px solid ${t.border}`,
                    opacity: 0.5,
                    animation: "pulse 1.5s ease-in-out infinite",
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
              <style>{`@keyframes pulse{0%,100%{opacity:.5}50%{opacity:.2}}`}</style>
            </div>
          ) : (
            <>
              {/* ── OVERVIEW ── */}
              {activeTab === "overview" && (
                <div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "repeat(2,1fr)"
                        : "repeat(4,1fr)",
                      gap: 16,
                      marginBottom: 40,
                    }}
                  >
                    {[
                      {
                        label: "Total Revenue",
                        value: formatPrice(stats.totalRevenue),
                        icon: "₦",
                        change: "",
                      },
                      {
                        label: "Total Orders",
                        value: stats.totalOrders,
                        icon: "◎",
                        change: "",
                      },
                      {
                        label: "Products",
                        value: stats.totalProducts,
                        icon: "✦",
                        change: "",
                      },
                      {
                        label: "Customers",
                        value: stats.totalUsers,
                        icon: "◉",
                        change: "",
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
                          }}
                        >
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

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
                      orders={orders.slice(0, 5)}
                      theme={t}
                      isMobile={isMobile}
                      onStatusChange={handleOrderStatus}
                    />
                  </div>

                  <div>
                    <h2
                      style={{
                        fontSize: 20,
                        fontWeight: 300,
                        marginBottom: 20,
                      }}
                    >
                      Low Stock Alert
                    </h2>
                    {products.filter((p) => p.stock <= 6).length === 0 ? (
                      <p
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 13,
                          color: t.muted,
                        }}
                      >
                        All products are well stocked ✓
                      </p>
                    ) : (
                      products
                        .filter((p) => p.stock <= 6)
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
                              marginBottom: 10,
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
                              {p.image_url && (
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
                              )}
                              <div>
                                <p style={{ fontSize: 16, fontWeight: 400 }}>
                                  {p.name}
                                </p>
                                <p
                                  style={{
                                    fontFamily: fonts.sans,
                                    fontSize: 10,
                                    color: t.muted,
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
                              <span style={{ color: t.gold, fontSize: 14 }}>
                                {formatPrice(p.price)}
                              </span>
                            </div>
                          </div>
                        ))
                    )}
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
                      onClick={openAddModal}
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

                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {!isMobile && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "60px 1fr 120px 100px 80px 120px",
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
                    {filteredProducts.length === 0 ? (
                      <p
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 13,
                          color: t.muted,
                          padding: "40px 0",
                          textAlign: "center",
                        }}
                      >
                        No products found.
                      </p>
                    ) : (
                      filteredProducts.map((p) => (
                        <div
                          key={p.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: isMobile
                              ? "60px 1fr 120px"
                              : "60px 1fr 120px 100px 80px 120px",
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
                          <div
                            style={{
                              width: 48,
                              height: 56,
                              background: t.subtle,
                              border: `1px solid ${t.border}`,
                              overflow: "hidden",
                            }}
                          >
                            {p.image_url && (
                              <img
                                src={p.image_url}
                                alt={p.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) =>
                                  (e.currentTarget.style.display = "none")
                                }
                              />
                            )}
                          </div>
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
                                color: p.stock <= 6 ? "#e25555" : t.text,
                              }}
                            >
                              {p.stock}
                            </span>
                          )}
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => openEditModal(p)}
                              style={{
                                background: "none",
                                border: `1px solid ${t.border}`,
                                color: t.muted,
                                cursor: "pointer",
                                fontFamily: fonts.sans,
                                fontSize: 9,
                                letterSpacing: "0.1em",
                                padding: "5px 10px",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                (
                                  e.currentTarget as HTMLElement
                                ).style.borderColor = t.gold;
                                (e.currentTarget as HTMLElement).style.color =
                                  t.gold;
                              }}
                              onMouseLeave={(e) => {
                                (
                                  e.currentTarget as HTMLElement
                                ).style.borderColor = t.border;
                                (e.currentTarget as HTMLElement).style.color =
                                  t.muted;
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteId(p.id)}
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
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ── ORDERS ── */}
              {activeTab === "orders" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 20,
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <SearchInput
                      value={orderSearch}
                      onChange={setOrderSearch}
                      placeholder="Search orders..."
                      theme={t}
                    />
                    <p
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: 12,
                        color: t.muted,
                      }}
                    >
                      {filteredOrders.length} orders
                    </p>
                  </div>
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
                      <button
                        key={s}
                        onClick={() => setOrderFilter(s)}
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 10,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          padding: "5px 14px",
                          border: `1px solid ${orderFilter === s ? t.gold : t.border}`,
                          background: "none",
                          color: orderFilter === s ? t.gold : t.muted,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <OrderTable
                    orders={filteredOrders}
                    theme={t}
                    isMobile={isMobile}
                    onStatusChange={handleOrderStatus}
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
                      {filteredUsers.length} users
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {!isMobile && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 200px 150px 100px",
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
                        {["Customer", "Email", "Joined", "Role"].map((h) => (
                          <span key={h}>{h}</span>
                        ))}
                      </div>
                    )}
                    {filteredUsers.length === 0 ? (
                      <p
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 13,
                          color: t.muted,
                          padding: "40px 0",
                          textAlign: "center",
                        }}
                      >
                        No users found.
                      </p>
                    ) : (
                      filteredUsers.map((u) => (
                        <div
                          key={u.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: isMobile
                              ? "1fr 80px"
                              : "1fr 200px 150px 100px",
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
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
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
                              {(u.full_name ?? u.email ?? "U")[0].toUpperCase()}
                            </div>
                            <p style={{ fontSize: 16, fontWeight: 400 }}>
                              {u.full_name ?? "—"}
                            </p>
                          </div>
                          {!isMobile && (
                            <span
                              style={{
                                fontFamily: fonts.sans,
                                fontSize: 12,
                                color: t.muted,
                              }}
                            >
                              {u.email}
                            </span>
                          )}
                          {!isMobile && (
                            <span
                              style={{
                                fontFamily: fonts.sans,
                                fontSize: 12,
                                color: t.muted,
                              }}
                            >
                              {u.created_at
                                ? new Date(u.created_at).toLocaleDateString(
                                    "en-NG",
                                  )
                                : "—"}
                            </span>
                          )}
                          <span
                            style={{
                              fontFamily: fonts.sans,
                              fontSize: 9,
                              letterSpacing: "0.15em",
                              textTransform: "uppercase",
                              color: u.role === "admin" ? t.gold : t.muted,
                              border: `1px solid ${u.role === "admin" ? t.gold : t.border}`,
                              padding: "3px 10px",
                              display: "inline-block",
                            }}
                          >
                            {u.role ?? "customer"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
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
  onStatusChange,
}: {
  orders: any[];
  theme: any;
  isMobile: boolean;
  onStatusChange: (id: string, status: string) => void;
}) {
  if (orders.length === 0)
    return (
      <p
        style={{
          fontFamily: "'Josefin Sans',sans-serif",
          fontSize: 13,
          color: t.muted,
          padding: "40px 0",
          textAlign: "center",
        }}
      >
        No orders found.
      </p>
    );
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {!isMobile && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "140px 1fr 120px 110px 150px",
            gap: 16,
            padding: "10px 20px",
            fontFamily: "'Josefin Sans',sans-serif",
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
              ? "1fr 150px"
              : "140px 1fr 120px 110px 150px",
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
                fontFamily: "'Josefin Sans',sans-serif",
                fontSize: 10,
                color: t.gold,
              }}
            >
              {o.id.slice(0, 8)}...
            </span>
          )}
          <div>
            <p style={{ fontSize: 15, fontWeight: 400 }}>{o.customer_name}</p>
            <p
              style={{
                fontFamily: "'Josefin Sans',sans-serif",
                fontSize: 10,
                color: t.muted,
              }}
            >
              {isMobile ? o.id.slice(0, 8) + "..." : o.customer_email}
            </p>
          </div>
          {!isMobile && (
            <span
              style={{
                fontFamily: "'Josefin Sans',sans-serif",
                fontSize: 12,
                color: t.muted,
              }}
            >
              {o.created_at
                ? new Date(o.created_at).toLocaleDateString("en-NG")
                : "—"}
            </span>
          )}
          {!isMobile && (
            <span style={{ color: t.gold, fontSize: 14 }}>
              {formatPrice(o.total_price)}
            </span>
          )}
          <select
            value={o.status}
            onChange={(e) => onStatusChange(o.id, e.target.value)}
            style={{
              background: "none",
              border: `1px solid ${STATUS_COLORS[o.status] ?? t.border}55`,
              color: STATUS_COLORS[o.status] ?? t.muted,
              fontFamily: "'Josefin Sans',sans-serif",
              fontSize: 10,
              letterSpacing: "0.1em",
              padding: "5px 10px",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
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
          fontFamily: "'Josefin Sans',sans-serif",
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

function FormField({
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
      {label && (
        <label
          style={{
            display: "block",
            fontFamily: "'Josefin Sans',sans-serif",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: t.muted,
            marginBottom: 8,
          }}
        >
          {label}
        </label>
      )}
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
          fontFamily: "'Josefin Sans',sans-serif",
          fontSize: 13,
          padding: "12px 14px",
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
