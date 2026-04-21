const { execSync } = require('child_process');
const fs = require('fs');
try {
  execSync('npx tsx prisma/seed.ts', { encoding: 'utf-8' });
} catch (error) {
  fs.writeFileSync('error.json', JSON.stringify({
    message: error.message,
    stdout: error.stdout,
    stderr: error.stderr
  }, null, 2));
}
