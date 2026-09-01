import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const blogRoot = path.join(root, "blog");
const contentRoot = path.join(blogRoot, "content");
const sitemapPath = path.join(root, "sitemap.xml");
const baseUrl = "https://www.yaqixintextile.com";
const publisher = {
  "@type": "Organization",
  "@id": `${baseUrl}/#organization`,
  name: "YAQIXIN",
  url: `${baseUrl}/`,
  sameAs: [
    "https://www.instagram.com/zhang.mandyzhang/",
    "https://www.facebook.com/profile.php?id=61554639581256",
  ],
  logo: {
    "@type": "ImageObject",
    url: `${baseUrl}/yaqixin-assets/logo-yaqixin-header-solid.webp`,
  },
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[character]));
}

function jsonForScript(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function localAssetPath(assetPath, localRoot) {
  return assetPath.startsWith("/") ? `${localRoot}${assetPath.slice(1)}` : assetPath;
}

function assetFilePath(assetPath) {
  if (typeof assetPath !== "string" || !assetPath.startsWith("/")) {
    throw new Error(`Asset paths must start with /: ${assetPath}`);
  }
  const resolved = path.resolve(root, assetPath.slice(1));
  if (resolved !== path.resolve(root) && !resolved.startsWith(`${path.resolve(root)}${path.sep}`)) {
    throw new Error(`Asset path escapes project root: ${assetPath}`);
  }
  return resolved;
}

function assertDate(value, field, slug) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(new Date(`${value}T00:00:00Z`).getTime())) {
    throw new Error(`${slug}: ${field} must use YYYY-MM-DD.`);
  }
}

