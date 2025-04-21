import express from "express";
import { updatePersonalInformation, getTimezone, updateTimezone, getHolidays, addHoliday, deleteHoliday, getDailyLunch, updateDailyLunch } from "./controllers.js";
import {
  validateUpdatePersonalInformationMiddleware,
  validateUpdateTimezoneMiddleware,
  validateAddHolidayMiddleware,
  validateUpdateDailyLunchMiddleware,
} from "./middlewares.js";
import { secureRequestMiddleware } from "../../common/middlewares/secureRequestMiddleware.js";

const router = express.Router();

router.put(
  "/personal-information",
  validateUpdatePersonalInformationMiddleware,
  secureRequestMiddleware,
  updatePersonalInformation
);

router.get(
  "/timezone",
  secureRequestMiddleware,
  getTimezone
);

router.patch(
  "/timezone",
  validateUpdateTimezoneMiddleware,
  secureRequestMiddleware,
  updateTimezone
);

router.get(
  '/holidays',
  secureRequestMiddleware,
  getHolidays
)

router.post(
  '/holidays',
  validateAddHolidayMiddleware,
  secureRequestMiddleware,
  addHoliday
)

router.delete(
  '/holidays/:holidayId',
  secureRequestMiddleware,
  deleteHoliday
)

router.get('/daily-lunch', secureRequestMiddleware, getDailyLunch);

router.patch(
  "/daily-lunch",
  validateUpdateDailyLunchMiddleware,
  secureRequestMiddleware,
  updateDailyLunch
);

export default router; 