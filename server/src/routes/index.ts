import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as auth from "../controllers/auth.controller";
import * as products from "../controllers/product.controller";
import * as orders from "../controllers/order.controller";
import { requireAdmin, requireAuth } from "../middleware/auth";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later" },
});

export const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Auth
router.post("/auth/register", authLimiter, auth.register);
router.post("/auth/login", authLimiter, auth.login);
router.post("/auth/refresh", auth.refresh);
router.post("/auth/logout", auth.logout);
router.get("/auth/me", requireAuth, auth.me);
router.patch("/auth/me", requireAuth, auth.updateMe);

// Products (public)
router.get("/products", products.listProducts);
router.get("/products/facets", products.getFacets);
router.get("/products/:slug", products.getProduct);

// Orders (customer)
router.post("/orders", requireAuth, orders.createOrder);
router.get("/orders/mine", requireAuth, orders.myOrders);
router.get("/orders/:id", requireAuth, orders.getOrder);
router.post("/orders/:id/cancel", requireAuth, orders.cancelMyOrder);

// Admin
const admin = Router();
admin.use(requireAuth, requireAdmin);
admin.get("/stats", orders.adminStats);
admin.get("/products/:id", products.getProductById);
admin.post("/products", products.createProduct);
admin.patch("/products/:id", products.updateProduct);
admin.delete("/products/:id", products.deleteProduct);
admin.get("/orders", orders.listAllOrders);
admin.patch("/orders/:id/status", orders.updateOrderStatus);
router.use("/admin", admin);
