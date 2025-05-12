import Client from "../../../common/models/Client.js";
import InvitedClient from "../../../common/models/InvitedClient.js";
import User from "../../../common/models/User.js";
import CustomError from "../../../common/utils/customError.js";
import { env } from "../../../common/config/env.js";

const messages = {
  error: {
    clientAlreadyInvited: "An invitation has already been sent to this client and is currently pending.",
    clientAlreadyRejected: "This client has previously rejected an invitation from you.",
    clientAlreadyAccepted: "This client is already connected to your account on the platform.",
  },
  success: {
    createSuccess: "Client invitation sent successfully.",
  },
};

const utils = {
  generateRegistrationCode: () => {
    // Generates a 5-character uppercase alphanumeric code
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    // console.log("[utils.generateRegistrationCode] Generated code:", code); // Removed log
    return code;
  },
  sendRegistrationCode: (user, code) => {
    // Note: In a real application, this would trigger an email or SMS send.
    // For now, it returns the message content for logging/testing.
    const messageBody = `Welcome to Practicare!

        You've been invited by ${user.firstName} ${
      user.lastName
    } to join their network.

        Your registration code: ${code}

        Use this code to log in and complete your setup.

        Get started at: ${
          env.NODE_ENV === "development"
            ? env.FRONTEND_URL_LOCAL
            : env.FRONTEND_URL_PRODUCTION
        }/client-registration`;
    // console.log(`[utils.sendRegistrationCode] Generated message for user ${user._id} with code ${code}`); // Removed log
    return messageBody; // In a real scenario, this function would likely initiate the sending process.
  },
};

