import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    relationship: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Relationship',
        required: true
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

const Session = mongoose.model('Session', sessionSchema);

export default Session;
