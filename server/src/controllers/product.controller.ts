import type { Request, Response } from "express";
import { z } from "zod";
import type { QueryFilter } from "mongoose";
import { CATEGORIES, Product, type IProduct } from "../models/Product";
import { AppError } from "../utils/AppError";
import { slugify } from "../utils/slugify";

const SORTS = {
  newest: { createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  rating: { rating: -1, numReviews: -1 },
  name: { name: 1 },
} as const;

type SortKey = keyof typeof SORTS;

const listQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.enum(CATEGORIES).optional(),
  brand: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.enum(["true", "false"]).optional(),
  featured: z.enum(["true", "false"]).optional(),
  sort: z.enum(Object.keys(SORTS) as [SortKey, ...SortKey[]]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

const specSchema = z.object({ label: z.string().trim().min(1), value: z.string().trim().min(1) });

const productInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().optional(),
  brand: z.string().trim().min(1),
  category: z.enum(CATEGORIES),
  description: z.string().trim().min(10),
  price: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0),
  images: z.array(z.url()).default([]),
  specs: z.array(specSchema).default([]),
  featured: z.boolean().default(false),
});

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listProducts(req: Request, res: Response) {
  const query = listQuerySchema.parse(req.query);
  const filter: QueryFilter<IProduct> = {};

  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q), "i");
    filter.$or = [{ name: rx }, { brand: rx }, { description: rx }];
  }
  if (query.category) filter.category = query.category;
  if (query.brand) filter.brand = { $in: query.brand.split(",").map((b) => b.trim()) };
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {
      ...(query.minPrice !== undefined && { $gte: query.minPrice }),
      ...(query.maxPrice !== undefined && { $lte: query.maxPrice }),
    };
  }
  if (query.inStock === "true") filter.stock = { $gt: 0 };
  if (query.featured === "true") filter.featured = true;

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    Product.find(filter).sort(SORTS[query.sort]).skip(skip).limit(query.limit).lean(),
    Product.countDocuments(filter),
  ]);

  res.json({
    items,
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  });
}

export async function getFacets(_req: Request, res: Response) {
  const [brands, priceRange, categoryCounts] = await Promise.all([
    Product.distinct("brand"),
    Product.aggregate<{ min: number; max: number }>([
      { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } },
    ]),
    Product.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);

  res.json({
    categories: CATEGORIES.map((c) => ({
      slug: c,
      count: categoryCounts.find((x) => x._id === c)?.count ?? 0,
    })),
    brands: (brands as string[]).sort(),
    price: { min: priceRange[0]?.min ?? 0, max: priceRange[0]?.max ?? 0 },
  });
}

export async function getProduct(req: Request, res: Response) {
  const product = await Product.findOne({ slug: String(req.params.slug) }).lean();
  if (!product) throw new AppError(404, "Product not found");

  const related = await Product.find({ category: product.category, _id: { $ne: product._id } })
    .sort({ rating: -1 })
    .limit(4)
    .lean();

  res.json({ product, related });
}

export async function getProductById(req: Request, res: Response) {
  const product = await Product.findById(String(req.params.id)).lean();
  if (!product) throw new AppError(404, "Product not found");
  res.json({ product });
}

async function uniqueSlug(base: string, excludeId?: string) {
  const root = slugify(base) || "product";
  let slug = root;
  let n = 1;
  while (await Product.exists({ slug, ...(excludeId && { _id: { $ne: excludeId } }) })) {
    slug = `${root}-${++n}`;
  }
  return slug;
}

export async function createProduct(req: Request, res: Response) {
  const data = productInputSchema.parse(req.body);
  const slug = await uniqueSlug(data.slug || data.name);
  const product = await Product.create({
    ...data,
    compareAtPrice: data.compareAtPrice ?? undefined,
    slug,
  });
  res.status(201).json({ product });
}

export async function updateProduct(req: Request, res: Response) {
  const id = String(req.params.id);
  const data = productInputSchema.partial().parse(req.body);
  const product = await Product.findById(id);
  if (!product) throw new AppError(404, "Product not found");

  const { slug, compareAtPrice, ...rest } = data;
  if (slug || (rest.name && rest.name !== product.name)) {
    product.slug = await uniqueSlug(slug || rest.name || product.name, id);
  }
  product.set(rest);
  if (compareAtPrice !== undefined) product.set("compareAtPrice", compareAtPrice ?? undefined);

  await product.save();
  res.json({ product });
}

export async function deleteProduct(req: Request, res: Response) {
  const product = await Product.findByIdAndDelete(String(req.params.id));
  if (!product) throw new AppError(404, "Product not found");
  res.status(204).end();
}
