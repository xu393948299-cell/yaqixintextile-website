import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://www.yaqixintextile.com";
const releaseDate = "2026-08-22";
const failures = [];
let checks = 0;

function assert(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function walkHtml(directory = root, prefix = "") {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "yaqixin-assets") continue;
    const relativePath = path.posix.join(prefix, entry.name);
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkHtml(absolutePath, relativePath));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(relativePath);
  }
  return files.sort();
}

function stripHtml(value) {
  return value.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function canonicalHref(html) {
  const tag = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]).find((value) => /\brel=["']canonical["']/i.test(value));
  const href = tag && tag.match(/\bhref=["']([^"']+)["']/i);
  return href ? href[1] : null;
}

function jsonLdNodes(html, file) {
  const nodes = [];
  const blocks = [...html.matchAll(/<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block[1].trim());
      if (Array.isArray(parsed)) nodes.push(...parsed);
      else if (Array.isArray(parsed["@graph"])) nodes.push(...parsed["@graph"]);
      else nodes.push(parsed);
    } catch (error) {
      assert(false, file + ": invalid JSON-LD (" + error.message + ")");
    }
  }
  return nodes;
}

function hasSchemaType(node, type) {
  const nodeType = node && node["@type"];
  return Array.isArray(nodeType) ? nodeType.includes(type) : nodeType === type;
}

function nodeOfType(nodes, type) {
  return nodes.find((node) => hasSchemaType(node, type));
}

function propertyValue(product, name) {
  const property = (product.additionalProperty || []).find((entry) => entry && entry.name === name);
  return property ? property.value : null;
}

function normalizedUnit(unit) {
  const value = String(unit || "").toLowerCase();
  if (/^m(eter|etre)/.test(value) || value === "m") return "m";
  if (/^yd|^yard/.test(value)) return "yd";
  if (/^pc|^piece/.test(value)) return "pc";
  return value;
}

function parseMoqCandidates(value) {
  const candidates = [];
  const regex = /\b(?:MOQ(?:\s+(?:is|of))?|Min\.?\s*Order:?)\s*(\d[\d,]*)\s*(meters?|metres?|m|yards?|yd|pieces?|pcs?)\b/gi;
  for (const match of value.matchAll(regex)) {
    candidates.push({ quantity: Number(match[1].replaceAll(",", "")), unit: normalizedUnit(match[2]) });
  }
  return candidates;
}

function hasExpectedMoq(value, item, expectedDisplay = item.moqDisplay) {
  const expected = parseMoqCandidates("MOQ " + String(expectedDisplay));
  return expected.some((target) => parseMoqCandidates(value).some((candidate) => candidate.quantity === target.quantity && candidate.unit === target.unit));
}

function numericEqual(left, right) {
  return Math.abs(Number(left) - Number(right)) < 0.00001;
}

function sourceFileForRoute(route) {
  const clean = route.replace(/^\/+|\/+$/g, "");
  if (!clean) return "index.html";
  if (clean === "es") return "es/index.html";
  if (clean === "blog") return "blog/index.html";
  if (clean.startsWith("blog/")) return clean + "/index.html";
  return clean + ".html";
}

function sitemapEntries(xml) {
  const entries = [];
  const regex = /<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/g;
  for (const match of xml.matchAll(regex)) entries.push({ loc: match[1], lastmod: match[2] });
  return entries;
}

function firstNav(html) {
  const start = html.search(/<nav\b/i);
  if (start < 0) return "";
  const end = html.indexOf("</nav>", start);
  return html.slice(start, end < 0 ? start + 20000 : end + 6);
}

const company = readJson("data/company.json");
const catalog = readJson("data/products.json");
const products = Array.isArray(catalog.products) ? catalog.products : catalog;
const allHtmlFiles = walkHtml();

