import { updateUserPersonalInformation, findUserByIdDbOp, getTimezoneByUserIdDbOp, updateUserDbOp, getHolidaysByUserIdDbOp, getUserDailyLunch, updateUserDailyLunch, getWeeklyScheduleFromDB, updateWeeklyScheduleInDB } from "./dbOps.js";
import CustomError from "../../common/utils/customError.js";
import { messages } from "./messages.js";
import { timezones } from "./constants.js";

export const updatePersonalInformationService = async (data, userId) => {
  const user = await findUserByIdDbOp(userId);
  if (!user) {
    throw new CustomError(messages.error.userNotFound, 404);
  }
  const updatedUser = await updateUserPersonalInformation(userId, data);
  return updatedUser;
};

export const getTimezoneService = async (userId) => {
  const timezone = await getTimezoneByUserIdDbOp(userId);
  if (!timezone) {
    return timezones[0];
  }
  return timezone;
};

export const updateTimezoneService = async (timezone, userId) => {
  const user = await findUserByIdDbOp(userId);
  if (!user) {
    throw new CustomError(messages.error.userNotFound, 404);
  }
  user.timezone = timezone;
  await updateUserDbOp(userId, user);
  return;
};

export const getHolidaysService = async (userId) => {
  try {
    const holidays = await getHolidaysByUserIdDbOp(userId);
    return holidays || [];
  } catch (err) {
    throw new CustomError(messages.error.holidayNotFound, 404);
  }
};

export const addHolidayService = async (holiday, userId) => {
  const user = await findUserByIdDbOp(userId);
  if (!user) {
    throw new CustomError(messages.error.userNotFound, 404);
  }
  user.holidays = [...user.holidays, holiday];
  const updatedUser = await updateUserDbOp(userId, user);
  return updatedUser.holidays[updatedUser.holidays.length - 1];
};

export const deleteHolidayService = async (holidayId, userId) => {
  const user = await findUserByIdDbOp(userId);
  if (!user) {
    throw new CustomError(messages.error.userNotFound, 404);
  }
  user.holidays = user.holidays.filter(holiday => holiday._id.toString() != holidayId);
  const res = await updateUserDbOp(userId, user);
  return res;
};

export const getDailyLunchService = async (userId) => {
  const lunchTimes = await getUserDailyLunch(userId);
  
  if (!lunchTimes.daily_lunch_start_time || !lunchTimes.daily_lunch_end_time) {
    throw new CustomError(messages.error.lunchNotFound);
  }

  return {
    startTime: lunchTimes.daily_lunch_start_time,
    endTime: lunchTimes.daily_lunch_end_time
  };
};

export const updateDailyLunchService = async (userId, startTime, endTime) => {
  const updatedLunchTimes = await updateUserDailyLunch(userId, startTime, endTime);
  
  if (!updatedLunchTimes) {
    throw new CustomError(messages.error.userNotFound, 404);
  }

  return {
    startTime: updatedLunchTimes.daily_lunch_start_time,
      endTime: updatedLunchTimes.daily_lunch_end_time
  };
};

export const getWeeklyScheduleService = async (userId) => {
  try {
    const weeklySchedule = await getWeeklyScheduleFromDB(userId);
    if (!weeklySchedule) {
      throw new CustomError(messages.error.weeklyScheduleNotFound, 404);
    }
    return weeklySchedule;
  } catch (error) {
    throw new CustomError(messages.error.weeklyScheduleNotFound, 404);
  }
};

export const updateWeeklyScheduleService = async (userId, weeklyScheduleData) => {
  try {
    const updatedWeeklySchedule = await updateWeeklyScheduleInDB(userId, weeklyScheduleData);
    if (!updatedWeeklySchedule) {
      throw new CustomError(messages.error.failedToUpdateWeeklySchedule, 400);
    }
    return updatedWeeklySchedule;
  } catch (error) {
    throw new CustomError(messages.error.failedToUpdateWeeklySchedule, 400);
  }
};