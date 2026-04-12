"use client";

// lib/cartContext.tsx
// Global cart state with Supabase sync for logged-in users.
// - Guests: cart lives in localStorage
// - Logged in: cart syncs to Supabase in real time
// - On login: guest cart + remote cart are merged

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";
import type { Product } from "../types";
import {
  fetchRemoteCart,
  upsertCartItem,
  removeCartItem,
  clearRemoteCart,
  mergeCartsOnLogin,
} from "./cartSync";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  userId: string | null;
  isSyncing: boolean;
};

const CartContext = createContext<CartContextType | null>(null);

// ── localStorage helpers ────────────────────────────────────────────────────
const LOCAL_KEY = "scentai-cart";

const loadLocalCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LOCAL_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalCart = (items: CartItem[]) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  } catch {}
};

const clearLocalCart = () => {
  try {
    localStorage.removeItem(LOCAL_KEY);
  } catch {}
};

// ── Provider ────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadLocalCart);
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // ── Persist to localStorage for guests ──────────────────────────────────
  useEffect(() => {
    if (!userId) saveLocalCart(items);
  }, [items, userId]);

  // ── Listen to Supabase auth state changes ───────────────────────────────
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const uid = session?.user?.id ?? null;

      if (event === "SIGNED_IN" && uid) {
        setIsSyncing(true);
        setUserId(uid);

        // Load remote cart
        const remoteItems = await fetchRemoteCart(uid);

        // Get current local (guest) cart
        const localItems = loadLocalCart();

        if (localItems.length > 0) {
          // Merge local + remote
          const merged = await mergeCartsOnLogin(uid, localItems, remoteItems);
          setItems(merged);
          clearLocalCart(); // guest cart no longer needed
        } else {
          // No local cart — just use remote
          setItems(remoteItems);
        }

        setIsSyncing(false);
      }

      if (event === "SIGNED_OUT") {
        setUserId(null);
        setItems([]); // clear in-memory cart
        clearLocalCart();
      }
    });

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        setUserId(session.user.id);
        setIsSyncing(true);
        fetchRemoteCart(session.user.id).then((remoteItems) => {
          setItems(remoteItems);
          setIsSyncing(false);
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Cart actions ─────────────────────────────────────────────────────────
  const addItem = useCallback(
    (product: Product, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        const newItems = existing
          ? prev.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i,
            )
          : [...prev, { product, quantity }];

        // Sync to Supabase if logged in
        if (userId) {
          const newQty = existing ? existing.quantity + quantity : quantity;
          upsertCartItem(userId, product.id, newQty);
        }

        return newItems;
      });
    },
    [userId],
  );

  const removeItem = useCallback(
    (productId: string) => {
      setItems((prev) => {
        const newItems = prev.filter((i) => i.product.id !== productId);
        if (userId) removeCartItem(userId, productId);
        return newItems;
      });
    },
    [userId],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity < 1) return;
      setItems((prev) => {
        const newItems = prev.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i,
        );
        if (userId) upsertCartItem(userId, productId, quantity);
        return newItems;
      });
    },
    [userId],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    if (userId) clearRemoteCart(userId);
    else clearLocalCart();
  }, [userId]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((v) => !v), []);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        userId,
        isSyncing,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
