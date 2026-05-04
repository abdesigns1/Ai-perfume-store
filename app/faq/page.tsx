"use client";

// app/faq/page.tsx
// FAQ page — accordion-style, organised by category.

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "../../hooks/useTheme";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { fonts } from "../../lib/theme";
import GlobalStyles from "../../components/GlobalStyles";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const FAQ_CATEGORIES = [
  {
    id: "orders",
    label: "Orders & Delivery",
    icon: "◎",
    questions: [
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 3–5 business days across most Nigerian cities. Express delivery takes 1–2 business days. Store pickup (Lagos and Abuja) is available by appointment. Delivery times may vary during public holidays and peak seasons.",
      },
      {
        q: "Do you deliver outside Lagos and Abuja?",
        a: "Yes! We deliver to over 20 cities across Nigeria including Port Harcourt, Kano, Ibadan, Enugu, Benin City, Kaduna, and more. Enter your address at checkout to see your delivery options and estimated time.",
      },
      {
        q: "Is delivery free?",
        a: "Standard delivery is free on all orders above ₦20,000. For orders below ₦20,000, standard delivery costs ₦3,500. Express delivery is ₦6,000 regardless of order value. Store pickup is always free.",
      },
      {
        q: "Can I track my order?",
        a: "Yes. Once your order ships, you will receive an SMS and email with a tracking link. You can also view your order status in real time by going to My Account → My Orders on the website.",
      },
      {
        q: "Can I change or cancel my order after placing it?",
        a: "You can cancel or modify your order within 2 hours of placing it by contacting us on WhatsApp (+234 800 000 0000) or emailing hello@scentai.ng. After 2 hours, your order will have been processed for dispatch and cannot be changed.",
      },
      {
        q: "What if my order arrives damaged or incorrect?",
        a: "We are deeply sorry if this happens. Please take a photo of the item and contact us within 48 hours of delivery via hello@scentai.ng or WhatsApp. We will replace the item or issue a full refund at no cost to you.",
      },
    ],
  },
  {
    id: "products",
    label: "Products & Authenticity",
    icon: "✦",
    questions: [
      {
        q: "Are all your fragrances 100% authentic?",
        a: "Absolutely. Every single fragrance we sell is 100% authentic and sourced directly from authorised distributors and brand houses. We have a zero-tolerance policy for counterfeits. If you ever doubt the authenticity of a product you received from us, contact us immediately and we will investigate and resolve it fully.",
      },
      {
        q: "What is the difference between EDP and EDT?",
        a: "EDP (Eau de Parfum) has a higher concentration of fragrance oil (typically 15–20%) and lasts longer — usually 6–12 hours. EDT (Eau de Toilette) has a lower concentration (5–15%) and is lighter, typically lasting 3–5 hours. EDPs are generally better for evenings, formal occasions, or cooler weather. EDTs are great for daytime wear and warmer climates.",
      },
      {
        q: "What does 'Sillage' mean?",
        a: "Sillage (pronounced 'see-yazh') is a French word meaning the trail or wake a fragrance leaves in the air. A fragrance with strong sillage is noticeable from a distance and lingers after you have left a room. Light sillage means the scent stays close to the skin and is more intimate.",
      },
      {
        q: "How do I make my fragrance last longer?",
        a: "Apply fragrance to pulse points: wrists, neck, behind the ears, and inner elbows. Moisturised skin holds fragrance better — apply an unscented lotion before spraying. Do not rub your wrists together as this breaks down the scent molecules. Store fragrances away from direct sunlight and heat, which degrade the composition over time.",
      },
      {
        q: "Do you sell sample sizes?",
        a: "We are currently working on a discovery kit programme that will allow you to sample multiple fragrances before committing to a full bottle. Sign up for our newsletter or follow us on Instagram to be notified when it launches.",
      },
    ],
  },
  {
    id: "payments",
    label: "Payments & Returns",
    icon: "₦",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major debit and credit cards (Visa, Mastercard, Verve) via our secure Paystack payment gateway. Paystack also supports bank transfers and USSD payment codes. All transactions are in Nigerian Naira (₦).",
      },
      {
        q: "Is it safe to pay on your website?",
        a: "Yes, completely safe. Your payment is processed by Paystack, Nigeria's most trusted payment gateway, using bank-grade 256-bit encryption. We never see or store your card details — they go directly to Paystack's secure servers.",
      },
      {
        q: "What is your returns policy?",
        a: "We accept returns on unopened, sealed products within 14 days of delivery. The product must be in its original packaging and unused. To initiate a return, email returns@scentai.ng with your order number. Once we receive and inspect the returned item, we will issue a refund within 5–7 business days.",
      },
      {
        q: "Can I return a fragrance I have opened?",
        a: "Due to the nature of fragrances, we are unable to accept returns on opened or used items unless the product is defective or was incorrectly sent. We recommend using our Scentara AI assistant or reviewing the scent notes carefully before purchasing to ensure it suits you.",
      },
      {
        q: "How long do refunds take?",
        a: "Once your return is approved, refunds are processed within 5–7 business days back to your original payment method. If you paid by card, it may take an additional 2–3 business days for the refund to appear depending on your bank.",
      },
      {
        q: "Do you offer gift wrapping?",
        a: "Every ScentAI order comes in a luxury gift box at no extra charge. If you are sending a gift directly to the recipient, you can add a personalised message at checkout and we will include it inside the box.",
      },
    ],
  },
  {
    id: "account",
    label: "Account & Scentara AI",
    icon: "◈",
    questions: [
      {
        q: "Do I need an account to place an order?",
        a: "You can browse our full collection without an account. However, to place an order you will need to create one — this allows you to track your orders, save delivery addresses, and build a wishlist. Registration takes less than a minute.",
      },
      {
        q: "I forgot my password. What do I do?",
        a: "Go to the sign-in page and click 'Forgot password?'. Enter your registered email address and we will send you a password reset link. The link is valid for 1 hour. If you don't receive the email, check your spam folder or contact us.",
      },
      {
        q: "What is Scentara and how does it work?",
        a: "Scentara is our AI-powered fragrance guide. Describe your mood, personality, a favourite scent you already own, or an occasion you are shopping for — and Scentara will recommend the perfect fragrance from our collection and explain exactly why it suits you. You can add items directly to your cart from the chat. Access Scentara via the gold ✦ bubble on any page or the 'Scentara AI' link in the navigation.",
      },
      {
        q: "Is my chat history with Scentara saved?",
        a: "Yes. Your conversation with Scentara is saved to your browser's local storage, so it will still be there when you return to the site. The history is stored on your device only and is not saved to our servers. You can clear your chat history at any time using the 'Clear' button in the Scentara chat header.",
      },
      {
        q: "Can I leave a review for a product?",
        a: "Yes. To leave a review, you must have placed and received an order containing that product. Go to My Account → My Orders, find the relevant order, and click 'Write Review' next to the product. Reviews from verified buyers help other customers make more confident choices.",
      },
    ],
  },
];

