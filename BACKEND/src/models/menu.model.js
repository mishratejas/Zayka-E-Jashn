import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 300 },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ["veg", "nonveg", "italian", "chinese", "beverages", "desserts"],
      required: true,
    },
    image: { type: String, default: "" },
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isVeg: { type: Boolean, default: true },
    preparationTime: { type: Number, default: 15 }, // minutes
    calories: Number,
    tags: [String],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    spiceLevel: { type: String, enum: ["mild", "medium", "hot", "extra-hot"], default: "medium" },
    allergens: [String],
  },
  { timestamps: true }
);

menuItemSchema.index({ category: 1, isAvailable: 1 });
menuItemSchema.index({ name: "text", description: "text" });

export const MenuItem = mongoose.model("MenuItem", menuItemSchema);
