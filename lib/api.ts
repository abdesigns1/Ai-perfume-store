// lib/api.ts
// All Supabase query functions.
// Import and call these in your pages to replace mock data.

import { supabase } from "./supabase";
import type { Product, Category, Order } from "../types";

// ── Products ────────────────────────────────────────────────────────────────

/** Fetch all products */
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      price,
      scent_type,
      description,
      image_url,
      stock,
      categories ( name )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getProducts:", error.message);
    return [];
  }

  return (data ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    scent_type: p.scent_type,
    description: p.description,
    image_url: p.image_url,
    stock: p.stock,
    category: p.categories?.name ?? "Uncategorised",
  }));
}

/** Fetch a single product by id */
export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      price,
      scent_type,
      description,
      image_url,
      stock,
      categories ( name )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("getProduct:", error.message);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    price: data.price,
    scent_type: data.scent_type,
    description: data.description,
    image_url: data.image_url,
    stock: data.stock,
    category: (data as any).categories?.name ?? "Uncategorised",
  };
}

/** Fetch featured products (first 4) */
export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, name, price, scent_type, description, image_url, stock,
      categories ( name )
    `,
    )
    .limit(4)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getFeaturedProducts:", error.message);
    return [];
  }

  return (data ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    scent_type: p.scent_type,
    description: p.description,
    image_url: p.image_url,
    stock: p.stock,
    category: p.categories?.name ?? "Uncategorised",
  }));
}

/** Fetch related products (same category, excluding current) */
export async function getRelatedProducts(
  categoryName: string,
  excludeId: string,
): Promise<Product[]> {
  const { data: catData } = await supabase
    .from("categories")
    .select("id")
    .eq("name", categoryName)
    .single();

  if (!catData) return [];

  const { data, error } = await supabase
    .from("products")
    .select(
      `id, name, price, scent_type, description, image_url, stock, categories ( name )`,
    )
    .eq("category_id", catData.id)
    .neq("id", excludeId)
    .limit(4);

  if (error) {
    console.error("getRelatedProducts:", error.message);
    return [];
  }

  return (data ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    scent_type: p.scent_type,
    description: p.description,
    image_url: p.image_url,
    stock: p.stock,
    category: p.categories?.name ?? "Uncategorised",
  }));
}

// ── Categories ──────────────────────────────────────────────────────────────

/** Fetch all categories */
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("getCategories:", error.message);
    return [];
  }
  return data ?? [];
}

// ── Orders ──────────────────────────────────────────────────────────────────

/** Fetch orders for the current logged-in user */
export async function getUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getUserOrders:", error.message);
    return [];
  }
  return data ?? [];
}

/** Create a new order */
export async function createOrder(order: {
  user_id: string;
  total_price: number;
  status: string;
  delivery_method: string;
}) {
  const { data, error } = await supabase
    .from("orders")
    .insert(order)
    .select()
    .single();

  if (error) {
    console.error("createOrder:", error.message);
    return null;
  }
  return data;
}

/** Add items to an order */
export async function createOrderItems(
  items: {
    order_id: string;
    product_id: string;
    quantity: number;
  }[],
) {
  const { error } = await supabase.from("order_items").insert(items);
  if (error) {
    console.error("createOrderItems:", error.message);
  }
}

// ── Admin ───────────────────────────────────────────────────────────────────

/** Fetch all orders (admin only) */
export async function getAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllOrders:", error.message);
    return [];
  }
  return data ?? [];
}

/** Add a new product (admin only) */
export async function addProduct(product: {
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
    console.error("addProduct:", error.message);
    return null;
  }
  return data;
}

/** Update a product (admin only) */
export async function updateProduct(
  id: string,
  updates: Partial<{
    name: string;
    price: number;
    description: string;
    image_url: string;
    stock: number;
    scent_type: string;
  }>,
) {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateProduct:", error.message);
    return null;
  }
  return data;
}

/** Delete a product (admin only) */
export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    console.error("deleteProduct:", error.message);
    return false;
  }
  return true;
}

// ── Product gallery images ───────────────────────────────────────────────────
export async function getProductImages(productId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", productId)
    .order("sort_order");
  if (error) {
    console.error("getProductImages:", error.message);
    return [];
  }
  return (data ?? []).map((img: any) => img.image_url);
}

// ── Wishlist ─────────────────────────────────────────────────────────────────
export async function toggleWishlist(
  userId: string,
  productId: string,
): Promise<boolean> {
  // Check if already in wishlist
  const { data } = await supabase
    .from("wishlist")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .single();

  if (data) {
    // Remove from wishlist
    await supabase.from("wishlist").delete().eq("id", data.id);
    return false; // now not in wishlist
  } else {
    // Add to wishlist
    await supabase
      .from("wishlist")
      .insert({ user_id: userId, product_id: productId });
    return true; // now in wishlist
  }
}

export async function isInWishlist(
  userId: string,
  productId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("wishlist")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .single();
  return !!data;
}
