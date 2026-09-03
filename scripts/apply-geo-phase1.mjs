#!/usr/bin/env node
/**
 * Applies deterministic GEO Phase 1 entity and navigation normalization.
 *
 * This is intentionally a source transformer for the static site: public
 * email, safe entity wording and the Inquiry route are configured centrally
 * instead of hand-edited in individual pages.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const company = JSON.parse(fs.readFileSync(path.join(root, 'data', 'company.json'), 'utf8'));
const write = process.argv.includes('--write');
const exclusions = new Set(['.git', '.vercel', 'data', 'docs', 'yaqixin-assets']);

function htmlFiles(directory = root) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!exclusions.has(entry.name)) files.push(...htmlFiles(path.join(directory, entry.name)));
    } else if (entry.name.endsWith('.html')) {
      files.push(path.join(directory, entry.name));
    }
  }
  return files;
}

function replaceAll(text, pairs) {
  let result = text;
  for (const [from, to] of pairs) result = result.split(from).join(to);
  return result;
}

function directMenuAnchors(nav) {
  const menu = /<div\b[^>]*class=["'][^"']*\bmenu\b[^"']*["'][^>]*>/i.exec(nav);
  if (!menu) return null;
  const tokens = /<\/?div\b[^>]*>|<a\b[^>]*>[\s\S]*?<\/a>/gi;
  tokens.lastIndex = menu.index + menu[0].length;
  const anchors = [];
  let depth = 1;
  let match;
  while ((match = tokens.exec(nav))) {
    const token = match[0];
    if (/^<div\b/i.test(token)) {
      depth += 1;
      continue;
    }
    if (/^<\/div/i.test(token)) {
      depth -= 1;
      if (depth === 0) break;
      continue;
    }
    if (depth === 1) anchors.push({ start: match.index, end: match.index + token.length });
  }
  return { anchors, productMenu: /class=["'][^"']*\bproduct-menu\b/i.test(nav.slice(menu.index, tokens.lastIndex)) };
}

function updateNavigation(text, isSpanish) {
  const navStart = text.search(/<nav\b/i);
  if (navStart === -1) return text;
  const navEndMarker = text.indexOf('</nav>', navStart);
  if (navEndMarker === -1) return text;
  const navEnd = navEndMarker + '</nav>'.length;
  const nav = text.slice(navStart, navEnd);
  const menu = directMenuAnchors(nav);
  if (!menu || menu.anchors.length < 2) return text;

  const contactLabel = 'Inquiry';
  const aboutLabel = isSpanish ? 'Sobre nosotros' : 'About Us';
  const customLabel = isSpanish ? 'Capacidad personalizada' : 'Custom Capability';
  const directLinks = menu.productMenu
    ? `<a href="/custom-capability">${customLabel}</a><a href="/about-us">${aboutLabel}</a><a href="/blog">Blog</a><a href="/inquiry">${contactLabel}</a>`
    : `<a href="/all-products">Products</a><a href="/custom-capability">${customLabel}</a><a href="/about-us">${aboutLabel}</a><a href="/blog">Blog</a><a href="/inquiry">${contactLabel}</a>`;
  const first = menu.anchors[1];
  const last = menu.anchors[menu.anchors.length - 1];
  const rewrittenNav = `${nav.slice(0, first.start)}${directLinks}${nav.slice(last.end)}`;
  return `${text.slice(0, navStart)}${rewrittenNav}${text.slice(navEnd)}`;
}

function transform(text, relativePath) {
  const isSpanish = relativePath.split(path.sep).includes('es');
  const entityPairs = [
    ['Wholesale Fabric Manufacturer', 'Wholesale Fabric Supplier'],
    ['wholesale fabric manufacturer', 'wholesale fabric supplier'],
    ['Fabric Manufacturer', 'Fabric Supplier'],
    ['Fabric manufacturer', 'Fabric supplier'],
    ['fabric manufacturer', 'fabric supplier'],
    ['Textile Manufacturer', 'Fabric Sourcing Team'],
    ['Textile manufacturer', 'Fabric sourcing team'],
    ['textile manufacturer', 'fabric sourcing team'],
    ['Factory-backed sourcing', 'Supplier-coordinated sourcing'],
    ['factory-backed sourcing', 'supplier-coordinated sourcing'],
    ['Factory-backed', 'Supplier-coordinated'],
    ['factory-backed', 'supplier-coordinated'],
    ['Factory strength', 'Supply coordination'],
    ['factory strength', 'supply coordination'],
    ['Real factory & stock capacity', 'Stock and supply context'],
    ['real factory & stock capacity', 'stock and supply context'],
    ['Real factory', 'Visible stock'],
    ['real factory', 'visible stock'],
    ['factory and stock images', 'stock and sourcing images'],
    ['Factory and stock images', 'Stock and sourcing images'],
    ['factory images', 'stock imagery'],
    ['Factory images', 'Stock imagery'],
    ['Factory experience', 'Buyer support'],
    ['factory experience', 'buyer support'],
    ['15+ years', 'Sourcing support'],
    ['900,000m+ / month', 'Order-based planning'],
    ['900,000m+', 'Order-based planning'],
    ['7-day design completion', 'buyer brief review'],
    ['7-Day Design', 'Brief Review'],
    ['Fabricante mayorista de telas', 'Proveedor mayorista de telas'],
    ['fabricante mayorista de telas', 'proveedor mayorista de telas'],
    ['Fabricante de telas', 'Proveedor de telas'],
    ['fabricante de telas', 'proveedor de telas']
  ];
  let output = replaceAll(text, entityPairs);

  const activeEmail = company.publicEmail.value;
  output = output.split('sales@yaqixintextile.com').join(activeEmail);
  if (!company.futurePublicEmail.display && company.futurePublicEmail.value) {
    output = output.split(company.futurePublicEmail.value).join(activeEmail);
  }
  if (Array.isArray(company.sameAs) && company.sameAs.length) {
    output = output.replace(/"sameAs"\s*:\s*\[[\s\S]*?\]/g, `"sameAs":${JSON.stringify(company.sameAs)}`);
  }
  output = updateNavigation(output, isSpanish);
  return output;
}

function remainingViolations(text) {
  const checks = [
    /\b(?:Wholesale Fabric Manufacturer|Fabric manufacturer|Factory-backed sourcing|Factory strength|Real factory & stock capacity)\b/i,
    /900,000m\+|15\+ years/i,
    /<a\b[^>]*href=["']\/?#inquiry["'][^>]*>\s*(?:Inquiry|Contact|Consulta)\s*<\/a>/i
  ];
  return checks.filter((check) => check.test(text)).length;
}

const changed = [];
const unresolved = [];
for (const file of htmlFiles()) {
  const original = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file);
  const next = transform(original, relative);
  if (next !== original) {
    changed.push(relative);
    if (write) fs.writeFileSync(file, next);
  }
  const checkText = write ? next : original;
  const violations = remainingViolations(checkText);
  if (violations) unresolved.push(`${relative} (${violations})`);
}

console.log(`${write ? 'Updated' : 'Would update'} ${changed.length} HTML file(s) from data/company.json.`);
if (unresolved.length) {
  console.error(`Remaining GEO entity/navigation violations: ${unresolved.length}`);
  console.error(unresolved.slice(0, 20).join('\n'));
  process.exitCode = 1;
}
