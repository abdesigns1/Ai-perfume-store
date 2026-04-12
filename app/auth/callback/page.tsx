"use client";

// app/auth/callback/page.tsx
// Handles redirect after:
// - Email verification (sign up)
// - Google OAuth
// - Password reset link
// Supabase automatically exchanges the code in the URL for a session.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { useTheme } from "../../../hooks/useTheme";
import { fonts } from "../../../lib/theme";
import GlobalStyles from "../../../components/GlobalStyles";

export default function AuthCallbackPage() {
  const { theme: t } = useTheme(true);
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }

      if (session) {
        setStatus("success");
        setMessage("You're signed in! Redirecting...");
        setTimeout(() => router.push("/"), 1500);
      } else {
        // Try exchanging code from URL (email verification)
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setStatus("error");
            setMessage(exchangeError.message);
          } else {
            setStatus("success");
            setMessage("Email verified! Redirecting...");
            setTimeout(() => router.push("/"), 1500);
          }
        } else {
          setStatus("error");
          setMessage("No session found. Please try signing in again.");
        }
      }
    };

    handleCallback();
  }, [router]);

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
      }}
    >
      <GlobalStyles theme={t} />
      <div style={{ textAlign: "center", maxWidth: 400, padding: "0 24px" }}>
        {status === "loading" && (
          <>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: `2px solid ${t.border}`,
                borderTopColor: t.gold,
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 24px",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 13,
                color: t.muted,
                letterSpacing: "0.1em",
              }}
            >
              Verifying your account...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                border: `1px solid ${t.gold}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                fontSize: 24,
                color: t.gold,
              }}
            >
              ✦
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 300, marginBottom: 12 }}>
              Success!
            </h2>
            <p style={{ fontFamily: fonts.sans, fontSize: 13, color: t.muted }}>
              {message}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                border: "1px solid rgba(226,85,85,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                fontSize: 24,
                color: "#e25555",
              }}
            >
              ✕
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 300, marginBottom: 12 }}>
              Something went wrong
            </h2>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 13,
                color: t.muted,
                marginBottom: 24,
              }}
            >
              {message}
            </p>
            <a
              href="/auth/login"
              style={{
                fontFamily: fonts.sans,
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: t.gold,
                textDecoration: "none",
                border: `1px solid ${t.gold}`,
                padding: "12px 28px",
                display: "inline-block",
              }}
            >
              Back to Sign In
            </a>
          </>
        )}
      </div>
    </div>
  );
}
