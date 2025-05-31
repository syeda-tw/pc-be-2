import Client from "../../../../common/models/Client.js";
import { generateToken, sanitizeUserAndAppendType } from "../../../common/utils.js";

const messages = {
  CLIENT_NOT_FOUND: "We couldn't find a client with that phone number.",
  INVALID_OTP: "Invalid or expired OTP. Please try again.",
  SUCCESS: "Login successful.",
};

const loginOtpVerificationService = async (phone, otp) => {
  const client = await Client.findOne({ phone });

  if (!client) {
    throw {
      status: 400,
      message: messages.CLIENT_NOT_FOUND,
    };
  }

  if (
    !client.loginOtp ||
    client.loginOtp !== otp ||
    client.loginOtpExpiresAt < new Date()
  ) {
    throw {
      status: 400,
      message: messages.INVALID_OTP,
    };
  }

  // Clear OTP after successful verification
  client.loginOtp = undefined;
  client.loginOtpExpiresAt = undefined;
  await client.save();

  // Generate JWT token
  const token = generateToken({ _id: client._id });

  return {
    token,
    client: {
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      _id: client._id,
      phone: client.phone,
      relationships: client.relationships,
      status: client.status,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    },
  };
};

const loginOtpVerificationHandler = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const { token, client } = await loginOtpVerificationService(phone, otp);

    res.status(200).json({
      message: messages.SUCCESS,
      token,
      client: sanitizeUserAndAppendType(client, "client"),
    });
  } catch (error) {
    next(error);
  }
};

export default loginOtpVerificationHandler;
