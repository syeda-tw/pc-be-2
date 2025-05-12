import Client from "../../../../common/models/Client.js";
import Stripe from "stripe";
import { env } from "../../../../common/config/env.js";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

const messages = {
    success: {
        onboardingStep2: "Successfully updated client",
    },
    error: {
        userNotFound: "User not found",
        stripeError: "Error with Stripe operation",
        internalServerError: "Internal server error",
        setupIntentFailed: "SetupIntent not successful",
        stripeCustomerIdMismatch: "Stripe customer ID mismatch",
        paymentMethodNotAdded: "Payment method not added"
    }
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

        return true;
    } catch (error) {
        console.error("Error in verifyPaymentMethod:", error);
        throw error;
    }
}

const onboardingStep2Handler = async (req, res) => {
    try {
        const id = req.id;
        const client = await verifyPaymentMethodAndUpdateClient(req.body.setupIntentId, id);
        res.status(200).send({
            message: messages.success.onboardingStep2,
            client: client
        });
    } catch (error) {
        console.error("Error in onboardingStep2Handler:", error);
        res.status(500).send({
            message: messages.error.internalServerError,
            error: error.message
        });
    }
}

export default onboardingStep2Handler;