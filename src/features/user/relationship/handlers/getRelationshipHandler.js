import Relationship from "../../../../common/models/Relationship.js";

const messages = {
  success: {
    getRelationship:
      "We've found the relationship details you were looking for!",
  },
  error: {
    notFound:
      "We couldn't find the relationship you're looking for. Please check the ID and try again.",
    forbidden:
      "You don't have access to view this relationship. Please contact support if you believe this is an error.",
    getRelationship:
      "We're having trouble retrieving the relationship information. Please try again in a moment.",
  },
};

const getRelationshipService = async (relationshipId, id) => {
  try {
    const relationship = await Relationship.findById(relationshipId)
      .populate([
        {
          path: "client",
          select:
            "firstName middleName lastName gender pronouns email phone status dateOfBirth",
        },
      ])
      .lean();

    if (!relationship) {
      throw {
        status: 404,
        message: messages.error.notFound,
      };
    }

    if (relationship.user.toString() !== id) {
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
  const { relationshipId } = req.params;
  const id = req.id;

  console.log("relationshipId", relationshipId);
  console.log("id", id);

  try {
    const relationship = await getRelationshipService(relationshipId, id);
    res.status(200).json({
      message: messages.success.getRelationship,
      relationship,
    });
  } catch (err) {
    next(err);
  }
};

export default getRelationshipHandler;
