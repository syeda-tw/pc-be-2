import Client from "../../../../common/models/Client.js";

const messages = {
    success: {
        onboardingStep3: "Onboarding Step 3 Handler",
    },
    error: {
        atLeastOneUserMustBeAccepted: "At least one user must be accepted to complete onboarding"
    }
};

const updateClient = async (clientId, data) => {
    const client = await Client.findById(clientId);
    let hasAcceptedUser = false;

    client.users.forEach(user => {
        if (data.includes(user.user.toString())) {
            user.status = 'accepted';
            hasAcceptedUser = true;
        }
    });

    if (hasAcceptedUser) {
        client.status = 'onboarded';
    } else {
        throw new Error(messages.error.atLeastOneUserMustBeAccepted);
    }
    await client.save();
    return client;
}

const onboardingStep3Handler = async (req, res) => {
    const { decodedToken, data } = req.body;
    const client = await updateClient(decodedToken._id, data);
    res.status(200).send({
        message: messages.success.onboardingStep3,
        client: client
    });
};

export default onboardingStep3Handler;
