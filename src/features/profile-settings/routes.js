import express from "express";
import { updatePersonalInformation, getTimezone, updateTimezone } from "./controllers.js";
import { validateUpdatePersonalInformationMiddleware,
  validateUpdateTimezoneMiddleware,
  validateUpdateAvailabilityMiddleware,
  validateUpdateHolidayMiddleware,
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
  'availability',
  validateUpdateAvailabilityMiddleware,
  secureRequestMiddleware,
  (req, res) => {
    res.status(200).json({ message: "Availability updated successfully" });
  }
)

router.put(
  'holiday',
  validateUpdateHolidayMiddleware,
  secureRequestMiddleware,
  (req, res) => {
    res.status(200).json({ message: "Holiday updated successfully" });
  }
)

export default router; 