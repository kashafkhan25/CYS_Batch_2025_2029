import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$runCommandRaw({
      find: "User",
    });
    
    const docs = (result as any)?.cursor?.firstBatch || [];
    fs.writeFileSync("users.json", JSON.stringify(docs, null, 2));
    console.log("Wrote users.json");
  } catch (err) {
    console.error("Error:", err);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
