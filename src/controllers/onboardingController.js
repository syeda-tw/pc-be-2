import User from "../models/user.js"; // User model
import { geoapifyValidateAddress } from "../helpers/address-validation.js";
import Practice from "../models/practice.js";

export const onboardingStep1 = async (req, res, next) => {
  try {
    // Check if authorization header is present

    // Fetch the user using the ID from the decoded token
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update user with the provided data
    const {
      title,
      pronouns,
      gender,
      dateOfBirth,
      firstName,
      lastName,
      middleName,
      username,
    } = req.body;

    // Validation checks
    const errors = [];

    if (!firstName) {
      errors.push("First name is required");
    }
    if (!lastName) {
      errors.push("Last name is required");
    }
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const age = new Date().getFullYear() - dob.getFullYear();
      if (age < 18) {
        errors.push("User must be at least 18 years old");
      }
    } else {
      errors.push("Date of birth is required");
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    user.title = title;
    user.pronouns = pronouns;
    user.gender = gender;
    user.date_of_birth = dateOfBirth;
    user.first_name = firstName;
    user.last_name = lastName;
    user.middle_name = middleName;
    user.status = "onboarding-step-2";
    user.username = username;

    await updateUserDbOp(user._id, user);

    return 
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const validateAddress = async (req, res, next) => {
  try {
    const { address } = req.body;
    const data = await geoapifyValidateAddress(address);
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const validateUsername = async (req, res, next) => {
  try {
    const { username } = req.body;

    const user = await User.findOne({ username });

    if (user) {
      return res.status(400).json({
        isValid: false,
        message: "Username already exists",
      });
    }

    return res.status(200).json({
      isValid: true,
      message: "Username is available",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isValid: false,
      message: "Internal server error",
    });
  }
};

export const onboardingIndividualStep2 = async (req, res, next) => {
  try {
    const { website, address, businessName } = req.body;

    const practice = await Practice.create(
      {
        business_name: businessName,
        website,
        addresses: [address],
        is_company: false,
      },
      { new: true }
    );

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        practice: practice._id,
        status: "onboarded",
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Practice created successfully",
      practice,
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const onboardingCompanyStep2 = async (req, res, next) => {
  try {
    const { website, address, businessName, members } = req.body;

    const practice = await Practice.create({
      business_name: businessName,
      website,
      addresses: [address],
      is_company: true,
      members,
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        practice: practice._id,
        status: "onboarded",
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Practice created successfully",
      practice,
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
