import { sanitizeUserAndAppendType } from '../../common/utils.js';
import { messages } from "./messages.js";
import { 
  updatePersonalInformationService, 
  getTimezoneService, 
  updateTimezoneService, 
  getHolidaysService, 
  getDailyLunchService, 
  updateDailyLunchService, 
  getWeeklyScheduleService, 
  updateWeeklyScheduleService, 
  getProfileService 
} from "./services.js";

const updatePersonalInformation = async (req, res, next) => {
  try {
    const user = await updatePersonalInformationService(req.body, req.id);
    return res.status(200).json({
      user: sanitizeUserAndAppendType(user, "user"),
      message: messages.personalInfo.updated
    });
  } catch (err) {
    throw { code: err.code || 500, message: err.message };
  }
};

const getTimezone = async (req, res, next) => {
  try {
    const timezone = await getTimezoneService(req.id);
    return res.status(200).json({
      timezone,
      message: messages.timezone.fetched
    });
  } catch (err) {
    throw { code: err.code || 500, message: err.message };
  }
};

const updateTimezone = async (req, res, next) => {
  try {
    await updateTimezoneService(req.body.timezone, req.id);
    return res.status(200).json({
      message: messages.timezone.updated
    });
  } catch (err) {
    throw { code: err.code || 500, message: err.message };
  }
};

const getHolidays = async (req, res, next) => {
  try {
    const holidays = await getHolidaysService(req.id);
    return res.status(200).json({
      holidays,
      message: messages.holiday.fetched
    });
  } catch (err) {
    throw { code: err.code || 500, message: err.message };
  }
};

const getDailyLunch = async (req, res, next) => {
  try {
    const lunchTimes = await getDailyLunchService(req.id);
    return res.status(200).json({
      data: lunchTimes,
      message: messages.lunch.retrieved
    });
  } catch (err) {
    throw { code: err.code || 500, message: err.message };
  }
};

const updateDailyLunch = async (req, res, next) => {
  try {
    const { startTime, endTime } = req.body;
    const updatedLunchTimes = await updateDailyLunchService(req.id, startTime, endTime);
    return res.status(200).json({
      data: updatedLunchTimes,
      message: messages.lunch.updated
    });
  } catch (err) {
    throw { code: err.code || 500, message: err.message };
  }
};

const getWeeklySchedule = async (req, res, next) => {
  try {
    const weeklySchedule = await getWeeklyScheduleService(req.id);
    return res.status(200).json({
      data: weeklySchedule,
      message: messages.weeklySchedule.retrieved
    });
  } catch (err) {
    throw { code: err.code || 500, message: err.message };
  }
};

const updateWeeklySchedule = async (req, res, next) => {
  try {
    const updatedWeeklySchedule = await updateWeeklyScheduleService(req.id, req.body.data);
    return res.status(200).json({
      data: updatedWeeklySchedule,
      message: messages.weeklySchedule.updated
    });
  } catch (err) {
    throw { code: err.code || 500, message: err.message };
  }
};

const getProfile = async (req, res, next) => {
  try {
    const profile = await getProfileService(req.params.username);
    return res.status(200).json({ 
      profile,
      message: messages.profile.retrieved
    });
  } catch (err) {
    throw { code: err.code || 500, message: err.message };
  }
};

export { 
  updatePersonalInformation, 
  getTimezone, 
  updateTimezone, 
  getHolidays,
  getDailyLunch, 
  updateDailyLunch, 
  getWeeklySchedule, 
  updateWeeklySchedule, 
  getProfile 
};