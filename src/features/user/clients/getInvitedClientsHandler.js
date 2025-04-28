import User from "../../../common/models/user.js";
import mongoose from "mongoose";

const getUsersClientsByIdDbOp = async (userId, params={}) => {
  const {
    search = '', 
    start = 0, 
    limit = 20, 
    page = 1, 
    sortBy = 'first_name', 
    sortOrder = 'asc'
  } = params || {};

  try {
    const startIndex = parseInt(start, 10) || (parseInt(page, 10) - 1) * limit;
    const limitNum = Math.min(parseInt(limit, 10), 100);

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
        skip: startIndex,
        limit: limitNum
      }
    }).lean();

    if (!user) {
      throw new Error('User not found');
    }

    const totalClients = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'invited_clients',
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

    const total = totalClients.length > 0 ? totalClients[0].total : 0;

    return {
      clients: user.invited_clients,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / limitNum)
    };

  } catch (error) {
    console.error("Error in getUsersClientsByIdDbOp:", error);
    throw error; // <--- better to throw so the service can catch it properly
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

const getInvitedClientsService = async (userId, params) => {
  try {
    return await getUsersClientsByIdDbOp(userId, params );
  } catch (error) {
    console.error("Error in getInvitedClientsService:", error);
    throw error;
  }
};

const getInvitedClientsHandler = async (req, res, next) => {
  try {
    const data = await getInvitedClientsService(req.body.decodedToken._id, req.params);
    return res.status(200).json({
      data,
      message: messages.clients.getInvitedSuccess
    });
  } catch (err) {
    console.error("Error in getInvitedClients:", err);
    return res.status(500).json({
      message: messages.error.generalError
    });
  }
};

export { getInvitedClientsHandler };