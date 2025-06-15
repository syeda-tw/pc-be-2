import express from "express";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import { createClientValidation } from "./middleware.js";
import createClientHandler from "./createClientHandler.js";
import getInvitedClientsHandler from "./getInvitedClientsHandler.js";
import getClientsHandler from "./getClientsHandler.js";
import getArchivedClientsHandler from "./getArchivedClientsHandler.js";

const router = express.Router();

router.get("/invited", secureRequestMiddleware, getInvitedClientsHandler);
router.get("/archived", secureRequestMiddleware, getArchivedClientsHandler);
router.get("/", secureRequestMiddleware, getClientsHandler);
router.post(
  "/",
  createClientValidation,
  secureRequestMiddleware,
  createClientHandler
);

export default router;
