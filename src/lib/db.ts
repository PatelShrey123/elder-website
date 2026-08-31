import { Pool } from "pg";
import crypto from "crypto";

function findDatabaseUrl(): string | undefined {
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

  for (const val of candidates) {
    if (val && (val.startsWith("postgresql://") || val.startsWith("postgres://"))) {
      return val.trim();
    }
  }

  for (const [k, v] of Object.entries(process.env)) {
    if (typeof v === "string" && (v.startsWith("postgresql://") || v.startsWith("postgres://"))) {
      return v.trim();
    }
  }

  return undefined;
}

const activeUrl = findDatabaseUrl();

declare global {
  var pgPoolGlobal: Pool | undefined;
}

let pool: Pool | null = null;

if (activeUrl) {
  if (!globalThis.pgPoolGlobal) {
    globalThis.pgPoolGlobal = new Pool({
      connectionString: activeUrl,
      ssl: { rejectUnauthorized: false },
      max: 10,
    });
  }
  pool = globalThis.pgPoolGlobal;
}

// In-memory fallback
declare global {
  var inMemoryAppsGlobal: any[] | undefined;
  var inMemorySettingsGlobal: any | undefined;
}
if (!globalThis.inMemoryAppsGlobal) {
  globalThis.inMemoryAppsGlobal = [];
}
if (!globalThis.inMemorySettingsGlobal) {
  globalThis.inMemorySettingsGlobal = {
    slotsLimit: 20,
    trainers: JSON.stringify([
      { name: "[EGD]Fabin #KB4ACS", region: "GLOBAL" },
      { name: "Carson/CertifiedLoser #V90LM3", region: "ASIA" },
      { name: "Elena #VRVXZT", region: "ASIA" },
      { name: "Ghoul #OM2Z2I", region: "ASIA" },
      { name: "ElderGoonerDih #GNCCHM", region: "ASIA" },
      { name: "NEKKI #FUYR7K", region: "ASIA" },
      { name: "Sylkie #7FRZOY", region: "ASIA" },
      { name: "Intrepidus #T2D70P", region: "ASIA" },
      { name: "S_A_N_T_I #69I3DV", region: "EU" },
      { name: "LuigiToan #ZSCKH5", region: "ASIA" },
    ]),
  };
}

let tableInitialized = false;
async function ensureTable() {
  if (!pool || tableInitialized) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Application" (
        "id" TEXT PRIMARY KEY,
        "discordId" TEXT NOT NULL,
        "discordUsername" TEXT NOT NULL,
        "discordGlobalName" TEXT,
        "discordAvatar" TEXT,
        "kirkaId" TEXT NOT NULL,
        "weeklyXp" INTEGER NOT NULL,
        "previousClan" TEXT,
        "whyLeft" TEXT,
        "whyJoin" TEXT NOT NULL,
        "screenshotPath" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "decisionReason" TEXT,
        "decidedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "SystemSettings" (
        "id" TEXT PRIMARY KEY DEFAULT 'config',
        "slotsLimit" INTEGER NOT NULL DEFAULT 20,
        "trainers" TEXT NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    tableInitialized = true;
  } catch (err) {
    console.warn("Table initialization note:", err);
  }
}

export interface CreateAppParams {
  discordId: string;
  discordUsername: string;
  discordGlobalName?: string | null;
  discordAvatar?: string | null;
  kirkaId: string;
  weeklyXp: number;
  previousClan?: string | null;
  whyLeft?: string | null;
  whyJoin: string;
  screenshotPath: string;
  status?: string;
}

