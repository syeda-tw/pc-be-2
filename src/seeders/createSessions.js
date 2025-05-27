import mongoose from "mongoose";
import Session from "../common/models/Session.js";
import { setHours, setMinutes, startOfMonth, endOfMonth } from "date-fns";
import { env } from "../common/config/env.js";

async function seedSessions() {
  await mongoose.connect(env.MONGO_URI_LOCAL || "", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const user = "682c6873a914d59ae595b823";
  const client = "682f40d89a3a608a46e0913f";
  const relationship = "682f404e9a3a608a46e09127";

  const juneStart = new Date("2025-06-01T00:00:00");
  const juneEnd = new Date("2025-06-30T23:59:59");

  const sessions = [];

  for (let d = new Date(juneStart); d <= juneEnd; d.setDate(d.getDate() + 1)) {
    const chance = Math.random();

    if (chance < 0.3) continue; // 30% chance no sessions

    // Define number of sessions based on weighted randomness
    let sessionCount = 1;
    if (chance >= 0.3 && chance < 0.5) sessionCount = 1;
    else if (chance >= 0.5 && chance < 0.7) sessionCount = 2;
    else if (chance >= 0.7 && chance < 0.9) sessionCount = 5;
    else sessionCount = 10;

    const baseHour = 8; // Start from 8 AM

    for (let i = 0; i < sessionCount; i++) {
      const start = setMinutes(setHours(new Date(d), baseHour + i), 0);
      const end = setMinutes(setHours(new Date(d), baseHour + i + 1), 0);

      sessions.push({
        user,
        client,
        relationship,
        date: new Date(d),
        startTime: new Date(start),
        endTime: new Date(end),
        notes: "",
        paymentStatus: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  await Session.insertMany(sessions);
  console.log(`Inserted ${sessions.length} sessions for June 2025.`);
  await mongoose.disconnect();
}

seedSessions().catch(console.error);
