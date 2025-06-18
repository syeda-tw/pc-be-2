import {
  updateUserPersonalInformation,
  findUserByIdDbOp,
  getTimezoneByUserIdDbOp,
  updateUserDbOp,
  getHolidaysByUserIdDbOp,
  getUserDailyLunch,
  updateUserDailyLunch,
  getWeeklyScheduleFromDB,
  updateWeeklyScheduleInDB,
  findUserByUsernameDbOp,
} from "./dbOps.js";
import { messages } from "./messages.js";
import { TIMEZONES } from "../../common/constants.js";

export const updatePersonalInformationService = async (data, userId) => {
  const user = await findUserByIdDbOp(userId);
  if (!user) {
    throw {
      code: 404,
      message: messages.error.userNotFound,
    };
  }
  const updatedUser = await updateUserPersonalInformation(userId, data);
  return updatedUser;
};

export const getTimezoneService = async (userId) => {
  const timezone = await getTimezoneByUserIdDbOp(userId);
  if (!timezone) {
    return TIMEZONES[0];
  }
  return timezone;
};

export const updateTimezoneService = async (timezone, userId) => {
  const user = await findUserByIdDbOp(userId);
  if (!user) {
    throw {
      code: 404,
      message: messages.error.userNotFound,
    };
  }
  user.timezone = timezone;
  await updateUserDbOp(userId, user);
};

export const getHolidaysService = async (userId) => {
  const holidays = await getHolidaysByUserIdDbOp(userId);
  if (!holidays) {
    throw {
      code: 404,
      message: messages.error.holidayNotFound,
    };
  }
  return holidays;
};

export const getDailyLunchService = async (userId) => {
  const lunchTimes = await getUserDailyLunch(userId);
  if (!lunchTimes?.dailyLunchStartTime || !lunchTimes?.dailyLunchEndTime) {
    throw {
      code: 404,
      message: messages.error.lunchNotFound,
    };
  }
  return {
    startTime: lunchTimes.dailyLunchStartTime,
    endTime: lunchTimes.dailyLunchEndTime,
  };
};

export const updateDailyLunchService = async (userId, startTime, endTime) => {
  const updatedLunchTimes = await updateUserDailyLunch(userId, startTime, endTime);
  if (!updatedLunchTimes) {
    throw {
      code: 404,
      message: messages.error.userNotFound,
    };
  }
  return {
    startTime: updatedLunchTimes.dailyLunchStartTime,
    endTime: updatedLunchTimes.dailyLunchEndTime,
  };
};

export const getWeeklyScheduleService = async (userId) => {
  const weeklySchedule = await getWeeklyScheduleFromDB(userId);
  if (!weeklySchedule) {
    throw {
      code: 404,
      message: messages.error.weeklyScheduleNotFound,
    };
  }
  return weeklySchedule;
};

export const updateWeeklyScheduleService = async (userId, weeklyScheduleData) => {
  const updatedWeeklySchedule = await updateWeeklyScheduleInDB(userId, weeklyScheduleData);
  if (!updatedWeeklySchedule) {
    throw {
      code: 400,
      message: messages.error.failedToUpdateWeeklySchedule,
    };
  }
  return updatedWeeklySchedule;
};

export const getProfileService = async (username) => {
  const user = await findUserByUsernameDbOp(username);
  if (!user) {
    throw {
      code: 404,
      message: messages.error.userNotFound,
    };
  }
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    gender: user.gender,
    title: user.title,
    timezone: user.timezone,
    pronouns: user.pronouns,
    weeklySchedule: user.availability.weeklySchedule,
    holidays: user.holidays,
    dailyLunch: user.availability.dailyLunch,
    practice: user.practice,
  };
};
