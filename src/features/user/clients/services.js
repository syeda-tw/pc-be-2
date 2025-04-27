import { getUsersClientsByIdDbOp, getUserInvitedClientsIdDbOp, getUserWithClientsByIdDbOp, updateUserWithInvitedClientDbOp, updateInvitedClientWithNewRegistrationCodeAndUserWhoInvitedDbOp, getClientByPhoneNumberDbOp, getInvitedClientByPhoneNumberDbOp, updateUserWithClientDbOp, createInvitedClientDbOp } from "./dbOps.js";
import { messages } from "./messages.js";
import CustomError from "../../../common/utils/customError.js";

const getAllClientsService = async (userId, query) => {
  const {
    search = '',
    start = 0,
    limit = 20,
    page = 1,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = query;
  
  const clients = await getUsersClientsByIdDbOp(userId, search, start, limit, page, sortBy, sortOrder);
  if (!clients) {
    throw new CustomError(messages.error.userNotFound, 404);
  }
  return clients;
};

const getInvitedClientsService = async (userId) => {
  try {
    const invitedClients = await getUserInvitedClientsIdDbOp(userId);
    return invitedClients;
  } catch (error) {
    console.error("Error in getInvitedClientsService:", error);
    throw error;
  }
};

export {
  getAllClientsService,
  getInvitedClientsService,
};
