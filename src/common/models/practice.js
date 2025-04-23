import mongoose from "mongoose";

const { Schema } = mongoose;

const AddressSchema = new Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zip: { type: String },
});

const PracticeSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, required: true, auto: true },
  business_name: { type: String },
  is_company: { type: Boolean },
  website: { type: String },
  addresses: { type: [AddressSchema], default: [] },
  members: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.model("Practice", PracticeSchema);
