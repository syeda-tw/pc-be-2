//this api is used when client is on onboarding step 3, and they want a list of the people who invited them
import Client from "../../../../common/models/Client.js";
import Relationship from "../../../../common/models/Relationship.js";

const messages = {
  success: "Relationships fetched successfully",
  error: {
    notFound: "Client not found",
    fetchFailed: "Failed to fetch relationships",
  },
};

const getRelationshipsService = async (clientId) => {
  try {
    const client = await Client.findById(clientId);
    if (!client) {
      throw {
        message: messages.error.notFound,
        status: 404,
      };
    }

    const relationships = await Relationship.find({
      _id: { $in: client.relationships },
    })
      .populate({
        path: "user",
        select: "firstName lastName email username availability practice sessionCost sessionDuration",
        populate: {
          path: "practice",
          select: "name", // or add other fields as needed
        },
      })
      .lean();

    return relationships;
  } catch (error) {
    throw {
      message: messages.error.fetchFailed,
      details: error.message || error,
      status: error.status || 500,
    };
  }
};



const getRelationshipsUserHandler = async (req, res) => {
  try {
    const relationships = await getRelationshipsService(req.id);
    res.status(200).json({
      message: messages.success,
      data: relationships.map((rel) => {
        return {
          _id: rel.user._id,
          firstName: rel.user.firstName,
          lastName: rel.user.lastName,
          email: rel.user.email,
          username: rel.user.username,
          availability: rel.user.availability,
          relationshipType: rel.relationshipType,
          relationshipStatus: rel.relationshipStatus,
          relationshipId: rel._id,
          practiceId: rel.user.practice?._id,
          practiceName: rel.user.practice?.name,
          practiceBusinessWebsite: rel.user.practice?.website,
          userSessionCost: rel.user.sessionCost,
          userSessionDuration: rel.user.sessionDuration,
          
        };
      }),
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Internal server error",
      error: error.details || null,
    });
  }
};

export default getRelationshipsUserHandler;
