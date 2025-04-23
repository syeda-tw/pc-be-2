import mongoose from 'mongoose';

const invitedClientSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    phone: { type: String, required: true, unique: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: false, unique: true, sparse: true },
    registration_code: { type: String, required: true, unique: true },
    users_who_have_invited: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', required: true },
}, { timestamps: true });


const InvitedClient = mongoose.model('InvitedClient', invitedClientSchema);

export default InvitedClient;
