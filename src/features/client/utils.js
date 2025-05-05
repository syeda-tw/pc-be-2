// This function is used to extract specific fields from the user object
export const sanitizeClient = (user) => {
    try {
      const userObject = user?.toObject({ versionKey: false });
      const {
        first_name,
        last_name,
        middle_name,
        pronouns,
        gender,
        date_of_birth,
        users
      } = userObject;

      // Return an object containing only the specified fields
      return {
        type: "client",
        first_name,
        last_name,
        middle_name,
        pronouns,
        gender,
        date_of_birth,
        users
      };
    } catch (err) {
      return null;
    }
  };
