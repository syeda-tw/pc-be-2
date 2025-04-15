import User from "../../common/models/user.js";


export const findUserByIdDbOp = async (id) => {
    try {
      return await User.findById(id);
    } catch (error) {
      console.error("Error in findUserByIdDbOp:", error);
      return null;
    }
  };
  

export const updateUserPersonalInformation = async (userId, data) => {
  const { first_name, last_name, middle_name, pronouns, gender, phone, date_of_birth } = data;
  
  const user = await User.findByIdAndUpdate(
    userId,
    {
      first_name,
      last_name,
      middle_name,
      pronouns,
      gender,
      phone,
      date_of_birth
    },
    { new: true }
  );

  return user;
}; 

export const getTimezoneByUserIdDbOp = async (userId) => {
  const user = await User.findById(userId);
  return user ? user.timezone : null;
};

export const updateUserDbOp = async (userId, data) => {
  const user = await User.findByIdAndUpdate(userId, data, { new: true });
  return user;
};