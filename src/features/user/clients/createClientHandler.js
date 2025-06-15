import User from "../../../common/models/User.js";
import Client from "../../../common/models/Client.js";
import Relationship from "../../../common/models/Relationship.js";
import InvitedClient from "../../../common/models/InvitedClient.js";
import { env } from "../../../common/config/env.js";

const messages = {
  error: {
    clientAlreadyExists: "This client is already in your network",
    userNotFound: "We couldn't find your account",
    emailInUse: "This email address is already registered",
    phoneInUse: "This phone number is already registered",
    internalError: "Something went wrong. Please try again"
  },
  success: {
    clientCreated: "Client successfully added to your network"
  }
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

const createClientService = async (data, userId) => {
  const { phone, firstName, lastName, email } = data;

  const user = await User.findById(userId).populate("relationships");
  if (!user) {
    throw { status: 404, message: messages.error.userNotFound };
  }

  const existingClient = await Client.findOne({ phone });
  if (existingClient) {
    const relationship = user.relationships.some((relationship) =>
      relationship.client.equals(existingClient._id)
    );
    if (relationship) {
      throw { status: 400, message: messages.error.clientAlreadyExists };
    }

    await sendInvitationSMSToExistingClient(
      `${existingClient.firstName} ${existingClient.lastName}`,
      `${user.firstName} ${user.lastName}`
    );
    
    const newRelationship = await Relationship.create({
      client: existingClient._id,
      clientModel: "Client",
      user: userId,
      status: "pending"
    });

    user.relationships.push(newRelationship);
    await user.save();

    existingClient.relationships.push(newRelationship);
    await existingClient.save();

    return existingClient.toObject();
  }

  const invitedClient = await InvitedClient.findOne({ phone });
  if (invitedClient) {
    const relationship = user.relationships.some((relationship) =>
      relationship.client.equals(invitedClient._id)
    );
    if (relationship) {
      throw { status: 400, message: messages.error.clientAlreadyExists };
    }

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

    await sendInvitationSMSToExistingInvitedClient(
      `${invitedClient.firstName} ${invitedClient.lastName}`,
      `${user.firstName} ${user.lastName}`
    );
    return invitedClient.toObject();
  }

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
      throw { status: 400, message: messages.error.emailInUse };
    } else if (error.code === 11000 && error.keyPattern?.phone) {
      throw { status: 400, message: messages.error.phoneInUse };
    }
    throw { status: 500, message: messages.error.internalError };
  }
};

const createClientHandler = async (req, res) => {
  try {
    const client = await createClientService(req.body, req.id);
    res.status(200).json({
      message: messages.success.clientCreated,
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
    res.status(error.status || 500).json({ message: error.message });
  }
};

export default createClientHandler;
