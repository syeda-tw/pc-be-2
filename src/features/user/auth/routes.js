import express from "express";
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
import { resetPasswordHandler } from "./handlers/resetPasswordHandler.js";
import { changePasswordHandler } from "./handlers/changePasswordHandler.js";

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

router.post("/reset-password", validateResetPasswordMiddleware, resetPasswordHandler);

router.post(
  "/change-password",
  validateChangePasswordMiddleware,
  secureRequestMiddleware,
  changePasswordHandler
);

export default router;
