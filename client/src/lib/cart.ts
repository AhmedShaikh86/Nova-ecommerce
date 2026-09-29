"use client";

import { useSyncExternalStore } from "react";
import type { Category, Product } from "./types";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  category: Category;
  image?: string;
  price: number;
  stock: number;
  quantity: number;
}

const KEY = "nova_cart";
const MAX_PER_ITEM = 20;
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) items = JSON.parse(raw) as CartItem[];
  } catch {
    items = EMPTY;
  }
}

function commit(next: CartItem[]) {
  items = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode) — cart still works for this session.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    loaded = false;
    load();
    listeners.forEach((l) => l());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return items;
}

const clampQty = (qty: number, stock: number) => Math.max(1, Math.min(qty, stock, MAX_PER_ITEM));

export const cart = {
  add(product: Product, quantity = 1) {
    const existing = items.find((i) => i.productId === product._id);
    if (existing) {
      commit(
        items.map((i) =>
          i.productId === product._id
            ? { ...i, stock: product.stock, quantity: clampQty(i.quantity + quantity, product.stock) }
            : i,
        ),
      );
    } else {
      commit([
        ...items,
        {
          productId: product._id,
          slug: product.slug,
          name: product.name,
          category: product.category,
          image: product.images[0],
          price: product.price,
          stock: product.stock,
          quantity: clampQty(quantity, product.stock),
        },
      ]);
    }
  },
  setQuantity(productId: string, quantity: number) {
    commit(
      items.map((i) => (i.productId === productId ? { ...i, quantity: clampQty(quantity, i.stock) } : i)),
    );
  },
  remove(productId: string) {
    commit(items.filter((i) => i.productId !== productId));
  },
  clear() {
    commit(EMPTY);
  },
};

export function useCart() {
  const list = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  const count = list.reduce((n, i) => n + i.quantity, 0);
  const subtotal = list.reduce((n, i) => n + i.price * i.quantity, 0);
  return { items: list, count, subtotal, ...cart };
}