export default function FAQPage() {
  const { theme: t, toggleTheme } = useTheme(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState("orders");
  const [search, setSearch] = useState("");

  const toggle = (id: string) => {
    setOpenItems((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const filteredCategories = search.trim()
    ? FAQ_CATEGORIES.map((cat) => ({
        ...cat,
        questions: cat.questions.filter(
          (q) =>
            q.q.toLowerCase().includes(search.toLowerCase()) ||
            q.a.toLowerCase().includes(search.toLowerCase()),
        ),
      })).filter((cat) => cat.questions.length > 0)
    : FAQ_CATEGORIES.filter((cat) => cat.id === activeCategory);

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

      {/* Header */}
      <div
        style={{
          paddingTop: 120,
          paddingBottom: 60,
          paddingLeft: "5vw",
          paddingRight: "5vw",
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 10,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: t.gold,
              marginBottom: 16,
            }}
          >
            Help Centre
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 24,
            }}
          >
            <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 300 }}>
              Frequently Asked Questions
            </h1>
            {/* Search */}
            <div
              style={{ position: "relative", width: isMobile ? "100%" : 320 }}
            >
              <input
                type="text"
                value={search}
                placeholder="Search questions..."
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  background: t.card,
                  border: `1px solid ${t.border}`,
                  color: t.text,
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  padding: "12px 44px 12px 16px",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
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
                  fontSize: 16,
                  pointerEvents: "none",
                }}
              >
                ⌕
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: isMobile ? "40px 5vw 80px" : "60px 5vw 80px",
          display: "flex",
          gap: 48,
          alignItems: "flex-start",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        {/* Category sidebar */}
        {!search && (
          <div
            style={{
              width: isMobile ? "100%" : 220,
              flexShrink: 0,
              display: "flex",
              flexDirection: isMobile ? "row" : "column",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  background: activeCategory === cat.id ? t.subtle : "none",
                  border: `1px solid ${activeCategory === cat.id ? t.gold : "transparent"}`,
                  color: activeCategory === cat.id ? t.text : t.muted,
                  cursor: "pointer",
                  fontFamily: fonts.sans,
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textAlign: "left",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    color: activeCategory === cat.id ? t.gold : t.muted,
                    fontSize: 14,
                  }}
                >
                  {cat.icon}
                </span>
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Questions */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {filteredCategories.map((cat) => (
            <div key={cat.id} style={{ marginBottom: search ? 48 : 0 }}>
              {search && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 20,
                  }}
                >
                  <span style={{ color: t.gold, fontSize: 16 }}>
                    {cat.icon}
                  </span>
                  <h2 style={{ fontSize: 18, fontWeight: 400, color: t.muted }}>
                    {cat.label}
                  </h2>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {cat.questions.map((item, i) => {
                  const id = `${cat.id}-${i}`;
                  const isOpen = openItems.has(id);
                  return (
                    <div
                      key={id}
                      style={{ borderBottom: `1px solid ${t.border}` }}
                    >
                      <button
                        onClick={() => toggle(id)}
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 16,
                          padding: "20px 0",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "clamp(15px, 2vw, 18px)",
                            fontWeight: 400,
                            color: isOpen ? t.gold : t.text,
                            lineHeight: 1.4,
                            transition: "color 0.2s",
                            flex: 1,
                          }}
                        >
                          {item.q}
                        </span>
                        <span
                          style={{
                            color: t.gold,
                            fontSize: 20,
                            flexShrink: 0,
                            transition: "transform 0.25s",
                            transform: isOpen
                              ? "rotate(45deg)"
                              : "rotate(0deg)",
                            display: "block",
                            lineHeight: 1,
                          }}
                        >
                          +
                        </span>
                      </button>
                      {isOpen && (
                        <div style={{ paddingBottom: 20 }}>
                          <p
                            style={{
                              fontFamily: fonts.sans,
                              fontSize: 13,
                              color: t.muted,
                              lineHeight: 1.9,
                              borderLeft: `3px solid ${t.gold}`,
                              paddingLeft: 20,
                            }}
                          >
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {search && filteredCategories.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ fontSize: 32, marginBottom: 16 }}>◎</p>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 14,
                  color: t.muted,
                  marginBottom: 24,
                }}
              >
                No results found for "{search}"
              </p>
              <button
                onClick={() => setSearch("")}
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  background: "none",
                  border: `1px solid ${t.gold}`,
                  color: t.gold,
                  cursor: "pointer",
                  padding: "10px 24px",
                }}
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Still need help? */}
      <div
        style={{
          background: t.subtle,
          borderTop: `1px solid ${t.border}`,
          padding: isMobile ? "48px 5vw" : "64px 5vw",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 28, color: t.gold, marginBottom: 16 }}>✦</p>
        <h2
          style={{
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 300,
            marginBottom: 12,
          }}
        >
          Still have questions?
        </h2>
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 13,
            color: t.muted,
            marginBottom: 32,
            lineHeight: 1.8,
          }}
        >
          Our team is happy to help. Reach out via WhatsApp for the fastest
          response.
        </p>
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/contact"
            style={{
              fontFamily: fonts.sans,
              fontSize: 11,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              background: t.gold,
              color: t.dark ? "#0a0a0a" : "#fff",
              padding: "13px 32px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Contact Us
          </Link>
          <Link
            href="/ai"
            style={{
              fontFamily: fonts.sans,
              fontSize: 11,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              background: "none",
              border: `1px solid ${t.gold}`,
              color: t.gold,
              padding: "12px 32px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Ask Scentara AI
          </Link>
        </div>
      </div>

      <Footer theme={t} />
    </div>
  );
}
