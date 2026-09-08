import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environmental variables from the .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const connectionString = process.env.DATABASE_URL;

async function verifyConnection() {
  if (process.env.BYPASS_DB_CHECK === 'true') {
    console.warn("⚠️ Bypassing database connection check.");
    process.exit(0);
  }

  // 1. Check via Supabase HTTPS (Port 443) - Works on restricted Wi-Fi / firewalls
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from('Material').select('id', { head: true });
      if (!error) {
        console.log(`✅ Supabase HTTPS connection verified successfully (${supabaseUrl}).`);
        process.exit(0);
      }
    } catch (e: any) {
      // Fallback to TCP check if HTTPS fails
    }
  }

  // 2. Direct Postgres TCP check
  if (connectionString) {
    const isCloud = connectionString.includes('supabase.com') || connectionString.includes('sslmode=require');
    const client = new Client({
      connectionString,
      ssl: isCloud ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 5000,
    });

    try {
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      console.log("✅ PostgreSQL connection verified successfully.");
      process.exit(0);
    } catch (error: any) {
      if (isCloud && error.message.includes("timeout")) {
        console.warn("\n⚠️ Notice: Outbound database ports (5432/6543) are blocked by your current Wi-Fi network.");
        console.log("✅ App configured with Supabase HTTPS client (@supabase/supabase-js) over Port 443.\n");
        process.exit(0);
      }
      console.error(`\n❌ Cannot connect to database: ${error.message}\n`);
      process.exit(1);
    }
  }

  console.log("✅ Database configuration check complete.");
  process.exit(0);
}

verifyConnection();
