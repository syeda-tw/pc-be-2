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
        select: "firstName lastName email username availability practice",
        populate: {
          path: "practice",
          select: "businessName", // or add other fields as needed
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
          firstName: rel.user.firstName,
          lastName: rel.user.lastName,
          email: rel.user.email,
          username: rel.user.username,
          availability: rel.user.availability,
          relationshipType: rel.relationshipType,
          relationshipStatus: rel.relationshipStatus,
          relationshipId: rel._id,
          practiceId: rel.user.practice?._id,
          practiceBusinessName: rel.user.practice?.businessName,
          practiceBusinessWebsite: rel.user.practice?.website,
          
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
