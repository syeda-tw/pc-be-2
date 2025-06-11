import Session from "../../../../common/models/Session.js";
import Relationship from "../../../../common/models/Relationship.js";

const messages = {
  success: {
    getRelationshipSessions:
      "Here are the sessions for the relationship you requested!",
  },
  error: {
    notFound: "Relationship not found",
    general: "An error occurred while fetching relationship sessions.",
    forbidden: "You do not have permission to view these sessions.",
    invalidDate: "Invalid date format for startDate or endDate.",
  },
};

const getRelationshipSessionsService = async (
  relationshipId,
  startDate,
  endDate,
  page,
  userId
) => {
  try {
    const relationship = await Relationship.findById(relationshipId)
      .populate({
        path: "sessions",
        select: "startTime endTime paymentStatus createdAt updatedAt",
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
        message: messages.error.forbidden,
      };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw {
        status: 400,
        message: messages.error.invalidDate,
      };
    }

    const allSessions = relationship.sessions || [];
    const filteredSessions = allSessions.filter((session) => {
      const sessionStart = new Date(session.startTime);
      return sessionStart >= start && sessionStart <= end;
    });

    const limit = 20;
    const currentPage = parseInt(page, 10) || 1;
    const total = filteredSessions.length;
    const totalPages = Math.ceil(total / limit);

    const paginatedSessions = filteredSessions
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .slice((currentPage - 1) * limit, currentPage * limit);

    return {
      total,
      page: currentPage,
      totalPages,
      records: paginatedSessions,
    };
  } catch (err) {
    if (err && typeof err === "object" && "status" in err && "message" in err) {
      throw err;
    }

    throw {
      status: 500,
      message: messages.error.general,
    };
  }
};


const getRelationshipSessionsHandler = async (req, res, next) => {
  const { startDate, endDate, page, relationshipId } = req.query;
  const id = req.id;

  try {
    const data = await getRelationshipSessionsService(
      relationshipId,
      startDate,
      endDate,
      page,
      id
    );

    res.status(200).json({
      data,
      message: messages.success.getRelationshipSessions,
    });
  } catch (err) {
    next(err);
  }
};

export default getRelationshipSessionsHandler;
