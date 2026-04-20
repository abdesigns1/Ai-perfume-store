"use client";

// app/checkout/page.tsx
// Checkout — delivery address, delivery method, order summary, Paystack payment.
// Requires login. Creates order in Supabase on successful payment.

import { useState, useEffect, useCallback } from "react";
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

// ── Delivery options ──────────────────────────────────────────────────────────
const DELIVERY_OPTIONS = [
  {
    id: "standard",
    label: "Standard Delivery",
    description: "3–5 business days",
    fee: 3500,
    icon: "📦",
  },
  {
    id: "express",
    label: "Express Delivery",
    description: "1–2 business days",
    fee: 6000,
    icon: "⚡",
  },
  {
    id: "pickup",
    label: "Store Pickup",
    description: "Available in Lagos & Abuja",
    fee: 0,
    icon: "🏪",
  },
];

const FREE_DELIVERY_THRESHOLD = 20000;

type Step = "address" | "delivery" | "review" | "success";

export default function CheckoutPage() {
  const { theme: t, toggleTheme } = useTheme(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<Step>("address");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Address form
  const [selectedAddr, setSelectedAddr] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState({
    full_name: "",
    phone: "",
    address_line: "",
    city: "",
    state: "",
    country: "Nigeria",
  });
  const [useNewAddr, setUseNewAddr] = useState(false);
  const [saveAddr, setSaveAddr] = useState(true);
  const [addrError, setAddrError] = useState("");

  // Delivery
  const [deliveryMethod, setDeliveryMethod] = useState("standard");

  const selectedDelivery = DELIVERY_OPTIONS.find(
    (o) => o.id === deliveryMethod,
  )!;
  const deliveryFee =
    subtotal >= FREE_DELIVERY_THRESHOLD && deliveryMethod === "standard"
      ? 0
      : selectedDelivery.fee;
  const total = subtotal + deliveryFee;

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/auth/login?redirect=/checkout");
        return;
      }
      if (items.length === 0) {
        router.replace("/cart");
        return;
      }

      setUser(session.user);

      const [profRes, addrRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single(),
        supabase.from("addresses").select("*").eq("user_id", session.user.id),
      ]);

      setProfile(profRes.data);
      const addrs = addrRes.data ?? [];
      setAddresses(addrs);

      // Pre-fill form with profile data
      setAddrForm((f) => ({
        ...f,
        full_name:
          profRes.data?.full_name ??
          session.user.user_metadata?.full_name ??
          "",
        phone: profRes.data?.phone ?? "",
      }));

      // Auto-select first saved address
      if (addrs.length > 0) {
        setSelectedAddr(addrs[0].id);
        setUseNewAddr(false);
      } else {
        setUseNewAddr(true);
      }

      setLoading(false);
    };
    load();
  }, [router, items.length]);

  // ── Step validation ────────────────────────────────────────────────────────
  const validateAddress = () => {
    if (!useNewAddr && selectedAddr) return true;
    if (!addrForm.full_name) {
      setAddrError("Full name is required.");
      return false;
    }
    if (!addrForm.phone) {
      setAddrError("Phone number is required.");
      return false;
    }
    if (!addrForm.address_line) {
      setAddrError("Address line is required.");
      return false;
    }
    if (!addrForm.city) {
      setAddrError("City is required.");
      return false;
    }
    if (!addrForm.country) {
      setAddrError("Country is required.");
      return false;
    }
    return true;
  };

  const handleAddressNext = async () => {
    setAddrError("");
    if (!validateAddress()) return;

    // Save new address to DB if requested
    if (useNewAddr && saveAddr && user) {
      const { data } = await supabase
        .from("addresses")
        .insert({ ...addrForm, user_id: user.id })
        .select()
        .single();
      if (data) {
        setAddresses((prev) => [...prev, data]);
        setSelectedAddr(data.id);
      }
    }
    setStep("delivery");
  };

  // ── Create order in Supabase ───────────────────────────────────────────────
  const createOrder = async (): Promise<string | null> => {
    const deliveryAddr = useNewAddr
      ? addrForm
      : addresses.find((a) => a.id === selectedAddr);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_price: total,
        status: "pending",
        delivery_method: deliveryMethod,
      })
      .select()
      .single();

    if (error || !order) {
      console.error("createOrder:", error?.message);
      return null;
    }

    // Insert order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
    }));

    await supabase.from("order_items").insert(orderItems);

    return order.id;
  };

  // ── Paystack payment ───────────────────────────────────────────────────────
  const handlePaystack = useCallback(async () => {
    if (!user) return;
    setPaying(true);

    // Dynamically load Paystack to avoid SSR issues
    const PaystackPop = (await import("@paystack/inline-js")).default;
    const handler = new PaystackPop();

    handler.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
      email: user.email,
      amount: total * 100, // Paystack uses kobo
      currency: "NGN",
      ref: `SCENT-${Date.now()}`,
      metadata: {
        custom_fields: [
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: profile?.full_name ?? user.email,
          },
          {
            display_name: "Delivery Method",
            variable_name: "delivery_method",
            value: deliveryMethod,
          },
        ],
      },
      onSuccess: async (transaction: any) => {
        // Payment successful — create order
        const newOrderId = await createOrder();
        setPaying(false);
        if (newOrderId) {
          setOrderId(newOrderId);
          clearCart();
          setStep("success");
        }
      },
      onCancel: () => {
        setPaying(false);
      },
    });
  }, [user, total, profile, deliveryMethod, items, clearCart]);

  // ── Delivery address to display ────────────────────────────────────────────
  const displayAddress = useNewAddr
    ? addrForm
    : addresses.find((a) => a.id === selectedAddr);

  const STEPS: { id: Step; label: string; num: number }[] = [
    { id: "address", label: "Address", num: 1 },
    { id: "delivery", label: "Delivery", num: 2 },
    { id: "review", label: "Review", num: 3 },
  ];

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  if (loading)
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

  // ── Success state ──────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: t.bg,
          color: t.text,
          fontFamily: fonts.serif,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <GlobalStyles theme={t} />
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: `1px solid ${t.gold}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 28px",
            fontSize: 36,
            color: t.gold,
          }}
        >
          ✦
        </div>
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 44px)",
            fontWeight: 300,
            marginBottom: 16,
          }}
        >
          Order Confirmed!
        </h1>
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 13,
            color: t.muted,
            marginBottom: 8,
            lineHeight: 1.8,
          }}
        >
          Thank you for your purchase. Your order has been placed successfully.
        </p>
        {orderId && (
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 12,
              color: t.gold,
              marginBottom: 40,
              letterSpacing: "0.1em",
            }}
          >
            Order #{orderId.slice(0, 8).toUpperCase()}
          </p>
        )}
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 13,
            color: t.muted,
            marginBottom: 40,
            lineHeight: 1.8,
            maxWidth: 400,
          }}
        >
          We'll send you an update when your order is on its way. You can track
          your order in your account.
        </p>
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link
            href="/account"
            style={{
              fontFamily: fonts.sans,
              fontSize: 11,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              background: t.gold,
              color: t.dark ? "#0a0a0a" : "#fff",
              padding: "14px 32px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            View My Orders
          </Link>
          <Link
            href="/products"
            style={{
              fontFamily: fonts.sans,
              fontSize: 11,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              background: "none",
              border: `1px solid ${t.gold}`,
              color: t.gold,
              padding: "13px 32px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Continue Shopping
          </Link>
        </div>
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

      {/* ── Page header ── */}
      <div
        style={{
          paddingTop: 96,
          paddingBottom: 32,
          paddingLeft: "5vw",
          paddingRight: "5vw",
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 10,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: t.gold,
            marginBottom: 12,
          }}
        >
          Secure Checkout
        </p>
        <h1
          style={{
            fontSize: "clamp(24px, 4vw, 40px)",
            fontWeight: 300,
            marginBottom: 28,
          }}
        >
          Checkout
        </h1>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: stepIndex >= i ? t.gold : "none",
                    border: `1px solid ${stepIndex >= i ? t.gold : t.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: fonts.sans,
                    fontSize: 11,
                    fontWeight: 600,
                    color:
                      stepIndex >= i ? (t.dark ? "#0a0a0a" : "#fff") : t.muted,
                    transition: "all 0.3s",
                  }}
                >
                  {stepIndex > i ? "✓" : s.num}
                </div>
                <span
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 11,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: stepIndex >= i ? t.text : t.muted,
                    display: isMobile ? "none" : "inline",
                  }}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    width: isMobile ? 24 : 60,
                    height: 1,
                    background: stepIndex > i ? t.gold : t.border,
                    margin: "0 12px",
                    transition: "background 0.3s",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 40,
          padding: "40px 5vw 80px",
          maxWidth: 1200,
          margin: "0 auto",
          alignItems: "flex-start",
        }}
      >
        {/* ── Left: step content ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* ── STEP 1: Address ── */}
          {step === "address" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 300, marginBottom: 28 }}>
                Delivery Address
              </h2>

              {/* Saved addresses */}
              {addresses.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <p
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 10,
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      color: t.muted,
                      marginBottom: 16,
                    }}
                  >
                    Saved Addresses
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddr(addr.id);
                          setUseNewAddr(false);
                        }}
                        style={{
                          background:
                            selectedAddr === addr.id && !useNewAddr
                              ? t.subtle
                              : t.card,
                          border: `1px solid ${selectedAddr === addr.id && !useNewAddr ? t.gold : t.border}`,
                          padding: "16px 20px",
                          cursor: "pointer",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 14,
                          transition: "all 0.2s",
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            flexShrink: 0,
                            marginTop: 2,
                            border: `1px solid ${selectedAddr === addr.id && !useNewAddr ? t.gold : t.border}`,
                            background:
                              selectedAddr === addr.id && !useNewAddr
                                ? t.gold
                                : "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {selectedAddr === addr.id && !useNewAddr && (
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: t.dark ? "#0a0a0a" : "#fff",
                                display: "block",
                              }}
                            />
                          )}
                        </div>
                        <div>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: 400,
                              marginBottom: 4,
                              color: t.text,
                            }}
                          >
                            {addr.full_name}
                          </p>
                          <p
                            style={{
                              fontFamily: fonts.sans,
                              fontSize: 12,
                              color: t.muted,
                              lineHeight: 1.7,
                            }}
                          >
                            {addr.phone && (
                              <>
                                {addr.phone}
                                <br />
                              </>
                            )}
                            {addr.address_line}, {addr.city}
                            {addr.state ? `, ${addr.state}` : ""},{" "}
                            {addr.country}
                          </p>
                        </div>
                      </button>
                    ))}

                    {/* Use new address option */}
                    <button
                      onClick={() => {
                        setUseNewAddr(true);
                        setSelectedAddr(null);
                      }}
                      style={{
                        background: useNewAddr ? t.subtle : t.card,
                        border: `1px solid ${useNewAddr ? t.gold : t.border}`,
                        padding: "14px 20px",
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        transition: "all 0.2s",
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          flexShrink: 0,
                          border: `1px solid ${useNewAddr ? t.gold : t.border}`,
                          background: useNewAddr ? t.gold : "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {useNewAddr && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: t.dark ? "#0a0a0a" : "#fff",
                              display: "block",
                            }}
                          />
                        )}
                      </div>
                      <span
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 12,
                          color: t.text,
                          letterSpacing: "0.05em",
                        }}
                      >
                        Use a new address
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* New address form */}
              {(useNewAddr || addresses.length === 0) && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 18 }}
                >
                  {addrError && (
                    <div
                      style={{
                        background: "rgba(226,85,85,0.1)",
                        border: "1px solid rgba(226,85,85,0.4)",
                        padding: "12px 16px",
                        fontFamily: fonts.sans,
                        fontSize: 12,
                        color: "#e25555",
                      }}
                    >
                      {addrError}
                    </div>
                  )}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <CkInput
                      label="Full Name *"
                      value={addrForm.full_name}
                      onChange={(v) =>
                        setAddrForm((f) => ({ ...f, full_name: v }))
                      }
                      placeholder="Recipient name"
                      theme={t}
                    />
                    <CkInput
                      label="Phone *"
                      value={addrForm.phone}
                      onChange={(v) => setAddrForm((f) => ({ ...f, phone: v }))}
                      placeholder="+234 800 000 0000"
                      theme={t}
                    />
                  </div>
                  <CkInput
                    label="Address Line *"
                    value={addrForm.address_line}
                    onChange={(v) =>
                      setAddrForm((f) => ({ ...f, address_line: v }))
                    }
                    placeholder="Street, apartment, floor"
                    theme={t}
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <CkInput
                      label="City *"
                      value={addrForm.city}
                      onChange={(v) => setAddrForm((f) => ({ ...f, city: v }))}
                      placeholder="Lagos"
                      theme={t}
                    />
                    <CkInput
                      label="State"
                      value={addrForm.state}
                      onChange={(v) => setAddrForm((f) => ({ ...f, state: v }))}
                      placeholder="Lagos State"
                      theme={t}
                    />
                    <CkInput
                      label="Country *"
                      value={addrForm.country}
                      onChange={(v) =>
                        setAddrForm((f) => ({ ...f, country: v }))
                      }
                      placeholder="Nigeria"
                      theme={t}
                    />
                  </div>

                  {/* Save address checkbox */}
                  {user && (
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        cursor: "pointer",
                      }}
                    >
                      <div
                        onClick={() => setSaveAddr(!saveAddr)}
                        style={{
                          width: 16,
                          height: 16,
                          flexShrink: 0,
                          border: `1px solid ${saveAddr ? t.gold : t.border}`,
                          background: saveAddr ? t.gold : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {saveAddr && (
                          <span
                            style={{
                              color: t.dark ? "#0a0a0a" : "#fff",
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 12,
                          color: t.muted,
                        }}
                      >
                        Save this address for future orders
                      </span>
                    </label>
                  )}
                </div>
              )}

              <button
                onClick={handleAddressNext}
                style={{
                  marginTop: 32,
                  width: "100%",
                  background: t.gold,
                  color: t.dark ? "#0a0a0a" : "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: fonts.sans,
                  fontSize: 11,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  padding: "16px",
                  transition: "background 0.2s",
                }}
              >
                Continue to Delivery →
              </button>
            </div>
          )}

          {/* ── STEP 2: Delivery method ── */}
          {step === "delivery" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 300, marginBottom: 28 }}>
                Delivery Method
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  marginBottom: 32,
                }}
              >
                {DELIVERY_OPTIONS.map((option) => {
                  const isFreeStandard =
                    option.id === "standard" &&
                    subtotal >= FREE_DELIVERY_THRESHOLD;
                  const fee = isFreeStandard ? 0 : option.fee;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setDeliveryMethod(option.id)}
                      style={{
                        background:
                          deliveryMethod === option.id ? t.subtle : t.card,
                        border: `1px solid ${deliveryMethod === option.id ? t.gold : t.border}`,
                        padding: "20px 24px",
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: 20,
                        transition: "all 0.2s",
                      }}
                    >
                      {/* Radio */}
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          flexShrink: 0,
                          border: `1px solid ${deliveryMethod === option.id ? t.gold : t.border}`,
                          background:
                            deliveryMethod === option.id ? t.gold : "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {deliveryMethod === option.id && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: t.dark ? "#0a0a0a" : "#fff",
                              display: "block",
                            }}
                          />
                        )}
                      </div>

                      {/* Icon */}
                      <span style={{ fontSize: 24, flexShrink: 0 }}>
                        {option.icon}
                      </span>

                      {/* Info */}
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: 16,
                            fontWeight: 400,
                            color: t.text,
                            marginBottom: 4,
                          }}
                        >
                          {option.label}
                        </p>
                        <p
                          style={{
                            fontFamily: fonts.sans,
                            fontSize: 12,
                            color: t.muted,
                          }}
                        >
                          {option.description}
                        </p>
                      </div>

                      {/* Fee */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        {fee === 0 ? (
                          <span
                            style={{
                              color: "#7abf7a",
                              fontFamily: fonts.sans,
                              fontSize: 13,
                              fontWeight: 500,
                            }}
                          >
                            Free
                          </span>
                        ) : (
                          <span
                            style={{
                              color: t.gold,
                              fontSize: 16,
                              fontWeight: 400,
                            }}
                          >
                            {formatPrice(fee)}
                          </span>
                        )}
                        {isFreeStandard && option.id === "standard" && (
                          <p
                            style={{
                              fontFamily: fonts.sans,
                              fontSize: 10,
                              color: "#7abf7a",
                              marginTop: 2,
                            }}
                          >
                            Order qualifies!
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setStep("address")}
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
                    padding: "14px",
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep("review")}
                  style={{
                    flex: 3,
                    background: t.gold,
                    color: t.dark ? "#0a0a0a" : "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: fonts.sans,
                    fontSize: 11,
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    padding: "14px",
                    transition: "background 0.2s",
                  }}
                >
                  Review Order →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Review ── */}
          {step === "review" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 300, marginBottom: 28 }}>
                Review Your Order
              </h2>

              {/* Delivery address summary */}
              <div
                style={{
                  background: t.card,
                  border: `1px solid ${t.border}`,
                  padding: "20px 24px",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <p
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 10,
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      color: t.gold,
                    }}
                  >
                    Delivery Address
                  </p>
                  <button
                    onClick={() => setStep("address")}
                    style={{
                      background: "none",
                      border: "none",
                      fontFamily: fonts.sans,
                      fontSize: 11,
                      color: t.muted,
                      cursor: "pointer",
                      letterSpacing: "0.1em",
                      textDecoration: "underline",
                    }}
                  >
                    Change
                  </button>
                </div>
                {displayAddress && (
                  <p
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 13,
                      color: t.muted,
                      lineHeight: 1.8,
                    }}
                  >
                    <strong style={{ color: t.text }}>
                      {displayAddress.full_name}
                    </strong>
                    <br />
                    {displayAddress.phone && (
                      <>
                        {displayAddress.phone}
                        <br />
                      </>
                    )}
                    {displayAddress.address_line}, {displayAddress.city}
                    {displayAddress.state
                      ? `, ${displayAddress.state}`
                      : ""}, {displayAddress.country}
                  </p>
                )}
              </div>

              {/* Delivery method summary */}
              <div
                style={{
                  background: t.card,
                  border: `1px solid ${t.border}`,
                  padding: "20px 24px",
                  marginBottom: 28,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: 10,
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        color: t.gold,
                        marginBottom: 8,
                      }}
                    >
                      Delivery Method
                    </p>
                    <p style={{ fontSize: 15, fontWeight: 400 }}>
                      {selectedDelivery.icon} {selectedDelivery.label}
                    </p>
                    <p
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: 12,
                        color: t.muted,
                      }}
                    >
                      {selectedDelivery.description}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <button
                      onClick={() => setStep("delivery")}
                      style={{
                        background: "none",
                        border: "none",
                        fontFamily: fonts.sans,
                        fontSize: 11,
                        color: t.muted,
                        cursor: "pointer",
                        letterSpacing: "0.1em",
                        textDecoration: "underline",
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Change
                    </button>
                    <span
                      style={{
                        color: deliveryFee === 0 ? "#7abf7a" : t.gold,
                        fontSize: 16,
                      }}
                    >
                      {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cart items */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                  marginBottom: 32,
                }}
              >
                <p
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 10,
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    color: t.muted,
                    marginBottom: 16,
                  }}
                >
                  {items.length} {items.length === 1 ? "Item" : "Items"}
                </p>
                {items.map(({ product: p, quantity }) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      gap: 16,
                      padding: "16px 0",
                      borderBottom: `1px solid ${t.border}`,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 60,
                        height: 72,
                        overflow: "hidden",
                        border: `1px solid ${t.border}`,
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={p.image_url}
                        alt={p.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
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
                        {p.category}
                      </p>
                      <p style={{ fontSize: 16, fontWeight: 400 }}>{p.name}</p>
                      <p
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 11,
                          color: t.muted,
                        }}
                      >
                        Qty: {quantity}
                      </p>
                    </div>
                    <span
                      style={{ color: t.gold, fontSize: 16, fontWeight: 400 }}
                    >
                      {formatPrice(p.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setStep("delivery")}
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
                    padding: "14px",
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={handlePaystack}
                  disabled={paying}
                  style={{
                    flex: 3,
                    background: paying ? t.border : t.gold,
                    color: t.dark ? "#0a0a0a" : "#fff",
                    border: "none",
                    cursor: paying ? "not-allowed" : "pointer",
                    fontFamily: fonts.sans,
                    fontSize: 11,
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    padding: "14px",
                    transition: "background 0.2s",
                  }}
                >
                  {paying
                    ? "Opening Payment..."
                    : `Pay ${formatPrice(total)} with Paystack`}
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 20,
                  marginTop: 20,
                  flexWrap: "wrap",
                }}
              >
                {["🔒 Secure Payment", "✦ SSL Encrypted", "↩ Easy Returns"].map(
                  (b) => (
                    <span
                      key={b}
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: 10,
                        color: t.muted,
                        letterSpacing: "0.08em",
                      }}
                    >
                      {b}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Order summary ── */}
        <div
          style={{
            width: isMobile ? "100%" : 340,
            flexShrink: 0,
            position: isMobile ? "relative" : "sticky",
            top: 100,
          }}
        >
          <div
            style={{
              background: t.card,
              border: `1px solid ${t.border}`,
              padding: "28px",
            }}
          >
            <h3
              style={{
                fontFamily: fonts.sans,
                fontSize: 11,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: t.gold,
                marginBottom: 24,
              }}
            >
              Order Summary
            </h3>

            {/* Items */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {items.map(({ product: p, quantity }) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 44,
                        overflow: "hidden",
                        border: `1px solid ${t.border}`,
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={p.image_url}
                        alt={p.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 400,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.name}
                      </p>
                      <p
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 10,
                          color: t.muted,
                        }}
                      >
                        × {quantity}
                      </p>
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 13,
                      color: t.text,
                      flexShrink: 0,
                    }}
                  >
                    {formatPrice(p.price * quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{ height: 1, background: t.border, margin: "16px 0" }}
            />

            {/* Totals */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 12,
                    color: t.muted,
                  }}
                >
                  Subtotal
                </span>
                <span
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 13,
                    color: t.text,
                  }}
                >
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 12,
                    color: t.muted,
                  }}
                >
                  Delivery
                </span>
                <span
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 13,
                    color: deliveryFee === 0 ? "#7abf7a" : t.text,
                  }}
                >
                  {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
                </span>
              </div>
            </div>

            <div
              style={{ height: 1, background: t.border, margin: "16px 0" }}
            />

            {/* Total */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  letterSpacing: "0.1em",
                }}
              >
                Total
              </span>
              <span style={{ fontSize: 26, fontWeight: 300, color: t.gold }}>
                {formatPrice(total)}
              </span>
            </div>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 10,
                color: t.muted,
                letterSpacing: "0.08em",
              }}
            >
              Including all taxes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Input component ────────────────────────────────────────────────────────
function CkInput({
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
