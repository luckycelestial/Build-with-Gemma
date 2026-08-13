import { Client } from 'pg';

const passwords = ["", "admin", "root", "1234", "123456", "password", "postgres", "123", "manager"];

async function findPassword() {
  for (const pw of passwords) {
    console.log(`Testing password: "${pw}"...`);
    const client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: pw,
      database: 'postgres', // try default system db first
      connectionTimeoutMillis: 1000,
    });
    
    try {
      await client.connect();
      await client.end();
      console.log(`\n🎉 SUCCESS! Password is: "${pw}"`);
      process.exit(0);
    } catch (e: any) {
      if (e.message && e.message.includes('password authentication failed')) {
        // Continue testing
      } else {
        console.log(`Connection error with "${pw}":`, e.message);
      }
    }
  }
  console.log("\n❌ Failed to guess password. None of the common passwords worked.");
  process.exit(1);
}

findPassword();
