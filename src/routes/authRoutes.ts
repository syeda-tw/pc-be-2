import express from "express";
import {
  register,
  verifyRegistrationOtp,
  verifyUserToken,
  login,
} from "../controllers/authController";

const router = express.Router();
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     description: Register a new user by providing email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       201:
 *         description: User successfully registered and verification email sent
 *       400:
 *         description: User already exists or invalid input
 *       500:
 *         description: Server error
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/verify-registration-otp:
 *   post:
 *     summary: Verify registration OTP
 *     tags: [Authentication]
 *     description: Verify the OTP code for user registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *               otp:
 *                 type: string
 *                 description: The OTP code
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Invalid OTP code
 *       500:
 *         description: Server error
 */
router.post("/verify-registration-otp", verifyRegistrationOtp);

/**
 * @swagger
 * /auth/verify-user-token:
 *   post:
 *     summary: Verify user token
 *     tags: [Authentication]
 *     description: Verify the user token
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Invalid token
 *       404:
 *         description: User not found
 */
router.post("/verify-user-token", (req, res, next) => {
  verifyUserToken(req, res, next);
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     description: Login a user by providing email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: User successfully logged in
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
router.post("/login", login);

export default router;
