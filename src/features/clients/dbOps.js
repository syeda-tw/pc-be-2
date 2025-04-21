import Client from "../../models/client.js";

export const getAllClientsByUserId = async (userId) => {
  const clients = await Client.find({ userId })
    .sort({ createdAt: -1 }); // Sort by newest first
  
  return clients;
}; 