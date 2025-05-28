// routes/userRouter.js
import express from 'express';
import authRoutes from './auth/routes.js';
import onboardingRoutes from "./onboarding/routes.js";
import intakeFormsRoutes from "./intake-forms/routes.js";
import profileSettingsRoutes from "./profile-settings/routes.js";
import clientsRoutes from "./clients/routes.js";
import sessionsRoutes from "./sessions/routes.js";
import relationshipRoutes from "./relationship/routes.js";
const router = express.Router();

// Mount the individual routes
router.use("/auth", authRoutes);
router.use("/onboarding", onboardingRoutes);
router.use("/intake-forms", intakeFormsRoutes);
router.use("/profile-settings", profileSettingsRoutes);
router.use("/clients", clientsRoutes);
router.use("/sessions", sessionsRoutes);
router.use("/relationship", relationshipRoutes);
export { router as userRouter };