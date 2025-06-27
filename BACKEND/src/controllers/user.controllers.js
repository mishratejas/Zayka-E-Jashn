import { uploadOnCloudinary } from "../utils/cloudinary.js";
import User from "../models/user.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const registerUser = async(req,res,next) =>{
    try{
        const {name,email,password,phone,role} = req.body;
        //check if user already exists

        const existingUser = await User.findOne({email});
        if(existingUser){
            return next(new ApiError(400,"User already exists with this email"));
        }

        const user = await User.create({
            name,
            email,
            password,
            phone,
            role: role || "customer"
        });

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        res.status(201).json(
            new ApiResponse(201,{
                user:{
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                accessToken,
                refreshToken
            },"User registered successfully")
        );
    }
    catch(err){
        console.log("Error during registration:", err);
        next (new ApiError(500,"Registration failed",err));
    }
};

const uploadAvatar = async(req,res,next) => {
    try{
        const localFilePath = req.file?.path;
        if(!localFilePath){
            return next(new ApiError(400,"No image file provided"));
        }
        const result=await uploadOnCloudinary(localFilePath);
        if(!result){
            return next(new ApiError(500,"Upload to Cloudinary failed"));
        }
        const userId = req.user._id;
        await User.findByIdAndUpdate(userId,{avatar:result.secure_url});

        res.status(200).json({
            success:true,
            message:"Avatar uploaded successfully",
            avatarUrl: result.secure_url
        });
    }
    catch(err){
        next(new ApiError(500,"Error uploading avatar",err));
    }
};

const loginUser = async(req,res)=>{
    try{
        const{email,password} = req.body;
        //1. Check kro ki user h ya nhi
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
            message:"Invalid email or password"});
        }
        //2.Check kro ki password match h
        const isMatch = await user.isPasswordCorrect(password);
        if(!isMatch){
            return res.status(401).json({message: "Invalid email or password"});
        }
        //3.Generate Tokens
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        res.status(200).json({
            message:"Login successful",
            user:{
                _id:user._id,
                name:user.name,
                email:user.email,
                role:user.role,
            },
            accessToken,
            refreshToken,
        });
    }
    catch(error){
        console.error("Error during login:",error);
        res.status(500).json({message:"Login failed"});
    }
};

export {
    uploadAvatar,
    registerUser,
    loginUser
};
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const loginWithGoogle = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload(); // name, email, picture
    const { email, name } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: "GOOGLE_AUTH", 
        isGoogleUser: true,
      });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Google login failed" });
  }
};
