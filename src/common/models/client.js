import mongoose from "mongoose";
const { Schema } = mongoose;

const ClientSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  phone: { type: String},
  is_active: { type: Boolean, default: false },
  registration_code: { type: String },
  first_name: { type: String },
  middle_name: { type: String },
  last_name: { type: String },
  birth_date: { type: Date },
  pronouns: { type: String },
  email: { type: String, unique: true, sparse: true, index: { unique: true, sparse: true } },
  gender: { type: String },
  users: [{
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    onboarding_code: {
      type: String,
      optional: true
    },
    is_active: { type: Boolean, default: false }
  }],
  dependants: [{
    name: { type: String},
    relationship: { type: String},
    birth_date: { type: Date}
  }]
});

export default mongoose.model('Client', ClientSchema);
