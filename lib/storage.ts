// lib/storage.ts
// Supabase Storage helpers for uploading product images.

import { supabase } from "./supabase";

const BUCKET = "product-images";

export async function uploadProductImage(file: File): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `products/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (error) {
    console.error("uploadProductImage:", error.message);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteProductImage(url: string) {
  // Extract path from public URL
  const path = url.split(`${BUCKET}/`)[1];
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}
