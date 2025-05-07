import User from "../../../../common/models/User.js";
import Practice from "../../../../common/models/Practice.js";
import { extractAddressPartsFromGoogle } from '../utils.js';
import { sanitizeUserAndAppendType } from '../../../common/utils.js';


const messages = {
  userNotFound: "User not found",
  practiceCreationFailed: "Practice creation failed",
}
const onboardingIndividualStep2Service = async (data, id) => {
  const { businessName, website, address } = data;
  const user = await User.findById(id);
  if (!user) {
    throw({
      status: 400,
      message: messages.userNotFound,
    })
  }
  const addressParts = await extractAddressPartsFromGoogle(address);

  let practice;
  try {
    practice = await createPracticeDbOp({
      members: [user._id],
      businessName: businessName,
      website: website,
      addresses: {
      street: addressParts.street,
      city: addressParts.city,
      state: addressParts.state,
      zip: addressParts.zip,
    },
    isCompany: false,
    });
  } catch (error) {
    throw({
      status: 400,
      message: messages.practiceCreationFailed,
    })
  }

  user.practice = practice._id;
  user.status = "onboarded";

  try {
    const userUpdated = await User.findByIdAndUpdate(id, user);
    return userUpdated.toObject();
  } catch (error) {
    throw({
      status: 400,
      message: messages.practiceCreationFailed,
    })
  }
}; 

export const onboardingIndividualStep2Handler = async (req, res, next) => {
  try {
    const user = await onboardingIndividualStep2Service(
      req.body.data,
      req.body.decodedToken._id
    );
    return res.status(200).json({   
      user: sanitizeUserAndAppendType(user, "user"),
     });
  } catch (err) {
    next(err);
  }
};