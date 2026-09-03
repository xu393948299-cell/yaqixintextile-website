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
const homepage = fs.readFileSync(path.join(root, "index.html"), "utf8");
const footerGenerator = fs.readFileSync(path.join(root, "scripts", "sync-instagram-profile.mjs"), "utf8");
const vercelConfig = fs.readFileSync(path.join(root, "vercel.json"), "utf8");
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const enabledVideos = youtubeVideos.filter((video) => video.enabled);
assert(enabledVideos.length >= homepageYouTubeVideoLimit, "Not enough enabled videos for the homepage module.");
assert(homepageYouTubeVideoLimit === 3, "Homepage module must show exactly three videos.");
assert(homepage.includes('id="youtube" aria-labelledby="youtube-heading"'), "YouTube section landmark is missing.");
assert(homepage.includes('<h2 id="youtube-heading">See YAQIXIN in Action</h2>'), "Expected YouTube H2 is missing.");
assert(homepage.indexOf('id="buyer-visits"') < homepage.indexOf('id="youtube"'), "YouTube module must follow Showroom.");
assert(homepage.indexOf('id="youtube"') < homepage.indexOf('id="instagram-wall"'), "YouTube module must precede Instagram.");
assert((homepage.match(/data-youtube-embed/g) || []).length === homepageYouTubeVideoLimit, "Homepage must render exactly three lazy video triggers.");
assert(!homepage.includes("<iframe"), "Homepage must not include an iframe before a buyer clicks a video.");
assert(homepage.includes(`href="${youtubeChannelUrl}"`), "Homepage CTA does not use the shared YouTube channel URL.");
assert(footerGenerator.includes('from "../data/youtube-content.mjs"'), "Footer generator must import the shared YouTube configuration.");
assert(vercelConfig.includes("frame-src https://www.youtube-nocookie.com"), "CSP does not allow the privacy-enhanced YouTube player.");

for (const video of enabledVideos.slice(0, homepageYouTubeVideoLimit)) {
  assert(homepage.includes(`href="${video.youtubeUrl}"`), `Missing no-script link for ${video.title}.`);
  assert(homepage.includes(`src="${video.thumbnail}"`), `Missing thumbnail for ${video.title}.`);
}

console.log(JSON.stringify({
  homepageVideos: homepageYouTubeVideoLimit,
  sharedChannelUrl: youtubeChannelUrl,
  failures,
}, null, 2));
process.exitCode = failures.length ? 1 : 0;
