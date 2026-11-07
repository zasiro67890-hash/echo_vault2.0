Arcade.run(function (box, A) {
  const W = 960, H = 480, LANES = [130, 240, 350], BX = 80, EX = 880;
  const UN = {
    imp: { n: 'Imp', e: '👹', c: 2, hp: 34, d: 7, rg: 26, sp: 62, cd: .7 },
    archer: { n: 'Archer', e: '🏹', c: 3, hp: 26, d: 8, rg: 150, sp: 48, cd: 1 },
    golem: { n: 'Golem', e: '🗿', c: 5, hp: 190, d: 15, rg: 30, sp: 30, cd: 1.3 },
    mage: { n: 'Mage', e: '🧙', c: 4, hp: 30, d: 11, rg: 125, sp: 40, cd: 1.5, aoe: 45 },
    dragon: { n: 'Dragon', e: '🐉', c: 8, hp: 130, d: 22, rg: 60, sp: 75, cd: 1, fly: true }
  };
  const ORDER = ['imp', 'archer', 'golem', 'mage', 'dragon'];
  const bar = A.el('div', 'gbar'); box.appendChild(bar);
  const C = A.canvas(box, W, H), ctx = C.ctx, P = C.p;
  const cardsEl = A.el('div', 'cards'); box.appendChild(cardsEl);

  let stage = 1, mana, emana, lane = 1, units, fx, pHp, eHp, eMax, state = 'menu', arm = false, aiT = 0, time = 0;
  const btns = {};
  ORDER.forEach((id, i) => {
    const u = UN[id], b = A.el('button', 'btn', '<span class="e">' + u.e + '</span>' + u.n + '<br>' + u.c + ' mana [' + (i + 1) + ']');
    b.onclick = () => summon(id, 'p'); cardsEl.appendChild(b); btns[id] = b;
  });
  const lb = A.el('button', 'btn', '<span class="e">⚡</span>Lightning<br>3 mana [6]');
  lb.onclick = () => { arm = !arm; lb.classList.toggle('sel', arm); }; cardsEl.appendChild(lb);

  function reset(keepStage) {
    if (!keepStage) stage = 1;
    mana = 5; emana = 3; units = []; fx = []; pHp = 400; eMax = 400 + stage * 70; eHp = eMax; arm = false; aiT = 2; time = 0; lane = 1;
    lb.classList.remove('sel'); state = 'play';
  }
  function summon(id, team, ln) {
    if (state !== 'play') return;
    const u = UN[id], l = ln == null ? lane : ln;
    if (team === 'p') { if (mana < u.c) { A.beep(120, .08, 'square'); return; } mana -= u.c; A.beep(500, .1, 'triangle', .06); }
    else { if (emana < u.c) return false; emana -= u.c; }
    const hpm = team === 'e' ? 1 + stage * .06 : 1;
    units.push({ id, team, lane: l, x: team === 'p' ? BX + 40 : EX - 40, hp: u.hp * hpm, max: u.hp * hpm, t: 0, def: u });
    return true;
  }
  function lightning(x, y) {
    if (mana < 3) return;
    mana -= 3; arm = false; lb.classList.remove('sel');
    fx.push({ k: 'bolt', x, y, life: .3 }); A.beep(900, .25, 'sawtooth', .08);
    units.forEach(u => { if (u.team === 'e' && Math.hypot(u.x - x, LANES[u.lane] - y) < 90) u.hp -= 45; });
  }
  A.onKey(k => {
    if (state !== 'play') return;
    if (k >= '1' && k <= '5') summon(ORDER[+k - 1], 'p');
    if (k === '6') { arm = !arm; lb.classList.toggle('sel', arm); }
    if (k === 'arrowup' || k === 'w') lane = Math.max(0, lane - 1);
    if (k === 'arrowdown' || k === 's') lane = Math.min(2, lane + 1);
  });

  function aiThink() {
    const avail = ORDER.filter(id => UN[id].c <= emana);
    if (!avail.length) return;
    let pool = avail.slice();
    const flyers = units.filter(u => u.team === 'p' && u.def.fly).length;
    if (flyers) pool = pool.concat(pool.filter(id => UN[id].rg >= 60), pool.filter(id => UN[id].rg >= 60));
    if (stage < 3) pool = pool.filter(id => id !== 'dragon');
    if (!pool.length) return;
    const id = A.pick(pool);
    const counts = [0, 1, 2].map(l => units.filter(u => u.team === 'p' && u.lane === l).length);
    const ln = Math.random() < .55 ? counts.indexOf(Math.max.apply(null, counts)) : (Math.random() * 3) | 0;
    summon(id, 'e', ln);
  }

  function update(dt) {
    if (state !== 'play') return;
    time += dt;
    mana = Math.min(10, mana + dt * 1.0);
    emana = Math.min(10, emana + dt * Math.min(2.2, .75 + stage * .12));
    aiT -= dt; if (aiT <= 0) { aiThink(); aiT = Math.max(.7, 2.2 - stage * .12) * A.rand(.6, 1.2); }
    for (const u of units) {
      const d = u.def, dir = u.team === 'p' ? 1 : -1;
      let tgt = null, bd = 1e9;
      for (const o of units) {
        if (o.team === u.team || o.lane !== u.lane) continue;
        if (o.def.fly && d.rg < 60) continue;
        const dist = Math.abs(o.x - u.x);
        if ((o.x - u.x) * dir > -10 && dist <= d.rg + 14 && dist < bd) { bd = dist; tgt = o; }
      }
      u.t -= dt;
      const castleX = u.team === 'p' ? EX : BX;
      if (tgt) {
        if (u.t <= 0) {
          u.t = d.cd; A.beep(250 + Math.random() * 60, .04, 'square', .02);
          if (d.aoe) units.forEach(o => { if (o.team !== u.team && Math.hypot(o.x - tgt.x, LANES[o.lane] - LANES[tgt.lane]) < d.aoe) o.hp -= d.d; });
          else tgt.hp -= d.d;
          if (d.rg > 60) fx.push({ k: 'shot', x1: u.x, y1: LANES[u.lane] + (d.fly ? -20 : 0), x2: tgt.x, y2: LANES[tgt.lane], life: .15 });
          else fx.push({ k: 'hit', x: tgt.x, y: LANES[tgt.lane], life: .15 });
        }
      } else if (Math.abs(castleX - u.x) <= d.rg + 24) {
        if (u.t <= 0) {
          u.t = d.cd; A.beep(180, .05, 'square', .03);
          if (u.team === 'p') eHp -= d.d; else pHp -= d.d;
          fx.push({ k: 'hit', x: castleX, y: LANES[u.lane], life: .15 });
        }
      } else {
        let blocked = false;
        if (!d.fly) for (const o of units) if (o !== u && o.team === u.team && o.lane === u.lane && !o.def.fly && (o.x - u.x) * dir > 0 && Math.abs(o.x - u.x) < 24) { blocked = true; break; }
        if (!blocked) u.x += dir * d.sp * dt;
      }
    }
    units = units.filter(u => u.hp > 0);
    fx.forEach(f => f.life -= dt); fx = fx.filter(f => f.life > 0);
    if (eHp <= 0) {
      state = 'end'; A.beep(880, .5, 'sine', .1);
      const r = A.best('summon-siege', stage);
      A.overlay(box, '<h2>STAGE ' + stage + ' CLEARED</h2><p>The enemy castle crumbles!</p><p>Best stage: <b>' + r.best + '</b></p>', [{ label: 'NEXT STAGE ▶', fn: () => { stage++; reset(true); } }]);
    } else if (pHp <= 0) {
      state = 'end';
      const r = A.best('summon-siege', stage - 1);
      A.overlay(box, '<h2>CASTLE DESTROYED</h2><p>You fell on stage <b>' + stage + '</b>.</p><p>Best stage cleared: <b>' + Math.max(r.best, 0) + '</b></p>', [{ label: '↻ TRY AGAIN', fn: () => reset(false) }]);
    }
    bar.innerHTML = '<span>STAGE <b>' + stage + '</b></span><span>MANA <b>' + mana.toFixed(1) + '</b>/10</span><span>LANE <b>' + (lane + 1) + '</b></span><span>YOUR CASTLE <b>' + Math.max(0, Math.ceil(pHp)) + '</b></span><span>ENEMY CASTLE <b>' + Math.max(0, Math.ceil(eHp)) + '</b></span>';
    ORDER.forEach(id => { btns[id].disabled = mana < UN[id].c; });
    lb.disabled = mana < 3;
  }

  function draw() {
    ctx.fillStyle = '#0a1224'; ctx.fillRect(0, 0, W, H);
    LANES.forEach((y, i) => {
      ctx.fillStyle = i === lane ? 'rgba(255,208,77,.10)' : 'rgba(77,227,255,.04)';
      ctx.fillRect(0, y - 38, W, 76);
      ctx.strokeStyle = i === lane ? 'rgba(255,208,77,.5)' : 'rgba(77,227,255,.15)'; ctx.strokeRect(0, y - 38, W, 76);
    });
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const castle = (x, hp, mx, col, em) => {
      ctx.fillStyle = col; ctx.fillRect(x - 28, 60, 56, 360);
      ctx.font = '40px serif'; ctx.fillText(em, x, 90);
      ctx.fillStyle = '#222'; ctx.fillRect(x - 34, 44, 68, 8);
      ctx.fillStyle = '#4dff9a'; ctx.fillRect(x - 34, 44, 68 * Math.max(0, hp / mx), 8);
    };
    castle(BX - 40, pHp, 400, 'rgba(77,163,255,.35)', '🏰'); castle(EX + 40, eHp, eMax, 'rgba(255,84,112,.35)', '🏯');
    if (!units) return;
    ctx.font = '30px serif';
    for (const u of units) {
      const y = LANES[u.lane] + (u.def.fly ? -22 : 0);
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(u.x, LANES[u.lane] + 18, 15, 5, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = u.team === 'p' ? '#4da3ff' : '#ff5470'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(u.x, y, 19, 0, 7); ctx.stroke();
      ctx.save(); ctx.translate(u.x, y); if (u.team === 'e') ctx.scale(-1, 1); ctx.fillText(u.def.e, 0, 2); ctx.restore();
      ctx.fillStyle = '#222'; ctx.fillRect(u.x - 16, y - 30, 32, 4);
      ctx.fillStyle = u.team === 'p' ? '#4dff9a' : '#ff5470'; ctx.fillRect(u.x - 16, y - 30, 32 * Math.max(0, u.hp / u.max), 4);
    }
    for (const f of fx) {
      if (f.k === 'shot') { ctx.strokeStyle = '#ffd04d'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(f.x1, f.y1); ctx.lineTo(f.x2, f.y2); ctx.stroke(); }
      else if (f.k === 'hit') { ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(f.x, f.y, 10, 0, 7); ctx.fill(); }
      else if (f.k === 'bolt') { ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(f.x, 0); ctx.lineTo(f.x - 10, f.y / 2); ctx.lineTo(f.x + 8, f.y / 2 + 6); ctx.lineTo(f.x, f.y); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,150,.35)'; ctx.beginPath(); ctx.arc(f.x, f.y, 90, 0, 7); ctx.fill(); }
    }
    if (arm) { ctx.font = 'bold 16px system-ui'; ctx.fillStyle = '#ffd04d'; ctx.fillText('LIGHTNING ARMED – click the battlefield', W / 2, 20); }
  }

  A.loop(dt => {
    if (P.clicked) {
      P.clicked = false;
      if (state === 'play') {
        if (arm) lightning(P.x, P.y);
        else { let bi = 0, bd = 1e9; LANES.forEach((y, i) => { const d = Math.abs(P.y - y); if (d < bd) { bd = d; bi = i; } }); lane = bi; }
      }
    }
    update(dt); draw();
  });
  A.overlay(box, '<h2>SUMMON SIEGE</h2><p>Spend mana to summon monsters into three lanes and destroy the enemy castle.<br>Click a lane to pick it, click a card (or press 1-5) to summon.<br>⚡ Lightning: arm it, then click anywhere.<br><b>Melee units cannot hit Dragons.</b></p>', [{ label: '▶ START', fn: () => reset(false) }]);
});
