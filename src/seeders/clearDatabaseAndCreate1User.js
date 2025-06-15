import mongoose from "mongoose";
import Practice from "../common/models/Practice.js";
import User from "../common/models/User.js";
import Client from "../common/models/Client.js";
import InvitedClient from "../common/models/InvitedClient.js";
import UserOtpVerification from "../common/models/UserOtpVerification.js";
import Session from "../common/models/Session.js";
import Relationship from "../common/models/Relationship.js";
import { env } from "../common/config/env.js";
import { hashPassword } from "../features/common/utils.js";
import { setHours, setMinutes } from "date-fns";

async function connectToDatabase() {
  await mongoose.connect(env.MONGO_URI_LOCAL || "", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("✅ Connected to MongoDB");
}

async function clearCollections() {
  await Promise.all([
    Client.deleteMany({}),
    InvitedClient.deleteMany({}),
    UserOtpVerification.deleteMany({}),
    Practice.deleteMany({}),
    User.deleteMany({}),
    Session.deleteMany({}),
    Relationship.deleteMany({}),
  ]);
  console.log("🧹 All collections cleared.");
}

async function dropIndexesForModel(model) {
  try {
    await model.collection.dropIndexes();
    console.log(`Indexes dropped for ${model.modelName}`);
  } catch (err) {
    if (err.codeName === "NamespaceNotFound") {
      console.log(`Collection for ${model.modelName} does not exist.`);
    } else if (err.message.includes("index not found")) {
      console.log(`No indexes found for ${model.modelName}`);
    } else {
      console.warn(
        `Error dropping indexes for ${model.modelName}:`,
        err.message
      );
    }
  }
}

async function dropAllIndexes() {
  await Promise.all([
    dropIndexesForModel(Client),
    dropIndexesForModel(InvitedClient),
    dropIndexesForModel(UserOtpVerification),
    dropIndexesForModel(Practice),
    dropIndexesForModel(User),
    dropIndexesForModel(Session),
    dropIndexesForModel(Relationship),
  ]);
  console.log("🧾 All indexes dropped.");
}

async function createPractice() {
  const practice = await Practice.create({
    name: "Test Practice",
    addresses: [
      {
        street: "123 Main St",
        city: "Anytown",
        state: "CA",
        zip: "12345",
        isPrimary: true,
      },
    ],
    website: "https://testpractice.com",
    members: [],
    isCompany: false,
  });
  console.log("🏥 Practice created:", practice._id);
  return practice;
}

async function createAdminUser(practiceId) {
  const hashedPassword = await hashPassword("Book2025!");
  const user = await User.create({
    email: "test@test.com",
    password: hashedPassword,
    username: "TestUser", // Must be at least 3 characters
    firstName: "Test",
    lastName: "User",
    title: "Dr.",
    middleName: "Example",
    dateOfBirth: new Date("1990-01-01"),
    gender: "Other",
    pronouns: "they/them",
  
    // Account flags
    isAdmin: true,
    status: "onboarded",
    // Practice and financial details
    practice: practiceId,
    sessionCost: 200,
    sessionDuration: 60,
    
    // Timezone and availability
    pronouns: "he/him",
    gender: "Male",
    title: "Dr.",
    dateOfBirth: new Date("1990-01-01"),
  });
  console.log("👤 User created:", user._id);
  return user;
}

async function createClients() {
  const clients = await Client.create([
    {
      phone: "+15550000001",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      dateOfBirth: new Date("1990-01-01"),
      gender: "male",
      status: "onboarded",
    },
    {
      phone: "+15550000002",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      dateOfBirth: new Date("1985-05-15"),
      gender: "female",
      status: "onboarded",
    },
    {
      phone: "+15550000003",
      firstName: "Michael",
      lastName: "Johnson",
      email: "michael@example.com",
      dateOfBirth: new Date("1995-08-20"),
      gender: "male",
      status: "onboarded",
    },
    {
      phone: "+15550000004",
      firstName: "Sarah",
      lastName: "Williams",
      email: "sarah@example.com",
      dateOfBirth: new Date("1988-12-10"),
      gender: "female",
      status: "onboarded",
    },
    {
      phone: "+15550000005",
      firstName: "David",
      lastName: "Brown",
      email: "david@example.com",
      dateOfBirth: new Date("1992-03-25"),
      gender: "male",
      status: "onboarded",
    },
  ]);
  console.log(
    "👥 Clients created:",
    clients.map((c) => c._id)
  );
  return clients;
}

async function createRelationships(userId, clients) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const relationships = [];

  for (const client of clients) {
    const relationship = await Relationship.create({
      client: client._id,
      clientModel: "Client",
      user: userId,
      status: "active",
      areIntakeFormsFilled: true,
      isClientOnboardingComplete: true,
    });

    // Push to client's relationships
    client.relationships = client.relationships || [];
    client.relationships.push(relationship._id);
    client.defaultRelationship = relationship._id;
    await client.save();

    // Push to user's relationships
    user.relationships = user.relationships || [];
    user.relationships.push(relationship._id);
    relationships.push(relationship);
  }

  await user.save();
  console.log("🔗 Relationships created and added to User & Clients");

  return relationships;
}

