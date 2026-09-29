const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export const formatPrice = (value: number) => currency.format(value);

export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const shortId = (id: string) => `#${id.slice(-8).toUpperCase()}`;
