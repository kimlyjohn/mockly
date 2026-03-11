import "dotenv/config";

import prisma from "../lib/prisma";

async function testDatabase() {
  console.log("Testing Prisma database connection...");

  try {
    const settings = await prisma.appSettings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });

    console.log("Connected successfully.");
    console.log("Settings row id:", settings.id);

    const examCount = await prisma.exam.count();
    console.log("Exam count:", examCount);

    console.log("All checks passed.");
  } catch (error) {
    console.error("Database test failed:", error);
    process.exit(1);
  }
}

void testDatabase();
