import express from "express";
import {
  updatePersonalInformation,
  getTimezone,
  updateTimezone,
  getHolidays,
  getDailyLunch,
  updateDailyLunch,
  getWeeklySchedule,
  updateWeeklySchedule,
  getProfile,
} from "./controllers.js";
import {
  validateUpdatePersonalInformationMiddleware,
  validateUpdateTimezoneMiddleware,
  validateAddRecurringHolidayMiddleware,
  validateAddSingleHolidayMiddleware,
  validateDeleteHolidayMiddleware,
  validateUpdateDailyLunchMiddleware,
  validateWeeklyScheduleMiddleware,
} from "./middlewares.js";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import addRecurringHolidayHandler from "./handlers-new/addRecurringHolidayHanlder.js";
import addSingleHolidayHandler from "./handlers-new/addSingleHolidayHandler.js";
import deleteRecurringHolidayHandler from "./handlers-new/deleteRecurringHolidayHandler.js";
import deleteSingleHolidayHandler from "./handlers-new/deleteSingleHolidayHandler.js";

const router = express.Router();

router.put(
  "/personal-information",
  validateUpdatePersonalInformationMiddleware,
  secureRequestMiddleware,
  updatePersonalInformation
);

router.get("/timezone", secureRequestMiddleware, getTimezone);

router.patch(
  "/timezone",
  validateUpdateTimezoneMiddleware,
  secureRequestMiddleware,
  updateTimezone
);

router.get("/holidays", secureRequestMiddleware, getHolidays);

router.put(
  "/recurring-holiday",
  validateAddRecurringHolidayMiddleware,
  secureRequestMiddleware,
  addRecurringHolidayHandler
);

router.put(
  "/single-holiday",
  validateAddSingleHolidayMiddleware,
  secureRequestMiddleware,
  addSingleHolidayHandler
);

router.delete(
  "/recurring-holiday/:holidayId",
  validateDeleteHolidayMiddleware,
  secureRequestMiddleware,
  deleteRecurringHolidayHandler
);

router.delete(
  "/single-holiday/:holidayId",
  validateDeleteHolidayMiddleware,
  secureRequestMiddleware,
  deleteSingleHolidayHandler
);

router.get("/daily-lunch", secureRequestMiddleware, getDailyLunch);

router.patch(
  "/daily-lunch",
  validateUpdateDailyLunchMiddleware,
  secureRequestMiddleware,
  updateDailyLunch
);

router.get("/weekly-schedule", secureRequestMiddleware, getWeeklySchedule);

router.patch(
  "/weekly-schedule",
  validateWeeklyScheduleMiddleware,
  secureRequestMiddleware,
  updateWeeklySchedule
);

router.get("/profile/:username", getProfile);

export default router;
