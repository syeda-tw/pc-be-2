import Client from "../../../../common/models/client.js";

const messages = {
    success: {
        onboardingStep2: "Successfully updated client",
    },
    error: {
        userNotFound: "User not found",
        stripeError: "Error with Stripe operation",
        internalServerError: "Internal server error",
        setupIntentFailed: "SetupIntent not successful",
        stripeCustomerIdMismatch: "Stripe customer ID mismatch"
    }
};

const updateClient = async (clientId, paymentMethodId) => {
    try {
        console.log(`Retrieving client with ID: ${clientId}`);
        const client = await Client.findById(clientId);
        if (!client) {
            console.error(messages.error.userNotFound);
            throw new Error(messages.error.userNotFound);
        }
        client.stripe_payment_method_id = paymentMethodId;
        client.status = "onboarding-step-3";
        await client.save();
        console.log(`Client updated successfully: ${clientId}`);
        return client;
    } catch (error) {
        console.error("Error in updateClient:", error);
        throw error;
    }
}

const verifyPaymentMethod = async (setupIntent, customerId, paymentMethodId) => {
    try {
        console.log(`Verifying setup intent with ID: ${setupIntent}`);
        const intent = await stripe.setupIntents.retrieve(setupIntent);

        if (intent.status !== 'succeeded') {
            console.error(`SetupIntent status: ${intent.status}`);
            throw new Error(messages.error.setupIntentFailed);
        }

        if (intent.customer !== customerId) {
            console.error(messages.error.stripeCustomerIdMismatch);
            throw new Error(messages.error.stripeCustomerIdMismatch);
        }

        if (intent.payment_method !== paymentMethodId) {
            console.error("Payment method ID mismatch");
            throw new Error("Payment method ID mismatch");
        }
        console.log("Setup intent verification successful");
        return true;
    } catch (error) {
        console.error("Error in verifyPaymentMethod:", error);
        throw error;
    }
}

const onboardingStep2Handler = async (req, res) => {
    try {
        const { decodedToken, setupIntent, customerId, paymentMethodId } = req.body;
        const paymentMethodAddedSuccessfully = await verifyPaymentMethod(setupIntent, customerId, paymentMethodId);
        if (!paymentMethodAddedSuccessfully) {
            throw new Error(messages.error.paymentMethodNotAdded);
        }
        const client = await updateClient(decodedToken._id, paymentMethodId);
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