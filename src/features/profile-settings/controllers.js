import { messages } from "./messages.js";
import { updatePersonalInformationService, getTimezoneService, updateTimezoneService, getHolidaysService, addHolidayService, deleteHolidayService, getDailyLunchService, updateDailyLunchService } from "./services.js";
import { sanitizeUser } from "../../common/utils/sanitizeUser.js";

const updatePersonalInformation = async (req, res, next) => {
  try {
    const user = await updatePersonalInformationService(
      req.body.data,
      req.body.decodedToken._id
    );
    return res.status(200).json({
      user: sanitizeUser(user),
      message: messages.personalInfo.updated
    });
  } catch (err) {
    next(err);
  }
};

const getTimezone = async (req, res, next) => {
  try {
    const timezone = await getTimezoneService(req.body.decodedToken._id);
    return res.status(200).json({
      timezone: timezone,
      message: messages.timezone.fetched
    });
  } catch (err) {
    next(err);
  }
};

const updateTimezone = async (req, res, next) => {
  try {
    await updateTimezoneService(req.body.timezone, req.body.decodedToken._id);
    return res.status(200).json({
      message: messages.timezone.updated
    });
  } catch (err) {
    next(err);
  }
};

const getHolidays = async (req, res, next) => {
  try {
    const holidays = await getHolidaysService(req.body.decodedToken._id);
    return res.status(200).json({
      holidays: holidays,
      message: messages.holiday.fetched
    });
  } catch (err) {
    next(err);
  }
}

const addHoliday = async (req, res, next) => {
  try {
    const holiday = await addHolidayService(req.body.holiday, req.body.decodedToken._id);
      return res.status(200).json({
      holiday: holiday,
      message: messages.holiday.updated
    });
  } catch (err) {
    next(err);
  }
  }

const deleteHoliday = async (req, res, next) => {
  try {
    await deleteHolidayService(req.params.holidayId, req.body.decodedToken._id);
    return res.status(200).json({
      message: messages.holiday.deleted
    });
  } catch (err) {
    next(err);
  }
}

const getDailyLunch = async (req, res, next) => {
  try {
    const lunchTimes = await getDailyLunchService(req.body.decodedToken._id);
    return res.status(200).json({
      data: lunchTimes,
      message: messages.lunch.retrieved
    });
  } catch (err) {
    next(err);
  }
};

const updateDailyLunch = async (req, res, next) => {
  try {
    const { startTime, endTime } = req.body.data;
    const updatedLunchTimes = await updateDailyLunchService(
      req.body.decodedToken._id,
      startTime,
      endTime
    );
    
    return res.status(200).json({
      data: updatedLunchTimes,
      message: messages.lunch.updated
    });
  } catch (err) {
    next(err);
  }
};

export { updatePersonalInformation, getTimezone, updateTimezone, getHolidays, addHoliday, deleteHoliday, getDailyLunch, updateDailyLunch }; 