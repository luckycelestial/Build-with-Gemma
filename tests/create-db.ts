import { Client } from 'pg';

const connectionString = "postgresql://postgres:salmon%4011@localhost:5432/postgres";

async function createDatabase() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("✅ Successfully connected to default postgres database.");
    
    // Check if target database exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname='revenue_intelligence'");
    if (res.rows.length === 0) {
      console.log("Database 'revenue_intelligence' does not exist. Creating...");
      await client.query("CREATE DATABASE revenue_intelligence");
      console.log("✅ Database 'revenue_intelligence' created successfully.");
    } else {
      console.log("✅ Database 'revenue_intelligence' already exists.");
    }
    
    await client.end();
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Failed to connect or create database:", error.message);
    process.exit(1);
  }
}

createDatabase();
