import Client from "../../../common/models/client.js";
import InvitedClient from "../../../common/models/invitedClient.js";
import User from "../../../common/models/User.js";
import CustomError from "../../../common/utils/customError.js";
import { env } from "../../../common/config/env.js";

const messages = {
    error: {
        clientAlreadyInvited: "Client already invited",
        clientAlreadyRejected: "Client already rejected",
        clientAlreadyAccepted: "Client already accepted",
    },
    success: {
        createSuccess: "Client created successfully"
    }
}

const utils = {
    generateRegistrationCode: () => {
        const code = Math.random().toString(36).substring(2, 7).toUpperCase();
        return code;
    },
    sendRegistrationCode: (user, code) => {
        return `Welcome to Practicare!
      
      You've been invited by ${user.first_name} ${user.last_name} to join their network.
      
      Your registration code: ${code}
      
      Use this code to log in and complete your setup.
      
      Get started at: ${env.NODE_ENV === 'development' ? env.FRONTEND_URL_LOCAL : env.FRONTEND_URL_PRODUCTION}/client-registration`;
    }
}

const dbOps = {
    getClientByPhoneNumberDbOp: async (phoneNumber) => {
        try {
            const client = await Client.findOne({ phone: phoneNumber });
            if (!client) {
                return null;
            }
            return client;
        } catch (error) {
            console.error("Error in getClientByPhoneNumberDbOp:", error);
            throw error;
        }
    },

    getInvitedClientByPhoneNumberDbOp: async (phoneNumber) => {
        try {
            const client = await InvitedClient.findOne({ phone: phoneNumber });
            if (!client) {
                return null;
            }
            return client;
        } catch (error) {
            console.error("Error in getInvitedClientByPhoneNumberDbOp:", error);
            throw error;
        }
    },

    createInvitedClientDbOp: async (clientData) => {
        try {
            const client = await InvitedClient.create(clientData);
            return client;
        } catch (error) {
            console.error("Error in createInvitedClientDbOp:", error);
            throw error;
        }
    },

    updateUserWithInvitedClientDbOp: async (userId, invitedClientId) => {
        try {
            const user = await User.findById(userId);
            user.invited_clients = [...user.invited_clients, invitedClientId];
            await user.save();
        } catch (error) {
            console.error("Error in updateUserWithInvitedClientDbOp:", error);
            throw error;
        }
    },

    updateInvitedClientWithNewRegistrationCodeAndUserWhoInvitedDbOp: async (invitedClientId, newRegistrationCode, userId) => {
        try {
            const invitedClient = await InvitedClient.findById(invitedClientId);
            invitedClient.registration_code = newRegistrationCode;
            invitedClient.users_who_have_invited = [...invitedClient.users_who_have_invited, userId];
            await invitedClient.save();
        } catch (error) {
            console.error("Error in updateInvitedClientWithNewRegistrationCodeAndUserWhoInvitedDbOp:", error);
            throw error;
        }
    },

    updateUserWithClientDbOp: async (userId, clientId) => {
        try {
            const user = await User.findById(userId);
            user.clients = [...user.clients, { _id: clientId, status: 'pending' }];
            await user.save();
        } catch (error) {
            console.error("Error in updateUserWithClientDbOp:", error);
            throw error;
        }
    },

    updateClientWithUserDbOp: async (clientId, userId) => {
        try {
            const client = await Client.findById(clientId);
            client.users = [...client.users, { _id: userId, status: 'pending' }];
            await client.save();
        } catch (error) {
            console.error("Error in updateClientWithUserDbOp:", error);
            throw error;
        }
    },
}

const createClientService = async (clientData, userId) => {
    const { phone: phoneNumber } = clientData;
    //if client is already on the platform
    const user = await User.findById(userId);
    const clientAlreadyOnPlatform = await dbOps.getClientByPhoneNumberDbOp(phoneNumber);
    
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
        const clientAlreadyInvited = await dbOps.getInvitedClientByPhoneNumberDbOp(phoneNumber);
        if (clientAlreadyInvited) {
            if (clientAlreadyInvited.users_who_have_invited.includes(userId)) {
                throw new CustomError(messages.error.clientAlreadyInvited, 400);
            }
            else {
                //client is invited by another user
                const newRegistrationCode = utils.generateRegistrationCode();
                await dbOps.updateUserWithInvitedClientDbOp(userId, clientAlreadyInvited._id);
                await dbOps.updateInvitedClientWithNewRegistrationCodeAndUserWhoInvitedDbOp(clientAlreadyInvited._id, newRegistrationCode, userId);
                console.log(utils.sendRegistrationCode(user, newRegistrationCode));
            }
        }
        else {
            console.log("client is not invited nor on the platform - then we are inviting client to the platform");
            console.log("clientData", clientData);
            //client is not invited nor on the platform - then we are inviting client to the platform
            const invitedClientData = {
                phone: phoneNumber,
                first_name: clientData.first_name,
                last_name: clientData.last_name,
                email: clientData.email,
                registration_code: utils.generateRegistrationCode(),
                users_who_have_invited: [userId],
            }
            const invitedClient = await dbOps.createInvitedClientDbOp(invitedClientData);
            // TODO: use message sending
            console.log(utils.sendRegistrationCode(user, invitedClient.registration_code));
            await dbOps.updateUserWithInvitedClientDbOp(userId, invitedClient._id);
            return invitedClient;
        }
    }
};

export const createClientHandler = async (req, res, next) => {
    try {
        const client = await createClientService(req.body.data, req.body.decodedToken._id);
        return res.status(201).json({
            data: {
                first_name: client.first_name,
                last_name: client.last_name,
                email: client.email,
                phone: client.phone,
                type: "client",
            },
            message: messages.success.createSuccess
        });
    } catch (error) {
        next(error);
    }
};
