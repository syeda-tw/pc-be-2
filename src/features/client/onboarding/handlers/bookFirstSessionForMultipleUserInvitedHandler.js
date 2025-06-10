import Client from "../../../../common/models/Client.js";
import Relationship from "../../../../common/models/Relationship.js";
import Stripe from "stripe";
import { env } from "../../../../common/config/env.js";
import { sanitizeUserAndAppendType } from "../../../common/utils.js";
import Session from "../../../../common/models/Session.js";

const messages = {
  notFound:
    "We couldn't find the relationship you're looking for. Please try again.",
  sessionCreated: "Your sessions have been successfully created!",
  sessionCharged: "Your sessions have been charged successfully.",
  sessionUpdated: "Your sessions have been updated successfully.",
  clientUpdated: "Your client information has been updated successfully.",
  relationshipUpdated:
    "Your relationship status has been updated successfully.",
  paymentFailed:
    "We couldn't process your payment. Please check your card details and try again.",
  generalError: "Something went wrong. Please try again later.",
  clientNotFound: "We couldn't find your client information. Please try again.",
  sessionCreationError: "We couldn't create your sessions. Please try again.",
  relationshipUpdateError:
    "We couldn't update your relationship. Please try again.",
  clientUpdateError: "We couldn't update your client status. Please try again.",
  sessionUpdateError: "We couldn't update your sessions. Please try again.",
  sessionPaymentError:
    "We couldn't process your payment. Please check your card details and try again.",
  noSuccessfulSessions:
    "We couldn't create any successful sessions. Please try again.",
  partialSuccess: "Some sessions were created successfully, but others failed.",
};

const processSingleSession = async (
  clientId,
  relationshipId,
  startTime,
  endTime,
  cost,
  date
) => {
  console.log("Starting processSingleSession with params:", {
    clientId,
    relationshipId,
    startTime,
    endTime,
    cost,
    date,
  });

  let client;
  let relationship;
  let createdSession;
  let stripe;

  try {
    // Step 1: Find client
    console.log("Step 1: Finding client with ID:", clientId);
    client = await Client.findById(clientId);
    if (!client) {
      console.log("Client not found:", clientId);
      throw { status: 404, message: messages.clientNotFound };
    }
    console.log("Client found:", {
      clientId: client._id,
      status: client.status,
    });

    // Step 2: Find relationship
    console.log("Step 2: Finding relationship with ID:", relationshipId);
    relationship = await Relationship.findById(relationshipId);
    if (!relationship) {
      console.log("Relationship not found:", relationshipId);
      throw { status: 404, message: messages.notFound };
    }
    console.log("Relationship found:", {
      relationshipId: relationship._id,
      status: relationship.status,
    });

    // Step 3: Create session object
    console.log("Step 3: Creating session object");
    const session = {
      client: clientId,
      user: relationship.user,
      date: date,
      startTime: startTime,
      endTime: endTime,
      notes: "",
      paymentStatus: "pending",
      billingInformation: {},
      relationship: relationshipId,
    };
    console.log("Session object created:", session);

    try {
      // Step 3a: Save session in DB
      console.log("Step 3a: Saving session to database");
      createdSession = await Session.create(session);
      console.log("Session created successfully:", {
        sessionId: createdSession._id,
        status: createdSession.paymentStatus,
      });

      relationship.sessions.push(createdSession._id);
      await relationship.save();
      console.log("Relationship updated with new session:", {
        relationshipId: relationship._id,
        sessionId: createdSession._id,
        totalSessions: relationship.sessions.length,
      });
    } catch (error) {
      console.error("Error creating session:", {
        error: error.message,
        stack: error.stack,
        session: session,
      });
      throw { status: 500, message: messages.sessionCreationError };
    }

    // Step 4: Handle Stripe payment
    try {
      console.log("Step 4: Initializing Stripe payment process:", {
        clientId,
        cost,
        stripeCustomerId: client.stripeCustomerId,
      });

      stripe = new Stripe(env.STRIPE_SECRET_KEY);
      const paymentMethods = await stripe.paymentMethods.list({
        customer: client.stripeCustomerId,
        type: "card",
      });
      console.log("Payment methods retrieved:", {
        customerId: client.stripeCustomerId,
        paymentMethodsCount: paymentMethods.data.length,
        firstPaymentMethodId: paymentMethods.data[0]?.id,
      });

      console.log("Creating payment intent");
      const paymentIntent = await stripe.paymentIntents.create({
        amount: cost * 100,
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        customer: client.stripeCustomerId,
        payment_method: paymentMethods.data[0].id,
        off_session: true,
        confirm: true,
      });
      console.log("Payment intent created:", {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      });

      if (paymentIntent.status !== "succeeded") {
        console.log("Payment failed:", {
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
        });
        throw { status: 402, message: messages.paymentFailed };
      }

      // Step 5: Update session with payment details
      console.log("Step 5: Updating session with payment details");
      createdSession.paymentIntentId = paymentIntent.id;
      createdSession.paymentStatus = "paid";
      createdSession.billingInformation = paymentIntent;
      await createdSession.save();
      console.log("Session updated successfully with payment info:", {
        sessionId: createdSession._id,
        paymentIntentId: paymentIntent.id,
        status: createdSession.paymentStatus,
      });

      return {
        success: true,
        session: createdSession,
        relationship: relationship,
        client: client,
      };
    } catch (error) {
      console.error("Error processing payment:", {
        error: error.message,
        stack: error.stack,
        clientId,
        relationshipId,
        sessionId: createdSession?._id,
      });

      if (error.status === 402) {
        throw error;
      }
      throw { status: 500, message: messages.sessionPaymentError };
    }
  } catch (error) {
    console.error("Error in processSingleSession:", {
      error: error.message,
      stack: error.stack,
      clientId,
      relationshipId,
      sessionId: createdSession?._id,
    });

    // Clean up created session if payment failed
    if (createdSession && error.status === 402) {
      try {
        console.log("Cleaning up session after payment failure:", {
          sessionId: createdSession._id,
          errorStatus: error.status,
        });
        await Session.findByIdAndDelete(createdSession._id);
        console.log("Session cleaned up successfully");
      } catch (cleanupError) {
        console.error("Error cleaning up session:", {
          error: cleanupError.message,
          stack: cleanupError.stack,
          sessionId: createdSession._id,
        });
      }
    }

    return {
      success: false,
      error: error,
    };
  }
};

