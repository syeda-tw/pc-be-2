import Client from "../../../../common/models/Client.js";
import Relationship from "../../../../common/models/Relationship.js";
import Stripe from "stripe";
import { env } from "../../../../common/config/env.js";
import { sanitizeUserAndAppendType } from '../../../common/utils.js';

const messages = {
  notFound: "Relationship not found",
  appointmentCreated: "Appointment created",
  appointmentCharged: "Appointment charged",
  appointmentUpdated: "Appointment updated",
  clientUpdated: "Client updated",
  relationshipUpdated: "Relationship updated",
};

const bookFirstAppointmentService = async (
  clientId,
  relationshipId,
  startTime,
  endTime,
  cost
) => {
  console.log("🔵 [Flow] Starting bookFirstAppointmentService");
  console.log("📝 [Input] Service parameters:", {
    clientId,
    relationshipId,
    startTime,
    endTime,
    cost,
  });

  console.log("🔵 [Flow] Step 1: Finding client");
  const client = await Client.findById(clientId);
  console.log("📝 [Result] Client found:", client ? "Yes" : "No");

  console.log("🔵 [Flow] Step 2: Finding relationship");
  const relationship = await Relationship.findById(relationshipId);
  console.log("📝 [Result] Relationship found:", relationship ? "Yes" : "No");

  if (!relationship) {
    console.log("❌ [Error] Relationship not found");
    throw {
      status: 404,
      message: messages.notFound,
    };
  }

  console.log("🔵 [Flow] Step 3: Creating appointment object");
  const appointment = {
    startTime: startTime,
    endTime: endTime,
    invoiceId: null,
    paymentStatus: "pending",
  };
  console.log("📝 [Result] Created appointment:", appointment);

  console.log("🔵 [Flow] Step 4: Saving appointment to relationship");
  relationship.appointments.push(appointment);
  await relationship.save();
  console.log("✅ [Success] Appointment saved to relationship");

  console.log("🔵 [Flow] Step 5: Initializing Stripe");
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  console.log("✅ [Success] Stripe client initialized");

  console.log("🔵 [Flow] Step 6: Retrieving payment methods");
  const paymentMethods = await stripe.paymentMethods.list({
    customer: client.stripeCustomerId,
    type: "card",
  });
  console.log("📝 [Result] Found payment methods:", paymentMethods.data.length);

  try {
    console.log("🔵 [Flow] Step 7: Creating payment intent");
    const paymentIntent = await stripe.paymentIntents.create({
      amount: cost * 100,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      customer: client.stripeCustomerId,
      payment_method: paymentMethods.data[0].id,
      off_session: true,
      confirm: true,
    });

    if (paymentIntent.status !== "succeeded") {
      console.log("❌ [Error] Payment did not succeed. Status:", paymentIntent.status);
      throw {
        status: 402,
        message: messages.paymentFailed,
      };
    }

    console.log("✅ [Success] Payment intent created:", paymentIntent.id);

    console.log("🔵 [Flow] Step 8: Updating relationship with payment info");
    relationship.appointments[0].paymentIntentId = paymentIntent.id;
    relationship.appointments[0].paymentStatus = "paid";
    relationship.isOnboardingComplete = true;
    await relationship.save();
    console.log("✅ [Success] Relationship updated with payment info");

    console.log("🔵 [Flow] Step 9: Updating client status");
    client.status = "onboarded";
    await client.save();
    console.log("✅ [Success] Client status updated to onboarded");

    console.log("✅ [Success] Service completed successfully");
    return client.toObject();
  } catch (err) {
    console.error("❌ [Error] Payment intent creation failed:", err.message);
    console.error("📝 [Details] Stripe error code:", err.code);

    if (err.raw && err.raw.payment_intent && err.raw.payment_intent.id) {
      console.log("🔵 [Flow] Retrieving failed payment intent details");
      const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(
        err.raw.payment_intent.id
      );
      console.log("📝 [Result] Retrieved payment intent:", paymentIntentRetrieved.id);
    }

    throw {
      status: 402,
      message: "Payment failed. Please try again or use a different card.",
    };
  }
};

const bookFirstAppointmentHandler = async (req, res) => {
  console.log("🔵 [Flow] Starting bookFirstAppointmentHandler");
  console.log("📝 [Input] Request body:", req.body);
  
  try {
    const client = await bookFirstAppointmentService(
      req.id,
      req.body.relationshipId,
      req.body.startTime,
      req.body.endTime,
      req.body.cost
    );
    console.log("✅ [Success] Service completed, sending response");
    res.status(200).json({
      message: messages.appointmentCreated,
      client: sanitizeUserAndAppendType(client, "client"),
    });
  } catch (err) {
    console.log("❌ [Error] Handler error:", err.message);
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
      error: err.details || null,
    });
  }
};

export default bookFirstAppointmentHandler;
