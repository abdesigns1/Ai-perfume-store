// lib/mockData.ts
// Dummy data used in Phase 2 (UI-only).
// Replace with real Supabase queries in Phase 3.

import type { Product, Testimonial } from "../types";

export const featuredProducts: Product[] = [
  {
    id: "1",
    name: "Oud Noir",
    category: "Oriental",
    scent_type: "Woody",
    price: 18500,
    image_url:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80",
    description:
      "A deep, dark oud experience layered with smoky woods and rich amber.",
    stock: 12,
  },
  {
    id: "2",
    name: "Rose Absolue",
    category: "Floral",
    scent_type: "Floral",
    price: 14200,
    image_url: "https://fimgs.net/mdimg/perfume/o.1481.jpg",
    description:
      "An opulent bouquet of Bulgarian rose with soft powdery undertones.",
    stock: 8,
  },
  {
    id: "3",
    name: "Ambre Céleste",
    category: "Amber",
    scent_type: "Warm",
    price: 21000,
    image_url:
      "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600&q=80",
    description:
      "Celestial amber wrapped in warm resins and a hint of vanilla.",
    stock: 5,
  },
  {
    id: "4",
    name: "Vetiver Glacé",
    category: "Fresh",
    scent_type: "Earthy",
    price: 16800,
    image_url:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuRR6u0DBR0uVh01RdMoFGL3RPs92mRify2w&s",
    description:
      "Cool, earthy vetiver kissed by icy green notes and crisp citrus.",
    stock: 20,
  },
];

export const allProducts: Product[] = [
  ...featuredProducts,
  {
    id: "5",
    name: "Jasmin Étoile",
    category: "Floral",
    scent_type: "Floral",
    price: 13500,
    image_url: "https://fimgs.net/mdimg/perfume-thumbs/375x500.40577.jpg",
    description:
      "Star jasmine in full bloom — heady, white, and intoxicatingly feminine.",
    stock: 15,
  },
  {
    id: "6",
    name: "Musk Sauvage",
    category: "Oriental",
    scent_type: "Musky",
    price: 19800,
    image_url:
      "https://cdn.media.amplience.net/i/frasersdev/75331569_o_a5?fmt=auto&upscale=true&w=450&h=450&sm=scaleFit&$h-ttl$",
    description:
      "Raw white musk with a wild animalic heart and sandalwood base.",
    stock: 9,
  },
  {
    id: "7",
    name: "Bergamot Soleil",
    category: "Fresh",
    scent_type: "Citrus",
    price: 11200,
    image_url:
      "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600&q=80",
    description: "Sparkling Calabrian bergamot with a trail of warm cedarwood.",
    stock: 30,
  },
  {
    id: "8",
    name: "Santal Mystère",
    category: "Woody",
    scent_type: "Woody",
    price: 24500,
    image_url:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80",
    description:
      "Creamy Australian sandalwood wrapped in soft leather and spice.",
    stock: 6,
  },
  {
    id: "9",
    name: "Iris Poudré",
    category: "Floral",
    scent_type: "Floral",
    price: 17300,
    image_url:
      "https://noseparis.com/media/opti_image/webp/catalog/product/cache/347e24147afc53942168a65937a6a684/i/r/iris-poudre_-100ml_1.webp",
    description:
      "Powdery iris root at its most refined — elegant, pale, and ethereal.",
    stock: 11,
  },
  {
    id: "10",
    name: "Tobacco & Oud",
    category: "Oriental",
    scent_type: "Woody",
    price: 27000,
    image_url:
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&q=80",
    description:
      "Bold tobacco leaf fused with smoky oud — for those who command a room.",
    stock: 4,
  },
  {
    id: "11",
    name: "Aqua Lumière",
    category: "Fresh",
    scent_type: "Citrus",
    price: 10500,
    image_url:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80",
    description:
      "An ocean breeze captured in a bottle — light, airy and effortless.",
    stock: 25,
  },
  {
    id: "12",
    name: "Vanille Noire",
    category: "Amber",
    scent_type: "Warm",
    price: 15600,
    image_url:
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80",
    description: "Dark Madagascar vanilla with smoked woods and a hint of rum.",
    stock: 18,
  },
];

export const testimonials: Testimonial[] = [
  {
    name: "Aisha M.",
    text: "ScentAI found my signature scent in under a minute. Absolutely obsessed.",
    location: "Lagos",
  },
  {
    name: "Emeka O.",
    text: "The Oud Noir recommendation was perfect — rich, powerful, unforgettable.",
    location: "Abuja",
  },
  {
    name: "Zara K.",
    text: "I never knew I was a floral-amber person until ScentAI told me.",
    location: "London",
  },
];
