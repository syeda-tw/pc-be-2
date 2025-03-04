import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPractice extends Document {
  _id: Types.ObjectId;
  business_name: string;
  is_company: boolean;
  website?: string;
  addresses: string[];
}

const PracticeSchema = new Schema<IPractice>({
  _id: { type: Schema.Types.ObjectId, required: true, auto: true },
  business_name: { type: String },
  is_company: { type: Boolean },
  website: { type: String },
  addresses: { type: [String] },
});

export default mongoose.model<IPractice>("Practice", PracticeSchema);
