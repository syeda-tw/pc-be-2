import { Router } from "express";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import { validateGetRelationshipSessions } from "./middlewares.js";
import getRelationshipHandler from "./handlers/getRelationshipHandler.js";
import getRelationshipSessionsHandler from "./handlers/getRelationshipSessionsHandler.js";
const router = Router();

router.get("/sessions", secureRequestMiddleware, validateGetRelationshipSessions, getRelationshipSessionsHandler);

router.get("/:id", secureRequestMiddleware, getRelationshipHandler);



export default router;
