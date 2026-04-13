import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import logger from "./utils/logger.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";

// ── Routes ────────────────────────────────────────────────────────────────────
import userRoutes    from "./routes/user.routes.js";
import chefRoutes    from "./routes/chef.routes.js";
import orderRoutes   from "./routes/order.routes.js";
import managerRoutes from "./routes/manager.routes.js";
import adminRoutes   from "./routes/admin.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import chatRoutes    from "./routes/chat.routes.js";
import menuRoutes    from "./routes/menu.routes.js";

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false });
const authLimiter   = rateLimit({ windowMs: 15 * 60 * 1000, max: 20  });
app.use(globalLimiter);

// ── Parsing ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));
app.use(morgan("dev", { stream: { write: (m) => logger.http(m.trim()) } }));

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ success: true, message: "Zayka-E-Jashn API 🍽️", timestamp: new Date().toISOString() }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/v1/users",   authLimiter, userRoutes);
app.use("/api/v1/chefs",   chefRoutes);
app.use("/api/v1/orders",  orderRoutes);
app.use("/api/v1/manager", managerRoutes);
app.use("/api/v1/admin",   adminRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/chat",    chatRoutes);
app.use("/api/v1/menu",    menuRoutes);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export { app };