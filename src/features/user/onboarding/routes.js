import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import express from "express";
import {
  validateOnboardingStep1Middleware,
  validateAddressMiddleware,
  validateUsernameMiddleware,
  validateOnboardingIndividualStep2Middleware,
  validateOnboardingCompanyStep2Middleware,
} from "./middlewares.js";
import { onboardingStep1Handler } from "./handlers/onboardingStep1Handler.js";
import { validateAddressHandler } from "./handlers/validateAddressHandler.js";
import { autocompleteAddressHandler } from "./handlers/autocompleteAddressHandler.js";
import { validateUsernameHandler } from "./handlers/validateUsernameHandler.js";
import { onboardingIndividualStep2Handler } from "./handlers/onboardingIndividualStep2Handler.js";
import { onboardingCompanyStep2Handler } from "./handlers/onboardingCompanyStep2Handler.js";


const router = express.Router();

router.post(
  "/onboarding-step-1",
  validateOnboardingStep1Middleware,
  secureRequestMiddleware,
  onboardingStep1Handler
);

router.post(
  "/validate-address",
  validateAddressMiddleware,
  secureRequestMiddleware,
  validateAddressHandler
);

router.post(
  "/autocomplete-address",
  validateAddressMiddleware,
  secureRequestMiddleware,
  autocompleteAddressHandler
);

router.post(
  "/validate-username",
  validateUsernameMiddleware,
  secureRequestMiddleware,
  validateUsernameHandler
);

router.post(
  "/onboarding-individual-step-2",
  validateOnboardingIndividualStep2Middleware,
  secureRequestMiddleware,
  onboardingIndividualStep2Handler
);

router.post(
  "/onboarding-company-step-2",
  validateOnboardingCompanyStep2Middleware,
  secureRequestMiddleware,
  onboardingCompanyStep2Handler
);

export default router;