// Note: The dbOps object seems redundant as these operations are used directly
// in the service layer below. Consider refactoring to call Mongoose methods directly
// or moving these to a dedicated dbOps file if reused elsewhere.
const dbOps = {
  getClientByphoneDbOp: async (phone) => {
    try {
      // console.log(`[dbOps.getClientByphoneDbOp] Checking for existing platform client with phone: ${phone}`); // Removed log
      const client = await Client.findOne({ phone: phone });
      // if (client) { // Removed log block
      //   console.log(`[dbOps.getClientByphoneDbOp] Found existing platform client: ${client._id}`);
      // } else {
      //   console.log(`[dbOps.getClientByphoneDbOp] No existing platform client found for phone: ${phone}`);
      // }
      return client || null;
    } catch (error) {
      // console.error(`[dbOps.getClientByphoneDbOp] Error fetching client by phone ${phone}:`, error); // Removed log
      throw error; // Re-throw to be caught by the service layer
    }
  },

  getInvitedClientByphoneDbOp: async (phone) => {
    try {
      // console.log(`[dbOps.getInvitedClientByphoneDbOp] Checking for invited client with phone: ${phone}`); // Removed log
      const client = await InvitedClient.findOne({ phone: phone });
      //  if (client) { // Removed log block
      //   console.log(`[dbOps.getInvitedClientByphoneDbOp] Found invited client: ${client._id}`);
      // } else {
      //   console.log(`[dbOps.getInvitedClientByphoneDbOp] No invited client found for phone: ${phone}`);
      // }
      return client || null;
    } catch (error) {
      // console.error(`[dbOps.getInvitedClientByphoneDbOp] Error fetching invited client by phone ${phone}:`, error); // Removed log
      throw error;
    }
  },

  createInvitedClientDbOp: async (clientData) => {
    try {
      // console.log("[dbOps.createInvitedClientDbOp] Attempting to create invited client with data:", clientData); // Removed log
      const client = await InvitedClient.create(clientData);
      // console.log(`[dbOps.createInvitedClientDbOp] Successfully created invited client: ${client._id}`); // Removed log
      return client;
    } catch (error) {
      // console.error("[dbOps.createInvitedClientDbOp] Error creating invited client:", error); // Removed log
      throw error;
    }
  },

  updateUserWithInvitedClientDbOp: async (userId, invitedClientId) => {
    try {
      // console.log(`[dbOps.updateUserWithInvitedClientDbOp] Linking invited client ${invitedClientId} to user ${userId}`); // Removed log
      // Using findByIdAndUpdate for atomicity and efficiency
      await User.findByIdAndUpdate(userId, {
         $push: { invitedClients: { _id: invitedClientId, status: "pending" } }
      });
      // console.log(`[dbOps.updateUserWithInvitedClientDbOp] Successfully linked invited client ${invitedClientId} to user ${userId}`); // Removed log
    } catch (error) {
      // console.error(`[dbOps.updateUserWithInvitedClientDbOp] Error linking invited client ${invitedClientId} to user ${userId}:`, error); // Removed log
      throw error;
    }
  },

  updateInvitedClientWithNewRegistrationCodeAndUserWhoInvitedDbOp: async (
    invitedClientId,
    newRegistrationCode,
    userId
  ) => {
    try {
      // console.log(`[dbOps.updateInvitedClient...] Updating invited client ${invitedClientId} with new code ${newRegistrationCode} and inviting user ${userId}`); // Removed log
      // Using findByIdAndUpdate for atomicity
       await InvitedClient.findByIdAndUpdate(invitedClientId, {
         $push: { usersWhoHaveInvited: userId },
         $set: { registrationCode: newRegistrationCode }
       });
      // console.log(`[dbOps.updateInvitedClient...] Successfully updated invited client ${invitedClientId}`); // Removed log
    } catch (error) {
      // console.error(`[dbOps.updateInvitedClient...] Error updating invited client ${invitedClientId}:`, error); // Removed log
      throw error;
    }
  },

  updateUserWithClientDbOp: async (userId, clientId) => {
    try {
      // console.log(`[dbOps.updateUserWithClientDbOp] Linking platform client ${clientId} to user ${userId} with 'pending' status`); // Removed log
       await User.findByIdAndUpdate(userId, {
         $push: { clients: { _id: clientId, status: "pending" } }
       });
      // console.log(`[dbOps.updateUserWithClientDbOp] Successfully linked platform client ${clientId} to user ${userId}`); // Removed log
    } catch (error) {
      // console.error(`[dbOps.updateUserWithClientDbOp] Error linking platform client ${clientId} to user ${userId}:`, error); // Removed log
      throw error;
    }
  },

  updateClientWithUserDbOp: async (clientId, userId) => {
    try {
      // console.log(`[dbOps.updateClientWithUserDbOp] Linking user ${userId} to platform client ${clientId} with 'pending' status`); // Removed log
       await Client.findByIdAndUpdate(clientId, {
         $push: { users: { _id: userId, status: "pending" } }
       });
      // console.log(`[dbOps.updateClientWithUserDbOp] Successfully linked user ${userId} to platform client ${clientId}`); // Removed log
    } catch (error) {
      // console.error(`[dbOps.updateClientWithUserDbOp] Error linking user ${userId} to platform client ${clientId}:`, error); // Removed log
      throw error;
    }
  },
};

