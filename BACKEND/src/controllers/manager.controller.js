import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ChefProfile from "../models/chef.model.js";
import { Order } from "../models/order.model.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/helpers.js";

// ─── Manager Login (credential-based) ────────────────────────────────────────
export const loginManager = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (email !== process.env.MANAGER_EMAIL || password !== process.env.MANAGER_PASSWORD) {
    throw new ApiError(401, "Invalid manager credentials");
  }

  const token = jwt.sign(
    { role: "manager", email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );

  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json(new ApiResponse(200, { user: { role: "manager", email }, accessToken: token }, "Manager logged in"));
});

// ─── Manager Dashboard ────────────────────────────────────────────────────────
export const getManagerDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalOrders, todayOrders, pendingOrders,
    totalRevenue, todayRevenue,
    totalCustomers, totalChefs, unverifiedChefs,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.countDocuments({ status: { $in: ["pending", "confirmed", "preparing"] } }),
    Order.aggregate([{ $match: { status: { $ne: "cancelled" } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
    Order.aggregate([{ $match: { createdAt: { $gte: today }, status: { $ne: "cancelled" } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
    User.countDocuments({ role: "customer" }),
    ChefProfile.countDocuments(),
    ChefProfile.countDocuments({ verified: false }),
  ]);

  res.status(200).json(new ApiResponse(200, {
    stats: {
      totalOrders, todayOrders, pendingOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayRevenue: todayRevenue[0]?.total || 0,
      totalCustomers, totalChefs, unverifiedChefs,
    },
  }, "Manager dashboard fetched"));
});

// ─── Verify Chef ──────────────────────────────────────────────────────────────
export const verifyChef = asyncHandler(async (req, res) => {
  const { verified } = req.body;
  const chef = await ChefProfile.findByIdAndUpdate(
    req.params.id,
    { verified: Boolean(verified) },
    { new: true }
  ).select("-password");
  if (!chef) throw new ApiError(404, "Chef not found");
  res.status(200).json(new ApiResponse(200, { chef }, `Chef ${verified ? "verified" : "unverified"}`));
});

// ─── Get All Users ────────────────────────────────────────────────────────────
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).select("-password -refreshToken").skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  res.status(200).json(new ApiResponse(200, { users, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } }));
});
