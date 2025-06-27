import express from 'express';
import { createOrder,getAllOrders,updateOrderStatus } from '../controllers/order.controllers.js';
import { verifyChefToken } from '../middlewares/chefAuth.middleware.js';

const router = express.Router();
router.post('/',verifyChefToken,createOrder);
router.get('/',verifyChefToken,getAllOrders);
router.patch('/:id',verifyChefToken,updateOrderStatus);

export default router;