import Relationship from "../../../../common/models/Relationship.js";

const messages = {
  noteCreated: "Note created successfully",
  noteUpdated: "Note updated successfully",
  noteDeleted: "Note deleted successfully",
  noteNotFound: "Note not found",
  userNotInRelationship: "User is not in that relationship",
  relationshipNotFound: "Relationship not found"
};

const createReltationshipNoteService = async (id, relationshipId, content) => {
  console.log('createReltationshipNoteService - Input:', { id, relationshipId, content });
  
  const relationship = await Relationship.findById(relationshipId)
  console.log('createReltationshipNoteService - Found relationship:', relationship);
  
  if (!relationship) {
    console.log('createReltationshipNoteService - Relationship not found');
    throw { status: 404, message: messages.relationshipNotFound };
  }

  //confirm user is in that relationship
  if (relationship.user.toString() !== id) {
    console.log('createReltationshipNoteService - User not in relationship:', { 
      relationshipUser: relationship.user.toString(), 
      requestUserId: id 
    });
    throw { status: 403, message: messages.userNotInRelationship };
  }

  const note = {
    content,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const newNote = await Relationship.findByIdAndUpdate(
    relationshipId,
    { $push: { notes: note } },
    { new: true }
  );
  console.log('createReltationshipNoteService - Updated relationship with new note:', newNote);
  
  const createdNote = newNote.notes[newNote.notes.length - 1] || null;
  console.log('createReltationshipNoteService - Created note:', createdNote);
  
  return createdNote;
};

const createRelationshipNoteHandler = async (req, res, next) => {
  console.log('createRelationshipNoteHandler - Request:', { 
    id: req.id, 
    params: req.params, 
    body: req.body 
  });
  
  try {
    const id = req.id;
    const { relationshipId } = req.params;
    const { content } = req.body;
    
    const createdNote = await createReltationshipNoteService(
      id,
      relationshipId,
      content
    );
    console.log('createRelationshipNoteHandler - Note created successfully:', createdNote);
    
    res.status(201).json({ message: messages.noteCreated, data: createdNote });
  } catch (error) {
    console.error('createRelationshipNoteHandler - Error:', error);
    next(error);
  }
};

export default createRelationshipNoteHandler;