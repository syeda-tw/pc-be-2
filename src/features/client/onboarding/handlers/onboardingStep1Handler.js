import Stripe from "stripe";
import Client from "../../../../common/models/client.js";
import { sanitizeClient } from "../../utils.js";
import { env } from "../../../../common/config/env.js";

const messages = {
    success: "Client information updated successfully",
    error: {
        clientNotFound: "Client not found",
        emailExists: "Email already exists",
        updateFailed: "Failed to update client information",
        stripeCreateFailed: "Failed to create Stripe customer"
    }
};

const createClientStripeCustomer = async (email) => {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    try {
        const customer = await stripe.customers.create({ email });
        return customer.id;
    } catch (error) {
        console.error("Error in createClientStripeCustomer:", error);
        throw new Error(messages.error.stripeCreateFailed);
    }
};

const updateClientInformation = async (clientData, _id) => {
    const { first_name, last_name, middle_name, pronouns, gender, email, date_of_birth } = clientData;

    // Find the client by ID
    const client = await Client.findById(_id);
    if (!client) {
        throw new Error(messages.error.clientNotFound);
    }

    // Check if the email is unique
    const emailExists = await Client.findOne({ email, _id: { $ne: _id } });
    if (emailExists) {
        throw new Error(messages.error.emailExists);
    }

    // Create Stripe customer
    const stripeCustomerId = await createClientStripeCustomer(email);

    // Update client information
    client.first_name = first_name;
    client.last_name = last_name;
    client.middle_name = middle_name;
    client.pronouns = pronouns;
    client.gender = gender;
    client.email = email;
    client.date_of_birth = date_of_birth;
    client.status = "onboarding-step-2";
    client.stripe_customer_id = stripeCustomerId;
    await client.save();

    return sanitizeClient(client);
};

const onboardingStep1Handler = async (req, res) => {
    try {
        const { _id } = req.body.decodedToken;
        const updatedClient = await updateClientInformation(req.body, _id);
        res.status(200).json({ message: messages.success, data: updatedClient });
    } catch (error) {
        console.error("Error in onboardingStep1Handler:", error);
        const errorMessage = error.message || messages.error.updateFailed;
        res.status(500).json({ message: errorMessage });
    }
};

export default onboardingStep1Handler;
