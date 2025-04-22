import mongoose from "mongoose";
import { timezones } from "../../features/user/profile-settings/constants.js";

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
  username: { type: String, unique: true },
  holidays: { type: [{ name: String, start_date: Date, end_date: Date }], default: [] },
  status: {
    type: String,
    enum: [
      "onboarding-step-1",
      "onboarding-step-2",
      "onboared",
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
      daily_lunch_start_time: { type: String },
      daily_lunch_end_time: { type: String },
      weekly_schedule: [
        new Schema({
          day: { type: String, required: true },
          start_time: { type: String },
          end_time: { type: String },
          is_open: { type: Boolean, default: true },
        }, { _id: false })
      ],
    },
    default: {
      daily_lunch_start_time: "12:00",
      daily_lunch_end_time: "13:00",
      weekly_schedule: [
        { day: "Monday", start_time: "09:00", end_time: "17:00", is_open: true },
        { day: "Tuesday", start_time: "09:00", end_time: "17:00", is_open: true },
        { day: "Wednesday", start_time: "09:00", end_time: "17:00", is_open: true },
        { day: "Thursday", start_time: "09:00", end_time: "17:00", is_open: true },
        { day: "Friday", start_time: "09:00", end_time: "17:00", is_open: true },
        { day: "Saturday", start_time: "09:00", end_time: "17:00", is_open: false },
        { day: "Sunday", start_time: "09:00", end_time: "17:00", is_open: false },
      ],
    },
  },
  forms: {
    type: [{ _id: String, name: String, created_at: Date, s3_url: String }],
    default: [],
  },
  clients: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Client' }],
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
