/**
 * @swagger
 * tags:
 *   name: Onboarding
 *   description: Client onboarding steps
 */

/**
 * @swagger
 * /onboarding-step-1:
 *   post:
 *     summary: Complete onboarding step 1
 *     tags: [Onboarding]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - gender
 *               - email
 *               - date_of_birth
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               middle_name:
 *                 type: string
 *                 example: Michael
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Non-Binary, Prefer not to say]
 *                 example: Male
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-01
 *     responses:
 *       200:
 *         description: Onboarding Step 1 completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Client information updated successfully
 *                 data:
 *                   type: object
 *                   description: Updated client object
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Date of birth must indicate age above 18"
 *       500:
 *         description: Server or business logic error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email already exists"
 */

/**
 * @swagger
 * /onboarding-step-2:
 *   post:
 *     summary: Complete onboarding step 2
 *     tags: [Onboarding]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethod
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 example: pm_1J2Y3Z4A5B6C7D8E9F0G
 *     responses:
 *       200:
 *         description: Onboarding Step 2 completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Onboarding Step 2 completed successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "paymentMethod is required"
 *       404:
 *         description: Client not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Client not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /onboarding-step-3:
 *   post:
 *     summary: Complete onboarding step 3
 *     tags: [Onboarding]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding Step 3 completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Onboarding Step 3 Handler
 */
