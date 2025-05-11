import mongoose from 'mongoose';

const invitedClientSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    phone: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: false, unique: true, sparse: true },
    registrationCode: { type: String, required: true, unique: true },
    usersWhoHaveInvited: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', required: true },
}, { timestamps: true });


const InvitedClient = mongoose.model('InvitedClient', invitedClientSchema);

export default InvitedClient;
