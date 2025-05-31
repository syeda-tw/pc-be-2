// This function is used to extract specific fields from the user object
export const sanitizeClient = (user) => {
  try {
    const userObject = user?.toObject({ versionKey: false });
    const {
      firstName,
      lastName,
      middleName,
      pronouns,
      gender,
      dateOfBirth,
      users,
    } = userObject;

    // Return an object containing only the specified fields
    return {
      type: "client",
      firstName,
      lastName,
      middleName,
      pronouns,
      gender,
      dateOfBirth,
      users,
    };
  } catch (err) {
    return null;
  }
};
