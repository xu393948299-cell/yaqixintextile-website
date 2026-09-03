#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  homepageYouTubeVideoLimit,
  youtubeChannelUrl,
  youtubeVideos,
} from "../data/youtube-content.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const homepagePath = path.join(root, "index.html");
const startMarker = "<!-- YAQIXIN_YOUTUBE_MODULE_START -->";
const endMarker = "<!-- YAQIXIN_YOUTUBE_MODULE_END -->";
const stylesheetHref = "/yaqixin-assets/yaqixin-youtube.css?v=20260903-youtube-module";
const scriptSrc = "/yaqixin-assets/yaqixin-youtube-module.js?v=20260903-youtube-module";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function videoIdFromUrl(value) {
  const url = new URL(value);
  if (url.hostname === "youtu.be") return url.pathname.slice(1);
  if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/")[2];
  return url.searchParams.get("v");
}

const featuredVideos = youtubeVideos.filter((video) => video.enabled).slice(0, homepageYouTubeVideoLimit);
if (featuredVideos.length !== homepageYouTubeVideoLimit) {
  throw new Error(`Expected ${homepageYouTubeVideoLimit} enabled homepage videos, found ${featuredVideos.length}.`);
}

function renderCard(video) {
  const videoId = videoIdFromUrl(video.youtubeUrl);
  if (!videoId) throw new Error(`Unable to read a YouTube video ID from ${video.youtubeUrl}`);

  const title = escapeHtml(video.title);
  return `      <article class="youtube-card" data-youtube-card>
        <div class="youtube-card-media" data-youtube-player>
          <button class="youtube-card-play" type="button" data-youtube-embed data-youtube-video-id="${escapeHtml(videoId)}" data-youtube-title="${title}" aria-label="Play ${title} on YouTube">
            <img src="${escapeHtml(video.thumbnail)}" alt="${escapeHtml(video.alt)}" loading="lazy" decoding="async" width="640" height="360">
            <span class="youtube-card-scrim" aria-hidden="true"></span>
            <span class="youtube-play-mark" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="m9.2 7.45 7.15 4.55-7.15 4.55V7.45Z" fill="currentColor"></path></svg></span>
          </button>
          <noscript><a class="youtube-noscript-link" href="${escapeHtml(video.youtubeUrl)}" target="_blank" rel="noopener noreferrer external">Watch ${title} on YouTube</a></noscript>
        </div>
        <div class="youtube-card-copy">
          <p class="youtube-card-category">${escapeHtml(video.category)}</p>
          <h3>${title}</h3>
        </div>
      </article>`;
}

function renderModule(eol) {
  const cards = featuredVideos.map(renderCard).join(eol);
  return [
    startMarker,
    '    <section class="youtube-showcase" id="youtube" aria-labelledby="youtube-heading">',
    '      <div class="youtube-showcase-wrap">',
    '        <div class="youtube-showcase-head">',
    '          <div>',
    '            <p class="eyebrow">YAQIXIN on YouTube</p>',
    '            <h2 id="youtube-heading">See YAQIXIN in Action</h2>',
    '          </div>',
    '          <div class="youtube-showcase-intro">',
    '            <p>Real fabric stock, sourcing, sampling and production updates from Guangzhou.</p>',
    '            <p>Watch how fabrics are sourced, checked and prepared for apparel buyers.</p>',
    '          </div>',
    '        </div>',
    '        <div class="youtube-card-grid">',
    cards,
    '        </div>',
    `        <div class="youtube-showcase-cta"><a href="${escapeHtml(youtubeChannelUrl)}" target="_blank" rel="noopener noreferrer external" aria-label="Watch more YAQIXIN Textile videos on YouTube">Watch More on YouTube <span aria-hidden="true">→</span></a></div>`,
    '      </div>',
    '    </section>',
    endMarker,
  ].join(eol);
}

let html = fs.readFileSync(homepagePath, "utf8");
const original = html;
const eol = html.includes("\r\n") ? "\r\n" : "\n";
const stylesheet = `<link rel="stylesheet" href="${stylesheetHref}">`;
const script = `<script src="${scriptSrc}" defer></script>`;

if (/yaqixin-youtube\.css\?v=[^"']+/.test(html)) {
  html = html.replace(/\/yaqixin-assets\/yaqixin-youtube\.css\?v=[^"']+/, stylesheetHref);
} else {
  html = html.replace(/(<link rel="stylesheet" href="\/yaqixin-assets\/yaqixin-instagram\.css\?v=[^"']+">)/, `$1${eol}${stylesheet}`);
}

if (/yaqixin-youtube-module\.js\?v=[^"']+/.test(html)) {
  html = html.replace(/\/yaqixin-assets\/yaqixin-youtube-module\.js\?v=[^"']+/, scriptSrc);
} else {
  html = html.replace("</body>", `  ${script}${eol}</body>`);
}

const moduleMarkup = renderModule(eol);
const markerPattern = /<!-- YAQIXIN_YOUTUBE_MODULE_START -->[\s\S]*?<!-- YAQIXIN_YOUTUBE_MODULE_END -->\r?\n?/;
if (markerPattern.test(html)) {
  html = html.replace(markerPattern, `${moduleMarkup}${eol}`);
} else {
  const instagramStart = html.indexOf('<section class="instagram-wall"');
  if (instagramStart < 0) throw new Error("Unable to locate the Instagram wall for YouTube module insertion.");
  html = `${html.slice(0, instagramStart)}${moduleMarkup}${eol}${html.slice(instagramStart)}`;
}

if (html !== original) fs.writeFileSync(homepagePath, html, "utf8");
console.log(`YouTube homepage module built with ${featuredVideos.length} featured videos.`);
