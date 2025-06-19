import Client from "../../../../common/models/Client.js";
import Relationship, { relationshipTimelineEntries } from "../../../../common/models/Relationship.js";
import Stripe from "stripe";
import { env } from "../../../../common/config/env.js";
import { sanitizeUserAndAppendType } from "../../../common/utils.js";

const messages = {
  success: {
    onboardingStep2: "Successfully updated client",
  },
  error: {
    userNotFound: "We couldn't find your account. Please try logging in again.",
    stripeError: "There was an issue processing your payment. Please try again.",
    internalServerError: "Something went wrong. Please try again later.",
    setupIntentFailed: "We couldn't set up your payment method. Please try again.",
    stripeCustomerIdMismatch: "There was a mismatch in your payment information. Please try again.",
    paymentMethodNotAdded: "We couldn't add your payment method. Please try again.",
  },
};

const onboardingStep2Service = async (setupIntentId, clientId) => {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  
  const client = await Client.findById(clientId);
  if (!client) {
    throw { status: 404, message: messages.error.userNotFound };
  }
  
  const expectedCustomerId = client.stripeCustomerId;
  const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

  if (setupIntent.customer !== expectedCustomerId) {
    throw { status: 400, message: messages.error.stripeCustomerIdMismatch };
  }

  if (setupIntent.status !== "succeeded") {
    throw { status: 400, message: messages.error.setupIntentFailed };
  }

  const paymentMethodId = setupIntent.payment_method;
  client.stripePaymentMethodId = paymentMethodId;

  const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
  client.defaultPaymentMethod = paymentMethod;
  client.status = "onboarding-step-3";
  await client.save();

  // Update all relationships for this client with step 2 completion
  const relationships = await Relationship.find({ client: clientId });
  if (relationships.length > 0) {
    await Promise.all(relationships.map(async (relationship) => {
      relationship.timeline.push({ event: relationshipTimelineEntries.clientSubmittedStep2() });
      await relationship.save();
    }));
  }

  return client.toObject();
};

const onboardingStep2Handler = async (req, res) => {
  try {
    const client = await onboardingStep2Service(req.body.setupIntentId, req.id);
    res.status(200).json({
      message: messages.success.onboardingStep2,
      client: sanitizeUserAndAppendType(client, "client"),
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      message: error.message || messages.error.internalServerError 
    });
  }
};

export default onboardingStep2Handler;
