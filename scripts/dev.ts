import { spawn, ChildProcess } from 'child_process';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { Client } from 'pg';

dotenv.config({ path: path.join(__dirname, '../.env') });

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma4:cloud";
let ollamaProcess: ChildProcess | null = null;
let spawnedOllama = false;

function checkOllamaRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get("http://localhost:11434/api/tags", (res) => {
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function cleanupAndExit(code = 0) {
  if (spawnedOllama && ollamaProcess) {
    console.log(`\n🛑 Shutting down Ollama (${OLLAMA_MODEL})...`);
    try {
      if (process.platform === 'win32') {
        spawn("taskkill", ["/F", "/IM", "ollama.exe", "/T"], { shell: true });
      } else {
        ollamaProcess.kill('SIGTERM');
      }
      console.log("✅ Ollama shut down successfully.");
    } catch (err: any) {
      console.warn("Notice during Ollama cleanup:", err.message);
    }
  }
  process.exit(code);
}

async function startDev() {
  console.log("--------------------------------------------------");
  console.log("🚀 STARTING DEVELOPMENT ENVIRONMENT");
  console.log("--------------------------------------------------");

  // 1. Verify PostgreSQL Database
  const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/revenue_intelligence?schema=public";
  const pgClient = new Client({ connectionString, connectionTimeoutMillis: 3000 });
  try {
    await pgClient.connect();
    await pgClient.query('SELECT 1');
    await pgClient.end();
    console.log("✅ PostgreSQL connection verified successfully.");
  } catch (err) {
    console.error(`❌ Cannot start: PostgreSQL is not reachable at ${connectionString}. Run docker compose up -d first.`);
    process.exit(1);
  }

  // 2. Check AI Engine Mode (Groq API LPU vs Local Ollama Fallback)
  if (process.env.GROQ_API_KEY) {
    console.log(`⚡ [AI Engine] Powered by Groq API LPU (${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'}). Local Ollama startup bypassed.`);
  } else {
    // Only check/start Ollama if GROQ_API_KEY is not configured
    const isRunning = await checkOllamaRunning();
    if (isRunning) {
      console.log(`🦙 Ollama server is online at http://localhost:11434`);
    } else {
      console.log(`🦙 GROQ_API_KEY missing. Starting Ollama (${OLLAMA_MODEL}) fallback automatically...`);
      ollamaProcess = spawn("ollama", ["run", OLLAMA_MODEL], {
        shell: true,
        stdio: "pipe"
      });
      spawnedOllama = true;

      await new Promise(res => setTimeout(res, 2500));
      console.log(`✅ Ollama (${OLLAMA_MODEL}) fallback launched successfully.`);
    }
  }

  // 3. Attach signal listeners for graceful shutdown
  let cleaningUp = false;
  const handleSignal = (signal: string) => {
    if (cleaningUp) return;
    cleaningUp = true;
    console.log(`\n⏹️ Received ${signal}. Stopping dev server...`);
    cleanupAndExit(0);
  };

  process.on('SIGINT', () => handleSignal('SIGINT'));
  process.on('SIGTERM', () => handleSignal('SIGTERM'));

  // 4. Start Next.js dev server
  console.log("⚡ Launching Next.js Dev Server...\n");
  const nextDev = spawn("npx", ["next", "dev"], {
    shell: true,
    stdio: "inherit",
    env: process.env
  });

  nextDev.on('exit', (code) => {
    if (!cleaningUp) {
      cleaningUp = true;
      cleanupAndExit(code || 0);
    }
  });
}

startDev();
