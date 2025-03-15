const User = require("../models/user");

// Update user availability
exports.updateAvailability = async (req, res, next) => {
  const userId = req.user._id;
  const { availability } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { availability },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Availability updated successfully",
      availability: user.availability,
    });
  } catch (err) {
    console.error("Error updating availability:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user availability
exports.getAvailability = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Availability retrieved successfully",
      availability: user.availability,
    });
  } catch (err) {
    console.error("Error retrieving availability:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}; 