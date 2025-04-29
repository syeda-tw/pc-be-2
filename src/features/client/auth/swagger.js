/**
 * @swagger
 * tags:
 *   name: Client Authentication
 *   description: Client authentication endpoints
 */

/**
 * @swagger
 * /client/auth/register:
 *   post:
 *     tags: [Client Authentication]
 *     summary: Register a new client from invitation
 *     description: Register a new client using phone number and registration code from invitation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - code
 *               - password
 *               - confirmPassword
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Phone number of the invited client
 *               code:
 *                 type: string
 *                 description: Registration code received in invitation
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password for the new client account
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: Confirmation of the password for the new client account
 *     responses:
 *       201:
 *         description: Client registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Client created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     middle_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: The phone number you entered is not registered with Practicare
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to create client
 */
