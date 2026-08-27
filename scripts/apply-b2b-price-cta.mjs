import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const files = (await readdir(root)).filter((name) => name.endsWith('.html'));
const productFiles = [];
const samplePrefillAssetVersion = '20260827-sample-prefill';
const sitemapLastmod = '2026-08-27';

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceCalculatorText(value) {
  return value
    .replace(/Wholesale price calculator/gi, 'Reference wholesale pricing')
    .replace(/Reference price calculator/gi, 'Reference wholesale pricing')
    .replace(/Tier price calculator/gi, 'B2B reference pricing')
    .replace(/Meter-based quote calculator/gi, 'B2B volume price guide')
    .replace(/The price calculator shows/gi, 'The reference price tiers show')
    .replace(/the price calculator shows/gi, 'the reference price tiers show')
    .replace(/The price calculator/gi, 'The reference price tiers')
    .replace(/the price calculator/gi, 'the reference price tiers')
    .replace(/The calculator will use/gi, 'Reference pricing uses')
    .replace(/the calculator will use/gi, 'reference pricing uses')
    .replace(/\bcalculator\b/gi, 'price guide');
}

function updateVisibleCalculatorLanguage(source) {
  return source.split(/(<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>)/gi).map((segment) => {
    if (/^<(?:script|style)\b/i.test(segment)) {
      return segment;
    }
    return segment
      .replace(/aria-label="([^"]*?)price calculator"/gi, (_match, prefix) => `aria-label="${prefix}B2B reference pricing"`)
      .replace(/>([^<]*)</g, (match, text) => text.toLowerCase().includes('calculator')
        ? `>${replaceCalculatorText(text)}<`
        : match);
  }).join('');
}

for (const name of files) {
  const filePath = path.join(root, name);
  const source = await readFile(filePath, 'utf8');
  if (!source.includes('"@type": "Product"')) {
    continue;
  }

  productFiles.push(name);
  let updated = source;
  updated = updated.replace(
    /<link rel="stylesheet" href="yaqixin-assets\/yaqixin-mobile-price-card\.css(?:\?[^\"]*)?">/,
    '<link rel="stylesheet" href="yaqixin-assets/yaqixin-mobile-price-card.css?v=20260825-b2b-price-cta">',
  );
  updated = updated.replace(
    /<script defer src="yaqixin-assets\/yaqixin-mobile-price-card\.js(?:\?[^\"]*)?"><\/script>/,
    `<script defer src="yaqixin-assets/yaqixin-mobile-price-card.js?v=${samplePrefillAssetVersion}"></script>`,
  );
  updated = updated.replace(
    /<div class="hero-actions"(?: data-b2b-cta-group="true")?>[\s\S]*?<\/div>/,
    '<div class="hero-actions" data-b2b-cta-group="true"><a class="btn copper b2b-sample-cta" href="#inquiry" data-inquiry-intent="sample">Request Free Swatches / Color Card</a><a class="btn navy b2b-bulk-cta" href="#inquiry" data-inquiry-intent="bulk">Get Bulk & Shipping Quote</a></div>',
  );
  updated = updateVisibleCalculatorLanguage(updated);

  const required = [
    'yaqixin-mobile-price-card.css?v=20260825-b2b-price-cta',
    `yaqixin-mobile-price-card.js?v=${samplePrefillAssetVersion}`,
    'data-b2b-cta-group="true"',
    'Request Free Swatches / Color Card',
    'Get Bulk & Shipping Quote',
  ];
  const missing = required.filter((token) => !updated.includes(token));
  if (missing.length) {
    throw new Error(`${name}: failed to apply ${missing.join(', ')}`);
  }

  if (updated !== source) {
    await writeFile(filePath, updated, 'utf8');
  }
}

const sitemapPath = path.join(root, 'sitemap.xml');
const sitemapSource = await readFile(sitemapPath, 'utf8');
let sitemapUpdated = sitemapSource;
for (const name of productFiles) {
  const route = name.replace(/\.html$/, '');
  const loc = `https://www.yaqixintextile.com/${route}`;
  const pattern = new RegExp(`(<loc>${escapeRegExp(loc)}<\\/loc>\\s*<lastmod>)[^<]+(<\\/lastmod>)`);
  if (!pattern.test(sitemapUpdated)) {
    throw new Error(`${name}: sitemap URL not found`);
  }
  sitemapUpdated = sitemapUpdated.replace(pattern, `$1${sitemapLastmod}$2`);
}
if (sitemapUpdated !== sitemapSource) {
  await writeFile(sitemapPath, sitemapUpdated, 'utf8');
}

console.log(`Updated B2B price and CTA assets across ${productFiles.length} Product pages and refreshed their sitemap dates.`);
