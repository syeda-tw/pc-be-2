import User from "../../../common/models/User.js";


export const findUserByIdDbOp = async (id) => {
    try {
      return await User.findById(id);
    } catch (error) {
      console.error("Error in findUserByIdDbOp:", error);
      return null;
    }
  };
  

export const updateUserPersonalInformation = async (userId, data) => {
  const { firstName, lastName, middleName, pronouns, gender, phone, dateOfBirth } = data;
  
  const user = await User.findByIdAndUpdate(
    userId,
    {
      firstName,
      lastName,
      middleName,
      pronouns,
      gender,
      phone,
      dateOfBirth
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
    .select('availability.dailyLunchStartTime availability.dailyLunchEndTime')
    .lean();

  if (!user) {
    return null;
  }

  return {
    dailyLunchStartTime: user.availability.dailyLunchStartTime,
    dailyLunchEndTime: user.availability.dailyLunchEndTime
  };
};


export const updateUserDailyLunch = async (userId, startTime, endTime) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      'availability.dailyLunchStartTime': startTime,
      'availability.dailyLunchEndTime': endTime
    },
    {
      new: true,
      select: 'availability.dailyLunchStartTime availability.dailyLunchEndTime'
    }
  ).lean();

  if (!user) {
    return null;
  }

  return {
    dailyLunchStartTime: user.availability.dailyLunchStartTime,
    dailyLunchEndTime: user.availability.dailyLunchEndTime
  };
};

export const getWeeklyScheduleFromDB = async (userId) => {
  const user = await User.findById(userId).select('availability.weeklySchedule');
  if (!user) throw new Error('User not found');
  
  return user.availability?.weeklySchedule || null;
};


export const updateWeeklyScheduleInDB = async (userId, weeklySchedule) => {
  try {
    const user = await User.findById(userId);

  if (!user) throw new Error('User not found');

  user.availability.weeklySchedule = weeklySchedule;
  await user.save();

  return user;
  } catch (error) {
    console.error("Error in updateWeeklyScheduleInDB:", error);
    throw new Error('Failed to update weekly schedule');
  }
};


export const findUserByUsernameDbOp = async (username) => {
  try {
    return await User.findOne({ username }).populate({
      path: 'practice',
      select: '_id businessName isCompany website addresses'
    });
  } catch (error) {
    console.error("Error in findUserByUsernameDbOp:", error);
    return null;
  }
};
