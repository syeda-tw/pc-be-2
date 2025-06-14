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
    enum: ['pending', 'archived', 'active'],
    default: 'pending'
  },
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }],
  areIntakeFormsFilled: {
    type: Boolean,
    default: false
  },
  intakeForms: [{
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User.forms',
      required: false
    },
    formName: {
      type: String,
      required: true
    },
    formsUploadedByClient: [{
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    isMarkedComplete: {
      type: Boolean,
      default: false
    }
  }],
  isClientOnboardingComplete: {
    type: Boolean,
    default: false
  },
  notes: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Create compound index to ensure unique relationship between client and user
relationshipSchema.index({ client: 1, user: 1 }, { unique: true });

const Relationship = mongoose.model('Relationship', relationshipSchema);

export default Relationship;
