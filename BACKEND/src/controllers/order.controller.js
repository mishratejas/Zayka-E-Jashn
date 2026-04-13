import { Order } from "../models/order.model.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/helpers.js";
import logger from "../utils/logger.js";

// ─── Create Order ─────────────────────────────────────────────────────────────
export const createOrder = asyncHandler(async (req, res) => {
  const {
    customerName, customerPhone, customerEmail,
    items, subtotal, tax, total, type,
    paymentMethod, tableNumber, specialInstructions, deliveryAddress,
  } = req.body;

  // Calculate estimated time based on items
  const estimatedTime = Math.max(15, items.length * 5);

  const order = await Order.create({
    user: req.user?._id || null,
    customerName,
    customerPhone,
    customerEmail,
    items,
    subtotal,
    tax,
    total,
    type,
    paymentMethod,
    tableNumber,
    specialInstructions,
    deliveryAddress,
    estimatedTime,
    statusHistory: [{ status: "pending", changedBy: "system" }],
  });

  logger.info(`New order created: ${order._id} by ${customerName}`);

  res.status(201).json(new ApiResponse(201, { order }, "Order placed successfully! 🍽️"));
});

// ─── Get All Orders (Chef/Manager) ────────────────────────────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, type, startDate, endDate } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate("chefId", "name email"),
    Order.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      orders,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    }, "Orders fetched")
  );
});

// ─── Get Customer's Own Orders ────────────────────────────────────────────────
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Order.countDocuments({ user: req.user._id }),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      orders,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    }, "Your orders fetched")
  );
});

// ─── Get Single Order ─────────────────────────────────────────────────────────
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("chefId", "name email phone");
  if (!order) throw new ApiError(404, "Order not found");
  res.status(200).json(new ApiResponse(200, { order }, "Order fetched"));
});

// ─── Update Order Status ──────────────────────────────────────────────────────
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  // Status transition guard
  const validTransitions = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["preparing", "cancelled"],
    preparing: ["ready"],
    ready: ["dispatched", "completed"],
    dispatched: ["completed"],
    completed: [],
    cancelled: [],
  };

  if (!validTransitions[order.status]?.includes(status)) {
    throw new ApiError(400, `Cannot move order from '${order.status}' to '${status}'`);
  }

  order.status = status;
  order.statusHistory.push({
    status,
    changedBy: req.chef?.name || req.manager?.email || req.user?.name || "system",
  });
  await order.save();

  logger.info(`Order ${order._id} status → ${status}`);
  res.status(200).json(new ApiResponse(200, { order }, `Order ${status}`));
});

// ─── Assign Chef to Order ─────────────────────────────────────────────────────
export const assignChef = asyncHandler(async (req, res) => {
  const { chefId } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { chefId },
    { new: true }
  ).populate("chefId", "name email");
  if (!order) throw new ApiError(404, "Order not found");
  res.status(200).json(new ApiResponse(200, { order }, "Chef assigned"));
});

// ─── Analytics (Manager/Admin) ────────────────────────────────────────────────
export const getOrderAnalytics = asyncHandler(async (req, res) => {
  const { period = "week" } = req.query;
  const now = new Date();
  const periodMap = { today: 1, week: 7, month: 30, year: 365 };
  const days = periodMap[period] || 7;
  const startDate = new Date(now - days * 24 * 60 * 60 * 1000);

  const [
    totalOrders,
    totalRevenue,
    statusBreakdown,
    typeBreakdown,
    dailyRevenue,
    topItems,
  ] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: startDate } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          count: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      summary: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        period,
      },
      statusBreakdown,
      typeBreakdown,
      dailyRevenue,
      topItems,
    }, "Analytics fetched")
  );
});

// ─── Cancel Order (Customer) ──────────────────────────────────────────────────
export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new ApiError(404, "Order not found");

  if (!["pending", "confirmed"].includes(order.status)) {
    throw new ApiError(400, "Order cannot be cancelled at this stage");
  }

  order.status = "cancelled";
  order.statusHistory.push({ status: "cancelled", changedBy: req.user.name });
  await order.save();

  res.status(200).json(new ApiResponse(200, { order }, "Order cancelled"));
});
