(() => {
  const cv = document.getElementById('game'), ctx = cv.getContext('2d');
  cv.width = 960; cv.height = 640;
  const $ = id => document.getElementById(id);

  const PING_CD = 1100, RING_SPEED = 11, RING_MAX = 8, HEAR = 10, FADE = 2600;
  let level = 1, lives = 3, score = 0, state = 'menu';
  let best = 0;
  try { best = +localStorage.getItem('echovault_best') || 0; } catch (e) {}
  let map, W, H, T, ox, oy, reveal, player, enemies, shards, exit, pings, lastPing, levelStart, pingsUsed, msg = '', msgUntil = 0;
  let held = null, lastMove = 0, audio = null;

  function beep(freq, dur, type = 'sine', vol = 0.12) {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, audio.currentTime);
      o.frequency.exponentialRampToValueAtTime(freq / 2, audio.currentTime + dur);
      g.gain.setValueAtTime(vol, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
      o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + dur);
    } catch (e) {}
  }

  const rnd = n => (Math.random() * n) | 0;
  const now = () => performance.now();

  function gen() {
    const cw = Math.min(5 + level, 13), ch = Math.min(4 + Math.ceil(level * 0.7), 9);
    W = cw * 2 + 1; H = ch * 2 + 1;
    map = Array.from({ length: H }, () => Array(W).fill(1));
    const st = [[1, 1]]; map[1][1] = 0;
    while (st.length) {
      const [x, y] = st[st.length - 1];
      const d = [[2, 0], [-2, 0], [0, 2], [0, -2]].filter(([dx, dy]) => {
        const nx = x + dx, ny = y + dy;
        return nx > 0 && ny > 0 && nx < W - 1 && ny < H - 1 && map[ny][nx] === 1;
      });
      if (!d.length) { st.pop(); continue; }
      const [dx, dy] = d[rnd(d.length)];
      map[y + dy / 2][x + dx / 2] = 0; map[y + dy][x + dx] = 0; st.push([x + dx, y + dy]);
    }
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      if (map[y][x] === 1 && Math.random() < 0.07) {
        const h = map[y][x - 1] === 0 && map[y][x + 1] === 0, v = map[y - 1][x] === 0 && map[y + 1][x] === 0;
        if (h || v) map[y][x] = 0;
      }
    }
    T = Math.floor(Math.min(cv.width / W, cv.height / H));
    ox = Math.floor((cv.width - T * W) / 2); oy = Math.floor((cv.height - T * H) / 2);
    reveal = Array.from({ length: H }, () => Array(W).fill(-1e9));
    player = { x: 1, y: 1 };
    exit = { x: W - 2, y: H - 2 };
    const floors = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
      if (map[y][x] === 0 && !(x === 1 && y === 1) && !(x === exit.x && y === exit.y)) floors.push([x, y]);
    const take = (minDist) => {
      for (let i = 0; i < 200; i++) {
        const k = rnd(floors.length), [x, y] = floors[k];
        if (Math.abs(x - 1) + Math.abs(y - 1) >= minDist) { floors.splice(k, 1); return { x, y }; }
      }
      const [x, y] = floors.splice(rnd(floors.length), 1)[0]; return { x, y };
    };
    shards = []; const ns = 3 + Math.min(level, 6);
    for (let i = 0; i < ns; i++) shards.push(take(4));
    enemies = []; const ne = Math.min(1 + Math.floor(level / 2), 6);
    for (let i = 0; i < ne; i++) {
      const p = take(9);
      enemies.push({ x: p.x, y: p.y, target: null, dir: [1, 0], seen: -1e9, next: 0 });
    }
    pings = []; lastPing = -1e9; pingsUsed = 0; levelStart = now(); held = null;
    updateHud();
  }

  function updateHud() {
    $('hLevel').textContent = level;
    $('hShards').textContent = (shards ? (shards.total || 0) : 0);
    $('hLives').textContent = lives;
    $('hScore').textContent = score;
    $('hBest').textContent = best;
  }
  let shardTotal = 0;
  function hudShards() { $('hShards').textContent = (shardTotal - shards.length) + '/' + shardTotal; }

  function flashMsg(t, ms = 1800) { msg = t; msgUntil = now() + ms; }

  function startLevel() { gen(); shardTotal = shards.length; hudShards(); flashMsg('LEVEL ' + level + ' – find the shards'); }

  function newGame() {
    level = 1; lives = 3; score = 0; state = 'play';
    $('overlay').classList.add('hidden');
    startLevel(); updateHud(); hudShards();
  }

  function doPing() {
    if (state !== 'play') return;
    const t = now();
    if (t - lastPing < PING_CD) return;
    lastPing = t; pingsUsed++;
    pings.push({ x: player.x, y: player.y, t, prev: 0 });
    beep(660, 0.5, 'sine', 0.15);
    for (const e of enemies) {
      const d = Math.hypot(e.x - player.x, e.y - player.y);
      if (d <= HEAR) e.target = { x: player.x, y: player.y };
    }
  }

  function caught() {
    lives--; beep(120, 0.6, 'sawtooth', 0.2);
    if (lives <= 0) {
      state = 'over';
      if (score > best) { best = score; try { localStorage.setItem('echovault_best', best); } catch (e) {} }
      const ov = $('overlay');
      ov.innerHTML = '<h1>CAUGHT</h1><p>You reached level <b>' + level + '</b> with <b>' + score + '</b> points.' + (score >= best ? '<br>🏆 New best score!' : '') + '</p><button id="startBtn" class="big">↻ TRY AGAIN</button>';
      ov.classList.remove('hidden');
      $('startBtn').addEventListener('click', newGame);
    } else {
      player.x = 1; player.y = 1; held = null;
      for (const e of enemies) e.target = null;
      flashMsg('Caught! Lives left: ' + lives, 2000);
    }
    updateHud(); hudShards();
  }

  function tryMove(dx, dy) {
    if (state !== 'play') return;
    const nx = player.x + dx, ny = player.y + dy;
    if (nx < 0 || ny < 0 || nx >= W || ny >= H || map[ny][nx] === 1) return;
    player.x = nx; player.y = ny;
    beep(90, 0.05, 'triangle', 0.03);
    for (let i = shards.length - 1; i >= 0; i--) {
      if (shards[i].x === nx && shards[i].y === ny) {
        shards.splice(i, 1); score += 50; beep(1000, 0.25, 'square', 0.08);
        hudShards(); updateHud();
        if (!shards.length) flashMsg('Exit unlocked!');
      }
    }
    if (nx === exit.x && ny === exit.y) {
      if (shards.length) flashMsg('Collect all shards first');
      else levelDone();
    }
    for (const e of enemies) if (e.x === nx && e.y === ny) { caught(); return; }
  }

  function levelDone() {
    const sec = (now() - levelStart) / 1000;
    const bonus = Math.max(0, Math.round((60 - sec) * 5)) - pingsUsed * 2;
    const gain = 100 * level + Math.max(0, bonus);
    score += gain; level++;
    if (score > best) { best = score; try { localStorage.setItem('echovault_best', best); } catch (e) {} }
    beep(800, 0.4, 'sine', 0.15);
    startLevel(); flashMsg('Level cleared! +' + gain, 2200); updateHud();
  }

  function bfsStep(from, to) {
    const q = [[from.x, from.y]], prev = new Map(); prev.set(from.y * W + from.x, null);
    while (q.length) {
      const [x, y] = q.shift();
      if (x === to.x && y === to.y) break;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = ny * W + nx;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || map[ny][nx] === 1 || prev.has(k)) continue;
        prev.set(k, [x, y]); q.push([nx, ny]);
      }
    }
    let cur = to.y * W + to.x;
    if (!prev.has(cur)) return null;
    let p = prev.get(cur);
    while (p && prev.get(p[1] * W + p[0])) { cur = p[1] * W + p[0]; p = prev.get(cur); }
    return { x: cur % W, y: Math.floor(cur / W) };
  }

  function stepEnemies(t) {
    const interval = Math.max(220, 420 - level * 15);
    for (const e of enemies) {
      if (t < e.next) continue;
      e.next = t + interval;
      if (e.target) {
        if (e.x === e.target.x && e.y === e.target.y) { e.target = null; }
        else { const s = bfsStep(e, e.target); if (s) { e.x = s.x; e.y = s.y; } else e.target = null; }
      } else {
        const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => map[e.y + dy] && map[e.y + dy][e.x + dx] === 0);
        const fwd = opts.find(o => o[0] === e.dir[0] && o[1] === e.dir[1]);
        const back = opts.length > 1 ? opts.filter(o => !(o[0] === -e.dir[0] && o[1] === -e.dir[1])) : opts;
        e.dir = (fwd && Math.random() < 0.7) ? fwd : back[rnd(back.length)];
        if (e.dir) { e.x += e.dir[0]; e.y += e.dir[1]; }
      }
      if (e.x === player.x && e.y === player.y) { caught(); return; }
    }
  }

  function update(t) {
    if (state !== 'play') return;
    if (held && t - lastMove > 125) { lastMove = t; tryMove(held[0], held[1]); }
    // proximity vision
    for (let y = player.y - 1; y <= player.y + 1; y++) for (let x = player.x - 1; x <= player.x + 1; x++)
      if (map[y] && map[y][x] !== undefined) reveal[y][x] = Math.max(reveal[y][x], t - FADE * 0.55);
    // rings
    for (let i = pings.length - 1; i >= 0; i--) {
      const p = pings[i], r = Math.min(RING_MAX, (t - p.t) / 1000 * RING_SPEED);
      for (let y = Math.max(0, Math.floor(p.y - r - 1)); y <= Math.min(H - 1, Math.ceil(p.y + r + 1)); y++)
        for (let x = Math.max(0, Math.floor(p.x - r - 1)); x <= Math.min(W - 1, Math.ceil(p.x + r + 1)); x++) {
          const d = Math.hypot(x - p.x, y - p.y);
          if (d > p.prev && d <= r) reveal[y][x] = t;
        }
      for (const e of enemies) {
        const d = Math.hypot(e.x - p.x, e.y - p.y);
        if (d > p.prev && d <= r) e.seen = t;
      }
      p.prev = r;
      if ((t - p.t) > 1000 * RING_MAX / RING_SPEED + FADE) pings.splice(i, 1);
    }
    for (const e of enemies) if (Math.hypot(e.x - player.x, e.y - player.y) < 2.6) e.seen = t;
    stepEnemies(t);
  }

  function draw(t) {
    ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, cv.width, cv.height);
    if (!map) return;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const a = 1 - (t - reveal[y][x]) / FADE;
      if (a <= 0) continue;
      const px = ox + x * T, py = oy + y * T;
      if (map[y][x] === 1) {
        ctx.fillStyle = 'rgba(77,227,255,' + (a * 0.85).toFixed(3) + ')';
        ctx.fillRect(px + 1, py + 1, T - 2, T - 2);
      } else {
        ctx.fillStyle = 'rgba(77,227,255,' + (a * 0.07).toFixed(3) + ')';
        ctx.fillRect(px, py, T, T);
      }
    }
    const vis = (x, y) => Math.max(0, 1 - (t - reveal[y][x]) / FADE);
    // exit
    const ea = vis(exit.x, exit.y);
    if (ea > 0) {
      ctx.fillStyle = shards.length ? 'rgba(160,160,160,' + ea + ')' : 'rgba(80,255,140,' + ea + ')';
      ctx.fillRect(ox + exit.x * T + 3, oy + exit.y * T + 3, T - 6, T - 6);
    }
    // shards
    for (const s of shards) {
      const a = vis(s.x, s.y); if (a <= 0) continue;
      const cx = ox + s.x * T + T / 2, cy = oy + s.y * T + T / 2, r = T * 0.28 + Math.sin(t / 200) * 1.5;
      ctx.fillStyle = 'rgba(255,208,77,' + a + ')';
      ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r, cy); ctx.lineTo(cx, cy + r); ctx.lineTo(cx - r, cy); ctx.closePath(); ctx.fill();
    }
    // enemies
    for (const e of enemies) {
      const a = Math.max(0, 1 - (t - e.seen) / 1300); if (a <= 0) continue;
      const cx = ox + e.x * T + T / 2, cy = oy + e.y * T + T / 2;
      const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, T * 0.9);
      g.addColorStop(0, 'rgba(255,77,106,' + a + ')'); g.addColorStop(1, 'rgba(255,77,106,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, T * 0.9, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,200,210,' + a + ')'; ctx.beginPath(); ctx.arc(cx, cy, T * 0.22, 0, 7); ctx.fill();
    }
    // rings
    for (const p of pings) {
      const el = t - p.t, r = Math.min(RING_MAX, el / 1000 * RING_SPEED);
      const a = Math.max(0, 1 - el / (1000 * RING_MAX / RING_SPEED + 300));
      ctx.strokeStyle = 'rgba(77,227,255,' + (a * 0.7) + ')'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ox + p.x * T + T / 2, oy + p.y * T + T / 2, r * T, 0, 7); ctx.stroke();
    }
    // player
    if (player) {
      const cx = ox + player.x * T + T / 2, cy = oy + player.y * T + T / 2;
      ctx.shadowColor = '#fff'; ctx.shadowBlur = 14; ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(cx, cy, T * 0.26, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    }
    // ping cooldown bar
    const cd = Math.min(1, (t - lastPing) / PING_CD);
    ctx.fillStyle = '#12304a'; ctx.fillRect(10, cv.height - 14, 120, 6);
    ctx.fillStyle = cd >= 1 ? '#4de3ff' : '#2a6a80'; ctx.fillRect(10, cv.height - 14, 120 * cd, 6);
    // message
    if (t < msgUntil) {
      ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillText(msg, cv.width / 2, 34);
    }
  }

  function loop() {
    const t = now(); update(t); draw(t); requestAnimationFrame(loop);
  }

  const dirs = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const keyMap = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
  window.addEventListener('keydown', e => {
    if (e.key === ' ') { e.preventDefault(); if (!e.repeat) doPing(); return; }
    const k = keyMap[e.key];
    if (k) { e.preventDefault(); if (!held || held !== dirs[k]) { held = dirs[k]; lastMove = 0; } }
  });
  window.addEventListener('keyup', e => { const k = keyMap[e.key]; if (k && held === dirs[k]) held = null; });
  document.querySelectorAll('#pad [data-d]').forEach(b => {
    const d = dirs[b.dataset.d];
    b.addEventListener('pointerdown', e => { e.preventDefault(); held = d; lastMove = 0; });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => { if (held === d) held = null; }));
  });
  $('pingBtn').addEventListener('pointerdown', e => { e.preventDefault(); doPing(); });
  $('startBtn').addEventListener('click', newGame);
  updateHud();
  loop();
})();
