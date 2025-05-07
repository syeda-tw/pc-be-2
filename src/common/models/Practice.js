import mongoose from "mongoose";

const { Schema } = mongoose;

const AddressSchema = new Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zip: { type: String },
});

const PracticeSchema = new Schema({
  id: { type: Schema.Types.ObjectId, required: true, auto: true },
  businessName: { type: String },
  isCompany: { type: Boolean },
  website: { type: String },
  addresses: { type: [AddressSchema], default: [] },
  members: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.model("Practice", PracticeSchema);