function validateArticle(article, index, seenSlugs) {
  const required = ["slug", "title", "excerpt", "coverImage", "coverAlt", "publishedAt", "updatedAt", "author", "readingTime", "seoTitle", "metaDescription", "contentFile", "toc"];
  for (const field of required) {
    if (article[field] === undefined || article[field] === null || article[field] === "") {
      throw new Error(`Article ${index + 1} is missing ${field}.`);
    }
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) {
    throw new Error(`${article.slug}: slug must be lowercase words separated by hyphens.`);
  }
  if (seenSlugs.has(article.slug)) throw new Error(`Duplicate article slug: ${article.slug}`);
  seenSlugs.add(article.slug);
  if (!Array.isArray(article.toc) || article.toc.length === 0) throw new Error(`${article.slug}: toc must contain at least one item.`);
  assertDate(article.publishedAt, "publishedAt", article.slug);
  assertDate(article.updatedAt, "updatedAt", article.slug);
  if (article.updatedAt < article.publishedAt) throw new Error(`${article.slug}: updatedAt cannot be before publishedAt.`);
  if (article.seoTitle.length > 65) console.warn(`Warning: ${article.slug} SEO title is ${article.seoTitle.length} characters.`);
  if (article.metaDescription.length > 165) console.warn(`Warning: ${article.slug} meta description is ${article.metaDescription.length} characters.`);
  const coverPath = assetFilePath(article.coverImage);
  if (!fs.existsSync(coverPath)) throw new Error(`${article.slug}: coverImage does not exist: ${article.coverImage}`);
  const contentPath = path.join(contentRoot, article.contentFile);
  if (!article.contentFile.endsWith(".html") || article.contentFile.includes("..") || !fs.existsSync(contentPath)) {
    throw new Error(`${article.slug}: missing or unsafe contentFile ${article.contentFile}.`);
  }
  const content = fs.readFileSync(contentPath, "utf8");
  if (/<h1(?:\s|>)/i.test(content)) throw new Error(`${article.slug}: content fragment must not contain an h1.`);
  if (/href=(['"])\/[^'\"]+\.html(?:[?#][^'\"]*)?\1/i.test(content)) {
    throw new Error(`${article.slug}: internal links must use Clean URLs without .html.`);
  }
  const headingIds = new Set([...content.matchAll(/<h2\s+id="([^"]+)"/gi)].map((match) => match[1]));
  const tocIds = new Set();
  for (const item of article.toc) {
    if (!item.id || !item.label || tocIds.has(item.id) || !headingIds.has(item.id)) {
      throw new Error(`${article.slug}: toc item does not match a unique h2 id: ${item.id}`);
    }
    tocIds.add(item.id);
  }
  for (const match of content.matchAll(/src="\/([^"\n]+)"/g)) assetFilePath(`/${match[1]}`);
  if (Array.isArray(article.relatedLinks)) {
    for (const link of article.relatedLinks) {
      if (!link.label || !link.url || (!link.url.startsWith("/") && !link.url.startsWith("https://"))) {
        throw new Error(`${article.slug}: relatedLinks must contain label and site-safe URL.`);
      }
      if (link.url.startsWith("/") && /\.html(?:[?#]|$)/i.test(link.url)) {
        throw new Error(`${article.slug}: relatedLinks must use Clean URLs without .html.`);
      }
    }
  }
}

function readArticles() {
  const filePath = path.join(contentRoot, "articles.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!Array.isArray(data.articles) || data.articles.length === 0) {
    throw new Error("blog/content/articles.json must contain at least one article.");
  }
  const seenSlugs = new Set();
  data.articles.forEach((article, index) => validateArticle(article, index, seenSlugs));
  return [...data.articles].sort((left, right) => `${right.updatedAt}-${right.publishedAt}`.localeCompare(`${left.updatedAt}-${left.publishedAt}`));
}

function formattedDate(value) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function latestArticleDate(articles) {
  return articles.reduce((latest, article) => (article.updatedAt > latest ? article.updatedAt : latest), articles[0].updatedAt);
}

function header() {
  const homepage = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const announcement = homepage.match(/<div class="announcement">[\s\S]*?<\/div>/i);
  const navigation = homepage.match(/<nav class="nav">[\s\S]*?<\/nav>/i);
  if (!announcement || !navigation) {
    throw new Error("Homepage announcement or navigation could not be found");
  }
  const normalizedNavigation = navigation[0]
    .replaceAll('href="#top"', 'href="/"')
    .replaceAll('src="yaqixin-assets/', 'src="/yaqixin-assets/')
    .replaceAll('data-src="yaqixin-assets/', 'data-src="/yaqixin-assets/');
  const accessibleAnnouncement = announcement[0].replace(
    '<div class="announcement">',
    '<div class="announcement" role="region" aria-label="YAQIXIN sourcing services">',
  );
  return `${accessibleAnnouncement}\n  ${normalizedNavigation}`;
}

function runtimeScripts(localRoot) {
  return `  <script src="${localRoot}yaqixin-assets/yaqixin-site-polish.js?v=20260812-audit-fixes" defer></script>
  <script src="${localRoot}yaqixin-assets/yaqixin-mobile-menu-sync.js?v=20260824-mobile-contacts" defer></script>
  <script src="${localRoot}blog/header.js?v=20260824-home-nav-2" defer></script>
  <script src="${localRoot}yaqixin-assets/yaqixin-analytics.js?v=20260822-defer" defer></script>
  <script src="${localRoot}yaqixin-assets/yaqixin-lead-system.js" defer></script>
  <script src="${localRoot}yaqixin-assets/yaqixin-wechat-contact.js?v=20260811" defer></script>`;
}

function footer(localRoot) {
  const instagramMark = '<svg class="yx-instagram-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><defs><radialGradient id="yx-instagram-gradient" cx="30%" cy="107%" r="150%"><stop offset="0%" stop-color="#feda75"></stop><stop offset="25%" stop-color="#fa7e1e"></stop><stop offset="50%" stop-color="#d62976"></stop><stop offset="75%" stop-color="#962fbf"></stop></radialGradient></defs><rect x="1" y="1" width="22" height="22" rx="6" fill="url(#yx-instagram-gradient)"></rect><rect x="5.4" y="5.4" width="13.2" height="13.2" rx="4.2" fill="none" stroke="#fff" stroke-width="1.8"></rect><circle cx="12" cy="12" r="3.15" fill="none" stroke="#fff" stroke-width="1.8"></circle><circle cx="16.8" cy="7.2" r="1" fill="#fff"></circle></svg>';
  const facebookMark = '<svg class="yx-facebook-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="11" fill="#0866ff"></circle><path fill="#fff" d="M13.55 20v-7.05h2.36l.35-2.75h-2.71V8.45c0-.8.22-1.34 1.37-1.34h1.46V4.65c-.25-.04-1.12-.11-2.13-.11-2.11 0-3.56 1.29-3.56 3.66v2H8.3v2.75h2.39V20h2.86Z"></path></svg>';
  const wechatMark = '<svg class="yx-wechat-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="1" y="1" width="22" height="22" rx="6" fill="#07c160"></rect><circle cx="9.3" cy="10.2" r="4.4" fill="#fff"></circle><circle cx="15.1" cy="14.2" r="4" fill="#fff"></circle><circle cx="8" cy="9.5" r=".55" fill="#07c160"></circle><circle cx="10.7" cy="9.5" r=".55" fill="#07c160"></circle><circle cx="14" cy="13.6" r=".5" fill="#07c160"></circle><circle cx="16.3" cy="13.6" r=".5" fill="#07c160"></circle></svg>';
  const footer = '<footer class="footer yx-site-footer"><div class="footer-inner"><div class="yx-footer-brand"><strong>YAQIXIN TEXTILES</strong><span>Guangzhou wholesale fabric manufacturer for global apparel sourcing.</span></div><div class="yx-footer-contact"><a class="yx-footer-email" href="mailto:sales@yaqixintextile.com" aria-label="Email YAQIXIN for quotation support">Email: sales@yaqixintextile.com</a><address>Showroom: <a class="yx-footer-map-link" href="https://maps.app.goo.gl/ZruhKKbar7VxfpneA?g_st=ic" target="_blank" rel="noopener noreferrer external" aria-label="Open YAQIXIN showroom in Google Maps">No. 5 Xiaoyang Street, Haizhu District, Guangzhou <span aria-hidden="true">\u2197</span></a></address><div class="yx-social-links" role="navigation" aria-label="YAQIXIN social and messaging contacts"><a class="yx-social-link yx-instagram-link" data-social-profile="instagram" href="https://www.instagram.com/zhang.mandyzhang/" target="_blank" rel="noopener noreferrer external" aria-label="Follow YAQIXIN on Instagram at zhang.mandyzhang">' + instagramMark + '<span>Instagram</span></a><a class="yx-social-link yx-facebook-link" data-social-profile="facebook" href="https://www.facebook.com/profile.php?id=61554639581256" target="_blank" rel="noopener noreferrer external" aria-label="Visit YAQIXIN on Facebook">' + facebookMark + '<span>Facebook</span></a><a class="yx-social-link yx-wechat-link" data-social-profile="wechat" data-wechat-trigger href="/yaqixin-assets/wechat-contact-13172537921.webp" aria-label="Open WeChat QR code for YAQIXIN sales contact 13172537921">' + wechatMark + '<span>WeChat 13172537921</span></a></div></div></div></footer>';
  return footer.replace("manufacturer", "supplier") + '\n' + runtimeScripts(localRoot);
}

function localPreviewScript(localRoot) {
  return `<script>
  (function () {
    if (location.protocol !== "file:") return;
    var localRoot = "${localRoot}";
    var toLocalPath = function (value) {
      var match = value.match(/^([^?#]*)(.*)$/);
      var pathname = match[1];
      var suffix = match[2];
      if (pathname === "/") return localRoot + "index.html" + suffix;
      if (pathname === "/blog") return localRoot + "blog/index.html" + suffix;
      if (pathname.indexOf("/blog/") === 0 && !/\\.[a-z0-9]+$/i.test(pathname)) {
        return localRoot + pathname.slice(1) + "/index.html" + suffix;
      }
      return localRoot + pathname.slice(1) + suffix;
    };
    document.addEventListener("DOMContentLoaded", function () {
      document.querySelectorAll('[href^="/"], [src^="/"]').forEach(function (element) {
        var attribute = element.hasAttribute("href") ? "href" : "src";
        element.setAttribute(attribute, toLocalPath(element.getAttribute(attribute)));
      });
    });
  })();
  </script>`;
}

function commonHead({ title, description, canonicalPath, image, type = "website", publishedAt, updatedAt, author, stylesHref, faviconHref, localRoot }) {
  const canonical = `${baseUrl}${canonicalPath}`;
  const imageUrl = `${baseUrl}${image}`;
  const cardsStylesHref = stylesHref.replace(/styles\.css$/, "cards.css");
  const articleMeta = type === "article" ? `
  <meta property="article:published_time" content="${publishedAt}T00:00:00+00:00">
  <meta property="article:modified_time" content="${updatedAt}T00:00:00+00:00">
  <meta property="article:author" content="${escapeHtml(author)}">` : "";
  return `<meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow">
  <title>${escapeHtml(title)}</title>
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="YAQIXIN">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${imageUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${imageUrl}">
  <script>document.write('<link rel="stylesheet" href="' + (location.protocol === "file:" ? "${stylesHref}" : "/blog/styles.css") + '">');</script>
  <script>document.write('<link rel="stylesheet" href="' + (location.protocol === "file:" ? "${cardsStylesHref}" : "/blog/cards.css") + '">');</script>
  <noscript><link rel="stylesheet" href="/blog/styles.css"><link rel="stylesheet" href="/blog/cards.css"></noscript>
  <link rel="stylesheet" href="${localRoot}yaqixin-assets/yaqixin-product-menu.css">
  <link rel="stylesheet" href="${localRoot}blog/header.css?v=20260824-home-nav">
   <link rel="stylesheet" href="/yaqixin-assets/yaqixin-instagram.css?v=20260812-footer-map">
  <link rel="icon" href="${faviconHref}" type="image/png">
  ${localPreviewScript(localRoot)}${articleMeta}`;
}

function articleCard(article, localRoot, featured = false) {
  const cover = localAssetPath(article.coverImage, localRoot);
  const category = article.category || "Sourcing guide";
  return `<article class="article-card${featured ? " article-card-featured" : ""}"><a class="article-card-image" href="/blog/${article.slug}" aria-label="Read ${escapeHtml(article.title)}"><img src="${cover}" alt="${escapeHtml(article.coverAlt)}" width="1672" height="941"${featured ? " fetchpriority=\"high\"" : " loading=\"lazy\""}></a><div class="article-card-body"><span class="eyebrow">${escapeHtml(category)}</span><h2><a href="/blog/${article.slug}">${escapeHtml(article.title)}</a></h2><p>${escapeHtml(article.excerpt)}</p><div class="article-meta"><time datetime="${article.publishedAt}">${formattedDate(article.publishedAt)}</time><span>${escapeHtml(article.readingTime)}</span></div><a class="btn" href="/blog/${article.slug}">Read Article</a></div></article>`;
}

function buildIndex(articles) {
  const primary = articles[0];
  const listSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Fabric Sourcing Blog | YAQIXIN",
    url: `${baseUrl}/blog`,
    description: "Practical notes for apparel buyers, fabric wholesalers, and sourcing teams.",
    isPartOf: { "@type": "WebSite", name: "YAQIXIN", url: `${baseUrl}/` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${baseUrl}/blog/${article.slug}`,
        name: article.title,
      })),
    },
  };
  const cards = articles.map((article, index) => articleCard(article, "../", index === 0)).join("\n");
  const output = `<!doctype html>
<html lang="en">
<head>
  ${commonHead({ title: "Fabric Sourcing Blog | YAQIXIN", description: "Practical fabric sourcing guidance for apparel buyers, importers, wholesalers, and product teams.", canonicalPath: "/blog", image: primary.coverImage, stylesHref: "styles.css", faviconHref: "../yaqixin-assets/favicon.png", localRoot: "../" })}
  <script type="application/ld+json">${jsonForScript(listSchema)}</script>
</head>
<body>
  ${header("blog")}
  <main>
    <section class="page-hero"><div class="site-shell page-hero-grid"><div><span class="eyebrow">YAQIXIN Journal</span><h1>Practical fabric sourcing notes for apparel buyers.</h1><p>Clear, useful guidance for teams comparing fabrics, developing samples, and preparing wholesale orders. We publish only when a topic helps a buyer make a better next decision.</p></div><aside class="page-hero-note"><strong>Built for real sourcing conversations.</strong><br>Use these articles to shape a more useful brief, then confirm the sample, specification, and commercial terms for your own order.</aside></div></section>
    <section class="blog-list"><div class="site-shell"><div class="article-grid">${cards}</div></div></section>
  </main>
  ${footer("../")}
</body>
</html>`;
  fs.writeFileSync(path.join(blogRoot, "index.html"), `${output}\n`, "utf8");
}

function relatedLinksMarkup(article) {
  if (!Array.isArray(article.relatedLinks) || article.relatedLinks.length === 0) return "";
  const links = article.relatedLinks.map((link) => `<li><a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a></li>`).join("");
  return `<section class="related-links" aria-labelledby="related-links-title"><h2 id="related-links-title">Related sourcing pages</h2><ul>${links}</ul></section>`;
}

function articleWordCount(content) {
  const plainText = content
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ");
  return (plainText.match(/\b[A-Za-z0-9][A-Za-z0-9'-]*\b/g) || []).length;
}

function buildArticle(article) {
  const contentPath = path.join(contentRoot, article.contentFile);
  const content = fs.readFileSync(contentPath, "utf8").trim();
  let tableIndex = 0;
  const contentWithLocalAssets = content
    .replace(/src="\/([^"\n]+)"/g, 'src="../../$1"')
    .replace(
      /<div class="article-table-wrap">/g,
      () => {
        tableIndex += 1;
        return `<div class="article-table-wrap" tabindex="0" role="region" aria-label="Scrollable fabric comparison table ${tableIndex}">`;
      },
    );
  const articlePath = `/blog/${article.slug}`;
  const articleCover = localAssetPath(article.coverImage, "../../");
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${baseUrl}/blog` },
      { "@type": "ListItem", position: 3, name: article.title, item: `${baseUrl}${articlePath}` },
    ],
  };
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.metaDescription,
    image: [`${baseUrl}${article.coverImage}`],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Organization",
      name: article.author,
      url: `${baseUrl}/about-us`,
    },
    publisher,
    articleSection: article.category || "Sourcing guide",
    wordCount: articleWordCount(content),
    ...(article.primaryKeyword ? { keywords: article.primaryKeyword } : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": `${baseUrl}${articlePath}` },
    inLanguage: "en",
  };
  const coverCaption = article.coverCaption || article.coverAlt;
  const toc = article.toc.map((item) => `<a href="#${escapeHtml(item.id)}">${escapeHtml(item.label)}</a>`).join("\n");
  const related = relatedLinksMarkup(article);
  const output = `<!doctype html>
<html lang="en">
<head>
  ${commonHead({ title: article.seoTitle, description: article.metaDescription, canonicalPath: articlePath, image: article.coverImage, type: "article", publishedAt: article.publishedAt, updatedAt: article.updatedAt, author: article.author, stylesHref: "../styles.css", faviconHref: "../../yaqixin-assets/favicon.png", localRoot: "../../" })}
  <script type="application/ld+json">${jsonForScript(articleSchema)}</script>
  <script type="application/ld+json">${jsonForScript(breadcrumbs)}</script>
</head>
<body>
  ${header("blog")}
  <main class="article-page"><div class="site-shell"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/blog">Blog</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(article.title)}</span></nav><header class="article-intro"><span class="eyebrow">${escapeHtml(article.category || "Sourcing guide")}</span><h1>${escapeHtml(article.title)}</h1><div class="article-meta"><time datetime="${article.publishedAt}">Published ${formattedDate(article.publishedAt)}</time><span>Updated ${formattedDate(article.updatedAt)}</span><span>${escapeHtml(article.readingTime)}</span><span>By <a class="article-author" href="/about-us">${escapeHtml(article.author)}</a></span></div><p class="dek">${escapeHtml(article.excerpt)}</p></header><figure class="article-cover"><img src="${articleCover}" width="1672" height="941" fetchpriority="high" alt="${escapeHtml(article.coverAlt)}"><figcaption>${escapeHtml(coverCaption)}</figcaption></figure><div class="article-layout"><aside class="article-toc" aria-label="Article contents"><strong>In this guide</strong>${toc}</aside><article class="article-body">${contentWithLocalAssets}<section class="article-cta" aria-labelledby="article-cta-title"><h2 id="article-cta-title">Ready to discuss a fabric brief?</h2><p>Share your intended application, a reference image or swatch, quantity, and market. We can help you compare a stock or custom fabric route before you place a bulk order.</p><a class="btn" href="/custom-capability">Start a fabric inquiry</a></section>${related}<a class="back-to-blog" href="/blog">Back to Blog</a></article></div></div></main>
  ${footer("../../")}
</body>
</html>`;
  const outputDirectory = path.join(blogRoot, article.slug);
  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.writeFileSync(path.join(outputDirectory, "index.html"), `${output}\n`, "utf8");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function syncSitemap(articles) {
  let sitemap = fs.readFileSync(sitemapPath, "utf8");
  const eol = sitemap.includes("\r\n") ? "\r\n" : "\n";
  const updates = [
    { url: `${baseUrl}/blog`, lastmod: latestArticleDate(articles) },
    ...articles.map((article) => ({ url: `${baseUrl}/blog/${article.slug}`, lastmod: article.updatedAt })),
  ];
  for (const update of updates) {
    const urlPattern = escapeRegExp(update.url);
    const entryPattern = new RegExp(`(<url>\\s*<loc>${urlPattern}</loc>\\s*<lastmod>)[^<]+(</lastmod>)`, "m");
    if (entryPattern.test(sitemap)) {
      sitemap = sitemap.replace(entryPattern, `$1${update.lastmod}$2`);
    } else {
      const entry = `  <url>${eol}    <loc>${update.url}</loc>${eol}    <lastmod>${update.lastmod}</lastmod>${eol}  </url>${eol}`;
      if (!sitemap.includes("</urlset>")) throw new Error("sitemap.xml is missing </urlset>.");
      sitemap = sitemap.replace("</urlset>", `${entry}</urlset>`);
    }
  }
  for (const update of updates) {
    if (!sitemap.includes(`<loc>${update.url}</loc>`)) throw new Error(`Sitemap sync failed for ${update.url}`);
  }
  fs.writeFileSync(sitemapPath, sitemap, "utf8");
}

const articles = readArticles();
buildIndex(articles);
articles.forEach(buildArticle);
syncSitemap(articles);
console.log(`Built /blog and ${articles.length} article route${articles.length === 1 ? "" : "s"}; synchronized Sitemap and runtime tracking.`);
