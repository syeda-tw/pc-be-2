import User from "../../../common/models/User.js";
import Client from "../../../common/models/Client.js";

const messages = {
  success: {
    clientsFetched: "Successfully fetched your clients."
  },
  error: {
    userNotFound: "We couldn't find your account",
    fetchError: "We couldn't fetch your clients. Please try again."
  }
};

const getClientsService = async (userId, params = {}) => {
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
    r => r.clientModel === 'Client' && r.status === 'active'
  );

  const clientIdToRelationshipId = new Map(
    clientRelationships.map(r => [r.client.toString(), r._id.toString()])
  );

  const clientIds = clientRelationships.map(r => r.client);

  if (clientIds.length === 0) {
    return { clients: [], total: 0, page, totalPages: 0 };
  }

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
      .select('firstName lastName middleName email phone pronouns dateOfBirth gender')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Client.countDocuments(clientFilter)
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

const getClientsHandler = async (req, res) => {
  try {
    const data = await getClientsService(req.id, req.query);
    res.status(200).json({
      message: messages.success.clientsFetched,
      data
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export default getClientsHandler;