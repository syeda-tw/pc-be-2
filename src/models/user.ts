import mongoose, { Schema, Document, Types } from "mongoose";

export type UserStatus =
  | "onboarding-step-1"
  | "onboarding-step-2"
  | "onboarding-step-3"
  | "verified"
  | "disabled";

interface IQualification {
  [key: string]: any; // Placeholder for qualification fields
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  title?: string;
  is_admin: boolean;
  pronouns?: string;
  hourly_rate?: number;
  gender?: string;
  qualifications: IQualification[];
  practice: Types.ObjectId;
  password: string;
  status: UserStatus;
  email: string;
  date_of_birth?: Date;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
}

const UserSchema = new Schema<IUser>({
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
});

export default mongoose.model<IUser>("User", UserSchema);
