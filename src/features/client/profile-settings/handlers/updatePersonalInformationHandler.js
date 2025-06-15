import Client from "../../../../common/models/Client.js";
import { sanitizeUserAndAppendType } from "../../../common/utils.js";

const messages = {
  success: {
    personalInformationUpdated: "Your personal information has been updated successfully",
  },
  error: {
    clientNotFound: "We couldn't find your account",
    personalInformationUpdateFailed: "We couldn't update your personal information. Please try again",
  },
};

const updatePersonalInformationService = async (data, userId) => {
  const client = await Client.findById(userId);
  
  if (!client) {
    throw {
      message: messages.error.clientNotFound,
      status: 404
    };
  }

  try {
    const updatedClient = await Client.findByIdAndUpdate(userId, data, { new: true });
    return updatedClient.toObject();
  } catch (error) {
    throw {
      message: messages.error.personalInformationUpdateFailed,
      status: 500
    };
  }
};

const updatePersonalInformationHandler = async (req, res) => {
  try {
    const client = await updatePersonalInformationService(req.body, req.id);
    res.status(200).json({
      message: messages.success.personalInformationUpdated,
      client: sanitizeUserAndAppendType(client, "client"),
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export default updatePersonalInformationHandler;
