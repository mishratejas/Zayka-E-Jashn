import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/database.js";
import { app } from "./app.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((err) => {
    logger.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
  process.exit(1);
});
