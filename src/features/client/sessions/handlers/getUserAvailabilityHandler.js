import User from "../../../../common/models/User.js";
import Client from "../../../../common/models/Client.js";
import Relationship from "../../../../common/models/Relationship.js";

const messages = {
  success: "User availability retrieved successfully",
  error: {
    generalError: "Error getting user availability",
    invalidId: "Invalid user ID provided",
    invalidRelationship: "Invalid relationship ID provided",
    unauthorized: "You are not authorized to access this user's availability",
    userNotFound: "User not found",
  },
};

const getUserAvailabilityService = async (id, relationshipId) => {

  // Get the client
  const client = await Client.findById(id);
  if (!client) {
    throw {
      status: 404,
      message: messages.error.invalidId,
    };
  }

  //Check if relationship id is in client relationships
  const relationship = client.relationships.find(
    (relationship) => relationship._id.toString() === relationshipId
  );
  if (!relationship) {
    throw {
      status: 404,
      message: messages.error.invalidRelationship,
    };
  }

  // Fetch relationship with populated user availability
  const relationshipWithUserAvailability = await Relationship.findById(relationshipId).populate('user');
  if (!relationshipWithUserAvailability) {
    throw {
      status: 404,
      message: messages.error.invalidRelationship,
    };
  }

  // Verify client belongs to relationship
  if (relationshipWithUserAvailability?.client?.toString() !== id) {
    throw {
      status: 403,
      message: messages.error.unauthorized,
    };
  }

  return relationshipWithUserAvailability.user.availability;
};

const getUserAvailabilityHandler = async (req, res, next) => {
  const id = req.id;
  const { relationshipId } = req.params;

  try {
    const availability = await getUserAvailabilityService(
      id,
      relationshipId,
    );
    res.status(200).json({
      message: messages.success,
      data: availability,
    });
  } catch (error) {
    next(error);
  }
};

export default getUserAvailabilityHandler;
