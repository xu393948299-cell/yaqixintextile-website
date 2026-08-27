import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shouldWrite = process.argv.includes("--write");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "data", "products.json"), "utf8"));
const products = Array.isArray(catalog.products) ? catalog.products : catalog;

function visibleText(source) {
  return source
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, value) => String.fromCodePoint(Number(value)))
    .replace(/&#x([\da-f]+);/gi, (_, value) => String.fromCodePoint(parseInt(value, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

function faqPageSchema(html, file) {
  const section = html.match(/<section\b(?=[^>]*\bid=["']faq["'])[^>]*>([\s\S]*?)<\/section>/i);
  if (!section) throw new Error(file + ": visible #faq section was not found");

  const mainEntity = [];
  const questionPatterns = [
    /<details\b(?=[^>]*\bclass=["'][^"']*\bfaq\b[^"']*["'])[^>]*>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>\s*<p\b[^>]*>([\s\S]*?)<\/p>\s*<\/details>/gi,
    /<(?:article|div)\b(?=[^>]*\bclass=["'][^"']*\bfaq\b[^"']*["'])[^>]*>\s*<h3\b[^>]*>([\s\S]*?)<\/h3>\s*<p\b[^>]*>([\s\S]*?)<\/p>\s*<\/(?:article|div)>/gi,
  ];
  let match;
  for (const questionPattern of questionPatterns) {
    while ((match = questionPattern.exec(section[1]))) {
      const name = visibleText(match[1]);
      const text = visibleText(match[2]);
      if (!name || !text) throw new Error(file + ": FAQ question or answer is empty");
      mainEntity.push({
        "@type": "Question",
        name,
        acceptedAnswer: { "@type": "Answer", text },
      });
    }
  }
  if (!mainEntity.length) throw new Error(file + ": no visible FAQ entries were parsed");

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}

function existingFaqPageSchemas(html, file) {
  const results = [];
  const scriptPattern = /<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptPattern.exec(html))) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed && parsed["@type"] === "FAQPage") results.push(parsed);
    } catch {
      // Other JSON-LD is handled by its own synchronizer; invalid FAQ JSON-LD is caught below.
    }
  }
  if (results.length > 1) throw new Error(file + ": more than one FAQPage JSON-LD block was found");
  return results;
}

function synchronizeFaqPage(html, file) {
  const schema = faqPageSchema(html, file);
  const existing = existingFaqPageSchemas(html, file);
  const isCurrent = existing.length === 1 && JSON.stringify(existing[0]) === JSON.stringify(schema);
  if (isCurrent) return { changed: false, html, questionCount: schema.mainEntity.length };

  const block = `  <script type="application/ld+json" data-yaqixin-faqpage>\n${JSON.stringify(schema, null, 2)}\n  </script>\n`;
  const managedPattern = /[ \t]*<script\b(?=[^>]*\bdata-yaqixin-faqpage\b)[^>]*>[\s\S]*?<\/script>\s*/gi;
  let nextHtml = html.replace(managedPattern, "");
  if (!/<\/head>/i.test(nextHtml)) throw new Error(file + ": closing head tag was not found");
  nextHtml = nextHtml.replace(/<\/head>/i, block + "</head>");
  return { changed: true, html: nextHtml, questionCount: schema.mainEntity.length };
}

let changedFiles = 0;
let totalQuestions = 0;
for (const item of products) {
  const file = item.slug + ".html";
  const filePath = path.join(root, file);
  const currentHtml = fs.readFileSync(filePath, "utf8");
  const result = synchronizeFaqPage(currentHtml, file);
  totalQuestions += result.questionCount;
  if (!result.changed) continue;
  changedFiles += 1;
  if (shouldWrite) fs.writeFileSync(filePath, result.html, "utf8");
}

if (changedFiles > 0 && !shouldWrite) {
  console.error("FAQPage JSON-LD drift in " + changedFiles + " file(s). Run: node scripts/sync-product-faq-jsonld.mjs --write");
  process.exitCode = 1;
} else {
  console.log((shouldWrite ? "Synchronized " : "Validated ") + products.length + " FAQPage JSON-LD page(s); " + totalQuestions + " visible FAQ entries; " + changedFiles + " file(s) " + (shouldWrite ? "updated." : "need updates."));
}
