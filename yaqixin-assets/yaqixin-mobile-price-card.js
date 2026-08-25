/* YAQIXIN_B2B_PRICE_CTA_V2 */
(function () {
  'use strict';

  function cleanText(value) {
    return (value || '').replace(/\s+/g, ' ').trim();
  }

  function normalizeUnit(value) {
    var unit = cleanText(value).toLowerCase();
    if (/^(m|meter|meters|metre|metres)$/.test(unit)) {
      return 'm';
    }
    if (/^(yd|yard|yards)$/.test(unit)) {
      return 'yd';
    }
    return unit;
  }

  function parseTierPrice(value) {
    var text = cleanText(value);
    var match = text.match(/(?:USD|US\$|\$)\s*([0-9][0-9,.]*)\s*\/\s*([a-z]+)/i);
    if (!match) {
      return null;
    }
    var amount = Number(match[1].replace(/,/g, ''));
    if (!Number.isFinite(amount)) {
      return null;
    }
    return { amount: amount, unit: normalizeUnit(match[2]) };
  }

  function findProductEntity(value) {
    if (!value || typeof value !== 'object') {
      return null;
    }
    if (value['@type'] === 'Product') {
      return value;
    }
    if (Array.isArray(value)) {
      for (var index = 0; index < value.length; index += 1) {
        var arrayMatch = findProductEntity(value[index]);
        if (arrayMatch) {
          return arrayMatch;
        }
      }
      return null;
    }
    if (value['@graph']) {
      return findProductEntity(value['@graph']);
    }
    return null;
  }

  function getProductLabel() {
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var index = 0; index < scripts.length; index += 1) {
      try {
        var entity = findProductEntity(JSON.parse(scripts[index].textContent));
        if (entity) {
          return cleanText(entity.sku || entity.name);
        }
      } catch (error) {
        // Other site validators report malformed structured data separately.
      }
    }
    var heading = document.querySelector('h1');
    return cleanText(heading && heading.textContent) || 'this fabric';
  }

  function createElement(tagName, className, textContent) {
    var element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (textContent) {
      element.textContent = textContent;
    }
    return element;
  }

  function enhancePricePanel() {
    var pricePanel = document.querySelector('.price-panel');
    if (!pricePanel || pricePanel.getAttribute('data-b2b-price-ready') === 'true') {
      return;
    }

    var tierCards = Array.prototype.slice.call(pricePanel.querySelectorAll('.tier-card'));
    var parsedPrices = tierCards.map(function (tier) {
      return parseTierPrice((tier.querySelector('b') || {}).textContent);
    }).filter(Boolean);
    if (!parsedPrices.length) {
      return;
    }

    pricePanel.setAttribute('data-b2b-price-ready', 'true');
    pricePanel.setAttribute('aria-label', 'B2B reference pricing and sampling');
    pricePanel.classList.add('b2b-reference-panel');

    var eyebrow = pricePanel.querySelector('.eyebrow');
    if (eyebrow) {
      eyebrow.textContent = 'Reference wholesale price';
    }

    var amounts = parsedPrices.map(function (price) { return price.amount; });
    var low = Math.min.apply(Math, amounts);
    var high = Math.max.apply(Math, amounts);
    var unit = parsedPrices[0].unit;
    var rangeText = low === high
      ? '$' + low.toFixed(2) + ' / ' + unit
      : '$' + low.toFixed(2) + ' – $' + high.toFixed(2) + ' / ' + unit;

    var summary = createElement('div', 'b2b-price-summary');
    summary.appendChild(createElement('strong', 'b2b-price-range', rangeText));
    summary.appendChild(createElement('span', 'b2b-price-caption', 'Current volume-tier reference in USD'));
    if (eyebrow) {
      eyebrow.insertAdjacentElement('afterend', summary);
    } else {
      pricePanel.insertAdjacentElement('afterbegin', summary);
    }

    var tierRow = pricePanel.querySelector('.tier-row');
    if (tierRow) {
      tierRow.setAttribute('aria-label', 'Reference wholesale price tiers');
    }
    tierCards.forEach(function (tier) {
      tier.classList.remove('is-active');
    });

    ['.quantity-box', '.moq-alert', '.quote-summary'].forEach(function (selector) {
      var legacyControl = pricePanel.querySelector(selector);
      if (legacyControl) {
        legacyControl.hidden = true;
        legacyControl.setAttribute('aria-hidden', 'true');
      }
    });

    var priceNote = pricePanel.querySelector('.price-note') || pricePanel.querySelector('.note');
    if (!priceNote) {
      priceNote = createElement('p', 'note price-note');
      pricePanel.appendChild(priceNote);
    }
    priceNote.textContent = 'Final price depends on order volume, color customization, packing requirements, and destination port.';

    var samplePromise = createElement('div', 'b2b-sample-promise');
    samplePromise.appendChild(createElement('strong', '', 'Free swatches / color card'));
    samplePromise.appendChild(createElement('span', '', 'Samples are free. Buyer pays shipping.'));
    priceNote.insertAdjacentElement('afterend', samplePromise);

    document.documentElement.classList.add('has-b2b-price-card');
  }

  function addIntentMessage(field, message) {
    if (!field || cleanText(field.value).indexOf(message) !== -1) {
      return;
    }
    field.value = cleanText(field.value)
      ? cleanText(field.value) + '\n\n' + message
      : message;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function wireIntentCtas() {
    var actions = document.querySelector('.hero-actions');
    if (!actions || actions.getAttribute('data-b2b-intent-ready') === 'true') {
      return;
    }

    var links = actions.querySelectorAll('a');
    if (links.length < 2) {
      return;
    }

    actions.setAttribute('data-b2b-intent-ready', 'true');
    actions.setAttribute('data-b2b-cta-group', 'true');
    actions.classList.add('b2b-hero-actions');

    var sampleLink = links[0];
    var bulkLink = links[1];
    sampleLink.href = '#inquiry';
    sampleLink.className = 'btn copper b2b-sample-cta';
    sampleLink.setAttribute('data-inquiry-intent', 'sample');
    sampleLink.textContent = 'Request Free Swatches / Color Card';
    bulkLink.href = '#inquiry';
    bulkLink.className = 'btn navy b2b-bulk-cta';
    bulkLink.setAttribute('data-inquiry-intent', 'bulk');
    bulkLink.textContent = 'Get Bulk & Shipping Quote';

    var ctaNote = createElement('p', 'b2b-cta-note', 'Free samples · Buyer pays shipping · Freight confirmed for your destination');
    actions.insertAdjacentElement('afterend', ctaNote);

    var form = document.querySelector('#inquiry form');
    var productLabel = getProductLabel();
    [sampleLink, bulkLink].forEach(function (link) {
      link.addEventListener('click', function () {
        if (!form) {
          return;
        }
        var isSample = link.getAttribute('data-inquiry-intent') === 'sample';
        var messageField = form.querySelector('[name="message"]');
        var intentMessage = isSample
          ? 'I would like free swatches / a color card for ' + productLabel + '. I understand the samples are free and shipping is paid by the buyer.'
          : 'Please quote ' + productLabel + ' for a bulk order and include available shipping options to my destination. Destination port / address: ';
        addIntentMessage(messageField, intentMessage);
        window.setTimeout(function () {
          var focusTarget = isSample
            ? form.querySelector('[name="color"]') || messageField
            : form.querySelector('[name="quantity"]') || messageField;
          if (focusTarget) {
            focusTarget.focus({ preventScroll: true });
          }
        }, 350);
      });
    });
  }

  function initialize() {
    enhancePricePanel();
    wireIntentCtas();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
}());
