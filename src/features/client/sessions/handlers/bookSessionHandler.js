import Client from "../../../../common/models/Client.js";
import Relationship from "../../../../common/models/Relationship.js";
import Stripe from "stripe";
import { env } from "../../../../common/config/env.js";
import { sanitizeUserAndAppendType } from '../../../common/utils.js';
import Session from '../../../../common/models/Session.js';
import User from '../../../../common/models/User.js';

const messages = {
  error: {
    relationshipNotFound: "We couldn't find the relationship you're looking for. Please try again.",
    paymentFailed: "We couldn't process your payment. Please check your card details and try again.",
    generalError: "Something went wrong. Please try again later.",
    clientNotFound: "We couldn't find your client information. Please try again.",
    sessionCreationError: "We couldn't create your session. Please try again.",
    sessionUpdateError: "We couldn't update your session. Please try again.",
    clientUpdateError: "We couldn't update your client status. Please try again.",
  },
  success: {
    sessionCreated: "Your session has been successfully created!",
  }
};

const bookSessionService = async (clientId, relationshipId, startTime, endTime, date) => {
  const client = await Client.findById(clientId);
  if (!client) {
    throw { status: 404, message: messages.error.clientNotFound };
  }

  const relationship = await Relationship.findById(relationshipId);
  if (!relationship) {
    throw { status: 404, message: messages.error.relationshipNotFound };
  }

  let createdSession;
  try {
    const session = {
      client: clientId,
      user: relationship.user,
      date,
      startTime,
      endTime,
      paymentStatus: "pending",
      billingInformation: {},
      relationship: relationshipId,
    };

    createdSession = await Session.create(session);
    relationship.sessions.push(createdSession._id);
    await relationship.save();
  } catch (error) {
    throw { status: 500, message: messages.error.sessionCreationError };
  }

  try {
    const user = await User.findById(relationship.user);
    const cost = user.sessionCost;

    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const paymentMethods = await stripe.paymentMethods.list({
      customer: client.stripeCustomerId,
      type: "card",
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
      throw { status: 402, message: messages.error.paymentFailed };
    }

    createdSession.paymentIntentId = paymentIntent.id;
    createdSession.paymentStatus = "paid";
    createdSession.billingInformation = paymentIntent;
    await createdSession.save();

    client.status = "onboarded";
    await client.save();
    
    return client.toObject();
  } catch (error) {
    if (error.raw?.payment_intent?.id) {
      try {
        const stripe = new Stripe(env.STRIPE_SECRET_KEY);
        await stripe.paymentIntents.retrieve(error.raw.payment_intent.id);
      } catch (retrieveError) {
        // Ignore retrieve error
      }
    }
    throw { status: 402, message: messages.error.paymentFailed };
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
      message: messages.success.sessionCreated,
      client: sanitizeUserAndAppendType(client, "client"),
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      message: error.message || messages.error.generalError 
    });
  }
};

export default bookSessionHandler;
