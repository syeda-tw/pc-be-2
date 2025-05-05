import mongoose from "mongoose";

const { Schema } = mongoose;

const OtpVerificationSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    password: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields
  }
);

// Create and export the model
export default mongoose.model("OtpVerification", OtpVerificationSchema);
