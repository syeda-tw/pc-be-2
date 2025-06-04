import User from "../../../../common/models/User.js";
import Practice from "../../../../common/models/Practice.js";
import { extractAddressPartsFromGoogle } from '../utils.js';
import { sanitizeUserAndAppendType } from '../../../common/utils.js';
import { googleValidateAddress } from './validateAddressHandler.js';

const messages = {
  userNotFound: "We're having trouble finding your account. Please try again or contact support if the issue persists.",
  practiceCreationFailed: "We're having trouble setting up your practice. Please try again or contact our support team for assistance.",
  invalidAddress: "We couldn't verify your address. Please double-check and make sure it's complete and accurate.",
  invalidUserStatus: "We need to complete the previous step before proceeding. Please go back and complete step 1 first.",
};

const onboardingIndividualStep2Service = async (data, id) => {
  const { name, website, address } = data;
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
      members: [user._id],
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
      isCompany: false,
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