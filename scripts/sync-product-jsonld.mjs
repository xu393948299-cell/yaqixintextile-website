import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shouldWrite = process.argv.includes("--write");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "data", "products.json"), "utf8"));
const company = JSON.parse(fs.readFileSync(path.join(root, "data", "company.json"), "utf8"));
const products = Array.isArray(catalog.products) ? catalog.products : catalog;
const managedPropertyNames = new Set(["Yarn Count", "Weight", "Width", "Technics", "MOQ", "Lead Time"]);

function productSchema(item, existing) {
  const existingOffers = existing.offers && typeof existing.offers === "object" ? existing.offers : {};
  const preservedProperties = Array.isArray(existing.additionalProperty)
    ? existing.additionalProperty.filter((property) => property && !managedPropertyNames.has(property.name))
    : [];
  const managedProperties = [];
  if (item.yarnCount) managedProperties.push({ "@type": "PropertyValue", name: "Yarn Count", value: item.yarnCount });
  if (item.weight) managedProperties.push({ "@type": "PropertyValue", name: "Weight", value: item.weight });
  if (item.width) managedProperties.push({ "@type": "PropertyValue", name: "Width", value: item.width });
  if (item.technics) managedProperties.push({ "@type": "PropertyValue", name: "Technics", value: item.technics });
  managedProperties.push({ "@type": "PropertyValue", name: "MOQ", value: item.moqDisplay });
  if (item.leadTime) managedProperties.push({ "@type": "PropertyValue", name: "Lead Time", value: item.leadTime });

  const offers = {
    "@type": "AggregateOffer",
    priceCurrency: item.priceCurrency,
    lowPrice: item.priceLow,
    highPrice: item.priceHigh,
    offerCount: String(item.priceTiers.length || 1),
    url: item.canonicalUrl,
  };
  if (item.availability) offers.availability = item.availability;

  const result = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.name,
    sku: item.sku,
    brand: { "@type": "Brand", name: company.brandName },
    image: item.images,
    description: existing.description || item.name,
    category: existing.category || item.subcategory || item.category,
    material: item.material,
    offers,
    additionalProperty: [...managedProperties, ...preservedProperties],
  };
  if (!result.category) delete result.category;
  if (!result.material) delete result.material;
  if (!result.additionalProperty.length) delete result.additionalProperty;
  return result;
}

function replaceProductJsonLd(html, item, file) {
  let changed = false;
  let found = false;
  const nextHtml = html.replace(/(<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (whole, open, source, close) => {
    let parsed;
    try {
      parsed = JSON.parse(source.trim());
    } catch {
      return whole;
    }
    if (!parsed || parsed["@type"] !== "Product") return whole;
    found = true;
    const nextSchema = productSchema(item, parsed);
    const nextSource = "\n" + JSON.stringify(nextSchema, null, 2) + "\n";
    if (source !== nextSource) changed = true;
    return open + nextSource + close;
  });
  if (!found) throw new Error(file + ": Product JSON-LD block was not found");
  return { changed, html: nextHtml };
}

let changedFiles = 0;
for (const item of products) {
  const file = item.slug + ".html";
  const filePath = path.join(root, file);
  const currentHtml = fs.readFileSync(filePath, "utf8");
  const result = replaceProductJsonLd(currentHtml, item, file);
  if (!result.changed) continue;
  changedFiles += 1;
  if (shouldWrite) fs.writeFileSync(filePath, result.html, "utf8");
}

if (changedFiles > 0 && !shouldWrite) {
  console.error("Product JSON-LD drift in " + changedFiles + " file(s). Run: node scripts/sync-product-jsonld.mjs --write");
  process.exitCode = 1;
} else {
  console.log((shouldWrite ? "Synchronized " : "Validated ") + products.length + " Product JSON-LD page(s); " + changedFiles + " file(s) " + (shouldWrite ? "updated." : "need updates."));
}
