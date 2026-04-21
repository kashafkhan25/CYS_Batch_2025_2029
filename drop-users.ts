import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient();

async function main() {
  console.log("Dropping the corrupted User collection directly...");
  try {
    await prisma.$runCommandRaw({
      delete: "User",
      deletes: [{ q: {}, limit: 0 }],
    });
    console.log("Successfully wiped all old users from MongoDB.");
  } catch (err) {
    console.error("Error wiping users:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
