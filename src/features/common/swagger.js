/**
 * @swagger
 * tags:
 *   - name: Common - Authentication
 *     description: Common endpoints shared between users and clients
 *
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *     VerifyTokenResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             email:
 *               type: string
 *             status:
 *               type: string
 *             first_name:
 *               type: string
 *             middle_name:
 *               type: string
 *             last_name:
 *               type: string
 *             date_of_birth:
 *               type: string
 *             type:
 *               type: string
 *               enum: [user, client]
 *         message:
 *           type: string
 *
 * /common/verify-token:
 *   post:
 *     tags:
 *       - Common - Authentication
 *     summary: Verify JWT token and get user/client information
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifyTokenResponse'
 *       400:
 *         description: Invalid token format or token not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No user or client found for this token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error or JWT secret missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
