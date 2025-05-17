import mongoose from "mongoose";
const { Schema } = mongoose;

const ClientSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  phone: { type: String, required: true , unique: true},
  password: { type: String },
  firstName: { type: String },
  middleName: { type: String },
  lastName: { type: String },
  dateOfBirth: { type: Date },
  pronouns: { type: String },
  status: { type: String, enum: ['onboarding-step-1', 'onboarding-step-2', 'onboarding-step-3', 'onboarding-step-4', 'onboarded'], default: 'onboarding-step-1' },
  email: { type: String, unique: true, sparse: true, index: { unique: true, sparse: true } },
  gender: { type: String },
  stripeCustomerId: { type: String },
  defaultPaymentMethod: { 
    type: mongoose.Schema.Types.Mixed, 
    // We could specify validation, but it is flexible enough to store the complex card data
  },
  stripeCustomerId: { type: String },
  stripePaymentMethodId: { type: String },
  relationships: {
    type: [RelationshipSchema],
    default: [],
  },
}, { timestamps: true });

export default mongoose.model('Client', ClientSchema);
