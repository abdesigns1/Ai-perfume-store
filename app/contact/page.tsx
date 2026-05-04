"use client";

// app/contact/page.tsx
// Contact Us page — contact form, social links, and business info.

import { useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { fonts } from "../../lib/theme";
import GlobalStyles from "../../components/GlobalStyles";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const CONTACT_CHANNELS = [
  {
    icon: "✉",
    title: "Email Us",
    detail: "hello@scentai.ng",
    sub: "We reply within 24 hours",
    href: "mailto:hello@scentai.ng",
  },
  {
    icon: "◎",
    title: "WhatsApp",
    detail: "+234 800 000 0000",
    sub: "Mon – Sat, 9am – 6pm",
    href: "https://wa.me/2348000000000",
  },
  {
    icon: "⌖",
    title: "Lagos Showroom",
    detail: "Victoria Island, Lagos",
    sub: "By appointment only",
    href: "#",
  },
  {
    icon: "◈",
    title: "Abuja Showroom",
    detail: "Wuse II, Abuja",
    sub: "By appointment only",
    href: "#",
  },
];

const SUBJECTS = [
  "Order enquiry",
  "Product recommendation",
  "Returns & exchanges",
  "Wholesale / bulk order",
  "Partnership",
  "Other",
];

export default function ContactPage() {
  const { theme: t, toggleTheme } = useTheme(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const setField = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    // Simulate submission — replace with real email API (e.g. Resend, EmailJS)
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  const inputStyle = {
    width: "100%",
    background: t.card,
    border: `1px solid ${t.border}`,
    color: t.text,
    fontFamily: fonts.sans,
    fontSize: 13,
    padding: "13px 16px",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box" as const,
  };
  const labelStyle = {
    display: "block" as const,
    fontFamily: fonts.sans,
    fontSize: 10,
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    color: t.muted,
    marginBottom: 8,
  };

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

      {/* ── Header ── */}
      <div
        style={{
          paddingTop: 120,
          paddingBottom: 60,
          paddingLeft: "5vw",
          paddingRight: "5vw",
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
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
            Get in Touch
          </p>
          <h1
            style={{
              fontSize: "clamp(36px, 5vw, 64px)",
              fontWeight: 300,
              marginBottom: 20,
              letterSpacing: "-0.01em",
            }}
          >
            Contact Us
          </h1>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 14,
              color: t.muted,
              maxWidth: 520,
              lineHeight: 1.9,
            }}
          >
            Whether you need help choosing a fragrance, have a question about
            your order, or just want to talk scent — we are here for you.
          </p>
        </div>
      </div>

      {/* ── Contact channels ── */}
      <section
        style={{
          padding: isMobile ? "48px 5vw" : "72px 8vw",
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          {CONTACT_CHANNELS.map((ch) => (
            <a
              key={ch.title}
              href={ch.href}
              style={{
                background: t.card,
                border: `1px solid ${t.border}`,
                padding: "28px 24px",
                textDecoration: "none",
                color: t.text,
                display: "block",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = t.gold)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = t.border)
              }
            >
              <span
                style={{
                  fontSize: 28,
                  color: t.gold,
                  display: "block",
                  marginBottom: 16,
                }}
              >
                {ch.icon}
              </span>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 11,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: t.muted,
                  marginBottom: 8,
                }}
              >
                {ch.title}
              </p>
              <p style={{ fontSize: 16, fontWeight: 400, marginBottom: 6 }}>
                {ch.detail}
              </p>
              <p
                style={{ fontFamily: fonts.sans, fontSize: 11, color: t.muted }}
              >
                {ch.sub}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* ── Contact form ── */}
      <section style={{ padding: isMobile ? "64px 5vw" : "96px 8vw" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1.6fr",
            gap: isMobile ? 48 : 80,
          }}
        >
          {/* Left */}
          <div>
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
              Send a Message
            </p>
            <h2
              style={{
                fontSize: "clamp(24px, 3vw, 36px)",
                fontWeight: 300,
                marginBottom: 20,
              }}
            >
              We'd love to hear from you
            </h2>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 13,
                color: t.muted,
                lineHeight: 1.9,
                marginBottom: 32,
              }}
            >
              Fill in the form and a member of our team will get back to you
              within 24 hours. For urgent order enquiries, WhatsApp is fastest.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  color: t.muted,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ color: t.gold }}>✦</span> Mon – Fri: 9:00am –
                6:00pm
              </p>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  color: t.muted,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ color: t.gold }}>✦</span> Saturday: 10:00am –
                4:00pm
              </p>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  color: t.muted,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ color: t.gold }}>✦</span> Sunday: Closed
              </p>
            </div>
          </div>

          {/* Form */}
          <div>
            {submitted ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  border: `1px solid ${t.border}`,
                  background: t.card,
                }}
              >
                <span
                  style={{
                    fontSize: 48,
                    color: t.gold,
                    display: "block",
                    marginBottom: 20,
                  }}
                >
                  ✦
                </span>
                <h3 style={{ fontSize: 26, fontWeight: 300, marginBottom: 12 }}>
                  Message Received!
                </h3>
                <p
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 13,
                    color: t.muted,
                    lineHeight: 1.8,
                  }}
                >
                  Thank you for reaching out. We will get back to you within 24
                  hours.
                </p>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      placeholder="Your name"
                      onChange={(e) => setField("name", e.target.value)}
                      style={inputStyle}
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor = t.gold)
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor = t.border)
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address *</label>
                    <input
                      type="email"
                      value={form.email}
                      placeholder="you@example.com"
                      onChange={(e) => setField("email", e.target.value)}
                      style={inputStyle}
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor = t.gold)
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor = t.border)
                      }
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      placeholder="+234 800 000 0000"
                      onChange={(e) => setField("phone", e.target.value)}
                      style={inputStyle}
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor = t.gold)
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor = t.border)
                      }
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Subject</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setField("subject", e.target.value)}
                      style={{ ...inputStyle, cursor: "pointer" }}
                    >
                      <option value="">Select a subject</option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Message *</label>
                  <textarea
                    value={form.message}
                    placeholder="Tell us how we can help you..."
                    rows={6}
                    onChange={(e) => setField("message", e.target.value)}
                    style={{ ...inputStyle, resize: "vertical" }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = t.gold)
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = t.border)
                    }
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={
                    loading || !form.name || !form.email || !form.message
                  }
                  style={{
                    background:
                      loading || !form.name || !form.email || !form.message
                        ? t.border
                        : t.gold,
                    color: t.dark ? "#0a0a0a" : "#fff",
                    border: "none",
                    cursor:
                      loading || !form.name || !form.email || !form.message
                        ? "not-allowed"
                        : "pointer",
                    fontFamily: fonts.sans,
                    fontSize: 11,
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    padding: "16px",
                    transition: "background 0.2s",
                  }}
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
                <p
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 11,
                    color: t.muted,
                    textAlign: "center",
                  }}
                >
                  * Required fields. We never share your details with third
                  parties.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer theme={t} />
    </div>
  );
}
