# YAQIXIN Blog Maintenance

The public Blog is static HTML so readers and search crawlers receive the full article without client-side rendering.

## Source files

- `content/articles.json` is the article registry. It contains the slug, title, excerpt, image metadata, dates, author, reading time, SEO fields, content file, and table-of-contents entries.
- `content/<slug>.html` is the semantic article body. Keep its headings and IDs aligned with the `toc` entries in the registry.
- `styles.css` is the shared visual system for the Blog list and article pages.
- `../scripts/build-blog.mjs` generates the public list page and article route pages.

## Add another article

1. Add a new object to `content/articles.json` with a unique `slug`.
2. Add the matching semantic HTML fragment in `content/<slug>.html`.
3. Use a project-owned image or a clearly labelled editorial asset. Do not describe a generated image as a factory, product, customer, or certification photograph.
4. Run `node scripts/build-blog.mjs` from the project root.
5. Add the generated `/blog/<slug>` URL to `sitemap.xml`, then validate the page before publishing.

## Current image provenance

- `yaqixin-assets/blog/wholesale-fabric-sourcing-editorial-cover.webp` is a generated editorial cover image. It is not represented as a YAQIXIN factory or customer photograph.
- The in-article warehouse and showroom photos are existing project assets and retain descriptive alt text.
