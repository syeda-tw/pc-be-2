import Relationship from "../../../../../common/models/Relationship.js";

const messages = {
  relationshipNotFound: "Relationship not found",
  userNotInRelationship: "User is not in that relationship",
};

const getRelationshipTimelineService = async (relationshipId, userId) => {
  const relationship = await Relationship.findById(relationshipId);
  if (!relationship) {
    throw { status: 404, message: messages.relationshipNotFound };
  }
  if (relationship.user.toString() !== userId) {
    throw { status: 403, message: messages.userNotInRelationship };
  }
  return relationship.timeline;
};

const getRelationshipTimelineHandler = async (req, res, next) => {
  const { relationshipId } = req.params;
  const id = req.id;
  try {
    const timeline = await getRelationshipTimelineService(relationshipId, id);
    res.status(200).json(timeline);
  } catch (error) {
    next(error);
  }
};

export default getRelationshipTimelineHandler;