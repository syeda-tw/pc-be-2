import User from "../../../common/models/user.js";
import mongoose from "mongoose";

const getUsersClientsByIdDbOp = async (userId, params = {}) => {
  // Safely parsing params coming from query (which are strings)
  const search = typeof params.search === 'string' ? params.search : '';
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = params.limit ? Math.min(parseInt(params.limit, 10), 100) : 20;
  const skip = (page - 1) * limit;
  const sortBy = typeof params.sortBy === 'string' ? params.sortBy : 'first_name';
  const sortOrder = params.sortOrder === 'desc' ? 'desc' : 'asc'; // default to 'asc' unless explicitly 'desc'

  console.log("Function getUsersClientsByIdDbOp called with:");
  console.log("userId:", userId);
  console.log("parsed params:", { search, page, limit, skip, sortBy, sortOrder });

  try {
    // Step 1: Fetch user and populate invited_clients
    const user = await User.findById(userId).populate({
      path: 'invited_clients',
      match: search ? {
        $or: [
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } },
          { middle_name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      } : {},
      select: '_id first_name last_name middle_name is_active phone email',
      options: {
        sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
        skip,
        limit
      }
    }).lean();

    console.log("Fetched User with populated invited_clients:", JSON.stringify(user, null, 2));

    if (!user) {
      console.error("User not found with ID:", userId);
      throw new Error('User not found');
    }

    // Step 2: Aggregation to calculate total
    console.log("Starting aggregation for total count...");
    const totalClients = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'invitedclients', // <-- correct
          localField: 'invited_clients',
          foreignField: '_id',
          as: 'invitedClient'
        }
      },
      { $unwind: '$invitedClient' },
      ...(search ? [{
        $match: {
          $or: [
            { 'invitedClient.first_name': { $regex: search, $options: 'i' } },
            { 'invitedClient.last_name': { $regex: search, $options: 'i' } },
            { 'invitedClient.middle_name': { $regex: search, $options: 'i' } },
            { 'invitedClient.phone': { $regex: search, $options: 'i' } },
            { 'invitedClient.email': { $regex: search, $options: 'i' } }
          ]
        }
      }] : []),
      { $count: 'total' }
    ]);
    
    console.log("Aggregation result (totalClients):", JSON.stringify(totalClients, null, 2));

    const total = totalClients.length > 0 ? totalClients[0].total : 0;
    console.log("Calculated total:", total);

    return {
      clients: user.invited_clients || [],
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
    const data = await getUsersClientsByIdDbOp(req.body.decodedToken._id, req.query);
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