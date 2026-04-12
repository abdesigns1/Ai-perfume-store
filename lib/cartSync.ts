// lib/cartSync.ts
// Supabase cart sync functions.
// Called from cartContext when user logs in/out.

import { supabase } from "./supabase";
import type { CartItem } from "./cartContext";

// ── Fetch saved cart from Supabase ──────────────────────────────────────────
export async function fetchRemoteCart(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      quantity,
      product_id,
      products (
        id, name, price, scent_type, description, image_url, stock, category_id,
        categories ( name )
      )
    `,
    )
    .eq("user_id", userId);

  if (error) {
    console.error("fetchRemoteCart:", error.message);
    return [];
  }

  return (data ?? [])
    .filter((item: any) => item.products)
    .map((item: any) => ({
      quantity: item.quantity,
      product: {
        id: item.products.id,
        name: item.products.name,
        price: item.products.price,
        scent_type: item.products.scent_type,
        description: item.products.description,
        image_url: item.products.image_url,
        stock: item.products.stock,
        category: item.products.categories?.name ?? "Uncategorised",
      },
    }));
}

// ── Save entire local cart to Supabase (upsert) ─────────────────────────────
export async function saveCartToSupabase(userId: string, items: CartItem[]) {
  if (items.length === 0) return;

  const rows = items.map((item) => ({
    user_id: userId,
    product_id: item.product.id,
    quantity: item.quantity,
  }));

  const { error } = await supabase
    .from("cart_items")
    .upsert(rows, { onConflict: "user_id,product_id" });

  if (error) console.error("saveCartToSupabase:", error.message);
}

// ── Upsert a single item ────────────────────────────────────────────────────
export async function upsertCartItem(
  userId: string,
  productId: string,
  quantity: number,
) {
  const { error } = await supabase
    .from("cart_items")
    .upsert(
      { user_id: userId, product_id: productId, quantity },
      { onConflict: "user_id,product_id" },
    );

  if (error) console.error("upsertCartItem:", error.message);
}

// ── Remove a single item ────────────────────────────────────────────────────
export async function removeCartItem(userId: string, productId: string) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) console.error("removeCartItem:", error.message);
}

// ── Clear entire cart from Supabase ────────────────────────────────────────
export async function clearRemoteCart(userId: string) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId);

  if (error) console.error("clearRemoteCart:", error.message);
}

// ── Merge guest cart into remote cart ──────────────────────────────────────
// Combines quantities for duplicate products, saves merged result
export async function mergeCartsOnLogin(
  userId: string,
  localItems: CartItem[],
  remoteItems: CartItem[],
): Promise<CartItem[]> {
  // Build a map from remote items
  const merged = new Map<string, CartItem>();

  // Add remote items first
  for (const item of remoteItems) {
    merged.set(item.product.id, { ...item });
  }

  // Merge local items — add quantities if product already exists
  for (const item of localItems) {
    const existing = merged.get(item.product.id);
    if (existing) {
      merged.set(item.product.id, {
        ...existing,
        quantity: existing.quantity + item.quantity,
      });
    } else {
      merged.set(item.product.id, { ...item });
    }
  }

  const mergedItems = Array.from(merged.values());

  // Save merged cart to Supabase
  await saveCartToSupabase(userId, mergedItems);

  return mergedItems;
}
