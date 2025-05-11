import Client from "../../../../common/models/Client.js";
import InvitedClient from "../../../../common/models/InvitedClient.js";
import User from "../../../../common/models/User.js";
import { sanitizeClient } from "../../utils.js";
import CustomError from "../../../../common/utils/customError.js";
import { hashPassword, generateToken } from "../../../common/utils.js";

const messages = {
    success: {
        clientCreated: "Client created successfully",
        clientUpdated: "Client updated successfully"
    },
    error: {
        clientCreationFailed: "Failed to create client",
        clientUpdateFailed: "Failed to update client",
        clientNotFound: "The phone number you entered is not registered with Practicare"
    }
};

const createClientFromInvitation = async (phone, code, password) => {
    const invitedClient = await InvitedClient.findOne({ phone });

    if (!invitedClient) {
        throw new CustomError(400, messages.error.clientNotFound);
    }

    if (invitedClient.registrationCode !== code) {
        throw new CustomError(400, "Invalid registration code");
    }

    const clientData = {
        password: await hashPassword(password),
        phone,
        firstName: invitedClient.firstName,
        lastName: invitedClient.lastName,
        middleName: invitedClient.middleName,
        email: invitedClient.email,
        users: invitedClient.usersWhoHaveInvited.map(userId => ({ user: userId, status: "pending" }))
    };

    const client = new Client(clientData);
    await client.save();

    for (const userId of invitedClient.usersWhoHaveInvited) {
        const user = await User.findById(userId);
        if (user) {
            user.invitedClients = user.invitedClients.filter(
                invitedClientId => invitedClientId.toString() !== invitedClient._id.toString()
            );
            user.clients = [...user.clients, { client: client._id, status: "pending" }];
            await user.save();
        }
    }

    await InvitedClient.deleteOne({ phone });

    return client;
};

const handleClientRegistration = async (req, res) => {
    try {
        const { password, phone, code } = req.body;
        const client = await createClientFromInvitation(phone, code, password);
        const token = generateToken({ _id: client._id });
        res.status(201).json({ message: messages.success.clientCreated, data: sanitizeClient(client), token });
    } catch (error) {
        console.error("Error in handleClientRegistration:", error);
        res.status(500).json({ message: error.message || messages.error.clientCreationFailed });
    }
};

export default handleClientRegistration;
