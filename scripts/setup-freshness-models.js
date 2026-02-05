#!/usr/bin/env node
/**
 * Download pre-trained freshness ML models from the official GitHub repos
 * referenced in docs/FRESHNESS_REFERENCES.md so the Fresh Food Checker can use
 * real ML instead of mock data.
 *
 * Uses: fruit-veg-freshness-ai, Freshness-Detector (TFLite), freshvision.
 * Run from repo root: node scripts/setup-freshness-models.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT = path.resolve(__dirname, '..');
const ML = path.join(ROOT, 'ml-services');
const TMP = path.join(ROOT, '.freshness-models-tmp');

const CONFIGS = [
  {
    name: 'fruit-veg-freshness-ai',
    repo: 'https://github.com/captraj/fruit-veg-freshness-ai.git',
    cloneDir: 'fruit-veg-freshness-ai',
    src: 'rottenvsfresh98pval.h5',
    destDir: path.join(ML, 'fruit-veg-freshness'),
    destFile: 'rottenvsfresh98pval.h5',
  },
  {
    name: 'Freshness-Detector (TFLite)',
    repo: 'https://github.com/Kayuemkhan/Freshness-Detector.git',
    cloneDir: 'Freshness-Detector',
    src: path.join('app', 'src', 'main', 'ml', 'model.tflite'),
    destDir: path.join(ML, 'freshness-detector-tflite'),
    destFile: 'model.tflite',
  },
  {
    name: 'freshvision',
    repo: 'https://github.com/devdezzies/freshvision.git',
    cloneDir: 'freshvision',
    src: path.join('models', 'effnetb0_freshvisionv0_10_epochs.pt'),
    destDir: path.join(ML, 'freshvision', 'models'),
    destFile: 'effnetb0_freshvisionv0_10_epochs.pt',
  },
];

function run(cmd, opts = {}) {
  try {
    execSync(cmd, { stdio: 'inherit', ...opts });
  } catch (e) {
    if (e.status !== undefined) process.exit(e.status);
    throw e;
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function main() {
  console.log('ResQ Meal: Setting up freshness ML models from GitHub...\n');

  ensureDir(TMP);
  const isWindows = process.platform === 'win32';
  const git = isWindows ? 'git' : 'git';

  for (const cfg of CONFIGS) {
    const destPath = path.join(cfg.destDir, cfg.destFile);
    if (fs.existsSync(destPath)) {
      console.log(`[SKIP] ${cfg.name}: already exists at ${path.relative(ROOT, destPath)}\n`);
      continue;
    }

    const clonePath = path.join(TMP, cfg.cloneDir);
    if (fs.existsSync(clonePath)) {
      console.log(`[CLEAN] Removing previous clone ${cfg.cloneDir}`);
      fs.rmSync(clonePath, { recursive: true, force: true });
    }

    console.log(`[CLONE] ${cfg.name}...`);
    run(`git clone --depth 1 "${cfg.repo}" "${clonePath}"`, { cwd: ROOT });

    const srcPath = path.join(clonePath, cfg.src);
    if (!fs.existsSync(srcPath)) {
      console.error(`[ERROR] ${cfg.name}: file not found: ${cfg.src}`);
      process.exit(1);
    }

    ensureDir(cfg.destDir);
    fs.copyFileSync(srcPath, destPath);
    console.log(`[OK] ${cfg.name} -> ${path.relative(ROOT, destPath)}\n`);

    fs.rmSync(clonePath, { recursive: true, force: true });
  }

  if (fs.existsSync(TMP)) fs.rmSync(TMP, { recursive: true, force: true });
  console.log('Done. Next steps:');
  console.log('  1. Start one or more ML services (see ml-services/*/README.md).');
  console.log('  2. In backend/.env set the matching URL(s), e.g. FRESHNESS_AI_URL=http://localhost:8000');
  console.log('  3. Environment-based checks: run food-freshness-analyzer and set FRESHNESS_ENV_AI_URL=http://localhost:8001');
}

main();
