import InvitedClient from "../../../../common/models/InvitedClient.js";

const messages = {
  numberNotRegistered:
    "We couldn't find an invitation for this phone number. Please check the number and try again.",
  error: "Something went wrong. Please try again.",
  success:
    "We've sent a one-time password to your phone number which will expire in 5 minutes.",
};

const createOneTimePassword = async () => {
  const oneTimePassword = Math.floor(10000 + Math.random() * 90000);
  return oneTimePassword;
};

const registerStep1Service = async (phone) => {
  const invitedClient = await InvitedClient.findOne({ phone });
  if (!invitedClient) {
    throw {
      status: 400,
      message: messages.numberNotRegistered,
    };
  }

  const oneTimePassword = await createOneTimePassword();
  invitedClient.oneTimePassword = oneTimePassword;
  invitedClient.oneTimePasswordExpiresAt = new Date(Date.now() + 1000 * 60 * 5);
  await invitedClient.save();
  console.log(oneTimePassword);
  return;
};

const registerStep1Handler = async (req, res, next) => {
  try {
    await registerStep1Service(req.body.phone);
    res.status(200).json({
      message: messages.success,
    });
  } catch (error) {
    next(error);
  }
};

export default registerStep1Handler;
