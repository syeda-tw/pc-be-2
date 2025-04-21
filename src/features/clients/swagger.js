/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: API for managing clients
 */

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Get all clients
 *     description: Retrieve all clients associated with the authenticated user.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all clients.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The client ID
 *                       userId:
 *                         type: string
 *                         description: The ID of the user who owns this client
 *                       firstName:
 *                         type: string
 *                         description: Client's first name
 *                       lastName:
 *                         type: string
 *                         description: Client's last name
 *                       email:
 *                         type: string
 *                         description: Client's email address
 *                       phone:
 *                         type: string
 *                         description: Client's phone number
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: When the client was created
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: When the client was last updated
 *                 message:
 *                   type: string
 *                   description: Success message
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */ 