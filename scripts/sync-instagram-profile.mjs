import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const instagramUrl = "https://www.instagram.com/zhang.mandyzhang/";
const stylesheet = '<link rel="stylesheet" href="/yaqixin-assets/yaqixin-instagram.css?v=20260811">';
const linkMarkup = `<a class="yx-instagram-link" data-social-profile="instagram" href="${instagramUrl}" target="_blank" rel="noopener noreferrer external" aria-label="Follow YAQIXIN on Instagram at zhang.mandyzhang"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"></circle></svg><span>@zhang.mandyzhang</span></a>`;

function htmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "node_modules") return [];
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(fullPath);
    return entry.isFile() && entry.name.endsWith(".html") ? [fullPath] : [];
  });
}

let matched = 0;
let updated = 0;
for (const filePath of htmlFiles(root)) {
  const original = fs.readFileSync(filePath, "utf8");
  if (!/class=["'][^"']*\bfooter\b/i.test(original)) continue;
  matched += 1;

  const eol = original.includes("\r\n") ? "\r\n" : "\n";
  let html = original;

  if (!html.includes("yaqixin-instagram.css")) {
    html = html.replace("</head>", `  ${stylesheet}${eol}</head>`);
  }

  if (!html.includes('data-social-profile="instagram"')) {
    const footerStart = html.search(/<footer\b[^>]*class=["'][^"']*\bfooter\b/i);
    const footerEnd = html.indexOf("</footer>", footerStart);
    if (footerStart < 0 || footerEnd < 0) {
      throw new Error(`Unable to locate footer in ${path.relative(root, filePath)}`);
    }

    const closingPattern = /<\/div>\s*<\/div>\s*<\/footer>/g;
    let closingMatch;
    let match;
    const footerMarkup = html.slice(footerStart, footerEnd + "</footer>".length);
    while ((match = closingPattern.exec(footerMarkup)) !== null) closingMatch = match;
    if (!closingMatch) {
      throw new Error(`Unsupported footer structure in ${path.relative(root, filePath)}`);
    }

    const insertionPoint = footerStart + closingMatch.index;
    html = `${html.slice(0, insertionPoint)}${linkMarkup}${html.slice(insertionPoint)}`;
  }

  if (html !== original) {
    fs.writeFileSync(filePath, html, "utf8");
    updated += 1;
  }
}

console.log(`Instagram profile synced across ${updated} of ${matched} footer HTML files.`);
