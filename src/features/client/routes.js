// routes/userRouter.js
import express from 'express';
import authRoutes from './auth/routes.js';
import onboardingRoutes from './onboarding/routes.js';
import userRoutes from './users/routes.js';
const router = express.Router();

// Mount the individual routes 
router.use('/auth', authRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/users', userRoutes);


export { router as clientRouter };