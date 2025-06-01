import User from "../../../../common/models/User.js";

const messages = {
  usernameAlreadyExists: "That username is already taken. Would you like to try a different one?",
  usernameAvailable: "Great! This username is available.",
  missingUsername: "Please provide a username to check.",
};

const validateUsernameService = async (username) => {
  if (!username) {
    throw {
      status: 400,
      message: messages.missingUsername,
    };
  }

  const user = await User.findOne({ username });
  if (user) {
    throw {
      status: 400,
      message: messages.usernameAlreadyExists,
    };
  }
};

export const validateUsernameHandler = async (req, res, next) => {
  try {
    await validateUsernameService(req.body.username);
    return res.status(200).json({
      isValid: true,
      message: messages.usernameAvailable,
    });
  } catch (err) {
    next(err);
  }
};