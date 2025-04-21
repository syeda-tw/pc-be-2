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

export const getHolidaysByUserIdDbOp = async (userId) => {
  const user = await User.findById(userId);
  return user && user.holidays && user.holidays.length > 0 ? user.holidays : [];
};

export const getUserDailyLunch = async (userId) => {
  const user = await User.findById(userId)
    .select('availability.dailyLunchStarttime availability.dailyLunchEndtime')
    .lean();

  if (!user) {
    return null;
  }

  return {
    dailyLunchStarttime: user.availability.dailyLunchStarttime,
    dailyLunchEndtime: user.availability.dailyLunchEndtime
  };
};

export const updateUserDailyLunch = async (userId, startTime, endTime) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      'availability.dailyLunchStarttime': startTime,
      'availability.dailyLunchEndtime': endTime
    },
    {
      new: true,
      select: 'availability.dailyLunchStarttime availability.dailyLunchEndtime'
    }
  ).lean();

  if (!user) {
    return null;
  }

  return {
    dailyLunchStarttime: user.availability.dailyLunchStarttime,
    dailyLunchEndtime: user.availability.dailyLunchEndtime
  };
};