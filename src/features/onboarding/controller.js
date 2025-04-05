import { messages } from "./messages.js";
import { onboardingStep1Service,
   validateUsernameService,
   onboardingIndividualStep2Service,
   onboardingCompanyStep2Service
 } from "./services.js";
import { geoapifyAutocompleteAddress, geoapifyValidateAddress } from "./utils.js";
import { sanitizeUser } from "../../common/utils/sanitizeUser.js";

const onboardingStep1 = async (req, res, next) => {
  try {
    const user = await onboardingStep1Service(
      req.body.data,
      req.body.decodedToken._id
    );
    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

const validateAddress = async (req, res, next) => {
  try {
    const data = await geoapifyValidateAddress(req.body.address);
    return res.status(200).json( data );
  } catch (err) {
    next(err);
  }
};

const autocompleteAddress = async (req, res, next) => {
  try {
    const data = await geoapifyAutocompleteAddress(req.body.data.address);
    return res.status(200).json(data );
  } catch (err) {
    next(err);
  }
};

const validateUsername = async (req, res, next) => {
  try {
    const user = await validateUsernameService(
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
    const user = await onboardingIndividualStep2Service(req.body.data, req.body.decodedToken._id);
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

const onboardingCompanyStep2 = async (req, res, next) => {
  try {
    const user = await onboardingCompanyStep2Service(req.body);
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

export { onboardingStep1, validateAddress, autocompleteAddress, validateUsername, onboardingIndividualStep2, onboardingCompanyStep2 };
