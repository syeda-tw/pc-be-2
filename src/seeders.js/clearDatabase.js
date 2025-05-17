// seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Client from "../common/models/Client.js";
import InvitedClient from "../common/models/InvitedClient.js";
import OtpVerification from "../common/models/OtpVerification.js";
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

async function seedDatabase() {
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
      OtpVerification.deleteMany({}),
      Practice.deleteMany({}),
      User.deleteMany({}),
    ]);

    console.log("🧹 All collections cleared.");

    // Drop indexes
    await Promise.all([
      dropIndexesForModel(Client),
      dropIndexesForModel(InvitedClient),
      dropIndexesForModel(OtpVerification),
      dropIndexesForModel(Practice),
      dropIndexesForModel(User),
    ]);

    console.log("🧾 All indexes dropped.");

    // TODO: Add new seed data if needed
  } catch (error) {
    console.error("❌ Error during seeding:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedDatabase();
