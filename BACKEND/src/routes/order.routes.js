import express from 'express';
import { createOrder,getAllOrders,updateOrderStatus } from '../controllers/order.controllers.js';
import { verifyChefToken } from '../middlewares/chefAuth.middleware.js';
import { verifyManagerToken } from '../middlewares/managerAuth.middleware.js';
const router = express.Router();
router.post('/',createOrder);
router.get('/',verifyChefToken,getAllOrders);
router.patch('/:id',verifyChefToken,updateOrderStatus);
router.get("/all", verifyManagerToken, getAllOrders);

import { verifyCustomerToken } from '../middlewares/customerAuth.middlewares.js';
import {Order} from '../models/Order.models.js';

router.get("/my", verifyCustomerToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching customer orders:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

export default router;