// routes/userRouter.js
import express from "express";
import authRoutes from "./auth/routes.js";
import onboardingRoutes from "./onboarding/routes.js";
import profileSettingsRoutes from "./profile-settings/routes.js";
import relationshipRoutes from "./relationships/routes.js";
import sessionRoutes from "./sessions/routes.js";
import intakeFormsRoutes from "./intake-forms/routes.js";

const router = express.Router();

// Mount the individual routes
router.use("/auth", authRoutes);
router.use("/onboarding", onboardingRoutes);
router.use("/profile-settings", profileSettingsRoutes);
router.use("/relationships", relationshipRoutes);
router.use("/sessions", sessionRoutes);
router.use("/intake-forms", intakeFormsRoutes);

export { router as clientRouter };
