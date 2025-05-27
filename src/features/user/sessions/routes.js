import express from "express";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import getUserSessionsHandler from "./handlers/getUserSessionsHandler.js";
import { getUserSessionsMiddleware } from "./middlewares.js";

const router = express.Router();

router.get(
  "/:startDate/:endDate",
  getUserSessionsMiddleware,
  secureRequestMiddleware,
  getUserSessionsHandler
);

export default router;
