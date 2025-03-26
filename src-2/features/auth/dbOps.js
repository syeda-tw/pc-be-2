import User from "../../common/models/user.js";
import OTPVerification from "../../common/models/otpVerification.js";

const findUserByEmailDbOp = async (email) => {
  return User.findOne({ email });
};

const findOtpVerificationByEmailDbOp = async (email) => {
  return OTPVerification.findOne({ email });
};

const createOtpVerificationDbOp = async (email, hashedPassword, otp) => {
  const otpVerification = new OTPVerification({
    email,
    password: hashedPassword,
    otp,
    expiration: Date.now() + 600000,
  });
  return otpVerification.save();
};

const createUserDbOp = async (user) => {
  const newUser = new User(user);
  return newUser.save();
};

const deleteOtpVerificationDbOp = async (email) => {
  return OTPVerification.deleteOne({ email });
};

const findUserByIdDbOp = async (id) => {
  return User.findById(id);
};

const updateUserPasswordDbOp = async (id, password) => {
  return User.findByIdAndUpdate(id, { password }, { new: true });
};

export {
  findUserByEmailDbOp,
  findOtpVerificationByEmailDbOp,
  createOtpVerificationDbOp,
  createUserDbOp,
  deleteOtpVerificationDbOp,
  findUserByIdDbOp,
};
