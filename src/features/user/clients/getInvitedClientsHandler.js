import User from "../../../common/models/User.js";

const messages = {  
  user_not_found: "User not found",
  no_invited_clients: "No invited clients found",
};

const getInvitedClientsService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw {
    message: messages.user_not_found,
    status: 404,
  };
  const pendingRelationships = user.relationships.filter(
    (relationship) => relationship.status === "pending"
  );
  const invitedClients = pendingRelationships.map((relationship) =>
    relationship.client
  );
  return invitedClients;
};

export const getInvitedClientsHandler = async (req, res) => {
  const userId = req.id;
  const invitedClients = await getInvitedClientsService(userId);
  res.status(200).json({
    message: "Invited clients fetched successfully",
    data: invitedClients,
  });
};
