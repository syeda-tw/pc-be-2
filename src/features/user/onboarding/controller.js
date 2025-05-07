import { messages } from "./messages.js";
import {
  validateUsernameService,
  onboardingIndividualStep2Service,
  onboardingCompanyStep2Service,
} from "./services.js";
import { googleAutocompleteAddress, googleValidateAddress } from "./utils.js";

const validateAddress = async (req, res, next) => {
  try {
    const data = await googleValidateAddress(req.body.address);
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

const autocompleteAddress = async (req, res, next) => {
  try {
    const data = await googleAutocompleteAddress(req.body.data.address);
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

const validateUsername = async (req, res, next) => {
  try {
    await validateUsernameService(
      req.body.data.username,
      req.body.decodedToken._id
    );
    return res.status(200).json({
      isValid: true,
      message: messages.usernameAvailable,
    });
  } catch (err) {
    next(err);
  }
};

const onboardingIndividualStep2 = async (req, res, next) => {
  try {
    const user = await onboardingIndividualStep2Service(
      req.body.data,
      req.body.decodedToken._id
    );
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

const onboardingCompanyStep2 = async (req, res, next) => {
  try {
    const user = await onboardingCompanyStep2Service(
      req.body.data,
      req.body.decodedToken._id
    );
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

export {
  validateAddress,
  autocompleteAddress,
  validateUsername,
  onboardingIndividualStep2,
  onboardingCompanyStep2,
};
