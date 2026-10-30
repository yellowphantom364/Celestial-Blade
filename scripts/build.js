#!/usr/bin/env node
/**
 * Zero-dependency bundler that concatenates the modular ES6 source tree
 * into dist/bundle.js so the game runs both via HTTP ES modules and direct
 * file:// protocol opening.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const MODULE_ORDER = [
  "src/config/constants.js",
  "src/config/palette.js",
  "src/graphics/PixelFont.js",
  "src/core/SaveManager.js",
  "src/core/InputManager.js",
  "src/core/Camera.js",
  "src/core/PhysicsBody.js",
  "src/core/ParticleSystem.js",
  "src/audio/SoundEngine.js",
  "src/graphics/BackgroundRenderer.js",
  "src/graphics/SpriteRenderer.js",
  "src/entities/Enemy.js",
  "src/entities/Boss.js",
  "src/entities/Player.js",
  "src/world/stages.js",
  "src/world/LevelManager.js",
  "src/ui/HUDRenderer.js",
  "src/core/Game.js",
  "src/main.js"
];

function stripModuleSyntax(code) {
  return code
    .replace(/^\s*import\s+[\s\S]*?from\s+["'][^"']+["'];?\s*$/gm, "")
    .replace(/^\s*export\s+default\s+/gm, "")
    .replace(/^\s*export\s+(const|let|var|function|class)\s+/gm, "$1 ");
}

const chunks = [
  "/**",
  " * Celestial Blade - Compiled Standalone Bundle",
  " * Auto-generated from src/ ES6 modules via `npm run build`.",
  " */",
  "(() => {",
  '  "use strict";'
];

for (const relPath of MODULE_ORDER) {
  const fullPath = path.join(rootDir, relPath);
  const raw = fs.readFileSync(fullPath, "utf8");
  const transformed = stripModuleSyntax(raw).trim();
  chunks.push(`\n  // --- Module: ${relPath} ---\n  ${transformed.replace(/\n/g, "\n  ")}`);
}

chunks.push("})();\n");

const distDir = path.join(rootDir, "dist");
fs.mkdirSync(distDir, { recursive: true });
const outFile = path.join(distDir, "bundle.js");
fs.writeFileSync(outFile, chunks.join("\n"), "utf8");

console.log(`Built ${ path.relative(rootDir, outFile) } (${ fs.statSync(outFile).size } bytes)`);
