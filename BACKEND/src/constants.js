import dotenv from 'dotenv';
dotenv.config();

export const DB_NAME = process.env.DB_NAME;
export const ORDER_STATUS = {
  PENDING: "pending",
  PREPARING: "preparing",
  READY: "ready",
  DELIVERED: "delivered",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const PAYMENT_METHODS = {
  CASH: "Cash",
  CARD: "Card",
  UPI: "UPI",
  WALLET: "Wallet",
};

export const ORDER_TYPES = {
  ON_TABLE: "onTable",
  DELIVERY: "delivery",
  TRAIN: "train",
};