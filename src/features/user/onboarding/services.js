import CustomError from "../../../common/utils/customError.js";
import { findUserByIdDbOp, findUserByUsernameDbOp, updateUserDbOp, findPracticeByIdDbOp, updatePracticeDbOp, createPracticeDbOp } from "./dbOps.js";
import { messages } from "./messages.js";
import { extractAddressPartsFromGoogle } from "./utils.js";

const validateUsernameService = async (username, id) => {
  const user = await findUserByUsernameDbOp(username);
  if (user) {
    throw new CustomError(400, messages.usernameAlreadyExists);
  } 
  return
};

const onboardingIndividualStep2Service = async (data, id) => {
  const { businessName, website, address } = data;
  const user = await findUserByIdDbOp(id);
  if (!user) {
    throw new CustomError(400, messages.userNotFound);
  }
  const addressParts = await extractAddressPartsFromGoogle(address);

  let practice;
  try {
    practice = await createPracticeDbOp({
      members: [user._id],
      business_name: businessName,
      website: website,
      addresses: {
      street: addressParts.street,
      city: addressParts.city,
      state: addressParts.state,
      zip: addressParts.zip,
    },
    is_company: false,
    });
  } catch (error) {
    throw new Error(error);
  }

  user.practice = practice._id;
  user.status = "onboarded";

  try {
    const userUpdated = await updateUserDbOp(id, user);
    return userUpdated;
  } catch (error) {
    throw new Error(error);
  }
};  

const onboardingCompanyStep2Service = async (data, id) => {
  const { businessName, website, address, members } = data;
  const user = await findUserByIdDbOp(id);
  if (!user) {
    throw new CustomError(400, messages.userNotFound);
  }
  const addressParts = await extractAddressPartsFromGoogle(address);

  let practice;

  try {
    practice = await createPracticeDbOp({
      members: members,
      business_name: businessName,
      website: website,
      addresses: {
        street: addressParts.street,
        city: addressParts.city,
        state: addressParts.state,
        zip: addressParts.zip,
      },
      is_company: true,
    });
  } catch (error) {
    throw new Error(error);
  }

  user.practice = practice._id;
  user.status = "onboarded";

  try {
    const userUpdated = await updateUserDbOp(id, user);
    return userUpdated;
  } catch (error) {
    throw new Error(error);
  }
};

export {  validateUsernameService, onboardingIndividualStep2Service, onboardingCompanyStep2Service };
