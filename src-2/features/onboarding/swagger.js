
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
 *     summary: Complete the first step of onboarding
 *     description: Update user profile with personal information like name, date of birth, gender, etc.
 *     tags: [Onboarding]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: object
 *                 required:
 *                   - title
 *                   - pronouns
 *                   - gender
 *                   - dateOfBirth
 *                   - firstName
 *                   - lastName
 *                   - username
 *                 properties:
 *                   title:
 *                     type: string
 *                     description: User's title (Mr, Mrs, Ms, etc.)
 *                     maxLength: 10
 *                   pronouns:
 *                     type: string
 *                     description: User's preferred pronouns
 *                     maxLength: 20
 *                   gender:
 *                     type: string
 *                     description: User's gender
 *                     maxLength: 20
 *                   dateOfBirth:
 *                     type: string
 *                     format: date
 *                     description: User's date of birth (must be at least 18 years old)
 *                   firstName:
 *                     type: string
 *                     description: User's first name
 *                     minLength: 1
 *                     maxLength: 50
 *                   lastName:
 *                     type: string
 *                     description: User's last name
 *                     minLength: 1
 *                     maxLength: 50
 *                   middleName:
 *                     type: string
 *                     description: User's middle name (optional)
 *                     maxLength: 50
 *                   username:
 *                     type: string
 *                     description: User's unique username
 *                     minLength: 3
 *                     maxLength: 30
 *     responses:
 *       200:
 *         description: Onboarding step 1 completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: Updated user information
 *       400:
 *         description: Validation error or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of validation errors
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message about invalid token
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */


/**
 * @swagger
 * /onboarding/validate-address:
 *   post:
 *     summary: Validate a user's address
 *     tags: [Onboarding]
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
 *                 description: The address to validate
 *                 minLength: 1
 *                 maxLength: 255
 *     responses:
 *       200:
 *         description: Address validation results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     isValid:
 *                       type: boolean
 *                       description: Whether the address is valid
 *                     isOutsideUS:
 *                       type: boolean
 *                       description: Whether the address is outside the United States
 *                     isComplete:
 *                       type: boolean
 *                       description: Whether the address contains all required fields
 *                     message:
 *                       type: string
 *                       description: Validation message (only present for invalid addresses)
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of validation errors
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message about invalid token
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */


/**
 * @swagger
 * /onboarding/autocomplete-address:
 *   post:
 *     summary: Autocomplete address suggestions
 *     description: Returns address suggestions based on partial input
 *     tags:
 *       - Onboarding
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
 *                 description: Partial address text for autocomplete
 *     responses:
 *       200:
 *         description: Address suggestions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       formatted:
 *                         type: string
 *                         description: Formatted address suggestion
 *                       properties:
 *                         type: object
 *                         description: Address properties
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of validation errors
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message about invalid token
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
