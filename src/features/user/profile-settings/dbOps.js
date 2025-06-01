import User from "../../../common/models/User.js";

export const findUserByIdDbOp = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) throw { code: 404, message: 'User not found' };
    return user;
  } catch (error) {
    throw { code: 500, message: 'Error finding user by ID' };
  }
};

export const updateUserPersonalInformation = async (userId, data) => {
  try {
    const { firstName, lastName, middleName, pronouns, gender, phone, dateOfBirth } = data;
    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, middleName, pronouns, gender, phone, dateOfBirth },
      { new: true }
    );
    if (!user) throw { code: 404, message: 'User not found' };
    return user;
  } catch (error) {
    throw { code: 500, message: 'Error updating user information' };
  }
};

export const getTimezoneByUserIdDbOp = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw { code: 404, message: 'User not found' };
    return user.timezone;
  } catch (error) {
    throw { code: 500, message: 'Error getting user timezone' };
  }
};

export const updateUserDbOp = async (userId, data) => {
  try {
    const user = await User.findByIdAndUpdate(userId, data, { new: true });
    if (!user) throw { code: 404, message: 'User not found' };
    return user;
  } catch (error) {
    throw { code: 500, message: 'Error updating user' };
  }
};

export const getHolidaysByUserIdDbOp = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw { code: 404, message: 'User not found' };
    return user.holidays || [];
  } catch (error) {
    throw { code: 500, message: 'Error getting user holidays' };
  }
};

export const getUserDailyLunch = async (userId) => {
  try {
    const user = await User.findById(userId)
      .select('availability.dailyLunchStartTime availability.dailyLunchEndTime')
      .lean();
    if (!user) throw { code: 404, message: 'User not found' };
    return {
      dailyLunchStartTime: user.availability.dailyLunchStartTime,
      dailyLunchEndTime: user.availability.dailyLunchEndTime
    };
  } catch (error) {
    throw { code: 500, message: 'Error getting user daily lunch' };
  }
};

export const updateUserDailyLunch = async (userId, startTime, endTime) => {
  try {
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
    if (!user) throw { code: 404, message: 'User not found' };
    return {
      dailyLunchStartTime: user.availability.dailyLunchStartTime,
      dailyLunchEndTime: user.availability.dailyLunchEndTime
    };
  } catch (error) {
    throw { code: 500, message: 'Error updating user daily lunch' };
  }
};

export const getWeeklyScheduleFromDB = async (userId) => {
  try {
    const user = await User.findById(userId).select('availability.weeklySchedule');
    if (!user) throw { code: 404, message: 'User not found' };
    return user.availability?.weeklySchedule || null;
  } catch (error) {
    throw { code: 500, message: 'Error getting weekly schedule' };
  }
};

export const updateWeeklyScheduleInDB = async (userId, weeklySchedule) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw { code: 404, message: 'User not found' };
    user.availability.weeklySchedule = weeklySchedule;
    await user.save();
    return user;
  } catch (error) {
    throw { code: 500, message: 'Error updating weekly schedule' };
  }
};

export const findUserByUsernameDbOp = async (username) => {
  try {
    const user = await User.findOne({ username }).populate({
      path: 'practice',
      select: '_id name isCompany website addresses'
    });
    if (!user) throw { code: 404, message: 'User not found' };
    return user;
  } catch (error) {
    throw { code: 500, message: 'Error finding user by username' };
  }
};
