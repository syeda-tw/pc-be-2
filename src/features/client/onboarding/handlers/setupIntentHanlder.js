//creare a stripe customer

import Stripe from "stripe";
import Client from "../../../../common/models/client.js";

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
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const user = await Client.findById(userId);
        if (!user) {
            throw new Error(messages.error.userNotFound);
        }
        if (!user.stripe_customer_id) {
            const customer = await createStripeCustomer(user.email);
            user.stripe_customer_id = customer.id;
        }
        try {
            const setupIntent = await stripe.setupIntents.create({
                customer: user.stripe_customer_id,
                payment_method_types: ['card'],
                description: `Setup intent for ${user._id}`,
            });

            return { setup_intent_id: setupIntent.id, client_secret: setupIntent.client_secret, customer_id: user.stripe_customer_id };
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
        const { setup_intent_id, client_secret, customer_id } = await createSetupIntent(req.body.decodedToken._id);
        res.json({ setup_intent_id, client_secret, customer_id });
    } catch (error) {
        console.error("Error in getSetupIntent:", error);
        res.status(500).json({ message: error.message || messages.error.internalServerError });
    }
}
