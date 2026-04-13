import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  image: String,
  category: String,
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // allow guest orders
    },
    chefId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChefProfile",
    },
    customerName: { type: String, required: true },
    customerPhone: String,
    customerEmail: String,
    items: [orderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ["dine-in", "takeaway", "delivery"],
      default: "dine-in",
    },
    deliveryAddress: {
      street: String,
      city: String,
      pincode: String,
    },
    tableNumber: String,
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "ready", "dispatched", "completed", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI", "Wallet"],
      default: "Cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    specialInstructions: { type: String, maxlength: 300 },
    estimatedTime: Number, // minutes
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: String,
      },
    ],
  },
  { timestamps: true }
);

// Index for performance
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });

export const Order = mongoose.model("Order", orderSchema);
