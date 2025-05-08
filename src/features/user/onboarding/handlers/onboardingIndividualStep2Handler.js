import User from "../../../../common/models/User.js";
import Practice from "../../../../common/models/Practice.js";
import { extractAddressPartsFromGoogle } from '../utils.js';
import { sanitizeUserAndAppendType } from '../../../common/utils.js';
import { googleValidateAddress } from './validateAddressHandler.js';

const messages = {
  userNotFound: "We couldn't find the user. Please check and try again.",
  practiceCreationFailed: "We encountered an issue while creating the practice. Please try again.",
  invalidAddress: "The address provided seems to be incorrect. Could you please double-check?",
  invalidUserStatus: "It seems the user status isn't set to onboarding-step-2. Let's fix that.",
};

const onboardingIndividualStep2Service = async (data, id) => {
  const { businessName, website, address } = data;
  const user = await User.findById(id);
  if (!user) {
    throw({
      status: 400,
      message: messages.userNotFound,
    });
  }

  if (user.status !== "onboarding-step-2") {
    throw({
      status: 400,
      message: messages.invalidUserStatus,
    });
  }

  try {
    const isAddressValid = await googleValidateAddress(address);
    if (isAddressValid.isValid === false) {
      throw({
        status: 400,
        message: isAddressValid.message,
      });
    }
  } catch (error) {
    throw({
      status: 400,
      message: messages.invalidAddress,
    });
  }

  let addressParts;
  try {
    addressParts = await extractAddressPartsFromGoogle(address);
  } catch (error) {
    throw({
      status: 400,
      message: messages.invalidAddress,
    });
  }

  let practice;
  try {
    practice = await Practice.create({
      members: [user._id],
      businessName: businessName,
      website: website,
      addresses: [
        {
          street: addressParts.street,
          city: addressParts.city,
          state: addressParts.state,
          zip: addressParts.zip,
        }
      ],
      isCompany: false,
    });
  } catch (error) {
    throw({
      status: 400,
      message: messages.practiceCreationFailed,
    });
  }

  user.practice = practice._id;
  user.status = "onboarded";

  try {
    const userUpdated = await User.findByIdAndUpdate(id, user);
    return userUpdated.toObject();
  } catch (error) {
    throw({
      status: 400,
      message: messages.practiceCreationFailed,
    });
  }
}; 

export const onboardingIndividualStep2Handler = async (req, res, next) => {
  try {
    const user = await onboardingIndividualStep2Service(
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