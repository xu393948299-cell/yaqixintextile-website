import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

async function collectHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = join(directory, entry.name);
    if (entry.isDirectory() && entry.name !== '.git') return collectHtml(target);
    return entry.isFile() && entry.name.endsWith('.html') ? [target] : [];
  }));
  return nested.flat();
}

const files = await collectHtml(root);
let changed = 0;
for (const file of files) {
  let html = await readFile(file, 'utf8');
  if (html.includes('yaqixin-lead-system.js')) continue;
  const depth = relative(root, file).split(/[\\/]/).length - 1;
  const prefix = depth > 0 ? '../'.repeat(depth) : '';
  const tag = `  <script src="${prefix}yaqixin-assets/yaqixin-lead-system.js" defer></script>\n`;
  if (!html.includes('</body>')) continue;
  html = html.replace('</body>', `${tag}</body>`);
  await writeFile(file, html, 'utf8');
  changed += 1;
}
console.log(`Injected lead system into ${changed} HTML files.`);
