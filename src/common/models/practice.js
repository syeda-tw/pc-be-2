import mongoose from "mongoose";

const { Schema } = mongoose;

const PracticeSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, required: true, auto: true },
  business_name: { type: String },
  is_company: { type: Boolean },
  website: { type: String },
  addresses: { type: [String] },
});

export default mongoose.model("Practice", PracticeSchema);
