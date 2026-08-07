# YAQIXIN Blog Maintenance

The public Blog is static HTML so readers and search crawlers receive the full article without client-side rendering.

## Source files

- `content/articles.json` is the article registry. It contains the slug, title, excerpt, image metadata, dates, author, category, optional primary keyword, reading time, SEO fields, content file, and table-of-contents entries. Optional `relatedLinks` can add relevant product or capability links under an article.
- `content/<slug>.html` is the semantic article body. Keep its headings and IDs aligned with the `toc` entries in the registry.
- `styles.css` is the shared visual system for the Blog list and article pages.
- `cards.css` contains the responsive multi-article card layout.
- `../scripts/build-blog.mjs` generates the public list page and article route pages, validates the registry and article assets, and synchronizes the Blog URLs in `sitemap.xml`.

## Add another article

1. Add a new object to `content/articles.json` with a unique, lowercase `slug` and the SEO fields.
2. Add the matching semantic HTML fragment in `content/<slug>.html`; keep the `<h2 id="...">` values aligned with the `toc` entries.
3. Use a project-owned image or a clearly labelled editorial asset. Do not describe a generated image as a factory, product, customer, or certification photograph.
4. Run `node scripts/build-blog.mjs` from the project root. The command renders every registered article on the Blog home, creates its route, validates dates/slugs/content/TOC/local images, and updates the Blog entries in `sitemap.xml` automatically.
5. Review the generated page, then commit and push. GA4 and inquiry tracking scripts are included automatically, so rebuilding does not remove measurement or lead capture.

Do not change the `slug` after an article is published. If the content changes, update `updatedAt`; the builder will use it as the article and sitemap modification date.

## Current image provenance

- `yaqixin-assets/blog/wholesale-fabric-sourcing-editorial-cover.webp` is a generated editorial cover image. It is not represented as a YAQIXIN factory or customer photograph.
- The in-article warehouse and showroom photos are existing project assets and retain descriptive alt text.
