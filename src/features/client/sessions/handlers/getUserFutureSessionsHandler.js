import Client from "../../../../common/models/Client.js";
import Session from '../../../../common/models/Session.js';
import User from "../../../../common/models/User.js";
import { startOfDay, addMonths } from 'date-fns';

// Error messages for different scenarios
const messages = {
  CLIENT_NOT_FOUND: "Client not found",
  RELATIONSHIP_NOT_FOUND: "Relationship not found",
  SESSION_NOT_FOUND: "Session not found",
  QUERY_ERROR: "Error querying sessions"
};

const getUserFutureSessionsService = async (id, relationshipId) => {
  // Step 1: Find the client by their ID
  const client = await Client.findById(id).populate({
    path: "relationships",
  });

  // Step 2: Validate if client exists
  if (!client) {
    throw {
      status: 404,
      message: messages.CLIENT_NOT_FOUND,
    };
  }

  // Step 3: Check if the client has the specified relationship
  const relationship = client.relationships.find(
    (relationship) => relationship._id.toString() === relationshipId
  );

  // Step 4: Validate if relationship exists for this client
  if (!relationship) {
    throw {
      status: 404,
      message: messages.RELATIONSHIP_NOT_FOUND,
    };
  }

  const userId = relationship.user;

  let now, sixMonthsLater;

    now = startOfDay(new Date());
    sixMonthsLater = addMonths(now, 6);


  try {
    const sessions = await Session.find({
      $and: [
        {
          $or: [
            { user: userId }, // use lowercase 'user' to match the schema
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
    throw new Error(messages.QUERY_ERROR);
  }
};

const getUserFutureSessionsHandler = async (req, res) => {
  const id = req.id;
  const { relationshipId } = req.params;

  try {
    const sessions = await getUserFutureSessionsService(id, relationshipId);
    
    res.status(200).json({
      message: "User future sessions fetched successfully",
      data: sessions,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

export default getUserFutureSessionsHandler;
