// Echowrought Games — small progressive enhancements. The page works without this file.
(function () {

  // Intro gate: break the seal (or skip) to enter. Remembered so it only shows once per visitor.
  var root = document.documentElement;
  var gate = document.getElementById('gate');
  if (gate && root.classList.contains('gate-on')) {
    var seal = document.getElementById('gate-seal');
    var skip = document.getElementById('gate-skip');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var done = false;
    var openGate = function (animate) {
      if (done) return;
      done = true;
      try { localStorage.setItem('ew-gate-seen', '1'); } catch (e) {}
      var finish = function () { root.classList.remove('gate-on'); gate.remove(); };
      if (animate && !reduce) { gate.classList.add('opening'); setTimeout(finish, 1300); }
      else finish();
    };
    seal.addEventListener('click', function () { openGate(true); });
    skip.addEventListener('click', function () { openGate(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') openGate(false); });
    seal.focus({ preventScroll: true });
  }
  // Tabs (CWG section): click and arrow-key support
  var stage = document.querySelector('.stage');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function select(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
      if (on && stage && t.dataset.view) stage.setAttribute('data-active', t.dataset.view);
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var next = tabs[(i + d + tabs.length) % tabs.length];
      select(next);
      next.focus();
    });
  });

  // Hero roster: show the hovered / tapped hero's name in the caption
  var rosterName = document.getElementById('roster-name');
  var tilesEls = document.querySelectorAll('.hero-tile');
  function showHero(tile) {
    tilesEls.forEach(function (x) { x.classList.toggle('on', x === tile); });
    if (rosterName) rosterName.textContent = tile ? tile.dataset.name : 'The Cast';
  }
  tilesEls.forEach(function (tile) {
    tile.addEventListener('mouseenter', function () { showHero(tile); });
    tile.addEventListener('focus', function () { showHero(tile); });
    tile.addEventListener('click', function () { showHero(tile); });
  });
  var roster = document.querySelector('.roster');
  if (roster) roster.addEventListener('mouseleave', function () { showHero(null); });

  // Sticky header gets more solid once you scroll; mobile menu toggle
  var header = document.querySelector('.site-header');
  var onScroll = function () { if (header) header.classList.toggle('scrolled', window.scrollY > 40); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var menuBtn = document.querySelector('.menu-btn');
  var navLinks = document.getElementById('nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) { navLinks.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Fade sections in as they scroll into view
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  // Links that don't have a destination yet: keep them from jumping to the top
  document.querySelectorAll('[data-todo]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });
})();

// Patch notes: highlight the section in view
(function () {
  var links = document.querySelectorAll('.pn-nav a');
  if (!links.length || !('IntersectionObserver' in window)) return;
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        links.forEach(function (a) { a.classList.remove('active'); });
        var a = map[e.target.id]; if (a) a.classList.add('active');
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
})();
