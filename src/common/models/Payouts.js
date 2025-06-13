import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Index to speed up queries fetching payouts for a user
payoutSchema.index({ userId: 1 });

const Payout = mongoose.model('Payout', payoutSchema);

export default Payout;
