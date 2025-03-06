import express from "express";
import multer from "multer";
import { addIntakeForm } from "../controllers/intakeFormsController";
import checkValidToken from "../middleware/authMiddleware";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Store file in memory

/**
 * @swagger
 * /intake-forms/add-intake-form:
 *   post:
 *     summary: Add an intake form
 *     tags: [Intake Forms]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               formFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Intake form added successfully
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

//@ts-ignore
router.post("/add-intake-form", checkValidToken, upload.single("formFile"), addIntakeForm);

export default router;
