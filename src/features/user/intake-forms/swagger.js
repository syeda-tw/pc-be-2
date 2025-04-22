/**
 * @swagger
 * tags:
 *   name: Intake Forms
 *   description: API for managing intake forms
 */

/**
 * @swagger
 * /intake-forms:
 *   get:
 *     summary: Get all intake forms
 *     description: Retrieve all intake forms associated with the authenticated user.
 *     tags: [Intake Forms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all intake forms.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 forms:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The unique identifier of the form.
 *                       name:
 *                         type: string
 *                         description: The name of the form.
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: The creation timestamp of the form.
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /intake-forms/{id}:
 *   get:
 *     summary: Get a single intake form
 *     description: Retrieve a specific intake form by its ID.
 *     tags: [Intake Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the intake form to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved the intake form.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *             description: The PDF file of the intake form.
 *       400:
 *         description: Invalid form ID format.
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token.
 *       404:
 *         description: Form not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /intake-forms/add:
 *   post:
 *     summary: Create a new intake form
 *     description: Create a new intake form with a PDF file.
 *     tags: [Intake Forms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - formName
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The PDF file for the intake form.
 *               formName:
 *                 type: string
 *                 description: The name of the intake form.
 *     responses:
 *       200:
 *         description: Successfully created the intake form.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 form:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The unique identifier of the created form.
 *                     name:
 *                       type: string
 *                       description: The name of the form.
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: The creation timestamp of the form.
 *       400:
 *         description: Invalid form format or missing required fields.
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /intake-forms/{id}:
 *   delete:
 *     summary: Delete an intake form
 *     description: Delete a specific intake form by its ID.
 *     tags: [Intake Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the intake form to delete.
 *     responses:
 *       200:
 *         description: Successfully deleted the intake form.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *       400:
 *         description: Invalid form ID format.
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token.
 *       404:
 *         description: Form not found.
 *       500:
 *         description: Internal server error.
 */
