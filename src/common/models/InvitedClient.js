import mongoose, { Schema } from "mongoose";

const invitedClientSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    phone: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: false, unique: true, sparse: true },
    oneTimePassword: { type: String, required: false },
    oneTimePasswordExpiresAt: { type: Date, required: false },
    relationships: [{
      type: Schema.Types.ObjectId,
      ref: "Relationship"
    }]
  },
  { timestamps: true }
);

const InvitedClient = mongoose.model("InvitedClient", invitedClientSchema);

export default InvitedClient;
