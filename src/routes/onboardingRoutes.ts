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
 *     security:
 *       - bearerAuth: []
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

export default router;
