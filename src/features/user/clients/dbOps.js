import Client from "../../../common/models/client.js";
import User from "../../../common/models/user.js";
import InvitedClient from "../../../common/models/invitedClient.js";

const getUsersClientsByIdDbOp = async (userId, search = '', start = 0, limit = 20, page = 1, sortBy = 'first_name', sortOrder = 'asc') => {
  try {
    const startIndex = parseInt(start, 10) || (parseInt(page, 10) - 1) * limit;
    const limitNum = Math.min(parseInt(limit, 10), 100); // protect limit

    const user = await User.findById(userId)
      .populate({
        path: 'invited_clients',
        match: search
          ? {
              $or: [
                { first_name: { $regex: search, $options: 'i' } },
                { last_name: { $regex: search, $options: 'i' } },
                { middle_name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
              ]
            }
          : {},
        select: '_id first_name last_name middle_name is_active phone email',
        options: {
          sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
          skip: startIndex,
          limit: limitNum
        }
      })
      .lean();

    if (!user) {
      return null;
    }

    const totalClients = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(userId) } },
      { $lookup: {
          from: 'clients', // make sure collection name matches
          localField: 'clients',
          foreignField: '_id',
          as: 'clientsData'
        }
      },
      { $unwind: '$clientsData' },
      { $match: search
          ? {
              $or: [
                { 'clientsData.first_name': { $regex: search, $options: 'i' } },
                { 'clientsData.last_name': { $regex: search, $options: 'i' } },
                { 'clientsData.middle_name': { $regex: search, $options: 'i' } },
                { 'clientsData.phone': { $regex: search, $options: 'i' } },
                { 'clientsData.email': { $regex: search, $options: 'i' } }
              ]
            }
          : {}
      },
      { $count: 'total' }
    ]);

    const total = totalClients.length > 0 ? totalClients[0].total : 0;

    return {
      clients: user.clients,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / limitNum)
    };

  } catch (error) {
    console.error("Error in getUsersClientsByIdDbOp:", error);
    return null;
  }
};

const getUserWithClientsByIdDbOp = async (userId) => {
  try {
    const user = await User.findById(userId).populate({
      path: 'clients, invited_clients',
    });
    return user;
  } catch (error) {
    console.error("Error in getUserWithClientsByIdDbOp:", error);
    return null;
  }
};

const getClientByPhoneNumberDbOp = async (phoneNumber) => {
  try {
    const client = await Client.findOne({ phone: phoneNumber });
    if (!client) {
      return null;
    }
    return client;
  } catch (error) {
    console.error("Error in getClientByPhoneNumberDbOp:", error);
    throw error;
  }
};

const getInvitedClientByPhoneNumberDbOp = async (phoneNumber) => {
  try {
    const client = await InvitedClient.findOne({ phone: phoneNumber });
    if (!client) {
      return null;
    }
    return client;
  } catch (error) {
    console.error("Error in getInvitedClientByPhoneNumberDbOp:", error);
    throw error;
  }
};

const createInvitedClientDbOp = async (clientData) => {
  try {
    const client = await InvitedClient.create(clientData);
    return client;
  } catch (error) {
    console.error("Error in createInvitedClientDbOp:", error);
    throw error;
  }
};

const updateUserWithInvitedClientDbOp = async (userId, invitedClientId) => {
  try {
    const user = await User.findById(userId);
    user.invited_clients = [...user.invited_clients, { _id: invitedClientId, status: 'pending' }];
    await user.save();
  } catch (error) {
    console.error("Error in updateUserWithInvitedClientDbOp:", error);
    throw error;
  }
};

const updateInvitedClientWithNewRegistrationCodeAndUserWhoInvitedDbOp = async (invitedClientId, newRegistrationCode, userId) => {
  try {
    const invitedClient = await InvitedClient.findById(invitedClientId);
    invitedClient.registration_code = newRegistrationCode;
    invitedClient.users_who_have_invited = [...invitedClient.users_who_have_invited, userId];
    await invitedClient.save();
  } catch (error) {
    console.error("Error in updateInvitedClientWithNewRegistrationCodeAndUserWhoInvitedDbOp:", error);
    throw error;
  }
};

const updateUserWithClientDbOp = async (userId, clientId) => {
  try {
    const user = await User.findById(userId);
    user.clients = [...user.clients, { _id: clientId, status: 'pending' }];
    await user.save();
  } catch (error) {
    console.error("Error in updateUserWithClientDbOp:", error);
    throw error;
  }
};

const updateClientWithUserDbOp = async (clientId, userId) => {
  try {
    const client = await Client.findById(clientId);
    client.users = [...client.users, { _id: userId, status: 'pending' }];
    await client.save();
  } catch (error) {
    console.error("Error in updateClientWithUserDbOp:", error);
    throw error;
  }
};

const getUserInvitedClientsIdDbOp = async (userId) => {
  try {
    const user = await User.findById(userId).populate({
      path: 'invited_clients',
      select: '_id phone first_name last_name email'
    });
    return user.invited_clients;
  } catch (error) {
    console.error("Error in getUserInvitedClientsIdDbOp:", error);
    throw error;
  }
};

export {
  getUsersClientsByIdDbOp,
  getUserWithClientsByIdDbOp,
  getClientByPhoneNumberDbOp,
  getInvitedClientByPhoneNumberDbOp,
  createInvitedClientDbOp,
  updateUserWithInvitedClientDbOp,
  updateUserWithClientDbOp,
  updateClientWithUserDbOp,
  getUserInvitedClientsIdDbOp,
  updateInvitedClientWithNewRegistrationCodeAndUserWhoInvitedDbOp,
};
