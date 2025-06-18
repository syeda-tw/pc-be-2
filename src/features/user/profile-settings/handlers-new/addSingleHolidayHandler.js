import User from '../../../../common/models/User.js';

const messages = {
  user: {
    notFound: 'User not found',
  },
  holiday: {
    added: 'Holiday added successfully',
  },
};

const addSingleHolidayService = async (id, holiday) => {
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { $push: { 'holidays.oneTimeHolidays': holiday } },
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
    throw { code: 500, message: 'An unexpected error occurred while adding the single holiday.' };
  }
};

const addSingleHolidayHandler = async (req, res) => {
  const { holiday } = req.body;
  const { id } = req;

  try {
    const holidays = await addSingleHolidayService(id, holiday);
    return res.status(200).json({
      holidays,
      message: messages.holiday.added,
    });
  } catch (error) {
    return res.status(error.code || 500).json({ message: error.message });
  }
};

export default addSingleHolidayHandler;
