Arcade.run(function (box, A) {
  const W = 960, H = 600;
  const bar = A.el('div', 'gbar'); box.appendChild(bar);
  const C = A.canvas(box, W, H), ctx = C.ctx, P = C.p;
  const GL = [
    { id: 'invert', n: 'INVERTED CONTROLS', d: 'Left is right. Up is down. Good luck.' },
    { id: 'ice', n: 'ICE FLOOR', d: 'You slide. A lot.' },
    { id: 'swap', n: 'COLORS LIE', d: 'Red orbs are GOOD. Green orbs HURT.' },
    { id: 'dark', n: 'LIGHTS OUT', d: 'You can only see close to you.' },
    { id: 'mega', n: 'MEGA YOU', d: 'You are huge and slow.' },
    { id: 'tiny', n: 'TINY TURBO', d: 'You are tiny and very fast.' },
    { id: 'spin', n: 'SPINNING WORLD', d: 'The whole world rotates.' },
    { id: 'slow', n: 'BULLET TIME', d: 'Everything but you is slow.' },
    { id: 'magnet', n: 'MAGNET MODE', d: 'Every orb is pulled toward you. Every one.' },
    { id: 'gravity', n: 'GRAVITY', d: 'You fall. Press up or tap above you to flap.' },
    { id: 'rain', n: 'ORB RAIN', d: 'Red orbs fall from the sky!' }
  ];
  let p, orbs, score, lives, state = 'menu', g, gT, spawnT, combo, comboT, inv, bannerT, t0, lastId = '', rot = 0, flashT = 0;

  function start() {
    p = { x: W / 2, y: H / 2, vx: 0, vy: 0 }; orbs = []; score = 0; lives = 3; combo = 1; comboT = 0; inv = 0; spawnT = 0; t0 = 0;
    state = 'play'; nextGlitch(true);
  }
  function nextGlitch(first) {
    let n; do { n = A.pick(GL); } while (n.id === lastId);
    g = first ? { id: 'none', n: 'NORMAL (for now)', d: 'Collect green. Avoid red. The rules WILL change.' } : n;
    lastId = g.id; gT = 9; bannerT = 3.2; flashT = .4;
    if (!first) A.beep(200, .4, 'sawtooth', .07);
    if (g.id === 'rain') for (let i = 0; i < 8; i++) orbs.push({ x: A.rand(30, W - 30), y: -A.rand(0, 300), vx: 0, vy: A.rand(120, 220), good: false, r: 13, life: 20, rain: true });
  }
  function spawn() {
    const good = Math.random() < .6, a = Math.random() * 6.28, s = A.rand(50, 130);
    let x, y; do { x = A.rand(30, W - 30); y = A.rand(30, H - 30); } while (Math.hypot(x - p.x, y - p.y) < 160);
    orbs.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, good, r: 12, life: 14 });
  }
  function rad() { return g.id === 'mega' ? 34 : g.id === 'tiny' ? 7 : 16; }
  function hurt() {
    if (inv > 0) return;
    lives--; inv = 1.2; combo = 1; A.beep(110, .3, 'sawtooth', .1); flashT = .3;
    if (lives <= 0) {
      state = 'end';
      const r = A.best('glitch-protocol', score);
      A.overlay(box, '<h2>SYSTEM CRASH</h2><p>Score <b>' + score + '</b> • Best <b>' + r.best + '</b>' + (r.isNew ? ' 🏆 new!' : '') + '</p>', [{ label: '↻ REBOOT', fn: start }]);
    }
  }

  function update(dt) {
    if (state !== 'play') return;
    t0 += dt; inv = Math.max(0, inv - dt); bannerT = Math.max(0, bannerT - dt); flashT = Math.max(0, flashT - dt);
    gT -= dt; if (gT <= 0) nextGlitch(false);
    comboT -= dt; if (comboT <= 0) combo = 1;
    rot = g.id === 'spin' ? rot + dt * .7 : rot * .9;
    const K = A.keys; let ix = 0, iy = 0;
    if (K.a || K.arrowleft) ix -= 1; if (K.d || K.arrowright) ix += 1;
    if (K.w || K.arrowup) iy -= 1; if (K.s || K.arrowdown) iy += 1;
    if (P.down) {
      let px = P.x, py = P.y;
      if (g.id === 'spin') { const c = Math.cos(rot), s = Math.sin(rot), dx = P.x - W / 2, dy = P.y - H / 2; px = W / 2 + dx * c + dy * s; py = H / 2 - dx * s + dy * c; }
      const dx = px - p.x, dy = py - p.y, d = Math.hypot(dx, dy);
      if (d > 12) { ix = dx / d; iy = dy / d; }
    }
    if (g.id === 'invert') { ix = -ix; iy = -iy; }
    let sp = 260; if (g.id === 'mega') sp = 150; if (g.id === 'tiny') sp = 420;
    const l = Math.hypot(ix, iy) || 1;
    let tx = ix / l * sp * (ix || iy ? 1 : 0), ty = iy / l * sp * (ix || iy ? 1 : 0);
    if (g.id === 'gravity') {
      p.vy += 760 * dt;
      p.vx += (tx - p.vx) * Math.min(1, dt * 12);
      if (iy < 0 || (P.down && P.y < p.y - 20)) p.vy -= 1700 * dt;
    } else if (g.id === 'ice') { p.vx += (tx - p.vx) * Math.min(1, dt * 1.3); p.vy += (ty - p.vy) * Math.min(1, dt * 1.3); }
    else { p.vx += (tx - p.vx) * Math.min(1, dt * 14); p.vy += (ty - p.vy) * Math.min(1, dt * 14); }
    p.x += p.vx * dt; p.y += p.vy * dt;
    const R = rad();
    if (p.x < R) { p.x = R; p.vx = Math.abs(p.vx) * .4; } if (p.x > W - R) { p.x = W - R; p.vx = -Math.abs(p.vx) * .4; }
    if (p.y < R) { p.y = R; p.vy = Math.abs(p.vy) * .3; } if (p.y > H - R) { p.y = H - R; p.vy = g.id === 'gravity' ? 0 : -Math.abs(p.vy) * .4; }

    spawnT -= dt; if (spawnT <= 0 && orbs.length < 20) { spawn(); spawnT = .75; }
    if (g.id === 'rain' && Math.random() < dt * 3) orbs.push({ x: A.rand(30, W - 30), y: -10, vx: 0, vy: A.rand(120, 240), good: false, r: 13, life: 10, rain: true });
    const ts = g.id === 'slow' ? .35 : 1;
    for (let i = orbs.length - 1; i >= 0; i--) {
      const o = orbs[i]; o.life -= dt;
      if (g.id === 'magnet') { const dx = p.x - o.x, dy = p.y - o.y, d = Math.hypot(dx, dy) || 1; o.vx += dx / d * 260 * dt; o.vy += dy / d * 260 * dt; const sp2 = Math.hypot(o.vx, o.vy); if (sp2 > 200) { o.vx *= 200 / sp2; o.vy *= 200 / sp2; } }
      o.x += o.vx * dt * ts; o.y += o.vy * dt * ts;
      if (!o.rain) { if (o.x < o.r || o.x > W - o.r) o.vx *= -1; if (o.y < o.r || o.y > H - o.r) o.vy *= -1; }
      let remove = o.life <= 0 || (o.rain && o.y > H + 30);
      if (!remove && Math.hypot(o.x - p.x, o.y - p.y) < o.r + R) {
        const lies = g.id === 'swap', beneficial = lies ? !o.good : o.good;
        if (beneficial) { score += 10 * combo; combo = Math.min(6, combo + 1); comboT = 1.4; A.beep(700 + combo * 80, .1, 'triangle', .06); }
        else hurt();
        remove = true;
      }
      if (remove) orbs.splice(i, 1);
    }
    bar.innerHTML = '<span>SCORE <b>' + score + '</b></span><span>LIVES <b>' + '❤'.repeat(Math.max(0, lives)) + '</b></span><span>COMBO <b>x' + combo + '</b></span><span>BEST <b>' + A.getBest('glitch-protocol', 0) + '</b></span><span>NEXT GLITCH <b>' + Math.ceil(gT) + 's</b></span>';
  }

  function draw() {
    ctx.save();
    ctx.fillStyle = '#070a14'; ctx.fillRect(0, 0, W, H);
    if (!p) { ctx.restore(); return; }
    ctx.translate(W / 2, H / 2); ctx.rotate(rot); ctx.translate(-W / 2, -H / 2);
    ctx.strokeStyle = g.id === 'ice' ? 'rgba(160,230,255,.25)' : 'rgba(77,227,255,.07)'; ctx.lineWidth = 1;
    for (let x = -W; x < 2 * W; x += 48) { ctx.beginPath(); ctx.moveTo(x, -H); ctx.lineTo(x, 2 * H); ctx.stroke(); }
    for (let y = -H; y < 2 * H; y += 48) { ctx.beginPath(); ctx.moveTo(-W, y); ctx.lineTo(2 * W, y); ctx.stroke(); }
    ctx.strokeStyle = '#2a4a7a'; ctx.lineWidth = 3; ctx.strokeRect(0, 0, W, H);
    for (const o of orbs) {
      ctx.fillStyle = o.good ? '#4dff9a' : '#ff5470'; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, 7); ctx.fill();
    }
    ctx.shadowBlur = 0;
    const R = rad();
    ctx.globalAlpha = inv > 0 && Math.floor(inv * 10) % 2 ? .35 : 1;
    ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, 7); ctx.fill();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    ctx.restore();
    if (g.id === 'dark' && state === 'play') {
      const gr = ctx.createRadialGradient(p.x, p.y, 40, p.x, p.y, 170);
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.985)');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    }
    if (flashT > 0) { ctx.fillStyle = 'rgba(255,255,255,' + flashT * .5 + ')'; ctx.fillRect(0, 0, W, H); }
    ctx.fillStyle = '#12304a'; ctx.fillRect(0, 0, W, 5);
    ctx.fillStyle = '#ffd04d'; ctx.fillRect(0, 0, W * Math.max(0, gT / 9), 5);
    if (bannerT > 0 && state === 'play') {
      ctx.globalAlpha = Math.min(1, bannerT); ctx.textAlign = 'center';
      ctx.font = 'bold 40px system-ui'; ctx.fillStyle = '#ff7ad9'; ctx.fillText(g.n, W / 2, 70);
      ctx.font = '20px system-ui'; ctx.fillStyle = '#fff'; ctx.fillText(g.d, W / 2, 102);
      ctx.globalAlpha = 1;
    }
  }

  A.loop(dt => { update(dt); draw(); });
  A.overlay(box, '<h2>GLITCH PROTOCOL</h2><p>Collect <b style="color:#4dff9a">green</b> orbs, dodge <b style="color:#ff5470">red</b> orbs.<br>But every 9 seconds the rules mutate: inverted controls, ice, lying colors, darkness, spinning worlds…<br><b>WASD / arrows</b> or hold mouse/finger to move.</p>', [{ label: '▶ START', fn: start }]);
});
