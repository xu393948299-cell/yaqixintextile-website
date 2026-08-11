import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const instagramUrl = "https://www.instagram.com/zhang.mandyzhang/";
const facebookUrl = "https://www.facebook.com/profile.php?id=61554639581256";
const wechatQrUrl = "/yaqixin-assets/wechat-contact-13172537921.webp";
const stylesheetHref = "/yaqixin-assets/yaqixin-instagram.css?v=20260811-footer";
const stylesheet = `<link rel="stylesheet" href="${stylesheetHref}">`;
const wechatScript = '<script src="/yaqixin-assets/yaqixin-wechat-contact.js?v=20260811" defer></script>';
const instagramMark = '<svg class="yx-instagram-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><defs><radialGradient id="yx-instagram-gradient" cx="30%" cy="107%" r="150%"><stop offset="0%" stop-color="#feda75"></stop><stop offset="25%" stop-color="#fa7e1e"></stop><stop offset="50%" stop-color="#d62976"></stop><stop offset="75%" stop-color="#962fbf"></stop><stop offset="100%" stop-color="#4f5bd5"></stop></radialGradient></defs><rect x="1" y="1" width="22" height="22" rx="6" fill="url(#yx-instagram-gradient)"></rect><rect x="5.4" y="5.4" width="13.2" height="13.2" rx="4.2" fill="none" stroke="#fff" stroke-width="1.8"></rect><circle cx="12" cy="12" r="3.15" fill="none" stroke="#fff" stroke-width="1.8"></circle><circle cx="16.8" cy="7.2" r="1" fill="#fff"></circle></svg>';
const facebookMark = '<svg class="yx-facebook-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="11" fill="#0866ff"></circle><path fill="#fff" d="M13.55 20v-7.05h2.36l.35-2.75h-2.71V8.45c0-.8.22-1.34 1.37-1.34h1.46V4.65c-.25-.04-1.12-.11-2.13-.11-2.11 0-3.56 1.29-3.56 3.66v2H8.3v2.75h2.39V20h2.86Z"></path></svg>';
const wechatMark = '<svg class="yx-wechat-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="1" y="1" width="22" height="22" rx="6" fill="#07c160"></rect><circle cx="9.3" cy="10.2" r="4.4" fill="#fff"></circle><circle cx="15.1" cy="14.2" r="4" fill="#fff"></circle><circle cx="8" cy="9.5" r=".55" fill="#07c160"></circle><circle cx="10.7" cy="9.5" r=".55" fill="#07c160"></circle><circle cx="14" cy="13.6" r=".5" fill="#07c160"></circle><circle cx="16.3" cy="13.6" r=".5" fill="#07c160"></circle></svg>';
const instagramLinkMarkup = `<a class="yx-social-link yx-instagram-link" data-social-profile="instagram" href="${instagramUrl}" target="_blank" rel="noopener noreferrer external" aria-label="Follow YAQIXIN on Instagram at zhang.mandyzhang">${instagramMark}<span>Instagram</span></a>`;
const facebookLinkMarkup = `<a class="yx-social-link yx-facebook-link" data-social-profile="facebook" href="${facebookUrl}" target="_blank" rel="noopener noreferrer external" aria-label="Visit YAQIXIN on Facebook">${facebookMark}<span>Facebook</span></a>`;
const wechatLinkMarkup = `<a class="yx-social-link yx-wechat-link" data-social-profile="wechat" data-wechat-trigger href="${wechatQrUrl}" aria-label="Open WeChat QR code for YAQIXIN sales contact 13172537921">${wechatMark}<span>WeChat</span></a>`;
const socialLinksMarkup = `<div class="yx-social-links" aria-label="YAQIXIN social and messaging contacts">${instagramLinkMarkup}${facebookLinkMarkup}${wechatLinkMarkup}</div>`;

