// lib/adminApi.ts
// Admin-only Supabase query functions.
// Used exclusively in the /dashboard pages.

import { supabase } from "./supabase";

// ── Overview stats ───────────────────────────────────────────────────────────
export async function getOverviewStats() {
  const [products, orders, users, revenue] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("total_price").neq("status", "cancelled"),
  ]);

  const totalRevenue = (revenue.data ?? []).reduce(
    (sum: number, o: any) => sum + Number(o.total_price),
    0,
  );

  return {
    totalProducts: products.count ?? 0,
    totalOrders: orders.count ?? 0,
    totalUsers: users.count ?? 0,
    totalRevenue,
  };
}

// ── Products ────────────────────────────────────────────────────────────────
export async function adminGetProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, price, scent_type, description, image_url, stock, category_id, categories(name)",
    )
    .order("name");

  if (error) {
    console.error("adminGetProducts:", error.message);
    return [];
  }

  return (data ?? []).map((p: any) => ({
    ...p,
    category: p.categories?.name ?? "Uncategorised",
  }));
}

export async function adminAddProduct(product: {
  name: string;
  price: number;
  category_id: string;
  scent_type: string;
  description: string;
  image_url: string;
  stock: number;
}) {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();
  if (error) {
    console.error("adminAddProduct:", error.message);
    return null;
  }
  return data;
}

export async function adminUpdateProduct(
  id: string,
  updates: {
    name?: string;
    price?: number;
    category_id?: string;
    scent_type?: string;
    description?: string;
    image_url?: string;
    stock?: number;
  },
) {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("adminUpdateProduct:", error.message);
    return null;
  }
  return data;
}

export async function adminDeleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    console.error("adminDeleteProduct:", error.message);
    return false;
  }
  return true;
}

// ── Orders ──────────────────────────────────────────────────────────────────
export async function adminGetOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, user_id, total_price, status, delivery_method, created_at, profiles(full_name, email)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("adminGetOrders:", error.message);
    return [];
  }

  return (data ?? []).map((o: any) => ({
    id: o.id,
    user_id: o.user_id,
    total_price: o.total_price,
    status: o.status,
    delivery_method: o.delivery_method,
    created_at: o.created_at,
    customer_name: o.profiles?.full_name ?? "Unknown",
    customer_email: o.profiles?.email ?? "",
  }));
}

export async function adminUpdateOrderStatus(id: string, status: string) {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (error) {
    console.error("adminUpdateOrderStatus:", error.message);
    return false;
  }
  return true;
}

// ── Users ────────────────────────────────────────────────────────────────────
export async function adminGetUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("adminGetUsers:", error.message);
    return [];
  }
  return data ?? [];
}

// ── Categories ───────────────────────────────────────────────────────────────
export async function adminGetCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");
  if (error) {
    console.error("adminGetCategories:", error.message);
    return [];
  }
  return data ?? [];
}
