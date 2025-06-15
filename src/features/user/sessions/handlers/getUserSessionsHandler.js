import Session from "../../../../common/models/Session.js";
import User from "../../../../common/models/User.js";

const messages = {
  success: {
    sessionsFetched: "Successfully fetched your sessions."
  },
  error: {
    userNotFound: "We couldn't find your account",
    fetchError: "We couldn't fetch your sessions. Please try again."
  }
};

const getUserSessionsService = async (userId, startDate, endDate) => {
  const user = await User.findById(userId);
  if (!user) {
    throw { status: 404, message: messages.error.userNotFound };
  }

  const sessions = await Session.find({
    $and: [
      { $or: [{ user: userId }, { client: userId }] },
      { date: { $gte: startDate, $lte: endDate } }
    ]
  })
  .populate({
    path: "client",
    select: "firstName middleName lastName email phone"
  })
  .lean();

  return sessions;
};

const getUserSessionsHandler = async (req, res) => {
  try {
    const sessions = await getUserSessionsService(req.id, req.params.startDate, req.params.endDate);
    res.status(200).json({
      message: messages.success.sessionsFetched,
      sessions
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export default getUserSessionsHandler;
