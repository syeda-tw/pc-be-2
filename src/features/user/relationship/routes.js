import { Router } from "express";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import {
  validateGetRelationshipSessions,
  validateGetSingleFormUploadedByClient,
  validateApproveClientUploadedForm,
  validateRejectClientUploadedForm,
  validateGetNotes,
  validateCreateNote,
  validateUpdateNote,
  validateDeleteNote,
  validateGetRelationshipTimeline,
} from "./middlewares.js";
import getRelationshipHandler from "./handlers/getRelationshipHandler.js";
import getRelationshipSessionsHandler from "./handlers/getRelationshipSessionsHandler.js";
import getIntakeFormsHandler from "./handlers/intakeForms/getIntakeFormsHandler.js";
import getSingleFormsUploadedByClientHandler from "./handlers/intakeForms/getSingleFormsUploadedByClientHandler.js";
import approveClientUploadedFormHandler from "./handlers/intakeForms/approveClientUploadedFormHandler.js";
import rejectClientUploadedFormHandler from "./handlers/intakeForms/rejectClientUploadedFormHandler.js";
import getRelationshipNotesHandler from "./handlers/notes/getRelationshipNotesHandler.js";
import createRelationshipNoteHandler from "./handlers/notes/createRelationshipNoteHandler.js";
import editRelationshipNoteHandler from "./handlers/notes/editRelationshipNoteHandler.js";
import deleteRelationshipNoteHandler from "./handlers/notes/deleteRelationshipNoteHandler.js";
import getRelationshipTimelineHandler from "./handlers/timeline/getRelationshipTimelineHandler.js";

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
  "/single-form-uploaded-by-client/:relationshipId/:userIntakeFormId/:formUploadedByClientId",
  secureRequestMiddleware,
  validateGetSingleFormUploadedByClient,
  getSingleFormsUploadedByClientHandler
);
router.put(
  "/approve-client-uploaded-form/:relationshipId/:userIntakeFormId",
  secureRequestMiddleware,
  validateApproveClientUploadedForm,
  approveClientUploadedFormHandler
);

router.put(
  "/reject-client-uploaded-form/:relationshipId/:userIntakeFormId",
  secureRequestMiddleware,
  validateRejectClientUploadedForm,
  rejectClientUploadedFormHandler
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

router.get(
  "/:relationshipId/timeline",
  secureRequestMiddleware,
  validateGetRelationshipTimeline,
  getRelationshipTimelineHandler
);

export default router;
