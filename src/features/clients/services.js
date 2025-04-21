import { getAllClientsByUserId } from "./dbOps.js";
import { getUserById } from "../auth/dbOps.js";
import { CustomError } from "../../common/utils/errors.js";
import { messages } from "./messages.js";

export const getAllClientsService = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new CustomError(messages.error.userNotFound, 404);
  }

  const clients = await getAllClientsByUserId(userId);
  return clients;
}; 