const createRandomSessions = async (
  userId,
  clientId,
  relationshipId,
  startDate,
  endDate
) => {
  const sessions = [];
  console.log("🔗 Creating sessions for user", userId, "and client", clientId);
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // Skip Saturdays (6) and Sundays (0)
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const chance = Math.random();
    if (chance < 0.3) continue;

    const sessionCount =
      chance < 0.5 ? 1 : chance < 0.7 ? 2 : chance < 0.9 ? 3 : 4;

    for (let i = 0; i < sessionCount; i++) {
      const start = setMinutes(setHours(new Date(d), 9 + i), 0);
      const end = setMinutes(setHours(new Date(d), 9 + i + 1), 0);

      sessions.push({
        user: userId,
        client: clientId,
        relationship: relationshipId,
        date: new Date(d),
        startTime: new Date(start),
        endTime: new Date(end),
        paymentStatus: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
  return sessions;
};

const createSessions = async (user, clients, relationships) => {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1); // Reduced to 1 month instead of 2

  const allSessions = [];

  for (let i = 0; i < clients.length; i++) {
    const client = clients[i];
    const relationship = relationships.find(
      (r) => r.client.toString() === client._id.toString()
    );

    if (!relationship) {
      console.warn(`⚠️ No relationship found for client ${client._id}`);
      continue;
    }

    console.log("🔗 Relationship found for client", client._id);

    const sessions = await createRandomSessions(
      user._id,
      client._id,
      relationship._id,
      startDate,
      endDate
    );

    allSessions.push(...sessions);
  }

  // Insert all sessions in DB
  const insertedSessions = await Session.insertMany(allSessions);
  console.log(`📆 Created ${insertedSessions.length} sessions`);

  // Group sessions by relationshipId to update relationships efficiently
  const sessionsByRelationship = insertedSessions.reduce((acc, session) => {
    const relId = session.relationship.toString();
    if (!acc[relId]) acc[relId] = [];
    acc[relId].push(session._id);
    return acc;
  }, {});

  // Update each Relationship to push session IDs into its sessions array
  for (const [relationshipId, sessionIds] of Object.entries(sessionsByRelationship)) {
    await Relationship.findByIdAndUpdate(
      relationshipId,
      { $push: { sessions: { $each: sessionIds } } },
      { new: true }
    );
    console.log(`✅ Added ${sessionIds.length} sessions to relationship ${relationshipId}`);
  }
};


async function main() {
  try {
    await connectToDatabase();
    await clearCollections();
    await dropAllIndexes();

    const practice = await createPractice();
    const user = await createAdminUser(practice._id);
    const clients = await createClients();
    const relationships = await createRelationships(user._id, clients);

    await createSessions(user, clients, relationships);

    console.log("🎉 Database seeding completed.");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("🔌 Disconnected from MongoDB");
    }
  }
}

main();
