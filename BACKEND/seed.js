import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";

// ── Models ────────────────────────────────────────────────────────────────────
import User from "./src/models/user.model.js";
import ChefProfile from "./src/models/chef.model.js";
import { MenuItem } from "./src/models/menu.model.js";
import { Order } from "./src/models/order.model.js";

const DB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "ZaykaDB";

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────────────────────────────────────

const USERS = [
  {
    name: "Tejas Mishra",
    email: "tejasmishra040907@gmail.com",
    password: "123456",
    phone: "+91 98765 43210",
    role: "customer",
  },
  {
    name: "Admin Zayka",
    email: "admin@zayka.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Priya Sharma",
    email: "priya@example.com",
    password: "123456",
    phone: "+91 91234 56789",
    role: "customer",
  },
  {
    name: "Rohit Verma",
    email: "rohit@example.com",
    password: "123456",
    phone: "+91 98001 12233",
    role: "customer",
  },
];

const CHEFS = [
  {
    name: "Chef Arjun Kapoor",
    email: "arjun@zayka.com",
    password: "chef123",
    phone: "+91 97001 11111",
    specialization: "Indian",
    experience: 8,
    bio: "Specializing in authentic North Indian cuisine with a modern twist. Trained in Delhi and Lucknow.",
    verified: true,
    availability: true,
    rating: 4.8,
  },
  {
    name: "Chef Meera Nair",
    email: "meera@zayka.com",
    password: "chef123",
    phone: "+91 97002 22222",
    specialization: "Continental",
    experience: 6,
    bio: "Expert in Continental and fusion cuisine. Passionate about bringing global flavors to Allahabad.",
    verified: true,
    availability: true,
    rating: 4.6,
  },
  {
    name: "Chef Wang Li",
    email: "wang@zayka.com",
    password: "chef123",
    phone: "+91 97003 33333",
    specialization: "Chinese",
    experience: 10,
    bio: "Authentic Chinese cuisine specialist. Master of dim sum, noodles, and wok-fired dishes.",
    verified: true,
    availability: false,
    rating: 4.7,
  },
  {
    name: "Chef Sunita Devi",
    email: "sunita@zayka.com",
    password: "chef123",
    phone: "+91 97004 44444",
    specialization: "Bakery",
    experience: 5,
    bio: "Pastry chef and baker with expertise in Indian sweets and continental desserts.",
    verified: false,
    availability: true,
    rating: 0,
  },
];

