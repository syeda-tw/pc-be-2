import Client from "../../../../common/models/Client.js";
import Stripe from "stripe";
import { env } from "../../../../common/config/env.js";
import { sanitizeUserAndAppendType } from "../../../common/utils.js";
const stripe = new Stripe(env.STRIPE_SECRET_KEY);

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

const verifyPaymentMethodAndUpdateClient = async (setupIntentId, clientId) => {
  try {
    const client = await Client.findById(clientId);
    if (!client) {
      console.error(messages.error.userNotFound);
      throw new Error(messages.error.userNotFound);
    }
    const expectedCustomerId = client.stripeCustomerId;

    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

    if (setupIntent.customer !== expectedCustomerId) {
      console.error(messages.error.stripeCustomerIdMismatch);
      throw new Error(messages.error.stripeCustomerIdMismatch);
    }

    if (setupIntent.status !== "succeeded") {
      console.error(messages.error.setupIntentFailed);
      throw new Error(messages.error.setupIntentFailed);
    }

    const paymentMethodId = setupIntent.payment_method;
    client.stripePaymentMethodId = paymentMethodId;

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    client.defaultPaymentMethod = paymentMethod;
    client.status = "onboarding-step-3";
    await client.save();

    return client.toObject();
  } catch (error) {
    console.error("Error in verifyPaymentMethod:", error);
    throw error;
  }
};

const onboardingStep2Handler = async (req, res) => {
  try {
    const id = req.id;
    const client = await verifyPaymentMethodAndUpdateClient(
      req.body.setupIntentId,
      id
    );
    res.status(200).send({
      message: messages.success.onboardingStep2,
      client: sanitizeUserAndAppendType(client, "client"),
    });
  } catch (error) {
    console.error("Error in onboardingStep2Handler:", error);
    res.status(500).send({
      message: messages.error.internalServerError,
      error: error.message,
    });
  }
};

export default onboardingStep2Handler;
