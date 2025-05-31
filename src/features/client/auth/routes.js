import express from "express";
import registerStep1Handler from "./handlers/registerStep1Handler.js";
import {
  validateRegisterStep1Middleware,
  validateOtpVerificationMiddleware,
  validateRequestLoginOtpMiddleware,
  validateLoginOtpVerificationMiddleware,
} from "./middlewares.js";
import { otpVerificationHandler } from "./handlers/otpVerificationHandler.js";
import requestLoginOtpHandler from "./handlers/requestLoginOtpHandler.js";
import loginOtpVerificationHandler from "./handlers/loginOtpVerificationHandler.js";

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

router.post(
  "/request-login-otp",
  validateRequestLoginOtpMiddleware,
  requestLoginOtpHandler
);

router.post(
  "/login-otp-verification",
  validateLoginOtpVerificationMiddleware,
  loginOtpVerificationHandler
);

export default router;
