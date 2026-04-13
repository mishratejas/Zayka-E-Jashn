import { MenuItem } from "../models/menu.model.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/helpers.js";
import { uploadOnCloudinary } from "../services/cloudinary.service.js";

// ─── Get All Menu Items (public) ──────────────────────────────────────────────
export const getMenuItems = asyncHandler(async (req, res) => {
  const { category, search, available, featured, sort = "name", page = 1, limit = 50 } = req.query;

  const filter = {};
  if (category && category !== "all") filter.category = category;
  if (available !== undefined) filter.isAvailable = available === "true";
  if (featured === "true") filter.isFeatured = true;
  if (search) filter.$text = { $search: search };

  const sortMap = { name: { name: 1 }, price_asc: { price: 1 }, price_desc: { price: -1 }, rating: { rating: -1 } };
  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    MenuItem.find(filter).sort(sortMap[sort] || { name: 1 }).skip(skip).limit(Number(limit)),
    MenuItem.countDocuments(filter),
  ]);

  res.status(200).json(new ApiResponse(200, {
    items,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  }));
});

// ─── Get Single Item ──────────────────────────────────────────────────────────
export const getMenuItemById = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) throw new ApiError(404, "Menu item not found");
  res.status(200).json(new ApiResponse(200, { item }));
});

// ─── Create Menu Item (Admin/Manager) ─────────────────────────────────────────
export const createMenuItem = asyncHandler(async (req, res) => {
  let imageUrl = "";
  if (req.file?.path) {
    const result = await uploadOnCloudinary(req.file.path, "menu");
    imageUrl = result?.secure_url || "";
  }

  const item = await MenuItem.create({ ...req.body, image: imageUrl });
  res.status(201).json(new ApiResponse(201, { item }, "Menu item created"));
});

// ─── Update Menu Item ─────────────────────────────────────────────────────────
export const updateMenuItem = asyncHandler(async (req, res) => {
  let updateData = { ...req.body };
  if (req.file?.path) {
    const result = await uploadOnCloudinary(req.file.path, "menu");
    updateData.image = result?.secure_url;
  }

  const item = await MenuItem.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true });
  if (!item) throw new ApiError(404, "Menu item not found");
  res.status(200).json(new ApiResponse(200, { item }, "Menu item updated"));
});

// ─── Delete Menu Item ─────────────────────────────────────────────────────────
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) throw new ApiError(404, "Menu item not found");
  res.status(200).json(new ApiResponse(200, {}, "Menu item deleted"));
});

// ─── Toggle Availability ──────────────────────────────────────────────────────
export const toggleAvailability = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) throw new ApiError(404, "Menu item not found");
  item.isAvailable = !item.isAvailable;
  await item.save();
  res.status(200).json(new ApiResponse(200, { item }, `Item ${item.isAvailable ? "enabled" : "disabled"}`));
});
