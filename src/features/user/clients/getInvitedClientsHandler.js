import User from "../../../common/models/User.js";
import mongoose from "mongoose";

const getUsersClientsByIdDbOp = async (userId, params = {}) => {
  // Safely parsing params coming from query (which are strings)
  const search = typeof params.search === 'string' ? params.search : '';
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = params.limit ? Math.min(parseInt(params.limit, 10), 100) : 20;
  const skip = (page - 1) * limit;
  const sortBy = typeof params.sortBy === 'string' ? params.sortBy : 'firstName';
  const sortOrder = params.sortOrder === 'desc' ? 'desc' : 'asc'; // default to 'asc' unless explicitly 'desc'

  try {
    // Step 1: Fetch user and populate invitedClients
    const user = await User.findById(userId).populate({
      path: 'invitedClients',
      match: search ? {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { middleName: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      } : {},
      select: '_id firstName lastName middleName isActive phone email',
      options: {
        sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
        skip,
        limit
      }
    }).lean();

    if (!user) {
      throw new Error('User not found');
    }

    // Step 2: Aggregation to calculate total
    const totalClients = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'invitedclients',
          localField: 'invitedClients',
          foreignField: '_id',
          as: 'invitedClient'
        }
      },
      { $unwind: '$invitedClient' },
      ...(search ? [{
        $match: {
          $or: [
            { 'invitedClient.firstName': { $regex: search, $options: 'i' } },
            { 'invitedClient.lastName': { $regex: search, $options: 'i' } },
            { 'invitedClient.middleName': { $regex: search, $options: 'i' } },
            { 'invitedClient.phone': { $regex: search, $options: 'i' } },
            { 'invitedClient.email': { $regex: search, $options: 'i' } }
          ]
        }
      }] : []),
      { $count: 'total' }
    ]);

    const total = totalClients.length > 0 ? totalClients[0].total : 0;

    return {
      clients: user.invitedClients || [],
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