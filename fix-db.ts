import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Looking for users with missing names...");
  try {
    // Run a raw mongo command to update all users where name is null or missing
    const result = await prisma.$runCommandRaw({
      update: "User",
      updates: [
        {
          q: { $or: [{ name: null }, { name: { $exists: false } }] },
          u: { $set: { name: "Unknown User" } },
          multi: true,
        },
      ],
    });
    console.log("Raw update result:", result);
  } catch (err) {
    console.error("Error updating users:", err);
  }

  // Also check if any users exist to see if this was successful
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
    console.log(`Found ${users.length} users in the database.`);
    console.log(users);
  } catch(err) {
    console.log("Could not fetch users via prisma because of schema mismatch:", err.message);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
