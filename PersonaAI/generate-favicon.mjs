import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import puppeteerLottieImport from 'puppeteer-lottie';

const renderLottie =
  puppeteerLottieImport?.default ??
  puppeteerLottieImport ??
  puppeteerLottieImport;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = __dirname;
const publicDir = path.join(projectRoot, 'public');
const lottieJsonPath = path.join(
  publicDir,
  'wired-outline-981-consultation-hover-conversation.json',
);

const existingIcoPath = path.join(projectRoot, 'src', 'app', 'favicon.ico');
const outIcoPath = path.join(publicDir, 'favicon.ico');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

async function main() {
  ensureDir(publicDir);

  // Copy existing ICO into public for best favicon compatibility.
  if (fs.existsSync(existingIcoPath) && !fs.existsSync(outIcoPath)) {
    fs.copyFileSync(existingIcoPath, outIcoPath);
  }

  const targets = [
    { out: 'favicon-32x32.png', width: 32 },
    { out: 'favicon-animated.gif', width: 32 },
    { out: 'apple-touch-icon.png', width: 180 },
    { out: 'android-chrome-192x192.png', width: 192 },
    { out: 'android-chrome-512x512.png', width: 512 },
  ];

  for (const t of targets) {
    const outPath = path.join(publicDir, t.out);
    await renderLottie({
      path: lottieJsonPath,
      output: outPath,
      width: t.width,
      quiet: true,
    });
  }
}

await main();
