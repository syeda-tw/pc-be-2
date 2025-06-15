import User from "../../../../common/models/User.js";
import { sanitizeUserAndAppendType } from '../../../common/utils.js';

const messages = {
  userNotFound: "We couldn't find your account. Please check your details and try again.",
  usernameAlreadyExists: "This username is already taken. Please choose a different one.",
  errorUpdatingUser: "We encountered an issue while updating your information. Please try again.",
  invalidUserStatus: "It seems like you're not on the correct onboarding step. Let's get you back on track.",
};

const onboardingStep1Service = async (
  {
    title,
    pronouns,
    gender,
    dateOfBirth,
    firstName,
    lastName,
    middleName,
    username,
  },
  id
) => {
  try {
    const user = await User.findById(id);
    
    if (!user) {
      throw {
        error: "USER_NOT_FOUND",
        message: messages.userNotFound,
      };
    }

    if (user.status !== "onboarding-step-1") {
      throw {
        error: "INVALID_USER_STATUS",
        message: messages.invalidUserStatus,
      };
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      throw {
        error: "USERNAME_EXISTS",
        message: messages.usernameAlreadyExists,
      };
    }

    user.title = title;
    user.pronouns = pronouns;
    user.gender = gender;
    user.dateOfBirth = dateOfBirth;
    user.firstName = firstName;
    user.lastName = lastName;
    user.middleName = middleName;
    user.status = "onboarding-step-2";
    user.username = username;

    try {
      const userUpdated = await user.save();
      return userUpdated.toObject();
    } catch (error) {
      throw {
        error: "UPDATE_FAILED",
        message: messages.errorUpdatingUser,
      };
    }
  } catch (error) {
    throw {
      error: error.error || "INTERNAL_ERROR",
      message: error.message || messages.errorUpdatingUser,
    };
  }
};

export const onboardingStep1Handler = async (req, res, next) => {
  try {
    const user = await onboardingStep1Service(
      req.body,
      req.id
    );
    return res.status(200).json({ user: sanitizeUserAndAppendType(user, "user") });
  } catch (err) {
    next(err);
  }
};
