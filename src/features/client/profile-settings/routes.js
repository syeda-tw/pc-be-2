import express from "express";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import { validateUpdatePersonalInformationMiddleware, validateChangePasswordMiddleware } from './middlewares.js';
import { updatePersonalInformationHandler } from './handlers/updatePersonalInformationHandler.js';
import changePasswordHandler from './handlers/changePasswordHandler.js';

const router = express.Router();

router.put(
  "/personal-information",
  validateUpdatePersonalInformationMiddleware,
  secureRequestMiddleware,
  updatePersonalInformationHandler
);

router.put(
  "/change-password",
  validateChangePasswordMiddleware,
  secureRequestMiddleware,
  changePasswordHandler
);



export default router; 