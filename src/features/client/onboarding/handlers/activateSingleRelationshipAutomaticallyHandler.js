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
  try {
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

    try {
      // update relationsip status to active
      relationship.status = "active";
      await relationship.save();
      return relationship.user;
    } catch (saveError) {
      console.error('Error saving relationship:', saveError);
      throw {
        message: messages.error.relationshipNotFound,
        status: 500
      };
    }
  } catch (error) {
    console.error('Error in activateSingleRelationshipAutomaticallyService:', error);
    throw error;
  }
};

const activateSingleRelationshipAutomaticallyHandler = async (req, res) => {
  try {
    await activateSingleRelationshipAutomaticallyService(req.id);
    res.status(200).json({ message: messages.success });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || messages.error.userNotFound;
    res.status(status).json({ message });
  }
};

export default activateSingleRelationshipAutomaticallyHandler;