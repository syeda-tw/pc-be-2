import User from "../../common/models/user.js";
import OTPVerification from "../../common/models/otpVerification.js";

const findUserByEmailDbOp = async (email) => {
  try {
    return await User.findOne({ email });
  } catch (error) {
    console.error("Error in findUserByEmailDbOp:", error);
    return null;
  }
};

const findOtpVerificationByEmailDbOp = async (email) => {
  try {
    return await OTPVerification.findOne({ email });
  } catch (error) {
    console.error("Error in findOtpVerificationByEmailDbOp:", error);
    return null;
  }
};

const createOtpVerificationDbOp = async (email, hashedPassword, otp) => {
  try {
    const otpVerification = new OTPVerification({
      email,
      password: hashedPassword,
      otp,
      expiration: Date.now() + 600000,
    });
    return await otpVerification.save();
  } catch (error) {
    console.error("Error in createOtpVerificationDbOp:", error);
    return null;
  }
};

const createUserDbOp = async (user) => {
  try {
    const newUser = new User(user);
    return await newUser.save();
  } catch (error) {
    console.error("Error in createUserDbOp:", error);
    return null;
  }
};

const deleteOtpVerificationDbOp = async (email) => {
  try {
    return await OTPVerification.deleteOne({ email });
  } catch (error) {
    console.error("Error in deleteOtpVerificationDbOp:", error);
    return null;
  }
};

const findUserByIdDbOp = async (id) => {
  try {
    return await User.findById(id);
  } catch (error) {
    console.error("Error in findUserByIdDbOp:", error);
    return null;
  }
};

const updateUserPasswordDbOp = async (id, password) => {
  let res
  try {
    res = await User.findByIdAndUpdate(id, { password }, { new: true });
  } catch (error) {
    console.error("Error in updateUserPasswordDbOp:", error);
    return null;
  }
  return res;
};

export {
  findUserByEmailDbOp,
  findOtpVerificationByEmailDbOp,
  createOtpVerificationDbOp,
  createUserDbOp,
  deleteOtpVerificationDbOp,
  findUserByIdDbOp,
  updateUserPasswordDbOp,
};
