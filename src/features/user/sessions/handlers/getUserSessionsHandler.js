import Session from "../../../../common/models/Session.js";
import User from "../../../../common/models/User.js";

const messages = {
  error: "Error fetching sessions",
  success: "Sessions fetched successfully",
  notFound: "No sessions found",
};


const getUserSessionsService = async (id, startDate, endDate) => {
  console.log("getUserSessionsService called with:", {
    id,
    startDate,
    endDate,
  });
  try {
    // Check if user exists
    const userExists = await User.exists({ _id: id });
    if (!userExists) {
      console.log("User does not exist:", id);
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

    console.log("Found sessions:", sessions);
    if (sessions.length === 0) {
      console.log("No sessions found");
      return [];
    }

    return sessions;
  } catch (error) {
    console.error("Error in getUserSessionsService:", error);
    throw {
      message: error.message || messages.error,
      status: error.status || 500,
    };
  }
};


const getUserSessionsHandler = async (req, res) => {
  console.log("getUserSessionsHandler called with params:", req.params);
  const { startDate, endDate } = req.params;
  const id = req.id;
  console.log("Extracted values:", { id, startDate, endDate });
  try {
    const sessions = await getUserSessionsService(id, startDate, endDate);
    console.log("Sessions retrieved successfully");
    return res.status(200).json({
      message: messages.success,
      sessions,
    });
  } catch (error) {
    console.error("Error in getUserSessionsHandler:", error);
    throw error;
  }
};

export default getUserSessionsHandler;
