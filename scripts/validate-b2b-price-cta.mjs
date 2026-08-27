import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const files = (await readdir(root)).filter((name) => name.endsWith('.html'));
const productFiles = [];
const errors = [];
const tierDistribution = new Map();
const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
let jsonLdBlocks = 0;
const samplePrefillAssetVersion = '20260827-sample-prefill';
const sitemapLastmod = '2026-08-27';

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parsePrice(value) {
  const match = value.replace(/\s+/g, ' ').match(/(?:USD|US\$|\$)\s*([0-9][0-9,.]*)\s*\/\s*([a-z]+)/i);
  if (!match) return null;
  const amount = Number(match[1].replace(/,/g, ''));
  const rawUnit = match[2].toLowerCase();
  const unit = /^(m|meter|meters|metre|metres)$/.test(rawUnit)
    ? 'm'
    : /^(yd|yard|yards)$/.test(rawUnit) ? 'yd' : rawUnit;
  return Number.isFinite(amount) ? { amount, unit } : null;
}

for (const name of files) {
  const source = await readFile(path.join(root, name), 'utf8');
  if (!source.includes('"@type": "Product"')) continue;
  productFiles.push(name);

  const required = [
    'yaqixin-mobile-price-card.css?v=20260825-b2b-price-cta',
    `yaqixin-mobile-price-card.js?v=${samplePrefillAssetVersion}`,
    'data-b2b-cta-group="true"',
    'data-inquiry-intent="sample">Request Free Swatches / Color Card</a>',
    'data-inquiry-intent="bulk">Get Bulk & Shipping Quote</a>',
  ];
  for (const token of required) {
    if (!source.includes(token)) errors.push(`${name}: missing ${token}`);
  }

  const route = name.replace(/\.html$/, '');
  const sitemapLoc = `https://www.yaqixintextile.com/${route}`;
  const sitemapPattern = new RegExp(`<loc>${escapeRegExp(sitemapLoc)}<\\/loc>\\s*<lastmod>${sitemapLastmod}<\\/lastmod>`);
  if (!sitemapPattern.test(sitemap)) errors.push(`${name}: sitemap lastmod not refreshed`);

  const visibleSource = source
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '');
  if (/aria-label="[^"]*calculator/i.test(visibleSource) || />[^<]*calculator/i.test(visibleSource)) {
    errors.push(`${name}: visible calculator language remains`);
  }

  const structuredDataBlocks = [...source.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of structuredDataBlocks) {
    jsonLdBlocks += 1;
    try {
      JSON.parse(block[1]);
    } catch (error) {
      errors.push(`${name}: invalid JSON-LD (${error.message})`);
    }
  }

  const priceTexts = [...source.matchAll(/class="[^\"]*\btier-card\b[^\"]*"[\s\S]*?<b>([^<]+)<\/b>/g)]
    .map((match) => match[1]);
  const prices = priceTexts.map(parsePrice);
  if (prices.length < 2 || prices.some((price) => !price)) {
    errors.push(`${name}: expected at least two parseable price tiers`);
    continue;
  }
  const units = new Set(prices.map((price) => price.unit));
  if (units.size !== 1) errors.push(`${name}: mixed price units in one product`);
  tierDistribution.set(prices.length, (tierDistribution.get(prices.length) || 0) + 1);
}

const script = await readFile(path.join(root, 'yaqixin-assets', 'yaqixin-mobile-price-card.js'), 'utf8');
const stylesheet = await readFile(path.join(root, 'yaqixin-assets', 'yaqixin-mobile-price-card.css'), 'utf8');
for (const token of [
  'Final price depends on order volume, color customization, packing requirements, and destination port.',
  'Samples are free. Buyer pays shipping.',
  "Hi, I'd like to request free swatches / a color card for ",
  'Delivery country: ',
  'var normalizedMessage = cleanText(message);',
  "form.querySelector('[name=\"contact\"]')",
  'Request Free Swatches / Color Card',
  'Get Bulk & Shipping Quote',
]) {
  if (!script.includes(token)) errors.push(`shared script: missing ${token}`);
}
for (const token of ['.b2b-reference-panel', '.b2b-sample-cta', '.b2b-bulk-cta', '@media (max-width: 390px)']) {
  if (!stylesheet.includes(token)) errors.push(`shared stylesheet: missing ${token}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const tiers = [...tierDistribution.entries()].sort(([a], [b]) => a - b).map(([count, pages]) => `${pages} pages with ${count} tiers`).join('; ');
console.log(`B2B price and CTA validation passed: ${productFiles.length} Product pages; ${jsonLdBlocks} valid JSON-LD blocks; ${tiers}.`);
