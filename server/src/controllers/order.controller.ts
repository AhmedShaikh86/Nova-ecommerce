import type { Request, Response } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { Order, ORDER_STATUSES } from "../models/Order";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { calculateTotals } from "../config/pricing";

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().refine((id) => Types.ObjectId.isValid(id), "Invalid product id"),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "Cart is empty"),
  shippingAddress: z.object({
    fullName: z.string().trim().min(2),
    phone: z.string().trim().min(7).max(20),
    address: z.string().trim().min(5),
    city: z.string().trim().min(2),
    postalCode: z.string().trim().min(3).max(12),
    country: z.string().trim().min(2),
  }),
  paymentMethod: z.enum(["cod", "card"]),
});

const listQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const updateStatusSchema = z.object({ status: z.enum(ORDER_STATUSES) });

async function restoreStock(items: { product: Types.ObjectId | string; quantity: number }[]) {
  await Promise.all(
    items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.quantity } })),
  );
}

export async function createOrder(req: Request, res: Response) {
  const data = createOrderSchema.parse(req.body);

  // Merge duplicate lines so stock checks are accurate.
  const merged = new Map<string, number>();
  for (const i of data.items) merged.set(i.productId, (merged.get(i.productId) ?? 0) + i.quantity);

  const products = await Product.find({ _id: { $in: [...merged.keys()] } }).lean();
  if (products.length !== merged.size) throw new AppError(400, "Some products no longer exist");

  // Reserve stock atomically; roll back on any failure.
  const reserved: { product: string; quantity: number }[] = [];
  for (const [productId, quantity] of merged) {
    const updated = await Product.updateOne(
      { _id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
    );
    if (updated.modifiedCount === 0) {
      await restoreStock(reserved);
      const name = products.find((p) => String(p._id) === productId)?.name ?? "An item";
      throw new AppError(409, `${name} doesn't have enough stock`);
    }
    reserved.push({ product: productId, quantity });
  }

  const items = products.map((p) => ({
    product: p._id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    image: p.images[0],
    price: p.price,
    quantity: merged.get(String(p._id))!,
  }));

  const totals = calculateTotals(items.reduce((sum, i) => sum + i.price * i.quantity, 0));

  try {
    // Card payments are simulated for the demo and marked paid immediately.
    const isPaid = data.paymentMethod === "card";
    const order = await Order.create({
      user: req.user!.id,
      items,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      ...totals,
      status: isPaid ? "processing" : "pending",
      isPaid,
      paidAt: isPaid ? new Date() : undefined,
    });
    res.status(201).json({ order });
  } catch (err) {
    await restoreStock(reserved);
    throw err;
  }
}

export async function myOrders(req: Request, res: Response) {
  const orders = await Order.find({ user: req.user!.id }).sort({ createdAt: -1 }).lean();
  res.json({ orders });
}

export async function getOrder(req: Request, res: Response) {
  const order = await Order.findById(String(req.params.id)).populate("user", "name email").lean();
  if (!order) throw new AppError(404, "Order not found");

  const ownerId = String((order.user as unknown as { _id: Types.ObjectId })._id);
  if (req.user!.role !== "admin" && ownerId !== req.user!.id) {
    throw new AppError(404, "Order not found");
  }
  res.json({ order });
}

export async function cancelMyOrder(req: Request, res: Response) {
  const order = await Order.findOne({ _id: String(req.params.id), user: req.user!.id });
  if (!order) throw new AppError(404, "Order not found");
  if (order.status !== "pending") {
    throw new AppError(400, "Only pending orders can be cancelled");
  }
  order.status = "cancelled";
  await order.save();
  await restoreStock(order.items);
  res.json({ order });
}

// ---------- Admin ----------

export async function listAllOrders(req: Request, res: Response) {
  const query = listQuerySchema.parse(req.query);
  const filter = query.status ? { status: query.status } : {};
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
    Order.countDocuments(filter),
  ]);
  res.json({
    orders,
    page: query.page,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  });
}

export async function updateOrderStatus(req: Request, res: Response) {
  const { status } = updateStatusSchema.parse(req.body);
  const order = await Order.findById(String(req.params.id));
  if (!order) throw new AppError(404, "Order not found");
  if (order.status === "cancelled") throw new AppError(400, "Cancelled orders cannot be changed");

  order.status = status;
  if (status === "delivered") {
    order.deliveredAt = new Date();
    // Cash on delivery is collected on delivery.
    if (!order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
    }
  }
  await order.save();
  if (status === "cancelled") await restoreStock(order.items);

  res.json({ order });
}

export async function adminStats(_req: Request, res: Response) {
  const [orderCount, productCount, customerCount, revenueAgg, byStatus, recentOrders, lowStock] =
    await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: "customer" }),
      Order.aggregate<{ total: number }>([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Order.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(5).lean(),
      Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(5).lean(),
    ]);

  res.json({
    orderCount,
    productCount,
    customerCount,
    revenue: revenueAgg[0]?.total ?? 0,
    ordersByStatus: Object.fromEntries(ORDER_STATUSES.map((s) => [s, byStatus.find((b) => b._id === s)?.count ?? 0])),
    recentOrders,
    lowStock,
  });
}
