// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/routes/user.routes.js
// ─────────────────────────────────────────────────────────────────────────────
import express from "express";
import {
  registerUser, loginUser, googleLogin, logoutUser,
  refreshAccessToken, getProfile, updateProfile, uploadAvatar, changePassword,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/schemas.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/google-login", googleLogin);
router.post("/refresh-token", refreshAccessToken);

// Protected routes
router.use(verifyJWT);
router.post("/logout", logoutUser);
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.post("/avatar", upload.single("avatar"), uploadAvatar);
router.patch("/change-password", changePassword);

export default router;