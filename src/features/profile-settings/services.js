import { updateUserPersonalInformation, findUserByIdDbOp, getTimezoneByUserIdDbOp, updateUserDbOp } from "./dbOps.js";
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