import mongoose, { Schema, Document, Types } from "mongoose";

export type UserStatus = "onboarding" | "verified" | "disabled";

interface IQualification {
  [key: string]: any; // Placeholder for qualification fields
}

export interface IUser extends Document {
  title?: string;
  is_admin: boolean;
  pronouns?: string;
  hourly_rate?: number;
  gender?: string;
  qualifications: IQualification[];
  practice: Types.ObjectId;
  password: string;
  status: UserStatus;
}

const UserSchema = new Schema<IUser>({
  title: { type: String },
  is_admin: { type: Boolean, default: false },
  pronouns: { type: String },
  hourly_rate: { type: Number },
  gender: { type: String },
  qualifications: { type: [{ type: Schema.Types.Mixed }], default: [] },
  practice: { type: Schema.Types.ObjectId, ref: "Practice", required: true },
  password: { type: String, required: true },
  status: { type: String, enum: ["onboarding", "verified", "disabled"], default: "onboarding" },
});

export default mongoose.model<IUser>("User", UserSchema);
