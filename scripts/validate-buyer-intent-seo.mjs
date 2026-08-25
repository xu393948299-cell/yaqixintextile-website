#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const excludedDirectories = new Set([".git", ".vercel", "node_modules", "data", "docs", "yaqixin-assets"]);

function htmlFiles(directory = root) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!excludedDirectories.has(entry.name)) files.push(...htmlFiles(path.join(directory, entry.name)));
    } else if (entry.name.endsWith(".html")) {
      files.push(path.join(directory, entry.name));
    }
  }
  return files;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function productNode(value) {
  const candidates = Array.isArray(value?.["@graph"]) ? value["@graph"] : [value];
  return candidates.find((candidate) => candidate?.["@type"] === "Product");
}

function productFromHtml(html) {
  const scripts = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of scripts) {
    try {
      const product = productNode(JSON.parse(match[1]));
      if (product?.sku) return product;
    } catch {
      // Other validators report malformed JSON-LD; keep this check focused on buyer-intent order.
    }
  }
  return null;
}

function plainText(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

const files = htmlFiles();
const products = [];
const failures = [];

for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const product = productFromHtml(html);
  if (!product) continue;

  const slug = path.basename(file, ".html");
  const sku = String(product.sku).trim();
  const skuLead = new RegExp(`^${escapeRegex(sku)}(?:\\s|\\||$)`, "i");
  const title = plainText(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "");
  const h1 = plainText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "");
  const productName = String(product.name || "").trim();

  if (skuLead.test(title)) failures.push(`${path.relative(root, file)}: SKU leads <title>`);
  if (skuLead.test(h1)) failures.push(`${path.relative(root, file)}: SKU leads H1`);
  if (skuLead.test(productName)) failures.push(`${path.relative(root, file)}: SKU leads Product JSON-LD name`);
  if (title.length > 60) failures.push(`${path.relative(root, file)}: title exceeds 60 characters (${title.length})`);

  products.push({ slug, sku });
}

for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  for (const { slug, sku } of products) {
    const anchorPattern = new RegExp(
      `<a\\b[^>]*href=["'](?:https:\\/\\/www\\.yaqixintextile\\.com)?\\/?${escapeRegex(slug)}(?:\\.html)?["'][^>]*>([\\s\\S]*?)<\\/a>`,
      "gi",
    );
    const skuLead = new RegExp(`^${escapeRegex(sku)}(?:\\s|\\||$)`, "i");
    for (const match of html.matchAll(anchorPattern)) {
      if (skuLead.test(plainText(match[1]))) {
        failures.push(`${path.relative(root, file)}: SKU leads internal anchor for /${slug}`);
      }
    }
  }
}

if (failures.length) {
  console.error(`Buyer-intent SEO validation failed with ${failures.length} issue(s):`);
  for (const failure of failures.slice(0, 50)) console.error(`- ${failure}`);
  if (failures.length > 50) console.error(`- ... ${failures.length - 50} more issue(s)`);
  process.exit(1);
}

console.log(
  `Buyer-intent SEO validation passed: ${products.length} Product pages; no SKU-first titles, H1s, Product JSON-LD names, or internal product anchors.`,
);
