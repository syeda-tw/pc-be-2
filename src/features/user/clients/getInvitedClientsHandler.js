import mongoose from "mongoose";
import User from '../../../common/models/User.js';
import Relationship from '../../../common/models/Relationship.js';

const getUsersClientsByIdDbOp = async (userId, params = {}) => {
  console.log('Starting getUsersClientsByIdDbOp with params:', { userId, params });

  const search = typeof params.search === 'string' ? params.search.trim() : '';
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = params.limit ? Math.min(parseInt(params.limit, 10), 100) : 20;
  const skip = (page - 1) * limit;

  try {
    // Step 1: Find relationships with pending status and matching user
    const relationships = await Relationship.find({
      user: userId,
      status: 'pending',
    }).lean();

    console.log('Found relationships with pending status:', relationships.length);

    // Step 2: Fetch client details dynamically
// Step 2: Fetch client details dynamically with custom filters
const clients = await Promise.all(
  relationships.map(async (rel) => {
    const ClientModel = mongoose.model(rel.clientModel); // 'Client' or 'InvitedClient'
    const client = await ClientModel.findById(rel.client).lean();
    if (!client) return null;

    // Conditionally exclude 'Client' if onboarding is complete
    if (rel.clientModel === 'Client' && client.isOnboardingComplete) {
      return null;
    }

    // Apply name search filter
    const fullName = `${client.firstName || ''} ${client.middleName || ''} ${client.lastName || ''}`.trim().toLowerCase();
    const matchesSearch = !search || fullName.includes(search.toLowerCase());

    return matchesSearch ? { ...client, relationshipId: rel._id, clientModel: rel.clientModel } : null;
  })
);


    // Step 3: Filter nulls and paginate
    const filteredClients = clients.filter(Boolean);
    const total = filteredClients.length;
    const paginatedClients = filteredClients.slice(skip, skip + limit);

    console.log('Returning clients:', {
      total,
      page,
      clientsInPage: paginatedClients.length,
      totalPages: Math.ceil(total / limit)
    });

    return {
      clients: paginatedClients,
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
    getInvitedSuccess: "Successfully fetched the invited clients.",
    getInvitedError: "There was an error fetching the invited clients."
  },
  error: {
    generalError: "An error occurred. Please try again later."
  }
};

const getInvitedClientsHandler = async (req, res, next) => {
  try {
    const data = await getUsersClientsByIdDbOp(req.id, req.query);
    return res.status(200).json({
      data,
      message: messages.clients.getInvitedSuccess
    });
  } catch (err) {
    console.error("Error in getInvitedClientsHandler:", err);
    return res.status(500).json({
      message: messages.error.generalError
    });
  }
};


export { getInvitedClientsHandler };