import mongoose from "mongoose";
import User from "../../../common/models/user.js"; // Adjust the path as needed

/**
 * Find a user by their ID in MongoDB
 * @param {string} userId - The MongoDB ObjectId of the user to find
 * @returns {Promise<Object|null>} - The user object if found, null otherwise
 */
const findUserFormsById = async (userId) => {
  try {
    // Validate if the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID format");
    }

    // Find the user by ID
    const user = await User.findById(userId).select("forms");
    return user;
  } catch (error) {
    console.error("Error finding user by ID:", error);
    throw error;
  }
};

const findByIdAndUpdate = async (id, data) => {
  const user = await User.findByIdAndUpdate(id, data, { new: true });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

const findByIdAndReturnDeletedForm = async (id, formId) => {
  const user = await User.findById(id);
  const form = user.forms.find((form) => form._id === formId);
  return form;
};

export { findUserFormsById, findByIdAndUpdate, findByIdAndReturnDeletedForm };
