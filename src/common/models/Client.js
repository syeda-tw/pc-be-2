import mongoose from "mongoose";
const { Schema } = mongoose;

const ClientSchema = new Schema({
  // Core identifiers
  _id: { type: Schema.Types.ObjectId, auto: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true, index: { unique: true, sparse: true } },
  password: { type: String },

  // Personal information
  firstName: { type: String },
  middleName: { type: String },
  lastName: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String },
  pronouns: { type: String },

  // Account status
  status: { 
    type: String, 
    enum: ['onboarding-step-1', 'onboarding-step-2', 'onboarding-step-3', 'onboarded'], 
    default: 'onboarding-step-1' 
  },

  // Payment information
  stripeCustomerId: { type: String },
  stripePaymentMethodId: { type: String },
  defaultPaymentMethod: { 
    type: mongoose.Schema.Types.Mixed, 
    // Flexible schema to store complex card data
  },

  // Relationships
  relationships: [{
    type: Schema.Types.ObjectId,
    ref: "Relationship",
  }],
  defaultRelationship: {
    type: Schema.Types.ObjectId,
    ref: "Relationship",
  },

  // Authentication
  loginOtp: { type: String },
  loginOtpExpiresAt: { type: Date },

}, { timestamps: true });

export default mongoose.model('Client', ClientSchema);
