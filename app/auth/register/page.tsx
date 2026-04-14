"use client";

// app/auth/register/page.tsx
// Customer registration with phone number field.

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "../../../hooks/useTheme";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { fonts } from "../../../lib/theme";
import { signInWithGoogle } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import GlobalStyles from "../../../components/GlobalStyles";

export default function RegisterPage() {
  const { theme: t, toggleTheme } = useTheme(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const passwordStrength = (p: string) => {
    if (!p.length) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strength = passwordStrength(password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#e25555", "#E8C97A", "#7abf7a", "#C9A84C"][
    strength
  ];

  const handleSubmit = async () => {
    if (!fullName || !email || !phone || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/^\+?[\d\s\-()]{7,15}$/.test(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (strength < 2) {
      setError("Please choose a stronger password.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the terms and conditions.");
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, role: "customer" },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Save phone to profiles immediately
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName,
        email,
        phone,
        role: "customer",
      });
    }

    setLoading(false);
    setSuccess(true);
  };

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
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

      {/* Left image */}
      {!isMobile && (
        <div
          style={{ flex: "0 0 48%", position: "relative", overflow: "hidden" }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "url(https://images.pexels.com/photos/7472986/pexels-photo-7472986.jpeg?cs=srgb&dl=pexels-vasilache-stefan-alexandru-45760552-7472986.jpg&fm=jpg)",
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
                Every great scent
                <br />
                <em style={{ color: "#C9A84C" }}>begins with you.</em>
              </p>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: "0.1em",
                }}
              >
                Create your profile and let AI find your perfect match.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Right form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: isMobile ? "60px 24px" : "60px 64px",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
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

          {success ? (
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
                  color: t.gold,
                }}
              >
                ✦
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 300, marginBottom: 12 }}>
                Check Your Email!
              </h2>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  color: t.muted,
                  marginBottom: 12,
                  lineHeight: 1.7,
                }}
              >
                We sent a verification link to:
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
                  marginBottom: 32,
                  lineHeight: 1.7,
                }}
              >
                Click the link to activate your account, then sign in.
              </p>
              <Link
                href="/auth/login"
                style={{
                  display: "inline-block",
                  background: t.gold,
                  color: t.dark ? "#0a0a0a" : "#fff",
                  fontFamily: fonts.sans,
                  fontSize: 11,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  padding: "14px 36px",
                  textDecoration: "none",
                }}
              >
                Go to Sign In
              </Link>
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
                Get started
              </p>
              <h1
                style={{
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 300,
                  marginBottom: 8,
                  letterSpacing: "0.02em",
                }}
              >
                Create Account
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
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  style={{ color: t.gold, textDecoration: "none" }}
                >
                  Sign in
                </Link>
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

              <div
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                <AuthInput
                  label="Full Name"
                  type="text"
                  value={fullName}
                  placeholder="Your full name"
                  onChange={setFullName}
                  theme={t}
                />
                <AuthInput
                  label="Email Address"
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  onChange={setEmail}
                  theme={t}
                />

                {/* Phone number */}
                <AuthInput
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  placeholder="+234 800 000 0000"
                  onChange={setPhone}
                  theme={t}
                />

                {/* Password */}
                <div>
                  <AuthInput
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
                  {password.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: 2,
                              borderRadius: 1,
                              background:
                                i <= strength ? strengthColor : t.border,
                              transition: "background 0.3s",
                            }}
                          />
                        ))}
                      </div>
                      <p
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 10,
                          color: strengthColor,
                          letterSpacing: "0.1em",
                        }}
                      >
                        {strengthLabel}
                      </p>
                    </div>
                  )}
                </div>

                <AuthInput
                  label="Confirm Password"
                  type={showPass ? "text" : "password"}
                  value={confirm}
                  placeholder="Repeat your password"
                  onChange={setConfirm}
                  theme={t}
                />

                {/* Terms */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    cursor: "pointer",
                  }}
                >
                  <div
                    onClick={() => setAgreed(!agreed)}
                    style={{
                      width: 16,
                      height: 16,
                      flexShrink: 0,
                      marginTop: 2,
                      border: `1px solid ${agreed ? t.gold : t.border}`,
                      background: agreed ? t.gold : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {agreed && (
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
                      lineHeight: 1.6,
                    }}
                  >
                    I agree to the{" "}
                    <a
                      href="#"
                      style={{ color: t.gold, textDecoration: "none" }}
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      style={{ color: t.gold, textDecoration: "none" }}
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>

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
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ flex: 1, height: 1, background: t.border }} />
                  <span
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 10,
                      color: t.muted,
                      letterSpacing: "0.15em",
                    }}
                  >
                    OR
                  </span>
                  <div style={{ flex: 1, height: 1, background: t.border }} />
                </div>

                <button
                  onClick={handleGoogle}
                  style={{
                    background: "none",
                    border: `1px solid ${t.border}`,
                    color: t.text,
                    cursor: "pointer",
                    fontFamily: fonts.sans,
                    fontSize: 12,
                    letterSpacing: "0.1em",
                    padding: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor =
                      t.gold)
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor =
                      t.border)
                  }
                >
                  <span style={{ fontSize: 16 }}>G</span> Continue with Google
                </button>
              </div>

              <div style={{ textAlign: "center", marginTop: 36 }}>
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

function AuthInput({
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
