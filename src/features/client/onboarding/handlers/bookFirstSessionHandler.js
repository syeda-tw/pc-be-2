//TODO: Change from session to sesion
import Client from "../../../../common/models/Client.js";
import Relationship from "../../../../common/models/Relationship.js";
import Stripe from "stripe";
import { env } from "../../../../common/config/env.js";
import { sanitizeUserAndAppendType } from '../../../common/utils.js';
import Session from '../../../../common/models/Session.js';

const messages = {
  notFound: "We couldn't find the relationship you're looking for. Please try again.",
  sessionCreated: "Your session has been successfully created!",
  sessionCharged: "Your session has been charged successfully.",
  sessionUpdated: "Your session has been updated successfully.",
  clientUpdated: "Your client information has been updated successfully.",
  relationshipUpdated: "Your relationship status has been updated successfully.",
  paymentFailed: "We couldn't process your payment. Please check your card details and try again.",
  generalError: "Something went wrong. Please try again later.",
  clientNotFound: "We couldn't find your client information. Please try again.",
  sessionCreationError: "We couldn't create your session. Please try again.",
  relationshipUpdateError: "We couldn't update your relationship. Please try again.",
  clientUpdateError: "We couldn't update your client status. Please try again.",
  sessionUpdateError: "We couldn't update your session. Please try again.",
  sessionPaymentError: "We couldn't process your payment. Please check your card details and try again."
};

const bookFirstSessionService = async (
  clientId,
  relationshipId,
  startTime,
  endTime,
  cost,
  date
) => {
  let client;
  let relationship;
  let createdSession;
  let stripe;

  try {
    // Find client and relationship
    client = await Client.findById(clientId);
    if (!client) {
      throw {
        status: 404,
        message: messages.clientNotFound,
      };
    }

    relationship = await Relationship.findById(relationshipId);
    if (!relationship) {
      throw {
        status: 404,
        message: messages.notFound,
      };
    }

    // Create session
    const session = {
      client: clientId,
      user: relationship.user,
      date: date,
      startTime: startTime,
      endTime: endTime,
      notes: "",
      paymentStatus: "pending",
      billingInformation: {},
      relationship: relationshipId,
    };

    try {
      createdSession = await Session.create(session);
      console.log('Session created successfully:', { sessionId: createdSession._id });
      
      relationship.sessions.push(createdSession._id);
      await relationship.save();
      console.log('Relationship updated with new session:', { relationshipId: relationship._id, sessionId: createdSession._id });
    } catch (error) {
      throw {
        status: 500,
        message: messages.sessionCreationError,
      };
    }

    // Process payment
    try {
      console.log('Initializing Stripe payment process:', { clientId, cost });
      stripe = new Stripe(env.STRIPE_SECRET_KEY);
      const paymentMethods = await stripe.paymentMethods.list({
        customer: client.stripeCustomerId,
        type: "card",
      });
      console.log('Payment methods retrieved:', { 
        customerId: client.stripeCustomerId,
        paymentMethodsCount: paymentMethods.data.length 
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: cost * 100,
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        customer: client.stripeCustomerId,
        payment_method: paymentMethods.data[0].id,
        off_session: true,
        confirm: true,
      });

      if (paymentIntent.status !== "succeeded") {
        throw {
          status: 402,
          message: messages.paymentFailed,
        };
      }

      // Update session with payment info
      createdSession.paymentIntentId = paymentIntent.id;
      createdSession.paymentStatus = "paid";
      createdSession.billingInformation = paymentIntent;
      await createdSession.save();
      console.log('Session updated successfully with payment info');

      // Update client status
      client.status = "onboarded";
      await client.save();
      console.log('Client status updated successfully');
      
      return client.toObject();
    } catch (error) {
      if (error.status === 402) {
        throw error;
      }
      throw {
        status: 500,
        message: messages.sessionPaymentError,
      };
    }
  } catch (error) {
    console.error('Error in bookFirstSessionService:', { 
      error: error.message,
      stack: error.stack,
      clientId,
      relationshipId
    });

    // Handle payment intent retrieval if available
    if (error.raw?.payment_intent?.id && stripe) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(error.raw.payment_intent.id);
        console.error('Retrieved failed payment intent:', { 
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
          error: paymentIntent.last_payment_error
        });
      } catch (retrieveError) {
        console.error('Error retrieving payment intent:', { 
          error: retrieveError.message,
          stack: retrieveError.stack,
          paymentIntentId: error.raw.payment_intent.id
        });
      }
    }

    // Clean up created session if payment failed
    if (createdSession && error.status === 402) {
      try {
        await Session.findByIdAndDelete(createdSession._id);
        console.log('Cleaned up session after payment failure:', { sessionId: createdSession._id });
      } catch (cleanupError) {
        console.error('Error cleaning up session:', {
          error: cleanupError.message,
          stack: cleanupError.stack,
          sessionId: createdSession._id
        });
      }
    }

    throw error;
  }
};

const bookFirstSessionHandler = async (req, res) => {
  console.log('Starting bookFirstSessionHandler with request body:', req.body);
  try {
    const client = await bookFirstSessionService(
      req.id,
      req.body.relationshipId,
      req.body.startTime,
      req.body.endTime,
      req.body.cost,
      req.body.date
    );
    console.log('Session booked successfully:', { clientId: client._id });
    res.status(200).json({
      message: messages.sessionCreated,
      client: sanitizeUserAndAppendType(client, "client"),
    });
  } catch (err) {
    console.error('Error in bookFirstSessionHandler:', { 
      error: err.message,
      stack: err.stack,
      status: err.status,
      details: err.details
    });
    res.status(err.status || 500).json({
      message: err.message || messages.generalError,
      error: err.details || null,
    });
  }
};

export default bookFirstSessionHandler;
