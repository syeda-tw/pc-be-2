import User from "../../../common/models/User";
import Client from "../../../common/models/Client";
import Relationship from "../../../common/models/Relationships";
import InvitedClient from "../../../common/models/InvitedClient";
import env from "../../../config/env";

const messages = {
  client_already_exists: "Client is already a part of your network",
};

const sendInvitationSMSToExistingClient = async (clientName, userName) => {
  console.log(
    `Hello ${clientName}, ${userName} has invited you to join their network on Practicare. Visit ${env.FRONTEND_URL}/client-login to get started.`
  );
};

const sendInvitationSMSToExistingInvitedClient = async (
  clientName,
  userName
) => {
  console.log(
    `Hello ${clientName}, ${userName} has invited you to join their network on Practicare. Visit ${env.FRONTEND_URL}/client-registeration to get started.`
  );
};

const createClientService = async (req, res) => {
  const { phone, firstName, lastName, email } = req.body;
  const userId = req.id;

  // 1. Find the user
  const user = await User.findById(userId);
  if (!user)
    throw {
      message: messages.user_not_found,
      status: 404,
    };

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
      const newRelationship = await Relationship.create(
        {
          client: existingClient._id,
          clientModel: "Client",
          user: userId,
          status: "pending",
        },
        {
          new: true,
        }
      );
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
    const newClient = await Client.create(
      {
        firstName,
        lastName,
        phone,
        email,
        relationships: [],
      },
      {
        new: true,
      }
    );

    const newRelationship = await Relationship.create(
      {
        client: newClient._id,
        clientModel: "Client",
        user: userId,
        status: "pending",
      },
      {
        new: true,
      }
    );

    // Update user's relationships
    user.relationships.push(newRelationship);
    await user.save();

    // Update client's relationships
    newClient.relationships.push(newRelationship);
    await newClient.save();

    return newClient.toObject();
  }
};

const createClientHandler = async (req, res) => {
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
    res.status(500).json({ error: error.message });
  }
};
