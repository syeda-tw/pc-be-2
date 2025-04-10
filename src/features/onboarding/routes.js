import { secureRequestMiddleware } from "../../common/middlewares/secureRequestMiddleware.js";
import {
  onboardingStep1,
  validateAddress,
  autocompleteAddress,
  validateUsername,
  onboardingIndividualStep2,
  onboardingCompanyStep2
} from "./controller.js";
import express from "express";
import {
  validateOnboardingStep1Middleware,
  validateAddressMiddleware,
  validateUsernameMiddleware,
  validateOnboardingIndividualStep2Middleware,
  validateOnboardingCompanyStep2Middleware
} from "./middlewares.js";
const router = express.Router();

router.post(
  "/onboarding-step-1",
  validateOnboardingStep1Middleware,
  secureRequestMiddleware,
  onboardingStep1
);
router.post(
  "/validate-address",
  validateAddressMiddleware,
  secureRequestMiddleware,
  validateAddress
);

router.post(
  "/autocomplete-address",
  validateAddressMiddleware,
  secureRequestMiddleware,
  autocompleteAddress
);

router.post("/validate-username",
  validateUsernameMiddleware,
  secureRequestMiddleware,
  validateUsername);

router.post(
  "/onboarding-individual-step-2",
  validateOnboardingIndividualStep2Middleware,
  secureRequestMiddleware,
  onboardingIndividualStep2
);

router.post(
  "/onboarding-company-step-2",
  validateOnboardingCompanyStep2Middleware,
  secureRequestMiddleware,
  onboardingCompanyStep2
);

export default router;
