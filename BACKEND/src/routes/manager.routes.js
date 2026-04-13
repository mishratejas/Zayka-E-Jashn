import express from "express";
import {
  loginManager,
  getManagerDashboard,
  verifyChef,
  getAllUsers,
} from "../controllers/manager.controller.js";
import { verifyManagerJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.post("/login", loginManager);

// ── Protected (manager/admin) ─────────────────────────────────────────────────
router.get("/dashboard", verifyManagerJWT, getManagerDashboard);
router.patch("/chefs/:id/verify", verifyManagerJWT, verifyChef);
router.get("/users", verifyManagerJWT, getAllUsers);

export default router;