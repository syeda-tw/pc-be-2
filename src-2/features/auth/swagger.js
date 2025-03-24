
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user by providing a valid email and password. The email must be unique, and the password must meet the required length (8-20 characters).
 *     tags:
 *       - Authentication
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
 *                 description: The user's email address (must be unique).
 *               password:
 *                 type: string
 *                 description: The user's password (must be between 8 and 20 characters long).
 *     responses:
 *       200:
 *         description: User successfully registered, OTP sent to email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       description: The email address of the registered user.
 *                 message:
 *                   type: string
 *                   description: Message indicating that OTP has been sent.
 *       400:
 *         description: Invalid input or user already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message indicating the validation issue or that the user already exists.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message indicating that an unexpected error occurred.
 */