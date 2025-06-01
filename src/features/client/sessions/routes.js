import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import getSessionsHandler from "./handlers/getSessionsHandler.js";
import getUserAvailabilityAndSessionDurationHandler from "./handlers/getUserAvailabilityAndSessionDurationHandler.js";
import getUserFutureSessionsHandler from "./handlers/getUserFutureSessionsHandler.js";
import {
  validateGetSessions,
  validateGetUserAvailabilityAndSessionDuration,
  validateGetUserFutureSessions,
  validateBookSession,
} from "./middlewares.js";
import bookSessionHandler from "./handlers/bookSessionHandler.js";
import express from "express";
const routes = express.Router();

routes.get(
  "/",
  secureRequestMiddleware,
  validateGetSessions,
  getSessionsHandler
);

routes.get(
  "/user-availability-and-session-duration/:relationshipId",
  secureRequestMiddleware,
  validateGetUserAvailabilityAndSessionDuration,
  getUserAvailabilityAndSessionDurationHandler
);

routes.get(
  "/user-future-sessions/:relationshipId",
  secureRequestMiddleware,
  validateGetUserFutureSessions,
  getUserFutureSessionsHandler
);

routes.post(
  "/book-session",
  secureRequestMiddleware,
  validateBookSession,
  bookSessionHandler
);

export default routes;
