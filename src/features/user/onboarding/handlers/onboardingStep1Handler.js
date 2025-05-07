import User from "../../../../common/models/User.js";
import { sanitizeUserAndAppendType } from '../../../common/utils.js';

const messages = {
  userNotFound: "User not found",
  usernameAlreadyExists: "Username already exists",
  errorUpdatingUser: "Error updating user",
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
        status: 400,
        message: messages.userNotFound,
      };
    }
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      throw {
        status: 400,
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
        status: 500,
        message: messages.errorUpdatingUser,
      };
    }
  } catch (error) {
    throw {
      status: 500,
      message: error.errorUpdatingUser,
    };
  }
};

export const onboardingStep1Handler = async (req, res, next) => {
  try {
    const user = await onboardingStep1Service(
      req.body.data,
      req.body.decodedToken._id
    );
    return res.status(200).json({ user: sanitizeUserAndAppendType(user, "user") });
  } catch (err) {
    next(err);
  }
};
