import mongoose from "mongoose";

const relationshipSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    clientModel: {
      type: String,
      required: true,
      enum: ["Client", "InvitedClient"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "archived", "active"],
      default: "pending",
    },
    sessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
      },
    ],
    areIntakeFormsComplete: {
      type: Boolean,
      default: false,
    },
    relationshipIntakeForms: [
      {
        userIntakeFormId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User.forms",
          required: false,
        },
        userIntakeFormName: {
          type: String,
          required: true,
        },
        intakeFormResponsesUploadedByClient: [
          {
            _id: {
              type: mongoose.Schema.Types.ObjectId,
              required: true,
            },
            reponseFormName: {
              type: String,
              required: true,
            },
            reponseFormUploadedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        status: {
          type: String,
          required: true,
          enum: [
            "userAdded",
            "clientSubmitted",
            "userAccepted",
            "userRejected",
          ],
          default: "userAdded",
        },
      },
    ],
    isClientOnboardingComplete: {
      type: Boolean,
      default: false,
    },
    notes: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          auto: true,
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    timeline: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          auto: true,
        },
        event: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Create compound index to ensure unique relationship between client and user
relationshipSchema.index({ client: 1, user: 1 }, { unique: true });

const Relationship = mongoose.model("Relationship", relationshipSchema);

export default Relationship;

export const relationshipTimelineEntries = {
  clientRegistered: () => "Client registered",
  clientSubmittedStep1: () => "Client completed step 1",
  clientSubmittedStep2: () => "Client completed step 2",
  relationshipActivated: () => "Relationship activated",
  relationshipActivatedByUser: () => "Relationship activated by user",
  firstSessionBooked: (bookedDate, startTime, endTime) =>
    `First session booked for ${bookedDate} ${startTime}-${endTime}`,
  userAddedIntakeForm: (intakeFormName) =>
    `Client is asked to submit response for ${intakeFormName} intake form`,
  userRemovedIntakeForm: (intakeFormName) =>
    `${intakeFormName} intake form has been removed`,
  intakeFormsMarkedAsComplete: () => "Client has marked intake forms as complete",
  intakeFormsMarkedAsIncomplete: () => "Client has marked intake forms as incomplete",
  clientSubmittedIntakeForm: (clientSubmittedIntakeFormName, userIntakeFormName) =>
    `Client has submitted response for ${clientSubmittedIntakeFormName} intake form as a respose to ${userIntakeFormName} intake form`,
};