assert(Array.isArray(products) && products.length > 0, "data/products.json: products array is missing");
assert(company.brandName === "YAQIXIN TEXTILES", "data/company.json: brand name is not YAQIXIN TEXTILES");
assert(company.legalName === "Guangzhou Yaqixin Textile Co., Ltd.", "data/company.json: legal name is incorrect");
assert(company.publicEmail && company.publicEmail.status === "active", "data/company.json: current public email is not active");
assert(company.futurePublicEmail && company.futurePublicEmail.display === false, "data/company.json: unverified future email must not be displayed");
assert(company.foundingDate === null, "data/company.json: founding date must remain unknown/null");

const skuSet = new Set();
const slugSet = new Set();
for (const item of products) {
  assert(!skuSet.has(item.sku), "data/products.json: duplicate SKU " + item.sku);
  assert(!slugSet.has(item.slug), "data/products.json: duplicate slug " + item.slug);
  skuSet.add(item.sku);
  slugSet.add(item.slug);
  assert(Number(item.moq) <= 100, item.sku + ": MOQ over 100 requires low-MOQ resolution before release");
  assert(item.canonicalUrl === origin + "/" + item.slug, item.sku + ": canonical URL does not match slug");
  assert(fs.existsSync(path.join(root, item.slug + ".html")), item.sku + ": product page is missing");
}

const productPages = [];
for (const item of products) {
  const file = item.slug + ".html";
  const html = read(file);
  const text = stripHtml(html);
  const nodes = jsonLdNodes(html, file);
  const product = nodeOfType(nodes, "Product");
  productPages.push(file);

  assert(canonicalHref(html) === item.canonicalUrl, file + ": canonical URL does not match catalog");
  assert(!/\bnoindex\b/i.test(html), file + ": product page must remain indexable");
  assert(Boolean(product), file + ": Product JSON-LD is missing");
  if (!product) continue;

  assert(product.sku === item.sku, file + ": Product JSON-LD SKU does not match catalog");
  assert(product.name === item.name, file + ": Product JSON-LD name does not match catalog");
  assert(product.material === item.material, file + ": Product JSON-LD material does not match catalog");
  assert(String(product.offers && product.offers.priceCurrency) === item.priceCurrency, file + ": Product JSON-LD currency does not match catalog");
  assert(numericEqual(product.offers && product.offers.lowPrice, item.priceLow), file + ": Product JSON-LD low price does not match catalog");
  assert(numericEqual(product.offers && product.offers.highPrice, item.priceHigh), file + ": Product JSON-LD high price does not match catalog");
  const schemaAvailability = product.offers && product.offers.availability ? product.offers.availability : null;
  assert(schemaAvailability === (item.availability || null), file + ": Product JSON-LD availability does not match catalog");
  assert(hasExpectedMoq("MOQ " + String(propertyValue(product, "MOQ") || ""), item), file + ": Product JSON-LD MOQ does not match catalog");
  assert(hasExpectedMoq(text, item), file + ": visible MOQ does not match catalog");

  const pageMoqs = parseMoqCandidates(text);
  assert(!pageMoqs.some((candidate) => candidate.quantity > 100), file + ": visible MOQ over 100 remains");
}
assert(productPages.length === products.length, "Product page count does not match data/products.json");

const allProductsHtml = read("all-products.html");
const allProductsMatch = allProductsHtml.match(/var\s+products\s*=\s*(\[[\s\S]*?\])\s*;\s*var\s+productVideos\b/);
assert(Boolean(allProductsMatch), "all-products.html: product search/listing source array is missing");
if (allProductsMatch) {
  const listingProducts = vm.runInNewContext("(" + allProductsMatch[1] + ")", Object.create(null), { timeout: 1000 });
  assert(listingProducts.length === products.length, "all-products.html: listing count does not match catalog");
  const listingByHref = new Map(listingProducts.map((item) => [item.href, item]));
  for (const item of products) {
    const listing = listingByHref.get("/" + item.slug);
    assert(Boolean(listing), "all-products.html: missing listing for " + item.sku);
    if (!listing) continue;
    assert(listing.price === item.listing.price, "all-products.html: price differs for " + item.sku);
    assert(listing.moq === item.listing.moq, "all-products.html: MOQ differs for " + item.sku);
  }
}

