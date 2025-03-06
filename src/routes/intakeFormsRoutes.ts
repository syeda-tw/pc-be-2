import express from "express";
import multer from "multer";
import {
  addIntakeForm,
  getIntakeForms,
  getSingleIntakeForm,
} from "../controllers/intakeFormsController";
import checkValidToken from "../middleware/authMiddleware";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Store file in memory

/**
 * @swagger
 * /intake-forms/add:
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
 *               formName:
 *                 type: string
 *                 description: Name of the form
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

router.post(
  "/add",
  //@ts-ignore
  checkValidToken,
  upload.single("formFile"),
  addIntakeForm
);

/**
 * @swagger
 * /intake-forms:
 *   get:
 *     summary: Get all forms for the authenticated user
 *     tags: [Intake Forms]
 *     responses:
 *       200:
 *         description: User forms retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

router.get(
  "/",
  //@ts-ignore
  checkValidToken,
  getIntakeForms
);

/**
 * @swagger
 * /intake-forms/{formId}:
 *   get:
 *     summary: Get a single form for the authenticated user
 *     tags: [Intake Forms]
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         description: ID of the form to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Form retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Form not found
 *       500:
 *         description: Internal server error
 */

//@ts-ignore
router.get(
  "/:formId",
  //@ts-ignore
  checkValidToken,
  getSingleIntakeForm
);

export default router;
