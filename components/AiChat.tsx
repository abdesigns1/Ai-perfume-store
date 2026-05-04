"use client";

// components/AiChat.tsx
// Full AI chat UI — text messages + product cards + add to cart.
// Chat history is persisted to localStorage so it survives page changes and bubble close/open.

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { fonts } from "../lib/theme";
import { formatPrice } from "../utils/format";
import { useCart } from "../lib/cartContext";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: any[];
};

const STORAGE_KEY = "scentai-chat-history";
const MAX_STORED_MESSAGES = 50; // keep last 50 messages to avoid bloating localStorage

const SUGGESTIONS = [
  "I need something for a first date 🌹",
  "What's a good gift for my mum?",
  "I love woody and smoky scents",
  "What's the difference between EDP and EDT?",
  "I want something fresh for everyday wear",
  "Recommend a scent for an office setting",
];

type Props = {
  theme: any;
  onClose?: () => void;
  compact?: boolean;
};

export default function AiChat({ theme: t, onClose, compact = false }: Props) {
  const { addItem, openCart } = useCart();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Load messages from localStorage on mount ────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Message[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // localStorage unavailable or corrupted — start fresh
    }
    setMounted(true);
  }, []);

  // ── Save messages to localStorage whenever they change ──────────────────
  useEffect(() => {
    if (!mounted) return; // don't save before we've loaded
    try {
      // Keep only the most recent messages to avoid storage bloat
      const toStore = messages.slice(-MAX_STORED_MESSAGES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      // Storage full or unavailable — fail silently
    }
  }, [messages, mounted]);

  // ── Scroll to bottom on new message ────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── Focus input on mount (full page only) ──────────────────────────────
  useEffect(() => {
    if (!compact) setTimeout(() => inputRef.current?.focus(), 100);
  }, [compact]);

  // ── Clear chat history ──────────────────────────────────────────────────
  const clearHistory = () => {
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  // ── Send message ────────────────────────────────────────────────────────
  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const trimmed = text.trim();
    setInput("");

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      let data: any = null;

      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        const errorMessage =
          data?.details?.error ||
          data?.details?.message ||
          data?.details ||
          data?.error ||
          `Request failed with status ${res.status}`;

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `I ran into an issue: ${errorMessage}`,
          },
        ]);
        return;
      }

      if (!data?.text || typeof data.text !== "string") {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "The AI returned an empty response. Please try again.",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.text,
          products: Array.isArray(data.products) ? data.products : [],
        },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: error?.message
            ? `I'm having trouble connecting right now: ${error.message}`
            : "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ── Add to cart ──────────────────────────────────────────────────────────
  const handleAddToCart = (product: any) => {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        scent_type: product.scent_type,
        category: product.category,
        description: product.description,
        stock: product.stock,
      },
      1,
    );
    setAddedIds((prev) => new Set([...prev, product.id]));
    if (!compact) openCart();
  };

  const hasHistory = messages.length > 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: t.bg,
        fontFamily: fonts.serif,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: compact ? "14px 18px" : "20px 28px",
          borderBottom: `1px solid ${t.border}`,
          background: t.surface,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: compact ? 36 : 44,
              height: compact ? 36 : 44,
              background: t.gold,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: compact ? 16 : 20,
              color: t.dark ? "#0a0a0a" : "#fff",
              flexShrink: 0,
            }}
          >
            ✦
          </div>
          <div>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: compact ? 12 : 14,
                fontWeight: 600,
                color: t.text,
                letterSpacing: "0.08em",
              }}
            >
              Scentara
            </p>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 10,
                color: "#7abf7a",
                letterSpacing: "0.1em",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#7abf7a",
                  display: "inline-block",
                }}
              />{" "}
              Online
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Clear history button — only shown when there are messages */}
          {hasHistory && (
            <button
              onClick={clearHistory}
              title="Clear chat history"
              style={{
                background: "none",
                border: `1px solid ${t.border}`,
                color: t.muted,
                cursor: "pointer",
                fontFamily: fonts.sans,
                fontSize: 9,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "5px 10px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#e25555";
                (e.currentTarget as HTMLElement).style.color = "#e25555";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = t.border;
                (e.currentTarget as HTMLElement).style.color = t.muted;
              }}
            >
              Clear
            </button>
          )}

          {compact && (
            <Link
              href="/ai"
              style={{
                fontFamily: fonts.sans,
                fontSize: 9,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: t.muted,
                textDecoration: "none",
                border: `1px solid ${t.border}`,
                padding: "5px 10px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = t.gold;
                (e.currentTarget as HTMLElement).style.color = t.gold;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = t.border;
                (e.currentTarget as HTMLElement).style.color = t.muted;
              }}
            >
              Full View
            </Link>
          )}

          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: t.muted,
                cursor: "pointer",
                fontSize: 22,
                lineHeight: 1,
                padding: 4,
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: compact ? "16px" : "24px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Welcome — only shown when no messages */}
        {messages.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: compact ? 8 : 40 }}>
            <div
              style={{
                fontSize: compact ? 32 : 52,
                marginBottom: 16,
                color: t.gold,
              }}
            >
              ✦
            </div>
            <h3
              style={{
                fontSize: compact ? 18 : 26,
                fontWeight: 300,
                marginBottom: 10,
              }}
            >
              Meet Scentara
            </h3>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: compact ? 11 : 13,
                color: t.muted,
                lineHeight: 1.8,
                marginBottom: 28,
                maxWidth: 340,
                margin: "0 auto 28px",
              }}
            >
              Your personal AI fragrance guide. I help you discover scents,
              learn about perfumery, and find the perfect gift.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                justifyContent: "center",
              }}
            >
              {(compact ? SUGGESTIONS.slice(0, 4) : SUGGESTIONS).map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  style={{
                    background: "none",
                    border: `1px solid ${t.border}`,
                    color: t.muted,
                    cursor: "pointer",
                    fontFamily: fonts.sans,
                    fontSize: compact ? 10 : 11,
                    letterSpacing: "0.05em",
                    padding: compact ? "7px 12px" : "9px 16px",
                    transition: "all 0.2s",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = t.gold;
                    (e.currentTarget as HTMLElement).style.color = t.gold;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      t.border;
                    (e.currentTarget as HTMLElement).style.color = t.muted;
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.role === "user" ? "flex-end" : "flex-start",
              gap: 12,
            }}
          >
            <div
              style={{
                maxWidth: compact ? "88%" : "72%",
                background: msg.role === "user" ? t.gold : t.card,
                color:
                  msg.role === "user" ? (t.dark ? "#0a0a0a" : "#fff") : t.text,
                border: msg.role === "user" ? "none" : `1px solid ${t.border}`,
                padding: compact ? "10px 14px" : "14px 20px",
                fontSize: compact ? 13 : 15,
                lineHeight: 1.8,
                fontWeight: 300,
              }}
            >
              {msg.content}
            </div>

            {/* Product cards */}
            {msg.products && msg.products.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: compact
                    ? "1fr"
                    : `repeat(${Math.min(msg.products.length, 3)}, 1fr)`,
                  gap: 12,
                  width: "100%",
                  maxWidth: compact ? "100%" : "92%",
                }}
              >
                {msg.products.map((product: any) => (
                  <div
                    key={product.id}
                    style={{
                      background: t.card,
                      border: `1px solid ${t.border}`,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: compact ? "row" : "column",
                    }}
                  >
                    <Link
                      href={`/products/${product.id}`}
                      style={{ textDecoration: "none", flexShrink: 0 }}
                    >
                      <div
                        style={{
                          width: compact ? 72 : "100%",
                          height: compact ? 88 : 180,
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={product.image_url}
                          alt={product.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.3s",
                          }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.transform =
                              "scale(1.05)")
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.transform =
                              "scale(1)")
                          }
                        />
                      </div>
                    </Link>
                    <div
                      style={{
                        padding: compact ? "10px 12px" : "14px",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        minWidth: 0,
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontFamily: fonts.sans,
                            fontSize: 9,
                            color: t.gold,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            marginBottom: 4,
                          }}
                        >
                          {product.scent_type}
                        </p>
                        <Link
                          href={`/products/${product.id}`}
                          style={{ textDecoration: "none" }}
                        >
                          <p
                            style={{
                              fontSize: compact ? 13 : 16,
                              fontWeight: 400,
                              color: t.text,
                              marginBottom: 4,
                              overflow: "hidden",
                              textOverflow: compact ? "ellipsis" : "unset",
                              whiteSpace: compact ? "nowrap" : "normal",
                            }}
                          >
                            {product.name}
                          </p>
                        </Link>
                        {!compact && product.reason && (
                          <p
                            style={{
                              fontFamily: fonts.sans,
                              fontSize: 11,
                              color: t.muted,
                              lineHeight: 1.6,
                              marginBottom: 8,
                            }}
                          >
                            {product.reason}
                          </p>
                        )}
                        <p
                          style={{
                            color: t.gold,
                            fontSize: compact ? 13 : 16,
                            marginBottom: compact ? 8 : 12,
                          }}
                        >
                          {formatPrice(product.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        style={{
                          background: addedIds.has(product.id)
                            ? t.border
                            : t.gold,
                          color: addedIds.has(product.id)
                            ? t.muted
                            : t.dark
                              ? "#0a0a0a"
                              : "#fff",
                          border: "none",
                          cursor: addedIds.has(product.id)
                            ? "default"
                            : "pointer",
                          fontFamily: fonts.sans,
                          fontSize: 9,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          padding: "8px 0",
                          width: "100%",
                          transition: "all 0.2s",
                        }}
                      >
                        {addedIds.has(product.id) ? "✓ Added" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Loading dots */}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div
              style={{
                background: t.card,
                border: `1px solid ${t.border}`,
                padding: "14px 20px",
                display: "flex",
                gap: 6,
                alignItems: "center",
              }}
            >
              {[0, 0.15, 0.3].map((delay, i) => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: t.gold,
                    animation: "bounce 1s ease-in-out infinite",
                    animationDelay: `${delay}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-6px);opacity:1}}`}</style>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: compact ? "12px 16px" : "16px 28px",
          borderTop: `1px solid ${t.border}`,
          background: t.surface,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            placeholder="Ask me anything about fragrance..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && sendMessage(input)
            }
            disabled={loading}
            style={{
              flex: 1,
              background: t.card,
              border: `1px solid ${t.border}`,
              color: t.text,
              fontFamily: fonts.sans,
              fontSize: compact ? 12 : 13,
              padding: compact ? "10px 14px" : "12px 16px",
              outline: "none",
              transition: "border-color 0.2s",
              opacity: loading ? 0.6 : 1,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = t.gold)}
            onBlur={(e) => (e.currentTarget.style.borderColor = t.border)}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim() ? t.border : t.gold,
              color: t.dark ? "#0a0a0a" : "#fff",
              border: "none",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              fontFamily: fonts.sans,
              fontSize: 11,
              letterSpacing: "0.15em",
              padding: compact ? "10px 16px" : "12px 22px",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 9,
            color: t.muted,
            marginTop: 8,
            letterSpacing: "0.08em",
            textAlign: "center",
          }}
        >
          Powered by ab-tech · Based on available inventory
        </p>
      </div>
    </div>
  );
}
