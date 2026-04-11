// app/layout.tsx
// Root layout — wraps the entire app with CartProvider so useCart()
// works on every page including Navbar and CartDrawer.

import type { Metadata } from "next";
import { CartProvider } from "../lib/cartContext";

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
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
