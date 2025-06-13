import Relationship from "../../../../common/models/Relationship.js";

const messages = {
  success: {
    noteDeleted: "Note deleted successfully",
  },
  error: {
    relationshipNotFound: "Relationship not found",
    noteNotFound: "Note not found",
    userNotInRelationship: "User is not in that relationship",
  },
};

const deleteRelationshipNoteService = async (userId, relationshipId, noteId) => {
  const relationship = await Relationship.findById(relationshipId);
  if (!relationship) {
    throw { status: 404, message: messages.error.relationshipNotFound };
  }

  // Confirm user is in that relationship
  if (relationship.user.toString() !== userId) {
    throw { status: 403, message: messages.error.userNotInRelationship };
  }

  // Find the note in the relationship's notes array
  const note = relationship.notes.id(noteId);
  if (!note) {
    throw { status: 404, message: messages.error.noteNotFound };
  }

  // Remove the note from the array
  relationship.notes.pull(noteId);
  await relationship.save();

  return {
    message: messages.success.noteDeleted,
  };
};

const deleteRelationshipNoteHandler = async (req, res, next) => {
  const { relationshipId, noteId } = req.params;
  const userId = req.id;

  try {
    const result = await deleteRelationshipNoteService(userId, relationshipId, noteId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export default deleteRelationshipNoteHandler;
