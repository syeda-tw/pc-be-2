import User from "../../../common/models/User.js";
import Client from "../../../common/models/Client.js";
import Relationship from "../../../common/models/Relationship.js";
import InvitedClient from "../../../common/models/InvitedClient.js";
import { env } from "../../../common/config/env.js";

const messages = {
  client_already_exists: "Client is already a part of your network",
};

const sendInvitationSMSToExistingClient = async (clientName, userName) => {
  console.log("[DEBUG] Sending SMS to existing client");
  console.log(
    `Hello ${clientName}, ${userName} has invited you to join their network on Practicare. Visit ${env.FRONTEND_URL}/client-login to get started.`
  );
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
  console.log("[DEBUG] Starting createClientService");
  const { phone, firstName, lastName, email } = req.body;
  const userId = req.id;
  console.log("[DEBUG] Request data:", {
    phone,
    firstName,
    lastName,
    email,
    userId,
  });

  // 1. Find the user
  console.log("[DEBUG] Finding user with ID:", userId);
  const user = await User.findById(userId);
  if (!user) {
    console.log("[DEBUG] User not found");
    throw {
      message: messages.user_not_found,
      status: 404,
    };
  }
  console.log("[DEBUG] User found:", user._id);

  // 2. Check if the client already exists on Practicare
  console.log("[DEBUG] Checking for existing client with phone:", phone);
  const existingClient = await Client.findOne({ phone });
  if (existingClient) {
    console.log("[DEBUG] Existing client found:", existingClient._id);
    const relationship = user.relationships.some((relationship) =>
      relationship.client.equals(existingClient._id)
    );
    if (relationship) {
      console.log("[DEBUG] Relationship already exists");
      throw {
        message: messages.client_already_exists,
        status: 400,
      };
    } else {
      console.log("[DEBUG] Creating new relationship with existing client");
      sendInvitationSMSToExistingClient(
        `${existingClient.firstName} ${existingClient.lastName}`,
        `${user.firstName} ${user.lastName}`
      );
      // Create a new relationship between the user and the client
      const newRelationship = await Relationship.create({
        client: existingClient._id,
        clientModel: "Client",
        user: userId,
        status: "pending",
      });
      console.log("[DEBUG] New relationship created:", newRelationship._id);

      // Update the user's relationships
      user.relationships.push(newRelationship);
      await user.save();
      console.log("[DEBUG] User relationships updated");

      //update the client's relationships
      existingClient.relationships.push(newRelationship);
      await existingClient.save();
      console.log("[DEBUG] Client relationships updated");

      return existingClient.toObject();
    }
  }

  // 3. Check if the client is an invited client on Practicare
  console.log("[DEBUG] Checking for invited client with phone:", phone);
  const invitedClient = await InvitedClient.findOne({ phone });
  if (invitedClient) {
    console.log("[DEBUG] Invited client found:", invitedClient._id);
    //check if user has relationship with invited client
    const relationship = user.relationships.some((relationship) =>
      relationship.client.equals(invitedClient._id)
    );
    if (relationship) {
      console.log("[DEBUG] Relationship already exists with invited client");
      throw {
        message: messages.client_already_exists,
        status: 400,
      };
    } else {
      console.log("[DEBUG] Creating new relationship with invited client");
      const newRelationship = await Relationship.create({
        client: invitedClient._id,
        user: userId,
        status: "pending",
        clientModel: "InvitedClient",
      });
      console.log("[DEBUG] New relationship created:", newRelationship._id);

      //update the user's relationships
      user.relationships.push(newRelationship);
      await user.save();
      console.log("[DEBUG] User relationships updated");

      //update the invited client's relationships
      invitedClient.relationships.push(newRelationship);
      await invitedClient.save();
      console.log("[DEBUG] Invited client relationships updated");

      sendInvitationSMSToExistingInvitedClient(
        `${invitedClient.firstName} ${invitedClient.lastName}`,
        `${user.firstName} ${user.lastName}`
      );
      return invitedClient.toObject();
    }
  }
  const clientDoesNotExist = !existingClient && !invitedClient;

  if (clientDoesNotExist) {
    console.log("[DEBUG] Creating new client with phone:", phone);

    try {
      const newClient = await Client.create({
        firstName,
        lastName,
        phone,
        email,
        relationships: [],
      });
      console.log("[DEBUG] New client created:", newClient._id);

      const newRelationship = await Relationship.create({
        client: newClient._id,
        clientModel: "InvitedClient",
        user: userId,
        status: "pending",
      });
      console.log("[DEBUG] New relationship created:", newRelationship._id);

      // Update user's relationships
      user.relationships.push(newRelationship);
      await user.save();
      console.log("[DEBUG] User relationships updated");

      // Update client's relationships
      newClient.relationships.push(newRelationship);
      await newClient.save();
      console.log("[DEBUG] Client relationships updated");

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
  console.log("[DEBUG] Starting createClientHandler");
  try {
    const client = await createClientService(req, res);
    console.log("[DEBUG] Client created successfully:", client._id);
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
    // Handle the error and send appropriate response
    console.error("[ERROR] Client creation failed:", error);
    res.status(error.status || 500).json({
      message: error.message || "Internal server error"
    });
  }
};
