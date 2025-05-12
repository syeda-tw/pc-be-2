import Client from "../../../../common/models/Client.js";
import User from "../../../../common/models/User.js"; // Added import for User model
import { sanitizeUserAndAppendType } from "../../../common/utils.js"; // Assuming this is the correct path

const messages = {
    success: {
        onboardingStep3: "Successfully accepted users and completed onboarding step 3",
    },
    error: {
        atLeastOneUserMustBeAccepted: "At least one user must be accepted to complete onboarding",
        clientNotFound: "Client not found",
        userNotFoundDuringUpdate: "One or more users not found during update",
        updateError: "Error updating client or users",
        internalServerError: "Internal server error",
    }
};


const updateClientAndUsers = async (clientId, userIdsToAccept) => {
    console.log(`[updateClientAndUsers] Starting for client ID: ${clientId} with user IDs to accept:`, userIdsToAccept);

    const client = await Client.findById(clientId);
    if (!client) {
        console.error(`[updateClientAndUsers] Client not found with ID: ${clientId}`);
        throw { status: 404, message: messages.error.clientNotFound };
    }
    console.log(`[updateClientAndUsers] Found client: ${client._id}, current status: ${client.status}`);

    let hasAcceptedUser = false;

    // Update statuses on the Client document's users array
    console.log(`[updateClientAndUsers] Updating user statuses on client document ${clientId}...`);
    client.users.forEach(userObj => {
        // Ensure userObj.user exists and has toString method
        const userObjId = userObj.user?.toString();
        if (userObjId && userIdsToAccept.includes(userObjId)) {
            console.log(`[updateClientAndUsers] Marking user ${userObjId} as 'accepted' on client ${clientId}`);
            userObj.status = 'accepted';
            hasAcceptedUser = true;
        }
    });

    if (!hasAcceptedUser) {
        console.warn(`[updateClientAndUsers] No users from the provided list [${userIdsToAccept.join(', ')}] were found or matched in client ${clientId}'s users array. Throwing error.`);
        throw {
            status: 400,
            message: messages.error.atLeastOneUserMustBeAccepted,
        };
    }

    console.log(`[updateClientAndUsers] Setting client ${clientId} status to 'onboarded'.`);
    client.status = 'onboarded';

    console.log(`[updateClientAndUsers] Saving client ${clientId}...`);
    await client.save();
    console.log(`[updateClientAndUsers] Client ${clientId} saved successfully.`);

    // Update statuses on the corresponding User documents
    console.log(`[updateClientAndUsers] Updating corresponding User documents for accepted users: [${userIdsToAccept.join(', ')}]...`);
    const userUpdatePromises = userIdsToAccept.map(async userId => {
        try {
            console.log(`[updateClientAndUsers] Finding user ${userId}...`);
            const user = await User.findById(userId);
            if (!user) {
                console.warn(`[updateClientAndUsers] User ${userId} not found during update. Skipping.`);
                // Depending on requirements, you might want to collect these errors
                // or throw an aggregate error later. For now, just logging.
                return; // Skip if user not found
            }
            console.log(`[updateClientAndUsers] Found user ${userId}. Updating client status within user's clients array.`);
            let clientRefUpdated = false;
            user.clients.forEach(clientRef => {
                // Ensure clientRef.client exists and has toString method
                const clientRefId = clientRef.client?.toString();
                if (clientRefId === clientId) {
                    console.log(`[updateClientAndUsers] Setting status to 'accepted' for client ${clientId} on user ${userId}`);
                    clientRef.status = 'accepted';
                    clientRefUpdated = true;
                }
            });

            if (clientRefUpdated) {
                console.log(`[updateClientAndUsers] Saving user ${userId}...`);
                await user.save();
                console.log(`[updateClientAndUsers] User ${userId} saved successfully.`);
            } else {
                 console.warn(`[updateClientAndUsers] Client reference ${clientId} not found or already updated in user ${userId}'s clients array.`);
            }
        } catch (userUpdateError) {
            console.error(`[updateClientAndUsers] Error updating user ${userId}:`, userUpdateError);
            // Propagate the error to be caught by Promise.all
            throw new Error(`Failed to update user ${userId}: ${userUpdateError.message}`);
        }
    });

    try {
        await Promise.all(userUpdatePromises);
        console.log(`[updateClientAndUsers] Finished updating all specified User documents successfully.`);
    } catch (error) {
        console.error(`[updateClientAndUsers] Error during Promise.all execution for user updates:`, error);
        // Decide on error handling: re-throw, log, or potentially revert client status?
        // For now, re-throwing a generic error.
        throw { status: 500, message: messages.error.updateError, cause: error };
    }

    console.log(`[updateClientAndUsers] Returning updated client object for client ${clientId}.`);
    return client.toObject(); // Return the updated client object
}


const onboardingStep3Handler = async (req, res) => {
    const clientId = req.id; // Assuming req.id holds the client's ID
    const { userIds } = req.body; // Expecting an array of user IDs to accept

    console.log(`[onboardingStep3Handler] Received request for client ID: ${clientId}`);
    console.log(`[onboardingStep3Handler] User IDs to accept:`, userIds);

    if (!clientId) {
         console.error("[onboardingStep3Handler] Client ID not found in request.");
         return res.status(400).send({ message: "Client ID missing from request." });
    }
    if (!Array.isArray(userIds) || userIds.length === 0) {
        console.error("[onboardingStep3Handler] Invalid or empty 'userIds' array in request body.");
        return res.status(400).send({ message: "Request body must contain a non-empty 'userIds' array." });
    }

    try {
        console.log(`[onboardingStep3Handler] Calling updateClientAndUsers for client ${clientId}...`);
        const updatedClient = await updateClientAndUsers(clientId, userIds);
        console.log(`[onboardingStep3Handler] updateClientAndUsers completed successfully for client ${clientId}.`);

        console.log(`[onboardingStep3Handler] Sanitizing client data before sending response...`);
        const sanitizedClient = sanitizeUserAndAppendType(updatedClient, 'client');

        console.log(`[onboardingStep3Handler] Sending success response for client ${clientId}.`);
        res.status(200).send({
            message: messages.success.onboardingStep3,
            client: sanitizedClient
        });
    } catch (error) {
      console.error(`[onboardingStep3Handler] Error processing request for client ${clientId}:`, error);
      // Use the status from the thrown error if available, otherwise default to 500
      const statusCode = error.status || 500;
      const errorMessage = error.message || messages.error.internalServerError;
      res.status(statusCode).send({
          message: errorMessage,
          // Optionally include error details in non-production environments
          // error: process.env.NODE_ENV !== 'production' ? error : undefined
      });
    }
};

export default onboardingStep3Handler;
