import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL || "";

const isCloudDb =
  connectionString.includes("supabase.com") ||
  connectionString.includes("sslmode=require") ||
  connectionString.includes("pooler.supabase.com");

const pool = new Pool({
  connectionString: connectionString || undefined,
  ssl: isCloudDb ? { rejectUnauthorized: false } : undefined,
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.PRISMA_LOG_QUERY === "true" ? ["query", "error", "warn"] : ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export * from "@prisma/client";

