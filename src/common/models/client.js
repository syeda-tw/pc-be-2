import mongoose from "mongoose";
const { Schema } = mongoose;

const ClientSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  phone: { type: String, required: true , unique: true},
  first_name: { type: String },
  middle_name: { type: String },
  last_name: { type: String },
  date_of_birth: { type: Date },
  pronouns: { type: String },
  users_who_have_invited: { type: [Schema.Types.ObjectId], ref: 'User' },
  status: { type: String, enum: ['onboarding-step-1', 'onboarding-step-2', 'onboarding-step-3', 'onboarded'], default: 'onboarding-step-1' },
  email: { type: String, unique: true, sparse: true, index: { unique: true, sparse: true } },
  gender: { type: String },
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }, { status: { type: String, enum: ['pending', 'rejected', 'accepted'], default: 'pending' } }],
}, { timestamps: true });

export default mongoose.model('Client', ClientSchema);
