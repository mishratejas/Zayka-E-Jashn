import express from 'express';
import { loginManager } from '../controllers/manager.controllers.js';

const router = express.Router();
router.post('/login',loginManager);

export default router;