// app/layout.tsx
// Root layout — wraps the entire app with CartProvider.
// AiChatBubble is rendered here so it appears on every page.

import type { Metadata } from "next";
import { CartProvider } from "../lib/cartContext";
import AiChatBubble from "../components/AiChatBubble";

export const metadata: Metadata = {
  title: "ScentAI — Find Your Signature Scent",
  description:
    "AI-powered fragrance discovery. Find the scent that tells your story.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <CartProvider>
          {children}
          <AiChatBubble />
        </CartProvider>
      </body>
    </html>
  );
}
