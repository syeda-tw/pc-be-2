import express from "express";
import getIntakeFormsHandler from "./handlers/getIntakeFormsHandler.js";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import {
  getIntakeFormsMiddleware,
  getSingleIntakeFormMiddleware,
  validateCreateIntakeFormMiddleware,
  getSingleFormUploadedByClientMiddleware,
} from "./middlewares.js";
import { getSingleIntakeFormHandler } from "./handlers/getSingleIntakeFormHandler.js";
import { createIntakeFormHandler } from "./handlers/createIntakeFormHandler.js";
import { getSingleFormUploadedByClientHandler } from "./handlers/getSingleFormUploadedByClientHandler.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
// Get all intake forms for a specific relationship
router.get(
  "/all-forms/:relationshipId",
  getIntakeFormsMiddleware,
  secureRequestMiddleware,
  getIntakeFormsHandler
);

// Get a specific intake form by its ID
router.get(
  "/single-form/:formId",
  getSingleIntakeFormMiddleware,
  secureRequestMiddleware,
  getSingleIntakeFormHandler
);

router.get(
  "/single-form-uploaded-by-client/:formId/:relationshipId/:formUploadedByClientId",
  getSingleFormUploadedByClientMiddleware,
  secureRequestMiddleware,
  getSingleFormUploadedByClientHandler
);


// Create an intake form
router.post(
  "/add",
  secureRequestMiddleware,
  upload.single("file"),
  validateCreateIntakeFormMiddleware,
  createIntakeFormHandler
);

export default router;
