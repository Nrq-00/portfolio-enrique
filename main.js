/* Enrique Alejandro Pérez — portfolio. Classic script, no modules. */
(function () {
  'use strict';

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn('[init ' + name + ']', e); }
  }

  /* ---------- nav solid on scroll ---------- */
  function initNav() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    var onScroll = function () { nav.classList.toggle('is-solid', window.scrollY > 40); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    document.querySelectorAll('.timeline li').forEach(function (li, i) {
      li.style.transitionDelay = (i * 80) + 'ms';
    });
    var show = function (el) { el.classList.add('is-in'); };
    if (!('IntersectionObserver' in window)) { items.forEach(show); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
    // safety net: nothing stays hidden
    setTimeout(function () { items.forEach(show); }, 6000);
  }

  /* ---------- running timecode ---------- */
  function initTimecode() {
    var el = document.getElementById('timecode');
    if (!el) return;
    var start = performance.now();
    var visible = true, last = 0;
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        var was = visible;
        visible = e[0].isIntersecting;
        if (visible && !was) requestAnimationFrame(tick);
      }).observe(el);
    }
    var tick = function (now) {
      if (!visible) return;
      if (now - last < 40) { requestAnimationFrame(tick); return; }
      last = now;
      var t = (now - start) / 1000;
      var f = Math.floor((t % 1) * 25);
      var s = Math.floor(t) % 60;
      var m = Math.floor(t / 60) % 60;
      var h = Math.floor(t / 3600);
      el.textContent = pad(h) + ':' + pad(m) + ':' + pad(s) + ':' + pad(f);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- thumbnails: show fallback title if Drive blocks the image ---------- */
  function initThumbs() {
    document.querySelectorAll('.clip-thumb').forEach(function (img) {
      var fail = function () { img.style.display = 'none'; };
      if (!img.getAttribute('src')) { fail(); return; }
      img.addEventListener('error', fail);
      if (img.complete && img.naturalWidth === 0) fail();
    });
  }

  /* ---------- video player (Google Drive embed) ---------- */
  function initPlayer() {
    var dlg = document.getElementById('player');
    var frame = document.getElementById('player-frame');
    var title = document.getElementById('player-title');
    var ext = document.getElementById('player-ext');
    var close = document.getElementById('player-close');
    if (!dlg || !frame) return;

    var open = function (clip) {
      var id = clip.getAttribute('data-id');
      if (!id) return;
      dlg.classList.toggle('is-vertical', clip.getAttribute('data-format') === 'v');
      title.textContent = clip.getAttribute('data-title') || '';
      ext.href = 'https://drive.google.com/file/d/' + id + '/view';
      frame.innerHTML = '';
      var iframe = document.createElement('iframe');
      iframe.src = 'https://drive.google.com/file/d/' + id + '/preview';
      iframe.allow = 'autoplay; fullscreen';
      iframe.allowFullscreen = true;
      iframe.title = title.textContent;
      frame.appendChild(iframe);
      if (typeof dlg.showModal === 'function') dlg.showModal();
      else window.open(ext.href, '_blank', 'noopener');
    };
    var shut = function () { if (dlg.open) dlg.close(); };

    document.querySelectorAll('.clip[data-id]').forEach(function (clip) {
      clip.addEventListener('click', function () { open(clip); });
    });
    close.addEventListener('click', shut);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) shut(); });
    dlg.addEventListener('close', function () { frame.innerHTML = ''; });
  }

  function boot() {
    safe(initNav, 'nav');
    safe(initReveal, 'reveal');
    safe(initTimecode, 'timecode');
    safe(initThumbs, 'thumbs');
    safe(initPlayer, 'player');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
