// routes/userRouter.js
import express from 'express';
import authRoutes from './auth/routes.js';
const router = express.Router();

// Mount the individual routes 
router.use('/auth', authRoutes);

export { router as clientRouter };