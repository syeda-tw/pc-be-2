import checkValidToken from "../middleware/authMiddleware.js";
import {
  onboardingStep1,
  validateAddress,
  validateUsername,
  onboardingIndividualStep2,
  onboardingCompanyStep2,
} from "../controllers/onboardingController.js";
import express from "express";
const router = express.Router();

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
//@ts-ignore
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
//@ts-ignore
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
//@ts-ignore
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
  checkValidToken,
  onboardingIndividualStep2
);

/**
 * @swagger
 * /onboarding/onboarding-company-step-2:
 *   post:
 *     summary: Onboarding company step 2
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
 *               businessName:
 *                 type: string
 *                 description: The business name of the practice
 *               members:
 *                 type: string
 *                 description: The members of the practice
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

router.post(
  "/onboarding-company-step-2",
  checkValidToken,
  onboardingCompanyStep2
);

export default router;
