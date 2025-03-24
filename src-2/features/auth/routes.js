import express from "express";
import { register } from "./controllers.js";
import validateRegister from "./middlewares.js";
const router = express.Router();

router.post("/register", validateRegister, register);
// router.post("/verify-registration-otp", verifyRegistrationOtp);
// router.post("/verify-user-token", (req, res, next) => {
//   verifyUserToken(req, res, next);
// });
// router.post("/login", login);
// router.post("/request-reset-password", requestResetPassword);
// router.post("/reset-password", resetPassword);
// router.post("/change-password", changePassword);

export default router;
