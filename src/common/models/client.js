import mongoose from "mongoose";
const { Schema } = mongoose;

const ClientSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  phone: { type: String, required: true , unique: true},
  password: { type: String },
  first_name: { type: String },
  middle_name: { type: String },
  last_name: { type: String },
  date_of_birth: { type: Date },
  pronouns: { type: String },
  status: { type: String, enum: ['onboarding-step-1', 'onboarding-step-2', 'onboarding-step-3', 'onboarded'], default: 'onboarding-step-1' },
  email: { type: String, unique: true, sparse: true, index: { unique: true, sparse: true } },
  gender: { type: String },
  stripeCustomerId: { type: String },
  defaultPaymentMethod: { 
    type: mongoose.Schema.Types.Mixed, 
    // We could specify validation, but it is flexible enough to store the complex card data
  },
  stripe_customer_id: { type: String },
  stripe_payment_method_id: { type: String },
  users: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'rejected', 'accepted'], default: 'pending' },
    _id: false,
  }]
}, { timestamps: true });

export default mongoose.model('Client', ClientSchema);
