import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxLength: 255,
    },
    phone: {
      type: String,
      trim: true,
      maxLength: 20,
    },
    // Add any other client fields you need
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Index for faster queries
clientSchema.index({ userId: 1 });
clientSchema.index({ email: 1 });

const Client = mongoose.model("Client", clientSchema);

export default Client; 