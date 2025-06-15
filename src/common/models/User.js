import mongoose from "mongoose";
import {
  DAYS_OF_WEEK,
  GENDER_OPTIONS,
  PRONOUNS_OPTIONS,
  TIMEZONES,
} from "../../features/common/constants.js";
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

export { FormSchema };

// Main User Schema
const UserSchema = new Schema(
  {
    // Core identification fields
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
        validator: (value) => {
          if (value === "" || value === null) return true;
          const isValidLength = value.length >= 4 && value.length <= 20;
          const isValidFormat = /^[a-zA-Z0-9_]+$/.test(value);
          return isValidLength && isValidFormat;
        },
        message: "Username must be 4–20 characters long and only contain letters, numbers, and underscores.",
      },
    },
    password: { type: String },

    // Personal information
    title: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    middleName: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: GENDER_OPTIONS },
    pronouns: { type: String, enum: PRONOUNS_OPTIONS },

    // Professional settings
    isAdmin: { type: Boolean, default: false },
    practice: { type: Schema.Types.ObjectId, ref: "Practice" },
    sessionCost: { type: Number, default: 100 },
    sessionDuration: { type: Number, default: 60 },
    status: {
      type: String,
      enum: ["onboarding-step-1", "onboarding-step-2", "onboarded", "verified", "disabled"],
      default: "onboarding-step-1",
    },
    timezone: { type: String, default: TIMEZONES[0].value },

    // Availability settings
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

    // Professional documents and relationships
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
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