const createClientService = async (clientData, userId) => {
  const { phone } = clientData;
  // console.log(`[createClientService] Attempting to invite/connect client for user ${userId} with phone: ${phone}`); // Removed log

  // Fetch inviting user details (needed for sending notification)
  const user = await User.findById(userId).select('firstName lastName').lean(); // Use lean for performance if only reading data
  if (!user) {
    // This should ideally not happen if userId comes from authenticated request
    // console.error(`[createClientService] Inviting user with ID ${userId} not found.`); // Removed log
    throw new CustomError("Inviting user not found.", 500);
  }
  // console.log(`[createClientService] Inviting user found: ${user.firstName} ${user.lastName} (${userId})`); // Removed log

  // Check existing client statuses
  const clientAlreadyOnPlatform = await Client.findOne({ phone }).lean();
  const invitedClientAlreadyExists = await InvitedClient.findOne({ phone }).lean(); // Use lean

  // --- Scenario 1: Client is completely new ---
  if (!clientAlreadyOnPlatform && !invitedClientAlreadyExists) {
    // console.log(`[createClientService] Phone ${phone} not found in Clients or InvitedClients. Creating new invitation.`); // Removed log
    const registrationCode = utils.generateRegistrationCode();
    // console.log(`[createClientService] Registration code generated: ${registrationCode}`); // Removed log
    const newInvitedClientData = {
      phone: phone,
      firstName: clientData.firstName,
      lastName: clientData.lastName,
      email: clientData.email,
      usersWhoHaveInvited: [userId],
      registrationCode: registrationCode,
    };
    // Use the dbOp function or call Mongoose directly
    // const newClient = await dbOps.createInvitedClientDbOp(newInvitedClientData);
    const newClient = await InvitedClient.create(newInvitedClientData);
    // console.log(`[createClientService] Created new InvitedClient: ${newClient._id}`); // Removed log

    // Link to user
    // await dbOps.updateUserWithInvitedClientDbOp(userId, newClient._id);
     await User.findByIdAndUpdate(userId, {
       $push: { invitedClients: { _id: newClient._id, status: "pending" } }
     });
     // console.log(`[createClientService] Linked new InvitedClient ${newClient._id} to user ${userId}`); // Removed log

    // TODO: Implement actual sending mechanism (email/SMS)
    utils.sendRegistrationCode(user, registrationCode);
    // console.log(`[createClientService] Registration code generated and message prepared for new client ${newClient._id}.`); // Removed log

    return newClient.toObject(); // Return plain object
  }

  // --- Scenario 2: Client is already a registered user on the platform ---
  if (clientAlreadyOnPlatform) {
    // console.log(`[createClientService] Phone ${phone} matches existing platform Client: ${clientAlreadyOnPlatform._id}`); // Removed log

    // Check if this specific user already has a relationship with this client
    const userClientRelationship = clientAlreadyOnPlatform.users?.find(
      (linkedUser) => linkedUser._id.equals(userId)
    );

    if (userClientRelationship) {
      // console.log(`[createClientService] Existing relationship found between user ${userId} and client ${clientAlreadyOnPlatform._id} with status: ${userClientRelationship.status}`); // Removed log
      // Throw specific errors based on status
      switch (userClientRelationship.status) {
        case "pending":
          throw new CustomError(messages.error.clientAlreadyInvited, 409); // 409 Conflict might be suitable
        case "rejected":
          throw new CustomError(messages.error.clientAlreadyRejected, 409);
        case "accepted": // or "active", "confirmed" etc. depending on your model
          throw new CustomError(messages.error.clientAlreadyAccepted, 409);
        default:
           // console.warn(`[createClientService] Unknown relationship status: ${userClientRelationship.status}`); // Removed log
           throw new CustomError("An unexpected relationship status exists with this client.", 400);
      }
    } else {
      // No relationship yet, create a pending connection request
      // console.log(`[createClientService] No existing relationship between user ${userId} and client ${clientAlreadyOnPlatform._id}. Creating 'pending' link.`); // Removed log
      // await dbOps.updateUserWithClientDbOp(userId, clientAlreadyOnPlatform._id);
      // await dbOps.updateClientWithUserDbOp(clientAlreadyOnPlatform._id, userId);
       await User.findByIdAndUpdate(userId, {
         $push: { clients: { _id: clientAlreadyOnPlatform._id, status: "pending" } },
       });
       await Client.findByIdAndUpdate(clientAlreadyOnPlatform._id, {
         $push: { users: { _id: userId, status: "pending" } },
       });
      // console.log(`[createClientService] Successfully created 'pending' link between user ${userId} and client ${clientAlreadyOnPlatform._id}.`); // Removed log
      // TODO: Notify the existing client they have a connection request from this user.
      return clientAlreadyOnPlatform; // Return the existing client data
    }
  }

  // --- Scenario 3: Client has been invited before (exists in InvitedClients), but not by this user ---
  // Note: The `else` implies invitedClientAlreadyExists is true here.
  else {
     // console.log(`[createClientService] Phone ${phone} matches existing InvitedClient: ${invitedClientAlreadyExists._id}`); // Removed log

    // Check if the current user is already in the list of inviters
    if (invitedClientAlreadyExists.usersWhoHaveInvited.some(inviterId => inviterId.equals(userId))) {
      // console.log(`[createClientService] User ${userId} has already invited client ${invitedClientAlreadyExists._id}. Invitation is pending.`); // Removed log
      // User has already invited this client, and it's still pending (otherwise they'd be a platform client)
      throw new CustomError(messages.error.clientAlreadyInvited, 409);
    } else {
      // Client was invited by someone else, add this user as another inviter and resend code
      // console.log(`[createClientService] Client ${invitedClientAlreadyExists._id} was invited by others. Adding user ${userId} as inviter and refreshing code.`); // Removed log
      const registrationCode = utils.generateRegistrationCode();

      // Add user to the inviting user list for the client
      // await dbOps.updateInvitedClientWithNewRegistrationCodeAndUserWhoInvitedDbOp(invitedClientAlreadyExists._id, registrationCode, userId);
       await InvitedClient.findByIdAndUpdate(invitedClientAlreadyExists._id, {
         $push: { usersWhoHaveInvited: userId },
         $set: { registrationCode: registrationCode }, // Update the code
       });

      // Add client to this user's invited list
      // await dbOps.updateUserWithInvitedClientDbOp(userId, invitedClientAlreadyExists._id); // This seems redundant if the above adds the user? Check schema logic.
      // Let's assume the user needs the reference too:
       await User.findByIdAndUpdate(userId, {
         $push: { invitedClients: { _id: invitedClientAlreadyExists._id, status: "pending" } }
       });

      // console.log(`[createClientService] Added user ${userId} to inviters for ${invitedClientAlreadyExists._id} and updated registration code.`); // Removed log
      // TODO: Implement actual sending mechanism (email/SMS)
      utils.sendRegistrationCode(user, registrationCode); // Send the *new* code
      // console.log(`[createClientService] Registration code refreshed and message prepared for existing invited client ${invitedClientAlreadyExists._id}.`); // Removed log

      // Fetch the updated invited client to return the latest state
      const updatedInvitedClient = await InvitedClient.findById(invitedClientAlreadyExists._id).lean();
      return updatedInvitedClient;
    }
  }
};

