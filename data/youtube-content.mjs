export const youtubeChannelUrl = "https://www.youtube.com/@yaqixintextile";

export const homepageYouTubeVideoLimit = 3;

// Keep video metadata here so the homepage module and the shared footer source
// use one channel URL. Add future videos to this array, then run
// `node scripts/build-youtube-module.mjs` to refresh the homepage markup.
export const youtubeVideos = [
  {
    title: "Ready Stock Fashion Fabrics in Guangzhou",
    category: "Ready Stock",
    youtubeUrl: "https://youtu.be/BWxAgLEviKI",
    thumbnail: "https://i.ytimg.com/vi/BWxAgLEviKI/hqdefault.jpg",
    alt: "Preview of ready stock fashion fabrics at YAQIXIN in Guangzhou",
    enabled: true,
  },
  {
    title: "Inside Fabric Production in Guangzhou",
    category: "Production",
    youtubeUrl: "https://youtu.be/PAkPLfoZH4w",
    thumbnail: "https://i.ytimg.com/vi/PAkPLfoZH4w/hqdefault.jpg",
    alt: "Preview of YAQIXIN fabric production in Guangzhou",
    enabled: true,
  },
  {
    title: "Statement Sequin Fabric for Evening Dresses | YX1512",
    category: "Fabric Sourcing",
    youtubeUrl: "https://www.youtube.com/shorts/p4rJqq1vcFs",
    thumbnail: "https://i.ytimg.com/vi/p4rJqq1vcFs/hqdefault.jpg",
    alt: "Preview of YAQIXIN statement sequin fabric for evening dresses",
    enabled: true,
  },
];