const MENU_ITEMS = [
  // ── Veg ──────────────────────────────────────────────────────────────────
  {
    name: "Raj Kachori",
    description: "Crispy hollow puri filled with spiced potatoes, chutneys, yogurt and sev. A Allahabad street food classic.",
    price: 120,
    category: "veg",
    isVeg: true,
    isFeatured: true,
    preparationTime: 20,
    spiceLevel: "medium",
    calories: 380,
    tags: ["street food", "popular", "chaat"],
    rating: 4.8,
    totalRatings: 120,
    isAvailable: true,
  },
  {
    name: "Kadhai Paneer",
    description: "Fresh cottage cheese cooked with bell peppers, tomatoes and aromatic kadhai spices.",
    price: 280,
    category: "veg",
    isVeg: true,
    isFeatured: true,
    preparationTime: 25,
    spiceLevel: "medium",
    calories: 420,
    tags: ["paneer", "main course", "bestseller"],
    rating: 4.7,
    totalRatings: 95,
    isAvailable: true,
  },
  {
    name: "Dal Makhani",
    description: "Slow-cooked black lentils simmered overnight in tomato gravy, butter and cream.",
    price: 220,
    category: "veg",
    isVeg: true,
    isFeatured: false,
    preparationTime: 30,
    spiceLevel: "mild",
    calories: 350,
    tags: ["dal", "main course", "comfort food"],
    rating: 4.6,
    totalRatings: 80,
    isAvailable: true,
  },
  {
    name: "Paneer Butter Masala",
    description: "Velvety tomato-cashew gravy with tender paneer cubes. Rich, creamy and aromatic.",
    price: 290,
    category: "veg",
    isVeg: true,
    isFeatured: false,
    preparationTime: 25,
    spiceLevel: "mild",
    calories: 460,
    tags: ["paneer", "creamy", "popular"],
    rating: 4.5,
    totalRatings: 70,
    isAvailable: true,
  },
  {
    name: "Veg Biryani",
    description: "Fragrant basmati rice layered with seasonal vegetables and saffron. Served with raita.",
    price: 240,
    category: "veg",
    isVeg: true,
    isFeatured: false,
    preparationTime: 35,
    spiceLevel: "medium",
    calories: 520,
    tags: ["rice", "biryani", "wholesome"],
    rating: 4.4,
    totalRatings: 60,
    isAvailable: true,
  },
  {
    name: "Aloo Gobi",
    description: "Dry-cooked potato and cauliflower with cumin, turmeric and ginger. A homestyle classic.",
    price: 180,
    category: "veg",
    isVeg: true,
    preparationTime: 20,
    spiceLevel: "mild",
    calories: 280,
    tags: ["dry curry", "everyday"],
    rating: 4.2,
    totalRatings: 45,
    isAvailable: true,
  },

  // ── Non-Veg ───────────────────────────────────────────────────────────────
  {
    name: "Hyderabadi Biryani",
    description: "Slow-cooked dum biryani with tender chicken, saffron-infused rice and caramelized onions.",
    price: 380,
    category: "nonveg",
    isVeg: false,
    isFeatured: true,
    preparationTime: 40,
    spiceLevel: "hot",
    calories: 680,
    tags: ["biryani", "chicken", "bestseller", "dum"],
    rating: 4.9,
    totalRatings: 210,
    isAvailable: true,
  },
  {
    name: "Chicken Kebab",
    description: "Juicy minced chicken kebabs marinated in spices and grilled over charcoal. Served with mint chutney.",
    price: 320,
    category: "nonveg",
    isVeg: false,
    isFeatured: true,
    preparationTime: 30,
    spiceLevel: "medium",
    calories: 520,
    tags: ["kebab", "grilled", "chicken", "starter"],
    rating: 4.7,
    totalRatings: 150,
    isAvailable: true,
  },
  {
    name: "Butter Chicken",
    description: "Tender chicken pieces in a rich, creamy tomato-butter sauce. The most loved Indian dish worldwide.",
    price: 340,
    category: "nonveg",
    isVeg: false,
    isFeatured: false,
    preparationTime: 30,
    spiceLevel: "mild",
    calories: 580,
    tags: ["chicken", "creamy", "popular", "main course"],
    rating: 4.8,
    totalRatings: 180,
    isAvailable: true,
  },
  {
    name: "Mutton Rogan Josh",
    description: "Slow-cooked Kashmiri mutton curry with whole spices, yogurt and a beautiful red gravy.",
    price: 420,
    category: "nonveg",
    isVeg: false,
    isFeatured: false,
    preparationTime: 50,
    spiceLevel: "hot",
    calories: 620,
    tags: ["mutton", "kashmiri", "slow cooked"],
    rating: 4.6,
    totalRatings: 85,
    isAvailable: true,
  },
  {
    name: "Fish Curry",
    description: "Fresh river fish in a tangy, spicy mustard-coconut gravy. Served with steamed rice.",
    price: 360,
    category: "nonveg",
    isVeg: false,
    preparationTime: 30,
    spiceLevel: "hot",
    calories: 480,
    tags: ["fish", "seafood", "spicy"],
    rating: 4.4,
    totalRatings: 55,
    isAvailable: false,
  },

  // ── Italian ───────────────────────────────────────────────────────────────
  {
    name: "Margherita Pizza",
    description: "Classic hand-tossed pizza with San Marzano tomato sauce, fresh mozzarella and basil.",
    price: 280,
    category: "italian",
    isVeg: true,
    isFeatured: false,
    preparationTime: 20,
    spiceLevel: "mild",
    calories: 640,
    tags: ["pizza", "classic", "italian"],
    rating: 4.5,
    totalRatings: 90,
    isAvailable: true,
  },
  {
    name: "Chicken Pasta Arrabiata",
    description: "Penne pasta in a spicy tomato sauce with grilled chicken, garlic and fresh herbs.",
    price: 320,
    category: "italian",
    isVeg: false,
    preparationTime: 20,
    spiceLevel: "medium",
    calories: 560,
    tags: ["pasta", "chicken", "spicy"],
    rating: 4.3,
    totalRatings: 65,
    isAvailable: true,
  },

  // ── Chinese ───────────────────────────────────────────────────────────────
  {
    name: "Veg Hakka Noodles",
    description: "Stir-fried noodles with colourful vegetables in soy and chilli sauce. Indo-Chinese street style.",
    price: 180,
    category: "chinese",
    isVeg: true,
    isFeatured: false,
    preparationTime: 15,
    spiceLevel: "medium",
    calories: 420,
    tags: ["noodles", "stir-fry", "popular"],
    rating: 4.4,
    totalRatings: 110,
    isAvailable: true,
  },
  {
    name: "Chicken Manchurian",
    description: "Crispy chicken balls tossed in tangy Manchurian sauce with spring onions and ginger.",
    price: 260,
    category: "chinese",
    isVeg: false,
    isFeatured: false,
    preparationTime: 20,
    spiceLevel: "medium",
    calories: 480,
    tags: ["manchurian", "chicken", "indo-chinese"],
    rating: 4.5,
    totalRatings: 95,
    isAvailable: true,
  },
  {
    name: "Fried Rice",
    description: "Wok-tossed basmati rice with eggs, vegetables and soy sauce. Light yet satisfying.",
    price: 200,
    category: "chinese",
    isVeg: false,
    preparationTime: 15,
    spiceLevel: "mild",
    calories: 460,
    tags: ["rice", "egg", "quick"],
    rating: 4.3,
    totalRatings: 75,
    isAvailable: true,
  },

  // ── Beverages ─────────────────────────────────────────────────────────────
  {
    name: "Cold Coffee",
    description: "Chilled blended coffee with milk, ice cream and a hint of chocolate. Perfectly refreshing.",
    price: 120,
    category: "beverages",
    isVeg: true,
    isFeatured: false,
    preparationTime: 5,
    spiceLevel: "mild",
    calories: 220,
    tags: ["coffee", "cold", "refreshing"],
    rating: 4.6,
    totalRatings: 130,
    isAvailable: true,
  },
  {
    name: "Mango Lassi",
    description: "Thick, creamy yogurt blended with Alphonso mango pulp and a pinch of cardamom.",
    price: 100,
    category: "beverages",
    isVeg: true,
    isFeatured: false,
    preparationTime: 5,
    spiceLevel: "mild",
    calories: 180,
    tags: ["lassi", "mango", "yogurt", "summer"],
    rating: 4.7,
    totalRatings: 140,
    isAvailable: true,
  },
  {
    name: "Masala Chai",
    description: "Traditional Indian spiced tea brewed with ginger, cardamom, cloves and cinnamon.",
    price: 60,
    category: "beverages",
    isVeg: true,
    preparationTime: 5,
    spiceLevel: "mild",
    calories: 80,
    tags: ["tea", "spiced", "hot"],
    rating: 4.5,
    totalRatings: 200,
    isAvailable: true,
  },
  {
    name: "Fresh Lime Soda",
    description: "Chilled soda with freshly squeezed lime, black salt and mint. Sweet or salted.",
    price: 80,
    category: "beverages",
    isVeg: true,
    preparationTime: 3,
    spiceLevel: "mild",
    calories: 60,
    tags: ["lime", "soda", "refreshing"],
    rating: 4.4,
    totalRatings: 85,
    isAvailable: true,
  },

  // ── Desserts ──────────────────────────────────────────────────────────────
  {
    name: "Gulab Jamun",
    description: "Soft milk-solid dumplings soaked in rose-flavoured sugar syrup. Served warm.",
    price: 100,
    category: "desserts",
    isVeg: true,
    isFeatured: true,
    preparationTime: 10,
    spiceLevel: "mild",
    calories: 340,
    tags: ["sweet", "traditional", "popular"],
    rating: 4.9,
    totalRatings: 190,
    isAvailable: true,
  },
  {
    name: "Rasmalai",
    description: "Soft cottage cheese patties soaked in chilled, saffron-infused sweetened milk.",
    price: 140,
    category: "desserts",
    isVeg: true,
    isFeatured: false,
    preparationTime: 10,
    spiceLevel: "mild",
    calories: 280,
    tags: ["sweet", "chilled", "festive"],
    rating: 4.8,
    totalRatings: 110,
    isAvailable: true,
  },
  {
    name: "Chocolate Pastry",
    description: "Rich, moist chocolate sponge layered with chocolate ganache and fresh cream.",
    price: 160,
    category: "desserts",
    isVeg: true,
    preparationTime: 5,
    spiceLevel: "mild",
    calories: 420,
    tags: ["chocolate", "cake", "western"],
    rating: 4.5,
    totalRatings: 75,
    isAvailable: true,
  },
  {
    name: "Kulfi",
    description: "Traditional Indian ice cream made with condensed milk, flavoured with pistachio and cardamom.",
    price: 120,
    category: "desserts",
    isVeg: true,
    preparationTime: 2,
    spiceLevel: "mild",
    calories: 260,
    tags: ["ice cream", "traditional", "summer"],
    rating: 4.6,
    totalRatings: 95,
    isAvailable: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(DB_URI, { dbName: DB_NAME });
    console.log(`\n✅ Connected to MongoDB → ${DB_NAME}\n`);

    // ── Clear existing data ────────────────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      ChefProfile.deleteMany({}),
      MenuItem.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log("🗑️  Cleared existing data\n");

    // ── Seed Users ─────────────────────────────────────────────────────────
    const createdUsers = [];
    for (const u of USERS) {
      const hashed = await bcrypt.hash(u.password, 12);
      const user = await User.create({ ...u, password: hashed });
      createdUsers.push(user);
      console.log(`👤 User:  ${u.name.padEnd(22)} ${u.email.padEnd(38)} [${u.role}]  pass: ${u.password}`);
    }

    // ── Seed Chefs ─────────────────────────────────────────────────────────
    console.log("");
    const createdChefs = [];
    for (const c of CHEFS) {
      const hashed = await bcrypt.hash(c.password, 12);
      const chef = await ChefProfile.create({ ...c, password: hashed });
      createdChefs.push(chef);
      console.log(`👨‍🍳 Chef:  ${c.name.padEnd(22)} ${c.email.padEnd(28)} [${c.verified ? "verified  " : "pending   "}]  pass: ${c.password}`);
    }

    // ── Seed Menu Items ────────────────────────────────────────────────────
    console.log("");
    const createdMenuItems = await MenuItem.insertMany(MENU_ITEMS);
    const categoryCount = MENU_ITEMS.reduce((acc, i) => { acc[i.category] = (acc[i.category] || 0) + 1; return acc; }, {});
    console.log(`🍽️  Menu:  ${createdMenuItems.length} items seeded`);
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`          ${cat.padEnd(12)} → ${count} items`);
    });

    // ── Seed Sample Orders ─────────────────────────────────────────────────
    console.log("");
    const customer = createdUsers.find((u) => u.role === "customer");
    const chef     = createdChefs.find((c) => c.verified);
    const items    = createdMenuItems.slice(0, 4);

    const sampleOrders = [
      {
        user: customer._id,
        chefId: chef._id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        items: [
          { itemId: items[0]._id.toString(), name: items[0].name, price: items[0].price, quantity: 2, image: "" },
          { itemId: items[1]._id.toString(), name: items[1].name, price: items[1].price, quantity: 1, image: "" },
        ],
        subtotal: items[0].price * 2 + items[1].price,
        tax:      Math.round((items[0].price * 2 + items[1].price) * 0.05),
        total:    Math.round((items[0].price * 2 + items[1].price) * 1.05),
        type: "dine-in",
        tableNumber: "T3",
        paymentMethod: "UPI",
        paymentStatus: "paid",
        status: "completed",
        specialInstructions: "Less spicy please",
        estimatedTime: 25,
        statusHistory: [
          { status: "pending",   changedBy: "system" },
          { status: "confirmed", changedBy: "Chef Arjun Kapoor" },
          { status: "preparing", changedBy: "Chef Arjun Kapoor" },
          { status: "ready",     changedBy: "Chef Arjun Kapoor" },
          { status: "completed", changedBy: "Manager" },
        ],
      },
      {
        user: customer._id,
        chefId: chef._id,
        customerName: customer.name,
        customerEmail: customer.email,
        items: [
          { itemId: items[2]._id.toString(), name: items[2].name, price: items[2].price, quantity: 1, image: "" },
          { itemId: items[3]._id.toString(), name: items[3].name, price: items[3].price, quantity: 2, image: "" },
        ],
        subtotal: items[2].price + items[3].price * 2,
        tax:      Math.round((items[2].price + items[3].price * 2) * 0.05),
        total:    Math.round((items[2].price + items[3].price * 2) * 1.05),
        type: "takeaway",
        paymentMethod: "Cash",
        paymentStatus: "pending",
        status: "preparing",
        estimatedTime: 20,
        statusHistory: [
          { status: "pending",   changedBy: "system" },
          { status: "confirmed", changedBy: "Chef Arjun Kapoor" },
          { status: "preparing", changedBy: "Chef Arjun Kapoor" },
        ],
      },
      {
        customerName: "Walk-in Guest",
        customerPhone: "+91 90000 00001",
        items: [
          { itemId: items[0]._id.toString(), name: items[0].name, price: items[0].price, quantity: 1, image: "" },
        ],
        subtotal: items[0].price,
        tax:      Math.round(items[0].price * 0.05),
        total:    Math.round(items[0].price * 1.05),
        type: "dine-in",
        tableNumber: "T7",
        paymentMethod: "Cash",
        paymentStatus: "pending",
        status: "pending",
        estimatedTime: 15,
        statusHistory: [{ status: "pending", changedBy: "system" }],
      },
    ];

    const createdOrders = await Order.insertMany(sampleOrders);
    console.log(`📋 Orders: ${createdOrders.length} sample orders seeded (completed / preparing / pending)`);

    // ── Summary ────────────────────────────────────────────────────────────
    console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                    🍽️  ZAYKA-E-JASHN SEED COMPLETE                   ║
