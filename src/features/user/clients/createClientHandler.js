import User from "../../../common/models/User.js";
import Client from "../../../common/models/Client.js";
import Relationship from "../../../common/models/Relationship.js";
import InvitedClient from "../../../common/models/InvitedClient.js";
import { env } from "../../../common/config/env.js";

const messages = {
  client_already_exists: "Client is already a part of your network",
};

const sendInvitationSMSToExistingClient = async (clientName, userName) => {

};

const sendInvitationSMSToExistingInvitedClient = async (
  clientName,
  userName
) => {
  console.log("[DEBUG] Sending SMS to existing invited client");
  console.log(
    `Hello ${clientName}, ${userName} has invited you to join their network on Practicare. Visit ${env.FRONTEND_URL}/client-registeration to get started.`
  );
};

const createClientService = async (req, res) => {
  const { phone, firstName, lastName, email } = req.body;
  const userId = req.id;

  // 1. Find the user
  const user = await User.findById(userId);
  if (!user) {
    throw {
      message: messages.user_not_found,
      status: 404,
    };
  }

  // 2. Check if the client already exists on Practicare
  const existingClient = await Client.findOne({ phone });
  if (existingClient) {
    const relationship = user.relationships.some((relationship) =>
      relationship.client.equals(existingClient._id)
    );
    if (relationship) {
      throw {
        message: messages.client_already_exists,
        status: 400,
      };
    } else {
      sendInvitationSMSToExistingClient(
        `${existingClient.firstName} ${existingClient.lastName}`,
        `${user.firstName} ${user.lastName}`
      );
      // Create a new relationship between the user and the client
      const newRelationship = await Relationship.create({
        client: existingClient._id,
        clientModel: "Client",
        user: userId,
        //to-do: figure this out
        status: existingClient.status == "onboarded" ? "awaiting-platform-onboarding-complete" : "pending",
      });

      // Update the user's relationships
      user.relationships.push(newRelationship);
      await user.save();

      //update the client's relationships
      existingClient.relationships.push(newRelationship);
      await existingClient.save();

      return existingClient.toObject();
    }
  }

  // 3. Check if the client is an invited client on Practicare
  const invitedClient = await InvitedClient.findOne({ phone });
  if (invitedClient) {
    //check if user has relationship with invited client
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

      //update the user's relationships
      user.relationships.push(newRelationship);
      await user.save();

      //update the invited client's relationships
      invitedClient.relationships.push(newRelationship);
      await invitedClient.save();

      sendInvitationSMSToExistingInvitedClient(
        `${invitedClient.firstName} ${invitedClient.lastName}`,
        `${user.firstName} ${user.lastName}`
      );
      return invitedClient.toObject();
    }
  }
  const clientDoesNotExist = !existingClient && !invitedClient;

  if (clientDoesNotExist) {
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

      // Update user's relationships
      user.relationships.push(newRelationship);
      await user.save();

      // Update client's relationships
      newClient.relationships.push(newRelationship);
      await newClient.save();

      return newClient.toObject();
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.email) {
        throw {
          message: "Email is already in use.",
          status: 400,
        };
      } else if (error.code === 11000 && error.keyPattern?.phone) {
        throw {
          message: "Phone number is already in use.",
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
      message: error.message || "Internal server error"
    });
  }
};
