// seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Client from '../common/models/client.js';
import InvitedClient from '../common/models/invitedClient.js';
import OtpVerification from '../common/models/otpVerification.js';
import Practice from '../common/models/practice.js';
import User from '../common/models/user.js';

dotenv.config();

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI_LOCAL || 'mongodb://localhost:27017/your-db-name', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Delete existing documents
    await Promise.all([
      Client.deleteMany({}),
      InvitedClient.deleteMany({}),
      OtpVerification.deleteMany({}),
      Practice.deleteMany({}),
      User.deleteMany({}),
    ]);

    console.log('🧹 All collections cleared.');

    // Next: Add new seed data here...

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedDatabase();
