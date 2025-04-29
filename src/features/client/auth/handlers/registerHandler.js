import Client from "../../../../common/models/client.js";
import InvitedClient from "../../../../common/models/invitedClient.js";
import User from "../../../../common/models/user.js";
import { sanitizeClient } from "../../utils.js";
import CustomError from "../../../../common/utils/customError.js";
import { hashPassword, generateToken } from "../../../user/auth/utils.js";

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

    if (invitedClient.registration_code !== code) {
        throw new CustomError(400, "Invalid registration code");
    }

    const clientData = {
        password: await hashPassword(password),
        phone,
        first_name: invitedClient.first_name,
        last_name: invitedClient.last_name,
        middle_name: invitedClient.middle_name,
        email: invitedClient.email,
        users: invitedClient.users_who_have_invited.map(userId => ({ user: userId, status: "pending" }))
    };

    const client = new Client(clientData);
    await client.save();

    for (const userId of invitedClient.users_who_have_invited) {
        const user = await User.findById(userId);
        if (user) {
            user.invited_clients = user.invited_clients.filter(
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
