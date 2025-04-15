import { messages } from "./messages.js";
import { updatePersonalInformationService, getTimezoneService, updateTimezoneService } from "./services.js";
import { sanitizeUser } from "../../common/utils/sanitizeUser.js";

const updatePersonalInformation = async (req, res, next) => {
  try {
    const user = await updatePersonalInformationService(
      req.body.data,
      req.body.decodedToken._id
    );
    return res.status(200).json({
      user: sanitizeUser(user),
      message: messages.personalInfo.updated
    });
  } catch (err) {
    next(err);
  }
};

const getTimezone = async (req, res, next) => {
  try {
    const timezone = await getTimezoneService(req.body.decodedToken._id);
    return res.status(200).json({
      timezone: timezone,
      message: messages.timezone.fetched
    });
  } catch (err) {
    next(err);
  }
};

const updateTimezone = async (req, res, next) => {
  try {
    await updateTimezoneService(req.body.timezone, req.body.decodedToken._id);
    return res.status(200).json({
      message: messages.timezone.updated
    });
  } catch (err) {
    next(err);
  }
};

export { updatePersonalInformation, getTimezone, updateTimezone }; 