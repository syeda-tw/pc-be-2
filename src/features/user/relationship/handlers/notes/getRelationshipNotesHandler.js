import Relationship from "../../../../../common/models/Relationship.js";

const messages = {
  success: {
    notesRetrieved: "Notes retrieved successfully",
  },
  error: {
    relationshipNotFound: "Relationship not found",
    userNotInRelationship: "User is not in that relationship",
    invalidPagination: "Invalid pagination parameters",
  },
};

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

const getRelationshipNotesService = async (
  userId,
  relationshipId,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
) => {
  // Validate pagination parameters
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);

  if (
    isNaN(page) ||
    page < 1 ||
    isNaN(pageSize) ||
    pageSize < 1 ||
    pageSize > MAX_PAGE_SIZE
  ) {
    throw { status: 400, message: messages.error.invalidPagination };
  }

  const relationship = await Relationship.findById(relationshipId);
  if (!relationship) {
    throw { status: 404, message: messages.error.relationshipNotFound };
  }

  // Confirm user is in that relationship
  if (relationship.user.toString() !== userId) {
    throw { status: 403, message: messages.error.userNotInRelationship };
  }

  // Get total count of notes
  const totalNotes = relationship.notes.length;
  const totalPages = Math.ceil(totalNotes / pageSize);

  // Calculate skip and limit for pagination
  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  // Get paginated notes, sorted by createdAt in descending order (newest first)
  const notes = relationship.notes
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(skip, skip + limit)
    .map((note) => ({
      id: note._id,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));

  return {
    notes,
    total: totalNotes,
    totalPages
  };
};

const getRelationshipNotesHandler = async (req, res, next) => {
  const { relationshipId } = req.params;
  const { page, pageSize } = req.query;
  const userId = req.id;

  try {
    const result = await getRelationshipNotesService(
      userId,
      relationshipId,
      page,
      pageSize
    );
    res.status(200).json({
      message: messages.success.notesRetrieved,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export default getRelationshipNotesHandler;