Arcade.run(function (box, A) {
  const SYM = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'], LEN = 4, MAX = 8;
  const dkey = d => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  const now = new Date(), today = dkey(now);
  const yest = new Date(now); yest.setDate(yest.getDate() - 1);
  const yKey = dkey(yest);
  let practice = false, code, guesses, cur, done, won;
  const wrap = A.el('div', 'dom'); box.appendChild(wrap);

  function makeCode(seed) { const r = A.rng(A.hash(seed)); return Array.from({ length: LEN }, () => Math.floor(r() * SYM.length)); }
  function score(g, c) {
    let b = 0, w = 0; const cc = {}, gc = {};
    for (let i = 0; i < LEN; i++) { if (g[i] === c[i]) b++; else { cc[c[i]] = (cc[c[i]] || 0) + 1; gc[g[i]] = (gc[g[i]] || 0) + 1; } }
    for (const k in gc) w += Math.min(gc[k], cc[k] || 0);
    return { b, w };
  }
  function stats() { return A.store.get('cipher_stats', { played: 0, won: 0, streak: 0, max: 0, lastWin: '', dist: [0, 0, 0, 0, 0, 0, 0, 0] }); }

  function load() {
    practice = false; code = makeCode('echo-cipher-' + today);
    const s = A.store.get('cipher_day_' + today, null);
    guesses = s ? s.guesses : []; done = s ? s.done : false; won = s ? s.won : false; cur = [];
  }
  function newPractice() {
    practice = true; code = Array.from({ length: LEN }, () => Math.floor(Math.random() * SYM.length));
    guesses = []; cur = []; done = false; won = false; render();
  }
  function save() { if (!practice) A.store.set('cipher_day_' + today, { guesses, done, won }); }

  function finish() {
    done = true;
    if (!practice) {
      const s = stats(); s.played++;
      if (won) { s.won++; s.streak = (s.lastWin === yKey) ? s.streak + 1 : 1; s.lastWin = today; s.max = Math.max(s.max, s.streak); s.dist[guesses.length - 1]++; }
      else s.streak = 0;
      A.store.set('cipher_stats', s);
    }
    save();
  }
  function submit() {
    if (cur.length !== LEN || done) return;
    guesses.push(cur.slice()); cur = [];
    const sc = score(guesses[guesses.length - 1], code);
    A.beep(400 + sc.b * 150, .15, 'triangle', .06);
    if (sc.b === LEN) { won = true; finish(); } else if (guesses.length >= MAX) { finish(); }
    else save();
    render();
  }
  function shareText() {
    let t = 'Echo Cipher ' + today + ' ' + (won ? guesses.length : 'X') + '/' + MAX + '\n';
    guesses.forEach(g => { const s = score(g, code); t += '⚫'.repeat(s.b) + '⚪'.repeat(s.w) + '▫️'.repeat(LEN - s.b - s.w) + '\n'; });
    return t + location.origin + location.pathname.replace('play.html', '');
  }
  function countdown() {
    const n = new Date(), nx = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1), s = Math.floor((nx - n) / 1000);
    const p = v => String(v).padStart(2, '0');
    return p(Math.floor(s / 3600)) + ':' + p(Math.floor(s % 3600 / 60)) + ':' + p(s % 60);
  }

  function render() {
    const st = stats();
    let h = '<div class="panel" style="text-align:center"><b>' + (practice ? 'PRACTICE MODE' : 'DAILY CIPHER • ' + today) + '</b><br><span class="small">Crack the 4-color code in ' + MAX + ' tries. ⚫ right color &amp; place • ⚪ right color, wrong place. Colors can repeat.</span><br><span class="small">🔥 Streak <b>' + st.streak + '</b> • Best <b>' + st.max + '</b> • Played <b>' + st.played + '</b> • Won <b>' + st.won + '</b></span></div>';
    h += '<div class="board">';
    for (let r = 0; r < MAX; r++) {
      h += '<div class="crow">';
      const g = guesses[r];
      for (let i = 0; i < LEN; i++) {
        const isCur = r === guesses.length && !done;
        const v = g ? g[i] : (isCur ? cur[i] : undefined);
        h += '<div class="slot' + (isCur && i === cur.length ? ' cur' : '') + '">' + (v !== undefined ? SYM[v] : '') + '</div>';
      }
      h += '<div class="pegs">';
      const sc = g ? score(g, code) : null;
      for (let i = 0; i < LEN; i++) h += '<div class="peg' + (sc ? (i < sc.b ? ' b' : i < sc.b + sc.w ? ' w' : '') : '') + '"></div>';
      h += '</div></div>';
    }
    h += '</div>';
    if (!done) {
      h += '<div class="pal">' + SYM.map((s, i) => '<button class="btn" data-c="' + i + '">' + s + '</button>').join('') + '</div>';
      h += '<div class="pal"><button class="btn" id="del">⌫ Delete</button><button class="btn gold" id="sub"' + (cur.length === LEN ? '' : ' disabled') + '>Submit</button></div>';
    } else {
      h += '<div class="panel" style="text-align:center"><h2 style="margin:0">' + (won ? '🎉 Cracked in ' + guesses.length + '!' : '💥 Not this time') + '</h2>';
      if (!won) h += '<p>The code was: <span style="font-size:1.6rem">' + code.map(i => SYM[i]).join(' ') + '</span></p>';
      if (!practice) h += '<p>Next daily cipher in <b id="cd">' + countdown() + '</b></p><button class="btn gold" id="share">📋 Copy result</button> ';
      h += '<button class="btn" id="prac">Play a practice code</button>' + (practice ? ' <button class="btn" id="back">Back to daily</button>' : '') + '</div>';
    }
    wrap.innerHTML = h;
    wrap.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { if (cur.length < LEN) { cur.push(+b.dataset.c); A.beep(500, .05); render(); } });
    const del = wrap.querySelector('#del'); if (del) del.onclick = () => { cur.pop(); render(); };
    const sub = wrap.querySelector('#sub'); if (sub) sub.onclick = submit;
    const sh = wrap.querySelector('#share'); if (sh) sh.onclick = () => {
      const t = shareText();
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(() => { sh.textContent = '✅ Copied!'; }, () => prompt('Copy your result:', t)); else prompt('Copy your result:', t);
    };
    const pr = wrap.querySelector('#prac'); if (pr) pr.onclick = newPractice;
    const bk = wrap.querySelector('#back'); if (bk) bk.onclick = () => { load(); render(); };
  }
  A.onKey(k => {
    if (done) return;
    if (k >= '1' && k <= '6' && cur.length < LEN) { cur.push(+k - 1); render(); }
    else if (k === 'backspace') { cur.pop(); render(); }
    else if (k === 'enter') submit();
  });
  setInterval(() => { const c = document.getElementById('cd'); if (c) c.textContent = countdown(); }, 1000);
  load(); render();
});
