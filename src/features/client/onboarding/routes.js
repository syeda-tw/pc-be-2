import express from "express";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import {
  onboardingStep1Middleware,
  onboardingStep2Middleware,
  bookFirstAppointmentMiddleware,
} from "./middlewares.js";
import onboardingStep1Handler from "./handlers/onboardingStep1Handler.js";
import onboardingStep2Handler from "./handlers/onboardingStep2Handler.js";
import setupIntentHandler from "./handlers/setupIntentHanlder.js";
import getRelationshipsUserHandler from "./handlers/getRelationshipsUserHandler.js";
import activateSingleRelationshipAutomaticallyHandler from "./handlers/activateSingleRelationshipAutomaticallyHandler.js";
import bookFirstAppointmentHandler from "./handlers/bookFirstAppointmentHandler.js";
import getUserFutureSessionsHandler from './handlers/getUserFutureSessionsHandler.js';

const router = express.Router();

router.post(
  "/onboarding-step-1",
  onboardingStep1Middleware,
  secureRequestMiddleware,
  onboardingStep1Handler
);
router.post(
  "/onboarding-step-2",
  onboardingStep2Middleware,
  secureRequestMiddleware,
  onboardingStep2Handler
);

router.post("/setup-intent", secureRequestMiddleware, setupIntentHandler);
router.get(
  "/relationships-user",
  secureRequestMiddleware,
  getRelationshipsUserHandler
);

router.post('/book-first-appointment',
  bookFirstAppointmentMiddleware,
  secureRequestMiddleware,
  bookFirstAppointmentHandler
);

router.post(
  "/activate-single-relationship-automatically",
  secureRequestMiddleware,
  activateSingleRelationshipAutomaticallyHandler
);

router.get(
  "/user-future-sessions/:id",
  secureRequestMiddleware,
  getUserFutureSessionsHandler
);

export default router;
