import Client from "../../../../common/models/Client.js";
import { sanitizeUserAndAppendType } from "../../../common/utils.js";

const messages = {
  success: {
    personalInformationUpdated: "Personal information updated successfully",
  },
  error: {
    personalInformationUpdateFailed: "Failed to update personal information",
  },
};
const updatePersonalInformationService = async (data, userId) => {
  try {
    const client = await Client.findByIdAndUpdate(userId, data, { new: true });
    return client.toObject();
  } catch (error) {
    throw {
      message: messages.error.personalInformationUpdateFailed,
      status: 500,
    };
  }
};

export const updatePersonalInformationHandler = async (req, res) => {
  try {
    const client = await updatePersonalInformationService(req.body, req.id);
    res.status(200).json({
      message: messages.success.personalInformationUpdated,
      client: sanitizeUserAndAppendType(client, "client"),
    });
  } catch (error) {
    throw error;
  }
};
