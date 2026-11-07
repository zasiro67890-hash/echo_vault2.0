(function () {
  'use strict';
  const A = window.Arcade = {};
  const qs = new URLSearchParams(location.search);
  A.gameId = qs.get('g') || '';
  A.$ = (s, r) => (r || document).querySelector(s);
  A.el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  A.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  A.rand = (a, b) => a + Math.random() * (b - a);
  A.pick = arr => arr[(Math.random() * arr.length) | 0];

  A.store = {
    get(k, d) { try { const v = localStorage.getItem('arc_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('arc_' + k, JSON.stringify(v)); } catch (e) {} }
  };
  A.best = function (id, score, lowerIsBetter) {
    const k = 'best_' + id, b = A.store.get(k, null);
    if (b === null || (lowerIsBetter ? score < b : score > b)) { A.store.set(k, score); return { best: score, isNew: true }; }
    return { best: b, isNew: false };
  };
  A.getBest = (id, d) => A.store.get('best_' + id, d);

  A.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  A.hash = function (s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };

  let ac = null;
  A.muted = A.store.get('muted', false);
  A.beep = function (f, d, type, v) {
    if (A.muted) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      d = d || 0.1;
      o.type = type || 'sine';
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(Math.max(30, f / 2), t + d);
      g.gain.setValueAtTime(v || 0.06, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(ac.destination); o.start(); o.stop(t + d);
    } catch (e) {}
  };

  A.keys = {};
  A.keyHandlers = [];
  window.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
    if (!typing && document.body.classList.contains('arcade-play') &&
        [' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k) && e.target.tagName !== 'BUTTON') e.preventDefault();
    if (!A.keys[k]) A.keyHandlers.forEach(h => h(k, e));
    A.keys[k] = true;
  });
  window.addEventListener('keyup', e => { A.keys[e.key.toLowerCase()] = false; });
  window.addEventListener('blur', () => { A.keys = {}; });
  A.onKey = fn => { A.keyHandlers.push(fn); };

  A.canvas = function (box, w, h) {
    const cv = A.el('canvas', 'gcanvas');
    cv.width = w; cv.height = h; box.appendChild(cv);
    const ctx = cv.getContext('2d');
    const p = { x: w / 2, y: h / 2, down: false, touch: false, clicked: false };
    const pos = e => { const r = cv.getBoundingClientRect(); p.x = (e.clientX - r.left) * w / r.width; p.y = (e.clientY - r.top) * h / r.height; };
    cv.addEventListener('pointerdown', e => {
      pos(e); p.down = true; p.clicked = true; p.touch = e.pointerType === 'touch';
      try { cv.setPointerCapture(e.pointerId); } catch (_) {}
    });
    cv.addEventListener('pointermove', pos);
    cv.addEventListener('pointerup', () => { p.down = false; });
    cv.addEventListener('pointercancel', () => { p.down = false; });
    cv.addEventListener('contextmenu', e => e.preventDefault());
    return { cv, ctx, p, w, h };
  };

  A.loop = function (fn) {
    let last = performance.now(), id, on = true;
    const f = t => {
      if (!on) return;
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      fn(dt, t);
      id = requestAnimationFrame(f);
    };
    id = requestAnimationFrame(f);
    return () => { on = false; cancelAnimationFrame(id); };
  };

  A.overlay = function (box, html, btns) {
    const old = box.querySelector('.ov'); if (old) old.remove();
    const o = A.el('div', 'ov');
    const inner = A.el('div', 'ovin', html);
    const row = A.el('div', 'ovbtns');
    (btns || []).forEach(b => {
      const x = A.el('button', 'btn big', b.label);
      x.onclick = () => { o.remove(); b.fn(); };
      row.appendChild(x);
    });
    inner.appendChild(row); o.appendChild(inner); box.appendChild(o);
    return o;
  };

  A.run = function (fn) { fn(document.getElementById('gamebox'), A); };

  A.fmt = function (n) {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e4) return (n / 1e3).toFixed(1) + 'K';
    return Math.floor(n).toString();
  };
})();
