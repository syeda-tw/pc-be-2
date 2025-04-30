import express from "express";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import { onboardingStep1Middleware, onboardingStep2Middleware, onboardingStep3Middleware } from "./middlewares.js";
import onboardingStep1Handler from "./handlers/onboardingStep1Handler.js";
import onboardingStep2Handler from "./handlers/onboardingStep2Handler.js";
import onboardingStep3Handler from "./handlers/onboardingStep3Handler.js";
import setupIntentHandler from "./handlers/setupIntentHanlder.js";

const router = express.Router();

router.post("/onboarding-step-1",onboardingStep1Middleware, secureRequestMiddleware, onboardingStep1Handler);
router.post("/onboarding-step-2", onboardingStep2Middleware, secureRequestMiddleware, onboardingStep2Handler);
router.post("/onboarding-step-3", onboardingStep3Middleware, secureRequestMiddleware, onboardingStep3Handler);
router.post("/setup-intent", secureRequestMiddleware, setupIntentHandler);

export default router;
