import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ChefProfile from "../models/chef.model.js";
import { ApiError } from "../utils/helpers.js";
import { asyncHandler } from "../utils/helpers.js";

// ─── Verify any JWT user (customer/admin) ─────────────────────────────────────
export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) throw new ApiError(401, "Unauthorized – no token provided");

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const user = await User.findById(decoded._id).select("-password -refreshToken");
  if (!user) throw new ApiError(401, "Invalid access token");

  req.user = user;
  next();
});

// ─── Role guard ───────────────────────────────────────────────────────────────
export const authorizeRoles = (...roles) =>
  asyncHandler((req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `Role '${req.user.role}' is not allowed`);
    }
    next();
  });

// ─── Chef JWT ─────────────────────────────────────────────────────────────────
export const verifyChefJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) throw new ApiError(401, "Unauthorized – no token");

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const chef = await ChefProfile.findById(decoded.id).select("-password");
  if (!chef) throw new ApiError(401, "Invalid chef token");

  req.chef = chef;
  next();
});

// ─── Manager JWT ──────────────────────────────────────────────────────────────
export const verifyManagerJWT = (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) throw new ApiError(401, "Unauthorized");

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (decoded.role !== "manager" && decoded.role !== "admin") {
      throw new ApiError(403, "Manager access required");
    }
    req.manager = decoded;
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
};
