import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import ChefProfile from "../models/ChefProfile.models.js"
import User from "../models/user.models.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

const generateAccessAndRefreshTokens = async(userId)=>{
    try{
        const user=await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});

        return {accessToken,refreshToken};
    }
    catch(error){
        throw new ApiError(500,"Something went wrong while generating tokens");
    }
};
const registerChef = async (req, res) => {
  try {
    const { name, email, phone, specialization, experience, password } = req.body;
    const resumeLocalPath = req.file?.path;

    if (!resumeLocalPath) {
      throw new ApiError(400, "Resume file is required");
    }
    if (req.file.mimetype !== 'application/pdf'){
        throw new ApiError(400, "Only PDF files are allowed.");
    }
    // Check if chef already exists (in ChefProfile, not User)
    const existingChef = await ChefProfile.findOne({ email });
    if (existingChef) {
      throw new ApiError(409, "Chef with this email already exists");
    }

    // Upload resume to Cloudinary
    const resume = await uploadOnCloudinary(resumeLocalPath);
    if (!resume) {
      throw new ApiError(400, "Error uploading resume");
    }
    console.log("Cloudinary resume object:", resume)
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create chef profile
    const chefProfile = await ChefProfile.create({
      name,
      email,
      phone,
      specialization,
      experience,
      password: hashedPassword,
      resume: resume.secure_url
    });

    return res.status(201).json({
      chefProfile,
      message: "Chef registered successfully"
    });
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Chef registration failed");
  }
};
const loginChef = async (req, res) => {
  try {
    const { email, password } = req.body;

    const chef = await ChefProfile.findOne({ email });
    if (!chef) {
      throw new ApiError(404, "Chef not found");
    }

    const isPasswordValid = await bcrypt.compare(password, chef.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    // You can use JWT here if needed
    const token = jwt.sign({ id: chef._id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });

    return res.status(200).json({
      accessToken: token,
      chef,
      message: "Chef logged in successfully"
    });
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Chef login failed");
  }
};
export const getAllChefs = async (req, res) => {
  try {
    const chefs = await ChefProfile.find({});
    res.status(200).json({ success: true, chefs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {registerChef,loginChef};