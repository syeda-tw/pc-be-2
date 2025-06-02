import mongoose from 'mongoose';

const relationshipSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  clientModel: {
    type: String,
    required: true,
    enum: ['Client', 'InvitedClient']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'rejected', 'active'],
    default: 'pending'
  },
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }],
  intakeFormsFilledStatus: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  isClientOnboardingComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Create compound index to ensure unique relationship between client and user
relationshipSchema.index({ client: 1, user: 1 }, { unique: true });

const Relationship = mongoose.model('Relationship', relationshipSchema);

export default Relationship;
