import mongoose from "mongoose";
import User from '../../../common/models/User.js';

const getUsersClientsByIdDbOp = async (userId, params = {}) => {
  console.log('Starting getUsersClientsByIdDbOp with params:', { userId, params });
  
  const search = typeof params.search === 'string' ? params.search.trim() : '';
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = params.limit ? Math.min(parseInt(params.limit, 10), 100) : 20;
  const skip = (page - 1) * limit;
  const sortBy = typeof params.sortBy === 'string' ? params.sortBy : 'firstName';
  const sortOrder = params.sortOrder === 'desc' ? -1 : 1;

  console.log('Processed parameters:', { search, page, limit, skip, sortBy, sortOrder });

  try {
    console.log('Attempting to find user and populate relationships...');
    // Step 1: Get filtered relationships for this user
    const user = await User.findById(userId).populate({
      path: 'relationships',
      match: { clientModel: 'InvitedClient' },
      select: '_id clientModel client',
      populate: {
        path: 'client',
        model: 'InvitedClient',
        match: search ? {
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { middleName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } }
          ]
        } : {},
        select: 'firstName middleName lastName email phone'
      },
      options: {
        sort: { [`client.${sortBy}`]: sortOrder },
      }
    }).lean();

    console.log('User query completed:', { userId, userFound: !!user });

    if (!user) {
      console.log('User not found for ID:', userId);
      throw new Error('User not found');
    }

    // Filter out null clients (those who didn't match search)
    const allClients = (user.relationships || []).filter(rel => rel.client);
    console.log('Filtered clients count:', allClients.length);

    const paginatedClients = allClients.slice(skip, skip + limit);
    const total = allClients.length;

    console.log('Pagination results:', {
      totalClients: total,
      currentPage: page,
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