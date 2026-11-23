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
    tile.addEventListener('click', function () { showHero(tile); openHero(tile.dataset.name); });
  });

  // Hero detail: three ascensions, tier titles and a line of lore
  var heroData = {};
  try { heroData = JSON.parse((document.getElementById('hero-data') || {}).textContent || '{}'); } catch (e) {}
  var detail = document.getElementById('hero-detail');
  var lastTile = null;
  function $(id) { return document.getElementById(id); }
  function openHero(name) {
    var d = heroData[name];
    if (!d || !detail) return;
    lastTile = document.activeElement;
    $('hd-group').textContent = d.group;
    $('hd-name').textContent = d.name || name;
    for (var i = 1; i <= 3; i++) {
      var img = $('hd-t' + i);
      img.src = '/assets/tiers/' + d.slug + '-t' + i + '.jpg';
      img.alt = (d.name || name) + ', tier ' + i;
      $('hd-n' + i).textContent = d.titles[i - 1] || '';
    }
    $('hd-lore').textContent = d.lore;
    var meta = [];
    if (d.role) meta.push('<b>' + d.role + '</b>');
    if (d.sig) meta.push('Signature: <b>' + d.sig + '</b>');
    $('hd-meta').innerHTML = meta.join(' · ');
    detail.hidden = false;
    detail.querySelector('.hd-back').focus({ preventScroll: true });
  }
  function closeHero() {
    if (!detail || detail.hidden) return;
    detail.hidden = true;
    if (lastTile && lastTile.focus) lastTile.focus({ preventScroll: true });
  }
  if (detail) {
    detail.querySelector('.hd-back').addEventListener('click', closeHero);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeHero(); });
    document.querySelectorAll('[role="tab"]').forEach(function (t) { t.addEventListener('click', closeHero); });
  }
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

// Discord: live member count from the public invite (hidden if it can't be read)
(function () {
  var out = document.getElementById('discord-count');
  if (!out || !window.fetch) return;
  fetch('https://discord.com/api/v10/invites/Z5Pf8exufw?with_counts=true')
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d || !d.approximate_member_count) return;
      var fmt = function (n) { return n.toLocaleString('en-US'); };
      out.innerHTML = '<b>' + fmt(d.approximate_member_count) + '</b> members · <b>' + fmt(d.approximate_presence_count || 0) + '</b> online now';
      out.hidden = false;
    })
    .catch(function () {});
})();
