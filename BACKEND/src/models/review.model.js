import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    chef: { type: mongoose.Schema.Types.ObjectId, ref: "ChefProfile" },
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
    isVerified: { type: Boolean, default: false }, // verified purchase
  },
  { timestamps: true }
);

reviewSchema.index({ menuItem: 1 });
reviewSchema.index({ chef: 1 });

export const Review = mongoose.model("Review", reviewSchema);
