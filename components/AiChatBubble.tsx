"use client";

// components/AiChatBubble.tsx
// Floating chat bubble that appears on all pages.

import { useState, useEffect } from "react";
import { useTheme } from "../hooks/useTheme";
import { fonts } from "../lib/theme";
import AiChat from "./AiChat";

export default function AiChatBubble() {
  const { theme: t } = useTheme(true);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setPulse(true), 3000);
    const stopPulse = setTimeout(() => setPulse(false), 8000);
    return () => {
      clearTimeout(timer);
      clearTimeout(stopPulse);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Chat drawer */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 998,
              backdropFilter: "blur(2px)",
            }}
          />
          <div
            style={{
              position: "fixed",
              bottom: 96,
              right: 24,
              width: "min(420px, calc(100vw - 48px))",
              height: "min(600px, calc(100vh - 140px))",
              background: t.bg,
              border: `1px solid ${t.border}`,
              boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
              zIndex: 999,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "slideUp 0.25s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <AiChat theme={t} onClose={() => setOpen(false)} compact={true} />
          </div>
        </>
      )}

      {/* Bubble + tooltip */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        {!open && pulse && (
          <div
            style={{
              position: "relative",
              background: t.card,
              border: `1px solid ${t.border}`,
              padding: "10px 16px",
              maxWidth: 210,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 12,
                color: t.text,
                lineHeight: 1.6,
                marginBottom: 2,
              }}
            >
              ✦ Need help choosing a scent?
            </p>
            <p style={{ fontFamily: fonts.sans, fontSize: 10, color: t.muted }}>
              Ask Scentara, our AI guide
            </p>
            <div
              style={{
                position: "absolute",
                bottom: -6,
                right: 22,
                width: 12,
                height: 12,
                background: t.card,
                border: `1px solid ${t.border}`,
                transform: "rotate(45deg)",
                borderTop: "none",
                borderLeft: "none",
              }}
            />
          </div>
        )}

        <button
          onClick={() => {
            setOpen(!open);
            setPulse(false);
          }}
          title="Chat with Scentara AI"
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: open ? t.text : t.gold,
            border: `2px solid ${open ? t.gold : "transparent"}`,
            color: open ? t.bg : t.dark ? "#0a0a0a" : "#fff",
            cursor: "pointer",
            fontSize: open ? 22 : 26,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
            transform: open ? "rotate(45deg)" : "scale(1)",
            position: "relative",
          }}
        >
          {open ? "×" : "✦"}
          {!open && pulse && (
            <span
              style={{
                position: "absolute",
                inset: -6,
                borderRadius: "50%",
                border: `2px solid ${t.gold}`,
                animation: "ring 1.5s ease-out infinite",
                opacity: 0,
              }}
            />
          )}
        </button>
      </div>

      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes ring    { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(1.8);opacity:0} }
      `}</style>
    </>
  );
}
