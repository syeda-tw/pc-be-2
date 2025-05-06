import express from "express";
import {
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
import { verifyRegistrationOtpHandler } from "./handlers/verifyRegisterationOtpHandler.js";
import { loginHandler } from "./handlers/loginHandler.js";
import { requestResetPasswordHandler } from "./handlers/requestResetPasswordHandler.js";

const router = express.Router();

router.post("/register", validateRegisterMiddleware, registerHandler);

router.post(
  "/verify-registration-otp",
  validateVerifyRegistrationOtpMiddleware,
  verifyRegistrationOtpHandler
);

router.post("/login", validateLoginMiddleware, loginHandler);

router.post(
  "/request-reset-password",
  validateRequestResetPasswordMiddleware,
  requestResetPasswordHandler
);

router.post("/reset-password", validateResetPasswordMiddleware, resetPassword);
router.post(
  "/change-password",
  validateChangePasswordMiddleware,
  secureRequestMiddleware,
  changePassword
);

export default router;
