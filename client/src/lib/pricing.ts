// Mirrors server/src/config/pricing.ts — used for display only; the server computes the real total.
export const FREE_SHIPPING_THRESHOLD = 100;
export const FLAT_SHIPPING = 9.99;
export const TAX_RATE = 0.05;

const round = (n: number) => Math.round(n * 100) / 100;

export function calculateTotals(itemsPrice: number) {
  const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD || itemsPrice === 0 ? 0 : FLAT_SHIPPING;
  const taxPrice = round(itemsPrice * TAX_RATE);
  return {
    itemsPrice: round(itemsPrice),
    shippingPrice,
    taxPrice,
    totalPrice: round(itemsPrice + shippingPrice + taxPrice),
  };
}
