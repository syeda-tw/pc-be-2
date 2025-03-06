import {
  onboardingIndividualStep2,
  validateAddress,
  validateUsername,
} from "../controllers/onboardingController";
import checkValidToken from "../middleware/authMiddleware";

import express from "express";
const router = express.Router();
import { onboardingStep1 } from "../controllers/onboardingController";

/**
 * @swagger
 * /onboarding/step1:
 *   post:
 *     summary: Onboarding step 1
 *     tags: [Onboarding]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               exampleField:
 *                 type: string
 *                 description: An example field for step 1
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */

// Route for onboarding step 1
router.post("/onboarding-step-1", checkValidToken, onboardingStep1);

/**
 * @swagger
 * /onboarding/validate-address:
 *   post:
 *     summary: Validate address
 *     tags: [Onboarding]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *                 description: The address to validate
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */

router.post("/validate-address", checkValidToken, validateAddress);

/**
 * @swagger
 * /onboarding/validate-username:
 *   post:
 *     summary: Validate username
 *     tags: [Onboarding]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username to validate
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */

router.post("/validate-username", checkValidToken, validateUsername);

/**
 * @swagger
 * /onboarding/onboarding-individual-step-2:
 *   post:
 *     summary: Onboarding individual step 2
 *     tags: [Onboarding]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               website:
 *                 type: string
 *                 description: The website of the practice
 *               address:
 *                 type: string
 *                 description: The address of the practice
 *               businessName:
 *                 type: string
 *                 description: The business name of the practice
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

router.post(
  "/onboarding-individual-step-2",
  //@ts-ignore
  checkValidToken,
  onboardingIndividualStep2
);


export default router;
