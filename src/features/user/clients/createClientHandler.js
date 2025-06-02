import User from "../../../common/models/User.js";
import Client from "../../../common/models/Client.js";
import Relationship from "../../../common/models/Relationship.js";
import InvitedClient from "../../../common/models/InvitedClient.js";
import { env } from "../../../common/config/env.js";

const messages = {
  client_already_exists: "This client is already in your network",
  user_not_found: "We couldn't find your account",
  client_created: "Client successfully added to your network",
  email_in_use: "This email address is already registered",
  phone_in_use: "This phone number is already registered",
  internal_error: "Something went wrong. Please try again"
};

const sendInvitationSMSToExistingClient = async (clientName, userName) => {
  // TODO: Implement SMS sending logic
};

const sendInvitationSMSToExistingInvitedClient = async (clientName, userName) => {
  console.log("[DEBUG] Sending SMS to existing invited client");
  console.log(
    `Hello ${clientName}, ${userName} has invited you to join their network on Practicare. Visit ${env.FRONTEND_URL}/client-registration to get started.`
  );
};

const createClientService = async (req, res) => {
  const { phone, firstName, lastName, email } = req.body;
  const userId = req.id;

  // 1. Find the user
  const user = await User.findById(userId).populate("relationships");
  if (!user) {
    throw {
      message: messages.user_not_found,
      status: 404,
    };
  }

  // 2. Check if the client already exists on Practicare
  const existingClient = await Client.findOne({ phone });
  if (existingClient) {
    //if client exists on practicares, check if they are already in the user's network
    const relationship = user.relationships.some((relationship) =>
      relationship.client.equals(existingClient._id)
    );
    if (relationship) {
      //client is already on the platform, added to users network, 
      //TODO: check what is their relationship to the client
      throw {
        message: messages.client_already_exists,
        status: 400,
      };
    } else {
      //client is not in the user's network, send invitation SMS
      sendInvitationSMSToExistingClient(
        `${existingClient.firstName} ${existingClient.lastName}`,
        `${user.firstName} ${user.lastName}`
      );
      
      const newRelationship = await Relationship.create({
        client: existingClient._id,
        clientModel: "Client",
        user: userId,
        status:"pending"
      });

      user.relationships.push(newRelationship);
      await user.save();

      existingClient.relationships.push(newRelationship);
      await existingClient.save();

      return existingClient.toObject();
    }
  }

  // 3. Check if the client is an invited client on Practicare
  const invitedClient = await InvitedClient.findOne({ phone });
  if (invitedClient) {

    //check if invited client is already in the user's network
    const relationship = user.relationships.some((relationship) =>
      relationship.client.equals(invitedClient._id)
    );
    if (relationship) {
      throw {
        message: messages.client_already_exists,
        status: 400,
      };
    } else {
      const newRelationship = await Relationship.create({
        client: invitedClient._id,
        user: userId,
        status: "pending",
        clientModel: "InvitedClient",
      });

      user.relationships.push(newRelationship);
      await user.save();

      invitedClient.relationships.push(newRelationship);
      await invitedClient.save();

      sendInvitationSMSToExistingInvitedClient(
        `${invitedClient.firstName} ${invitedClient.lastName}`,
        `${user.firstName} ${user.lastName}`
      );
      return invitedClient.toObject();
    }
  }

  // 4. Create new invited client if they don't exist
  if (!existingClient && !invitedClient) {
    try {
      const newClient = await InvitedClient.create({
        firstName,
        lastName,
        phone,
        email,
        relationships: [],
      });

      const newRelationship = await Relationship.create({
        client: newClient._id,
        clientModel: "InvitedClient",
        user: userId,
        status: "pending",
      });

      user.relationships.push(newRelationship);
      await user.save();

      newClient.relationships.push(newRelationship);
      await newClient.save();

      return newClient.toObject();
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.email) {
        throw {
          message: messages.email_in_use,
          status: 400,
        };
      } else if (error.code === 11000 && error.keyPattern?.phone) {
        throw {
          message: messages.phone_in_use,
          status: 400,
        };
      } else {
        throw error;
      }
    }
  }
};

export const createClientHandler = async (req, res) => {
  try {
    const client = await createClientService(req, res);
    res.status(200).json({
      message: messages.client_created,
      client: {
        _id: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        phone: client.phone,
        email: client.email,
        relationships: client.relationships,
      },
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || messages.internal_error
    });
  }
};
