import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("RAW MONGO SEED STARTING...");

  const hashAdmin = await bcrypt.hash("admin123", 10);
  const hashTeacher = await bcrypt.hash("teacher123", 10);
  const hashStudent = await bcrypt.hash("student123", 10);

  const now = { $date: new Date().toISOString() };

  try {
    const result = await prisma.$runCommandRaw({
      insert: "User",
      documents: [
    { name: "Admin", email: "admin@lms.com", passwordHash: hashAdmin, role: "ADMIN", isFirstLogin: true, createdAt: now, updatedAt: now },
    { name: "Dr. MUHAMMAD", email: "teacher@lms.com", passwordHash: hashTeacher, role: "TEACHER", isFirstLogin: true, createdAt: now, updatedAt: now },
    { name: "Kashaf", email: "student@lms.com", passwordHash: hashStudent, role: "STUDENT", isFirstLogin: true, createdAt: now, updatedAt: now }
      ]
    });
    console.log("Raw insert result:", result);
    console.log("SEEDING DEFINITIVELY SUCCESSFUL!");
  } catch (err) {
    console.error("Failed to seed User collection natively:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
