import Session from "../../../../common/models/Session.js";
import Relationship from "../../../../common/models/Relationship.js";

const messages = {
  success: {
    getRelationshipSessions: "Here are the sessions for the relationship you requested!",
  },
  error: {
    notFound: "Relationship not found",
  },
};

const getRelationshipSessionsService = async (relationshipId, startDate, endDate, page, userId) => {
  console.log(relationshipId, startDate, endDate, page, userId);

  // 1. Find the relationship and check if it belongs to the user
  const relationship = await Relationship.findById(relationshipId)
    .populate({
      path: "sessions",
      select: "startTime endTime status type notes createdAt updatedAt", // select only needed fields
    })
    .lean();

  if (!relationship) {
    throw {
      status: 404,
      message: messages.error.notFound,
    };
  }

  if (relationship.user.toString() !== userId) {
    throw {
      status: 403,
      message: "You do not have permission to view these sessions.",
    };
  }

  // 2. Filter sessions by startDate and endDate
  const start = new Date(startDate);
  const end = new Date(endDate);

  let filteredSessions = (relationship.sessions || []).filter(session => {
    const sessionStart = new Date(session.startTime);
    return sessionStart >= start && sessionStart <= end;
  });

  // 3. Pagination
  const limit = 20;
  const currentPage = page ? parseInt(page, 10) : 1;
  const total = filteredSessions.length;
  const totalPages = Math.ceil(total / limit);
  const paginatedSessions = filteredSessions
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime)) // newest first
    .slice((currentPage - 1) * limit, currentPage * limit);

  return {
    total,
    page: currentPage,
    totalPages,
    records: paginatedSessions,
  };
};

const getRelationshipSessionsHandler = async (req, res, next) => {
  const { startDate, endDate, page, relationshipId } = req.query;
  const id = req.id;
  try {
    const data = await getRelationshipSessionsService(relationshipId, startDate, endDate, page, id);
    res.status(200).json({ 
      data,
      message: messages.success.getRelationshipSessions
    });
  } catch (error) {
    next(error);
  }
};

export default getRelationshipSessionsHandler;