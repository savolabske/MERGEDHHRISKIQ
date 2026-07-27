#!/usr/bin/env node
/**
 * Adoption guardrail: reports raw <button> vs shared Button / interaction recipes.
 * Run: node scripts/check-interaction-adoption.mjs
 * Exit 0 always (informational). Use in PR review; tighten later if desired.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');

async function walk(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'ui') continue;
      await walk(path, files);
    } else if (/\.(tsx|jsx)$/.test(entry.name)) {
      files.push(path);
    }
  }
  return files;
}

const files = await walk(SRC);
let rawButtons = 0;
let buttonImports = 0;
let interactionImports = 0;
const hotFiles = [];

for (const file of files) {
  const text = await readFile(file, 'utf8');
  const raw = (text.match(/<button\b/g) || []).length;
  const usesButton = /from ['"].*\/ui\/button['"]/.test(text);
  const usesInteraction = /from ['"].*\/ui\/interaction['"]/.test(text);
  if (usesButton) buttonImports += 1;
  if (usesInteraction) interactionImports += 1;
  if (raw > 0) {
    rawButtons += raw;
    if (raw >= 8) {
      hotFiles.push({ file: relative(ROOT, file), raw });
    }
  }
}

hotFiles.sort((a, b) => b.raw - a.raw);

console.log('Interaction adoption report');
console.log('--------------------------');
console.log(`Raw <button> occurrences (outside ui/): ${rawButtons}`);
console.log(`Files importing ui/button:             ${buttonImports}`);
console.log(`Files importing ui/interaction:        ${interactionImports}`);
console.log('');
console.log('Highest raw-button files (migrate opportunistically):');
for (const row of hotFiles.slice(0, 15)) {
  console.log(`  ${row.raw.toString().padStart(3)}  ${row.file}`);
}
console.log('');
console.log('See guidelines/Guidelines.md — prefer Button / ui/interaction recipes.');
