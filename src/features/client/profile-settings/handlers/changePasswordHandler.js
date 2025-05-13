import Client from "../../../../common/models/Client.js";
import { hashPassword, isPasswordCorrect } from '../../../common/utils.js';

const messages = {
  success: {
    passwordChanged: "Password changed successfully",
  },
  error: {
    passwordChangeFailed: "Failed to change password",
    clientNotFound: "Client not found", // Added missing message
    invalidOldPassword: "Invalid old password", // Added missing message
    newPasswordSameAsOldPassword: "New password cannot be the same as the old password",
  }
};

const changePasswordService = async (data, userId) => {
  const { oldPassword, newPassword } = data;

  const client = await Client.findById(userId);

  if (!client) {
    throw {
      message: messages.error.clientNotFound,
      status: 404,
    };
  }

  const isOldPasswordCorrect = await isPasswordCorrect(oldPassword, client.password);

  if (!isOldPasswordCorrect) {
    throw {
      message: messages.error.invalidOldPassword,
      status: 400,
    };
  }

  if (oldPassword === newPassword) {
    throw {
      message: messages.error.newPasswordSameAsOldPassword,
      status: 400,
    };
  }

  const hashedPassword = await hashPassword(newPassword);

  client.password = hashedPassword;
  await client.save();

  return;
};

const changePasswordHandler = async (req, res) => {
  try {
    await changePasswordService(req.body, req.id);
    res.status(200).json({ message: messages.success.passwordChanged });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || messages.error.passwordChangeFailed });
  }
};

export default changePasswordHandler;
