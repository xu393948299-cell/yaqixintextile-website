/* YAQIXIN lead capture and conversion-event bridge. Keeps the existing WhatsApp
   quotation flow, while sending a structured copy of every form request first. */
(function () {
  'use strict';

  var endpoint = 'https://formsubmit.co/ajax/378080571@qq.com';
  var storageKey = 'yaqixin_attribution_v1';
  var submitCooldownKey = 'yaqixin_lead_last_submit_v1';
  var submitCooldownMs = 30000;
  var formSelector = 'form.form-card, form#inquiry-form, form[data-lead-form]';
  var startedForms = new WeakSet();
  var fieldLimit = 200;
  var messageLimit = 4000;
  var trackingLimit = 160;
  var attributionKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'referrer'];

  function isSpanish() {
    return (document.documentElement.lang || '').toLowerCase().indexOf('es') === 0;
  }

  function localized(english, spanish) {
    return isSpanish() ? spanish : english;
  }

  function safeStorage() {
    try { return window.sessionStorage; } catch (error) { return null; }
  }

  function textValue(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function trackingValue(value) {
    return textValue(value).replace(/[\u0000-\u001F\u007F]/g, ' ').slice(0, trackingLimit);
  }

  function currentPage() {
    return window.location.origin + window.location.pathname;
  }

  function referrerOrigin() {
    if (!document.referrer) return '';
    try {
      var referrer = new URL(document.referrer);
      return referrer.protocol === 'http:' || referrer.protocol === 'https:' ? referrer.origin : '';
    } catch (error) {
      return '';
    }
  }

  function getAttribution() {
    var params = new URLSearchParams(window.location.search);
    var current = {
      utm_source: trackingValue(params.get('utm_source')),
      utm_medium: trackingValue(params.get('utm_medium')),
      utm_campaign: trackingValue(params.get('utm_campaign')),
      utm_content: trackingValue(params.get('utm_content')),
      utm_term: trackingValue(params.get('utm_term')),
      gclid: trackingValue(params.get('gclid')),
      referrer: referrerOrigin()
    };
    var store = safeStorage();
    var saved = {};
    if (store) {
      try { saved = JSON.parse(store.getItem(storageKey) || '{}'); } catch (error) { saved = {}; }
    }
    var merged = {};
    attributionKeys.forEach(function (key) {
      merged[key] = current[key] || trackingValue(saved[key]);
    });
    if (store) {
      try { store.setItem(storageKey, JSON.stringify(merged)); } catch (error) { /* storage can be unavailable */ }
    }
    return merged;
  }

  function track(name, params) {
    var clean = Object.assign({ event: name }, params || {});
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(clean);
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  function isLeadForm(form) {
    return !!form && form.matches(formSelector) && !form.matches('.site-search');
  }

  function valueFor(form, names) {
    for (var index = 0; index < names.length; index += 1) {
      var field = form.elements[names[index]];
      if (field && textValue(field.value)) return textValue(field.value);
    }
    return '';
  }

  function productName(form) {
    var heading = document.querySelector('main h1, h1');
    var namedProduct = form.getAttribute('data-product') || form.dataset.product;
    return namedProduct || (heading && heading.textContent.trim()) || document.title.replace(/\s*\|\s*YAQIXIN.*$/i, '').trim();
  }

  function showStatus(form, message, state) {
    var notice = form.querySelector('[data-lead-status]');
    if (!notice) {
      notice = document.createElement('p');
      notice.setAttribute('data-lead-status', '');
      notice.setAttribute('role', 'status');
      notice.style.cssText = 'margin:12px 0 0;font-size:12px;font-weight:700;line-height:1.5';
      form.appendChild(notice);
    }
    notice.setAttribute('data-lead-status-state', state || 'info');
    notice.style.color = state === 'success' ? '#18733b' : state === 'error' ? '#a12c2c' : '#727b87';
    notice.textContent = message;
  }

  function addPrivacyNote(form) {
    if (form.querySelector('[data-lead-privacy]')) return;
    var note = document.createElement('p');
    note.setAttribute('data-lead-privacy', '');
    note.style.cssText = 'margin:10px 0 0;color:#727b87;font-size:11px;line-height:1.5';
    note.appendChild(document.createTextNode(localized(
      'By submitting, you allow YAQIXIN to use your details for this quotation request. ',
      'Al enviar, permite que YAQIXIN utilice sus datos para esta solicitud de cotización. '
    )));
    var link = document.createElement('a');
    link.href = '/privacy-policy';
    link.style.cssText = 'color:inherit;text-decoration:underline';
    link.textContent = localized('Privacy Policy', 'Política de privacidad');
    note.appendChild(link);
    form.appendChild(note);
  }

  function markContactRequirement(form) {
    var field = form.elements.contact || form.querySelector('input[name="contact"],input[name="email"],input[name="whatsapp"]');
    if (!field) return;
    field.setAttribute('aria-required', 'true');
    var label = field.closest ? field.closest('label') : null;
    var line = label && label.querySelector('.label-line');
    if (!line || line.querySelector('[data-contact-required]')) return;
    var marker = line.querySelector('small, .field-optional');
    if (marker) {
      marker.textContent = document.documentElement.lang === 'es' ? 'necesario para responder' : 'required for reply';
      marker.classList.remove('field-optional');
      marker.classList.add('field-required');
      marker.setAttribute('data-contact-required', '');
      return;
    }
    marker = document.createElement('em');
    marker.className = 'field-required';
    marker.setAttribute('data-contact-required', '');
    marker.textContent = document.documentElement.lang === 'es' ? 'Necesario para responder' : 'Required for reply';
    line.appendChild(marker);
  }

  function addSpamTrap(form) {
    if (form.querySelector('[data-lead-honeypot]')) return;
    var trap = document.createElement('input');
    trap.type = 'text';
    trap.name = '_honey';
    trap.setAttribute('data-lead-honeypot', '');
    trap.setAttribute('aria-hidden', 'true');
    trap.tabIndex = -1;
    trap.autocomplete = 'off';
    trap.style.cssText = 'position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none';
    form.appendChild(trap);
  }

  function cooldownRemaining() {
    var store = safeStorage();
    if (!store) return 0;
    var last = Number(store.getItem(submitCooldownKey) || 0);
    var remaining = submitCooldownMs - (Date.now() - last);
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }

  function markSubmitted() {
    var store = safeStorage();
    if (store) {
      try { store.setItem(submitCooldownKey, String(Date.now())); } catch (error) { /* storage can be unavailable */ }
    }
  }

  function setSubmitting(form, isSubmitting) {
    form.querySelectorAll('button[type="submit"]').forEach(function (button) {
      button.disabled = isSubmitting;
      button.setAttribute('aria-disabled', isSubmitting ? 'true' : 'false');
    });
  }

  function submitLead(form, submitter) {
    var trap = form.elements._honey;
    var honeypot = trap && typeof trap.value === 'string' ? trap.value.trim() : '';
    var contact = valueFor(form, ['contact', 'email', 'whatsapp']);
    var company = valueFor(form, ['company', 'name']);
    var fabricCategory = valueFor(form, ['fabric_category', 'category']);
    var orderRoute = valueFor(form, ['route']);
    var quantity = valueFor(form, ['quantity']);
    var color = valueFor(form, ['color']);
    var requirement = valueFor(form, ['message', 'requirement']);
    if (honeypot) {
      showStatus(form, localized('Your request could not be submitted. Please try again.', 'No se pudo enviar la solicitud. Inténtelo de nuevo.'), 'error');
      return;
    }
    if (contact.length < 4) {
      showStatus(form, localized('Please add an email or WhatsApp number so we can reply.', 'Añada un email o número de WhatsApp para que podamos responder.'), 'error');
      return;
    }
    if (contact.length > fieldLimit || requirement.length > messageLimit || [company, fabricCategory, orderRoute, quantity, color].some(function (value) { return value.length > fieldLimit; })) {
      showStatus(form, localized('Please shorten the contact or requirement details and try again.', 'Acorte los datos de contacto o los requisitos e inténtelo de nuevo.'), 'error');
      return;
    }
    var seconds = cooldownRemaining();
    if (seconds) {
      showStatus(form, localized('Please wait ' + seconds + ' seconds before sending another request.', 'Espere ' + seconds + ' segundos antes de enviar otra solicitud.'), 'error');
      return;
    }
    var attribution = getAttribution();
    var selectedWhatsApp = submitter && submitter.getAttribute('data-whatsapp') || '';
    if (!/^\d{7,18}$/.test(selectedWhatsApp)) selectedWhatsApp = '';
    var data = {
      _subject: 'New YAQIXIN website inquiry',
      _template: 'table',
      _honey: honeypot,
      company_or_buyer: company,
      contact: contact,
      product_or_page: productName(form).slice(0, fieldLimit),
      fabric_category: fabricCategory,
      order_route: orderRoute,
      quantity_or_market: quantity,
      color_or_packing_note: color,
      requirement: requirement,
      selected_whatsapp: selectedWhatsApp ? '+' + selectedWhatsApp : '',
      source_page: currentPage(),
      page_title: textValue(document.title).slice(0, fieldLimit),
      submitted_at_utc: new Date().toISOString(),
      utm_source: attribution.utm_source || '',
      utm_medium: attribution.utm_medium || '',
      utm_campaign: attribution.utm_campaign || '',
      utm_content: attribution.utm_content || '',
      utm_term: attribution.utm_term || '',
      gclid: attribution.gclid || '',
      referrer: attribution.referrer || ''
    };
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) data.email = contact;

    showStatus(form, localized('Saving your quotation request...', 'Guardando su solicitud de cotización...'), 'pending');

    if (!navigator.onLine) {
      showStatus(form, localized('Your request could not be saved while you are offline. Please send the WhatsApp draft so we can reply.', 'No se pudo guardar la solicitud sin conexión. Envíe el borrador de WhatsApp para que podamos responder.'), 'error');
      return;
    }
    markSubmitted();
    setSubmitting(form, true);
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true
    }).then(function (response) {
      if (!response.ok) throw new Error('Lead endpoint returned HTTP ' + response.status);
      return response.json().catch(function () { return {}; });
    }).then(function (result) {
      if (result && result.success === false) throw new Error('Lead endpoint rejected the request');
      track('generate_lead', {
        lead_form_id: form.id || 'quotation-form',
        page_type: document.body && document.body.dataset && document.body.dataset.pageType || 'website',
        contact_method: selectedWhatsApp ? 'whatsapp' : 'form'
      });
      showStatus(form, localized('Your quotation request has been saved. You can also send the WhatsApp draft to speed up the reply.', 'Su solicitud de cotización se ha guardado. También puede enviar el borrador de WhatsApp para agilizar la respuesta.'), 'success');
    }).catch(function () {
      showStatus(form, localized('Your request could not be saved. Please send the WhatsApp draft so we can reply.', 'No se pudo guardar la solicitud. Envíe el borrador de WhatsApp para que podamos responder.'), 'error');
    }).finally(function () {
      setSubmitting(form, false);
    });
  }

  document.addEventListener('focusin', function (event) {
    var form = event.target && event.target.closest && event.target.closest('form');
    if (!isLeadForm(form) || startedForms.has(form)) return;
    startedForms.add(form);
    track('form_start', { lead_form_id: form.id || 'quotation-form' });
  }, true);

  document.querySelectorAll(formSelector).forEach(function (form) {
    markContactRequirement(form);
    addPrivacyNote(form);
    addSpamTrap(form);
  });

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!isLeadForm(form)) return;
    event.preventDefault();
    submitLead(form, event.submitter);
  }, true);

  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest && event.target.closest('a[href*="wa.me"], a[href*="whatsapp.com"], [data-whatsapp]');
    if (!link) return;
    track('whatsapp_click', {
      page_path: window.location.pathname,
      destination: link.getAttribute('data-whatsapp') || link.getAttribute('href') || ''
    });
  }, true);
}());
