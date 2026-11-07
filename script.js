/* Junk Removal Services — site scripts (vanilla JS, no dependencies) */
(function () {
  'use strict';

  var PHONE_LINK = 'tel:+10000000000';
  var PHONE_TEXT = '(000) 000-0000';
  var THANK_YOU_URL = '/thank-you.html';

  /* ---------- Current year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Header state + mobile bar ---------- */
  var header = document.querySelector('.site-header');
  var mobileBar = document.querySelector('.mobile-bar');
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 20);
    if (mobileBar) mobileBar.classList.toggle('show', y > 480);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        setMenu(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 960 && nav.classList.contains('open')) setMenu(false);
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  // Each <section data-nav="#id"> says which nav link it belongs to.
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.main-nav ul a[href^="#"]'));
  var navSections = Array.prototype.slice.call(document.querySelectorAll('main section[data-nav]'));
  var currentNav = null;

  function updateActiveNav() {
    var marker = window.innerHeight * 0.4;
    var target = null;
    navSections.forEach(function (s) {
      if (s.getBoundingClientRect().top <= marker) target = s.getAttribute('data-nav');
    });
    // At the very bottom of the page, highlight Contact
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) target = '#contact';
    if (target === currentNav) return;
    currentNav = target;
    navLinks.forEach(function (a) {
      var match = a.getAttribute('href') === target;
      a.classList.toggle('active', match);
      if (match) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  if (navSections.length) {
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function (el) {
      // Stagger cards that sit in the same grid
      var parent = el.parentElement;
      if (parent && /grid/.test(parent.className)) {
        var idx = Array.prototype.indexOf.call(parent.children, el);
        el.style.transitionDelay = Math.min(idx % 4, 3) * 90 + 'ms';
      }
      revealer.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Quote form ---------- */
  var form = document.getElementById('quote-form');
  if (!form) return;

  // Keep native validation as a no-JS fallback; use custom validation when JS runs.
  form.setAttribute('novalidate', '');

  var fields = {
    name: form.querySelector('#name'),
    phone: form.querySelector('#phone'),
    email: form.querySelector('#email'),
    service: form.querySelector('#service'),
    date: form.querySelector('#date'),
    details: form.querySelector('#details')
  };
  var statusBox = document.getElementById('form-status');
  var submitBtn = document.getElementById('submit-btn');

  // Earliest pickup date = today (local time)
  function todayISO() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  if (fields.date) fields.date.min = todayISO();

  // Pre-select service from "Get a quote" links on service cards
  document.querySelectorAll('[data-service]').forEach(function (link) {
    link.addEventListener('click', function () {
      var value = link.getAttribute('data-service');
      if (fields.service) {
        fields.service.value = value;
        fields.service.dispatchEvent(new Event('change'));
      }
    });
  });

  // Format phone as (602) 555-0123 while typing
  if (fields.phone) {
    fields.phone.addEventListener('input', function () {
      var digits = fields.phone.value.replace(/\D/g, '');
      if (digits.length === 11 && digits.charAt(0) === '1') digits = digits.slice(1);
      digits = digits.slice(0, 10);
      var out = digits;
      if (digits.length > 6) out = '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
      else if (digits.length > 3) out = '(' + digits.slice(0, 3) + ') ' + digits.slice(3);
      else if (digits.length > 0) out = '(' + digits;
      fields.phone.value = out;
    });
  }

  var validators = {
    name: function (v) {
      if (!v.trim()) return 'Please enter your full name.';
      if (v.trim().length < 2) return 'Please enter your full name.';
      return '';
    },
    phone: function (v) {
      var digits = v.replace(/\D/g, '');
      if (!digits) return 'Please enter a phone number so we can reach you.';
      if (digits.length === 11 && digits.charAt(0) === '1') digits = digits.slice(1);
      if (digits.length !== 10) return 'Please enter a valid 10-digit phone number.';
      return '';
    },
    email: function (v) {
      if (!v.trim()) return '';
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address or leave it blank.';
    },
    date: function (v) {
      if (!v) return '';
      return v < todayISO() ? 'Please choose today or a future date.' : '';
    }
  };

  function validateField(key) {
    var input = fields[key];
    if (!input || !validators[key]) return true;
    var msg = validators[key](input.value);
    var wrap = input.closest('.field');
    var err = document.getElementById(key + '-error');
    wrap.classList.toggle('has-error', !!msg);
    wrap.classList.toggle('is-valid', !msg && !!input.value.trim());
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) err.textContent = msg;
    return !msg;
  }

  Object.keys(validators).forEach(function (key) {
    var input = fields[key];
    if (!input) return;
    input.addEventListener('blur', function () { if (input.value) validateField(key); });
    input.addEventListener('input', function () {
      if (input.closest('.field').classList.contains('has-error')) validateField(key);
    });
  });

  function showStatus(type, html) {
    statusBox.className = 'form-status is-' + type;
    statusBox.innerHTML = html;
    statusBox.hidden = false;
  }

  function setLoading(on) {
    submitBtn.classList.toggle('is-loading', on);
    submitBtn.disabled = on;
    submitBtn.querySelector('.btn-label').textContent = on ? 'Sending…' : 'Request My Free Quote';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    statusBox.hidden = true;

    var ok = Object.keys(validators).map(validateField).every(Boolean);
    if (!ok) {
      var firstBad = form.querySelector('.has-error input, .has-error select, .has-error textarea');
      if (firstBad) firstBad.focus();
      showStatus('error',
        '<svg class="icon" aria-hidden="true"><use href="assets/icons/sprite.svg#i-alert"/></svg>' +
        '<span>Please fix the highlighted fields and try again.</span>');
      return;
    }

    setLoading(true);
    var body = new URLSearchParams(new FormData(form)).toString();

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed with status ' + res.status);
        showStatus('success',
          '<svg class="icon" aria-hidden="true"><use href="assets/icons/sprite.svg#i-check"/></svg>' +
          '<span>Thanks! Your quote request was sent. Redirecting…</span>');
        form.reset();
        window.location.href = THANK_YOU_URL;
      })
      .catch(function () {
        setLoading(false);
        showStatus('error',
          '<svg class="icon" aria-hidden="true"><use href="assets/icons/sprite.svg#i-alert"/></svg>' +
          '<span>Sorry, we couldn\'t send your request right now. Please try again, or call us at ' +
          '<a href="' + PHONE_LINK + '">' + PHONE_TEXT + '</a>.</span>');
      });
  });
})();
