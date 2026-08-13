import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environmental variables from the .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/revenue_intelligence?schema=public";

async function verifyConnection() {
  if (process.env.BYPASS_DB_CHECK === 'true') {
    console.warn("⚠️ Bypassing PostgreSQL connection check for testing UI database failure states.");
    process.exit(0);
  }

  // Use a short timeout of 3 seconds for connection check
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 3000,
  });

  try {
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    console.log("✅ PostgreSQL connection verified successfully.");
    process.exit(0);
  } catch (error: any) {
    console.error(`\n❌ Cannot start: PostgreSQL is not reachable at ${connectionString}. Run docker compose up -d first.\n`);
    process.exit(1);
  }
}

verifyConnection();
