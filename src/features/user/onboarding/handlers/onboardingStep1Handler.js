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
    const user = await findUserByIdDbOp(id);
    if (!user) {
      throw {
        status: 400,
        message: messages.userNotFound,
      };
    }
    const usernameExists = await findUserByUsernameDbOp(username);
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
      const userUpdated = await updateUserDbOp(id, user);
      return userUpdated;
    } catch (error) {
      throw {
        status: 500,
        message: error.message,
      };
    }
  } catch (error) {
    throw {
      status: 500,
      message: error.message,
    };
  }
};

export const onboardingStep1Handler = async (req, res, next) => {
  try {
    const user = await onboardingStep1Service(
      req.body.data,
      req.body.decodedToken._id
    );
    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};
