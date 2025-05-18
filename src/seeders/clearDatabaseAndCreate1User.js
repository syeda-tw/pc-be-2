import mongoose from 'mongoose';
import Practice from "../common/models/Practice.js";
import User from "../common/models/User.js";
import Client from "../common/models/Client.js"; // <-- Make sure the path is correct
import InvitedClient from "../common/models/InvitedClient.js"; // <-- Adjust path
import OtpVerification from "../common/models/OtpVerification.js"; // <-- Adjust path
import { env } from "../common/config/env.js";
import { hashPassword } from "../features/common/utils.js";

async function dropIndexesForModel(model) {
  try {
    await model.collection.dropIndexes();
    console.log(`Indexes dropped for ${model.modelName}`);
  } catch (err) {
    // Handle error if no indexes exist or collection doesn't exist yet
    if (err.codeName === 'NamespaceNotFound') {
      console.log(`Collection for ${model.modelName} does not exist, skipping dropIndexes.`);
    } else if (err.message.includes('index not found')) {
      console.log(`No indexes to drop for ${model.modelName}`);
    } else {
      console.warn(`Error dropping indexes for ${model.modelName}:`, err.message);
    }
  }
}

const clearDatabaseAndCreate1User = async () => {
  console.log("Starting database clear and user creation...");

  try {
    await mongoose.connect(env.MONGO_URI_LOCAL || "", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Clear all collections
    await Promise.all([
      Client.deleteMany({}),
      InvitedClient.deleteMany({}),
      OtpVerification.deleteMany({}),
      Practice.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log("🧹 All collections cleared.");

    // Drop all indexes
    await Promise.all([
      dropIndexesForModel(Client),
      dropIndexesForModel(InvitedClient),
      dropIndexesForModel(OtpVerification),
      dropIndexesForModel(Practice),
      dropIndexesForModel(User),
    ]);
    console.log("🧾 All indexes dropped.");

    // Create test practice
    console.log("Creating test practice...");
    const practice = await Practice.create({
      name: "Test Practice",
      address: "123 Main St",
      city: "Anytown",
      state: "CA",
      zip: "12345",
    });
    console.log("Practice created:", practice);

    // Create test user
    console.log("Creating test user...");
    const hashedPassword = await hashPassword("Book2025!");
    const user = await User.create({
      email: "test@test.com",
      password: hashedPassword,
      firstName: "Test",
      lastName: "User",
      role: "admin",
      practice: practice._id,
      clients: [],
      invitedClients: [],
      otpVerifications: [],
      isEmailVerified: true,
      isPhoneVerified: true,
      isProfileComplete: true,
      isActive: true,
      status: "onboarded",
    });
    console.log("User created successfully:", user);

    console.log("Database seeding completed");
  } catch (error) {
    console.error("❌ Error during database seeding:", error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("🔌 Disconnected from MongoDB");
    }
  }
};

clearDatabaseAndCreate1User();
