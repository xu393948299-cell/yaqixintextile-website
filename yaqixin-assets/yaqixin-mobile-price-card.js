/* YAQIXIN_MOBILE_PRICE_CARD_V1 */
(function () {
  'use strict';

  function cleanText(value) {
    return (value || '').replace(/\s+/g, ' ').trim();
  }

  function getMoqText(pricePanel, fallback) {
    var note = cleanText((pricePanel.querySelector('.moq-alert') || {}).textContent);
    var match = note.match(/\bMOQ\s*(?:is|:)?\s*([^.;]+)/i);
    return match ? 'MOQ: ' + cleanText(match[1]) : 'Starts at: ' + fallback;
  }

  function formatPrice(value) {
    var text = cleanText(value);
    var match = text.match(/^(?:USD|US\$|\$)\s*([0-9.,]+)\s*\/\s*([a-z]+)$/i);
    if (!match) {
      return { display: text, unit: 'Per listed unit' };
    }
    return { display: 'US$' + match[1], unit: 'USD / ' + match[2] };
  }

  function createMobilePriceCard() {
    if (!window.matchMedia('(max-width: 640px)').matches || document.querySelector('.mobile-price-card')) {
      return;
    }

    var pricePanel = document.querySelector('.price-panel');
    if (!pricePanel) {
      return;
    }

    var tiers = Array.prototype.slice.call(pricePanel.querySelectorAll('.tier-card'));
    if (!tiers.length) {
      return;
    }

    var card = document.createElement('section');
    card.className = 'mobile-price-card';
    card.dataset.tierCount = String(tiers.length);
    card.setAttribute('aria-label', 'Wholesale price tiers');

    var firstPrice = formatPrice((tiers[0].querySelector('b') || {}).textContent);
    var heading = document.createElement('div');
    heading.className = 'mobile-price-heading';
    var headingTitle = document.createElement('span');
    headingTitle.textContent = 'Wholesale reference price';
    var headingUnit = document.createElement('strong');
    headingUnit.textContent = firstPrice.unit;
    heading.appendChild(headingTitle);
    heading.appendChild(headingUnit);
    card.appendChild(heading);

    var tierList = document.createElement('div');
    tierList.className = 'mobile-price-tiers';
    tiers.forEach(function (tier) {
      var item = document.createElement('div');
      var range = cleanText((tier.querySelector('small') || {}).textContent);
      var price = formatPrice((tier.querySelector('b') || {}).textContent);
      item.className = 'mobile-price-tier';
      item.innerHTML = '<b></b><small></small>';
      item.querySelector('b').textContent = price.display;
      item.querySelector('small').textContent = range;
      tierList.appendChild(item);
    });
    card.appendChild(tierList);

    var footer = document.createElement('div');
    footer.className = 'mobile-price-footer';
    var moq = document.createElement('span');
    moq.textContent = getMoqText(pricePanel, cleanText((tiers[0].querySelector('small') || {}).textContent));
    footer.appendChild(moq);

    var colorLink = document.querySelector('a[href="#color-skus"]');
    if (colorLink) {
      var link = document.createElement('a');
      link.href = '#color-skus';
      link.textContent = 'View color options \u2192';
      footer.appendChild(link);
    }
    card.appendChild(footer);

    pricePanel.insertAdjacentElement('afterend', card);
    pricePanel.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.add('has-mobile-price-card');
  }

  function initialize() {
    createMobilePriceCard();
    var query = window.matchMedia('(max-width: 640px)');
    if (query.addEventListener) {
      query.addEventListener('change', function (event) {
        if (event.matches) {
          createMobilePriceCard();
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
}());
