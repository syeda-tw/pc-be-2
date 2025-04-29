import Practice from "../../../common/models/practice.js";
import User from "../../../common/models/user.js";

const findUserByIdDbOp = async (id) => {
  try {
    return await User.findById(id);
  } catch (error) {
    console.error();
  }
  return null;
};

const updateUserDbOp = async (id, user) => {
  try {
    return await User.findByIdAndUpdate(id, user, { new: true });
  } catch (error) {
    console.error();
  }
};

const findUserByUsernameDbOp = async (username) => {
  try {
    return await User.findOne({ username });
  } catch (error) {
    console.error(error);
  }
};

const findPracticeByIdDbOp = async (id) => {
  try {
    return await Practice.findById(id);
  } catch (error) {
    console.error();
  }
  return null;
};

const updatePracticeDbOp = async (id, practice) => {
  try {
    return await Practice.findByIdAndUpdate(id, practice, { new: true });
  } catch (error) {
    console.error();
  }
};

const createPracticeDbOp = async (practice) => {
  try {
    return await Practice.create(practice);
  } catch (error) {
    console.error();
  }
};


export {
  findUserByIdDbOp,
  updateUserDbOp,
  findUserByUsernameDbOp,
  findPracticeByIdDbOp,
  updatePracticeDbOp,
  createPracticeDbOp
};
