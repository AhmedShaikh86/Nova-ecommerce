export const CATEGORIES = [
  "laptops",
  "headphones",
  "keyboards",
  "mice",
  "monitors",
  "accessories",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type SortKey = "newest" | "price-asc" | "price-desc" | "rating" | "name";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  createdAt: string;
}

export interface Spec {
  label: string;
  value: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  category: Category;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images: string[];
  specs: Spec[];
  rating: number;
  numReviews: number;
  featured: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Facets {
  categories: { slug: Category; count: number }[];
  brands: string[];
  price: { min: number; max: number };
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  product: string;
  name: string;
  slug: string;
  category: Category;
  image?: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  user: string | Pick<User, "_id" | "name" | "email">;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: "cod" | "card";
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  status: OrderStatus;
  isPaid: boolean;
  paidAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface AdminStats {
  orderCount: number;
  productCount: number;
  customerCount: number;
  revenue: number;
  ordersByStatus: Record<OrderStatus, number>;
  recentOrders: Order[];
  lowStock: Product[];
}
