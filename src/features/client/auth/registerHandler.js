import Client from "../../../common/models/client.js";
import InvitedClient from "../../../common/models/invitedClient.js";
import User from "../../../common/models/user.js";
import jwt from "jsonwebtoken";
import { sanitizeClient } from "./utils.js";
import CustomError from "../../../common/utils/customError.js";

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

const generateToken = (payload) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }
    return jwt.sign(payload, secret, { expiresIn: "200h" });
};

// Function to create a new client from an invited client
const createClientDbOp = async (phone, code, password) => {

    // Find the invited client by phone number
    const invitedClient = await InvitedClient.findOne({ phone });
    

    // Check if the invited client exists
    if (!invitedClient) {
        // Throw error if the invited client is not found
        throw new CustomError(400, messages.error.clientNotFound);
    }

    // Validate the registration code
    if (invitedClient.registration_code !== code) {
        // Throw error if the registration code is invalid
        throw new CustomError(400, "Invalid registration code");
    }


    // Prepare client data for creation
    const clientData = {
        password,
        phone,
        first_name: invitedClient.first_name,
        last_name: invitedClient.last_name,
        middle_name: invitedClient.middle_name,
        email: invitedClient.email,
        users: invitedClient.users_who_have_invited.map(userId => ({ user: userId, status: "pending" }))
    };

    // Create and save the new client
    const client = new Client(clientData);
    await client.save();

    // Update each user who invited the client
    for (const userId of invitedClient.users_who_have_invited) {
        const user = await User.findById(userId);
        if (user) {
            // Remove the specific invited client from the user's invited_clients list
            user.invited_clients = user.invited_clients.filter(
                invitedClientId => invitedClientId.toString() !== invitedClient._id.toString()
            );
            // Add the new client to the user's clients list
            user.clients = [...user.clients, { client: client._id, status: "pending" }];
            await user.save();
        }
    }

    // Delete the invited client record
    await InvitedClient.deleteOne({ phone });

    // Return the newly created client
    return client;
}

const registerHandler = async (req, res) => {
    try {
        const { password, phone, code } = req.body;
        const client = await createClientDbOp(phone, code, password);
        const token = generateToken({ id: client._id });
        res.status(201).json({ message: messages.success.clientCreated, data: sanitizeClient(client), token });
    } catch (error) {
        console.error("Error in registerHandler:", error);
        res.status(500).json({ message: error.message || messages.error.clientCreationFailed});
    }
}

export default registerHandler; 