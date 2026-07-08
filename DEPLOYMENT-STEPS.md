# YAQIXIN Website Deployment Notes

Primary domain: `www.yaqixintextile.com`

## Current Release Package

- Publish folder: this repository root
- Homepage: `index.html`
- Sitemap: `https://www.yaqixintextile.com/sitemap.xml`
- Robots: `https://www.yaqixintextile.com/robots.txt`
- Deprecated duplicate homepage redirect: `/GG-optimized-v9-denim-seo.html` -> `/`
- Deprecated About Us redirect: `/about-us.html` -> `/custom-capability.html`

## Recommended First Launch Route

1. Push this folder to a new GitHub repository.
2. Import that GitHub repository into Vercel.
3. Confirm the Vercel preview URL works.
4. Add `www.yaqixintextile.com` in Vercel Domains.
5. Add the DNS records Vercel provides inside Alibaba Cloud DNS.
6. After the site is live, submit `https://www.yaqixintextile.com/sitemap.xml` to Google Search Console.

## Asset Note

The release currently keeps all local product images and videos in `yaqixin-assets`.
Videos are the largest part of the package. After the first launch is stable, move videos to Cloudflare R2 or compress them to reduce repository and deployment size.
