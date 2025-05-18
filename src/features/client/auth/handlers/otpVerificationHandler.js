import Client from "../../../../common/models/Client.js";
import InvitedClient from "../../../../common/models/InvitedClient.js";
import Relationship from "../../../../common/models/Relationship.js";
import {
  generateToken,
  sanitizeUserAndAppendType,
} from "../../../common/utils.js";

const messages = {
  invalidPhoneNumber:
    "We couldn't find an account with that phone number. Please check and try again.",
  invalidOTP: "The code you entered doesn't match. Please try again.",
  otpExpired: "Your verification code has expired. Please request a new one.",
};

const otpVerificationService = async (phone, otp) => {
  const invitedClient = await InvitedClient.findOne({ phone });
  if (!invitedClient) {
    throw {
      message: messages.invalidPhoneNumber,
      status: 400,
    };
  }
  if (invitedClient.oneTimePassword !== otp) {
    throw {
      message: messages.invalidOTP,
      status: 400,
    };
  }
  if (invitedClient.oneTimePasswordExpiresAt < new Date()) {
    throw {
      message: messages.otpExpired,
      status: 400,
    };
  }

  // Create a new Client document from the InvitedClient data
  const client = await Client.create({
    phone: invitedClient.phone,
    firstName: invitedClient.firstName,
    lastName: invitedClient.lastName,
    email: invitedClient.email,
    status: "onboarding-step-1",
  });

  // Get the relationship from the invited client
  const relationship = await Relationship.findOne({
    client: invitedClient._id,
  });

  if (relationship) {
    // Update the relationship with the new client
    relationship.client = client._id;
    relationship.clientModel = "Client";
    relationship.status = "client-registered";
    await relationship.save();
  }

  // Update the client with the new relationship
  client.relationships.push(relationship._id);
  await client.save();

  // Delete the invited client after successful verification
  await InvitedClient.findByIdAndDelete(invitedClient._id);

  return client.toObject();
};

export const otpVerificationHandler = async (req, res, next) => {
  const { phone, otp } = req.body;
  try {
    const client = await otpVerificationService(phone, otp);
    const token = generateToken({ _id: client._id });
    res
      .status(200)
      .json({
        message: "OTP verified successfully",
        token,
        client: sanitizeUserAndAppendType(client, "client"),
      });
  } catch (error) {
    next(error);
  }
};
