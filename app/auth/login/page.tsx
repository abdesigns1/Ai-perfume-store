"use client";

// app/auth/login/page.tsx
// Login page — wired to Supabase Auth.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "../../../hooks/useTheme";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { fonts } from "../../../lib/theme";
import { signIn, signInWithGoogle } from "../../../lib/auth";
import GlobalStyles from "../../../components/GlobalStyles";

export default function LoginPage() {
  const { theme: t, toggleTheme } = useTheme(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
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
    router.push("/"); // redirect to home after login
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
                "url(https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1200&q=85)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)",
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
                Your scent is your
                <br />
                <em style={{ color: "#C9A84C" }}>silent signature.</em>
              </p>
              <p
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: "0.1em",
                }}
              >
                Sign in to access your personal fragrance profile.
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
            Welcome back
          </p>
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 300,
              marginBottom: 8,
              letterSpacing: "0.02em",
            }}
          >
            Sign In
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
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              style={{ color: t.gold, textDecoration: "none" }}
            >
              Create one
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

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <AuthInput
              label="Email Address"
              type="email"
              value={email}
              placeholder="you@example.com"
              onChange={setEmail}
              theme={t}
            />

            <div>
              <AuthInput
                label="Password"
                type={showPass ? "text" : "password"}
                value={password}
                placeholder="••••••••"
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
              <div style={{ textAlign: "right", marginTop: 8 }}>
                <Link
                  href="/auth/forgot-password"
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 11,
                    color: t.muted,
                    textDecoration: "none",
                    letterSpacing: "0.05em",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = t.gold)
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = t.muted)
                  }
                >
                  Forgot password?
                </Link>
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
                marginTop: 8,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!loading)
                  (e.currentTarget as HTMLElement).style.background =
                    t.goldLight;
              }}
              onMouseLeave={(e) => {
                if (!loading)
                  (e.currentTarget as HTMLElement).style.background = t.gold;
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
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
                ((e.currentTarget as HTMLElement).style.borderColor = t.gold)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = t.border)
              }
            >
              <span style={{ fontSize: 16 }}>G</span> Continue with Google
            </button>
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