╠══════════════════════════════════════════════════════════════════════╣
║  CUSTOMERS                                                           ║
║  ─────────────────────────────────────────────────────────────────  ║
║  📧 tejasmishra040907@gmail.com        🔑 123456                    ║
║  📧 priya@example.com                  🔑 123456                    ║
║  📧 rohit@example.com                  🔑 123456                    ║
║                                                                      ║
║  ADMIN                                                               ║
║  ─────────────────────────────────────────────────────────────────  ║
║  📧 admin@zayka.com                    🔑 admin123                  ║
║                                                                      ║
║  CHEFS  (login at /chef/login)                                       ║
║  ─────────────────────────────────────────────────────────────────  ║
║  📧 arjun@zayka.com    ✅ verified     🔑 chef123                   ║
║  📧 meera@zayka.com    ✅ verified     🔑 chef123                   ║
║  📧 wang@zayka.com     ✅ verified     🔑 chef123                   ║
║  📧 sunita@zayka.com   ⏳ pending     🔑 chef123                   ║
║                                                                      ║
║  MANAGER  (login at /manager/login)                                  ║
║  ─────────────────────────────────────────────────────────────────  ║
║  📧 manager@zayka.com                  🔑 manager123                ║
║     (credentials from .env)                                          ║
║                                                                      ║
║  MENU: ${String(createdMenuItems.length).padEnd(2)} items  |  ORDERS: ${String(createdOrders.length).padEnd(2)} sample orders              ║
╚══════════════════════════════════════════════════════════════════════╝
`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seed();