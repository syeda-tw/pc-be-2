import mongoose from "mongoose";

const { Schema } = mongoose;

const AddressSchema = new Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zip: { type: String },
  country: { type: String, default: "USA" },
  isPrimary: { type: Boolean, default: false },
});

const PracticeSchema = new Schema(
  {
    id: { type: Schema.Types.ObjectId, required: true, auto: true },
    name: { type: String, default: "", minlength: 0 },
    isCompany: { type: Boolean, default: false },
    website: { type: String, default: "" },
    addresses: { type: [AddressSchema], default: [] },
    members: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Practice", PracticeSchema);
