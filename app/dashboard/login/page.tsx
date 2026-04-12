"use client";

// app/dashboard/login/page.tsx
// Admin login — email + password via Supabase auth.
// Redirects to /dashboard on success.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";
import { fonts } from "@/lib/theme";
import { signIn } from "@/lib/auth";
import GlobalStyles from "@/components/GlobalStyles";

export default function AdminLoginPage() {
  const { theme: t, toggleTheme } = useTheme(true);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
  };

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
        position: "relative",
        transition: "background 0.4s, color 0.4s",
      }}
    >
      <GlobalStyles theme={t} />
      <div className="grain" />

      {/* Decorative circles */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(700px, 90vw)",
          height: "min(700px, 90vw)",
          border: `1px solid ${t.border}`,
          borderRadius: "50%",
          opacity: 0.3,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(500px, 70vw)",
          height: "min(500px, 70vw)",
          border: `1px solid ${t.gold}`,
          borderRadius: "50%",
          opacity: 0.08,
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: t.card,
          border: `1px solid ${t.border}`,
          padding: "48px 44px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo + badge */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                border: `1px solid ${t.gold}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: t.gold,
                  fontSize: 16,
                  fontFamily: fonts.sans,
                  fontWeight: 600,
                }}
              >
                S
              </span>
            </div>
            <span
              style={{
                fontSize: 20,
                fontFamily: fonts.sans,
                letterSpacing: "0.15em",
                color: t.text,
                fontWeight: 500,
              }}
            >
              SCENTAI
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: 9,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: t.dark ? "#0a0a0a" : "#fff",
                background: t.gold,
                padding: "4px 14px",
              }}
            >
              Admin Portal
            </span>
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 300,
              letterSpacing: "0.02em",
              marginBottom: 8,
            }}
          >
            Sign In
          </h1>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 12,
              color: t.muted,
              letterSpacing: "0.05em",
            }}
          >
            Restricted access — authorised personnel only
          </p>
        </div>

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
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
              placeholder="admin@scentai.com"
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              style={{
                width: "100%",
                background: t.bg,
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
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                placeholder="••••••••"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                style={{
                  width: "100%",
                  background: t.bg,
                  border: `1px solid ${t.border}`,
                  color: t.text,
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  padding: "13px 52px 13px 16px",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = t.gold)}
                onBlur={(e) => (e.currentTarget.style.borderColor = t.border)}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: t.muted,
                  cursor: "pointer",
                  fontFamily: fonts.sans,
                  fontSize: 10,
                  letterSpacing: "0.1em",
                }}
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
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
              marginTop: 4,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!loading)
                (e.currentTarget as HTMLElement).style.background = t.goldLight;
            }}
            onMouseLeave={(e) => {
              if (!loading)
                (e.currentTarget as HTMLElement).style.background = t.gold;
            }}
          >
            {loading ? "Verifying..." : "Access Dashboard"}
          </button>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 32,
            paddingTop: 24,
            borderTop: `1px solid ${t.border}`,
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: fonts.sans,
              fontSize: 11,
              color: t.muted,
              textDecoration: "none",
              letterSpacing: "0.08em",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = t.gold)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = t.muted)
            }
          >
            ← Back to Store
          </Link>
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
            {t.dark ? "☀" : "☾"}
          </button>
        </div>
      </div>

      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: 10,
          color: t.muted,
          marginTop: 24,
          letterSpacing: "0.1em",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        🔒 Secured connection · All activity is logged
      </p>
    </div>
  );
}
