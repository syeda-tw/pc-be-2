import express from "express";
import {
  register,
  verifyRegistrationOtp,
  login,
  requestResetPassword,
  resetPassword,
  changePassword,
  verifyUserToken
} from "./controllers.js";
import {
  validateRegisterMiddleware,
  validateVerifyRegistrationOtpMiddleware,
  validateVerifyUserTokenMiddleware,
  validateLoginMiddleware,
  validateRequestResetPasswordMiddleware,
  validateResetPasswordMiddleware,
  validateChangePasswordMiddleware,
} from "./middlewares.js";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";

const router = express.Router();
router.post("/register", validateRegisterMiddleware, register);
router.post(
  "/verify-registration-otp",
  validateVerifyRegistrationOtpMiddleware,
  verifyRegistrationOtp
);
router.post(
  "/verify-user-token",
  validateVerifyUserTokenMiddleware,
  secureRequestMiddleware,
  verifyUserToken
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
