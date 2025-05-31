import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import getSessionsHandler from "./handlers/getSessionsHandler.js";
import getUserAvailabilityHandler from "./handlers/getUserAvailabilityHandler.js";
import {
  validateGetSessions,
  validateGetUserAvailability,
} from "./middlewares.js";
import express from "express";
const routes = express.Router();

routes.get(
  "/",
  secureRequestMiddleware,
  validateGetSessions,
  getSessionsHandler
);

routes.get(
  "/user-availability/:relationshipId",
  secureRequestMiddleware,
  validateGetUserAvailability,
  getUserAvailabilityHandler
);

export default routes;
