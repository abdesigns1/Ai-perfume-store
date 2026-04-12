"use client";

// app/dashboard/register/page.tsx
// Admin registration — requires a secret staff code.
// Not linked anywhere publicly. Share URL only with staff.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";
import { fonts } from "@/lib/theme";
import { supabase } from "@/lib/supabase";
import GlobalStyles from "@/components/GlobalStyles";

const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_REGISTRATION_CODE ?? "";

export default function AdminRegisterPage() {
  const { theme: t, toggleTheme } = useTheme(true);
  const router = useRouter();

  const [step, setStep] = useState<"code" | "form">("code");
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Step 1 — verify staff code
  const handleCodeSubmit = () => {
    if (!code.trim()) {
      setError("Please enter the staff code.");
      return;
    }
    if (code.trim() !== ADMIN_CODE) {
      setError("Invalid staff code. Please contact your administrator.");
      return;
    }
    setError("");
    setStep("form");
  };

  // Step 2 — create admin account
  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirm) {
      setError("Please fill in all fields.");
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

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: "admin" },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Explicitly set role in profiles table
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName,
        email,
        role: "admin",
      });
    }

    setLoading(false);
    setSuccess(true);
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

      <div
        style={{
          width: "100%",
          maxWidth: 460,
          background: t.card,
          border: `1px solid ${t.border}`,
          padding: "48px 44px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo + badge */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
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
              marginBottom: 20,
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
              Staff Portal
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 300, marginBottom: 8 }}>
            Create Admin Account
          </h1>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 12,
              color: t.muted,
              lineHeight: 1.7,
            }}
          >
            {step === "code"
              ? "Enter your staff access code to proceed."
              : "Complete your account setup below."}
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

        {success ? (
          /* ── Success ── */
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                border: `1px solid ${t.gold}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 26,
                color: t.gold,
              }}
            >
              ✦
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 300, marginBottom: 12 }}>
              Account Created!
            </h2>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 13,
                color: t.muted,
                marginBottom: 8,
                lineHeight: 1.7,
              }}
            >
              Your admin account has been created successfully.
            </p>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 12,
                color: t.muted,
                marginBottom: 32,
                lineHeight: 1.7,
              }}
            >
              Check your email to verify your account, then sign in to access
              the dashboard.
            </p>
            <Link
              href="/dashboard/login"
              style={{
                display: "inline-block",
                background: t.gold,
                color: t.dark ? "#0a0a0a" : "#fff",
                fontFamily: fonts.sans,
                fontSize: 11,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                padding: "14px 32px",
                textDecoration: "none",
              }}
            >
              Go to Admin Login
            </Link>
          </div>
        ) : step === "code" ? (
          /* ── Step 1: Staff code ── */
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
                Staff Access Code
              </label>
              <input
                type="password"
                value={code}
                placeholder="Enter your staff code"
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCodeSubmit()}
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
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 11,
                  color: t.muted,
                  marginTop: 8,
                  lineHeight: 1.6,
                }}
              >
                Don't have a code? Contact your administrator.
              </p>
            </div>

            <button
              onClick={handleCodeSubmit}
              style={{
                background: t.gold,
                color: t.dark ? "#0a0a0a" : "#fff",
                border: "none",
                cursor: "pointer",
                fontFamily: fonts.sans,
                fontSize: 11,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                padding: "15px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  t.goldLight)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = t.gold)
              }
            >
              Verify Code
            </button>
          </div>
        ) : (
          /* ── Step 2: Registration form ── */
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Progress indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: t.gold,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: fonts.sans,
                  fontSize: 10,
                  color: t.dark ? "#0a0a0a" : "#fff",
                }}
              >
                ✓
              </div>
              <div style={{ flex: 1, height: 1, background: t.gold }} />
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: `1px solid ${t.gold}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: fonts.sans,
                  fontSize: 10,
                  color: t.gold,
                }}
              >
                2
              </div>
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 10,
                  color: t.muted,
                  letterSpacing: "0.1em",
                }}
              >
                Account Details
              </span>
            </div>

            <AdminInput
              label="Full Name"
              type="text"
              value={fullName}
              placeholder="Your full name"
              onChange={setFullName}
              theme={t}
            />
            <AdminInput
              label="Work Email"
              type="email"
              value={email}
              placeholder="you@scentai.com"
              onChange={setEmail}
              theme={t}
            />

            <div>
              <AdminInput
                label="Password"
                type={showPass ? "text" : "password"}
                value={password}
                placeholder="Min. 8 characters"
                onChange={setPassword}
                theme={t}
                suffix={
                  <button
                    onClick={() => setShowPass(!showPass)}
                    style={{
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
                }
              />
              {/* Password strength */}
              {password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {(() => {
                    let score = 0;
                    if (password.length >= 8) score++;
                    if (/[A-Z]/.test(password)) score++;
                    if (/[0-9]/.test(password)) score++;
                    if (/[^A-Za-z0-9]/.test(password)) score++;
                    const colors = [
                      "",
                      "#e25555",
                      "#E8C97A",
                      "#7abf7a",
                      "#C9A84C",
                    ];
                    const labels = ["", "Weak", "Fair", "Good", "Strong"];
                    return (
                      <>
                        <div
                          style={{ display: "flex", gap: 4, marginBottom: 4 }}
                        >
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              style={{
                                flex: 1,
                                height: 2,
                                borderRadius: 1,
                                background:
                                  i <= score ? colors[score] : t.border,
                                transition: "background 0.3s",
                              }}
                            />
                          ))}
                        </div>
                        <p
                          style={{
                            fontFamily: fonts.sans,
                            fontSize: 10,
                            color: colors[score],
                            letterSpacing: "0.1em",
                          }}
                        >
                          {labels[score]}
                        </p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            <AdminInput
              label="Confirm Password"
              type={showPass ? "text" : "password"}
              value={confirm}
              placeholder="Repeat your password"
              onChange={setConfirm}
              theme={t}
            />

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button
                onClick={() => {
                  setStep("code");
                  setError("");
                }}
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
                  padding: "13px",
                  transition: "border-color 0.2s",
                }}
              >
                Back
              </button>
              <button
                onClick={handleRegister}
                disabled={loading}
                style={{
                  flex: 2,
                  background: loading ? t.border : t.gold,
                  color: t.dark ? "#0a0a0a" : "#fff",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: fonts.sans,
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  padding: "13px",
                  transition: "background 0.2s",
                }}
              >
                {loading ? "Creating account..." : "Create Admin Account"}
              </button>
            </div>
          </div>
        )}

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
            href="/dashboard/login"
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
            ← Admin Login
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
        🔒 This page is for authorised staff only
      </p>
    </div>
  );
}

function AdminInput({
  label,
  type,
  value,
  placeholder,
  onChange,
  theme: t,
  suffix,
}: {
  label: string;
  type: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  theme: any;
  suffix?: React.ReactNode;
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
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
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
        {suffix && (
          <div
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}
