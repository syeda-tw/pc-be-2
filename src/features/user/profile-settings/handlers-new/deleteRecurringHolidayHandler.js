import User from '../../../../common/models/User.js';

const messages = {
  user: {
    notFound: 'User not found',
  },
  holiday: {
    deleted: 'Holiday deleted successfully',
    notFound: 'Holiday not found',
  },
};

const deleteRecurringHolidayService = async (id, holidayId) => {
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { $pull: { 'holidays.recurringHolidays': { _id: holidayId } } },
      { new: true, select: 'holidays' }
    );
    
    if (!user) {
      throw { code: 404, message: messages.user.notFound };
    }
    
    return user.holidays;
  } catch (error) {
    if (error && error.code && error.message) {
      throw error;
    }
    throw { code: 500, message: 'An unexpected error occurred while deleting the recurring holiday.' };
  }
};

const deleteRecurringHolidayHandler = async (req, res) => {
  const { holidayId } = req.params;
  const { id } = req;
  
  try {
    const holidays = await deleteRecurringHolidayService(id, holidayId);
    return res.status(200).json({
      holidays,
      message: messages.holiday.deleted,
    });
  } catch (error) {
    return res.status(error.code || 500).json({ message: error.message });
  }
};

export default deleteRecurringHolidayHandler; 