export const db = {
  async createApplication(data: CreateAppParams) {
    const id = `app_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const now = new Date();

    if (pool) {
      try {
        await ensureTable();
        const query = `
          INSERT INTO "Application" (
            "id", "discordId", "discordUsername", "discordGlobalName", "discordAvatar",
            "kirkaId", "weeklyXp", "previousClan", "whyLeft", "whyJoin",
            "screenshotPath", "status", "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING *;
        `;
        const values = [
          id,
          data.discordId,
          data.discordUsername,
          data.discordGlobalName || null,
          data.discordAvatar || null,
          data.kirkaId,
          data.weeklyXp,
          data.previousClan || null,
          data.whyLeft || null,
          data.whyJoin,
          data.screenshotPath,
          data.status || "PENDING",
          now,
          now,
        ];
        const res = await pool.query(query, values);
        if (res.rows && res.rows[0]) {
          return res.rows[0];
        }
      } catch (err) {
        console.error("Postgres INSERT error, saving to memory fallback:", err);
      }
    }

    const memoryApp = {
      id,
      ...data,
      status: data.status || "PENDING",
      createdAt: now,
      updatedAt: now,
    };
    globalThis.inMemoryAppsGlobal?.unshift(memoryApp);
    return memoryApp;
  },

  async getApplications(statusFilter?: string | null) {
    if (pool) {
      try {
        await ensureTable();
        let query = `SELECT * FROM "Application" ORDER BY "createdAt" DESC;`;
        let values: any[] = [];
        if (statusFilter) {
          query = `SELECT * FROM "Application" WHERE "status" = $1 ORDER BY "createdAt" DESC;`;
          values = [statusFilter];
        }
        const res = await pool.query(query, values);
        return res.rows || [];
      } catch (err) {
        console.error("Postgres SELECT error, returning memory fallback:", err);
      }
    }

    let apps = globalThis.inMemoryAppsGlobal || [];
    if (statusFilter) {
      apps = apps.filter((a) => a.status === statusFilter);
    }
    return apps;
  },

  async getApplicationById(id: string) {
    if (pool) {
      try {
        await ensureTable();
        const res = await pool.query(`SELECT * FROM "Application" WHERE "id" = $1 LIMIT 1;`, [id]);
        if (res.rows && res.rows[0]) return res.rows[0];
      } catch (err) {
        console.error("Postgres SELECT by ID error:", err);
      }
    }

    return globalThis.inMemoryAppsGlobal?.find((a) => a.id === id) || null;
  },

  async updateApplicationStatus(id: string, status: string, decisionReason?: string | null) {
    const now = new Date();
    if (pool) {
      try {
        await ensureTable();
        const res = await pool.query(
          `UPDATE "Application" SET "status" = $1, "decisionReason" = $2, "decidedAt" = $3, "updatedAt" = $4 WHERE "id" = $5 RETURNING *;`,
          [status, decisionReason || null, now, now, id]
        );
        if (res.rows && res.rows[0]) return res.rows[0];
      } catch (err) {
        console.error("Postgres UPDATE error:", err);
      }
    }

    const app = globalThis.inMemoryAppsGlobal?.find((a) => a.id === id);
    if (app) {
      app.status = status;
      app.decisionReason = decisionReason || null;
      app.decidedAt = now;
      app.updatedAt = now;
      return app;
    }
    return null;
  },

  async countMonthlyApplications(discordId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (pool) {
      try {
        await ensureTable();
        const res = await pool.query(
          `SELECT COUNT(*) FROM "Application" WHERE "discordId" = $1 AND "createdAt" >= $2;`,
          [discordId, startOfMonth]
        );
        if (res.rows && res.rows[0]) {
          return parseInt(res.rows[0].count, 10) || 0;
        }
      } catch (err) {
        console.error("Postgres COUNT error:", err);
      }
    }

    return (
      globalThis.inMemoryAppsGlobal?.filter(
        (a) => a.discordId === discordId && new Date(a.createdAt) >= startOfMonth
      ).length || 0
    );
  },

  async getSettings() {
    if (pool) {
      try {
        await ensureTable();
        const res = await pool.query(`SELECT * FROM "SystemSettings" WHERE "id" = 'config' LIMIT 1;`);
        if (res.rows && res.rows[0]) return res.rows[0];
      } catch (err) {
        console.error("Postgres Settings SELECT error:", err);
      }
    }
    return globalThis.inMemorySettingsGlobal;
  },

  async upsertSettings(slotsLimit: number, trainersJson: string) {
    const now = new Date();
    if (pool) {
      try {
        await ensureTable();
        const query = `
          INSERT INTO "SystemSettings" ("id", "slotsLimit", "trainers", "updatedAt")
          VALUES ('config', $1, $2, $3)
          ON CONFLICT ("id") DO UPDATE SET "slotsLimit" = $1, "trainers" = $2, "updatedAt" = $3
          RETURNING *;
        `;
        const res = await pool.query(query, [slotsLimit, trainersJson, now]);
        if (res.rows && res.rows[0]) return res.rows[0];
      } catch (err) {
        console.error("Postgres Settings UPSERT error:", err);
      }
    }
    globalThis.inMemorySettingsGlobal = { slotsLimit, trainers: trainersJson };
    return globalThis.inMemorySettingsGlobal;
  },

  async getExpiredApplications(olderThanDate: Date) {
    if (pool) {
      try {
        await ensureTable();
        const res = await pool.query(
          `SELECT "id", "screenshotPath" FROM "Application" WHERE "status" IN ('ACCEPTED', 'REJECTED') AND "decidedAt" <= $1;`,
          [olderThanDate]
        );
        return res.rows || [];
      } catch (err) {
        console.error("Postgres Expired SELECT error:", err);
      }
    }
    return (
      globalThis.inMemoryAppsGlobal
        ?.filter((a) => (a.status === "ACCEPTED" || a.status === "REJECTED") && new Date(a.decidedAt) <= olderThanDate)
        .map((a) => ({ id: a.id, screenshotPath: a.screenshotPath })) || []
    );
  },

  async deleteApplicationsByIds(ids: string[]) {
    if (ids.length === 0) return 0;
    if (pool) {
      try {
        await ensureTable();
        const res = await pool.query(`DELETE FROM "Application" WHERE "id" = ANY($1::text[]);`, [ids]);
        return res.rowCount || 0;
      } catch (err) {
        console.error("Postgres DELETE error:", err);
      }
    }
    const initialLen = globalThis.inMemoryAppsGlobal?.length || 0;
    globalThis.inMemoryAppsGlobal = globalThis.inMemoryAppsGlobal?.filter((a) => !ids.includes(a.id));
    return initialLen - (globalThis.inMemoryAppsGlobal?.length || 0);
  },
};

export default db;
