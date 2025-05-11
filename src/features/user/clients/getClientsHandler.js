import User from "../../../common/models/User.js";
import Client from "../../../common/models/Client.js";
import mongoose from "mongoose";

const getUsersClientsByIdDbOp = async (userId, params = {}) => {
  const search = typeof params.search === 'string' ? params.search : '';
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = params.limit ? Math.min(parseInt(params.limit, 10), 100) : 20;
  const skip = (page - 1) * limit;
  const sortBy = typeof params.sortBy === 'string' ? params.sortBy : 'firstName';
  const sortOrder = params.sortOrder === 'desc' ? -1 : 1;

  try {
    // Step 1: Fetch the user first
    const user = await User.findById(userId).lean();

    if (!user) {
      throw new Error('User not found');
    }

    const clientIds = user.clients.map(c => c.client);
    const clientStatusMap = new Map(user.clients.map(c => [c.client.toString(), c.status]));

    if (clientIds.length === 0) {
      return {
        clients: [],
        total: 0,
        page,
        totalPages: 0
      };
    }

    // Step 2: Query the Client collection
    const clientFilter = {
      _id: { $in: clientIds }
    };

    if (search) {
      clientFilter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { middleName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [clients, total] = await Promise.all([
      Client.find(clientFilter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .select('_id firstName lastName middleName phone email')
        .lean(),
      Client.countDocuments(clientFilter)
    ]);

    // Step 3: Map the clients with their status
    const clientsWithStatus = clients.map(client => ({
      ...client,
      status: clientStatusMap.get(client._id.toString()) || 'pending' // default to pending if not found
    }));

    return {
      clients: clientsWithStatus,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error("Error in getUsersClientsByIdDbOp:", error);
    throw error;
  }
};

const messages = {
  clients: {
    getSuccess: "Successfully fetched the clients.",
    getError: "There was an error fetching the clients."
  },
  error: {
    generalError: "An error occurred. Please try again later."
  }
};

const getClientsHandler = async (req, res, next) => {
  try {
    const data = await getUsersClientsByIdDbOp(req.id, req.query);
    return res.status(200).json({
      data,
      message: messages.clients.getSuccess
    });
  } catch (err) {
    console.error("Error in getClientsHandler:", err);
    return res.status(500).json({
      message: messages.error.generalError
    });
  }
};

export { getClientsHandler };