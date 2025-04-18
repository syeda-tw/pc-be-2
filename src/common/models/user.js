import mongoose from "mongoose";
import { timezones } from "../../features/profile-settings/constants.js";

const { Schema } = mongoose;

const UserSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, required: true, auto: true },
  title: { type: String },
  is_admin: { type: Boolean, default: false },
  pronouns: { type: String },
  hourly_rate: { type: Number },
  gender: { type: String },
  qualifications: { type: [{ type: Schema.Types.Mixed }], default: [] },
  practice_id: { type: Schema.Types.ObjectId, ref: "Practice" },
  password: { type: String, required: true },
  username: { type: String, unique: true },
  holidays: { type: [{ _id: { type: Schema.Types.ObjectId, auto: true, unique: true }, name: String, start_date: Date, end_date: Date }], default: [] },
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
  timezone: { type: String, default: timezones[0] },
  availability: {
    type: {
      fixedLunch: { type: Boolean, default: false },
      fixedLunchStarttime: { type: String },
      fixedLunchEndtime: { type: String },
      week: [
        {
          day: { type: String, required: true },
          starttime: { type: String },
          endtime: { type: String },
          lunchstarttime: { type: String },
          lunchendtime: { type: String },
          isOpen: { type: Boolean, default: false },
          hasIndividualLunch: { type: Boolean, default: false },
        },
      ],
    },
    default: {
      fixedLunch: false,
      fixedLunchStarttime: "",
      fixedLunchEndtime: "",
      week: [
        { day: "Monday", starttime: "09:00", endtime: "17:00", lunchstarttime: "", lunchendtime: "", isOpen: true, hasIndividualLunch: false },
        { day: "Tuesday", starttime: "09:00", endtime: "17:00", lunchstarttime: "", lunchendtime: "", isOpen: true, hasIndividualLunch: false },
        { day: "Wednesday", starttime: "09:00", endtime: "17:00", lunchstarttime: "", lunchendtime: "", isOpen: true, hasIndividualLunch: false },
        { day: "Thursday", starttime: "09:00", endtime: "17:00", lunchstarttime: "", lunchendtime: "", isOpen: true, hasIndividualLunch: false },
        { day: "Friday", starttime: "09:00", endtime: "17:00", lunchstarttime: "", lunchendtime: "", isOpen: true, hasIndividualLunch: false },
        { day: "Saturday", starttime: "", endtime: "", lunchstarttime: "", lunchendtime: "", isOpen: false, hasIndividualLunch: false },
        { day: "Sunday", starttime: "", endtime: "", lunchstarttime: "", lunchendtime: "", isOpen: false },
      ],
    },
  },
  forms: {
    type: [{ _id: String, name: String, created_at: Date, s3_url: String }],
    default: [],
  },
});

export default mongoose.model("User", UserSchema);

export const mockUserComplete = {
  _id: "603d9f3d8d4e4f2f74c2c5f8",
  title: "Mr.",
  is_admin: false,
  pronouns: "he/him",
  hourly_rate: 50,
  gender: "Male",
  qualifications: [
    {
      degree: "BSc in Computer Science",
      university: "Example University",
      year: 2020,
    },
    {
      certification: "AWS Certified Developer",
      year: 2022,
    },
  ],
  practice_id: "603d9f3d8d4e4f2f74c2c5f9",
  password: "hashed_password_here",
  status: "onboarding-step-2",
  email: "user@example.com",
  first_name: "John",
  last_name: "Doe",
  middle_name: "Michael",
  date_of_birth: "1990-01-01T00:00:00Z",
  availability: [
    {
      Monday: ["9am-12pm", "2pm-5pm"],
      Tuesday: ["9am-12pm"],
      Wednesday: ["10am-1pm"],
      Thursday: ["2pm-5pm"],
      Friday: ["9am-12pm", "3pm-6pm"],
      Saturday: [],
      Sunday: [],
    },
  ],
  forms: [
    {
      _id: "form1",
      name: "Onboarding Form",
      created_at: "2022-01-01T00:00:00Z",
      s3_url: "https://s3.amazon.com/example-form1.pdf",
    },
    {
      _id: "form2",
      name: "Privacy Policy Agreement",
      created_at: "2022-02-01T00:00:00Z",
      s3_url: "https://s3.amazon.com/example-form2.pdf",
    },
  ],
};
