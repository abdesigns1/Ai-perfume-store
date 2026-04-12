"use client";

// app/auth/reset-password/page.tsx
// Shown after user clicks the reset password link in their email.
// Calls supabase.auth.updateUser() to set the new password.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../../hooks/useTheme";
import { fonts } from "../../../lib/theme";
import { updatePassword } from "../../../lib/auth";
import GlobalStyles from "../../../components/GlobalStyles";
import Link from "next/link";

export default function ResetPasswordPage() {
  const { theme: t, toggleTheme } = useTheme(true);
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!password || !confirm) {
      setError("Please fill in both fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError("");
    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/auth/login"), 2000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        color: t.text,
        fontFamily: fonts.serif,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        transition: "background 0.4s, color 0.4s",
      }}
    >
      <GlobalStyles theme={t} />

      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: t.card,
          border: `1px solid ${t.border}`,
          padding: "48px 44px",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                border: `1px solid ${t.gold}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: t.gold,
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
                fontSize: 18,
                fontFamily: fonts.sans,
                letterSpacing: "0.15em",
                color: t.text,
                fontWeight: 500,
              }}
            >
              SCENTAI
            </span>
          </Link>
        </div>

        {success ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                border: `1px solid ${t.gold}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 24,
                color: t.gold,
              }}
            >
              ✦
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 300, marginBottom: 12 }}>
              Password Updated!
            </h2>
            <p style={{ fontFamily: fonts.sans, fontSize: 13, color: t.muted }}>
              Redirecting you to sign in...
            </p>
          </div>
        ) : (
          <>
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
              New Password
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 300, marginBottom: 8 }}>
              Reset Password
            </h1>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 13,
                color: t.muted,
                marginBottom: 36,
                lineHeight: 1.7,
              }}
            >
              Choose a strong new password for your account.
            </p>

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
                  New Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    placeholder="Min. 8 characters"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
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
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = t.gold)
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = t.border)
                    }
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
                  Confirm Password
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  value={confirm}
                  placeholder="Repeat your password"
                  onChange={(e) => {
                    setConfirm(e.target.value);
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
                    padding: "13px 16px",
                    outline: "none",
                    transition: "border-color 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = t.gold)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = t.border)}
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
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>

            <div style={{ textAlign: "center", marginTop: 32 }}>
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
  );
}