export const createClientHandler = async (req, res, next) => {
  try {
    // console.log(`[createClientHandler] Received request to create/invite client from user ${req.id}. Body:`, req.body); // Removed log
    const clientResult = await createClientService(req.body, req.id);
    // console.log(`[createClientHandler] Successfully processed client creation/invitation for user ${req.id}. Result ID: ${clientResult._id}`); // Removed log

    // Determine if it's a new invite or linking to existing platform client
    const responseType = clientResult.users ? "linked_existing_client" : "invited_new_client";
    const message = responseType === "invited_new_client"
        ? messages.success.createSuccess
        : "Connection request sent to existing client."; // Or a more specific message

    return res.status(201).json({ // 201 Created is appropriate for new invites, maybe 200 OK for linking? Sticking to 201 for simplicity.
      data: {
        // Return consistent basic info regardless of type
        _id: clientResult._id, // Include ID
        firstName: clientResult.firstName,
        lastName: clientResult.lastName,
        email: clientResult.email,
        phone: clientResult.phone,
        status: responseType === 'invited_new_client' ? 'invited' : 'pending_connection', // Indicate status
        type: "client", // Keep original type indicator
      },
      message: message,
    });
  } catch (error) {
    // console.error(`[createClientHandler] Error processing client creation/invitation for user ${req.id}:`, error instanceof CustomError ? error.message : error); // Removed log
    // Pass the error to the centralized error handler
    next(error);
  }
};
