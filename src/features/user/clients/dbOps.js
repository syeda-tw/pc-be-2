import Client from "../../../common/models/client.js";
import User from "../../../common/models/user.js";

const getAllClientsByUserId = async (userId) => {
  const clients = await Client.find({ userId })
    .sort({ createdAt: -1 }); // Sort by newest first
  
  return clients;
}; 

const getUserByIdDbOp = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    console.error("Error in getUserByIdDbOp:", error);
    return null;
  }
};

const findClientByPhoneNumberDbOp = async (phoneNumber) => {
  try {
    return await Client.findOne({ phone: phoneNumber });
  } catch (error) {
    console.error("Error in findClientByPhoneNumberDbOp:", error);
    return null;
  }
};

const updateClientDbOp = async (clientId, clientData) => {
  try {
    return await Client.findByIdAndUpdate(clientId, clientData, { new: true });
  } catch (error) {
    console.error("Error in updateClientDbOp:", error);
    return null;
  }
};

const createClientDbOp = async (clientData) => {
  console.log("Creating client with data:", clientData);
  try {
    return await Client.create(clientData);
  } catch (error) {
    console.error("Error in createClientDbOp:", error);
    return null;
  }
};
const updateUserDbOp = async (userId, userData) => {
  try {
    return await User.findByIdAndUpdate(userId, userData, { new: true });
  } catch (error) {
    console.error("Error in updateUserDbOp:", error);
    return null;
  }
};
export {
  getAllClientsByUserId,
  findClientByPhoneNumberDbOp,
  updateClientDbOp,
  updateUserDbOp,
  createClientDbOp,
  getUserByIdDbOp
};
