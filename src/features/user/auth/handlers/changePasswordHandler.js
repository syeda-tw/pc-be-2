import User from "../../../../common/models/User.js";
import { hashPassword, isPasswordCorrect } from "../../../common/utils.js";

const messages = {
  error: {
    userNotFound: "User not found",
    invalidOldPassword: "Invalid old password",
    cannotUseSamePassword: "Cannot use same password",
  },
  success: {
    passwordChanged: "Password changed successfully",
  },
};

const changePasswordService = async (id, oldPassword, newPassword, next) => {
  const user = await User.findById(id);
  if (!user) {
    throw {
      status: 404,
      message: messages.error.userNotFound,
    };
  }
  const isOldPasswordCorrect = await isPasswordCorrect(
    oldPassword,
    user.password
  );
  if (!isOldPasswordCorrect) {
    throw {
      status: 400,
      message: messages.error.invalidOldPassword,
    };
  }
  const arePasswordsSame = await isPasswordCorrect(newPassword, user.password);
  if (arePasswordsSame) {
    throw {
      status: 400,
      message: messages.error.cannotUseSamePassword,
    };
  }
  const hashedNewPassword = await hashPassword(newPassword);

  const userUpdated = await User.findByIdAndUpdate(
    user._id,
    { password: hashedNewPassword },
    { new: true }
  );

  if (!userUpdated) {
    throw {
      status: 404,
      message: messages.error.userNotFound,
    };
  }
  return;
};

export const changePasswordHandler = async (req, res, next) => {
  try {
    await changePasswordService(
      req.body.decodedToken._id,
      req.body.data.oldPassword,
      req.body.data.newPassword,
      next
    );
    return res.status(200).json({
      message: messages.success.passwordChanged,
    });
  } catch (err) {
    next(err);
  }
};
