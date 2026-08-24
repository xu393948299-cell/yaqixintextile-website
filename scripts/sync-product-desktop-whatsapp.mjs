import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shouldWrite = process.argv.includes("--write");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "data", "products.json"), "utf8"));
const products = Array.isArray(catalog.products) ? catalog.products : catalog;

const stylesheetHref = "/yaqixin-assets/yaqixin-product-desktop-whatsapp.css?v=20260824";
const whatsappHref = "https://wa.me/8618125117673";
const managedStart = "<!-- YAQIXIN_PRODUCT_DESKTOP_WHATSAPP_START -->";
const managedEnd = "<!-- YAQIXIN_PRODUCT_DESKTOP_WHATSAPP_END -->";
const managedBlock = `${managedStart}\n  <a class="yx-product-desktop-whatsapp" href="${whatsappHref}" target="_blank" rel="noopener noreferrer" aria-label="Contact YAQIXIN on WhatsApp at +86 18125117673"><img src="/yaqixin-assets/whatsapp-floating-236.webp" width="236" height="158" alt="WhatsApp"></a>\n  ${managedEnd}`;

function count(text, pattern) {
  return (text.match(pattern) || []).length;
}

function normalizePage(html, file) {
  const eol = html.includes("\r\n") ? "\r\n" : "\n";

  html = html.replace(
    /\s*<!-- YAQIXIN_PRODUCT_DESKTOP_WHATSAPP_START -->[\s\S]*?<!-- YAQIXIN_PRODUCT_DESKTOP_WHATSAPP_END -->\s*/g,
    eol,
  );
  html = html.replace(/\s*<a\s+class="whatsapp-floating"[^>]*>[\s\S]*?<\/a>\s*/g, eol);

  if (html.includes("yaqixin-product-desktop-whatsapp.css")) {
    html = html.replace(
      /\/yaqixin-assets\/yaqixin-product-desktop-whatsapp\.css\?v=[^"']+/g,
      stylesheetHref,
    );
  } else {
    if (!html.includes("</head>")) throw new Error(`${file}: missing </head>`);
    html = html.replace("</head>", `  <link rel="stylesheet" href="${stylesheetHref}">${eol}</head>`);
  }

  if (!html.includes("</body>")) throw new Error(`${file}: missing </body>`);
  html = html.replace("</body>", `  ${managedBlock.replaceAll("\n", eol)}${eol}</body>`);
  return html;
}

function validatePage(html, file) {
  const errors = [];
  if (count(html, /yaqixin-product-desktop-whatsapp\.css/g) !== 1) {
    errors.push("expected exactly one desktop WhatsApp stylesheet reference");
  }
  if (count(html, /class="yx-product-desktop-whatsapp"/g) !== 1) {
    errors.push("expected exactly one desktop WhatsApp link");
  }
  if (count(html, /class="whatsapp-floating"/g) !== 0) {
    errors.push("legacy whatsapp-floating link remains");
  }
  if (!html.includes(`href="${whatsappHref}"`)) {
    errors.push("desktop WhatsApp link does not target +86 18125117673");
  }
  if (!html.includes('src="/yaqixin-assets/whatsapp-floating-236.webp"')) {
    errors.push("desktop WhatsApp link does not reuse the homepage asset");
  }
  if (!html.includes('width="236" height="158"')) {
    errors.push("desktop WhatsApp image dimensions do not match the homepage markup");
  }
  return errors.map((message) => `${file}: ${message}`);
}

const errors = [];
let changed = 0;

for (const product of products) {
  const file = product?._import?.page;
  if (!file) {
    errors.push(`${product?.sku || "unknown SKU"}: data/products.json is missing _import.page`);
    continue;
  }

  const absolutePath = path.join(root, file);
  if (!fs.existsSync(absolutePath)) {
    errors.push(`${file}: product page is missing`);
    continue;
  }

  const original = fs.readFileSync(absolutePath, "utf8");
  const normalized = normalizePage(original, file);
  if (normalized !== original) {
    changed += 1;
    if (shouldWrite) fs.writeFileSync(absolutePath, normalized, "utf8");
  }
  errors.push(...validatePage(shouldWrite ? normalized : original, file));
}

if (errors.length) {
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else if (shouldWrite) {
  console.log(`Desktop WhatsApp synchronized across ${products.length} product pages (${changed} changed).`);
} else if (changed) {
  console.error(`${changed} product pages need desktop WhatsApp synchronization. Run with --write.`);
  process.exitCode = 1;
} else {
  console.log(`Desktop WhatsApp valid across ${products.length} product pages.`);
}
