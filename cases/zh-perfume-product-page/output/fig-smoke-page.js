/* =========================================================
   Atelier Oubli — Nº 7 "Fig & Smoke" — product page interactions
   Gallery + zoom · size selector · Discovery Set upsell · add to bag
   Notes pyramid · How it wears · accordion · reviews · slow fades
   ========================================================= */
(function () {
  'use strict';

  var doc = document.documentElement;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  var money = function (n) { return currency.format(n); };
  var clamp = function (v, min, max) { return Math.min(max, Math.max(min, v)); };

  function swapText(el, text) {
    if (!el || el.textContent === text) return;
    if (reduceMotion) { el.textContent = text; return; }
    el.classList.add('is-swapping');
    window.setTimeout(function () {
      el.textContent = text;
      el.classList.remove('is-swapping');
    }, 280);
  }

  function announce(message) {
    var live = $('[data-live]');
    if (!live) return;
    live.textContent = '';
    window.setTimeout(function () { live.textContent = message; }, 60);
  }

  /* ---------- Slow fades ----------
     Anything already on screen is shown instantly, so the first view
     never captures a half-faded page. Only later content fades in. */
  function initReveal() {
    var items = $$('.reveal');
    var viewport = window.innerHeight || doc.clientHeight;

    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < viewport * 0.98) {
        el.classList.add('is-visible', 'is-instant');
      }
    });

    doc.classList.remove('no-js');
    doc.classList.add('js');

    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    items.forEach(function (el) {
      if (!el.classList.contains('is-visible')) io.observe(el);
    });
  }

  /* ---------- Header ---------- */
  function initHeader() {
    var header = $('.site-header');
    if (!header) return;

    var ticking = false;
    var update = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();

    var toggle = $('[data-menu-toggle]');
    if (!toggle) return;
    var setOpen = function (open) {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', function () {
      setOpen(!header.classList.contains('is-open'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    $$('.site-nav a', header).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
  }

  /* ---------- Gallery with zoom ---------- */
  function initGallery() {
    var gallery = $('[data-gallery]');
    if (!gallery) return;

    var stage = $('[data-zoom]', gallery);
    var img = $('.gallery__img', gallery);
    var strip = $('.gallery__thumbs', gallery);
    var thumbs = $$('.gallery__thumb', gallery);
    var count = $('[data-gallery-count]', gallery);
    var prevBtn = $('[data-gallery-prev]', gallery);
    var nextBtn = $('[data-gallery-next]', gallery);
    var zoomBtn = $('[data-zoom-toggle]', gallery);
    var zoomLabel = zoomBtn ? $('[data-zoom-label]', zoomBtn) : null;
    if (!stage || !img || !thumbs.length) return;

    var index = Math.max(0, thumbs.findIndex(function (t) { return t.getAttribute('aria-current') === 'true'; }));
    var zoomed = false;
    var swapTimer = null;
    var suppressClick = false;
    var start = null;

    var pad = function (n) { return String(n).padStart(2, '0'); };

    // warm the cache after first paint
    window.setTimeout(function () {
      thumbs.forEach(function (t) { var pre = new Image(); pre.src = t.dataset.src; });
    }, 1200);

    function updateCount() {
      if (count) count.textContent = pad(index + 1) + ' / ' + pad(thumbs.length);
    }

    function setOrigin(e) {
      var r = stage.getBoundingClientRect();
      var x = clamp(((e.clientX - r.left) / r.width) * 100, 0, 100);
      var y = clamp(((e.clientY - r.top) / r.height) * 100, 0, 100);
      stage.style.setProperty('--zx', x + '%');
      stage.style.setProperty('--zy', y + '%');
    }

    function centreOrigin() {
      stage.style.setProperty('--zx', '50%');
      stage.style.setProperty('--zy', '50%');
    }

    function setZoom(on) {
      zoomed = on;
      stage.classList.toggle('is-zoomed', on);
      if (zoomBtn) zoomBtn.setAttribute('aria-pressed', String(on));
      if (zoomLabel) zoomLabel.textContent = on ? 'Close zoom' : 'Zoom';
    }

    function scrollStripTo(thumb) {
      if (!strip) return;
      var behavior = reduceMotion ? 'auto' : 'smooth';
      if (strip.scrollWidth > strip.clientWidth + 1) {
        strip.scrollTo({ left: thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2, behavior: behavior });
      } else if (strip.scrollHeight > strip.clientHeight + 1) {
        strip.scrollTo({ top: thumb.offsetTop - (strip.clientHeight - thumb.offsetHeight) / 2, behavior: behavior });
      }
    }

    function show(i, focusThumb) {
      var n = thumbs.length;
      i = ((i % n) + n) % n;
      if (i === index) { if (focusThumb) thumbs[i].focus(); return; }
      index = i;
      setZoom(false);
      centreOrigin();

      thumbs.forEach(function (t, k) { t.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      if (focusThumb) thumbs[i].focus({ preventScroll: true });
      scrollStripTo(thumbs[i]);
      updateCount();

      var thumb = thumbs[i];
      window.clearTimeout(swapTimer);
      img.classList.add('is-fading');
      swapTimer = window.setTimeout(function () {
        img.src = thumb.dataset.src;
        img.alt = thumb.dataset.alt || '';
        var done = function () { window.requestAnimationFrame(function () { img.classList.remove('is-fading'); }); };
        if (img.decode) { img.decode().then(done, done); }
        else if (img.complete) { done(); }
        else { img.addEventListener('load', done, { once: true }); }
      }, reduceMotion ? 0 : 420);
    }

    // thumbnails
    thumbs.forEach(function (t, k) {
      t.addEventListener('click', function () { show(k); });
      t.addEventListener('keydown', function (e) {
        var key = e.key;
        if (key === 'ArrowDown' || key === 'ArrowRight') { e.preventDefault(); show(index + 1, true); }
        else if (key === 'ArrowUp' || key === 'ArrowLeft') { e.preventDefault(); show(index - 1, true); }
        else if (key === 'Home') { e.preventDefault(); show(0, true); }
        else if (key === 'End') { e.preventDefault(); show(thumbs.length - 1, true); }
      });
    });

    // arrows (mobile)
    [[prevBtn, -1], [nextBtn, 1]].forEach(function (pair) {
      if (!pair[0]) return;
      pair[0].addEventListener('click', function (e) {
        e.stopPropagation();
        show(index + pair[1]);
      });
      pair[0].addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    });

    // desktop: hover to magnify, follow the cursor
    stage.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'mouse' && finePointer.matches) { setOrigin(e); setZoom(true); }
    });
    stage.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'mouse') setZoom(false);
    });
    stage.addEventListener('pointermove', function (e) {
      if (zoomed) setOrigin(e);
    });

    // touch: swipe to change image, tap to zoom, drag to pan
    stage.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      start = { x: e.clientX, y: e.clientY };
    });
    stage.addEventListener('pointerup', function (e) {
      if (!start || e.pointerType === 'mouse') return;
      var dx = e.clientX - start.x;
      var dy = e.clientY - start.y;
      start = null;
      if (!zoomed && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        suppressClick = true;
        show(index + (dx < 0 ? 1 : -1));
      }
    });
    stage.addEventListener('pointercancel', function () { start = null; });

    stage.addEventListener('click', function (e) {
      if (suppressClick) { suppressClick = false; return; }
      setOrigin(e);
      setZoom(!zoomed);
    });

    if (zoomBtn) {
      zoomBtn.addEventListener('click', function () {
        centreOrigin();
        setZoom(!zoomed);
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && zoomed) setZoom(false);
    });

    img.addEventListener('dragstart', function (e) { e.preventDefault(); });
    updateCount();
  }

  /* ---------- Size, upsell, add to bag ---------- */
  function initPurchase() {
    var sizes = $$('input[name="size"]');
    var upsell = $('[data-upsell]');
    var upsellCard = upsell ? upsell.closest('.upsell') : null;
    var priceEls = $$('[data-price-display]');
    var sizeEls = $$('[data-size-display]');
    var ctas = $$('[data-add-to-bag]');
    var cartCounts = $$('[data-cart-count]');
    if (!sizes.length && !ctas.length) return;

    var cartTotal = parseInt(cartCounts.length ? cartCounts[0].textContent : '0', 10) || 0;
    var resetTimer = null;

    function currentSize() {
      var s = sizes.find(function (x) { return x.checked; }) || sizes[0];
      return s ? { price: Number(s.dataset.price) || 0, label: s.dataset.label || s.value } : { price: 0, label: '' };
    }

    function total() {
      return currentSize().price + (upsell && upsell.checked ? Number(upsell.dataset.price) || 0 : 0);
    }

    function setCtaLabel(btn, text) {
      var label = $('[data-cta-label]', btn) || btn;
      label.textContent = text;
    }

    function render() {
      var size = currentSize();
      priceEls.forEach(function (el) { swapText(el, money(size.price)); });
      sizeEls.forEach(function (el) { swapText(el, size.label); });
      ctas.forEach(function (btn) {
        if (!btn.classList.contains('is-added')) setCtaLabel(btn, 'Add to bag · ' + money(total()));
      });
      if (upsellCard) upsellCard.classList.toggle('is-selected', !!(upsell && upsell.checked));
    }

    sizes.forEach(function (s) { s.addEventListener('change', render); });
    if (upsell) upsell.addEventListener('change', render);

    ctas.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        if (btn.tagName === 'A') e.preventDefault();
        var size = currentSize();
        var withSet = !!(upsell && upsell.checked);
        cartTotal += withSet ? 2 : 1;

        cartCounts.forEach(function (c) {
          c.textContent = String(cartTotal);
          c.classList.remove('is-bump');
          void c.offsetWidth;
          c.classList.add('is-bump');
        });

        ctas.forEach(function (b) {
          b.classList.add('is-added');
          setCtaLabel(b, 'Added to your bag');
        });

        announce('Fig & Smoke, ' + size.label + (withSet ? ', with the Discovery Set,' : '') +
          ' added to your bag. ' + cartTotal + ' item' + (cartTotal === 1 ? '' : 's') + ' in bag.');

        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(function () {
          ctas.forEach(function (b) { b.classList.remove('is-added'); });
          render();
        }, 2800);
      });
    });

    render();

    // mobile buy bar appears once the main button has scrolled away
    var primary = $('[data-primary-cta]');
    var bar = $('[data-buy-bar]');
    if (primary && bar) {
      var setBar = function (visible) {
        bar.classList.toggle('is-visible', visible);
        bar.setAttribute('aria-hidden', String(!visible));
        bar.inert = !visible;
      };
      setBar(false);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          var entry = entries[0];
          setBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
        }).observe(primary);
      }
    }
  }

  /* ---------- Notes pyramid ---------- */
  function initPyramid() {
    var root = $('[data-pyramid]');
    if (!root) return;
    var pyramid = $('.pyramid', root);
    var tiers = $$('[data-tier]', root);
    var panels = $$('[data-tier-panel]', root);
    if (!tiers.length) return;

    function activate(name) {
      if (pyramid) pyramid.classList.add('has-active');
      tiers.forEach(function (t) {
        var on = t.dataset.tier === name;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-pressed', String(on));
      });
      panels.forEach(function (p) {
        var on = p.dataset.tierPanel === name;
        p.classList.toggle('is-active', on);
        p.setAttribute('aria-hidden', String(!on));
      });
    }

    tiers.forEach(function (t) {
      var go = function () { activate(t.dataset.tier); };
      t.addEventListener('pointerenter', go);
      t.addEventListener('focus', go);
      t.addEventListener('click', go);
    });

    var initial = tiers.find(function (t) { return t.classList.contains('is-active'); }) || tiers[0];
    activate(initial.dataset.tier);
  }

  /* ---------- How it wears: 0h / 2h / 6h ---------- */
  function initWear() {
    var root = $('[data-wear]');
    if (!root) return;
    var stops = $$('[data-stop]', root);
    if (!stops.length) return;
    var interacted = false;
    var timers = [];

    function activate(i) {
      var last = Math.max(1, stops.length - 1);
      root.style.setProperty('--p', String(i / last));
      stops.forEach(function (s, k) {
        s.classList.toggle('is-active', k === i);
        s.classList.toggle('is-past', k < i);
        var btn = $('.wear__time', s);
        if (btn) btn.setAttribute('aria-pressed', String(k === i));
      });
    }

    function byUser(i) {
      interacted = true;
      timers.forEach(window.clearTimeout);
      activate(i);
    }

    stops.forEach(function (s, k) {
      s.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') byUser(k); });
      var btn = $('.wear__time', s);
      if (btn) {
        btn.addEventListener('click', function () { byUser(k); });
        btn.addEventListener('focus', function () { byUser(k); });
      }
    });

    activate(0);

    // once in view, the scent "dries down" slowly on its own
    if (!reduceMotion && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (!entries.some(function (e) { return e.isIntersecting; })) return;
        io.disconnect();
        for (var s = 1; s < stops.length; s++) {
          (function (step) {
            timers.push(window.setTimeout(function () { if (!interacted) activate(step); }, 1800 * step));
          })(s);
        }
      }, { threshold: 0.45 });
      io.observe(root);
    }
  }

  /* ---------- Accordion: slow open / close on native <details> ---------- */
  function initAccordions() {
    $$('details.acc').forEach(function (d) {
      var summary = $('summary', d);
      var body = $('.acc__body', d);
      if (!summary || !body || !body.animate || reduceMotion) return;
      var anim = null;

      summary.addEventListener('click', function (e) {
        e.preventDefault();
        if (anim) { anim.cancel(); anim = null; }

        if (d.open) {
          var h = body.offsetHeight;
          anim = body.animate(
            [{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
            { duration: 560, easing: 'cubic-bezier(.4,0,.2,1)' }
          );
          anim.onfinish = function () { d.open = false; anim = null; };
        } else {
          d.open = true;
          var target = body.offsetHeight;
          anim = body.animate(
            [{ height: '0px', opacity: 0 }, { height: target + 'px', opacity: 1 }],
            { duration: 760, easing: 'cubic-bezier(.22,.61,.36,1)' }
          );
          anim.onfinish = function () { anim = null; };
        }
      });
    });
  }

  /* ---------- Reviews: show more ---------- */
  function initReviews() {
    var btn = $('[data-reviews-more]');
    if (!btn) return;
    var step = Number(btn.dataset.step) || 3;

    btn.addEventListener('click', function () {
      var hidden = $$('.review[hidden]');
      var batch = hidden.slice(0, step);
      batch.forEach(function (r) {
        r.hidden = false;
        if (!reduceMotion) {
          r.classList.add('is-entering');
          window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () { r.classList.remove('is-entering'); });
          });
        }
      });
      if (batch[0]) {
        batch[0].setAttribute('tabindex', '-1');
        batch[0].focus({ preventScroll: true });
      }
      var remaining = hidden.length - batch.length;
      if (remaining <= 0) {
        btn.hidden = true;
      } else {
        var label = $('[data-more-label]', btn) || btn;
        label.textContent = 'Read more reviews (' + remaining + ')';
      }
      announce(batch.length + ' more review' + (batch.length === 1 ? '' : 's') + ' shown.');
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    initReveal();
    initHeader();
    initGallery();
    initPurchase();
    initPyramid();
    initWear();
    initAccordions();
    initReviews();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
