import ChefProfile from "../models/chef.model.js";
import { Order } from "../models/order.model.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/helpers.js";
import { uploadOnCloudinary } from "../services/cloudinary.service.js";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

// ─── Register Chef ────────────────────────────────────────────────────────────
export const registerChef = asyncHandler(async (req, res) => {
  const { name, email, phone, specialization, experience, password, bio } = req.body;

  const existing = await ChefProfile.findOne({ email });
  if (existing) throw new ApiError(409, "Chef with this email already exists");

  let resumeUrl = "";
  if (req.file?.path) {
    if (req.file.mimetype !== "application/pdf") throw new ApiError(400, "Resume must be a PDF");
    const result = await uploadOnCloudinary(req.file.path, "resumes");
    if (!result) throw new ApiError(500, "Resume upload failed");
    resumeUrl = result.secure_url;
  }

  const chef = await ChefProfile.create({
    name, email, phone, specialization,
    experience: Number(experience), password, bio, resume: resumeUrl,
  });

  logger.info(`Chef registered: ${email}`);
  res.status(201).json(new ApiResponse(201, {
    chef: { _id: chef._id, name: chef.name, email: chef.email, specialization: chef.specialization },
  }, "Chef application submitted! Awaiting verification."));
});

// ─── Login Chef ───────────────────────────────────────────────────────────────
export const loginChef = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const chef = await ChefProfile.findOne({ email }).select("+password");
  if (!chef) throw new ApiError(404, "No chef found with this email");

  const isValid = await chef.isPasswordCorrect(password);
  if (!isValid) throw new ApiError(401, "Invalid credentials");

  if (!chef.verified) throw new ApiError(403, "Your account is pending verification by the manager.");

  const accessToken = chef.generateAccessToken();

  const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" };
  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });

  res.status(200).json(new ApiResponse(200, {
    chef: { _id: chef._id, name: chef.name, email: chef.email, specialization: chef.specialization, avatar: chef.avatar },
    accessToken,
  }, "Welcome back, Chef! 👨‍🍳"));
});

// ─── Get Chef Profile ─────────────────────────────────────────────────────────
export const getChefProfile = asyncHandler(async (req, res) => {
  const chef = await ChefProfile.findById(req.chef._id).select("-password");
  if (!chef) throw new ApiError(404, "Chef not found");
  res.status(200).json(new ApiResponse(200, { chef }));
});

// ─── Update Chef Profile ──────────────────────────────────────────────────────
export const updateChefProfile = asyncHandler(async (req, res) => {
  const { bio, availability, phone } = req.body;
  const chef = await ChefProfile.findByIdAndUpdate(
    req.chef._id,
    { $set: { bio, availability, phone } },
    { new: true }
  ).select("-password");
  res.status(200).json(new ApiResponse(200, { chef }, "Profile updated"));
});

// ─── Upload Chef Avatar ───────────────────────────────────────────────────────
export const uploadChefAvatar = asyncHandler(async (req, res) => {
  if (!req.file?.path) throw new ApiError(400, "No image provided");
  const result = await uploadOnCloudinary(req.file.path, "chef-avatars");
  const chef = await ChefProfile.findByIdAndUpdate(req.chef._id, { avatar: result.secure_url }, { new: true });
  res.status(200).json(new ApiResponse(200, { avatarUrl: result.secure_url }, "Avatar updated"));
});

// ─── Get All Chefs (public) ───────────────────────────────────────────────────
export const getAllChefs = asyncHandler(async (req, res) => {
  const { verified, specialization } = req.query;
  const filter = {};
  if (verified !== undefined) filter.verified = verified === "true";
  if (specialization) filter.specialization = specialization;

  const chefs = await ChefProfile.find(filter).select("-password -resume").sort({ rating: -1 });
  res.status(200).json(new ApiResponse(200, { chefs, total: chefs.length }));
});

// ─── Chef Dashboard Stats ─────────────────────────────────────────────────────
export const getChefDashboard = asyncHandler(async (req, res) => {
  const chefId = req.chef._id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayOrders, activeOrders, completedOrders, recentOrders] = await Promise.all([
    Order.countDocuments({ chefId, createdAt: { $gte: today } }),
    Order.countDocuments({ chefId, status: { $in: ["pending", "confirmed", "preparing"] } }),
    Order.countDocuments({ chefId, status: "completed" }),
    Order.find({ chefId }).sort({ createdAt: -1 }).limit(10),
  ]);

  res.status(200).json(new ApiResponse(200, {
    stats: { todayOrders, activeOrders, completedOrders },
    recentOrders,
  }, "Dashboard data fetched"));
});
