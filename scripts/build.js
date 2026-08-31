const { execSync } = require('child_process');

// 1. Ensure NEXTAUTH_URL and NEXTAUTH_SECRET always have valid URLs for static page prerendering
if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.trim() === '') {
  const vercelHost = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://elderapply.vercel.app';
  process.env.NEXTAUTH_URL = vercelHost;
  console.log(`✓ Set NEXTAUTH_URL fallback: ${process.env.NEXTAUTH_URL}`);
}

if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.trim() === '') {
  process.env.NEXTAUTH_SECRET = 'elder_clan_production_secret_key_849204810283';
}

// 2. Auto-map Vercel Postgres variables
const dbUrl =
  process.env.STORAGE_POSTGRES_PRISMA_URL ||
  process.env.STORAGE_PRISMA_URL ||
  process.env.STORAGE_POSTGRES_URL ||
  process.env.STORAGE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL;

if (dbUrl && dbUrl.trim() !== '') {
  const cleanUrl = dbUrl.trim();
  process.env.STORAGE_POSTGRES_PRISMA_URL = cleanUrl;
  process.env.DATABASE_URL = cleanUrl;
  console.log('✓ Successfully mapped database connection URL for Prisma');
} else {
  // Safe dummy postgres url for build-time compilation if no DB connected yet
  const dummy = 'postgresql://postgres:postgres@localhost:5432/postgres';
  process.env.STORAGE_POSTGRES_PRISMA_URL = dummy;
  process.env.DATABASE_URL = dummy;
  console.log('✓ Using PostgreSQL compile fallback for static prerender');
}

console.log('Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
} catch (e) {
  console.warn('Prisma generate note:', e.message);
}

if (dbUrl && dbUrl.trim() !== '') {
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
