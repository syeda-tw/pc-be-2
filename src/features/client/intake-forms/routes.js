import express from 'express';
import getIntakeFormsHandler from './handlers/getIntakeFormsHandler.js';
import { secureRequestMiddleware } from '../../../common/middlewares/secureRequestMiddleware.js';
import { getIntakeFormsMiddleware, getSingleIntakeFormMiddleware } from './middlewares.js';
import { getSingleIntakeFormHandler } from './handlers/getSingleIntakeFormHandler.js';

const router = express.Router();

// Get all intake forms for a specific relationship
router.get('/all-forms/:relationshipId', getIntakeFormsMiddleware, secureRequestMiddleware, getIntakeFormsHandler);

// Get a specific intake form by its ID
router.get('/single-form/:formId', getSingleIntakeFormMiddleware, secureRequestMiddleware, getSingleIntakeFormHandler);

export default router;
