import {
  validateAddress,
  validateUsername,
} from "../controllers/onboardingController";
import checkValidToken from "../middleware/authMiddleware";

const express = require("express");
const router = express.Router();
const { onboardingStep1 } = require("../controllers/onboardingController");

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

export default router;
