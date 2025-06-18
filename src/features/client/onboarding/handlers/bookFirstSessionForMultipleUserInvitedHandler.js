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
  let client;
  let relationship;
  let createdSession;
  let stripe;

  try {
    // Step 1: Find client
    client = await Client.findById(clientId);
    if (!client) {
      throw { status: 404, message: messages.clientNotFound };
    }

    // Step 2: Find relationship
    relationship = await Relationship.findById(relationshipId);
    if (!relationship) {
      throw { status: 404, message: messages.notFound };
    }

    // Step 3: Create session object
    const session = {
      client: clientId,
      user: relationship.user,
      date: date,
      startTime: startTime,
      endTime: endTime,
      paymentStatus: "pending",
      billingInformation: {},
      relationship: relationshipId,
    };

    try {
      // Step 3a: Save session in DB
      createdSession = await Session.create(session);

      relationship.sessions.push(createdSession._id);
      await relationship.save();
    } catch (error) {
      throw { status: 500, message: messages.sessionCreationError };
    }

    // Step 4: Handle Stripe payment
    try {
      stripe = new Stripe(env.STRIPE_SECRET_KEY);
      const paymentMethods = await stripe.paymentMethods.list({
        customer: client.stripeCustomerId,
        type: "card",
      });

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
        throw { status: 402, message: messages.paymentFailed };
      }

      // Step 5: Update session with payment details
      createdSession.paymentIntentId = paymentIntent.id;
      createdSession.paymentStatus = "paid";
      createdSession.billingInformation = paymentIntent;
      await createdSession.save();

      return {
        success: true,
        session: createdSession,
        relationship: relationship,
        client: client,
      };
    } catch (error) {
      if (error.status === 402) {
        throw { status: 402, message: messages.sessionPaymentError };
      }
      throw { status: 500, message: messages.sessionPaymentError };
    }
  } catch (error) {
    // Clean up created session if payment failed
    if (createdSession && error.status === 402) {
      try {
        await Session.findByIdAndDelete(createdSession._id);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }

    return {
      success: false,
      error: error,
    };
  }
};

const bookFirstSessionForMultipleUserInvitedHandler = async (req, res) => {
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

    // Get all relationship IDs from the payload (ensure they're ObjectIds)
    const payloadRelationshipIds = sessions.map(s => s.relationshipId);

    // Archive relationships that weren't in the payload
    const relationshipsToArchive = await Relationship.find({
      $and: [
        { _id: { $in: client.relationships } },
        { _id: { $nin: payloadRelationshipIds } }
      ]
    });

    if (relationshipsToArchive.length > 0) {
      await Promise.all(
        relationshipsToArchive.map(relationship => {
          relationship.status = 'archived';
          return relationship.save();
        })
      );
    }

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

    // Only onboard client if payment + session booked
    if (successfulSessions === 0 || successfulPayments === 0) {
      return res.status(400).json({
        message: messages.noSuccessfulSessions,
        results: results,
      });
    }

    // Update client status to onboarded
    if (client) {
      client.status = "onboarded";
      await client.save();
    }

    // Update relationship status for each successful session
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

    // Set default relationship to the first active relationship
    const activeRelationships = await Relationship.find({
      _id: { $in: client.relationships },
      status: "active"
    });
    
    if (activeRelationships.length > 0) {
      const firstActiveRelationship = activeRelationships[0];
      client.defaultRelationship = firstActiveRelationship._id;
      await client.save();
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
    res.status(err.status || 500).json({
      message: err.message || messages.generalError,
      error: err.details || null,
      results: results,
    });
  }
};

export default bookFirstSessionForMultipleUserInvitedHandler;
