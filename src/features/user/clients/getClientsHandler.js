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
    console.log('User relationships:', user.relationships);


    // Step 2: Filter relationships for only InvitedClients
    const invitedClientRelationships = user.relationships.filter(
      r => r.clientModel === 'InvitedClient'
    );

    const clientIds = invitedClientRelationships.map(r => r.client);
    const clientStatusMap = new Map(invitedClientRelationships.map(r => [r.client.toString(), r.status]));

    if (clientIds.length === 0) {
      return { clients: [], total: 0, page, totalPages: 0 };
    }

// Step 3: Query InvitedClient
console.log('Raw clientIds:', clientIds);

const clientFilter = { _id: { $in: clientIds } };

if (search) {
  clientFilter.$or = [
    { firstName: { $regex: search, $options: 'i' } },
    { lastName: { $regex: search, $options: 'i' } },
    { middleName: { $regex: search, $options: 'i' } },
    { phone: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } }
  ];
  console.log('Search applied:', search);
}

console.log('Final clientFilter:', JSON.stringify(clientFilter, null, 2));

const [clients, total] = await Promise.all([
  InvitedClient.find(clientFilter)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .lean(),
  InvitedClient.countDocuments(clientFilter)
]);

console.log('Fetched clients:', clients);
console.log('Total matched clients:', total);

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