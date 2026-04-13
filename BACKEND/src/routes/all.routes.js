// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/routes/order.routes.js
// ─────────────────────────────────────────────────────────────────────────────
import express from "express";
import {
  createOrder, getAllOrders, getMyOrders, getOrderById,
  updateOrderStatus, assignChef, getOrderAnalytics, cancelMyOrder,
} from "../controllers/order.controller.js";
import { verifyJWT, verifyChefJWT, verifyManagerJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createOrderSchema, updateOrderStatusSchema } from "../validators/schemas.js";

const router = express.Router();

// Public — any user (incl. guest) can create an order
router.post("/", validate(createOrderSchema), createOrder);

// Customer's own orders
router.get("/my", verifyJWT, getMyOrders);
router.delete("/:id/cancel", verifyJWT, cancelMyOrder);

// Chef routes
router.get("/", verifyChefJWT, getAllOrders);
router.patch("/:id/status", verifyChefJWT, validate(updateOrderStatusSchema), updateOrderStatus);

// Manager/Admin routes
router.get("/all", verifyManagerJWT, getAllOrders);
router.get("/analytics", verifyManagerJWT, getOrderAnalytics);
router.patch("/:id/assign-chef", verifyManagerJWT, assignChef);

// Shared: get single order by ID
router.get("/:id", getOrderById);

export default router;


// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/routes/chef.routes.js
// ─────────────────────────────────────────────────────────────────────────────
import chefExpress from "express";
import {
  registerChef, loginChef, getChefProfile, updateChefProfile,
  getAllChefs, getChefDashboard, uploadChefAvatar,
} from "../controllers/chef.controller.js";
import { verifyChefJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerChefSchema, loginSchema } from "../validators/schemas.js";
import multer from "multer";

const chefRouter = chefExpress.Router();
const upload = multer({ dest: "public/temp/" });

// Public
chefRouter.get("/", getAllChefs);
chefRouter.post("/register", upload.single("resume"), registerChef);
chefRouter.post("/login", validate(loginSchema), loginChef);

// Protected (chef only)
chefRouter.use(verifyChefJWT);
chefRouter.get("/dashboard", getChefDashboard);
chefRouter.get("/profile", getChefProfile);
chefRouter.patch("/profile", updateChefProfile);
chefRouter.post("/avatar", upload.single("avatar"), uploadChefAvatar);

export { chefRouter as default };


// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/routes/menu.routes.js
// ─────────────────────────────────────────────────────────────────────────────
import menuExpress from "express";
import {
  getMenuItems, getMenuItemById, createMenuItem,
  updateMenuItem, deleteMenuItem, toggleAvailability,
} from "../controllers/menu.controller.js";
import { verifyJWT, verifyManagerJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import multer from "multer";

const menuRouter = menuExpress.Router();
const upload = multer({ dest: "public/temp/" });

// Public
menuRouter.get("/", getMenuItems);
menuRouter.get("/:id", getMenuItemById);

// Admin/Manager only
menuRouter.post("/", verifyManagerJWT, upload.single("image"), createMenuItem);
menuRouter.put("/:id", verifyManagerJWT, upload.single("image"), updateMenuItem);
menuRouter.delete("/:id", verifyManagerJWT, deleteMenuItem);
menuRouter.patch("/:id/toggle", verifyManagerJWT, toggleAvailability);

export { menuRouter as default };


// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/routes/manager.routes.js
// ─────────────────────────────────────────────────────────────────────────────
import managerExpress from "express";
import { loginManager, getManagerDashboard, verifyChef, getAllUsers } from "../controllers/manager.controller.js";
import { verifyManagerJWT } from "../middlewares/auth.middleware.js";

const managerRouter = managerExpress.Router();

managerRouter.post("/login", loginManager);
managerRouter.get("/dashboard", verifyManagerJWT, getManagerDashboard);
managerRouter.patch("/chefs/:id/verify", verifyManagerJWT, verifyChef);
managerRouter.get("/users", verifyManagerJWT, getAllUsers);

export { managerRouter as default };
