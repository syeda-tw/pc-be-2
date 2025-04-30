//creare a stripe customer

import Stripe from "stripe";
import Client from "../../../../common/models/client.js";

const messages = {
    error: {
        userNotFound: "User not found",
        stripeError: "Error with Stripe operation",
        internalServerError: "Internal server error"
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
    console.log("userId", userId);
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const user = await Client.findById(userId);
        if (!user) {
            throw new Error(messages.error.userNotFound);
        }

        // Check if the user already has a Stripe customer ID
        if (user.stripe_customer_id) {
            // Check if the user already has a setup intent
            if (user.stripe_setup_intent_id) {
                const existingSetupIntent = await stripe.setupIntents.retrieve(user.stripe_setup_intent_id);
                return existingSetupIntent;
            }
            // Create a new setup intent if it doesn't exist
            const setupIntent = await stripe.setupIntents.create({
                customer: user.stripe_customer_id,
                payment_method_types: ['card'],
                description: `Setup intent for ${user._id}`,
            });
            user.stripe_setup_intent_id = setupIntent.id;
            await user.save();
            return setupIntent;
        }

        // Create a new Stripe customer if it doesn't exist
        const customer = await createStripeCustomer(user.email);
        user.stripe_customer_id = customer.id;
        await user.save();

        // Create a new setup intent
        const setupIntent = await stripe.setupIntents.create({
            customer: customer.id,
            payment_method_types: ['card'],
            description: `Setup intent for ${user._id}`,
        });
        user.stripe_setup_intent_id = setupIntent.id;
        await user.save();
        return setupIntent;
    } catch (error) {
        console.error("Error in createSetupIntent:", error);
        throw new Error(messages.error.stripeError);
    }
}

export default async (req, res) => {
    try {
        const intent = await createSetupIntent(req.body.decodedToken._id);
        res.json({client_secret: intent.client_secret});
    } catch (error) {
        console.error("Error in getSetupIntent:", error);
        res.status(500).json({ message: error.message || messages.error.internalServerError });
    }
}
