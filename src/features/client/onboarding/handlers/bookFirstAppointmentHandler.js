import Client from "../../../../common/models/Client.js";
import Relationship from "../../../../common/models/Relationship.js";
import Stripe from "stripe";
import { env } from "../../../../common/config/env.js";
import { sanitizeUserAndAppendType } from '../../../common/utils.js';
import Session from '../../../../common/models/Session.js';

const messages = {
  notFound: "We couldn't find the relationship you're looking for. Please try again.",
  appointmentCreated: "Your appointment has been successfully created!",
  appointmentCharged: "Your appointment has been charged successfully.",
  appointmentUpdated: "Your appointment has been updated successfully.",
  clientUpdated: "Your client information has been updated successfully.",
  relationshipUpdated: "Your relationship status has been updated successfully.",
  paymentFailed: "We couldn't process your payment. Please check your card details and try again.",
  generalError: "Something went wrong. Please try again later.",
  clientNotFound: "We couldn't find your client information. Please try again.",
  sessionCreationError: "We couldn't create your session. Please try again.",
  relationshipUpdateError: "We couldn't update your relationship. Please try again.",
  clientUpdateError: "We couldn't update your client status. Please try again."
};

const bookFirstAppointmentService = async (
  clientId,
  relationshipId,
  startTime,
  endTime,
  cost,
  date
) => {
  console.log('Starting bookFirstAppointmentService with params:', { clientId, relationshipId, startTime, endTime, cost, date });
  
  try {
    const client = await Client.findById(clientId);
    if (!client) {
      console.error('Client not found:', { clientId, error: 'Client document not found in database' });
      throw {
        status: 404,
        message: messages.clientNotFound,
      };
    }
    console.log('Client found successfully:', { clientId: client._id });

    const relationship = await Relationship.findById(relationshipId);
    if (!relationship) {
      console.error('Relationship not found:', { relationshipId, error: 'Relationship document not found in database' });
      throw {
        status: 404,
        message: messages.notFound,
      };
    }
    console.log('Relationship found successfully:', { relationshipId: relationship._id });

    try {
      console.log('Creating new session with data:', { clientId, userId: relationship.user, date, startTime, endTime });
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

      const createdSession = await Session.create(session);
      console.log('Session created successfully:', { sessionId: createdSession._id });
      
      relationship.sessions.push(createdSession._id);
      await relationship.save();
      console.log('Relationship updated with new session:', { relationshipId: relationship._id, sessionId: createdSession._id });
    } catch (error) {
      console.error('Error creating session:', { 
        error: error.message,
        stack: error.stack,
        clientId,
        relationshipId
      });
      throw {
        status: 500,
        message: messages.sessionCreationError,
      };
    }

    try {
      console.log('Initializing Stripe payment process:', { clientId, cost });
      const stripe = new Stripe(env.STRIPE_SECRET_KEY);
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
      console.log('Payment intent created:', { 
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status 
      });

      if (paymentIntent.status !== "succeeded") {
        console.error('Payment intent not succeeded:', { 
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
          error: paymentIntent.last_payment_error 
        });
        throw {
          status: 402,
          message: messages.paymentFailed,
        };
      }

      try {
        console.log('Updating relationship with payment information:', { relationshipId: relationship._id });
        relationship.sessions[0].paymentIntentId = paymentIntent.id;
        relationship.sessions[0].paymentStatus = "paid";
        relationship.sessions[0].billingInformation = paymentIntent;
        relationship.isClientOnboardingComplete = true;
        await relationship.save();
        console.log('Relationship updated successfully with payment info');
      } catch (error) {
        console.error('Error updating relationship:', { 
          error: error.message,
          stack: error.stack,
          relationshipId: relationship._id
        });
        throw {
          status: 500,
          message: messages.relationshipUpdateError,
        };
      }

      try {
        console.log('Updating client status to onboarded:', { clientId: client._id });
        client.status = "onboarded";
        await client.save();
        console.log('Client status updated successfully');
        return client.toObject();
      } catch (error) {
        console.error('Error updating client:', { 
          error: error.message,
          stack: error.stack,
          clientId: client._id
        });
        throw {
          status: 500,
          message: messages.clientUpdateError,
        };
      }
    } catch (err) {
      console.error('Payment processing error:', { 
        error: err.message,
        stack: err.stack,
        clientId,
        relationshipId
      });
      if (err.raw && err.raw.payment_intent && err.raw.payment_intent.id) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(err.raw.payment_intent.id);
          console.error('Retrieved failed payment intent:', { 
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
            error: paymentIntent.last_payment_error
          });
        } catch (retrieveError) {
          console.error('Error retrieving payment intent:', { 
            error: retrieveError.message,
            stack: retrieveError.stack,
            paymentIntentId: err.raw.payment_intent.id
          });
        }
      }
      throw {
        status: 402,
        message: messages.paymentFailed,
      };
    }
  } catch (error) {
    console.error('Error in bookFirstAppointmentService:', { 
      error: error.message,
      stack: error.stack,
      clientId,
      relationshipId
    });
    throw error;
  }
};

const bookFirstAppointmentHandler = async (req, res) => {
  console.log('Starting bookFirstAppointmentHandler with request body:', req.body);
  try {
    const client = await bookFirstAppointmentService(
      req.id,
      req.body.relationshipId,
      req.body.startTime,
      req.body.endTime,
      req.body.cost,
      req.body.date
    );
    console.log('Appointment booked successfully:', { clientId: client._id });
    res.status(200).json({
      message: messages.appointmentCreated,
      client: sanitizeUserAndAppendType(client, "client"),
    });
  } catch (err) {
    console.error('Error in bookFirstAppointmentHandler:', { 
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

export default bookFirstAppointmentHandler;
