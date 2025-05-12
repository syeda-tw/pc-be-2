//creare a stripe customer

import Stripe from "stripe";
import Client from "../../../../common/models/Client.js";
import { env } from "../../../../common/config/env.js";
const messages = {
    error: {
        userNotFound: "User not found",
        stripeError: "Error with Stripe operation",
        internalServerError: "Internal server error",
        stripeCreateFailed: "Failed to create Stripe customer"
    }
};

const createStripeCustomer = async (email) => {
    try {
        const stripe = new Stripe(env.STRIPE_SECRET_KEY);
        const customer = await stripe.customers.create({ email });
        return customer;
    } catch (error) {
        console.error("Error in createStripeCustomer:", error);
        throw new Error(messages.error.stripeError);
    }
}

//creare setup intent
const createSetupIntent = async (userId) => {
    try {
        const stripe = new Stripe(env.STRIPE_SECRET_KEY);
        const user = await Client.findById(userId);
        if (!user) {
            throw new Error(messages.error.userNotFound);
        }
        if (!user.stripeCustomerId) {
            const customer = await createStripeCustomer(user.email);
            user.stripeCustomerId = customer.id;
        }
        try {
            const setupIntent = await stripe.setupIntents.create({
                customer: user.stripeCustomerId,
                paymentMethodTypes: ['card'],
                description: `Setup intent for ${user._id}`,
            });

            return { setupIntentId: setupIntent.id, clientSecret: setupIntent.clientSecret, customerId: user.stripeCustomerId };
        } catch (error) {
            console.error("Error creating setup intent:", error);
            throw new Error(messages.error.stripeError);
        }

    } catch (error) {
        console.error("Error in createSetupIntent:", error);
        throw new Error(messages.error.stripeError);
    }
}

export default async (req, res) => {
    try {
        const { setupIntentId, clientSecret, customerId } = await createSetupIntent(req.id);
        res.json({ setupIntentId, clientSecret, customerId });
    } catch (error) {
        console.error("Error in getSetupIntent:", error);
        res.status(500).json({ message: error.message || messages.error.internalServerError });
    }
}
