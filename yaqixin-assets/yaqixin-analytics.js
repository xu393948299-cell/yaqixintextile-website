/* GA4 base tag for YAQIXIN. Lead events are emitted by yaqixin-lead-system.js. */
(function () {
  'use strict';

  var measurementId = 'G-WVW32PCTL5';
  if (!/^G-[A-Z0-9]+$/i.test(measurementId)) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    send_page_view: true
  });

  var analyticsLoaded = false;
  function loadAnalyticsScript() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(script);
  }

  // Keep the GA4 queue and page-view configuration, but move the third-party
  // download out of the critical rendering path. Lead events queued before
  // the download are replayed when gtag.js becomes available.
  function scheduleAnalytics() {
    window.setTimeout(function () {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(loadAnalyticsScript, { timeout: 4000 });
      } else {
        loadAnalyticsScript();
      }
    }, 2500);
  }

  if (document.readyState === 'complete') scheduleAnalytics();
  else window.addEventListener('load', scheduleAnalytics, { once: true });
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (eventName) {
    window.addEventListener(eventName, loadAnalyticsScript, { once: true, passive: true });
  });
}());
