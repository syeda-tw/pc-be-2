import Client from "../../../../common/models/Client.js";
import Relationship from "../../../../common/models/Relationship.js";

const messages = {
  notFound: "Relationship not found",
  success: "Default relationship switched successfully",
  error: "Error switching default relationship",
};

const switchDefaultRelationshipService = async (relationshipId, clientId) => {
  const relationship = await Relationship.findById(relationshipId);
  if (!relationship) {
    throw { status: 404, message: messages.notFound };
  }
  // Check if the relationship belongs to the client
  if (relationship.client.toString() !== clientId) {
    throw {
      status: 403,
      message: "You are not authorized to access this relationship",
    };
  }

  // Update client's default relationship
  const client = await Client.findById(clientId);
  if (!client) {
    throw { status: 404, message: "Client not found" };
  }

  client.defaultRelationship = relationshipId;
  await client.save();

  return relationship;
};

const switchDefaultRelationshipHandler = async (req, res) => {
  const { relationshipId } = req.body;

  const relationship = await switchDefaultRelationshipService(
    relationshipId,
    req.id
  );

  res.status(200).json({
    message: messages.success,
    relationship: relationship,
  });
};

export default switchDefaultRelationshipHandler;
