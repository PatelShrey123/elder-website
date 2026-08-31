import { PrismaClient } from "@prisma/client";

function findDatabaseUrl(): string {
  // 1. Check direct common names
  const directCandidates = [
    process.env.DATABASE_URL,
    process.env.STORAGE_POSTGRES_PRISMA_URL,
    process.env.STORAGE_PRISMA_URL,
    process.env.STORAGE_POSTGRES_URL,
    process.env.STORAGE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ];

  for (const val of directCandidates) {
    if (val && (val.startsWith("postgresql://") || val.startsWith("postgres://"))) {
      return val.trim();
    }
  }

  // 2. Scan all environment variables dynamically
  for (const [k, v] of Object.entries(process.env)) {
    if (typeof v === "string" && (v.startsWith("postgresql://") || v.startsWith("postgres://"))) {
      return v.trim();
    }
  }

  return "postgresql://postgres:postgres@localhost:5432/postgres";
}

const activeUrl = findDatabaseUrl();
process.env.DATABASE_URL = activeUrl;

const prismaClientSingleton = () => {
  try {
    return new PrismaClient({
      datasources: {
        db: {
          url: activeUrl,
        },
      },
    });
  } catch {
    return new PrismaClient();
  }
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