function buildFooterMarkup(tagline) {
  return `<footer class="footer yx-site-footer"><div class="footer-inner"><div class="yx-footer-brand"><strong>YAQIXIN TEXTILES</strong><span>${tagline}</span></div><div class="yx-footer-contact"><a class="yx-footer-email" href="mailto:378080571@qq.com" aria-label="Email YAQIXIN for quotation support">Email: 378080571@qq.com</a><address>Showroom: No. 5 Xiaoyang Street, Haizhu District, Guangzhou</address>${socialLinksMarkup}</div></div></footer>`;
}

const missingFooterProducts = new Set([
  "dx54-1-3d-flower-embroidery-sequin-tulle-mesh-fabric.html",
  "yx2284-3d-flower-embroidery-pearl-sequin-tulle-fabric.html",
  "yx920-thickened-champagne-ivory-mikado-satin-fabric.html",
]);

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
  const relativePath = path.relative(root, filePath).replaceAll(path.sep, "/");
  if (relativePath.startsWith("blog/content/") || relativePath.startsWith("downloads/")) continue;

  const original = fs.readFileSync(filePath, "utf8");
  const hasFooter = /<footer\b[^>]*class=["'][^"']*\bfooter\b[^"']*["'][^>]*>/i.test(original);
  const isMissingFooterProduct = missingFooterProducts.has(relativePath);
  if (!hasFooter && !isMissingFooterProduct) continue;
  matched += 1;

  const eol = original.includes("\r\n") ? "\r\n" : "\n";
  let html = original;
  const tagline = relativePath.startsWith("es/")
    ? "Abastecimiento de telas para compradores de confección."
    : "Guangzhou wholesale fabric manufacturer for global apparel sourcing.";

  if (html.includes("yaqixin-instagram.css")) {
    html = html.replace(/\/yaqixin-assets\/yaqixin-instagram\.css\?v=[^"']+/, stylesheetHref);
  } else {
    html = html.replace("</head>", `  ${stylesheet}${eol}</head>`);
  }

  if (!html.includes("yaqixin-wechat-contact.js")) {
    html = html.replace("</body>", `  ${wechatScript}${eol}</body>`);
  }

  // Keep injected asset lines free of CR characters so `git diff --check`
  // remains clean even in legacy files that otherwise use CRLF endings.
  html = html.replace(
    /(^[ \t]*<link rel="stylesheet" href="\/yaqixin-assets\/yaqixin-instagram\.css\?v=20260811-footer">)\r?\n/m,
    "$1\n",
  );
  html = html.replace(
    /(^[ \t]*<script src="\/yaqixin-assets\/yaqixin-wechat-contact\.js\?v=20260811" defer><\/script>)\r?\n/m,
    "$1\n",
  );

  const footerMarkup = buildFooterMarkup(tagline);
  const footerPattern = /<footer\b[^>]*class=["'][^"']*\bfooter\b[^"']*["'][^>]*>[\s\S]*?<\/footer>/i;
  if (footerPattern.test(html)) {
    html = html.replace(footerPattern, footerMarkup);
  } else if (isMissingFooterProduct) {
    const floatingMarker = html.search(/<a\s+class=["'][^"']*\bwhatsapp\b|<div\s+class=["'][^"']*\bmobile-action-bar\b/i);
    if (floatingMarker >= 0) {
      html = `${html.slice(0, floatingMarker)}${footerMarkup}${eol}${html.slice(floatingMarker)}`;
    } else if (/<\/body>/i.test(html)) {
      html = html.replace(/<\/body>/i, `${footerMarkup}${eol}</body>`);
    } else {
      throw new Error(`Unable to insert footer in ${relativePath}`);
    }
  } else {
    throw new Error(`Unable to locate footer in ${relativePath}`);
  }

  html = html.replace(/\s*<style id="homepage-footer-preview">[\s\S]*?<\/style>\s*/i, eol);

  if (html !== original) {
    fs.writeFileSync(filePath, html, "utf8");
    updated += 1;
  }
}

console.log(`Unified footer contacts synced across ${updated} of ${matched} storefront HTML files.`);
