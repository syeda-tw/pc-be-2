import Session from "../../../../common/models/Session.js";
import User from "../../../../common/models/User.js";

const messages = {
  error: "Error fetching sessions",
  success: "Sessions fetched successfully",
  notFound: "No sessions found",
};

const getUserSessionsService = async (id, startDate, endDate) => {
  try {
    // Check if user exists
    const userExists = await User.exists({ _id: id });
    if (!userExists) {
      throw {
        message: "User does not exist",
        status: 404,
      };
    }

    const sessions = await Session.find({
      $and: [
        { $or: [{ user: id }, { client: id }] },
        { date: { $gte: startDate, $lte: endDate } },
      ],
    })
      .populate({
        path: "client",
        select: "firstName middleName lastName email phone",
      });

    if (sessions.length === 0) {
      return [];
    }

    return sessions;
  } catch (error) {
    throw {
      message: error.message || messages.error,
      status: error.status || 500,
    };
  }
};

const getUserSessionsHandler = async (req, res) => {
  const { startDate, endDate } = req.params;
  const id = req.id;
  try {
    const sessions = await getUserSessionsService(id, startDate, endDate);
    return res.status(200).json({
      message: messages.success,
      sessions,
    });
  } catch (error) {
    throw error;
  }
};

export default getUserSessionsHandler;
