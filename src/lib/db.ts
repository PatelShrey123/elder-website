import { PrismaClient } from "@prisma/client";

// Ensure DATABASE_URL is mapped from Vercel Postgres variables if needed
if (!process.env.DATABASE_URL) {
  const vercelUrl = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.STORAGE_URL;
  if (vercelUrl) {
    process.env.DATABASE_URL = vercelUrl;
  }
}

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
