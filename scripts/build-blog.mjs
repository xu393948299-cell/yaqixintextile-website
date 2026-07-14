import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const blogRoot = path.join(root, "blog");
const contentRoot = path.join(blogRoot, "content");
const baseUrl = "https://www.yaqixintextile.com";
const publisher = {
  "@type": "Organization",
  name: "YAQIXIN",
  url: `${baseUrl}/`,
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

function readArticles() {
  const filePath = path.join(contentRoot, "articles.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!Array.isArray(data.articles) || data.articles.length === 0) {
    throw new Error("blog/content/articles.json must contain at least one article.");
  }
  return data.articles;
}

function formattedDate(value) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function header(active) {
  return `<div class="announcement">Wholesale fabric sourcing · Stock + custom programs · Export-ready order support</div>
  <nav class="site-nav" aria-label="Primary navigation">
    <a class="brand" href="/" aria-label="YAQIXIN home">YAQIXIN</a>
    <div class="menu">
      <a href="/">Home</a>
      <a href="/all-products.html">Products</a>
      <a href="/blog"${active === "blog" ? ' aria-current="page"' : ""}>Blog</a>
      <a href="/custom-capability.html"${active === "customize" ? ' aria-current="page"' : ""}>Customize</a>
    </div>
    <a class="nav-inquiry" href="/#inquiry">Inquiry</a>
  </nav>`;
}

function footer() {
  return `<footer class="footer"><div class="footer-inner"><div><strong>YAQIXIN TEXTILES</strong><p>Guangzhou wholesale fabric manufacturer for global apparel sourcing.</p></div><div><p>WhatsApp: +86 18125117673 / +86 13632259091<br>Email for quotation documents: 378080571@qq.com</p></div></div></footer>`;
}

function commonHead({ title, description, canonicalPath, image, type = "website", publishedAt, updatedAt, author }) {
  const canonical = `${baseUrl}${canonicalPath}`;
  const imageUrl = `${baseUrl}${image}`;
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
  <link rel="stylesheet" href="/blog/styles.css">
  <link rel="icon" href="/yaqixin-assets/favicon.png" type="image/png">${articleMeta}`;
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
  const card = `<article class="article-card"><a class="article-card-image" href="/blog/${primary.slug}" aria-label="Read ${escapeHtml(primary.title)}"><img src="${primary.coverImage}" alt="${escapeHtml(primary.coverAlt)}" width="1672" height="941" fetchpriority="high"></a><div class="article-card-body"><span class="eyebrow">Sourcing guide</span><h2><a href="/blog/${primary.slug}">${escapeHtml(primary.title)}</a></h2><p>${escapeHtml(primary.excerpt)}</p><div class="article-meta"><time datetime="${primary.publishedAt}">${formattedDate(primary.publishedAt)}</time><span>${escapeHtml(primary.readingTime)}</span></div><a class="btn" href="/blog/${primary.slug}">Read Article</a></div></article>`;
  const output = `<!doctype html>
<html lang="en">
<head>
  ${commonHead({ title: "Fabric Sourcing Blog | YAQIXIN", description: "Practical fabric sourcing guidance for apparel buyers, importers, wholesalers, and product teams.", canonicalPath: "/blog", image: primary.coverImage })}
  <script type="application/ld+json">${jsonForScript(listSchema)}</script>
</head>
<body>
  ${header("blog")}
  <main>
    <section class="page-hero"><div class="site-shell page-hero-grid"><div><span class="eyebrow">YAQIXIN Journal</span><h1>Practical fabric sourcing notes for apparel buyers.</h1><p>Clear, useful guidance for teams comparing fabrics, developing samples, and preparing wholesale orders. We publish only when a topic helps a buyer make a better next decision.</p></div><aside class="page-hero-note"><strong>Built for real sourcing conversations.</strong><br>Use these articles to shape a more useful brief, then confirm the sample, specification, and commercial terms for your own order.</aside></div></section>
    <section class="blog-list"><div class="site-shell">${card}</div></section>
  </main>
  ${footer()}
</body>
</html>`;
  fs.writeFileSync(path.join(blogRoot, "index.html"), `${output}\n`, "utf8");
}

function buildArticle(article) {
  const contentPath = path.join(contentRoot, article.contentFile);
  if (!fs.existsSync(contentPath)) throw new Error(`Missing article content file: ${article.contentFile}`);
  const content = fs.readFileSync(contentPath, "utf8").trim();
  const articlePath = `/blog/${article.slug}`;
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
    author: { "@type": "Organization", name: article.author },
    publisher,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${baseUrl}${articlePath}` },
    inLanguage: "en",
  };
  const coverCaption = article.coverCaption || article.coverAlt;
  const toc = article.toc.map((item) => `<a href="#${escapeHtml(item.id)}">${escapeHtml(item.label)}</a>`).join("\n");
  const output = `<!doctype html>
<html lang="en">
<head>
  ${commonHead({ title: article.seoTitle, description: article.metaDescription, canonicalPath: articlePath, image: article.coverImage, type: "article", publishedAt: article.publishedAt, updatedAt: article.updatedAt, author: article.author })}
  <script type="application/ld+json">${jsonForScript(articleSchema)}</script>
  <script type="application/ld+json">${jsonForScript(breadcrumbs)}</script>
</head>
<body>
  ${header("blog")}
  <main class="article-page"><div class="site-shell"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/blog">Blog</a><span aria-hidden="true">/</span><span aria-current="page">Wholesale Fabric Sourcing Guide</span></nav><header class="article-intro"><span class="eyebrow">Sourcing guide</span><h1>${escapeHtml(article.title)}</h1><div class="article-meta"><time datetime="${article.publishedAt}">Published ${formattedDate(article.publishedAt)}</time><span>Updated ${formattedDate(article.updatedAt)}</span><span>${escapeHtml(article.readingTime)}</span><span>By ${escapeHtml(article.author)}</span></div><p class="dek">${escapeHtml(article.excerpt)}</p></header><figure class="article-cover"><img src="${article.coverImage}" width="1672" height="941" fetchpriority="high" alt="${escapeHtml(article.coverAlt)}"><figcaption>${escapeHtml(coverCaption)}</figcaption></figure><div class="article-layout"><aside class="article-toc" aria-label="Article contents"><strong>In this guide</strong>${toc}</aside><article class="article-body">${content}<section class="article-cta" aria-labelledby="article-cta-title"><h2 id="article-cta-title">Ready to discuss a fabric brief?</h2><p>Share your intended application, a reference image or swatch, quantity, and market. We can help you compare a stock or custom fabric route before you place a bulk order.</p><a class="btn" href="/custom-capability.html">Start a fabric inquiry</a></section><a class="back-to-blog" href="/blog">Back to Blog</a></article></div></div></main>
  ${footer()}
</body>
</html>`;
  const outputDirectory = path.join(blogRoot, article.slug);
  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.writeFileSync(path.join(outputDirectory, "index.html"), `${output}\n`, "utf8");
}

const articles = readArticles();
buildIndex(articles);
articles.forEach(buildArticle);
console.log(`Built /blog and ${articles.length} article route${articles.length === 1 ? "" : "s"}.`);
