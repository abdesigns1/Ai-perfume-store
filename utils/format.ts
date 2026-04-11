// utils/format.ts
// Shared formatting helpers used across the app.

export const formatPrice = (amount: number): string =>
  "₦" + amount.toLocaleString("en-NG");
