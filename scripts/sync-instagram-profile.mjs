import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const instagramUrl = "https://www.instagram.com/zhang.mandyzhang/";
const facebookUrl = "https://www.facebook.com/profile.php?id=61554639581256";
const wechatQrUrl = "/yaqixin-assets/wechat-contact-13172537921.webp";
const stylesheetHref = "/yaqixin-assets/yaqixin-instagram.css?v=20260811-wechat";
const stylesheet = `<link rel="stylesheet" href="${stylesheetHref}">`;
const wechatScript = '<script src="/yaqixin-assets/yaqixin-wechat-contact.js?v=20260811" defer></script>';
const instagramMark = '<svg class="yx-instagram-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><defs><radialGradient id="yx-instagram-gradient" cx="30%" cy="107%" r="150%"><stop offset="0%" stop-color="#feda75"></stop><stop offset="25%" stop-color="#fa7e1e"></stop><stop offset="50%" stop-color="#d62976"></stop><stop offset="75%" stop-color="#962fbf"></stop><stop offset="100%" stop-color="#4f5bd5"></stop></radialGradient></defs><rect x="1" y="1" width="22" height="22" rx="6" fill="url(#yx-instagram-gradient)"></rect><rect x="5.4" y="5.4" width="13.2" height="13.2" rx="4.2" fill="none" stroke="#fff" stroke-width="1.8"></rect><circle cx="12" cy="12" r="3.15" fill="none" stroke="#fff" stroke-width="1.8"></circle><circle cx="16.8" cy="7.2" r="1" fill="#fff"></circle></svg>';
const facebookMark = '<svg class="yx-facebook-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="11" fill="#0866ff"></circle><path fill="#fff" d="M13.55 20v-7.05h2.36l.35-2.75h-2.71V8.45c0-.8.22-1.34 1.37-1.34h1.46V4.65c-.25-.04-1.12-.11-2.13-.11-2.11 0-3.56 1.29-3.56 3.66v2H8.3v2.75h2.39V20h2.86Z"></path></svg>';
const wechatMark = '<svg class="yx-wechat-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="1" y="1" width="22" height="22" rx="6" fill="#07c160"></rect><circle cx="9.3" cy="10.2" r="4.4" fill="#fff"></circle><circle cx="15.1" cy="14.2" r="4" fill="#fff"></circle><circle cx="8" cy="9.5" r=".55" fill="#07c160"></circle><circle cx="10.7" cy="9.5" r=".55" fill="#07c160"></circle><circle cx="14" cy="13.6" r=".5" fill="#07c160"></circle><circle cx="16.3" cy="13.6" r=".5" fill="#07c160"></circle></svg>';
const instagramLinkMarkup = `<a class="yx-social-link yx-instagram-link" data-social-profile="instagram" href="${instagramUrl}" target="_blank" rel="noopener noreferrer external" aria-label="Follow YAQIXIN on Instagram at zhang.mandyzhang">${instagramMark}<span>@zhang.mandyzhang</span></a>`;
const facebookLinkMarkup = `<a class="yx-social-link yx-facebook-link" data-social-profile="facebook" href="${facebookUrl}" target="_blank" rel="noopener noreferrer external" aria-label="Visit YAQIXIN on Facebook">${facebookMark}<span>YAQIXIN on Facebook</span></a>`;
const wechatLinkMarkup = `<a class="yx-social-link yx-wechat-link" data-social-profile="wechat" data-wechat-trigger href="${wechatQrUrl}" aria-label="Open WeChat QR code for YAQIXIN sales contact 13172537921">${wechatMark}<span>WeChat 13172537921</span></a>`;
const socialLinksMarkup = `<div class="yx-social-links" aria-label="YAQIXIN social and messaging contacts">${instagramLinkMarkup}${facebookLinkMarkup}${wechatLinkMarkup}</div>`;

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

  if (html.includes("yaqixin-instagram.css")) {
    html = html.replace(/\/yaqixin-assets\/yaqixin-instagram\.css\?v=[^"']+/, stylesheetHref);
  } else {
    html = html.replace("</head>", `  ${stylesheet}${eol}</head>`);
  }

  if (!html.includes("yaqixin-wechat-contact.js")) {
    html = html.replace("</body>", `  ${wechatScript}${eol}</body>`);
  }

  const existingInstagramLink = /<a class="[^"]*yx-instagram-link[^"]*"[^>]*data-social-profile="instagram"[\s\S]*?<\/a>/;
  if (existingInstagramLink.test(html)) {
    html = html.replace(existingInstagramLink, instagramLinkMarkup);
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
    html = `${html.slice(0, insertionPoint)}${instagramLinkMarkup}${html.slice(insertionPoint)}`;
  }

  const existingSocialLinks = /<div class="yx-social-links"[^>]*>[\s\S]*?<\/div>/;
  if (existingSocialLinks.test(html)) {
    html = html.replace(existingSocialLinks, socialLinksMarkup);
  } else {
    html = html.replace(instagramLinkMarkup, socialLinksMarkup);
  }

  if (html !== original) {
    fs.writeFileSync(filePath, html, "utf8");
    updated += 1;
  }
}

console.log(`Instagram, Facebook and WeChat contacts synced across ${updated} of ${matched} footer HTML files.`);
