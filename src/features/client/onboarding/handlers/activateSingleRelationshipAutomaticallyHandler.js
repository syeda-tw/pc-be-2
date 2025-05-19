import Client from "../../../../common/models/Client.js";
import User from "../../../../common/models/User.js";
import Relationship from "../../../../common/models/Relationship.js";

const messages = {
  success: "Great! We've successfully connected you with your provider",
  error: {
    userNotFound: "We couldn't find your provider's account",
    clientNotFound: "We couldn't find your account",
    relationshipNotFound: "We couldn't find your connection with your provider",
    clientMustHaveExactlyOneRelationship: "You can only connect with one provider at a time",
  },
};

const activateSingleRelationshipAutomaticallyService = async (clientId) => {
  // Get client and populate relationships
  const client = await Client.findById(clientId).populate({
    path: 'relationships',
  });

  if (!client) {
    throw {
      message: messages.error.clientNotFound,
      status: 404
    };
  }

  // Check if client has exactly one relationship
  if (!client.relationships || client.relationships.length !== 1) {
    throw {
      message: messages.error.clientMustHaveExactlyOneRelationship,
      status: 400
    };
  }

  // Get the first (and only) relationship
  const relationship = client.relationships[0];

  // update relationsip status to active
  relationship.status = "active";
  await relationship.save();

  return relationship.user;
};

const activateSingleRelationshipAutomaticallyHandler = async (req, res) => {
  try {
    const user = await activateSingleRelationshipAutomaticallyService(req.id);
    res.status(200).json({ message: messages.success });
  } catch (error) {
    res.status(500).json({ message: messages.error.userNotFound });
  }
};

export default activateSingleRelationshipAutomaticallyHandler;