import mongoose from "mongoose";

const { Schema } = mongoose;

const UserOtpVerificationSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    password: { type: String, required: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("UserOtpVerification", UserOtpVerificationSchema);
