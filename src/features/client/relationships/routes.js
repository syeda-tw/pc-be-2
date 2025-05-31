import { Router } from "express";
import getDefaultRelationshipDetailsHandler from "./handlers/getDefaultRelationshipDetailsHandler.js";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
const routes = Router();

routes.get(
  "/default-relationship-details",
  secureRequestMiddleware,
  getDefaultRelationshipDetailsHandler
);

export default routes;
