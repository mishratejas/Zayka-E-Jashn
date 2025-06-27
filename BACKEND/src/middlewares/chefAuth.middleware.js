import jwt from "jsonwebtoken";
import ChefProfile from "../models/ChefProfile.models.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyChefToken=async(req,res,next)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer")){
        return res.status(401).json({success:false, message:"Unauthorized : No token provided"})
    }

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const chef = await ChefProfile.findById(decoded.id).select("-password");
        if(!chef) return res.status(404).json({message : "Chef not found"});

        req.chef = chef;
        next();
    }
    catch(error){
        return res.status(401).json({message: "Invalid or expired token"})
    }
};