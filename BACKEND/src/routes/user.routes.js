import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadAvatar } from "../controllers/user.controllers.js";
import { Router } from "express";
import {registerUser,loginUser} from "../controllers/user.controllers.js";
import {loginWithGoogle} from "../controllers/user.controllers.js";

const router = express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/google-login",loginWithGoogle);
export default router;
