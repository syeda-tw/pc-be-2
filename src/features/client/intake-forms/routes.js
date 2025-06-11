import express from 'express';
import getIntakeFormsHandler from './handlers/getIntakeFormsHandler.js';
import { secureRequestMiddleware } from '../../../common/middlewares/secureRequestMiddleware.js';
import { getIntakeFormsMiddleware } from './middlewares.js';

const router = express.Router();

router.get('/:relationshipId', getIntakeFormsMiddleware, secureRequestMiddleware, getIntakeFormsHandler);

export default router;
