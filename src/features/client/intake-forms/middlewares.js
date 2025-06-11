export const getIntakeFormsMiddleware = async (req, res, next) => {
  const { relationshipId } = req.params;

  if (!relationshipId) {
    throw { status: 400, message: 'Relationship ID is required' };
  }

  next();
};