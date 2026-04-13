import express from "express";
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  assignChef,
  getOrderAnalytics,
  cancelMyOrder,
} from "../controllers/order.controller.js";
import {
  verifyJWT,
  verifyChefJWT,
  verifyManagerJWT,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createOrderSchema, updateOrderStatusSchema } from "../validators/schemas.js";

const router = express.Router();

// ── Public (guest orders allowed) ─────────────────────────────────────────────
router.post("/", validate(createOrderSchema), createOrder);

// ── Customer ──────────────────────────────────────────────────────────────────
router.get("/my", verifyJWT, getMyOrders);
router.delete("/:id/cancel", verifyJWT, cancelMyOrder);

// ── Manager / Admin ───────────────────────────────────────────────────────────
router.get("/all", verifyManagerJWT, getAllOrders);
router.get("/analytics", verifyManagerJWT, getOrderAnalytics);
router.patch("/:id/assign-chef", verifyManagerJWT, assignChef);

// ── Chef ──────────────────────────────────────────────────────────────────────
router.get("/", verifyChefJWT, getAllOrders);
router.patch("/:id/status", verifyChefJWT, validate(updateOrderStatusSchema), updateOrderStatus);

// ── Shared ────────────────────────────────────────────────────────────────────
router.get("/:id", getOrderById);

export default router;