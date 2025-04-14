import CustomError from "../../common/utils/customError.js";
import { findUserByIdDbOp, findUserByUsernameDbOp, updateUserDbOp, findPracticeByIdDbOp, updatePracticeDbOp, createPracticeDbOp } from "./dbOps.js";
import { messages } from "./messages.js";
import { extractAddressPartsFromGoogle } from "./utils.js";

const onboardingStep1Service = async ({title, pronouns, 
  gender, dateOfBirth, firstName, lastName, middleName, username
}, id) => {
  try {
    const user = await findUserByIdDbOp(id);
    if (!user) {
      throw new CustomError(400, messages.userNotFound);
    }
    const usernameExists = await findUserByUsernameDbOp(username);
    if (usernameExists) {
      throw new CustomError(400, messages.usernameAlreadyExists);
    }

    user.title = title;
    user.pronouns = pronouns;
    user.gender = gender;
    user.date_of_birth = dateOfBirth;
    user.first_name = firstName;
    user.last_name = lastName;
    user.middle_name = middleName;
    user.status = "onboarding-step-2";
    user.username = username;
    try {
      const userUpdated = await updateUserDbOp(id, user);
      return userUpdated;
    } catch (error) {
      throw new Error(error);
    }
  } catch (error) {
    throw new Error(error);
  }
};

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

  user.practice_id = practice._id;
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
  const addressParts = await extractAddressPartsFromGeoapify(address);

  try {
    const practice = await createPracticeDbOp({
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

  user.practice_id = practice._id;
  user.status = "onboarded";

  try {
    const userUpdated = await updateUserDbOp(id, user);
    return userUpdated;
  } catch (error) {
    throw new Error(error);
  }
};

export { onboardingStep1Service, validateUsernameService, onboardingIndividualStep2Service, onboardingCompanyStep2Service };
