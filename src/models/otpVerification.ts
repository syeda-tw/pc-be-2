import mongoose, { Schema, Document } from "mongoose";

interface IOtpVerification extends Document {
  email: string;
  otp: string;
  password: string;
}

const OtpVerificationSchema = new Schema<IOtpVerification>(
  {
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields
  }
);

// Create and export the model
export default mongoose.model<IOtpVerification>(
  "OtpVerification",
  OtpVerificationSchema
);
