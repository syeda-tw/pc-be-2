import Session from "../../../../common/models/Session.js";
import { addMonths, startOfDay } from "date-fns";

const messages = {
  error: {
    generalError: "Error getting users bookings",
    invalidId: "Invalid user ID provided", 
    dateError: "Error calculating date range",
    queryError: "Error querying sessions",
  },
};

const getUserFutureSessionsService = async (id) => {
  if (!id) {
    throw { status: 400, message: messages.error.invalidId };
  }

  let now, sixMonthsLater;
  try {
    now = startOfDay(new Date());
    sixMonthsLater = addMonths(now, 6);
  } catch (error) {
    throw { status: 500, message: messages.error.dateError };
  }

  try {
    const sessions = await Session.find({
      $and: [
        {
          $or: [
            { user: id },
          ],
        },
        {
          date: { $gte: now, $lte: sixMonthsLater },
        },
      ],
    })
      .select("_id date startTime endTime")
      .sort({ date: 1, startTime: 1 });

    return sessions;
  } catch (error) {
    throw { status: 500, message: messages.error.queryError };
  }
};

const getUserFutureSessionsHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const futureSessions = await getUserFutureSessionsService(id);
    res.status(200).json({ futureSessions });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export default getUserFutureSessionsHandler;
