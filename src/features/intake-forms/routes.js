import { secureRequestMiddleware } from "../../common/middlewares/secureRequestMiddleware.js";
import express from "express";
import {
  getAllIntakeForms,
  getSingleIntakeForm,
  createIntakeForm,
  deleteIntakeForm,
} from "./controllers.js";
import {
  validateGetSingleIntakeFormMiddleware,
  validateCreateIntakeFormMiddleware,
  validateDeleteIntakeFormMiddleware,
} from "./middlewares.js";
import multer from "multer";
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Get all intake forms
router.get("/", secureRequestMiddleware, getAllIntakeForms);

// Get a single intake form
router.get(
  "/:id",
  validateGetSingleIntakeFormMiddleware,
  secureRequestMiddleware,
  getSingleIntakeForm
);

// Create an intake form
router.post(
  "/add",
  validateCreateIntakeFormMiddleware,
  upload.single("file"),
  secureRequestMiddleware,
  createIntakeForm
);

// Delete an intake form
router.delete(
  "/:id",
  validateDeleteIntakeFormMiddleware,
  secureRequestMiddleware,
  deleteIntakeForm
);

export default router;
