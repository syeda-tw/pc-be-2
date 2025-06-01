// clearDatabase.js
import mongoose from "mongoose";
import Client from "../common/models/Client.js";
import InvitedClient from "../common/models/InvitedClient.js";
import UserOtpVerification from "../common/models/UserOtpVerification.js";
import Practice from "../common/models/Practice.js";
import User from "../common/models/User.js";
import { env } from "../common/config/env.js";

async function dropIndexesForModel(model) {
  try {
    await model.collection.dropIndexes();
    console.log(`🧹 Indexes dropped for ${model.modelName}`);
  } catch (err) {
    if (err.code === 26) {
      // NamespaceNotFound: collection doesn't exist yet
      console.warn(`⚠️  No indexes to drop for ${model.modelName}`);
    } else {
      console.error(`❌ Failed to drop indexes for ${model.modelName}:`, err);
    }
  }
}

export async function clearDatabase() {
  try {
    await mongoose.connect(env.MONGO_URI_LOCAL || "", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Delete existing documents
    await Promise.all([
      Client.deleteMany({}),
      InvitedClient.deleteMany({}),
      UserOtpVerification.deleteMany({}),
      Practice.deleteMany({}),
      User.deleteMany({}),
    ]);

    console.log("🧹 All collections cleared.");

    // Drop indexes
    await Promise.all([
      dropIndexesForModel(Client),
      dropIndexesForModel(InvitedClient),
      dropIndexesForModel(UserOtpVerification),
      dropIndexesForModel(Practice),
      dropIndexesForModel(User),
    ]);

    console.log("🧾 All indexes dropped.");
  } catch (error) {
    console.error("❌ Error during database clearing:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

clearDatabase();
