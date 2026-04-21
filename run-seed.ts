import { execSync } from 'child_process';
try {
  const output = execSync('npx tsx prisma/seed.ts', { encoding: 'utf-8' });
  console.log(output);
} catch (error: any) {
  console.log("EXEC FAILURE! output was:");
  console.log(error.stdout);
  console.log(error.stderr);
}
