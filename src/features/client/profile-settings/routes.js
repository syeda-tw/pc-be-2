import express from "express";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import { validateUpdatePersonalInformationMiddleware } from './middlewares.js';
import { updatePersonalInformationHandler } from './handlers/updatePersonalInformationHandler.js';

const router = express.Router();

router.put(
  "/personal-information",
  validateUpdatePersonalInformationMiddleware,
  secureRequestMiddleware,
  updatePersonalInformationHandler
);




export default router; 