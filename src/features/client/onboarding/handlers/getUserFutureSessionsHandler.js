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
  console.log('getUserFutureSessionsService called with id:', id);
  try {
    if (!id) {
      console.log('Invalid ID provided');
      throw new Error(messages.error.invalidId);
    }

    let now, sixMonthsLater;
    try {
      now = startOfDay(new Date());
      sixMonthsLater = addMonths(now, 6);
      console.log('Date range calculated:', { now, sixMonthsLater });
    } catch (error) {
      console.error('Error calculating date range:', error);
      throw new Error(messages.error.dateError);
    }

    try {
      console.log('Querying sessions with params:', { id, now, sixMonthsLater });
      const sessions = await Session.find({
        $and: [
          {
            $or: [
              { user: id }, // use lowercase 'user' to match the schema
            ],
          },
          {
            date: { $gte: now, $lte: sixMonthsLater },
          },
        ],
      })
        .select("_id date startTime endTime")
        .sort({ date: 1, startTime: 1 });

      console.log('Found sessions:', sessions);
      return sessions;
    } catch (error) {
      console.error('Error querying sessions:', error);
      throw new Error(messages.error.queryError);
    }
  } catch (error) {
    console.error('Error in getUserFutureSessionsService:', error);
    throw error;
  }
};

const getUserFutureSessionsHandler = async (req, res) => {
  console.log('getUserFutureSessionsHandler called with params:', req.params);
  try {
    const { id } = req.params;
    if (!id) {
      console.log('No ID provided in request params');
      return res.status(400).json({
        message: messages.error.invalidId,
      });
    }

    const futureSessions = await getUserFutureSessionsService(id);
    console.log('Successfully retrieved future sessions:', futureSessions);
    return res.status(200).json({
      futureSessions,
    });
  } catch (error) {
    console.error("Error in getUserFutureSessionsHandler:", error);
    return res.status(500).json({
      message: error.message || messages.error.generalError,
    });
  }
};

export default getUserFutureSessionsHandler;
