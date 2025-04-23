import { getUsersClientsByIdDbOp, getUserInvitedClientsIdDbOp, getUserWithClientsByIdDbOp, updateUserWithInvitedClientDbOp, updateInvitedClientWithNewRegistrationCodeAndUserWhoInvitedDbOp, getClientByPhoneNumberDbOp, getInvitedClientByPhoneNumberDbOp, updateUserWithClientDbOp, createInvitedClientDbOp } from "./dbOps.js";
import { messages } from "./messages.js";
import { generateRegistrationCode, sendRegistrationCode, sendOnboardingCode } from "./utils.js";
import CustomError from "../../../common/utils/customError.js";

const getAllClientsService = async (userId) => {
  const clients = await getUsersClientsByIdDbOp(userId);
  if (!clients) {
    throw new CustomError(messages.error.userNotFound, 404);
  }
  return clients;
};

const createClientService = async (clientData, userId) => {
  const { phone: phoneNumber } = clientData;
  //if client is already on the platform
  const clientAlreadyOnPlatform = await getClientByPhoneNumberDbOp(phoneNumber);
  if (clientAlreadyOnPlatform) {
    //user has previously interacted with this client
    const userClientRelationship = await clientAlreadyOnPlatform.users.find(user => user._id.equals(userId));
    if (userClientRelationship) {
      if (userClientRelationship.status === 'pending') {
        throw new CustomError(messages.error.clientAlreadyInvited, 400);
      }
      else if (userClientRelationship.status === 'rejected') {
        throw new CustomError(messages.error.clientAlreadyRejected, 400);
      }
      else {
        throw new CustomError(messages.error.clientAlreadyAccepted, 400);
      }
    }
    else {
      //invite the client to the users network
      await updateUserWithClientDbOp(userId, clientAlreadyOnPlatform._id);
      await updateClientWithUserDbOp(clientAlreadyOnPlatform._id, userId);
    }
  }
  else {
    //if client is already invited
    const clientAlreadyInvited = await getInvitedClientByPhoneNumberDbOp(phoneNumber);
    if (clientAlreadyInvited) {
      if (clientAlreadyInvited.users_who_have_invited.includes(userId)) {
        throw new CustomError(messages.error.clientAlreadyInvited, 400);
      }
      else {
        //client is invited by another user
        const newRegistrationCode = generateRegistrationCode();
        await updateUserWithInvitedClientDbOp(userId, clientAlreadyInvited._id);
        await updateInvitedClientWithNewRegistrationCodeAndUserWhoInvitedDbOp(clientAlreadyInvited._id, newRegistrationCode, userId);
        await sendRegistrationCode(clientAlreadyInvited.phone, newRegistrationCode);
      }
    }
    else {
      //client is not invited nor on the platform - then we are inviting client to the platform
      const invitedClientData = {
        phone: phoneNumber,
        first_name: clientData.first_name,
        last_name: clientData.last_name,
        email: clientData.email,
        registration_code: generateRegistrationCode(),
        users_who_have_invited: [userId],
      }
      const invitedClient = await createInvitedClientDbOp(invitedClientData);
      sendRegistrationCode(invitedClient.phone, invitedClient.registration_code);
      await updateUserWithInvitedClientDbOp(userId, invitedClient._id);
    }
  }
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
  createClientService,
  getInvitedClientsService,
};
