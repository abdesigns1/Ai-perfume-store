"use client";

// app/auth/forgot-password/page.tsx
// Forgot password page — split screen layout.
// Wired to Supabase Auth in Phase 6.

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "../../../hooks/useTheme";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { fonts } from "../../../lib/theme";
import GlobalStyles from "../../../components/GlobalStyles";

export default function ForgotPasswordPage() {
  const { theme: t, toggleTheme } = useTheme(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    // TODO Phase 6: replace with Supabase auth resetPasswordForEmail()
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: t.bg,
        color: t.text,
        fontFamily: fonts.serif,
        transition: "background 0.4s, color 0.4s",
      }}
    >
      <GlobalStyles theme={t} />

      {/* ── Left: image panel ── */}
      {!isMobile && (
        <div
          style={{ flex: "0 0 48%", position: "relative", overflow: "hidden" }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "url(https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=1200&q=85)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.75) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "40px 48px",
            }}
          >
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  border: "1px solid #C9A84C",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    color: "#C9A84C",
                    fontSize: 14,
                    fontFamily: fonts.sans,
                    fontWeight: 600,
                  }}
                >
                  S
                </span>
              </div>
              <span
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontFamily: fonts.sans,
                  letterSpacing: "0.15em",
                  fontWeight: 500,
                }}
              >
                SCENTAI
              </span>
            </Link>
            <div>
              <p
                style={{
                  fontSize: "clamp(28px, 3vw, 42px)",
                  fontWeight: 300,
                  color: "#fff",
                  lineHeight: 1.2,
                  marginBottom: 16,
                }}
              >
                Even the finest scents
                <br />
                <em style={{ color: "#C9A84C" }}>need a reset.</em>
              </p>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: "0.1em",
                }}
              >
                We'll send you a link to reset your password.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Right: form panel ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: isMobile ? "60px 24px" : "60px 64px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Mobile logo */}
          {isMobile && (
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                marginBottom: 40,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  border: `1px solid ${t.gold}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    color: t.gold,
                    fontSize: 12,
                    fontFamily: fonts.sans,
                  }}
                >
                  S
                </span>
              </div>
              <span
                style={{
                  fontSize: 16,
                  fontFamily: fonts.sans,
                  letterSpacing: "0.15em",
                  color: t.text,
                }}
              >
                SCENTAI
              </span>
            </Link>
          )}

          {sent ? (
            /* ── Success state ── */
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  border: `1px solid ${t.gold}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                  fontSize: 28,
                }}
              >
                ✉
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 300, marginBottom: 12 }}>
                Check Your Email
              </h2>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  color: t.muted,
                  lineHeight: 1.8,
                  marginBottom: 12,
                }}
              >
                We've sent a password reset link to:
              </p>
              <p
                style={{
                  color: t.gold,
                  fontFamily: fonts.sans,
                  fontSize: 14,
                  marginBottom: 32,
                  letterSpacing: "0.05em",
                }}
              >
                {email}
              </p>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  color: t.muted,
                  marginBottom: 36,
                  lineHeight: 1.7,
                }}
              >
                Didn't receive it? Check your spam folder or{" "}
                <button
                  onClick={() => setSent(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: t.gold,
                    cursor: "pointer",
                    fontFamily: fonts.sans,
                    fontSize: 12,
                    padding: 0,
                  }}
                >
                  try again
                </button>
                .
              </p>
              <Link
                href="/auth/login"
                style={{
                  display: "inline-block",
                  border: `1px solid ${t.gold}`,
                  color: t.gold,
                  fontFamily: fonts.sans,
                  fontSize: 11,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  padding: "13px 36px",
                  textDecoration: "none",
                }}
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
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
                Account recovery
              </p>
              <h1
                style={{
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 300,
                  marginBottom: 8,
                  letterSpacing: "0.02em",
                }}
              >
                Forgot Password?
              </h1>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  color: t.muted,
                  marginBottom: 40,
                  lineHeight: 1.7,
                }}
              >
                Enter your email and we'll send you a reset link.
              </p>

              {/* Error */}
              {error && (
                <div
                  style={{
                    background: "rgba(226,85,85,0.1)",
                    border: "1px solid rgba(226,85,85,0.4)",
                    padding: "12px 16px",
                    marginBottom: 24,
                    fontFamily: fonts.sans,
                    fontSize: 12,
                    color: "#e25555",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Form */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
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
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    placeholder="you@example.com"
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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
                  disabled={loading}
                  style={{
                    background: loading ? t.border : t.gold,
                    color: t.dark ? "#0a0a0a" : "#fff",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: fonts.sans,
                    fontSize: 11,
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    padding: "16px",
                    transition: "background 0.2s",
                  }}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <div style={{ textAlign: "center" }}>
                  <Link
                    href="/auth/login"
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 12,
                      color: t.muted,
                      textDecoration: "none",
                      letterSpacing: "0.08em",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = t.gold)
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = t.muted)
                    }
                  >
                    ← Back to Sign In
                  </Link>
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: 48 }}>
                <button
                  onClick={toggleTheme}
                  style={{
                    background: "none",
                    border: "none",
                    fontFamily: fonts.sans,
                    fontSize: 11,
                    color: t.muted,
                    cursor: "pointer",
                    letterSpacing: "0.1em",
                  }}
                >
                  {t.dark ? "☀ Light mode" : "☾ Dark mode"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
