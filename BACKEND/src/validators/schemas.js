import { z } from "zod";

// ─── User Validators ──────────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional().or(z.literal("")),
  role: z.enum(["customer", "chef", "manager", "admin"]).default("customer"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

// ─── Order Validators ─────────────────────────────────────────────────────────
export const createOrderSchema = z.object({
  customerName: z.string().min(2, "Customer name required"),
  customerPhone: z.string().optional().or(z.literal("")),
  customerEmail: z.string().email().optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        itemId: z.string(),
        name: z.string(),
        price: z.number().min(0),
        quantity: z.number().min(1).max(20),
        image: z.string().optional().or(z.literal("")),
        category: z.string().optional(),
      })
    )
    .min(1, "At least one item is required"),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  total: z.number().min(0),
  type: z.enum(["dine-in", "takeaway", "delivery"]).default("dine-in"),
  paymentMethod: z.enum(["Cash", "Card", "UPI", "Wallet"]).default("Cash"),
  tableNumber: z.string().optional().or(z.literal("")),
  specialInstructions: z.string().max(300).optional().or(z.literal("")),
  deliveryAddress: z
    .object({
      street: z.string(),
      city: z.string(),
      pincode: z.string(),
    })
    .optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "dispatched",
    "completed",
    "cancelled",
  ]),
});

// ─── Menu Validators ──────────────────────────────────────────────────────────
export const menuItemSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(300).optional().or(z.literal("")),
  price: z.number().min(0),
  category: z.enum(["veg", "nonveg", "italian", "chinese", "beverages", "desserts"]),
  isVeg: z.boolean().default(true),
  preparationTime: z.number().min(1).default(15),
  spiceLevel: z
    .enum(["mild", "medium", "hot", "extra-hot"])
    .default("medium"),
  tags: z.array(z.string()).optional(),
});

// ─── Chef Validators ──────────────────────────────────────────────────────────
export const registerChefSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional().or(z.literal("")),
  specialization: z.enum([
    "Indian",
    "Continental",
    "Chinese",
    "Bakery",
    "Multi-cuisine",
    "Italian",
    "Mexican",
  ]),
  experience: z.coerce.number().min(0).max(50),
  bio: z.string().max(500).optional().or(z.literal("")),
});

// ─── Contact Validators ───────────────────────────────────────────────────────
export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(5).max(100),
  message: z.string().min(10).max(1000),
});

// ─── Review Validators ────────────────────────────────────────────────────────
export const reviewSchema = z.object({
  orderId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional().or(z.literal("")),
  chefId: z.string().optional(),
  menuItemId: z.string().optional(),
});