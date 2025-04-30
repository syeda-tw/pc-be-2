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

const updateClient = async (clientId, setup_intent) => {
    try {
        console.log(`Retrieving client with ID: ${clientId}`);
        const client = await Client.findById(clientId);
        if (!client) {
            console.error(messages.error.userNotFound);
            throw new Error(messages.error.userNotFound);
        }

        console.log(`Retrieving setup intent with ID: ${setup_intent}`);
        const setupIntent = await stripe.setupIntents.retrieve(setup_intent);

        if (setupIntent.status !== 'succeeded') {
            console.error(`SetupIntent status: ${setupIntent.status}`);
            throw new Error(messages.error.setupIntentFailed);
        }

        const paymentMethodId = setupIntent.payment_method;
        const customerId = setupIntent.customer;

        if (client.stripe_customer_id !== customerId) {
            console.error(messages.error.stripeCustomerIdMismatch);
            throw new Error(messages.error.stripeCustomerIdMismatch);
        }

        client.defaultPaymentMethod = paymentMethodId;
        client.status = "onboarding-step-3";
        await client.save();
        console.log(`Client updated successfully: ${clientId}`);
        return client;
    } catch (error) {
        console.error("Error in updateClient:", error);
        throw error;
    }
}

const onboardingStep2Handler = async (req, res) => {
    try {
        console.log("Starting onboardingStep2Handler");
        const client = await updateClient(req.body.decodedToken._id, req.body.setup_intent);
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