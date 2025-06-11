const messages = {
  relationshipIdRequired: 'Relationship ID is required',
  formIdRequired: 'Intake form ID is required'
};

export const getIntakeFormsMiddleware = async (req, res, next) => {
  const { relationshipId } = req.params;

  if (!relationshipId) {
    throw { status: 400, message: messages.relationshipIdRequired };
  }

  next();
};

export const getSingleIntakeFormMiddleware = async (req, res, next) => {
  const { formId } = req.params;

  if (!formId) {
    throw { status: 400, message: messages.formIdRequired };
  }

  next();
};