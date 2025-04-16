import { updateUserPersonalInformation, findUserByIdDbOp, getTimezoneByUserIdDbOp, updateUserDbOp, getHolidaysByUserIdDbOp } from "./dbOps.js";
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