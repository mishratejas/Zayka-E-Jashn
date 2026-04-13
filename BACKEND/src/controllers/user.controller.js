import User from "../models/user.model.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/helpers.js";
import { uploadOnCloudinary } from "../services/cloudinary.service.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Token helper ─────────────────────────────────────────────────────────────
const generateAndSetTokens = async (user, res) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }); // 15 min
  res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

  return { accessToken, refreshToken };
};

// ─── Register ─────────────────────────────────────────────────────────────────
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "User already exists with this email");

  const user = await User.create({ name, email, password, phone, role: role || "customer" });
  const { accessToken, refreshToken } = await generateAndSetTokens(user, res);

  logger.info(`New user registered: ${email} (${user.role})`);

  res.status(201).json(
    new ApiResponse(
      201,
      {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
        accessToken,
        refreshToken,
      },
      "Registration successful! Welcome to Zayka-E-Jashn 🎉"
    )
  );
});

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid email or password");

  if (user.isGoogleUser && user.password === "GOOGLE_AUTH") {
    throw new ApiError(400, "This account uses Google Sign-In. Please login with Google.");
  }

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  if (!user.isActive) throw new ApiError(403, "Account has been deactivated. Contact support.");

  const { accessToken, refreshToken } = await generateAndSetTokens(user, res);
  logger.info(`User logged in: ${email}`);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone },
        accessToken,
        refreshToken,
      },
      "Login successful"
    )
  );
});

// ─── Google OAuth Login ───────────────────────────────────────────────────────
export const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) throw new ApiError(400, "Google credential is required");

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { email, name, picture } = ticket.getPayload();

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name, email, password: "GOOGLE_AUTH", avatar: picture, isGoogleUser: true });
    logger.info(`New Google user: ${email}`);
  }

  const { accessToken, refreshToken } = await generateAndSetTokens(user, res);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
        accessToken,
        refreshToken,
      },
      "Google login successful"
    )
  );
});

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
});

// ─── Refresh Token ────────────────────────────────────────────────────────────
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) throw new ApiError(401, "Refresh token missing");

  const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findById(decoded._id).select("+refreshToken");

  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is invalid or expired");
  }

  const { accessToken, refreshToken } = await generateAndSetTokens(user, res);

  res.status(200).json(new ApiResponse(200, { accessToken, refreshToken }, "Token refreshed"));
});

// ─── Get Profile ──────────────────────────────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -refreshToken");
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json(new ApiResponse(200, { user }, "Profile fetched"));
});

// ─── Update Profile ───────────────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { name, phone, address } },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  res.status(200).json(new ApiResponse(200, { user }, "Profile updated"));
});

// ─── Upload Avatar ────────────────────────────────────────────────────────────
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file?.path) throw new ApiError(400, "No image file provided");

  const result = await uploadOnCloudinary(req.file.path, "avatars");
  if (!result) throw new ApiError(500, "Image upload failed");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: result.secure_url },
    { new: true }
  ).select("-password");

  res.status(200).json(new ApiResponse(200, { avatarUrl: result.secure_url, user }, "Avatar updated"));
});

// ─── Change Password ──────────────────────────────────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await user.isPasswordCorrect(currentPassword);
  if (!isMatch) throw new ApiError(400, "Current password is incorrect");

  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});
