/* YAQIXIN lead capture and conversion-event bridge. Keeps the existing WhatsApp
   quotation flow, while sending a structured copy of every form request first. */
(function () {
  'use strict';

  var endpoint = 'https://formsubmit.co/ajax/378080571@qq.com';
  var storageKey = 'yaqixin_attribution_v1';
  var formSelector = 'form.form-card, form#inquiry-form, form[data-lead-form]';
  var startedForms = new WeakSet();

  function safeStorage() {
    try { return window.sessionStorage; } catch (error) { return null; }
  }

  function getAttribution() {
    var params = new URLSearchParams(window.location.search);
    var current = {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
      utm_term: params.get('utm_term') || '',
      gclid: params.get('gclid') || '',
      referrer: document.referrer || ''
    };
    var store = safeStorage();
    var saved = {};
    if (store) {
      try { saved = JSON.parse(store.getItem(storageKey) || '{}'); } catch (error) { saved = {}; }
    }
    var merged = Object.assign({}, saved);
    Object.keys(current).forEach(function (key) {
      if (current[key]) merged[key] = current[key];
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
      if (field && typeof field.value === 'string' && field.value.trim()) return field.value.trim();
    }
    return '';
  }

  function productName(form) {
    var heading = document.querySelector('main h1, h1');
    var namedProduct = form.getAttribute('data-product') || form.dataset.product;
    return namedProduct || (heading && heading.textContent.trim()) || document.title.replace(/\s*\|\s*YAQIXIN.*$/i, '').trim();
  }

  function showStatus(form) {
    var notice = form.querySelector('[data-lead-status]');
    if (!notice) {
      notice = document.createElement('p');
      notice.setAttribute('data-lead-status', '');
      notice.setAttribute('role', 'status');
      notice.style.cssText = 'margin:12px 0 0;color:#18733b;font-size:12px;font-weight:700;line-height:1.5';
      form.appendChild(notice);
    }
    notice.textContent = 'Your quotation request has been recorded. You can also send the WhatsApp draft to speed up the reply.';
  }

  function addPrivacyNote(form) {
    if (form.querySelector('[data-lead-privacy]')) return;
    var note = document.createElement('p');
    note.setAttribute('data-lead-privacy', '');
    note.style.cssText = 'margin:10px 0 0;color:#727b87;font-size:11px;line-height:1.5';
    note.innerHTML = 'By submitting, you allow YAQIXIN to use your details for this quotation request. <a href="/privacy-policy.html" style="color:inherit;text-decoration:underline">Privacy Policy</a>';
    form.appendChild(note);
  }

  function submitLead(form, submitter) {
    var attribution = getAttribution();
    var selectedWhatsApp = submitter && submitter.getAttribute('data-whatsapp') || '';
    var contact = valueFor(form, ['contact', 'email', 'whatsapp']);
    var data = {
      _subject: 'New YAQIXIN website inquiry',
      _template: 'table',
      _captcha: 'false',
      company_or_buyer: valueFor(form, ['company', 'name']),
      contact: contact,
      product_or_page: productName(form),
      fabric_category: valueFor(form, ['fabric_category', 'category']),
      order_route: valueFor(form, ['route']),
      quantity_or_market: valueFor(form, ['quantity']),
      color_or_packing_note: valueFor(form, ['color']),
      requirement: valueFor(form, ['message', 'requirement']),
      selected_whatsapp: selectedWhatsApp ? '+' + selectedWhatsApp : '',
      source_page: window.location.href,
      page_title: document.title,
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

    track('generate_lead', {
      lead_form_id: form.id || 'quotation-form',
      page_type: document.body && document.body.dataset && document.body.dataset.pageType || 'website',
      contact_method: selectedWhatsApp ? 'whatsapp' : 'form'
    });
    showStatus(form);

    if (!navigator.onLine) return;
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true
    }).catch(function () { /* WhatsApp stays available as a buyer-facing fallback. */ });
  }

  document.addEventListener('focusin', function (event) {
    var form = event.target && event.target.closest && event.target.closest('form');
    if (!isLeadForm(form) || startedForms.has(form)) return;
    startedForms.add(form);
    track('form_start', { lead_form_id: form.id || 'quotation-form' });
  }, true);

  document.querySelectorAll(formSelector).forEach(addPrivacyNote);

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!isLeadForm(form)) return;
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
