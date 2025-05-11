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
    .select('availability.daily_lunch_start_time availability.daily_lunch_end_time')
    .lean();

  if (!user) {
    return null;
  }

  return {
    daily_lunch_start_time: user.availability.daily_lunch_start_time,
    daily_lunch_end_time: user.availability.daily_lunch_end_time
  };
};

export const updateUserDailyLunch = async (userId, startTime, endTime) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      'availability.daily_lunch_start_time': startTime,
      'availability.daily_lunch_end_time': endTime
    },
    {
      new: true,
      select: 'availability.daily_lunch_start_time availability.daily_lunch_end_time'
    }
  ).lean();

  if (!user) {
    return null;
  }

  return {
    daily_lunch_start_time: user.availability.daily_lunch_start_time,
    daily_lunch_end_time: user.availability.daily_lunch_end_time
  };
};

export const getWeeklyScheduleFromDB = async (userId) => {
  const user = await User.findById(userId).select('availability.weekly_schedule');
  if (!user) throw new Error('User not found');
  
  return user.availability?.weekly_schedule || null;
};


export const updateWeeklyScheduleInDB = async (userId, weeklySchedule) => {
  try {
    const user = await User.findById(userId);

  if (!user) throw new Error('User not found');

  user.availability.weekly_schedule = weeklySchedule;
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
      select: '_id business_name is_company website addresses'
    });
  } catch (error) {
    console.error("Error in findUserByUsernameDbOp:", error);
    return null;
  }
};
