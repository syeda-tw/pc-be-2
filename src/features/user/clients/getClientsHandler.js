import User from "../../../common/models/User.js";
import Client from "../../../common/models/Client.js";
import InvitedClient from "../../../common/models/InvitedClient.js";
import mongoose from "mongoose";

const getUsersClientsByIdDbOp = async (userId, params = {}) => {
  const search = typeof params.search === 'string' ? params.search : '';
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = params.limit ? Math.min(parseInt(params.limit, 10), 100) : 20;
  const skip = (page - 1) * limit;
  const sortBy = typeof params.sortBy === 'string' ? params.sortBy : 'firstName';
  const sortOrder = params.sortOrder === 'desc' ? -1 : 1;

  try {
    // Step 1: Fetch user and populate relationships
    const user = await User.findById(userId)
      .populate({
        path: 'relationships',
        select: 'client clientModel status',
      })
      .lean();

    if (!user || !user.relationships) {
      return { clients: [], total: 0, page, totalPages: 0 };
    }

    // Step 2: Filter relationships for only Clients with onboarded status
    const clientRelationships = user.relationships.filter(
      r => r.clientModel === 'Client'
    );

    const clientIds = clientRelationships.map(r => r.client);
    const clientStatusMap = new Map(clientRelationships.map(r => [r.client.toString(), r.status]));

    if (clientIds.length === 0) {
      return { clients: [], total: 0, page, totalPages: 0 };
    }

    // Step 3: Query Client model for onboarded clients
    const clientFilter = { 
      _id: { $in: clientIds },
      status: 'onboarded'
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
        .lean(),
      Client.countDocuments(clientFilter)
    ]);

    // Step 4: Add status from the relationship
    const clientsWithStatus = clients.map(client => ({
      ...client,
      status: clientStatusMap.get(client._id.toString()) || 'pending'
    }));

    return {
      clients: clientsWithStatus,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
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
    return res.status(500).json({
      message: messages.error.generalError
    });
  }
};

export { getClientsHandler };