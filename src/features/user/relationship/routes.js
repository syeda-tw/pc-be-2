import { Router } from "express";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import {
  validateGetRelationshipSessions,
  validateGetSingleFormUploadedByClient,
} from "./middlewares.js";
import getRelationshipHandler from "./handlers/getRelationshipHandler.js";
import getRelationshipSessionsHandler from "./handlers/getRelationshipSessionsHandler.js";
import getIntakeFormsHandler from "./handlers/getIntakeFormsHandler.js";
import { getSingleFormsUploadedByClientHandler } from "./handlers/getSingleFormsUploadedByClientHandler.js";

const router = Router();

router.get(
  "/sessions",
  secureRequestMiddleware,
  validateGetRelationshipSessions,
  getRelationshipSessionsHandler
);
router.get("/intake-forms", secureRequestMiddleware, getIntakeFormsHandler);
router.get("/:relationshipId", secureRequestMiddleware, getRelationshipHandler);
router.get(
  "/single-form-uploaded-by-client/:formId/:relationshipId/:formUploadedByClientId",
  secureRequestMiddleware,
  validateGetSingleFormUploadedByClient,
  getSingleFormsUploadedByClientHandler
);

export default router;
