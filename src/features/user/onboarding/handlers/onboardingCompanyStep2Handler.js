import User from '../../../../common/models/User.js';
import Practice from '../../../../common/models/Practice.js';
import { extractAddressPartsFromGoogle } from "../utils.js";
import { sanitizeUserAndAppendType } from '../../../common/utils.js';
import { googleValidateAddress } from './validateAddressHandler.js';

const messages = {
  userNotFound: "We couldn't find your account. Please try logging in again.",
  practiceCreationFailed: "We're having trouble creating your practice profile. Please try again in a moment.",
  practiceNotFound: "We couldn't find your practice details. Please verify your information and try again.",
  invalidAddress: "The address you provided needs to be verified. Please check and try again.",
  invalidUserStatus: "Your account needs to be in the correct state to proceed. Please start the onboarding process again.",
  memberAlreadyExists: "Some of the members you're trying to add are already registered. Please review the list.",
  memberIsUser: "You cannot add your own email as a member. Please remove it from the list.",
  memberIsOtp: "Please use regular email addresses for members, not OTP verification emails.",
};

const onboardingCompanyStep2Service = async (data, id) => {
  const { name, website, address, members } = data;
  const user = await User.findById(id);
  if (!user) {
    throw {
      code: 400,
      message: messages.userNotFound
    };
  }

  if (user.status !== "onboarding-step-2") {
    throw {
      code: 400,
      message: messages.invalidUserStatus
    };
  }

  // Ensure the user cannot add their own email as a member
  const filteredMembers = members.filter(member => {
    if (member === user.email) {
      throw {
        code: 400,
        message: messages.memberIsUser
      };
    }
    if (member.includes("otp")) {
      throw {
        code: 400,
        message: messages.memberIsOtp
      };
    }
    return true;
  });

  try {
    const isAddressValid = await googleValidateAddress(address);
    if (isAddressValid.isValid === false) {
      throw {
        code: 400,
        message: isAddressValid.message
      };
    }
  } catch (error) {
    throw {
      code: 400,
      message: messages.invalidAddress
    };
  }

  let addressParts;
  try {
    addressParts = await extractAddressPartsFromGoogle(address);
  } catch (error) {
    throw {
      code: 400,
      message: messages.invalidAddress
    };
  }

  let practice;
  try {
    practice = await Practice.create({
      members: filteredMembers,
      name: name,
      website: website,
      addresses: [
        {
          street: addressParts.street,
          city: addressParts.city,
          state: addressParts.state,
          zip: addressParts.zip,
        }
      ],
      isCompany: true,
    });
  } catch (error) {
    throw {
      code: 400,
      message: messages.practiceCreationFailed
    };
  }

  user.practice = practice._id;
  user.status = "onboarded";

  try {
    const userUpdated = await User.findByIdAndUpdate(id, user, { new: true });
    return userUpdated.toObject();
  } catch (error) {
    throw {
      code: 400,
      message: messages.practiceCreationFailed
    };
  }
};

export const onboardingCompanyStep2Handler = async (req, res, next) => {
  try {
    const user = await onboardingCompanyStep2Service(
      req.body,
      req.id
    );
    return res.status(200).json({
      user: sanitizeUserAndAppendType(user, "user"),
    });
  } catch (err) {
    next(err);
  }
};