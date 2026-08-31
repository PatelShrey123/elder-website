const { execSync } = require('child_process');

// Auto-map Vercel Postgres variables to DATABASE_URL
const dbUrl =
  process.env.DATABASE_URL ||
  process.env.STORAGE_URL ||
  process.env.STORAGE_PRISMA_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (dbUrl) {
  process.env.DATABASE_URL = dbUrl;
  console.log('✓ Successfully mapped database connection URL for Prisma');
} else {
  console.warn('⚠ Notice: No database connection URL found in environment.');
}

console.log('Generating Prisma client...');
execSync('npx prisma generate', { stdio: 'inherit', env: process.env });

if (dbUrl) {
  console.log('Pushing database schema to PostgreSQL database...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', env: process.env });
    console.log('✓ Database schema tables synchronized successfully!');
  } catch (err) {
    console.warn('Notice: Prisma db push finished with note:', err.message);
  }
}

console.log('Building Next.js application...');
execSync('npx next build', { stdio: 'inherit', env: process.env });
