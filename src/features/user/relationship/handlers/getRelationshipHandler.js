import Relationship from "../../../../common/models/Relationship.js";

const messages = {
  success: {
    getRelationship: "Here is the relationship you requested!",
  },
  error: {
    notFound: "Sorry, we couldn't find that relationship.",
    forbidden: "It looks like you don't have permission to view this relationship.",
    getRelationship: "Oops! We had trouble fetching the relationship. Please try again.",
  },
};

const getRelationshipService = async (id, userId) => {
  try {
    const relationship = await Relationship.findById(id)
      .populate([
        {
          path: "client",
          select: "firstName middleName lastName gender pronouns email phone status dateOfBirth",
        }
      ])
      .lean();

    if (!relationship) {
      throw {
        status: 404,
        message: messages.error.notFound,
      };
    }

    if (relationship.user.toString() !== userId) {
      throw {
        status: 403,
        message: messages.error.forbidden,
      };
    }

    return {
      relationshipId: relationship._id,
      status: relationship.status,
      areIntakeFormsFilled: relationship.areIntakeFormsFilled,
      isClientOnboardingComplete: relationship.isClientOnboardingComplete,
      client: relationship.client
        ? {
            firstName: relationship.client.firstName,
            middleName: relationship.client.middleName,
            email: relationship.client.email,
            lastName: relationship.client.lastName,
            phone: relationship.client.phone,
            status: relationship.client.status,
            relationshipId: relationship._id,
            dateOfBirth: relationship.client.dateOfBirth,
            gender: relationship.client.gender,
            pronouns: relationship.client.pronouns,
          }
        : null,
    };
  } catch (err) {
    if (err && typeof err === "object" && "status" in err && "message" in err) {
      throw err;
    }
    throw {
      status: 500,
      message: messages.error.getRelationship,
    };
  }
};

const getRelationshipHandler = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.id;

  try {
    const relationship = await getRelationshipService(id, userId);
    res.status(200).json({
      message: messages.success.getRelationship,
      relationship,
    });
  } catch (err) {
    next(err);
  }
};

export default getRelationshipHandler;
