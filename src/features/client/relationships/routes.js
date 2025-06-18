import { Router } from "express";
import getDefaultRelationshipDetailsHandler from "./handlers/getDefaultRelationshipDetailsHandler.js";
import switchDefaultRelationshipHandler from "./handlers/switchDefaultRelationshipHandler.js";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import { validateSwitchDefaultRelationshipMiddleware } from "./middlewares.js";
import getRelationshipsUserHandler from "./handlers/getRelationshipsUserHandler.js";
const routes = Router();

routes.get(
  "/default-relationship-details",
  secureRequestMiddleware,
  getDefaultRelationshipDetailsHandler
);

routes.put(
  "/switch-default",
  validateSwitchDefaultRelationshipMiddleware,
  secureRequestMiddleware,
  switchDefaultRelationshipHandler
);

routes.get("/", secureRequestMiddleware, getRelationshipsUserHandler);
export default routes;
