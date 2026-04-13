import express from "express";
import { chatWithBot } from "../controllers/chat.controller.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { success: false, message: "Too many chat requests, please slow down." },
});

router.post("/", chatLimiter, chatWithBot);

export default router;