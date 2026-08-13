/* Accessibility toolbar driver for the homepage (vanilla JS, no jQuery).
 * Reuses the pojo-accessibility toolbar markup + CSS from the inner pages, and
 * shares the same localStorage state ("pojo-a11y") so settings roam across the
 * whole site. Text resize is implemented with body zoom classes (zma-resize-*)
 * instead of pojo's %-font rules, which fight the homepage's px-based design.
 */
(function () {
  'use strict';

  var KEY = 'pojo-a11y';
  var MIN = 120, MAX = 200, STEP = 10;   /* pojo font-size scale: 120 = 100% */
  var EXPIRES_HOURS = 12;
  var SCHEMA = ['grayscale', 'high-contrast', 'negative-contrast', 'light-background'];
  var TOGGLES = ['links-underline', 'readable-font'];

  var state = { actions: {}, fontSize: MIN, expires: null };

  function load() {
    try {
      var t = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!t) return;
      if (t.variables && t.variables.expires && t.variables.expires < Date.now()) {
        localStorage.removeItem(KEY);
        return;
      }
      state.actions = t.actions || {};
      if (t.variables && t.variables.currentFontSize) state.fontSize = t.variables.currentFontSize;
      if (t.variables && t.variables.expires) state.expires = t.variables.expires;
    } catch (e) { /* storage unavailable */ }
  }

  function save() {
    try {
      state.expires = state.expires || Date.now() + EXPIRES_HOURS * 36e5;
      localStorage.setItem(KEY, JSON.stringify({
        actions: state.actions,
        variables: { currentFontSize: state.fontSize, expires: state.expires }
      }));
    } catch (e) { /* storage unavailable */ }
  }

  function apply() {
    var cl = document.body.classList;
    SCHEMA.concat(TOGGLES).forEach(function (a) {
      cl.toggle('pojo-a11y-' + a, !!state.actions[a]);
    });
    for (var s = MIN + STEP; s <= MAX; s += STEP) cl.remove('zma-resize-' + s);
    if (state.fontSize > MIN) cl.add('zma-resize-' + state.fontSize);

    document.querySelectorAll('.pojo-a11y-toolbar-link[data-action]').forEach(function (el) {
      var a = el.getAttribute('data-action');
      if (a === 'reset') return;
      var on = a === 'resize-plus' ? state.fontSize > MIN
             : a === 'resize-minus' ? false
             : !!state.actions[a];
      el.classList.toggle('active', on);
      el.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function act(a) {
    if (a === 'reset') {
      state.actions = {};
      state.fontSize = MIN;
      state.expires = null;
      apply();
      try { localStorage.removeItem(KEY); } catch (e) { /* storage unavailable */ }
      return;
    }
    if (a === 'resize-plus' || a === 'resize-minus') {
      if (a === 'resize-plus' && state.fontSize < MAX) state.fontSize += STEP;
      if (a === 'resize-minus' && state.fontSize > MIN) state.fontSize -= STEP;
      state.actions['resize-plus'] = state.fontSize > MIN;   /* keep pojo's schema */
      state.actions['resize-minus'] = false;
    } else if (SCHEMA.indexOf(a) > -1) {
      var wasOn = !!state.actions[a];
      SCHEMA.forEach(function (s) { delete state.actions[s]; });
      if (!wasOn) state.actions[a] = true;
    } else {
      if (state.actions[a]) delete state.actions[a];
      else state.actions[a] = true;
    }
    apply();
    save();
  }

  function init() {
    var bar = document.getElementById('pojo-a11y-toolbar');
    if (!bar) return;
    var toggleLink = bar.querySelector('.pojo-a11y-toolbar-toggle-link');
    var links = bar.querySelectorAll('a.pojo-a11y-toolbar-link[data-action]');

    function setOpen(open) {
      bar.classList.toggle('pojo-a11y-toolbar-open', open);
      toggleLink.setAttribute('aria-expanded', open ? 'true' : 'false');
      links.forEach(function (l) { l.setAttribute('tabindex', open ? '0' : '-1'); });
    }

    toggleLink.setAttribute('aria-expanded', 'false');
    toggleLink.addEventListener('click', function (e) {
      e.preventDefault();
      setOpen(!bar.classList.contains('pojo-a11y-toolbar-open'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && bar.classList.contains('pojo-a11y-toolbar-open')) {
        setOpen(false);
        toggleLink.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (!bar.contains(e.target)) setOpen(false);
    });
    links.forEach(function (l) {
      l.addEventListener('click', function (e) {
        e.preventDefault();
        act(l.getAttribute('data-action'));
      });
    });

    apply();
  }

  load();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
