import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, required: true, auto: true },
  title: { type: String },
  is_admin: { type: Boolean, default: false },
  pronouns: { type: String },
  hourly_rate: { type: Number },
  gender: { type: String },
  qualifications: { type: [{ type: Schema.Types.Mixed }], default: [] },
  practice: { type: Schema.Types.ObjectId, ref: "Practice" },
  password: { type: String, required: true },
  status: {
    type: String,
    enum: [
      "onboarding-step-1",
      "onboarding-step-2",
      "onboarding-step-3",
      "verified",
      "disabled",
    ],
    default: "onboarding-step-1",
  },
  email: { type: String },
  first_name: { type: String },
  last_name: { type: String },
  middle_name: { type: String },
  date_of_birth: { type: Date },
  availability: {
    type: [{ type: Schema.Types.Mixed }],
    default: [
      {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      },
    ],
  },
  forms: {
    type: [{ _id: String, name: String, created_at: Date, s3_url: String }],
    default: [],
  },
});

export default mongoose.model("User", UserSchema);
