// types/index.ts
// Shared TypeScript types used across the app.

export type Product = {
  id: string;
  name: string;
  category: string;
  scent_type: string;
  price: number;
  image_url: string;
  description?: string;
  stock?: number;
};

export type Testimonial = {
  name: string;
  text: string;
  location: string;
};

export type Category = {
  id: string;
  name: string;
};

export type Order = {
  id: string;
  user_id: string;
  total_price: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  delivery_method: "delivery" | "pickup";
  created_at: string;
};

export type Address = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  country: string;
};
