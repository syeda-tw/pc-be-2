import CustomError from "../../common/utils/customError.js";
import { findUserByIdDbOp, updateUserDbOp } from "./dbOps.js";

const onboardingStep1Service = async ({title, pronouns, 
  gender, dateOfBirth, firstName, lastName, middleName, status, username
}, id) => {
  try {
    const user = await findUserByIdDbOp(id);
    if (!user) {
      throw new CustomError(400, messages.error.userNotFound);
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
export { onboardingStep1Service };
