/**
 * Loads backend/.env into process.env and runs ./mvnw spring-boot:run.
 * Usage (from repo root): npm run dev:backend
 * Usage (from backend):   node scripts/run-spring.mjs
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const envPath = path.join(backendRoot, ".env");

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
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
    if (key && process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadDotEnv(envPath);

const isWin = process.platform === "win32";
const mvnw = isWin ? "mvnw.cmd" : "./mvnw";
/** Keep Maven’s own JVM small so dev machines with tight page files can still launch the app JVM. */
/** One JVM (fork=false): give Maven enough headroom for Spring Boot + Tomcat + Netty Socket.IO */
const mavenOpts = [process.env.MAVEN_OPTS, "-Xshare:off -Xms128m -Xmx768m"].filter(Boolean).join(" ").trim();
const child = spawn(mvnw, ["spring-boot:run"], {
  cwd: backendRoot,
  stdio: "inherit",
  shell: isWin,
  env: { ...process.env, MAVEN_OPTS: mavenOpts },
});

child.on("exit", (code) => process.exit(code ?? 0));
