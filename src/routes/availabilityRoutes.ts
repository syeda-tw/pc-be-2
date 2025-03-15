import express from "express";
import { updateAvailability, getAvailability } from "../controllers/availabilityController";
import checkValidToken from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * /availability:
 *   put:
 *     summary: Update user availability
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               availability:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Availability updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put("/", checkValidToken, updateAvailability);

/**
 * @swagger
 * /availability:
 *   get:
 *     summary: Get user availability
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Availability retrieved successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/", checkValidToken, getAvailability);

export default router; 