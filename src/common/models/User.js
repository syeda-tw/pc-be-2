import mongoose from "mongoose";
import { DAYS_OF_WEEK, TIMEZONES } from "../../features/common/constants.js";
const { Schema } = mongoose;

// Email Validation Regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const FormSchema = new mongoose.Schema(
  {
    _id: String,
    name: String,
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
);

const UserSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    title: { type: String },
    isAdmin: { type: Boolean, default: false }, // Camel case for consistency
    pronouns: { type: String },
    hourlyRate: { type: Number }, // Camel case for consistency
    gender: { type: String },
    qualifications: { type: [{ type: Schema.Types.Mixed }], default: [] },
    practice: { type: Schema.Types.ObjectId, ref: "Practice" },
    password: {
      type: String,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      validate: {
        validator: (value) =>
          value === "" || value === null || value.length >= 3,
        message: "Username must be at least 3 characters long if provided.",
      },
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      match: [emailRegex, "Please enter a valid email address."],
    },
    holidays: {
      type: [{ name: String, startDate: Date, endDate: Date }],
      default: [],
    },
    status: {
      type: String,
      enum: [
        "onboarding-step-1",
        "onboarding-step-2",
        "onboarded",
        "verified",
        "disabled",
      ],
      default: "onboarding-step-1",
    },
    firstName: { type: String }, // Camel case for consistency
    lastName: { type: String }, // Camel case for consistency
    middleName: { type: String }, // Camel case for consistency
    dateOfBirth: { type: Date },
    timezone: { type: String, default: TIMEZONES[0] },
    availability: {
      type: {
        dailyLunchStartTime: { type: String },
        dailyLunchEndTime: { type: String },
        weeklySchedule: [
          new Schema(
            {
              day: {
                type: String,
                required: true,
                enum: DAYS_OF_WEEK, // Use the constant here
              },
              startTime: { type: String },
              endTime: { type: String },
              isOpen: { type: Boolean, default: true },
            },
            { _id: false }
          ),
        ],
      },
      default: {
        dailyLunchStartTime: "12:00",
        dailyLunchEndTime: "13:00",
        weeklySchedule: DAYS_OF_WEEK.map((day) => ({
          day,
          startTime: "09:00",
          endTime: "17:00",
          isOpen: day === "Saturday" || day === "Sunday" ? false : true,
        })),
      },
    },
    forms: {
      type: [FormSchema],
      default: [],
      validate: {
        validator: function (val) {
          return val.length <= 10;
        },
        message: "User can only have up to 10 intake forms",
      },
    },
    relationships: [
      {
        type: Schema.Types.ObjectId,
        ref: "Relationship",
      },
    ],
    bookings: [{
      type: Schema.Types.ObjectId,
      ref: "Booking"
    }],
    appointmentCost: { type: Number, default: 200 }, 
    appointmentDuration: { type: Number, default: 60 },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);

// Example mock user object for testing
export const mockUserComplete = {
  _id: "603d9f3d8d4e4f2f74c2c5f8",
  title: "Mr.",
  isAdmin: false,
  pronouns: "he/him",
  hourlyRate: 50,
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
  practiceId: "603d9f3d8d4e4f2f74c2c5f9",
  password: "hashed_password_here",
  status: "onboarding-step-2",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  middleName: "Michael",
  dateOfBirth: "1990-01-01T00:00:00Z",
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
      createdAt: "2022-01-01T00:00:00Z",
    },
    {
      _id: "form2",
      name: "Privacy Policy Agreement",
      createdAt: "2022-02-01T00:00:00Z",
    },
  ],
  bookings: ["603d9f3d8d4e4f2f74c2c5f7", "603d9f3d8d4e4f2f74c2c5f6"],
};
