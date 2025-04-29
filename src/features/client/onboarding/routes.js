import express from "express";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import { onboardingStep1Middleware, onboardingStep2Middleware, onboardingStep3Middleware } from "./middlewares.js";
import onboardingStep1Handler from "./handlers/onboardingStep1Handler.js";
import onboardingStep2Handler from "./handlers/onboardingStep2Handler.js";
import onboardingStep3Handler from "./handlers/onboardingStep3Handler.js";

const router = express.Router();

router.post("/onboarding-step-1", secureRequestMiddleware, onboardingStep1Middleware, onboardingStep1Handler);
router.post("/onboarding-step-2", secureRequestMiddleware, onboardingStep2Middleware, onboardingStep2Handler);
router.post("/onboarding-step-3", secureRequestMiddleware, onboardingStep3Middleware, onboardingStep3Handler);

export default router;
