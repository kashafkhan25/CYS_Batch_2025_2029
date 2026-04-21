import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const models = [
    "AttendanceRecord", "Submission", "Assignment", "QuizAttempt",
    "Quiz", "Announcement", "LessonProgress", "Resource", "Lesson",
    "Module", "CourseOffering", "User", "Course", "Batch"
  ];
  
  console.log("Dropping all collections via raw mongo commands...");
  for (const model of models) {
    try {
      await prisma.$runCommandRaw({
        delete: model,
        deletes: [{ q: {}, limit: 0 }],
      });
      console.log(`Wiped ${model}`);
    } catch (err) {
      console.log(`Failed to wipe ${model} (might not exist)`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
