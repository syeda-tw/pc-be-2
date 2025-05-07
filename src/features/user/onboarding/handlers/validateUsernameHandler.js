import User from "../../../../common/models/User.js";

const messages = {
  usernameAlreadyExists: "Username already exists",
  usernameAvailable: "Username is available",
}

const validateUsernameService = async (username) => {
  const user = await User.findOne({ username });
  if (user) {
    throw({
      status: 400,
      message: messages.usernameAlreadyExists,
    })
  } 
  return
};

export const validateUsernameHandler = async (req, res, next) => {
  try {
    await validateUsernameService(
      req.body.data.username,
    );
    return res.status(200).json({
      isValid: true,
      message: messages.usernameAvailable,
    });
  } catch (err) {
    next(err);
  }
};