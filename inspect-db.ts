import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching raw users from MongoDB...");
  try {
    const result = await prisma.$runCommandRaw({
      find: "User",
    });
    
    // The result from find command in Mongo has this structure:
    // { cursor: { firstBatch: [ ... documents ...] }, ok: 1 }
    const docs = (result as any)?.cursor?.firstBatch || [];
    console.log(`Found ${docs.length} total users in raw MongoDB:`);

    docs.forEach((doc: any, i: number) => {
      console.log(`\n--- User ${i+1} ---`);
      console.log(`ID:`, doc._id);
      console.log(`Email:`, doc.email);
      console.log(`Name:`, doc.name, `| Type:`, typeof doc.name);
      console.log(`Role:`, doc.role);
    });

    // Let's force an update on all documents where name is missing or null, or NOT a string
    console.log("\nAttempting raw update again...");
    // Let's just set name="Unknown" for ANY document where name is not a string
    const updateResult = await prisma.$runCommandRaw({
      update: "User",
      updates: [
        {
          q: { $or: [{ name: { $type: 10 } }, { name: { $exists: false } }, { name: "" }] },
          u: { $set: { name: "Unknown User" } },
          multi: true,
        },
      ],
    });
    console.log("Update result:", updateResult);
    
  } catch (err) {
    console.error("Error:", err);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
