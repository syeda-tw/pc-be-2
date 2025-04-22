import mongoose from "mongoose";
const { Schema } = mongoose;

const ClientSchema = new Schema({
  id: { type: Schema.Types.ObjectId, auto: true },
  is_active: { type: Boolean, default: true },
  registration_code: { type: String, required: true },
  first_name: { type: String, required: true },
  middle_name: { type: String },
  last_name: { type: String, required: true },
  birth_date: { type: Date, required: true },
  pronouns: { type: String },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  gender: { type: String },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  dependants: [{
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    birth_date: { type: Date, required: true }
  }]
});

export default mongoose.model('Client', ClientSchema);
