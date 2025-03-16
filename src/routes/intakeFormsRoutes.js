import express from "express";
import multer from "multer";
import {
  addIntakeForm,
  getIntakeForms,
  getSingleIntakeForm,
  deleteForm,
} from "../controllers/intakeFormsController.js";
import checkValidToken from "../middleware/authMiddleware.js";
const storage = multer.memoryStorage();
const router = express.Router();
const upload = multer({ storage });
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
  upload.single("file"),
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

/**
 * @swagger
 * /intake-forms/{formId}:
 *   delete:
 *     summary: Delete a form for the authenticated user
 *     tags: [Intake Forms]
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         description: ID of the form to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Form deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Form not found
 *       500:
 *         description: Internal server error
 */

//@ts-ignore
router.delete(
  "/:formId",
  //@ts-ignore
  checkValidToken,
  deleteForm
);

export default router;
