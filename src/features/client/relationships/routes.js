import { Router } from "express";
import getDefaultRelationshipDetailsHandler from "./handlers/getDefaultRelationshipDetailsHandler.js";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import getRelationshipsUserHandler from "./handlers/getRelationshipsUserHandler.js";
const routes = Router();

routes.get(
  "/default-relationship-details",
  secureRequestMiddleware,
  getDefaultRelationshipDetailsHandler
);

routes.get("/", secureRequestMiddleware, getRelationshipsUserHandler);
export default routes;
