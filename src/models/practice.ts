import mongoose, { Schema, Document } from "mongoose";

interface IOffice {
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    name: string;
    country: string;
  };
  title: string;
  phones: string[];
}

export interface IPractice extends Document {
  name: string;
  is_company: boolean;
  website?: string;
  office: IOffice[];
}

const OfficeSchema = new Schema<IOffice>({
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    name: { type: String, required: true },
    country: { type: String, required: true },
  },
  title: { type: String, required: true },
  phones: { type: [String], required: true },
});

const PracticeSchema = new Schema<IPractice>({
  name: { type: String },
  is_company: { type: Boolean },
  website: { type: String },
  office: { type: [OfficeSchema] },
});

export default mongoose.model<IPractice>("Practice", PracticeSchema);
