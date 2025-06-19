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
  success: "OTP verified successfully",
  invalidAccount:
    "We were not able to verify the relationship with your practioner. Please ask them to resend the OTP.",
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

  // Get the relationship from the invited client
  const relationships = await Relationship.find({
    client: invitedClient._id,
    clientModel: "InvitedClient",
    status: "pending",
  });

  if (relationships?.length > 0) {
    // Create a new Client document from the InvitedClient data
    const client = await Client.create({
      phone: invitedClient.phone,
      firstName: invitedClient.firstName,
      lastName: invitedClient.lastName,
      email: invitedClient.email,
      status: "onboarding-step-1",
    });

    // Use Promise.all to handle all relationship updates concurrently
    await Promise.all(relationships.map(async (relationship) => {
      // Update the relationship with the new client
      relationship.client = client._id;
      relationship.clientModel = "Client";
      relationship.status = "pending";
      relationship.timeline = [...relationship.timeline, relationshipTimelineEntries.clientRegistered()]
      await relationship.save();
      
      // Update the client with the new relationship
      client.relationships.push(relationship._id);
      client.defaultRelationship = relationship._id;
    }));
    
    await client.save();
    
    // Delete the invited client after successful verification
    await InvitedClient.findByIdAndDelete(invitedClient._id);

    return client.toObject();
  }
  
  if (relationships?.length === 0) {
    //remove the invited client from the database
    await InvitedClient.findByIdAndDelete(invitedClient._id);
    throw {
      message: messages.invalidAccount,
      status: 400,
    };
  }
};

export const otpVerificationHandler = async (req, res, next) => {
  const { phone, otp } = req.body;

  try {
    const client = await otpVerificationService(phone, otp);
    const token = generateToken({ _id: client._id });

    res.status(200).json({
      message: messages.success,
      token,
      client: sanitizeUserAndAppendType(client, "client"),
    });
  } catch (error) {
    next(error);
  }
};
