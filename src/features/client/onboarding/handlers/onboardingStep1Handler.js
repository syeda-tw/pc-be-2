import Stripe from "stripe";
import Client from "../../../../common/models/Client.js";
import { sanitizeUserAndAppendType } from "../../../common/utils.js";
import { env } from "../../../../common/config/env.js";

const messages = {
    success: "Your information has been updated successfully!",
    error: {
        clientNotFound: "We couldn't find your account. Please check your details and try again.",
        emailExists: "This email is already registered with another account. Please use a different email address.",
        updateFailed: "We encountered an issue while updating your information. Please try again.",
        stripeCreateFailed: "We're having trouble setting up your payment information. Please try again later."
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
    const { firstName, lastName, middleName, pronouns, gender, email, dateOfBirth } = clientData;

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
    client.firstName = firstName;
    client.lastName = lastName;
    client.middleName = middleName;
    client.pronouns = pronouns;
    client.gender = gender;
    client.email = email;
    client.dateOfBirth = dateOfBirth;
    client.status = "onboarding-step-2";
    client.stripeCustomerId = stripeCustomerId;
    await client.save();

    return client.toObject();
};

const onboardingStep1Handler = async (req, res) => {
    try {
        const id = req.id;
    const updatedClient = await updateClientInformation(req.body, id);
    res
      .status(200)
      .json({
        message: messages.success,
        data: sanitizeUserAndAppendType(updatedClient, "client"),
      });
  } catch (error) {
    console.error("Error in onboardingStep1Handler:", error);
    const errorMessage = error.message || messages.error.updateFailed;
    res.status(500).json({ message: errorMessage });
  }
};

export default onboardingStep1Handler;
