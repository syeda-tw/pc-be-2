// TODO: Change from appointment to session
import Client from "../../../../common/models/Client.js";
import Relationship from "../../../../common/models/Relationship.js";
import Stripe from "stripe";
import { env } from "../../../../common/config/env.js";
import { sanitizeUserAndAppendType } from '../../../common/utils.js';
import Session from '../../../../common/models/Session.js';
import User from '../../../../common/models/User.js';

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
  clientUpdateError: "We couldn't update your client status. Please try again.",
  sessionCreated: "Session successfully booked.",
};

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

const bookSessionService = async (
  clientId,
  relationshipId,
  startTime,
  endTime,
  date
) => {
  try {
    const client = await Client.findById(clientId);
    if (!client) {
      throw { status: 404, message: messages.clientNotFound };
    }

    const relationship = await Relationship.findById(relationshipId);
    if (!relationship) {
      throw { status: 404, message: messages.notFound };
    }

    let createdSession;
    try {
      const session = {
        client: clientId,
        user: relationship.user,
        date,
        startTime,
        endTime,
        notes: "",
        paymentStatus: "pending",
        billingInformation: {},
        relationship: relationshipId,
      };

      createdSession = await Session.create(session);
      relationship.sessions.push(createdSession._id);
      await relationship.save();

      console.log("Session created and added to relationship:", {
        relationshipId: relationship._id,
        sessionId: createdSession._id,
      });
    } catch (error) {
      console.error("Error creating session:", {
        message: error?.message || String(error),
        stack: error?.stack,
        clientId,
        relationshipId,
      });
      throw { status: 500, message: messages.sessionCreationError };
    }

    try {
      const user = await User.findById(relationship.user);
      const cost = user.sessionCost;

      const paymentMethods = await stripe.paymentMethods.list({
        customer: client.stripeCustomerId,
        type: "card",
      });

      console.log("Payment methods retrieved:", {
        customerId: client.stripeCustomerId,
        count: paymentMethods.data.length,
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

      console.log("Payment intent created:", {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      });

      if (paymentIntent.status !== "succeeded") {
        console.error("Payment intent failed:", {
          id: paymentIntent.id,
          error: paymentIntent.last_payment_error,
        });
        throw { status: 402, message: messages.paymentFailed };
      }

      try {
        createdSession.paymentIntentId = paymentIntent.id;
        createdSession.paymentStatus = "paid";
        createdSession.billingInformation = paymentIntent;
        await createdSession.save();

        console.log("Session updated with payment info");
      } catch (error) {
        console.error("Error updating session:", {
          message: error?.message || String(error),
          stack: error?.stack,
          sessionId: createdSession._id,
        });
        throw { status: 500, message: messages.sessionUpdateError };
      }

      try {
        client.status = "onboarded";
        await client.save();
        console.log("Client status updated to onboarded");
        return client.toObject();
      } catch (error) {
        console.error("Error updating client:", {
          message: error?.message || String(error),
          stack: error?.stack,
          clientId: client._id,
        });
        throw { status: 500, message: messages.clientUpdateError };
      }
    } catch (stripeError) {
      console.error("Stripe payment error:", {
        message: stripeError?.message || String(stripeError),
        stack: stripeError?.stack,
        clientId,
        relationshipId,
      });

      if (
        stripeError.raw?.payment_intent?.id
      ) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(
            stripeError.raw.payment_intent.id
          );
          console.error("Retrieved failed payment intent:", {
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
            error: paymentIntent.last_payment_error,
          });
        } catch (retrieveError) {
          console.error("Error retrieving payment intent:", {
            message: retrieveError?.message || String(retrieveError),
            stack: retrieveError?.stack,
          });
        }
      }

      throw { status: 402, message: messages.paymentFailed };
    }
  } catch (error) {
    console.error("Error in bookSessionService:", {
      message: error?.message || String(error),
      stack: error?.stack,
      clientId,
      relationshipId,
    });
    throw error;
  }
};

const bookSessionHandler = async (req, res) => {
  try {
    const client = await bookSessionService(
      req.id,
      req.body.relationshipId,
      req.body.startTime,
      req.body.endTime,
      req.body.date
    );
    res.status(200).json({
      message: messages.sessionCreated,
      client: sanitizeUserAndAppendType(client, "client"),
    });
  } catch (err) {
    console.error("Error in bookSessionHandler:", {
      message: err?.message || String(err),
      stack: err?.stack,
      status: err?.status,
    });
    res.status(err.status || 500).json({
      message: err.message || messages.generalError,
    });
  }
};

export default bookSessionHandler;