let categoryCardsChecked = 0;
const reviewOnlyLowMoqDifferences = [];
for (const file of allHtmlFiles.filter((entry) => !productPages.includes(entry))) {
  const html = read(file);
  for (const card of html.matchAll(/<article\b[^>]*class=["'][^"']*\blisting-card\b[^"']*["'][^>]*>([\s\S]*?)<\/article>/gi)) {
    const cardHtml = card[1];
    const href = cardHtml.match(/href=["']\/([^"'?#]+)["']/i);
    if (!href || !slugSet.has(href[1])) continue;
    const item = products.find((product) => product.slug === href[1]);
    categoryCardsChecked += 1;
    assert(hasExpectedMoq(stripHtml(cardHtml), item, item.listing.moq), file + ": listing-card MOQ differs for " + item.sku);
  }
}
assert(categoryCardsChecked > 0, "No category listing cards were checked");
for (const item of products) {
  const detailMoq = parseMoqCandidates("MOQ " + item.moqDisplay)[0];
  const listingMoq = parseMoqCandidates(item.listing.moq)[0];
  if (!detailMoq || !listingMoq) continue;
  assert(listingMoq.quantity <= 100, item.sku + ": listing MOQ over 100 requires low-MOQ resolution before release");
  if (detailMoq.quantity !== listingMoq.quantity || detailMoq.unit !== listingMoq.unit) {
    if (detailMoq.quantity <= 100 && listingMoq.quantity <= 100) reviewOnlyLowMoqDifferences.push(item.sku);
  }
}

function assertOrganization(route) {
  const file = sourceFileForRoute(route);
  const html = read(file);
  const organization = jsonLdNodes(html, file).find((node) => hasSchemaType(node, "Organization") && node.name === company.brandName);
  assert(Boolean(organization), file + ": YAQIXIN Organization JSON-LD is missing");
  if (!organization) return;
  assert(organization.legalName === company.legalName, file + ": Organization legalName is incorrect");
  assert(organization.url === company.url, file + ": Organization URL is incorrect");
  assert(organization.logo === company.logo, file + ": Organization logo is incorrect");
  assert(organization.email === company.publicEmail.value, file + ": Organization email is incorrect");
  assert(organization.address && organization.address.streetAddress === company.address.streetAddress, file + ": Organization street address is incorrect");
  assert(Array.isArray(organization.contactPoint) && organization.contactPoint.length === company.contactPoint.length, file + ": Organization contacts are incomplete");
  assert(!Object.prototype.hasOwnProperty.call(organization, "foundingDate"), file + ": Organization must not claim an unverified founding date");
  assert(!/\bmanufacturer\b|\bfactory\b/i.test(String(organization.description || "")), file + ": Organization description uses unsupported entity wording");
}

for (const route of ["/", "/about-us", "/contact"]) assertOrganization(route);

const aboutHtml = read("about-us.html");
const contactHtml = read("contact.html");
assert(canonicalHref(aboutHtml) === origin + "/about-us", "about-us.html: canonical is incorrect");
assert(canonicalHref(contactHtml) === origin + "/contact", "contact.html: canonical is incorrect");
assert(contactHtml.includes("<form") && !/\brequired\b/i.test(contactHtml), "contact.html: inquiry fields must stay optional");
assert((contactHtml.match(/data-whatsapp=/g) || []).length === 2, "contact.html: both WhatsApp contact choices are required");
assert(contactHtml.includes(company.legalName), "contact.html: legal entity is not visible");
assert(aboutHtml.includes(company.legalName), "about-us.html: legal entity is not visible");

const navigationFiles = allHtmlFiles.filter((file) => (
  file !== "404.html"
  && file !== "privacy-policy.html"
  && file !== "thank-you.html"
  && !file.startsWith("blog/content/")
  && !file.startsWith("downloads/")
));
for (const file of navigationFiles) {
  const html = read(file);
  const nav = firstNav(html);
  assert(nav.includes('href="/contact"'), file + ": primary navigation lacks /contact");
  assert(!/href=["']\/?#inquiry["']/i.test(nav), file + ": primary navigation still targets #inquiry");
}

const prohibitedPatterns = [
  /Wholesale Fabric Manufacturer/i,
  /Fabric manufacturer/i,
  /Factory-backed sourcing/i,
  /Factory strength/i,
  /Real factory & stock capacity/i,
  /15\+\s*years/i,
  /900,000m\+/i,
  /Fabricante mayorista de telas/i,
];
for (const pattern of prohibitedPatterns) {
  const offenders = allHtmlFiles.filter((file) => pattern.test(read(file)));
  assert(offenders.length === 0, "Unsupported entity claim " + pattern + " found in " + offenders.join(", "));
}
const futureEmailOffenders = allHtmlFiles.filter((file) => read(file).includes(company.futurePublicEmail.value));
assert(futureEmailOffenders.length === 0, "Unverified future email is visible in " + futureEmailOffenders.join(", "));

const vercel = readJson("vercel.json");
const redirects = Array.isArray(vercel.redirects) ? vercel.redirects : [];
assert(vercel.cleanUrls === true, "vercel.json: cleanUrls must be enabled");
assert(!redirects.some((redirect) => redirect.source === "/about-us"), "vercel.json: /about-us must not redirect away");
const robots = read("robots.txt");
assert(/User-agent:\s*\*/i.test(robots) && /Allow:\s*\//i.test(robots), "robots.txt: crawl allow rule is missing");
assert(robots.includes(origin + "/sitemap.xml"), "robots.txt: sitemap declaration is missing");

const sitemap = sitemapEntries(read("sitemap.xml"));
assert(sitemap.length >= products.length + 3, "sitemap.xml: insufficient URL count");
const sitemapLocations = new Set();
const canonicalLocations = new Set();
for (const entry of sitemap) {
  assert(!sitemapLocations.has(entry.loc), "sitemap.xml: duplicate URL " + entry.loc);
  sitemapLocations.add(entry.loc);
  assert(entry.lastmod === releaseDate, "sitemap.xml: lastmod is not " + releaseDate + " for " + entry.loc);
  assert(entry.loc.startsWith(origin), "sitemap.xml: foreign URL " + entry.loc);
  const route = entry.loc.slice(origin.length) || "/";
  const sourceFile = sourceFileForRoute(route);
  assert(fs.existsSync(path.join(root, sourceFile)), "sitemap.xml: source file is missing for " + route);
  if (!fs.existsSync(path.join(root, sourceFile))) continue;
  const html = read(sourceFile);
  const canonical = canonicalHref(html);
  assert(canonical === entry.loc, sourceFile + ": canonical must equal sitemap URL");
  assert(!canonicalLocations.has(canonical), "Duplicate canonical URL " + canonical);
  canonicalLocations.add(canonical);
  assert(!/\bnoindex\b/i.test(html), sourceFile + ": sitemap URL must remain indexable");
}
for (const route of ["/", "/about-us", "/contact"]) {
  assert(sitemapLocations.has(origin + route), "sitemap.xml: missing " + route);
}

if (failures.length > 0) {
  console.error("GEO Phase 1 validation failed (" + failures.length + " failures, " + checks + " checks):");
  for (const failure of failures) console.error("- " + failure);
  process.exitCode = 1;
} else {
  console.log("GEO Phase 1 validation passed: " + checks + " checks; " + products.length + " Product pages; " + categoryCardsChecked + " category cards; " + sitemap.length + " sitemap URLs; " + reviewOnlyLowMoqDifferences.length + " protected low-MOQ cross-surface review item(s).");
}
