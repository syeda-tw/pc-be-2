import Relationship from '../../../../common/models/Relationship.js';

const messages = {
  success: "Successfully fetched the relationships.",
  error: "There was an error fetching the relationships.",
};

const getRelationshipsUserService = async (userId) => {
  const relationships = await Relationship.find({ 
    client: userId,
    status: 'active',
    clientModel: 'Client'
  }).populate('user', 'firstName lastName');
  return relationships;
};

const getRelationshipsUserHandler = async (req, res) => {
  try {
    const relationships = await getRelationshipsUserService(req.id);
    res.status(200).json({
      message: messages.success,
      data: relationships,
    });
  } catch (error) {
    res.status(500).json({ message: messages.error });
  }
};

export default getRelationshipsUserHandler;