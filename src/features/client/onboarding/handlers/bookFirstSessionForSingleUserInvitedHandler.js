import Client from "../../../../common/models/Client.js";
import Relationship from "../../../../common/models/Relationship.js";
import Stripe from "stripe";
import { env } from "../../../../common/config/env.js";
import { sanitizeUserAndAppendType } from "../../../common/utils.js";
import Session from "../../../../common/models/Session.js";
import { relationshipTimelineEntries } from "../../../../common/models/Relationship.js";
import { formatSessionBookingDetails } from "../utils/dateFormatting.js";

// User-friendly error messages for different scenarios
const messages = {
  notFound:
    "We couldn't find the relationship you're looking for. Please try again.",
  sessionCreated: "Your session has been successfully created!",
  sessionCharged: "Your session has been charged successfully.",
  sessionUpdated: "Your session has been updated successfully.",
  clientUpdated: "Your client information has been updated successfully.",
  relationshipUpdated:
    "Your relationship status has been updated successfully.",
  paymentFailed:
    "We couldn't process your payment. Please check your card details and try again.",
  generalError: "Something went wrong. Please try again later.",
  clientNotFound: "We couldn't find your client information. Please try again.",
  sessionCreationError: "We couldn't create your session. Please try again.",
  relationshipUpdateError:
    "We couldn't update your relationship. Please try again.",
  clientUpdateError: "We couldn't update your client status. Please try again.",
  sessionUpdateError: "We couldn't update your session. Please try again.",
  sessionPaymentError:
    "We couldn't process your payment. Please check your card details and try again.",
  noPaymentMethod:
    "No payment method found for this customer. Please add a payment method first.",
  invalidAmount: "Invalid payment amount. Please check the cost value.",
  stripeError:
    "There was an error processing your payment. Please try again later.",
};

/**
 * Core service function to handle booking first session for a single invited user
 * Flow:
 * 1. Validate client and relationship existence
 * 2. Create session record
 * 3. Process payment
 * 4. Update related records
 * 5. Handle rollbacks if any step fails
 */
const bookFirstSessionForSingleUserInvitedService = async (
  clientId,
  relationshipId,
  startTime,
  endTime,
  cost,
  date
) => {
  // Initialize variables for tracking state and rollback
  let client;
  let relationship;
  let createdSession;
  let stripe;
  let originalClientStatus;
  let originalRelationshipSessions;

  try {
    // Input validation
    if (
      !clientId ||
      !relationshipId ||
      !startTime ||
      !endTime ||
      !cost ||
      !date
    ) {
      throw { status: 400, message: "Missing required parameters" };
    }

    if (cost <= 0) {
      throw { status: 400, message: messages.invalidAmount };
    }

    // Step 1: Validate and fetch client
    client = await Client.findById(clientId);
    if (!client) {
      throw { status: 404, message: messages.clientNotFound };
    }
    originalClientStatus = client.status;

    // Step 2: Validate and fetch relationship
    relationship = await Relationship.findById(relationshipId);
    if (!relationship) {
      throw { status: 404, message: messages.notFound };
    }
    originalRelationshipSessions = [...relationship.sessions];

    // Step 3: Create session record
    const session = {
      client: clientId,
      user: relationship.user,
      date: date,
      startTime: startTime,
      endTime: endTime,
      paymentStatus: "pending",
      billingInformation: {},
      relationship: relationshipId,
    };

    try {
      createdSession = await Session.create(session);

      relationship.sessions.push(createdSession._id);

      await relationship.save();
    } catch (error) {
      throw { status: 500, message: messages.sessionCreationError };
    }

    // Step 4: Process payment through Stripe
    try {
      stripe = new Stripe(env.STRIPE_SECRET_KEY);

      // Fetch customer's payment methods
      const paymentMethods = await stripe.paymentMethods.list({
        customer: client.stripeCustomerId,
        type: "card",
      });

      if (!paymentMethods.data.length) {
        throw { status: 400, message: messages.noPaymentMethod };
      }

      // Create and confirm payment intent
      const paymentAmount = Math.round(cost * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: paymentAmount,
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        customer: client.stripeCustomerId,
        payment_method: paymentMethods.data[0].id,
        off_session: true,
        confirm: true,
      });

      if (paymentIntent.status !== "succeeded") {
        await handleFailedPayment(client, createdSession);
        throw { status: 402, message: messages.paymentFailed };
      }

      // Step 5: Update records with payment information
      await updateRecordsAfterSuccessfulPayment(
        createdSession,
        client,
        paymentIntent,
        relationship,
        date
      );
      return client.toObject();
    } catch (error) {
      await handlePaymentError(
        error,
        createdSession,
        relationship,
        client,
        originalRelationshipSessions,
        originalClientStatus
      );
      throw { status: 402, message: messages.sessionPaymentError };
    }
  } catch (error) {
    await handleServiceError(error, stripe);
    throw { status: 500, message: messages.sessionPaymentError };
  }
};

// Helper functions for better error handling and code organization
async function handleFailedPayment(client, session) {
  client.status = "onboarding-step-2";
  await client.save();
  session.paymentStatus = "failed";
  await session.save();
}

async function updateRecordsAfterSuccessfulPayment(
  session,
  client,
  paymentIntent,
  relationship,
  date
) {
  session.paymentStatus = "paid";
  session.billingInformation = paymentIntent;
  await session.save();
  client.status = "onboarded";
  await client.save();

  // Add timeline entry for first session booked
  const { bookedDate, startTimeFormatted, endTimeFormatted } = 
    formatSessionBookingDetails(date, startTime, endTime);
  
  relationship.timeline.push({
    event: relationshipTimelineEntries.firstSessionBooked(
      bookedDate,
      startTimeFormatted,
      endTimeFormatted
    )
  });
  await relationship.save();
}

async function handlePaymentError(
  error,
  session,
  relationship,
  client,
  originalRelationshipSessions,
  originalClientStatus
) {
  if (session) {
    try {
      await Session.findByIdAndDelete(session._id);
    } catch (cleanupError) {
      // Silent cleanup error
    }
  }

  if (relationship) {
    try {
      relationship.sessions = originalRelationshipSessions;
      await relationship.save();
    } catch (cleanupError) {
      // Silent cleanup error
    }
  }

  if (client) {
    try {
      client.status = originalClientStatus;
      await client.save();
    } catch (cleanupError) {
      // Silent cleanup error
    }
  }

  if (error.status === 402) {
    throw { status: 402, message: messages.sessionPaymentError };
  }
  throw { status: 500, message: messages.sessionPaymentError };
}

async function handleServiceError(error, stripe) {
  if (error.raw?.payment_intent?.id && stripe) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        error.raw.payment_intent.id
      );
      // Payment intent details available for debugging if needed
    } catch (retrieveError) {
      // Silent retrieve error
    }
  }
}

/**
 * HTTP handler for booking first session
 * Handles request/response cycle and error formatting
 */
const bookFirstSessionForSingleUserInvitedHandler = async (req, res) => {
  try {
    const client = await bookFirstSessionForSingleUserInvitedService(
      req.id,
      req.body.relationshipId,
      req.body.startTime,
      req.body.endTime,
      req.body.cost,
      req.body.date
    );

    res.status(200).json({
      message: messages.sessionCreated,
      client: sanitizeUserAndAppendType(client, "client"),
    });
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || messages.generalError;

    res.status(status).json({
      message,
      error: err.details || null,
    });
  }
};

export default bookFirstSessionForSingleUserInvitedHandler;
