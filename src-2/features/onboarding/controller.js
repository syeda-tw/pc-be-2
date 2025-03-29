import { onboardingStep1Service } from "./services.js";
import { geoapifyAutocompleteAddress, geoapifyValidateAddress } from "./utils.js";

const onboardingStep1 = async (req, res, next) => {
  try {
    const user = await onboardingStep1Service(
      req.body.user,
      req.body.decodedToken._id
    );
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

const validateAddress = async (req, res, next) => {
  try {
    const data = await geoapifyValidateAddress(req.body.address);
    return res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};

const autocompleteAddress = async (req, res, next) => {
  try {
    const data = await geoapifyAutocompleteAddress(req.body.address);
    return res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};

export { onboardingStep1, validateAddress, autocompleteAddress };
