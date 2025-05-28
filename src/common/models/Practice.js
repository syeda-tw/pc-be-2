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
    businessName: { type: String, default: "", minlength: 0 },
    isCompany: { type: Boolean, default: false },
    website: { type: String, default: "" },
    addresses: { type: [AddressSchema], default: [] },
    members: { type: [String], default: [] },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    taxId: { type: String, default: "" },
    businessHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    specialties: { type: [String], default: [] },
    insuranceAccepted: { type: [String], default: [] },
    description: { type: String },
    logo: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Practice", PracticeSchema);