const bookFirstSessionForMultipleUserInvitedHandler = async (req, res) => {
  console.log(
    "Starting bookFirstSessionForMultipleUserInvitedHandler with request body:",
    req.body
  );

  const sessions = req.body;
  const results = [];
  let successfulSessions = 0;
  let successfulPayments = 0;

  try {
    // Get all relationships for the client
    const client = await Client.findById(req.id);
    if (!client) {
      throw { status: 404, message: messages.clientNotFound };
    }

    // Get all relationship IDs from the payload
    const payloadRelationshipIds = sessions.map(s => s.relationshipId);

    // Archive relationships that weren't in the payload
    const relationshipsToArchive = await Relationship.find({
      _id: { $in: client.relationships },
      _id: { $nin: payloadRelationshipIds }
    });

    if (relationshipsToArchive.length > 0) {
      await Promise.all(
        relationshipsToArchive.map(relationship => {
          relationship.status = 'archived';
          return relationship.save();
        })
      );
      console.log(`Archived ${relationshipsToArchive.length} relationships that weren't in the payload`);
    }

    console.log("Processing sessions in parallel:", {
      totalSessions: sessions.length,
      sessionDetails: sessions.map((s) => ({
        relationshipId: s.relationshipId,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        cost: s.cost,
      })),
    });

    // Process all sessions in parallel
    const sessionPromises = sessions.map((session) =>
      processSingleSession(
        req.id,
        session.relationshipId,
        session.startTime,
        session.endTime,
        session.cost,
        session.date
      )
    );

    const sessionResults = await Promise.all(sessionPromises);
    console.log("All sessions processed:", {
      totalResults: sessionResults.length,
      successfulCount: sessionResults.filter((r) => r.success).length,
    });

    // Process results
    sessionResults.forEach((result, index) => {
      if (result.success) {
        successfulSessions++;
        successfulPayments++;
        results.push({
          sessionId: result.session._id,
          relationshipId: result.relationship._id,
          status: "success",
        });
      } else {
        results.push({
          sessionIndex: index,
          status: "failed",
          error: result.error.message,
        });
      }
    });
    console.log("Results processed:", {
      successfulSessions,
      successfulPayments,
      totalResults: results.length,
    });

    // 🚨 IMPORTANT: Only onboard client if payment + session booked
    if (successfulSessions === 0 || successfulPayments === 0) {
      console.log("No successful sessions or payments:", {
        successfulSessions,
        successfulPayments,
      });
      return res.status(400).json({
        message: messages.noSuccessfulSessions,
        results: results,
      });
    }

    // ✅ Update client status to onboarded
    if (client) {
      client.status = "onboarded";
      await client.save();
    }

    // ✅ Update relationship status for each successful session
    for (const result of sessionResults) {
      if (result.success) {
        const relationship = await Relationship.findById(
          result.relationship._id
        );
        if (relationship) {
          relationship.status = "active";
          await relationship.save();
        }
      }
    }

    // Return response to client
    const response = {
      message:
        successfulSessions === sessions.length
          ? messages.sessionCreated
          : messages.partialSuccess,
      results: results,
      client: client ? sanitizeUserAndAppendType(client, "client") : null,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Error in bookFirstSessionForMultipleUserInvitedHandler:", {
      error: err.message,
      stack: err.stack,
      status: err.status,
      details: err.details,
    });

    res.status(err.status || 500).json({
      message: err.message || messages.generalError,
      error: err.details || null,
      results: results,
    });
  }
};

export default bookFirstSessionForMultipleUserInvitedHandler;
