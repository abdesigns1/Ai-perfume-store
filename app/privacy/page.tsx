"use client";

// app/privacy/page.tsx
// Privacy Policy page — NDPR compliant for Nigerian market.

import { useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { fonts } from "../../lib/theme";
import GlobalStyles from "../../components/GlobalStyles";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const SECTIONS = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "Information you provide directly",
        body: "When you create an account, place an order, or contact us, we collect: your full name, email address, phone number, delivery addresses, and payment information (processed securely by Paystack — we never store your card details). When you write a product review, we collect your display name, star rating, and comment.",
      },
      {
        subtitle: "Information collected automatically",
        body: "When you use our website, we automatically collect certain technical information including your IP address, browser type, device type, pages visited, time spent on pages, and referring URLs. This is collected through standard web server logs and is used solely for improving our service.",
      },
      {
        subtitle: "AI Chat data",
        body: "When you use Scentara, our AI fragrance assistant, the content of your conversations is sent to our AI service provider to generate responses. Chat history is stored locally in your browser (localStorage) and is not permanently stored on our servers beyond the duration of the API request.",
      },
    ],
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Information",
    content: [
      {
        subtitle: "Order fulfilment",
        body: "We use your name, address, and contact details to process and deliver your orders, send order confirmations and shipping updates, and handle returns and exchanges.",
      },
      {
        subtitle: "Account management",
        body: "We use your email and password to authenticate your account and allow you to access your order history, saved addresses, and wishlist across sessions.",
      },
      {
        subtitle: "Customer support",
        body: "We use your contact information to respond to enquiries, resolve disputes, and provide after-sales support.",
      },
      {
        subtitle: "Service improvement",
        body: "We use anonymised, aggregated data about how our website is used to improve our product catalogue, user experience, and AI recommendations. This data cannot be used to identify individual users.",
      },
      {
        subtitle: "Marketing communications",
        body: "With your explicit consent, we may send you emails about new arrivals, promotions, and fragrance education content. You can unsubscribe at any time via the link in every email.",
      },
    ],
  },
  {
    id: "data-sharing",
    title: "3. How We Share Your Information",
    content: [
      {
        subtitle: "Service providers",
        body: "We share your information with trusted third-party service providers who help us operate our business: Supabase (database and authentication), Paystack (payment processing), and our AI service provider (fragrance recommendations). Each provider is contractually bound to use your data only for the services they provide to us.",
      },
      {
        subtitle: "Delivery partners",
        body: "We share your name, phone number, and delivery address with our logistics partners solely for the purpose of delivering your order.",
      },
      {
        subtitle: "Legal requirements",
        body: "We may disclose your information if required by Nigerian law, court order, or other legal process, or if we believe disclosure is necessary to protect our rights, prevent fraud, or ensure user safety.",
      },
      {
        subtitle: "We do not sell your data",
        body: "We will never sell, rent, or trade your personal information to third parties for their own marketing purposes. Your data is not a product.",
      },
    ],
  },
  {
    id: "data-security",
    title: "4. Data Security",
    content: [
      {
        subtitle: "How we protect your data",
        body: "All data transmitted between your browser and our servers is encrypted using TLS (HTTPS). Passwords are hashed and never stored in plain text. Payment information is processed directly by Paystack and never passes through our servers. We use Supabase's Row Level Security (RLS) to ensure database-level access controls are enforced on all user data.",
      },
      {
        subtitle: "Breach notification",
        body: "In the event of a data breach that poses a risk to your rights and freedoms, we will notify affected users and the Nigeria Data Protection Commission (NDPC) within 72 hours of becoming aware of the breach, in compliance with the Nigeria Data Protection Act 2023.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "5. Your Rights Under NDPA 2023",
    content: [
      {
        subtitle: "Right to access",
        body: "You have the right to request a copy of the personal data we hold about you. Submit a request to privacy@scentai.ng and we will respond within 30 days.",
      },
      {
        subtitle: "Right to rectification",
        body: "If any of your personal data is inaccurate or incomplete, you can update it directly in your Account Settings, or contact us to correct it.",
      },
      {
        subtitle: "Right to erasure",
        body: "You can request that we delete your personal data. We will comply unless we are required to retain it for legal or regulatory reasons (e.g. financial records for tax purposes).",
      },
      {
        subtitle: "Right to data portability",
        body: "You can request your personal data in a structured, commonly used, machine-readable format (JSON or CSV).",
      },
      {
        subtitle: "Right to withdraw consent",
        body: "Where we process your data based on consent (e.g. marketing emails), you can withdraw that consent at any time without affecting the lawfulness of processing carried out before withdrawal.",
      },
      {
        subtitle: "How to exercise your rights",
        body: "Email privacy@scentai.ng with 'Data Rights Request' in the subject line. Include your registered email address and specify your request. We will respond within 30 days.",
      },
    ],
  },
  {
    id: "cookies",
    title: "6. Cookies",
    content: [
      {
        subtitle: "What we use",
        body: "We use essential cookies to keep you logged in and remember your preferences (such as light or dark mode). We do not use advertising or tracking cookies. We do not use Google Analytics or any third-party analytics that track you across websites.",
      },
      {
        subtitle: "localStorage",
        body: "We use your browser's localStorage (not cookies) to store your cart items, theme preference, and AI chat history. This data never leaves your browser unless you are logged in, in which case your cart is also synced to our servers.",
      },
    ],
  },
  {
    id: "data-retention",
    title: "7. Data Retention",
    content: [
      {
        subtitle: "Account data",
        body: "We retain your account data for as long as your account is active. If you delete your account, we will remove your personal profile, saved addresses, and wishlist within 30 days. Order records are retained for 7 years for tax and legal compliance purposes.",
      },
      {
        subtitle: "Reviews",
        body: "Product reviews are public and associated with your display name (not your email or full name). If you delete your account, your reviews will be anonymised rather than deleted to preserve the integrity of product ratings.",
      },
    ],
  },
  {
    id: "children",
    title: "8. Children's Privacy",
    content: [
      {
        subtitle: "",
        body: "Our services are not directed to children under the age of 13. We do not knowingly collect personal data from children under 13. If you believe a child under 13 has provided us with personal data, please contact us at privacy@scentai.ng and we will delete it promptly.",
      },
    ],
  },
  {
    id: "changes",
    title: "9. Changes to This Policy",
    content: [
      {
        subtitle: "",
        body: "We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email (if you have an account) and update the 'Last updated' date at the top of this page. Continued use of our services after the changes take effect constitutes acceptance of the updated policy.",
      },
    ],
  },
  {
    id: "contact-us",
    title: "10. Contact Our Privacy Team",
    content: [
      {
        subtitle: "",
        body: "If you have any questions about this Privacy Policy or how we handle your data, please contact our Privacy Officer at: privacy@scentai.ng. You also have the right to lodge a complaint with the Nigeria Data Protection Commission (NDPC) at ndpb.gov.ng.",
      },
    ],
  },
];

export default function PrivacyPage() {
  const { theme: t, toggleTheme } = useTheme(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeSection, setActiveSection] = useState<string | null>(null);

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
          background: t.surface,
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
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
            Legal
          </p>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 300,
              marginBottom: 16,
            }}
          >
            Privacy Policy
          </h1>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 12,
              color: t.muted,
              marginBottom: 8,
            }}
          >
            Last updated: January 2025
          </p>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 13,
              color: t.muted,
              lineHeight: 1.8,
              maxWidth: 600,
            }}
          >
            This Privacy Policy explains how ScentAI ("we", "us", "our")
            collects, uses, and protects your personal information in compliance
            with the Nigeria Data Protection Act (NDPA) 2023.
          </p>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: isMobile ? "40px 5vw 80px" : "60px 5vw 80px",
        }}
      >
        {SECTIONS.map((section) => (
          <div
            key={section.id}
            id={section.id}
            style={{
              marginBottom: 48,
              paddingBottom: 48,
              borderBottom: `1px solid ${t.border}`,
            }}
          >
            <h2
              style={{
                fontSize: "clamp(20px, 3vw, 26px)",
                fontWeight: 400,
                marginBottom: 24,
                color: t.text,
              }}
            >
              {section.title}
            </h2>
            {section.content.map((item, i) => (
              <div key={i} style={{ marginBottom: 24 }}>
                {item.subtitle && (
                  <h3
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: t.gold,
                      marginBottom: 10,
                    }}
                  >
                    {item.subtitle}
                  </h3>
                )}
                <p
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 13,
                    color: t.muted,
                    lineHeight: 1.9,
                  }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        ))}

        {/* Footer note */}
        <div
          style={{
            background: t.card,
            border: `1px solid ${t.border}`,
            padding: "24px 28px",
          }}
        >
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 12,
              color: t.muted,
              lineHeight: 1.8,
            }}
          >
            <span style={{ color: t.gold }}>✦ </span>
            ScentAI is committed to protecting your privacy and processing your
            data in accordance with the Nigeria Data Protection Act 2023. For
            any privacy-related concerns, contact us at{" "}
            <a
              href="mailto:privacy@scentai.ng"
              style={{ color: t.gold, textDecoration: "none" }}
            >
              privacy@scentai.ng
            </a>
            .
          </p>
        </div>
      </div>

      <Footer theme={t} />
    </div>
  );
}
