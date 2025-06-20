import Relationship from "../../../../../common/models/Relationship.js";
import { relationshipTimelineEntries } from "../../../../../common/models/Relationship.js";

const messages = {
  noteCreated: "Note created successfully",
  noteUpdated: "Note updated successfully",
  noteDeleted: "Note deleted successfully",
  noteNotFound: "Note not found",
  userNotInRelationship: "User is not in that relationship",
  relationshipNotFound: "Relationship not found"
};

const createReltationshipNoteService = async (id, relationshipId, content) => {
  const relationship = await Relationship.findById(relationshipId)
  
  if (!relationship) {
    throw { status: 404, message: messages.relationshipNotFound };
  }

  //confirm user is in that relationship
  if (relationship.user.toString() !== id) {
    throw { status: 403, message: messages.userNotInRelationship };
  }

  const note = {
    content,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const newNote = await Relationship.findByIdAndUpdate(
    relationshipId,
    { 
      $push: { 
        notes: note,
        timeline: {
          event: relationshipTimelineEntries.clientAddedNote(content, relationship.notes.length + 1),
          createdAt: new Date()
        }
      } 
    },
    { new: true }
  );
  
  const createdNote = newNote.notes[newNote.notes.length - 1] || null;
  
  return createdNote;
};

const createRelationshipNoteHandler = async (req, res, next) => {
  try {
    const id = req.id;
    const { relationshipId } = req.params;
    const { content } = req.body;
    
    const createdNote = await createReltationshipNoteService(
      id,
      relationshipId,
      content
    );
    
    res.status(201).json({ message: messages.noteCreated, data: createdNote });
  } catch (error) {
    next(error);
  }
};

export default createRelationshipNoteHandler;