import Client from "../../../../common/models/client.js";
import Stripe from "stripe";

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const messages = {
    success: "Onboarding Step 2 completed successfully",
    error: {
        clientNotFound: "Client not found",
        internalServerError: "Internal server error"
    }
};

const updateClientWithStripe = async (client, paymentMethod) => {
    const customer = await stripe.customers.create({
        email: client.email,
        description: `Customer for user ${client._id}`,
    });
        // Step 1: Attach the payment method to the customer
        await stripe.paymentMethods.attach(paymentMethod, {
            customer: customer.id,  // Attach to the existing Stripe customer
          });
      
          // Step 2: Set this payment method as the default for future invoices (optional)
          await stripe.customers.update(customer.id, {
            invoice_settings: {
              default_payment_method: paymentMethod,  // Set the payment method as default
            },
          });
      
          // Optionally: Store the payment method ID in your database (for future reference)
          client.defaultPaymentMethod = paymentMethod;
          await client.save();
          
    client.stripeCustomerId = customer.id;
    client.status = "onboarding-step-3";
    await client.save();
    return client;
};

const onboardingStep2Handler = async (req, res) => {
    const { _id } = req.decoded; // Assuming req.decoded contains the decoded token with _id
    const { paymentMethod } = req.body;

    try {
        const client = await Client.findById(_id);
        if (!client) {
            return res.status(404).json({ message: messages.error.clientNotFound });
        }

        await updateClientWithStripe(client, paymentMethod);
        res.status(200).json({ message: messages.success });
    } catch (error) {
        console.error("Error in onboardingStep2Handler:", error);
        res.status(500).json({ message: messages.error.internalServerError });
    }

    console.log(`User ID: ${_id}, Payment Method: ${paymentMethod}`);
};

export default onboardingStep2Handler;
