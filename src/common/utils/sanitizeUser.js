// This function is used to remove the password and internal Mongoose properties from the user object
const sanitizeUser = (user) => {
  // Convert the Mongoose document to a plain JavaScript object, removing Mongoose-specific internal properties
  try {
    const userObject = user?.toObject({ versionKey: false }); // `versionKey: false` removes the `__v` field
    // Destructure to remove the password field
    const { password, ...userWithoutPassword } = userObject;

    // Add type: "user" to the sanitized user object
    const sanitizedUserWithType = { ...userWithoutPassword, type: "user" };

    // Return the sanitized user object with type
    return sanitizedUserWithType;
  } catch (err) {
    console.log("err", err);
    return null;
  }
};

export { sanitizeUser };
