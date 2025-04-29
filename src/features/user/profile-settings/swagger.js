/**
 * @swagger
 * tags:
 *   name: Profile Settings
 *   description: API for managing user profile settings
 */

/**
 * @swagger
 * /user/profile-settings/personal-information:
 *   put:
 *     summary: Update personal information
 *     description: Update user's personal information
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
 *                   - date_of_birth
 *                 properties:
 *                   first_name:
 *                     type: string
 *                     maxLength: 50
 *                   last_name:
 *                     type: string
 *                     maxLength: 50
 *                   middle_name:
 *                     type: string
 *                     maxLength: 50
 *                   pronouns:
 *                     type: string
 *                     maxLength: 20
 *                   gender:
 *                     type: string
 *                     maxLength: 20
 *                   date_of_birth:
 *                     type: string
 *                     format: date
 *                   phone:
 *                     type: string
 *                     maxLength: 20
 *     responses:
 *       200:
 *         description: Personal information updated successfully
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
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     middle_name:
 *                       type: string
 *                     pronouns:
 *                       type: string
 *                     gender:
 *                       type: string
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *                     phone:
 *                       type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       message:
 *                         type: string
 *                       path:
 *                         type: array
 *                         items:
 *                           type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 * /user/profile-settings/timezone:
 *   get:
 *     summary: Get user's timezone
 *     description: Retrieve the user's current timezone setting
 *     tags: [Profile Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Timezone retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timezone:
 *                   type: string
 *                 message:
 *                   type: string
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
 * /user/profile-settings/timezone:
 *   patch:
 *     summary: Update user's timezone
 *     description: Update the user's timezone setting
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
 *                   - timezone
 *                 properties:
 *                   timezone:
 *                     type: string
 *                     enum: [timezone values from constants.js]
 *     responses:
 *       200:
 *         description: Timezone updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       message:
 *                         type: string
 *                       path:
 *                         type: array
 *                         items:
 *                           type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 * /user/profile-settings/holidays:
 *   get:
 *     summary: Get user's holidays
 *     description: Retrieve all holidays set by the user
 *     tags: [Profile Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Holidays retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 holidays:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       start_date:
 *                         type: string
 *                         format: date
 *                       end_date:
 *                         type: string
 *                         format: date
 *                 message:
 *                   type: string
 *       404:
 *         description: Holidays not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 * /user/profile-settings/holidays:
 *   post:
 *     summary: Add a holiday
 *     description: Add a new holiday to the user's schedule
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
 *                   - holiday
 *                 properties:
 *                   holiday:
 *                     type: array
 *                     items:
 *                       type: object
 *                       required:
 *                         - name
 *                         - start_date
 *                         - end_date
 *                       properties:
 *                         name:
 *                           type: string
 *                           maxLength: 50
 *                         start_date:
 *                           type: string
 *                           format: date
 *                         end_date:
 *                           type: string
 *                           format: date
 *     responses:
 *       200:
 *         description: Holiday added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 holiday:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     start_date:
 *                       type: string
 *                       format: date
 *                     end_date:
 *                       type: string
 *                       format: date
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       message:
 *                         type: string
 *                       path:
 *                         type: array
 *                         items:
 *                           type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 * /user/profile-settings/holidays/{holidayId}:
 *   delete:
 *     summary: Delete a holiday
 *     description: Remove a holiday from the user's schedule
 *     tags: [Profile Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: holidayId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Holiday deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 * /user/profile-settings/daily-lunch:
 *   get:
 *     summary: Get daily lunch times
 *     description: Retrieve the user's daily lunch break times
 *     tags: [Profile Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily lunch times retrieved successfully
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
 *                     endTime:
 *                       type: string
 *                 message:
 *                   type: string
 *       404:
 *         description: Lunch times not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 * /user/profile-settings/daily-lunch:
 *   patch:
 *     summary: Update daily lunch times
 *     description: Update the user's daily lunch break times
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
 *                   endTime:
 *                     type: string
 *     responses:
 *       200:
 *         description: Daily lunch times updated successfully
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
 *                     endTime:
 *                       type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       message:
 *                         type: string
 *                       path:
 *                         type: array
 *                         items:
 *                           type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 * /user/profile-settings/weekly-schedule:
 *   get:
 *     summary: Get weekly schedule
 *     description: Retrieve the user's weekly schedule
 *     tags: [Profile Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly schedule retrieved successfully
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
 *                       day:
 *                         type: string
 *                         enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *                       start_time:
 *                         type: string
 *                         pattern: ^([01]\d|2[0-3]):[0-5]\d$
 *                       end_time:
 *                         type: string
 *                         pattern: ^([01]\d|2[0-3]):[0-5]\d$
 *                       is_open:
 *                         type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Weekly schedule not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 * /user/profile-settings/weekly-schedule:
 *   patch:
 *     summary: Update weekly schedule
 *     description: Update the user's weekly schedule
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
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - day
 *                     - start_time
 *                     - end_time
 *                     - is_open
 *                   properties:
 *                     day:
 *                       type: string
 *                       enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *                     start_time:
 *                       type: string
 *                       pattern: ^([01]\d|2[0-3]):[0-5]\d$
 *                     end_time:
 *                       type: string
 *                       pattern: ^([01]\d|2[0-3]):[0-5]\d$
 *                     is_open:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Weekly schedule updated successfully
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
 *                       day:
 *                         type: string
 *                         enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *                       start_time:
 *                         type: string
 *                         pattern: ^([01]\d|2[0-3]):[0-5]\d$
 *                       end_time:
 *                         type: string
 *                         pattern: ^([01]\d|2[0-3]):[0-5]\d$
 *                       is_open:
 *                         type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
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
 * /user/profile-settings/profile/{username}:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve a user's public profile by username
 *     tags: [Profile Settings]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *                   properties:
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     gender:
 *                       type: string
 *                     title:
 *                       type: string
 *                     timezone:
 *                       type: string
 *                     pronouns:
 *                       type: string
 *                     weekly_schedule:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           day:
 *                             type: string
 *                           start_time:
 *                             type: string
 *                           end_time:
 *                             type: string
 *                           is_open:
 *                             type: boolean
 *                     holidays:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           start_date:
 *                             type: string
 *                             format: date
 *                           end_date:
 *                             type: string
 *                             format: date
 *                     daily_lunch:
 *                       type: object
 *                       properties:
 *                         startTime:
 *                           type: string
 *                         endTime:
 *                           type: string
 *                     practice:
 *                       type: string
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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