import Client from "../../../common/models/client.js";
import InvitedClient from "../../../common/models/invitedClient.js";
import User from "../../../common/models/user.js";

const messages = {
    success: {
        clientCreated: "Client created successfully",
        clientUpdated: "Client updated successfully"
    },
    error: {
        clientCreationFailed: "Failed to create client",
        clientUpdateFailed: "Failed to update client"
    }
};

const generateToken = (payload) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }
    return jwt.sign(payload, secret, { expiresIn: "200h" });
  };

const registerHandler = async (req, res) => {
    try {
        const { email, password, phone, code } = req.body;

        const invitedClient = await InvitedClient.findOne({ phone });

        if (!invitedClient) {
            return res.status(400).json({ message: messages.error.clientNotFound });
        }
        if (invitedClient.registration_code !== code) {
            return res.status(400).json({ message: "Invalid registration code" });
        }

        const clientData = {
            email,
            password,
            phone,
            first_name: invitedClient.first_name,
            last_name: invitedClient.last_name,
            users_who_have_invited: invitedClient.users_who_have_invited
        };

        const client = new Client(clientData);
        await client.save();

        for (const userId of invitedClient.users_who_have_invited) {
            const user = await User.findById(userId);
            if (user) {
                user.invited_clients = user.invited_clients.filter(
                    invitedClient => invitedClient._id.toString() !== invitedClient._id.toString()
                );
                user.clients = [...user.clients, client._id];
                await user.save();
            }
        }

        await InvitedClient.deleteOne({ phone });
        const token = generateToken({ id: client._id, email: client.email });
        res.status(201).json({ message: messages.success.clientCreated, client, token });

        res.status(201).json({ message: messages.success.clientCreated });
    } catch (error) {
        console.error("Error in registerHandler:", error);
        res.status(500).json({ message: messages.error.clientCreationFailed });
    }
}

export default registerHandler;