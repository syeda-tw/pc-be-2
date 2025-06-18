import express from "express";
import multer from "multer";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import { createClientValidation, createBulkClientsValidation } from "./middleware.js";
import createClientHandler from "./createClientHandler.js";
import createBulkClientsHandler from "./createBulkClientsHandler.js";
import getInvitedClientsHandler from "./getInvitedClientsHandler.js";
import getClientsHandler from "./getClientsHandler.js";
import getArchivedClientsHandler from "./getArchivedClientsHandler.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

router.get("/invited", secureRequestMiddleware, getInvitedClientsHandler);
router.get("/archived", secureRequestMiddleware, getArchivedClientsHandler);
router.get("/", secureRequestMiddleware, getClientsHandler);
router.post(
  "/",
  createClientValidation,
  secureRequestMiddleware,
  createClientHandler
);
router.post(
  "/bulk",
  upload.single("csvFile"),
  createBulkClientsValidation,
  secureRequestMiddleware,
  createBulkClientsHandler
);

export default router;
