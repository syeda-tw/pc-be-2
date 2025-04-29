/**
 * @swagger
 * tags:
 *   name: Onboarding
 *   description: API for user onboarding process
 */

/**
 * @swagger
 * /user/onboarding/onboarding-step-1:
 *   post:
 *     summary: Complete onboarding step 1
 *     description: Update user's personal information and set status to onboarding-step-2
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
 *                     maxLength: 100
 *                   pronouns:
 *                     type: string
 *                     maxLength: 100
 *                   gender:
 *                     type: string
 *                     maxLength: 100
 *                   dateOfBirth:
 *                     type: string
 *                     format: date
 *                     description: Must be at least 18 years old
 *                   firstName:
 *                     type: string
 *                     maxLength: 100
 *                   lastName:
 *                     type: string
 *                     maxLength: 100
 *                   middleName:
 *                     type: string
 *                     maxLength: 100
 *                   username:
 *                     type: string
 *                     maxLength: 100
 *                     pattern: ^[a-zA-Z0-9]+$
 *     responses:
 *       200:
 *         description: User information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     pronouns:
 *                       type: string
 *                     gender:
 *                       type: string
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     middle_name:
 *                       type: string
 *                     username:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [onboarding-step-2]
 *       400:
 *         description: Validation error or username already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /user/onboarding/validate-address:
 *   post:
 *     summary: Validate address
 *     description: Validate an address using Google's address validation service
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
 *                     minLength: 1
 *                     maxLength: 255
 *     responses:
 *       200:
 *         description: Address validated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 formatted_address:
 *                   type: string
 *                 address_components:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /user/onboarding/autocomplete-address:
 *   post:
 *     summary: Autocomplete address
 *     description: Get address suggestions using Google's address autocomplete service
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
 *                     minLength: 1
 *                     maxLength: 255
 *     responses:
 *       200:
 *         description: Address suggestions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 predictions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       description:
 *                         type: string
 *                       place_id:
 *                         type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /user/onboarding/validate-username:
 *   post:
 *     summary: Validate username
 *     description: Check if a username is available
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
 *                     minLength: 3
 *                     maxLength: 30
 *                     pattern: ^[a-zA-Z0-9]+$
 *     responses:
 *       200:
 *         description: Username is available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isValid:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *       400:
 *         description: Username already exists or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /user/onboarding/onboarding-individual-step-2:
 *   post:
 *     summary: Complete individual onboarding step 2
 *     description: Create a practice for an individual user and complete onboarding
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
 *                   - businessName
 *                   - address
 *                 properties:
 *                   businessName:
 *                     type: string
 *                     maxLength: 100
 *                   website:
 *                     type: string
 *                     maxLength: 255
 *                   address:
 *                     type: string
 *                     maxLength: 255
 *     responses:
 *       200:
 *         description: Practice created and onboarding completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     practice:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [onboarded]
 *       400:
 *         description: Validation error or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /user/onboarding/onboarding-company-step-2:
 *   post:
 *     summary: Complete company onboarding step 2
 *     description: Create a practice for a company and complete onboarding
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
 *                   - businessName
 *                   - address
 *                   - members
 *                 properties:
 *                   businessName:
 *                     type: string
 *                     maxLength: 100
 *                   website:
 *                     type: string
 *                     maxLength: 255
 *                   address:
 *                     type: string
 *                     maxLength: 255
 *                   members:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: email
 *     responses:
 *       200:
 *         description: Practice created and onboarding completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     practice:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [onboarded]
 *       400:
 *         description: Validation error or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */