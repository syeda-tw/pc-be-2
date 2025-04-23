import { createClientDbOp, getAllClientsByUserId, updateClientDbOp, getUserByIdDbOp, findClientByPhoneNumberDbOp, updateUserDbOp  } from "./dbOps.js";
import { messages } from "./messages.js";
import { generateRegistrationCode, sendRegistrationCode, sendOnboardingCode } from "./utils.js";
import CustomError from "../../../common/utils/customError.js";

const getAllClientsService = async (userId) => {
  const user = await getUserByIdDbOp(userId);
  if (!user) {
    throw new CustomError(messages.error.userNotFound, 404);
  }

  const clients = await getAllClientsByUserId(userId);
  return clients;
};

const createClientService = async (clientData, userId) => {

  const user = await getUserByIdDbOp(userId);
  const { phoneNumber } = clientData;
  
  // Check if a client with the same phone number already exists
  let client = await findClientByPhoneNumberDbOp(phoneNumber);
  console.log("Client found by phone number:", client);

  // If the client does not exist, create a new client and add the user to it
  if (!client) {
    console.log("No existing client found, creating a new client.");
    const registrationCode = generateRegistrationCode();
    console.log("Generated registration code:", registrationCode);
    console.log(sendRegistrationCode(user, registrationCode));
    try {
      const newClient = await createClientDbOp({ ...clientData, registration_code: registrationCode, users: [{ user: user._id, is_active: true }] });
      console.log("Created new client:", newClient);
      const updatedUser = await updateUserDbOp(userId, { $addToSet: { clients: newClient._id } });
      console.log("Updated user with new client:", updatedUser);
      return { newClient, updatedUser };
    } catch (error) {
      console.error("Error in createClientService:", error);
      throw new CustomError(messages.error.clientCreationFailed, 500);
    }
  }
  // If the client exists, check if the user is already linked to it
  else {
    console.log("Existing client found:", client);
    // If the client is not active, generate a new registration code and send it to the client
    if (!client.is_active) {
      console.log("Client is not active.");
      //user exists in the client
      if (client.users.some(user => user.user.equals(user._id))) {
        console.log("User exists in the client.");
        const registrationCode = generateRegistrationCode();
        console.log("Generated registration code:", registrationCode);
        console.log(sendRegistrationCode(user, registrationCode));
        client = await updateClientDbOp(client._id, { ...client, registration_code: registrationCode, users: client.users.map(existingUser => ({ ...existingUser, is_active: existingUser.user.equals(user._id) ? true : false })) });
        console.log("Updated client with new registration code:", client);
        return { client, user };
      }
      //user does not exist in the client
      else {
        console.log("User does not exist in the client.");
        const registrationCode = generateRegistrationCode();
        console.log("Generated registration code:", registrationCode);
        console.log(sendRegistrationCode(user, registrationCode));
        client = await updateClientDbOp(client._id, { ...client, registration_code: registrationCode, users: [...client.users.map(u => ({ ...u, is_active: false })), { user: user._id, is_active: true }] });
        console.log("Updated client with new user and registration code:", client);
        const updatedUser = await updateUserDbOp(userId, { ...user, clients: [...user.clients, client._id] });
        console.log("Updated user with new client:", updatedUser);
        return { client, updatedUser };
      }

    }
    //if client is active    
    else {
      console.log("Client is active.");
      //user exists in the client
      if (client.users.some(user => user.user.equals(user._id))) {
        console.log("User exists in the client.");
        //if user is activated
        if (user.is_active) {
          console.log("User is already activated.");
          throw new CustomError(messages.error.userAlreadyExists, 400);
        }
        //user is not activated BUT IS IN THE LIST
        else {
          console.log("User is not activated but is in the list.");
          //generate new onboarding code
          const onboardingCode = generateRegistrationCode();
          console.log("Generated onboarding code:", onboardingCode);
          console.log(sendOnboardingCode(user, onboardingCode));
          client = await updateClientDbOp(client._id, { ...client, users: [...client.users, { user: user._id, is_active: false, onboarding_code: onboardingCode }] });
          console.log("Updated client with new onboarding code:", client);
          const updatedUser = await updateUserDbOp(user._id, { ...user, clients: [...user.clients, client._id] });
          console.log("Updated user with new client:", updatedUser);
          return { client, updatedUser };
        }
      }

      //user does not exist in the client
      else {
        console.log("User does not exist in the client.");
        const onboardingCode = generateRegistrationCode();
        console.log("Generated onboarding code:", onboardingCode);
        console.log(sendOnboardingCode(user, onboardingCode));
        client = await updateClientDbOp(client._id, { ...client, users: [...client.users, { user: user._id, is_active: false }] });
        console.log("Updated client with new user:", client);
        const updatedUser = await updateUserDbOp(user._id, { ...user, clients: [...user.clients, client._id] });
        console.log("Updated user with new client:", updatedUser);
        return { client, updatedUser };
      }
    }
  }
};

export {
  getAllClientsService,
  createClientService
};
