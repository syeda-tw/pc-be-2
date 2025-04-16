import express from "express";
import { updatePersonalInformation, getTimezone, updateTimezone, getHolidays, addHoliday, deleteHoliday} from "./controllers.js";
import {
  validateUpdatePersonalInformationMiddleware,
  validateUpdateTimezoneMiddleware,
  validateUpdateAvailabilityMiddleware,
  validateAddHolidayMiddleware,
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

router.put(
  '/availability',
  validateUpdateAvailabilityMiddleware,
  secureRequestMiddleware,
  (req, res) => {
    res.status(200).json({ message: "Availability updated successfully" });
  }
)

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

export default router; 