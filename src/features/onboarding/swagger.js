/**
 * @swagger
 * tags:
 *   name: Onboarding
 *   description: API for user onboarding process
 */

/**
 * @swagger
 * /onboarding/onboarding-step-1:
 *   post:
 *     summary: Complete onboarding step 1
 *     description: Update user information for the first step of onboarding.
 *     tags: [Onboarding]
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
 *                 description: User information for step 1
 *     responses:
 *       200:
 *         description: User information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: The sanitized user object with updated information.
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /onboarding/validate-address:
 *   post:
 *     summary: Validate address
 *     description: Validate a given address using the Geoapify service.
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: string
 *                 description: The address to validate.
 *     responses:
 *       200:
 *         description: Address validation result.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 formatted:
 *                   type: string
 *                   description: The formatted address.
 *                 components:
 *                   type: object
 *                   description: The address components.
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /onboarding/autocomplete-address:
 *   post:
 *     summary: Autocomplete address
 *     description: Get address suggestions based on partial input using the Geoapify service.
 *     tags: [Onboarding]
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
 *                   - address
 *                 properties:
 *                   address:
 *                     type: string
 *                     description: Partial address input for autocomplete.
 *     responses:
 *       200:
 *         description: List of address suggestions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 features:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       properties:
 *                         type: object
 *                         properties:
 *                           formatted:
 *                             type: string
 *                             description: The formatted address suggestion.
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /onboarding/validate-username:
 *   post:
 *     summary: Validate username
 *     description: Check if a username is available for use.
 *     tags: [Onboarding]
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
 *                   - username
 *                 properties:
 *                   username:
 *                     type: string
 *                     description: The username to validate.
 *     responses:
 *       200:
 *         description: Username is available.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isValid:
 *                   type: boolean
 *                   description: Whether the username is available.
 *                 message:
 *                   type: string
 *                   description: Success message.
 *       400:
 *         description: Username already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating username is taken.
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /onboarding/onboarding-individual-step-2:
 *   post:
 *     summary: Complete individual onboarding step 2
 *     description: Update individual user information for the second step of onboarding.
 *     tags: [Onboarding]
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
 *                 description: Individual user information for step 2
 *     responses:
 *       200:
 *         description: User information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: The updated user object.
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /onboarding/onboarding-company-step-2:
 *   post:
 *     summary: Complete company onboarding step 2
 *     description: Update company user information for the second step of onboarding.
 *     tags: [Onboarding]
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
 *                 description: Company user information for step 2
 *     responses:
 *       200:
 *         description: User information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: The updated user object.
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token.
 *       500:
 *         description: Internal server error.
 */