(function () {
  "use strict";

  var triggerSelector = "[data-wechat-trigger]";
  var qrImage = "/yaqixin-assets/wechat-contact-13172537921.webp";
  var wechatId = "13172537921";
  var modal;
  var lastTrigger;

  function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(value);
    }

    return new Promise(function (resolve, reject) {
      var field = document.createElement("textarea");
      field.value = value;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      try {
        document.execCommand("copy") ? resolve() : reject(new Error("Copy failed"));
      } catch (error) {
        reject(error);
      }
      field.remove();
    });
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("yx-wechat-modal-open");
    if (lastTrigger) lastTrigger.focus();
  }

  function ensureModal() {
    if (modal) return modal;

    modal = document.createElement("div");
    modal.className = "yx-wechat-modal";
    modal.hidden = true;
    modal.innerHTML = '<div class="yx-wechat-backdrop" data-wechat-close></div><section class="yx-wechat-dialog" role="dialog" aria-modal="true" aria-labelledby="yx-wechat-title"><button class="yx-wechat-close" type="button" data-wechat-close aria-label="Close WeChat QR code">&times;</button><div class="yx-wechat-heading"><svg class="yx-wechat-dialog-mark" viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="1" width="22" height="22" rx="6" fill="#07c160"></rect><circle cx="9.3" cy="10.2" r="4.4" fill="#fff"></circle><circle cx="15.1" cy="14.2" r="4" fill="#fff"></circle><circle cx="8" cy="9.5" r=".55" fill="#07c160"></circle><circle cx="10.7" cy="9.5" r=".55" fill="#07c160"></circle><circle cx="14" cy="13.6" r=".5" fill="#07c160"></circle><circle cx="16.3" cy="13.6" r=".5" fill="#07c160"></circle></svg><div><p>YAQIXIN sales contact</p><h2 id="yx-wechat-title">Connect on WeChat</h2></div></div><img class="yx-wechat-qr" width="1056" height="1441" alt="WeChat QR code for YAQIXIN sales contact 13172537921"><p class="yx-wechat-copy">Scan the QR code with WeChat or add <strong>13172537921</strong>.</p><div class="yx-wechat-actions"><button type="button" class="yx-wechat-copy-button" data-wechat-copy>Copy WeChat ID</button><a href="' + qrImage + '" target="_blank" rel="noopener">Open QR image</a></div><p class="yx-wechat-status" role="status" aria-live="polite"></p></section>';
    document.body.appendChild(modal);

    modal.querySelectorAll("[data-wechat-close]").forEach(function (button) {
      button.addEventListener("click", closeModal);
    });

    modal.querySelector("[data-wechat-copy]").addEventListener("click", function () {
      var status = modal.querySelector(".yx-wechat-status");
      copyText(wechatId).then(function () {
        status.textContent = "WeChat ID copied: " + wechatId;
      }).catch(function () {
        status.textContent = "WeChat ID: " + wechatId;
      });
    });

    return modal;
  }

  document.addEventListener("click", function (event) {
    var trigger = event.target.closest(triggerSelector);
    if (!trigger) return;
    event.preventDefault();
    lastTrigger = trigger;
    var currentModal = ensureModal();
    var image = currentModal.querySelector(".yx-wechat-qr");
    if (!image.getAttribute("src")) image.setAttribute("src", qrImage);
    currentModal.querySelector(".yx-wechat-status").textContent = "";
    currentModal.hidden = false;
    document.body.classList.add("yx-wechat-modal-open");
    currentModal.querySelector(".yx-wechat-close").focus();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeModal();
  });
})();
