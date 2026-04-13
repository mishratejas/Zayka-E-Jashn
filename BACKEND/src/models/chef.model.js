import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const chefProfileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    phone: String,
    specialization: {
      type: String,
      enum: ["Indian", "Continental", "Chinese", "Bakery", "Multi-cuisine", "Italian", "Mexican"],
      required: true,
    },
    experience: { type: Number, required: true, min: 0 },
    resume: String,
    bio: { type: String, maxlength: 500 },
    avatar: { type: String, default: "" },
    availability: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalOrders: { type: Number, default: 0 },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

chefProfileSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

chefProfileSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

chefProfileSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: "chef" },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

export default mongoose.model("ChefProfile", chefProfileSchema);
