import User from "../../../common/models/User.js";
import Client from "../../../common/models/Client.js";
import InvitedClient from "../../../common/models/InvitedClient.js";

const messages = {
  success: {
    clientsFetched: "Successfully fetched your invited clients."
  },
  error: {
    userNotFound: "We couldn't find your account",
    fetchError: "We couldn't fetch your invited clients. Please try again."
  }
};

const getInvitedClientsService = async (userId, params = {}) => {
  const search = typeof params.search === 'string' ? params.search : '';
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = params.limit ? Math.min(parseInt(params.limit, 10), 100) : 20;
  const skip = (page - 1) * limit;
  const sortBy = typeof params.sortBy === 'string' ? params.sortBy : 'firstName';
  const sortOrder = params.sortOrder === 'desc' ? -1 : 1;

  const user = await User.findById(userId)
    .populate({
      path: 'relationships',
      select: 'client clientModel status',
    })
    .lean();

  if (!user) {
    throw { status: 404, message: messages.error.userNotFound };
  }

  if (!user.relationships) {
    return { clients: [], total: 0, page, totalPages: 0 };
  }

  const clientRelationships = user.relationships.filter(
    r => r.clientModel === 'InvitedClient' && r.status === 'pending'
  );

  const clientIdToRelationshipId = new Map(
    clientRelationships.map(r => [r.client.toString(), r._id.toString()])
  );

  const clientIds = clientRelationships.map(r => r.client);

  if (clientIds.length === 0) {
    return { clients: [], total: 0, page, totalPages: 0 };
  }

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
    InvitedClient.find(clientFilter)
      .select('firstName lastName middleName email phone pronouns dateOfBirth gender')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    InvitedClient.countDocuments(clientFilter)
  ]);

  const clientsWithRelationshipId = clients.map(client => ({
    firstName: client.firstName,
    lastName: client.lastName,
    middleName: client.middleName,
    email: client.email,
    phone: client.phone,
    pronouns: client.pronouns,
    dateOfBirth: client.dateOfBirth,
    gender: client.gender,
    relationshipId: clientIdToRelationshipId.get(client._id.toString()) || null
  }));

  return {
    clients: clientsWithRelationshipId,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

const getInvitedClientsHandler = async (req, res) => {
  try {
    const data = await getInvitedClientsService(req.id, req.query);
    res.status(200).json({
      message: messages.success.clientsFetched,
      data
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export default getInvitedClientsHandler;