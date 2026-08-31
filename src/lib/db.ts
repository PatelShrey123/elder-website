import { PrismaClient } from "@prisma/client";

function getPostgresUrl(): string | undefined {
  const candidates = [
    process.env.STORAGE_POSTGRES_PRISMA_URL,
    process.env.STORAGE_PRISMA_URL,
    process.env.STORAGE_POSTGRES_URL,
    process.env.STORAGE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.DATABASE_URL,
  ];

  // Pick the first valid postgres url
  for (const url of candidates) {
    if (url && (url.startsWith("postgresql://") || url.startsWith("postgres://"))) {
      return url.trim();
    }
  }

  return undefined;
}

const activeDbUrl = getPostgresUrl();

if (activeDbUrl) {
  process.env.DATABASE_URL = activeDbUrl;
}

const prismaClientSingleton = () => {
  if (activeDbUrl) {
    return new PrismaClient({
      datasources: {
        db: {
          url: activeDbUrl,
        },
      },
    });
  }
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
