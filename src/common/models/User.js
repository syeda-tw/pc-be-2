import mongoose from "mongoose";
import { DAYS_OF_WEEK, TIMEZONES } from "../../features/common/constants.js";
const { Schema } = mongoose;

// Email Validation Regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Nested Schema for Forms
const FormSchema = new mongoose.Schema(
  {
    _id: String,
    name: String,
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
);

// Main User Schema
const UserSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    email: {
      type: String,
      unique: true,
      sparse: true,
      match: [emailRegex, "Please enter a valid email address."],
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      validate: {
        validator: (value) => value === "" || value === null || value.length >= 3,
        message: "Username must be at least 3 characters long if provided.",
      },
    },
    password: { type: String },
    title: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    middleName: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String },
    pronouns: { type: String },
    isAdmin: { type: Boolean, default: false },
    practice: { type: Schema.Types.ObjectId, ref: "Practice" },
    hourlyRate: { type: Number },
    sessionCost: { type: Number, default: 200 },
    sessionDuration: { type: Number, default: 60 },
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
                enum: DAYS_OF_WEEK,
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
          isOpen: day !== "Saturday" && day !== "Sunday",
        })),
      },
    },
    holidays: {
      type: [{ name: String, startDate: Date, endDate: Date }],
      default: [],
    },
    forms: {
      type: [FormSchema],
      default: [],
      validate: {
        validator: function (val) {
          return val.length <= 10;
        },
        message: "Practioner can only have up to 10 intake forms",
      },
    },
    relationships: [
      {
        type: Schema.Types.ObjectId,
        ref: "Relationship",
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual field to compute current holiday
UserSchema.virtual("currentHoliday").get(function () {
  const todayISO = new Date().toISOString();
  return this.holidays?.find((h) => {
    return h.startDate?.toISOString() <= todayISO && h.endDate?.toISOString() >= todayISO;
  }) || null;
});

export default mongoose.model("User", UserSchema);

// Example mock user object for testing
export const mockUserComplete = {
  _id: "603d9f3d8d4e4f2f74c2c5f8",
  email: "user@example.com",
  username: "johndoe",
  password: "hashed_password_here",
  title: "Mr.",
  firstName: "John",
  lastName: "Doe",
  middleName: "Michael",
  dateOfBirth: "1990-01-01T00:00:00Z",
  gender: "Male",
  pronouns: "he/him",
  isAdmin: false,
  practice: "603d9f3d8d4e4f2f74c2c5f9",
  hourlyRate: 50,
  sessionCost: 200,
  sessionDuration: 60,
  status: "onboarding-step-2",
  timezone: "EDT",
  availability: {
    dailyLunchStartTime: "12:00",
    dailyLunchEndTime: "13:00",
    weeklySchedule: [
      { day: "Monday", startTime: "09:00", endTime: "17:00", isOpen: true },
      { day: "Tuesday", startTime: "09:00", endTime: "17:00", isOpen: true },
      { day: "Wednesday", startTime: "09:00", endTime: "17:00", isOpen: true },
      { day: "Thursday", startTime: "09:00", endTime: "17:00", isOpen: true },
      { day: "Friday", startTime: "09:00", endTime: "17:00", isOpen: true },
      { day: "Saturday", startTime: "09:00", endTime: "17:00", isOpen: false },
      { day: "Sunday", startTime: "09:00", endTime: "17:00", isOpen: false },
    ],
  },
  holidays: [
    {
      name: "Christmas Break",
      startDate: "2023-12-24T00:00:00Z",
      endDate: "2023-12-26T00:00:00Z",
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
  relationships: ["603d9f3d8d4e4f2f74c2c5f7"],
};
