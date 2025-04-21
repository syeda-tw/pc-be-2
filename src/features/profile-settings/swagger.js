/**
 * @swagger
 * tags:
 *   name: Profile Settings
 *   description: API for managing user profile settings
 */

/**
 * @swagger
 * /profile-settings/personal-information:
 *   put:
 *     summary: Update personal information
 *     description: Update user's personal information like name, pronouns, and gender.
 *     tags: [Profile Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: object
 *                 required:
 *                   - first_name
 *                   - last_name
 *                 properties:
 *                   first_name:
 *                     type: string
 *                     description: User's first name
 *                     maxLength: 50
 *                   last_name:
 *                     type: string
 *                     description: User's last name
 *                     maxLength: 50
 *                   middle_name:
 *                     type: string
 *                     description: User's middle name (optional)
 *                     maxLength: 50
 *                   pronouns:
 *                     type: string
 *                     description: User's preferred pronouns (optional)
 *                     maxLength: 20
 *                   gender:
 *                     type: string
 *                     description: User's gender (optional)
 *                     maxLength: 20
 *     responses:
 *       200:
 *         description: Personal information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: The updated user object.
 *                 message:
 *                   type: string
 *                   description: Success message.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /profile-settings/daily-lunch:
 *   get:
 *     summary: Get daily lunch times
 *     description: Retrieve the user's daily lunch start and end times from their availability settings.
 *     tags: [Profile Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved lunch times.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     startTime:
 *                       type: string
 *                       description: Daily lunch start time
 *                       example: "12:00 PM"
 *                     endTime:
 *                       type: string
 *                       description: Daily lunch end time
 *                       example: "1:00 PM"
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

/**
 * @swagger
 * /profile-settings/daily-lunch:
 *   patch:
 *     summary: Update daily lunch times
 *     description: Update the user's daily lunch start and end times.
 *     tags: [Profile Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: object
 *                 required:
 *                   - startTime
 *                   - endTime
 *                 properties:
 *                   startTime:
 *                     type: string
 *                     description: Daily lunch start time in 12-hour format
 *                     example: "12:00 PM"
 *                   endTime:
 *                     type: string
 *                     description: Daily lunch end time in 12-hour format
 *                     example: "1:00 PM"
 *     responses:
 *       200:
 *         description: Successfully updated lunch times.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     startTime:
 *                       type: string
 *                       description: Updated lunch start time
 *                     endTime:
 *                       type: string
 *                       description: Updated lunch end time
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Validation error - Invalid time format or start time after end time
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */ 