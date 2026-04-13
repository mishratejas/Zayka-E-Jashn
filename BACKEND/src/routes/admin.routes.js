import express from "express";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import User from "../models/user.model.js";
import { ApiResponse, asyncHandler } from "../utils/helpers.js";

const router = express.Router();

// All admin routes require JWT + admin role
router.use(verifyJWT, authorizeRoles("admin"));

// Get all users
router.get("/users", asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];
  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).select("-password -refreshToken").skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);
  res.status(200).json(new ApiResponse(200, {
    users,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  }));
}));

// Toggle user active status
router.patch("/users/:id/toggle", asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new Error("User not found");
  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  res.status(200).json(new ApiResponse(200, { isActive: user.isActive }, `User ${user.isActive ? "activated" : "deactivated"}`));
}));

export default router;