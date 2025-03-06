import express from "express";
import { addIntakeForm } from "../controllers/intakeFormsController";
import checkValidToken from "../middleware/authMiddleware";

const router = express.Router();
/**
 * @swagger
 * /intake-forms/add-intake-form:
 *   post:
 *     summary: Add an intake form
 *     tags: [Intake Forms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               formName:
 *                 type: string
 *               formData:
 *                 type: string
 *     responses:
 *       200:
 *         description: Intake form added successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/add-intake-form", checkValidToken, addIntakeForm);

export default router;
