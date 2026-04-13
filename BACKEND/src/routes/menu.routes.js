import express from "express";
import multer from "multer";
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
} from "../controllers/menu.controller.js";
import { verifyManagerJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();
const upload = multer({ dest: "public/temp/" });

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/", getMenuItems);
router.get("/:id", getMenuItemById);

// ── Manager / Admin ───────────────────────────────────────────────────────────
router.post("/", verifyManagerJWT, upload.single("image"), createMenuItem);
router.put("/:id", verifyManagerJWT, upload.single("image"), updateMenuItem);
router.delete("/:id", verifyManagerJWT, deleteMenuItem);
router.patch("/:id/toggle", verifyManagerJWT, toggleAvailability);

export default router;