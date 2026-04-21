import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("MINIMAL SEED START...");
  const adminId = "65f2a1b2c3d4e5f600000001";
  const hash = await bcrypt.hash("admin123", 10);
  
  try {
    const user = await (prisma as any).user.create({
      data: {
        id: adminId,
        name: "Admin",
        email: "admin@bzu.edu.pk",
        passwordHash: hash,
        role: "ADMIN"
      }
    });
    console.log("SUCCESS:", user.id);
  } catch (e) {
    console.error("FAILED MINIMAL SEED:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
