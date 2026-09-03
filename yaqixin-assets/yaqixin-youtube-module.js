(function () {
  "use strict";

  function buildPlayer(videoId, title) {
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1`;
    iframe.title = `${title} — YAQIXIN Textile YouTube video`;
    iframe.loading = "lazy";
    iframe.allow = "encrypted-media; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;
    return iframe;
  }

  document.addEventListener("click", function (event) {
    const trigger = event.target.closest("[data-youtube-embed]");
    if (!trigger) return;

    const player = trigger.closest("[data-youtube-card]")?.querySelector("[data-youtube-player]");
    const videoId = trigger.dataset.youtubeVideoId;
    const title = trigger.dataset.youtubeTitle || "YAQIXIN Textile";
    if (!player || !videoId || player.dataset.youtubeLoaded === "true") return;

    player.dataset.youtubeLoaded = "true";
    player.replaceChildren(buildPlayer(videoId, title));
  });
})();
