// lib/adminApi.ts
// Admin-only Supabase query functions.

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
    (s: number, o: any) => s + Number(o.total_price),
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
      "id, name, price, scent_type, description, image_url, stock, is_active, category_id, categories(name)",
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
  is_active: boolean;
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
  updates: Partial<{
    name: string;
    price: number;
    category_id: string;
    scent_type: string;
    description: string;
    image_url: string;
    stock: number;
    is_active: boolean;
  }>,
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

export async function adminToggleProductStatus(id: string, is_active: boolean) {
  const { error } = await supabase
    .from("products")
    .update({ is_active })
    .eq("id", id);
  if (error) {
    console.error("adminToggleProductStatus:", error.message);
    return false;
  }
  return true;
}

// ── Product images ───────────────────────────────────────────────────────────
export async function adminGetProductImages(productId: string) {
  const { data, error } = await supabase
    .from("product_images")
    .select("id, image_url, sort_order")
    .eq("product_id", productId)
    .order("sort_order");
  if (error) {
    console.error("adminGetProductImages:", error.message);
    return [];
  }
  return data ?? [];
}

export async function adminAddProductImage(
  productId: string,
  imageUrl: string,
  sortOrder: number,
) {
  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      image_url: imageUrl,
      sort_order: sortOrder,
    })
    .select()
    .single();
  if (error) {
    console.error("adminAddProductImage:", error.message);
    return null;
  }
  return data;
}

export async function adminDeleteProductImage(id: string) {
  const { error } = await supabase.from("product_images").delete().eq("id", id);
  if (error) {
    console.error("adminDeleteProductImage:", error.message);
    return false;
  }
  return true;
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

export async function adminAddCategory(name: string) {
  const { data, error } = await supabase
    .from("categories")
    .insert({ name })
    .select()
    .single();
  if (error) {
    console.error("adminAddCategory:", error.message);
    return null;
  }
  return data;
}

export async function adminDeleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    console.error("adminDeleteCategory:", error.message);
    return false;
  }
  return true;
}

// ── Scent types ───────────────────────────────────────────────────────────────
export async function adminGetScentTypes() {
  const { data, error } = await supabase
    .from("scent_types")
    .select("id, name")
    .order("name");
  if (error) {
    console.error("adminGetScentTypes:", error.message);
    return [];
  }
  return data ?? [];
}

export async function adminAddScentType(name: string) {
  const { data, error } = await supabase
    .from("scent_types")
    .insert({ name })
    .select()
    .single();
  if (error) {
    console.error("adminAddScentType:", error.message);
    return null;
  }
  return data;
}

export async function adminDeleteScentType(id: string) {
  const { error } = await supabase.from("scent_types").delete().eq("id", id);
  if (error) {
    console.error("adminDeleteScentType:", error.message);
    return false;
  }
  return true;
}

// ── Orders ───────────────────────────────────────────────────────────────────
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
    .select("id, full_name, email, phone, role, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("adminGetUsers:", error.message);
    return [];
  }
  return data ?? [];
}
