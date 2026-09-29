import { Schema, model, type InferSchemaType } from "mongoose";

export const CATEGORIES = [
  "laptops",
  "headphones",
  "keyboards",
  "mice",
  "monitors",
  "accessories",
] as const;

export type Category = (typeof CATEGORIES)[number];

const specSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: { type: [String], default: [] },
    specs: { type: [specSchema], default: [] },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    numReviews: { type: Number, min: 0, default: 0 },
    featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", brand: "text", description: "text" });

export type IProduct = InferSchemaType<typeof productSchema>;
export const Product = model("Product", productSchema);
