import Relationship from "../../../../common/models/Relationship.js";

const messages = {
  success: {
    noteUpdated: "Note updated successfully",
  },
  error: {
    relationshipNotFound: "Relationship not found",
    noteNotFound: "Note not found",
    userNotInRelationship: "User is not in that relationship",
    invalidContent: "Note content is required",
  },
};

const editRelationshipNoteService = async (userId, relationshipId, noteId, content) => {
  if (!content || content.trim() === "") {
    throw { status: 400, message: messages.error.invalidContent };
  }

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

  // Update only the note content and updatedAt timestamp
  note.content = content;
  note.updatedAt = new Date();

  await relationship.save();

  return {
    note: {
      id: note._id,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    },
  };
};

const editRelationshipNoteHandler = async (req, res, next) => {
  const { relationshipId, noteId } = req.params;
  const { content } = req.body;
  const userId = req.id;

  try {
    const { note } = await editRelationshipNoteService(userId, relationshipId, noteId, content);
    res.status(200).json({
      message: messages.success.noteUpdated,
      note,
    });
  } catch (err) {
    next(err);
  }
};

export default editRelationshipNoteHandler;
