import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
//import { uploadChefResume } from "../controllers/chef.controllers.js";
import multer from "multer";
import { registerChef,loginChef } from "../controllers/chef.controllers.js";

const router = express.Router();

router.post("/register",upload.single("resume"),registerChef);
router.post("/login",loginChef);

import { verifyChefToken } from "../middlewares/chefAuth.middleware.js";
router.get("/me",verifyChefToken,(req , res)=>{
    res.status(200).json({
        success:true,
        chef: req.chef
    });
})
export default router;