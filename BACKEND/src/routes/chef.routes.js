import express from "express";
import multer from "multer";
import {
  registerChef,
  loginChef,
  getChefProfile,
  updateChefProfile,
  getAllChefs,
  getChefDashboard,
  uploadChefAvatar,
} from "../controllers/chef.controller.js";
import { verifyChefJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../validators/schemas.js";

const router = express.Router();
const upload = multer({ dest: "public/temp/" });

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/", getAllChefs);
router.post("/register", upload.single("resume"), registerChef);
router.post("/login", validate(loginSchema), loginChef);

// ── Protected (chef only) ─────────────────────────────────────────────────────
router.use(verifyChefJWT);
router.get("/dashboard", getChefDashboard);
router.get("/profile", getChefProfile);
router.patch("/profile", updateChefProfile);
router.post("/avatar", upload.single("avatar"), uploadChefAvatar);

export default router;