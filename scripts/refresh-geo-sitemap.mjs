import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sitemapPath = path.join(root, "sitemap.xml");
const releaseDate = process.argv[2];

if (!/^\d{4}-\d{2}-\d{2}$/.test(releaseDate || "")) {
  throw new Error("Usage: node scripts/refresh-geo-sitemap.mjs YYYY-MM-DD");
}

const changedFiles = new Set(
  execFileSync("git", ["diff", "--name-only", "HEAD", "--"], { cwd: root, encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean)
    .map((file) => file.replaceAll("\\", "/")),
);

function sourceFileForPathname(pathname) {
  const cleanPath = pathname.replace(/^\/+|\/+$/g, "");
  if (!cleanPath) return "index.html";
  if (cleanPath === "es") return "es/index.html";
  if (cleanPath === "blog") return "blog/index.html";
  if (cleanPath.startsWith("blog/")) return `${cleanPath}/index.html`;
  return `${cleanPath}.html`;
}

function xmlUrl(route, indent = "  ") {
  return `${indent}<url>\n    <loc>https://www.yaqixintextile.com${route}</loc>\n    <lastmod>${releaseDate}</lastmod>\n  </url>`;
}

const newline = fs.readFileSync(sitemapPath, "utf8").includes("\r\n") ? "\r\n" : "\n";
let sitemap = fs.readFileSync(sitemapPath, "utf8").replace(/\r\n/g, "\n");
let updated = 0;

sitemap = sitemap.replace(/^([ \t]*)<url>\n\s*<loc>https:\/\/www\.yaqixintextile\.com([^<]*)<\/loc>\n\s*<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>\n\s*<\/url>/gm, (block, indent, route) => {
  const sourceFile = sourceFileForPathname(route);
  if (!changedFiles.has(sourceFile)) return block;
  updated += 1;
  return xmlUrl(route, indent);
});

for (const route of ["/about-us", "/inquiry"]) {
  const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`<loc>https://www\\.yaqixintextile\\.com${escapedRoute}</loc>`).test(sitemap)) continue;
  sitemap = sitemap.replace("</urlset>", `${xmlUrl(route)}\n</urlset>`);
  updated += 1;
}

fs.writeFileSync(sitemapPath, `${sitemap.replace(/\n/g, newline).replace(/\s*$/, "")}${newline}`, "utf8");
console.log(`Refreshed ${updated} sitemap URL(s) for ${releaseDate}.`);
