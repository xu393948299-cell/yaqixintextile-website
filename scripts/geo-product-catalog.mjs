#!/usr/bin/env node
/**
 * GEO Phase 1 product catalog source-of-truth utility.
 *
 * One-time bootstrap imports only confirmed values already published in the
 * static product pages.  After that, data/products.json is the canonical
 * editing source and --validate prevents page/card/schema drift.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = path.join(root, 'data', 'products.json');
const args = new Set(process.argv.slice(2));
const baseUrl = 'https://www.yaqixintextile.com';

function fail(message) {
  console.error(`GEO catalog error: ${message}`);
  process.exitCode = 1;
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function cleanText(value = '') {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeUnit(value = '') {
  const unit = value.toLowerCase().replace(/\./g, '').trim();
  if (/^(m|meter|meters)$/.test(unit)) return 'meters';
  if (/^(yd|yds|yard|yards)$/.test(unit)) return 'yards';
  if (/^(pc|pcs|piece|pieces)$/.test(unit)) return 'pieces';
  return unit || null;
}

function displayMoq(quantity, unit) {
  if (!Number.isFinite(quantity) || !unit) return null;
  const singular = quantity === 1;
  if (unit === 'meters') return `${quantity} ${singular ? 'meter' : 'meters'}`;
  if (unit === 'yards') return `${quantity} ${singular ? 'yard' : 'yards'}`;
  if (unit === 'pieces') return `${quantity} ${singular ? 'piece' : 'pieces'}`;
  return `${quantity} ${unit}`;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function parseJsonLd(html, relativePath) {
  const nodes = [];
  const expression = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(expression)) {
    const raw = match[1].trim().replace(/^<!--\s*|\s*-->$/g, '');
    try {
      nodes.push(JSON.parse(raw));
    } catch (error) {
      throw new Error(`${relativePath}: invalid JSON-LD (${error.message})`);
    }
  }
  return nodes;
}

function findSchemaNode(nodes, type) {
  const queue = [...nodes];
  while (queue.length) {
    const current = queue.shift();
    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }
    if (!current || typeof current !== 'object') continue;
    const types = Array.isArray(current['@type']) ? current['@type'] : [current['@type']];
    if (types.includes(type)) return current;
    if (Array.isArray(current['@graph'])) queue.push(...current['@graph']);
  }
  return null;
}

function propertyMap(product) {
  const properties = Array.isArray(product.additionalProperty) ? product.additionalProperty : [];
  const result = new Map();
  for (const property of properties) {
    if (!property || !property.name || property.value == null) continue;
    const key = String(property.name).toLowerCase();
    if (!result.has(key)) result.set(key, []);
    result.get(key).push(String(property.value));
  }
  return result;
}

function firstProperty(map, ...names) {
  for (const name of names) {
    const values = map.get(name.toLowerCase());
    if (values?.length) return values[0];
  }
  return null;
}

function extractMoqCandidates(html, product) {
  const candidates = [];
  const properties = propertyMap(product);
  for (const value of properties.get('moq') || []) {
    const match = value.match(/(\d+(?:\.\d+)?)\s*(meters?|m|yards?|yds?|yd|pieces?|pcs?|pc)\b/i);
    if (match) {
      candidates.push({ quantity: Number(match[1]), unit: normalizeUnit(match[2]), source: 'Product JSON-LD' });
    }
  }

  const visible = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ');
  const patterns = [
    /\bMOQ(?:\s+(?:is|from|of))?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*(meters?|m|yards?|yds?|yd|pieces?|pcs?|pc)\b/gi,
    /\bMin(?:imum)?\.?\s*Order\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*(meters?|m|yards?|yds?|yd|pieces?|pcs?|pc)\b/gi
  ];
  for (const pattern of patterns) {
    for (const match of visible.matchAll(pattern)) {
      candidates.push({ quantity: Number(match[1]), unit: normalizeUnit(match[2]), source: 'visible HTML' });
    }
  }
  return candidates;
}

function resolveMoq(candidates) {
  const jsonLd = candidates.find((candidate) => candidate.source === 'Product JSON-LD');
  const hasOver100 = candidates.some((candidate) => candidate.quantity > 100);
  const low = candidates.filter((candidate) => candidate.quantity <= 100);

  // User-approved GEO rule: when any surface is over 100, prefer an existing
  // lower product-page MOQ; otherwise default to 10 with the observed unit.
  if (hasOver100) {
    const preferred = low.find((candidate) => candidate.source === 'Product JSON-LD') || low[0];
    if (preferred) return { ...preferred, resolution: 'existing-low-moq' };
    const unit = jsonLd?.unit || candidates[0]?.unit || 'pieces';
    return { quantity: 10, unit, source: 'GEO default', resolution: 'default-10' };
  }

  if (jsonLd) return { ...jsonLd, resolution: 'confirmed-product-jsonld' };
  if (low[0]) return { ...low[0], resolution: 'confirmed-visible-page' };
  return { quantity: null, unit: null, source: 'not-provided', resolution: 'unknown' };
}

function extractTierCards(html) {
  const tiers = [];
  const expression = /<div\b[^>]*class=["'][^"']*\btier-card\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi;
  for (const match of html.matchAll(expression)) {
    const label = cleanText((match[1].match(/<small\b[^>]*>([\s\S]*?)<\/small>/i) || [])[1] || '');
    const price = cleanText((match[1].match(/<b\b[^>]*>([\s\S]*?)<\/b>/i) || [])[1] || '');
    if (label || price) tiers.push({ range: label || null, price: price || null });
  }
  return tiers.filter((tier, index, all) => all.findIndex((item) => item.range === tier.range && item.price === tier.price) === index);
}

function extractVideo(html) {
  const match = html.match(/(?:src|href)=["']([^"']+\.mp4(?:\?[^"']*)?)["']/i);
  return match ? match[1] : null;
}

function extractSpecMap(html) {
  const specs = new Map();
  const expression = /<div\b[^>]*class=["'][^"']*\bspec\b[^"']*["'][^>]*>\s*<span\b[^>]*>([\s\S]*?)<\/span>\s*<b\b[^>]*>([\s\S]*?)<\/b>\s*<\/div>/gi;
  for (const match of html.matchAll(expression)) {
    const label = cleanText(match[1]).toLowerCase();
    const value = cleanText(match[2]);
    if (label && value && !specs.has(label)) specs.set(label, value);
  }
  return specs;
}

function firstSpec(specs, ...names) {
  for (const name of names) {
    const direct = specs.get(name.toLowerCase());
    if (direct) return direct;
  }
  for (const [label, value] of specs) {
    if (names.some((name) => label.includes(name.toLowerCase()))) return value;
  }
  return null;
}

function extractApplicationHeadings(html) {
  const section = html.match(/<section\b[^>]*id=["']applications["'][^>]*>([\s\S]*?)<\/section>/i);
  if (!section) return [];
  return unique([...section[1].matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi)].map((match) => cleanText(match[1])));
}

function extractBreadcrumb(jsonLd) {
  const breadcrumb = findSchemaNode(jsonLd, 'BreadcrumbList');
  const items = Array.isArray(breadcrumb?.itemListElement) ? breadcrumb.itemListElement : [];
  return items
    .slice()
    .sort((a, b) => Number(a.position || 0) - Number(b.position || 0))
    .map((item) => item.name)
    .filter(Boolean);
}

function extractCanonical(html) {
  const match = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

function extractProductsArray(html) {
  const marker = 'var products=[';
  const start = html.indexOf(marker);
  if (start === -1) throw new Error('all-products.html: cannot find var products array');
  const arrayStart = html.indexOf('[', start);
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = arrayStart; index < html.length; index += 1) {
    const character = html[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'" || character === '`') {
      quote = character;
      continue;
    }
    if (character === '[') depth += 1;
    if (character === ']') {
      depth -= 1;
      if (depth === 0) {
        const literal = html.slice(arrayStart, index + 1);
        return vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 1000 });
      }
    }
  }
  throw new Error('all-products.html: unterminated products array');
}

function slugFromHref(href) {
  return String(href || '').replace(/^https?:\/\/[^/]+/i, '').replace(/^\//, '').replace(/\.html$/, '').replace(/\/$/, '');
}

function canonicalCatalogItem(item) {
  return {
    title: item.title || null,
    price: item.price || null,
    moq: item.moq || null,
    description: item.desc || null,
    image: item.img || null
  };
}

function buildRecords() {
  const catalog = extractProductsArray(read('all-products.html'));
  const catalogBySlug = new Map(catalog.map((item) => [slugFromHref(item.href), item]));
  const productFiles = fs.readdirSync(root)
    .filter((file) => file.endsWith('.html'))
    .sort();
  const records = [];

  for (const file of productFiles) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const jsonLd = parseJsonLd(html, file);
    const product = findSchemaNode(jsonLd, 'Product');
    if (!product?.sku) continue;
    const slug = file.replace(/\.html$/, '');
    const properties = propertyMap(product);
    const specs = extractSpecMap(html);
    const breadcrumb = extractBreadcrumb(jsonLd);
    const moq = resolveMoq(extractMoqCandidates(html, product));
    const offers = product.offers && typeof product.offers === 'object' ? product.offers : {};
    const priceTiers = extractTierCards(html);
    const images = Array.isArray(product.image) ? product.image : product.image ? [product.image] : [];
    const colors = unique(properties.get('color options') || []);
    const catalogItem = catalogBySlug.get(slug);

    records.push({
      sku: String(product.sku),
      slug,
      name: product.name || null,
      category: breadcrumb[1] || product.category || null,
      subcategory: breadcrumb.length > 3 ? breadcrumb[2] : null,
      material: product.material || firstProperty(properties, 'Material') || firstSpec(specs, 'Material', 'Composition') || null,
      weight: firstProperty(properties, 'Weight', 'GSM') || firstSpec(specs, 'Weight', 'GSM') || null,
      width: firstProperty(properties, 'Width') || firstSpec(specs, 'Width') || null,
      technics: firstProperty(properties, 'Technics') || firstSpec(specs, 'Technics') || null,
      yarnCount: firstProperty(properties, 'Yarn Count', 'YarnCount') || firstSpec(specs, 'Yarn Count', 'Yarn') || null,
      moq: moq.quantity,
      moqUnit: moq.unit,
      moqDisplay: displayMoq(moq.quantity, moq.unit),
      priceTiers: priceTiers.length ? priceTiers : [{
        range: null,
        price: offers.lowPrice != null || offers.highPrice != null
          ? `USD ${offers.lowPrice ?? offers.highPrice}${offers.highPrice && offers.highPrice !== offers.lowPrice ? `-${offers.highPrice}` : ''}`
          : null
      }],
      priceCurrency: offers.priceCurrency || null,
      priceLow: offers.lowPrice || null,
      priceHigh: offers.highPrice || null,
      leadTime: firstProperty(properties, 'Lead Time') || firstSpec(specs, 'Lead Time') || null,
      colors: colors.length ? colors : unique([firstSpec(specs, 'Color', 'Colour')]),
      applications: extractApplicationHeadings(html),
      availability: offers.availability || null,
      images,
      video: extractVideo(html),
      canonicalUrl: `${baseUrl}/${slug}`,
      listing: canonicalCatalogItem(catalogItem || {}),
      _import: {
        page: file,
        canonical: extractCanonical(html),
        moqResolution: moq.resolution,
        moqSource: moq.source
      }
    });
  }

  return records.sort((a, b) => a.sku.localeCompare(b.sku, 'en'));
}

function loadManifest() {
  if (!fs.existsSync(dataPath)) throw new Error('data/products.json is missing; run node scripts/geo-product-catalog.mjs --bootstrap once.');
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function compareValue(errors, sku, key, expected, actual) {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    errors.push(`${sku}: ${key} differs (source=${JSON.stringify(expected)}, page=${JSON.stringify(actual)})`);
  }
}

function validateManifest(manifest, actual) {
  const errors = [];
  const source = Array.isArray(manifest.products) ? manifest.products : [];
  const sourceBySku = new Map(source.map((record) => [record.sku, record]));
  const actualBySku = new Map(actual.map((record) => [record.sku, record]));
  if (source.length !== actual.length) errors.push(`product count differs (source=${source.length}, page=${actual.length})`);

  for (const [sku, record] of actualBySku) {
    const canonical = sourceBySku.get(sku);
    if (!canonical) {
      errors.push(`${sku}: missing from data/products.json`);
      continue;
    }
    for (const key of ['slug', 'moq', 'moqUnit', 'priceCurrency', 'priceLow', 'priceHigh', 'material', 'weight', 'width', 'technics', 'yarnCount']) {
      compareValue(errors, sku, key, canonical[key] ?? null, record[key] ?? null);
    }
    compareValue(errors, sku, 'listing.price', canonical.listing?.price ?? null, record.listing?.price ?? null);
    compareValue(errors, sku, 'listing.moq', canonical.listing?.moq ?? null, record.listing?.moq ?? null);
    const expectedCanonical = `${baseUrl}/${record.slug}`;
    if (record._import.canonical !== expectedCanonical) {
      errors.push(`${sku}: canonical is ${record._import.canonical || 'missing'}, expected ${expectedCanonical}`);
    }
    if (record.moq > 100) {
      errors.push(`${sku}: canonical MOQ ${record.moq} is above 100; normalize to 10 or the product page's explicit lower MOQ`);
    }
  }
  for (const sku of sourceBySku.keys()) {
    if (!actualBySku.has(sku)) errors.push(`${sku}: data/products.json points to a missing Product page`);
  }
  return errors;
}

try {
  const actual = buildRecords();
  if (args.has('--bootstrap')) {
    if (fs.existsSync(dataPath) && !args.has('--force')) {
      throw new Error('data/products.json already exists; refuse to overwrite canonical data without --force.');
    }
    const payload = {
      schemaVersion: 1,
      policy: {
        unknownValue: null,
        moqOver100: 'Use the product page explicit lower MOQ; if none exists, use 10 with the product unit.',
        prices: 'Imported exactly from existing visible product tiers and AggregateOffer data; do not infer new prices.'
      },
      products: actual
    };
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    fs.writeFileSync(dataPath, `${JSON.stringify(payload, null, 2)}\n`);
    const normalized = actual.filter((record) => ['existing-low-moq', 'default-10'].includes(record._import.moqResolution));
    console.log(`Wrote data/products.json with ${actual.length} products.`);
    console.log(`MOQ normalization candidates applied during import: ${normalized.length}.`);
  } else {
    const manifest = loadManifest();
    const errors = validateManifest(manifest, actual);
    if (errors.length) {
      for (const error of errors) console.error(`- ${error}`);
      throw new Error(`${errors.length} catalog consistency error(s).`);
    }
    console.log(`GEO product catalog valid: ${actual.length} Product pages match data/products.json.`);
  }
} catch (error) {
  fail(error.message);
}
