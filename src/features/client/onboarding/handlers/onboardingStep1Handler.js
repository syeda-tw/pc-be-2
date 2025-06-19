import Stripe from "stripe";
import Client from "../../../../common/models/Client.js";
import User from "../../../../common/models/User.js";
import { sanitizeUserAndAppendType } from "../../../common/utils.js";
import { env } from "../../../../common/config/env.js";
import Relationship, { relationshipTimelineEntries } from '../../../../common/models/Relationship.js';

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
        throw {
            status: 500,
            message: messages.error.stripeCreateFailed
        };
    }
};

const updateClientInformation = async (clientData, _id) => {
    const { firstName, lastName, middleName, pronouns, gender, email, dateOfBirth } = clientData;

    const client = await Client.findById(_id);
    if (!client) {
        throw {
            status: 404,
            message: messages.error.clientNotFound
        };
    }

    const [existingClient, existingUser] = await Promise.all([
        Client.findOne({ email, _id: { $ne: _id } }),
        User.findOne({ email })
    ]);

    if (existingClient || existingUser) {
        throw {
            status: 400,
            message: messages.error.emailExists
        };
    }

    const stripeCustomerId = await createClientStripeCustomer(email);

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

    // Update all relationships for this client with step 1 completion
    const relationships = await Relationship.find({ client: _id });
    if (relationships.length > 0) {
        await Promise.all(relationships.map(async (relationship) => {
            relationship.timeline.push({ event: relationshipTimelineEntries.clientSubmittedStep1() });
            await relationship.save();
        }));
    }

    return client.toObject();
};

const onboardingStep1Handler = async (req, res) => {
    try {
        const id = req.id;
        const updatedClient = await updateClientInformation(req.body, id);
        res.status(200).json({
            message: messages.success,
            data: sanitizeUserAndAppendType(updatedClient, "client"),
        });
    } catch (error) {
        const status = error.status || 500;
        const message = error.message || messages.error.updateFailed;
        res.status(status).json({ message });
    }
};

export default onboardingStep1Handler;
