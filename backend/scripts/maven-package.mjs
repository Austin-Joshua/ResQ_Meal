/**
 * Cross-platform: runs Maven wrapper package from backend/ (for fullstack builds on Windows and Unix).
 * Usage (from repo root): node backend/scripts/maven-package.mjs
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const isWin = process.platform === "win32";
const mvnw = isWin ? "mvnw.cmd" : "./mvnw";
const r = spawnSync(mvnw, ["-q", "package", "-DskipTests"], {
  cwd: backendRoot,
  stdio: "inherit",
  shell: isWin,
  env: process.env,
});
process.exit(r.status ?? 1);
