import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import express from "express";
import {
  validateGetSingleIntakeFormMiddleware,
  validateCreateIntakeFormMiddleware,
  validateDeleteIntakeFormMiddleware,
} from "./middlewares.js";
import multer from "multer";
import { getAllIntakeFormsHandler } from "./handlers/getAllIntakeFormsHandler.js";
import { getSingleIntakeFormHandler } from "./handlers/getSingleIntakeFormHandler.js";
import { createIntakeFormHandler } from "./handlers/createIntakeFormHandler.js";
import { deleteIntakeFormHandler } from "./handlers/deleteIntakeFormHandler.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Get all intake forms
router.get("/", secureRequestMiddleware, getAllIntakeFormsHandler);

// Get a single intake form
router.get(
  "/:id",
  validateGetSingleIntakeFormMiddleware,
  secureRequestMiddleware,
  getSingleIntakeFormHandler
);

// Create an intake form
router.post(
  "/add",
  secureRequestMiddleware,
  upload.single("file"),
  validateCreateIntakeFormMiddleware,
  createIntakeFormHandler
);

// Delete an intake form
router.delete(
  "/:id",
  validateDeleteIntakeFormMiddleware,
  secureRequestMiddleware,
  deleteIntakeFormHandler
);

export default router;
