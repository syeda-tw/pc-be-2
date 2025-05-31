// routes/userRouter.js
import express from "express";
import authRoutes from "./auth/routes.js";
import onboardingRoutes from "./onboarding/routes.js";
import userRoutes from "./users/routes.js";
import profileSettingsRoutes from "./profile-settings/routes.js";
import relationshipRoutes from "./relationships/routes.js";
import sessionRoutes from "./sessions/routes.js";

const router = express.Router();

// Mount the individual routes
router.use("/auth", authRoutes);
router.use("/onboarding", onboardingRoutes);
router.use("/users", userRoutes);
router.use("/profile-settings", profileSettingsRoutes);
router.use("/relationships", relationshipRoutes);
router.use("/sessions", sessionRoutes);

export { router as clientRouter };
