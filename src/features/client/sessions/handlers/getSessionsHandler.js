import Relationship from '../../../../common/models/Relationship.js';
import Client from '../../../../common/models/Client.js';

const messages = {
  error: {
    notFound: "Session not found",
    general: "An error occurred while fetching sessions.",
    forbidden: "You are not authorized to access this resource",
    invalidDate: "Invalid date format for startDate or endDate.",
    invalidPage: "Invalid page number.",
    invalidLimit: "Invalid limit number.",
  },
  success: "Sessions fetched successfully",
};

const getSessionsService = async (id, startDate, endDate, page) => {
  try {
    const client = await Client.findById(id);
    if (!client) {
      throw {
        status: 404,
        message: messages.error.notFound,
      };
    }

    const clientDefaultRelationship = client.defaultRelationship || client.relationships[0];
    if (!clientDefaultRelationship) {
      throw {
        status: 404,
        message: messages.error.notFound,
      };
    }

    const relationship = await Relationship.findById(clientDefaultRelationship)
      .populate({
        path: "sessions",
        select: "startTime endTime status createdAt updatedAt paymentStatus billingInformation",
      })
      .lean();

    if (!relationship) {
      throw {
        status: 404,
        message: messages.error.notFound,
      };
    }

    if (relationship.client.toString() !== id) {
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

const getSessionsHandler = async (req, res, next) => {
  const id = req.id;
  const { startDate, endDate, page } = req.query;

  try {
    const data = await getSessionsService(id, startDate, endDate, page);
    res.status(200).json({
      message: messages.success,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export default getSessionsHandler;