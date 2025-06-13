import { Router } from "express";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import {
  validateGetRelationshipSessions,
  validateGetSingleFormUploadedByClient,
  validateApproveClientUploadedForm,
  validateGetNotes,
  validateCreateNote,
  validateUpdateNote,
  validateDeleteNote,
} from "./middlewares.js";
import getRelationshipHandler from "./handlers/getRelationshipHandler.js";
import getRelationshipSessionsHandler from "./handlers/getRelationshipSessionsHandler.js";
import getIntakeFormsHandler from "./handlers/getIntakeFormsHandler.js";
import getSingleFormsUploadedByClientHandler from "./handlers/getSingleFormsUploadedByClientHandler.js";
import approveClientUploadedFormHandler from "./handlers/approveClientUploadedFormHandler.js";
import getRelationshipNotesHandler from "./handlers/getRelationshipNotesHandler.js";
import createRelationshipNoteHandler from "./handlers/createRelationshipNoteHandler.js";
import editRelationshipNoteHandler from "./handlers/editRelationshipNoteHandler.js";
import deleteRelationshipNoteHandler from "./handlers/deleteRelationshipNoteHandler.js";

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
router.put(
  "/approve-client-uploaded-form/:relationshipId/:formId",
  secureRequestMiddleware,
  validateApproveClientUploadedForm,
  approveClientUploadedFormHandler
);

// Notes routes
router.get(
  "/:relationshipId/notes",
  secureRequestMiddleware,
  validateGetNotes,
  getRelationshipNotesHandler
);

router.post(
  "/:relationshipId/notes",
  secureRequestMiddleware,
  validateCreateNote,
  createRelationshipNoteHandler
);

router.put(
  "/:relationshipId/notes/:noteId",
  secureRequestMiddleware,
  validateUpdateNote,
  editRelationshipNoteHandler
);

router.delete(
  "/:relationshipId/notes/:noteId",
  secureRequestMiddleware,
  validateDeleteNote,
  deleteRelationshipNoteHandler
);

export default router;
