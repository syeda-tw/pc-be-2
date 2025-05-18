import express from "express";
import registerStep1Handler from "./handlers/registerStep1Handler.js";
import {
  validateRegisterStep1Middleware,
  validateOtpVerificationMiddleware,
} from "./middlewares.js";
import { otpVerificationHandler } from "./handlers/otpVerificationHandler.js";

const router = express.Router();

router.post(
  "/register-step-1",
  validateRegisterStep1Middleware,
  registerStep1Handler
);
router.post(
  "/otp-verification",
  validateOtpVerificationMiddleware,
  otpVerificationHandler
);

export default router;
