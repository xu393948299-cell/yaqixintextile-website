import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const instagramUrl = "https://www.instagram.com/zhang.mandyzhang/";
const stylesheet = '<link rel="stylesheet" href="/yaqixin-assets/yaqixin-instagram.css?v=20260811">';
const instagramMark = '<svg class="yx-instagram-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><defs><radialGradient id="yx-instagram-gradient" cx="30%" cy="107%" r="150%"><stop offset="0%" stop-color="#feda75"></stop><stop offset="25%" stop-color="#fa7e1e"></stop><stop offset="50%" stop-color="#d62976"></stop><stop offset="75%" stop-color="#962fbf"></stop><stop offset="100%" stop-color="#4f5bd5"></stop></radialGradient></defs><rect x="1" y="1" width="22" height="22" rx="6" fill="url(#yx-instagram-gradient)"></rect><rect x="5.4" y="5.4" width="13.2" height="13.2" rx="4.2" fill="none" stroke="#fff" stroke-width="1.8"></rect><circle cx="12" cy="12" r="3.15" fill="none" stroke="#fff" stroke-width="1.8"></circle><circle cx="16.8" cy="7.2" r="1" fill="#fff"></circle></svg>';
const linkMarkup = `<a class="yx-instagram-link" data-social-profile="instagram" href="${instagramUrl}" target="_blank" rel="noopener noreferrer external" aria-label="Follow YAQIXIN on Instagram at zhang.mandyzhang">${instagramMark}<span>@zhang.mandyzhang</span></a>`;

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

  const existingInstagramLink = /<a class="yx-instagram-link"[^>]*data-social-profile="instagram"[\s\S]*?<\/a>/;
  if (existingInstagramLink.test(html)) {
    html = html.replace(existingInstagramLink, linkMarkup);
  } else {
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
