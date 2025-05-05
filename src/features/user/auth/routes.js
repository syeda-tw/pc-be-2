import express from "express";
import {
  verifyRegistrationOtp,
  login,
  requestResetPassword,
  resetPassword,
  changePassword,
} from "./controllers.js";
import {
  validateRegisterMiddleware,
  validateVerifyRegistrationOtpMiddleware,
  validateLoginMiddleware,
  validateRequestResetPasswordMiddleware,
  validateResetPasswordMiddleware,
  validateChangePasswordMiddleware,
} from "./middlewares.js";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import { registerHandler } from "./handlers/registerHandler.js";

const router = express.Router();
router.post("/register", validateRegisterMiddleware, registerHandler);
router.post(
  "/verify-registration-otp",
  validateVerifyRegistrationOtpMiddleware,
  verifyRegistrationOtp
);
router.post("/login", validateLoginMiddleware, login);
router.post(
  "/request-reset-password",
  validateRequestResetPasswordMiddleware,
  requestResetPassword
);
router.post("/reset-password", validateResetPasswordMiddleware, resetPassword);
router.post(
  "/change-password",
  validateChangePasswordMiddleware,
  secureRequestMiddleware,
  changePassword
);

export default router;
