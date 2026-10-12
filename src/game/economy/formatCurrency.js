const numberFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 20 });

// Show the authoritative balance without K/M/B rounding at purchase boundaries.
export function formatCurrency(value) {
  const amount = Number(value);
  return numberFormat.format(Number.isFinite(amount) ? Math.max(0, amount) : 0);
}
