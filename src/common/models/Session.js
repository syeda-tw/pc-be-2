import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  relationship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true
  },
  user: {  // therapist
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
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
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  billingInformation: {
    type: Object,
    required: false
  }
}, {
  timestamps: true
});

// Index to speed up queries fetching sessions for a therapist + date range
sessionSchema.index({ User: 1, date: 1 });

// Index to speed up queries fetching sessions for a client + date range
sessionSchema.index({ client: 1, date: 1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
