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
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function select(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
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
