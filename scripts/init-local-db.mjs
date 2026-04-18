/**
 * Ensures MySQL has `resqmeal_db` and `database/database.sql` applied (idempotent).
 * Uses the Docker `mysql:8.0` CLI image to connect to the host DB (no local mysql.exe required).
 * Reads connection settings from backend/.env (same keys as Spring Boot).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const envPath = path.join(repoRoot, "backend", ".env");
const schemaPath = path.join(repoRoot, "database", "database.sql");

function loadDotEnv(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key) out[key] = val;
  }
  return out;
}

function dockerOk() {
  const r = spawnSync("docker", ["info"], {
    encoding: "utf8",
    windowsHide: true,
  });
  return r.status === 0;
}

const fileEnv = loadDotEnv(envPath);
const host = fileEnv.DB_HOST || process.env.DB_HOST || "localhost";
const port = String(fileEnv.DB_PORT || process.env.DB_PORT || "3306");
const user = fileEnv.DB_USER || process.env.DB_USER || "root";
const pass = fileEnv.DB_PASSWORD ?? process.env.DB_PASSWORD ?? "";
const dbName = fileEnv.DB_NAME || process.env.DB_NAME || "resqmeal_db";

/** Docker CLI reaches the host MySQL from a container (Desktop: host.docker.internal). */
const mysqlHost =
  host === "localhost" || host === "127.0.0.1" ? "host.docker.internal" : host;

function runDockerMysql({ args, input = null }) {
  const dockerArgs = [
    "run",
    "--rm",
    ...(input != null ? ["-i"] : []),
    "mysql:8.0",
    "mysql",
    "-h",
    mysqlHost,
    "-P",
    port,
    "-u",
    user,
    `-p${pass}`,
    ...args,
  ];
  const r = spawnSync("docker", dockerArgs, {
    input,
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
    windowsHide: true,
  });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout || "docker mysql failed");
    process.exit(r.status ?? 1);
  }
  return (r.stdout || "").trim();
}

if (!dockerOk()) {
  console.error(
    "[db:init] Docker is not running or not reachable. Start Docker Desktop, or create/import the DB manually."
  );
  process.exit(1);
}

if (!fs.existsSync(schemaPath)) {
  console.error(`[db:init] Missing schema file: ${schemaPath}`);
  process.exit(1);
}

if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
  console.error("[db:init] DB_NAME must contain only letters, digits, and underscores.");
  process.exit(1);
}

runDockerMysql({
  args: ["-e", `CREATE DATABASE IF NOT EXISTS ${dbName};`],
});

const countOut = runDockerMysql({
  args: [
    "-N",
    "-B",
    "-e",
    `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${dbName.replace(/'/g, "''")}';`,
  ],
});
const tableCount = parseInt(countOut.split(/\s/).filter(Boolean)[0] || "0", 10);

if (Number.isNaN(tableCount) || tableCount < 0) {
  console.error("[db:init] Could not read table count from MySQL.");
  process.exit(1);
}

if (tableCount === 0) {
  const sql = fs.readFileSync(schemaPath, "utf8");
  runDockerMysql({ args: [dbName], input: sql });
  console.log(`[db:init] Imported schema into ${dbName}.`);
} else {
  console.log(
    `[db:init] ${dbName} already has ${tableCount} tables — schema import skipped.`
  );
}
