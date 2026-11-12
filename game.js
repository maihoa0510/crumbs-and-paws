// Crumbs & Paws — a cozy idle bakery. Plain JS, no build step.
(() => {
  'use strict';
  const { animal, pastry, icon, scene, sparkle } = window.ART;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const SAVE_KEY = 'crumbs-paws-save-v1';

  // ---------- Data ----------
  const PASTRIES = {
    cookie:    { name: 'Cookie',      price: 8,  t: 2, lv: 1 },
    waffle:    { name: 'Waffle',      price: 12, t: 3, lv: 1 },
    tart:      { name: 'Berry Tart',  price: 20, t: 4, lv: 2 },
    chocobun:  { name: 'Choco Bun',   price: 16, t: 4, lv: 3 },
    croissant: { name: 'Croissant',   price: 24, t: 5, lv: 4 },
    donut:     { name: 'Donut',       price: 30, t: 5, lv: 5 },
    bread:     { name: 'Bread',       price: 36, t: 6, lv: 6 },
    cake:      { name: 'Cake',        price: 50, t: 8, lv: 7 },
  };
  const GUESTS = [
    { sp: 'Bunny', name: 'Mochi', fav: 'croissant', lv: 1, bio: 'Hops in every morning. Tips extra for anything flaky.' },
    { sp: 'Pig', name: 'Truffle', fav: 'cake', lv: 1, bio: 'Has never once said no to a second slice.' },
    { sp: 'Bear', name: 'Hazel', fav: 'bread', lv: 1, bio: 'Buys loaves for the whole forest.' },
    { sp: 'Cat', name: 'Pumpkin', fav: 'donut', lv: 2, bio: 'Naps by the window after every donut.' },
    { sp: 'Sheep', name: 'Cloud', fav: 'cookie', lv: 3, bio: 'Dunks cookies in warm milk. Very patient.' },
    { sp: 'Giraffe', name: 'Stretch', fav: 'waffle', lv: 4, bio: 'Can spot a fresh waffle from three streets away.' },
    { sp: 'Dog', name: 'Biscuit', fav: 'chocobun', lv: 5, bio: 'Wags so hard the shelves rattle.' },
    { sp: 'Red Panda', name: 'Maple', fav: 'tart', lv: 6, bio: 'Loves berry tarts. Pays double when served fast.' },
  ];
  const SPIN = [
    { c: '#FFDB73', ic: 'coin', label: '500', give: s => (s.coins += 500), w: 22 },
    { c: '#FFF7E8', ic: 'gem', label: '5', give: s => (s.gems += 5), w: 16 },
    { c: '#9ADBA6', ic: 'coin', label: '2k', give: s => (s.coins += 2000), w: 12 },
    { c: '#FFB2BF', ic: 'ticket', label: '2', give: s => (s.tickets += 2), w: 14 },
    { c: '#FFDB73', ic: 'gem', label: '20', give: s => (s.gems += 20), w: 7 },
    { c: '#FFF7E8', ic: 'coin', label: '1k', give: s => (s.coins += 1000), w: 18 },
    { c: '#9DD2F4', ic: 'gift', label: 'Box', give: s => { s.coins += 1500; s.gems += 10; s.tickets += 1; }, w: 8 },
    { c: '#FFB2BF', ic: 'gem', label: '50', give: s => (s.gems += 50), w: 3 },
  ];
  const DAILY = [['coin', 500], ['gem', 10], ['coin', 1000], ['ticket', 3], ['coin', 2000], ['gem', 30], ['gift', 'Big Box']];
  const MILESTONES = [
    { n: 10, ic: 'coin', label: '2,000 coins', give: s => (s.coins += 2000) },
    { n: 25, ic: 'gem', label: '30 gems', give: s => (s.gems += 30) },
    { n: 50, ic: 'ticket', label: '5 tickets', give: s => (s.tickets += 5) },
    { n: 80, ic: 'coin', label: '15,000 coins', give: s => (s.coins += 15000) },
    { n: 120, ic: 'gem', label: '150 gems', give: s => (s.gems += 150) },
  ];
  const SLOTS_X = [104, 172, 240, 308];
  const TABLE_POS = [[150, 400], [40, 530], [150, 540]];
  const DAY = 86400000;

  // ---------- State ----------
  const fresh = () => ({
    coins: 300, gems: 60, tickets: 3, xp: 0, level: 1, ovenLv: 1, tables: 0,
    shelves: [{ k: 'waffle', n: 6 }, { k: 'cookie', n: 6 }, { k: 'waffle', n: 0 }, { k: 'cookie', n: 0 }, { k: 'cookie', n: 0 }],
    visits: {}, seen: {}, daily: { streak: 0, last: null }, giftAt: 0,
    spins: { day: null, used: 0 }, stamps: 0, claimed: [], eventEnd: Date.now() + 3.6 * DAY,
    boostUntil: 0, boostReadyAt: 0, freeGemAt: 0, lastSeen: Date.now(),
    settings: { sound: true, vibrate: true, notify: false },
  });
  let S;
  try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(SAVE_KEY) || 'null') || {}); } catch { S = fresh(); }
  const save = () => { S.lastSeen = Date.now(); try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch {} };

  // ---------- Derived ----------
  const today = () => new Date().toDateString();
  const xpNeed = lv => Math.round(18 * Math.pow(lv, 1.35));
  const unlocked = () => Object.keys(PASTRIES).filter(k => PASTRIES[k].lv <= S.level);
  const guestPool = () => GUESTS.filter(g => g.lv <= S.level);
  const boosted = () => Date.now() < S.boostUntil;
  const speed = () => (boosted() ? 2 : 1);
  const batch = () => 3 + S.ovenLv;
  const shelfCap = () => 10 + S.ovenLv * 2;
  const bakeTime = k => PASTRIES[k].t * Math.pow(0.9, S.ovenLv - 1);
  const priceOf = k => Math.round(PASTRIES[k].price * (1 + 0.08 * (S.ovenLv - 1)) * (1 + 0.15 * S.tables));
  const upgradeCost = () => Math.round(150 * Math.pow(1.65, S.ovenLv - 1));
  const tableCost = () => [50, 120, 250][S.tables];
  const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M' : n >= 1e4 ? (n / 1e3).toFixed(2).replace(/\.?0+$/, '') + 'k' : Math.floor(n).toLocaleString('en-US');
  const dur = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
    return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}:${String(x).padStart(2, '0')}`; };
  const spinsLeft = () => { if (S.spins.day !== today()) { S.spins = { day: today(), used: 0 }; } return Math.max(0, 3 - S.spins.used); };
  const dailyReady = () => S.daily.last !== today();

  // ---------- Sound ----------
  let actx, gestured = false;
  addEventListener('pointerdown', () => { gestured = true; }, { once: true, capture: true });
  const beep = (f = 660, d = .08, type = 'sine', vol = .06) => {
    if (!S.settings.sound || !gestured) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = f; g.gain.value = vol; o.connect(g); g.connect(actx.destination);
      const t = actx.currentTime; g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.start(t); o.stop(t + d);
    } catch {}
  };
  const chime = () => { beep(880, .09); setTimeout(() => beep(1320, .12), 70); };
  const buzz = ms => { if (S.settings.vibrate && navigator.vibrate) navigator.vibrate(ms); };

  // ---------- Layout scaling ----------
  const fit = () => {
    const sc = Math.min(innerWidth / 390, innerHeight / 844);
    $('#stage').style.transform = `translate(-50%, -50%) scale(${sc})`;
  };
  addEventListener('resize', fit); fit();

  // ---------- Static art ----------
  $$('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
  $('#splashWin').innerHTML = ['croissant', 'cake', 'donut'].map(pastry).join('');
  $('#splashChars').innerHTML = animal('Red Panda') + animal('Bunny');
  $('#cashier').innerHTML = animal('Red Panda');
  $('#sceneMain').innerHTML = scene(false);
  $('#avatar').innerHTML = animal('Bear');
  $('#ctrItem1').innerHTML = pastry('croissant');
  $('#ctrPlate').innerHTML = pastry('cake');
  $$('[data-spark]').forEach(el => { el.innerHTML = sparkle('#FFD45E'); });

  const toast = msg => { const t = $('#toast'); t.hidden = true; void t.offsetWidth; t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 2400); };
  const floatAt = (x, y, html) => {
    const f = document.createElement('div'); f.className = 'float'; f.style.left = x + 'px'; f.style.top = y + 'px'; f.innerHTML = html;
    $('#fx').appendChild(f); setTimeout(() => f.remove(), 1150);
  };

  // ---------- Shelves ----------
  const shelvesEl = $('#shelves');
  const renderShelves = () => {
    shelvesEl.innerHTML = S.shelves.map((s, i) => {
      const shown = Math.min(3, s.n);
      const trays = [0, 1, 2].map(j => pastry(s.k).replace('class="pastry"', `class="pastry${j < shown ? '' : ' gone'}"`)).join('');
      return `<button class="shelf${s.n ? '' : ' empty'}" data-shelf="${i}" aria-label="Shelf ${i + 1}: ${PASTRIES[s.k].name}"><div class="tray">${trays}</div><span class="count">${s.n}</span></button>`;
    }).join('');
  };
  const updateShelf = i => {
    const el = shelvesEl.children[i]; if (!el) return; const s = S.shelves[i];
    el.classList.toggle('empty', !s.n); el.querySelector('.count').textContent = s.n;
    $$('.pastry', el).forEach((p, j) => p.classList.toggle('gone', j >= Math.min(3, s.n)));
  };
  shelvesEl.addEventListener('click', e => { const b = e.target.closest('[data-shelf]'); if (b) openModal('picker', +b.dataset.shelf); });

  // ---------- Tables ----------
  const renderTables = () => {
    $('#tables').innerHTML = TABLE_POS.slice(0, S.tables).map(([x, y], i) => {
      const g = guestPool()[(i * 3 + 1) % guestPool().length];
      const k = unlocked()[i % unlocked().length];
      return `<div class="table" style="left:${x}px;top:${y}px">${animal(g.sp)}<div class="top"></div>${pastry(k)}</div>`;
    }).join('');
    const full = S.tables >= TABLE_POS.length;
    $('#expandBtn').classList.toggle('full', full);
    $('#expandCost').textContent = full ? 'Max' : tableCost();
  };

  // ---------- Oven ----------
  let bake = null; // { k, shelf, t, dur }
  const pickBake = () => {
    let best = -1, low = Infinity;
    S.shelves.forEach((s, i) => { if (s.n < shelfCap() && s.n < low) { low = s.n; best = i; } });
    if (best < 0) return null;
    const k = S.shelves[best].k; return { k, shelf: best, t: 0, dur: bakeTime(k) };
  };
  const renderBakeHead = () => {
    const k = bake ? bake.k : S.shelves[0].k;
    $('#bakeIcon').innerHTML = pastry(k);
    $('#ovenItem').innerHTML = bake ? pastry(k) : '';
    $('#bakeLabel').textContent = bake ? `${PASTRIES[k].name} · ${bake.dur.toFixed(1)}s` : 'Shelves full';
    $('#bakeBatch').textContent = '×' + batch();
    $('#oven').classList.toggle('baking', !!bake);
    $('#ovenLv').textContent = 'Lv ' + S.ovenLv;
  };

  // ---------- Customers ----------
  const custEl = $('#customers');
  let customers = []; let spawnT = 1.2; let serveT = 0; let uid = 0;
  const RING = 2 * Math.PI * 27;
  const spawn = () => {
    const pool = guestPool(); const g = pool[Math.floor(Math.random() * pool.length)];
    const stocked = [...new Set(S.shelves.map(s => s.k))];
    const opts = Math.random() < .85 ? stocked : unlocked();
    const wish = Math.random() < .3 && unlocked().includes(g.fav) ? g.fav : opts[Math.floor(Math.random() * opts.length)];
    const star = Math.random() < .2;
    const patience = (22 + Math.random() * 10) * (g.sp === 'Sheep' ? 1.4 : 1);
    const c = { id: ++uid, g, wish, star, patience, max: patience, slot: customers.length, state: 'walk', el: document.createElement('div') };
    c.el.className = 'cust walking'; c.el.style.left = '420px';
    c.el.innerHTML = `<div class="wish${star ? ' star' : ''}"><svg class="ring" viewBox="0 0 62 60"><circle cx="31" cy="30" r="27" stroke-dasharray="${RING}" stroke-dashoffset="0"/></svg>${pastry(wish)}${star ? `<span class="flag">${icon('star')}</span>` : ''}</div>${animal(g.sp)}`;
    custEl.appendChild(c.el); customers.push(c);
    requestAnimationFrame(() => requestAnimationFrame(() => { c.el.style.left = SLOTS_X[c.slot] + 'px'; }));
    setTimeout(() => { if (c.state === 'walk') { c.state = 'wait'; c.el.classList.remove('walking'); } }, 1150);
    if (!S.seen[g.sp]) { S.seen[g.sp] = true; $('#guestBadge').hidden = false; toast(`New guest: ${g.name} the ${g.sp}!`); }
  };
  const leave = (c, happy) => {
    c.state = 'leave'; c.el.classList.add(happy ? 'happy' : 'sad');
    setTimeout(() => { c.el.classList.add('walking'); c.el.style.left = '-90px'; }, happy ? 420 : 0);
    setTimeout(() => c.el.remove(), 1700);
    customers = customers.filter(x => x !== c);
    customers.forEach((x, i) => { if (x.slot !== i) { x.slot = i; x.el.style.left = SLOTS_X[i] + 'px'; } });
  };
  const serve = c => {
    const i = S.shelves.findIndex(s => s.k === c.wish && s.n > 0); if (i < 0) return false;
    S.shelves[i].n--; updateShelf(i);
    const fast = c.g.sp === 'Red Panda' && c.patience > c.max * .7;
    const earn = priceOf(c.wish) * (c.star ? 2 : 1) * (fast ? 2 : 1) * (c.wish === c.g.fav ? 1.25 : 1);
    S.coins += Math.round(earn); addXp(c.star ? 2 : 1);
    S.visits[c.g.sp] = (S.visits[c.g.sp] || 0) + 1;
    if (c.wish === 'tart' && Date.now() < S.eventEnd) S.stamps++;
    const x = SLOTS_X[c.slot] + 14;
    floatAt(x, 230, `${icon('coin').replace('<svg', '<svg class="ico"')}+${Math.round(earn)}`);
    beep(990, .07, 'triangle'); setTimeout(() => beep(1480, .09, 'triangle'), 60);
    c.el.classList.add('serving'); leave(c, true);
    return true;
  };

  // ---------- XP / Level ----------
  const addXp = n => {
    S.xp += n;
    while (S.xp >= xpNeed(S.level)) {
      S.xp -= xpNeed(S.level); S.level++;
      const reward = 400 * S.level; S.coins += reward;
      const newP = Object.keys(PASTRIES).filter(k => PASTRIES[k].lv === S.level);
      const newG = GUESTS.filter(g => g.lv === S.level);
      queueModal(['levelup', { lv: S.level, reward, newP, newG }]); chime(); buzz(60);
      renderTables();
    }
  };

  // ---------- HUD ----------
  const hud = () => {
    $('#coinTxt').textContent = fmt(S.coins); $('#gemTxt').textContent = fmt(S.gems); $('#ticketTxt').textContent = fmt(S.tickets);
    $('#lvNum').textContent = S.level; $('#xpFill').style.width = Math.min(100, S.xp / xpNeed(S.level) * 100) + '%';
    $('#dailyBadge').hidden = !dailyReady();
    $('#spinBadge').hidden = !spinsLeft(); $('#spinBadge').textContent = spinsLeft();
    const gl = S.giftAt - Date.now(); $('#giftTimer').textContent = gl > 0 ? dur(gl) : ''; $('#giftBtn').classList.toggle('ready', gl <= 0);
    const sb = $('#speedBtn'), now = Date.now();
    sb.classList.toggle('on', boosted()); sb.classList.toggle('cool', !boosted() && now < S.boostReadyAt);
    $('#speedLabel').textContent = boosted() ? `×2 ${dur(S.boostUntil - now)}` : now < S.boostReadyAt ? dur(S.boostReadyAt - now) : 'Speed Up';
    $('#bakePill').classList.toggle('boost', boosted());
    const left = S.eventEnd - now; $('#evTimer').textContent = left > 0 ? (left > DAY ? Math.floor(left / DAY) + 'd left' : dur(left)) : 'ended';
  };

  // ---------- Loop ----------
  let last = performance.now(), saveT = 0, hudT = 0, running = false;
  const tick = now => {
    const dt = Math.min(.1, (now - last) / 1000) * speed(); last = now;
    if (running) {
      // oven
      if (!bake) { bake = pickBake(); if (bake || !tick.idle) renderBakeHead(); tick.idle = !bake; }
      if (bake) {
        bake.t += dt; $('#bakeFill').style.width = Math.min(100, bake.t / bake.dur * 100) + '%';
        if (bake.t >= bake.dur) {
          const s = S.shelves[bake.shelf];
          if (s.k === bake.k) { s.n = Math.min(shelfCap(), s.n + batch()); updateShelf(bake.shelf); shelvesEl.children[bake.shelf]?.classList.remove('flash'); void shelvesEl.offsetWidth; shelvesEl.children[bake.shelf]?.classList.add('flash'); }
          bake = null;
        }
      } else $('#bakeFill').style.width = '100%';
      // customers
      spawnT -= dt;
      if (spawnT <= 0 && customers.length < 4) { spawn(); spawnT = Math.max(0.9, 1.7 - S.level * .06 - S.tables * .15) * (0.7 + Math.random() * .6); }
      for (const c of [...customers]) {
        if (c.state !== 'wait') continue;
        c.patience -= dt / speed();
        const pct = Math.max(0, c.patience / c.max);
        const w = c.el.querySelector('.wish'); w.classList.toggle('low', pct < .3);
        w.querySelector('circle').style.strokeDashoffset = RING * (1 - pct);
        if (c.patience <= 0) { leave(c, false); beep(220, .15, 'sine', .04); }
      }
      serveT += dt;
      if (serveT >= 2.4) { serveT = 0; for (const c of customers) { if (c.state === 'wait' && serve(c)) break; } }
    }
    hudT += dt; if (hudT > .25) { hudT = 0; hud(); }
    saveT += dt; if (saveT > 5) { saveT = 0; save(); }
  };

  // ---------- Modals ----------
  const modal = $('#modal'); let current = null; const queue = [];
  const queueModal = m => { if (!current) openModal(...m); else queue.push(m); };
  const closeModal = () => { modal.hidden = true; modal.className = ''; modal.innerHTML = ''; current = null; save(); if (queue.length) openModal(...queue.shift()); };
  const head = (title, color, fs) => fs
    ? `${scene(true)}<div class="fs-head"><div class="wallet">${['gem', 'coin', 'ticket'].map(k => `<span class="pill"><span class="ico">${icon(k)}</span><b data-w="${k}">${fmt(k === 'gem' ? S.gems : k === 'coin' ? S.coins : S.tickets)}</b><span class="plus">+</span></span>`).join('')}</div>
       <button class="backbtn" data-close aria-label="Back"><span class="ico">${icon('arrowL')}</span></button><div class="fs-title" style="--rb:${color}">${title}</div></div>`
    : `<div class="ribbon" style="--rb:${color}">${title}</div><button class="xbtn" data-close aria-label="Close"><span class="ico">${icon('close')}</span></button>`;
  const ic = (k, cls = '') => `<span class="ico ${cls}">${icon(k)}</span>`;

  const VIEWS = {
    upgrade() {
      const nb = 3 + S.ovenLv + 1, cost = upgradeCost(), cur = S.shelves[0].k;
      const rows = [['Bake time', bakeTime(cur).toFixed(1) + 's', (bakeTime(cur) * .9).toFixed(1) + 's'], ['Batch size', '×' + batch(), '×' + nb], ['Shelf capacity', shelfCap(), shelfCap() + 2], [`${PASTRIES[cur].name} price`, priceOf(cur), Math.round(PASTRIES[cur].price * (1 + .08 * S.ovenLv) * (1 + .15 * S.tables))]];
      return `<div class="popup">${head('Oven Upgrade', 'var(--butter)')}
        <div class="hero"><span class="pilltag">Lv ${S.ovenLv} → ${S.ovenLv + 1}</span><div class="ovenart"><i class="k1"></i><i class="k2"></i><span class="w">${pastry(cur)}</span></div></div>
        <div class="stack">${rows.map(([k, a, b]) => `<div class="row"><span class="grow">${k}</span><span class="num">${a} →&nbsp;</span><span class="num good">${b}</span></div>`).join('')}</div>
        <button class="btn" style="margin-top:16px" data-act="upgrade" ${S.coins < cost ? 'disabled' : ''}>${ic('coin')} Upgrade · ${fmt(cost)}</button></div>`;
    },
    picker(i) {
      const s = S.shelves[i];
      return `<div class="popup">${head('Shelf ' + (i + 1), 'var(--sky)')}<p class="sub">Choose what this shelf displays. Switching clears its stock.</p>
        <div class="picker">${Object.keys(PASTRIES).map(k => { const ok = PASTRIES[k].lv <= S.level;
          return `<button class="card${k === s.k ? ' on' : ''}${ok ? '' : ' locked'}" ${ok ? `data-act="pick" data-k="${k}" data-i="${i}"` : 'disabled'}>${ok ? pastry(k) : ic('lock')}<span class="label">${ok ? PASTRIES[k].name : 'Lv ' + PASTRIES[k].lv}</span>${ok ? `<span class="num" style="font-size:13px">${priceOf(k)}</span>` : ''}</button>`; }).join('')}</div></div>`;
    },
    daily() {
      const ready = dailyReady(); const day = ready ? (S.daily.streak % 7) + 1 : ((S.daily.streak - 1) % 7) + 1;
      const tile = (d, [k, v]) => { const claimed = ready ? d < day : d <= day, now = ready && d === day;
        return d === 7 ? `<div class="day7${now ? ' today' : ''}${claimed ? ' claimed' : ''}">${ic('gift')}<div><div class="num" style="font-size:18px">Day 7 · Big Box</div><small>3,000 coins + 50 gems + 5 tickets</small></div></div>`
          : `<div class="day${claimed ? ' claimed' : ''}${now ? ' today' : ''}"><small>Day ${d}</small>${ic(k)}<span class="num">×${fmt(v)}</span>${claimed ? `<span class="chk">${icon('check')}</span>` : ''}</div>`; };
      return `<div class="popup" style="width:350px">${head('Daily Treats', 'var(--mint)')}<p class="sub">Log in every day for a bigger prize!</p>
        <div class="days">${DAILY.map((r, i) => tile(i + 1, r)).join('')}</div>
        <button class="btn" style="margin-top:16px" data-act="daily" ${ready ? '' : 'disabled'}>${ready ? 'Claim Day ' + day : 'Come back tomorrow'}</button></div>`;
    },
    levelup({ lv, reward, newP, newG }) {
      const items = [...newP.map(k => `<div class="card">${pastry(k)}<span class="label">${PASTRIES[k].name}</span></div>`),
        ...newG.map(g => `<div class="card">${animal(g.sp)}<span class="label">${g.name}</span></div>`),
        `<div class="card">${ic('coin')}<span class="label">+${fmt(reward)}</span></div>`];
      return `<div class="popup" style="width:320px">${head('Level Up!', 'var(--butter)').replace(/<button class="xbtn"[\s\S]*<\/button>/, '')}
        <div class="lvbig">${lv}</div><p class="sub" style="margin:12px 0">Your bakery is getting famous!</p>
        <div class="h3" style="margin-top:0">Unlocked</div><div class="unlocks">${items.join('')}</div>
        <button class="btn" style="margin-top:16px" data-close>Collect</button>
        <button class="linkbtn" data-act="double" data-v="${reward}">Watch ad to double coins</button></div>`;
    },
    settings() {
      const t = (k, l, i) => `<div class="row">${ic(i)}<span class="grow">${l}</span><button class="toggle${S.settings[k] ? ' on' : ''}" data-act="toggle" data-k="${k}" aria-label="${l}"></button></div>`;
      return `<div class="popup">${head('Settings', 'var(--card)')}<div class="stack">${t('sound', 'Sound effects', 'sound')}${t('vibrate', 'Vibration', 'heart')}${t('notify', 'Notifications', 'clock')}
        <div class="row">${ic('book')}<span class="grow">Language</span><span class="num muted">English</span></div></div>
        <div style="display:flex;gap:10px;margin-top:16px"><button class="btn m white" data-act="howto">How to play</button><button class="btn m pink" data-act="reset">Reset progress</button></div>
        <p class="sub" style="margin:14px 0 0;font-size:11px">Saved locally in this browser · v1.0.0</p></div>`;
    },
    confirmReset() {
      return `<div class="popup">${head('Reset?', 'var(--pink)')}<p class="sub">This erases your bakery, coins and guests in this browser. It can't be undone.</p>
        <div style="display:flex;gap:10px"><button class="btn m white" data-open="settings">Cancel</button><button class="btn m pink" data-act="doReset">Reset</button></div></div>`;
    },
    howto() {
      const li = (i, t) => `<div class="row">${ic(i)}<span class="grow" style="font-size:13px">${t}</span></div>`;
      return `<div class="popup">${head('How to play', 'var(--sky)')}<div class="stack">
        ${li('clock', 'The oven bakes automatically and fills the emptiest shelf.')}${li('heart', 'Guests buy what is in their bubble. Serve them before the ring runs out!')}
        ${li('star', 'Star bubbles pay ×2. Favourite treats pay +25%.')}${li('coin', 'Tap the oven to upgrade it. Tap a shelf to change what it sells.')}
        ${li('gem', 'Spend gems on new tables: more guests and +15% prices.')}</div><button class="btn" style="margin-top:16px" data-close>Let’s bake!</button></div>`;
    },
    offline({ coins, mins }) {
      return `<div class="popup">${head('Welcome back!', 'var(--mint)')}<p class="sub">Your staff kept baking for ${mins} min while you were away.</p>
        <div class="row" style="justify-content:center;gap:8px;margin-bottom:16px">${ic('coin', 'lg')}<span class="num" style="font-size:26px">+${fmt(coins)}</span></div>
        <button class="btn" data-act="offline" data-v="${coins}">Collect</button><button class="linkbtn" data-act="offline2" data-v="${coins}">Watch ad to collect ×2</button></div>`;
    },
    shop(tab = 'Packs') {
      const tabs = ['Packs', 'Gems', 'Coins'];
      let body = '';
      if (tab === 'Packs') {
        body = `<div class="offer"><span class="tag">-80%</span><h4>Starter Bakery Pack</h4><ul><li>${ic('gem')}300 gems</li><li>${ic('coin')}20k coins</li><li>${ic('ticket')}10 tickets</li></ul>
          <button class="btn m yellow" data-act="buy" data-pack="starter">$1.99</button>${animal('Cat')}</div>
          <div class="h3">Daily deals</div><div class="grid3">
          ${[['ticket', 3, 20, 'gem'], ['coin', 5000, 30, 'gem'], ['gem', 5, 0, 'ad']].map(([k, n, p, cur]) => `<div class="card"><span class="label">${cur === 'ad' ? 'Free' : 'Deal'}</span><div class="gems">${ic(k, 'lg')}</div><span class="amt">${fmt(n)}</span>
            ${cur === 'ad' ? `<button class="btn m yellow" data-act="freegem" ${Date.now() < S.freeGemAt ? 'disabled' : ''}>${Date.now() < S.freeGemAt ? dur(S.freeGemAt - Date.now()) : 'Watch ad'}</button>` : `<button class="btn m" data-act="swap" data-k="${k}" data-n="${n}" data-p="${p}" ${S.gems < p ? 'disabled' : ''}>${ic('gem')}${p}</button>`}</div>`).join('')}</div>`;
      } else if (tab === 'Gems') {
        body = `<div class="grid3">${[['Handful', 80, '$0.99', 1], ['Pouch', 500, '$4.99', 2, 'Popular'], ['Jar', 1200, '$9.99', 3], ['Basket', 2600, '$19.99', 4], ['Crate', 7000, '$49.99', 5, 'Best value'], ['Sack', 16000, '$99.99', 5]]
          .map(([n, a, p, k, f]) => `<div class="card">${f ? `<span class="flag">${f}</span>` : ''}<span class="label">${n}</span><div class="gems">${ic('gem').repeat(Math.min(k, 4))}</div><span class="amt">${fmt(a)}</span><button class="btn m" data-act="buy" data-gems="${a}" data-price="${p}">${p}</button></div>`).join('')}</div>
          <p class="sub" style="margin-top:16px;font-size:12px">Demo build — no real payments. Purchases are simulated.</p>`;
      } else {
        body = `<div class="grid3">${[[2000, 10], [12000, 50], [30000, 110], [80000, 260], [200000, 600], [600000, 1500]].map(([c, g], i) =>
          `<div class="card">${i === 2 ? '<span class="flag">Popular</span>' : ''}<span class="label">${['Pile', 'Sack', 'Chest', 'Vault', 'Bank', 'Mint'][i]}</span><div class="gems">${ic('coin').repeat(Math.min(i + 1, 4))}</div><span class="amt">${fmt(c)}</span><button class="btn m" data-act="swap" data-k="coin" data-n="${c}" data-p="${g}" ${S.gems < g ? 'disabled' : ''}>${ic('gem')}${g}</button></div>`).join('')}</div>`;
      }
      return `<div class="fs">${head('Shop', 'var(--red)', true)}<div class="fs-body"><div class="tabs">${tabs.map(t => `<button class="${t === tab ? 'on' : ''}" data-open="shop:${t}">${t}</button>`).join('')}</div>${body}</div></div>`;
    },
    guests(sel) {
      $('#guestBadge').hidden = true;
      const met = GUESTS.filter(g => S.seen[g.sp]); const pick = GUESTS.find(g => g.sp === sel) || met[0];
      const hearts = g => Math.min(5, Math.floor((S.visits[g.sp] || 0) / 4));
      const cards = GUESTS.map(g => S.seen[g.sp]
        ? `<button class="card guest${pick === g ? ' sel' : ''}" data-open="guests:${g.sp}">${pastry(g.fav).replace('class="pastry"', 'class="pastry fav"')}${animal(g.sp)}<span class="name">${g.name}</span><span class="hearts">${[0, 1, 2, 3, 4].map(i => `<span class="ico${i < hearts(g) ? '' : ' off'}">${icon('heart')}</span>`).join('')}</span></button>`
        : `<div class="card guest locked"><div class="ph">${ic('lock')}</div><span class="name muted">${g.lv > S.level ? 'Lv ' + g.lv : '???'}</span></div>`).join('');
      return `<div class="fs">${head('Guest Book', 'var(--sky)', true)}<div class="fs-body">
        <div class="panel">${ic('book', 'xl')}<div class="grow" style="flex:1"><div class="num" style="margin-bottom:6px">Guests met <span class="good">${met.length}</span> / ${GUESTS.length}</div><span class="bar"><b style="width:${met.length / GUESTS.length * 100}%"></b></span></div><div style="display:grid;justify-items:center">${ic('gift', 'lg')}<small class="muted">at ${GUESTS.length}</small></div></div>
        <div class="grid4" style="margin-top:16px">${cards}</div>
        ${pick ? `<div class="detail">${animal(pick.sp)}<div><h4>${pick.name} · ${pick.sp}</h4><p>${pick.bio}</p><p style="margin-top:4px">Favourite: <b>${PASTRIES[pick.fav].name}</b> · Visits: <b>${S.visits[pick.sp] || 0}</b></p></div></div>` : '<p class="sub" style="margin-top:16px">Open the bakery and guests will start arriving!</p>'}
      </div></div>`;
    },
    spin() {
      const n = SPIN.length, R = 132, cx = 160;
      const segs = SPIN.map((s, i) => {
        const a0 = (i / n) * 2 * Math.PI - Math.PI / 2 - Math.PI / n, a1 = a0 + 2 * Math.PI / n, mid = (a0 + a1) / 2;
        const p = (a, r) => `${cx + r * Math.cos(a)} ${cx + r * Math.sin(a)}`;
        const tx = cx + R * .62 * Math.cos(mid), ty = cx + R * .62 * Math.sin(mid);
        return `<path d="M${cx} ${cx} L${p(a0, R)} A${R} ${R} 0 0 1 ${p(a1, R)} Z" fill="${s.c}" stroke="#C98A5C" stroke-width="2" stroke-linejoin="round"/>
          <g transform="translate(${tx - 15} ${ty - 22}) "><svg width="30" height="30" viewBox="0 0 28 28">${window.ART.icon(s.ic).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg></g>
          <text x="${tx}" y="${ty + 21}" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="600" font-size="14" fill="#5B3424">${s.label}</text>`;
      }).join('');
      const bulbs = Array.from({ length: 16 }, (_, i) => { const a = i / 16 * 2 * Math.PI; return `<circle cx="${cx + 147 * Math.cos(a)}" cy="${cx + 147 * Math.sin(a)}" r="5" fill="${i % 2 ? '#FFE9A8' : '#FFFDF2'}" stroke="#E0A060" stroke-width="1.2" filter="url(#bulbglow)"/>`; }).join('');
      const left = spinsLeft();
      return `<div class="fs">${head('Lucky Spin', 'var(--mint)', true)}<div class="fs-body" style="padding-top:22px">
        <div class="wheelwrap"><svg class="pointer" viewBox="0 0 40 48"><path d="M4 6a16 16 0 0 1 32 0c0 10-16 38-16 38S4 16 4 6z" fill="#FFD45E" stroke="#C98A26" stroke-width="2.5" stroke-linejoin="round"/></svg>
          <svg class="wheel" id="wheel" viewBox="0 0 320 320" style="transform:rotate(${VIEWS.spin.rot || 0}deg)"><defs><radialGradient id="rim" cx="50%" cy="45%" r="55%"><stop offset=".85" stop-color="#F58C70"/><stop offset="1" stop-color="#D9604A"/></radialGradient><filter id="bulbglow" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          <circle cx="160" cy="160" r="158" fill="url(#rim)" stroke="#B5543F" stroke-width="2.5"/>${bulbs}${segs}<circle cx="160" cy="160" r="34" fill="#FFF8EC" stroke="#E6CBA5" stroke-width="3"/>
          <g transform="translate(140 136) scale(.62)">${animal('Bear').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g></svg></div>
        <div class="spininfo"><div class="row">${ic('ticket')}<span>Free spins today: <b class="good">${left}</b> / 3</span></div></div>
        <div class="stack"><button class="btn" data-act="spin" ${left ? '' : (S.tickets ? '' : 'disabled')}>${left ? 'SPIN!' : `Spin for 1 ${'ticket'}`}</button>
        <button class="btn m yellow" style="height:44px" data-act="spinad">${ic('clock')} Watch ad for +1 spin</button></div>
        <div class="lastwin"><div class="row">${ic('gem', 'sm')}<span id="lastWin">${VIEWS.spin.lastWin || 'Spin for coins, gems and tickets!'}</span></div></div></div></div>`;
    },
    event() {
      const left = S.eventEnd - Date.now();
      const rows = MILESTONES.map((m, i) => { const done = S.claimed.includes(i), reach = S.stamps >= m.n, cur = !reach && (i === 0 || S.stamps >= MILESTONES[i - 1].n);
        const right = done ? ic('check') : reach ? `<button class="btn m" style="width:78px" data-act="claim" data-i="${i}">Claim</button>` : cur ? `<span class="num">${S.stamps}/${m.n}</span>` : `<span class="ico" style="opacity:.6">${icon('lock')}</span>`;
        return `<div class="row${cur ? ' cur' : ''}${reach ? ' done' : ''}"><span class="stamp${reach ? ' on' : ''}">${m.n}</span>${ic(m.ic)}<span class="grow">${m.label}</span>${right}</div>`; }).join('');
      return `<div class="fs">${head('Berry Festival', 'var(--berry)', true)}<div class="fs-body">
        <div class="banner"><span class="blob" style="width:140px;height:140px;right:-20px;top:-30px"></span><span class="blob" style="width:80px;height:80px;left:-30px;bottom:-30px"></span>
          <h4>Sell Berry Tarts to earn festival stamps!</h4><span class="pilltag">${ic('clock')}${left > 0 ? 'Ends in ' + (left > DAY ? Math.floor(left / DAY) + 'd ' + Math.floor(left % DAY / 3600000) + 'h' : dur(left)) : 'Event ended'}</span>
          ${pastry('tart')}${animal('Bunny')}</div>
        <div class="h3">Stamp Road · ${S.stamps} stamps</div><div class="stack">${rows}</div>
        ${S.level < 2 ? '<p class="sub" style="margin-top:14px">Berry Tarts unlock at level 2.</p>' : `<button class="btn pink" style="margin-top:16px" data-act="tartshelf">Put Berry Tarts on a shelf</button>`}
      </div></div>`;
    },
  };

  const openModal = (name, arg) => {
    const [view, a] = String(name).split(':'); const param = arg ?? a;
    current = [view, param];
    const full = ['shop', 'guests', 'spin', 'event'].includes(view);
    modal.className = full ? 'full' : ''; modal.innerHTML = VIEWS[view](param); modal.hidden = false; beep(520, .05);
  };
  const refresh = () => { if (current) { modal.innerHTML = VIEWS[current[0]](current[1]); } };

  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]'); if (o) { openModal(o.dataset.open); return; }
    if (e.target.closest('[data-close]') || e.target === modal) { if (current && current[0] !== 'levelup' || e.target.closest('[data-close]')) closeModal(); return; }
    const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
    const d = b.dataset;
    switch (d.act) {
      case 'upgrade': { const c = upgradeCost(); if (S.coins < c) return; S.coins -= c; S.ovenLv++; chime(); toast(`Oven upgraded to Lv ${S.ovenLv}!`); renderBakeHead(); refresh(); break; }
      case 'pick': { const s = S.shelves[+d.i]; if (s.k !== d.k) { s.k = d.k; s.n = 0; } renderShelves(); if (bake && bake.shelf === +d.i) bake = null; closeModal(); break; }
      case 'daily': {
        if (!dailyReady()) return;
        const y = new Date(Date.now() - DAY).toDateString();
        S.daily.streak = S.daily.last === y ? S.daily.streak + 1 : 1; S.daily.last = today();
        const d7 = ((S.daily.streak - 1) % 7) + 1; const [k, v] = DAILY[d7 - 1];
        if (k === 'gift') { S.coins += 3000; S.gems += 50; S.tickets += 5; } else if (k === 'coin') S.coins += v; else if (k === 'gem') S.gems += v; else S.tickets += v;
        chime(); toast(`Day ${d7} reward collected!`); refresh(); break; }
      case 'double': S.coins += +d.v; toast('Demo ad skipped — coins doubled!'); closeModal(); break;
      case 'toggle': S.settings[d.k] = !S.settings[d.k]; refresh(); break;
      case 'howto': openModal('howto'); break;
      case 'reset': openModal('confirmReset'); break;
      case 'doReset': localStorage.removeItem(SAVE_KEY); S = fresh(); location.reload(); break;
      case 'offline': S.coins += +d.v; closeModal(); break;
      case 'offline2': S.coins += +d.v * 2; toast('Demo ad skipped — ×2 collected!'); closeModal(); break;
      case 'buy':
        if (d.pack === 'starter') { S.gems += 300; S.coins += 20000; S.tickets += 10; } else S.gems += +d.gems;
        chime(); toast('Demo purchase — no money was charged.'); refresh(); break;
      case 'swap': { const p = +d.p; if (S.gems < p) return; S.gems -= p; if (d.k === 'coin') S.coins += +d.n; else S.tickets += +d.n; chime(); refresh(); break; }
      case 'freegem': S.gems += 5; S.freeGemAt = Date.now() + 5 * 60000; toast('Demo ad skipped — +5 gems!'); refresh(); break;
      case 'spin': case 'spinad': doSpin(d.act === 'spinad', b); break;
      case 'claim': { const i = +d.i; if (S.claimed.includes(i) || S.stamps < MILESTONES[i].n) return; MILESTONES[i].give(S); S.claimed.push(i); chime(); refresh(); break; }
      case 'tartshelf': { let i = S.shelves.findIndex(s => s.k === 'tart'); if (i < 0) { i = S.shelves.reduce((m, s, j, a) => (s.n < a[m].n ? j : m), 0); S.shelves[i] = { k: 'tart', n: 0 }; renderShelves(); bake = null; } toast(`Shelf ${i + 1} now sells Berry Tarts.`); closeModal(); break; }
    }
    hud(); save();
  });

  let spinning = false;
  const doSpin = (ad, btn) => {
    if (spinning) return;
    if (!ad) { if (spinsLeft()) S.spins.used++; else if (S.tickets > 0) S.tickets--; else return; }
    else toast('Demo ad skipped — bonus spin!');
    spinning = true; $$('[data-act^="spin"]').forEach(x => (x.disabled = true));
    const total = SPIN.reduce((a, s) => a + s.w, 0); let r = Math.random() * total, idx = 0;
    for (; idx < SPIN.length; idx++) { r -= SPIN[idx].w; if (r <= 0) break; }
    idx = Math.min(idx, SPIN.length - 1);
    const seg = 360 / SPIN.length; const base = VIEWS.spin.rot || 0;
    const target = base - (base % 360) + 360 * 5 + (360 - idx * seg) + (Math.random() - .5) * seg * .6;
    VIEWS.spin.rot = target; const w = $('#wheel'); w.style.transform = `rotate(${target}deg)`;
    let ticks = 0; const tk = setInterval(() => { beep(700 + (ticks++ % 2) * 200, .03, 'square', .02); }, 120);
    setTimeout(() => clearInterval(tk), 3600);
    setTimeout(() => {
      SPIN[idx].give(S); spinning = false; chime(); buzz(40);
      VIEWS.spin.lastWin = `You won ${SPIN[idx].label === 'Box' ? 'a Mystery Box (1.5k coins, 10 gems, 1 ticket)' : SPIN[idx].label + ' ' + (SPIN[idx].ic === 'coin' ? 'coins' : SPIN[idx].ic + 's')}!`;
      toast(VIEWS.spin.lastWin); hud(); save(); if (current && current[0] === 'spin') refresh();
    }, 4300);
  };

  // ---------- Scene buttons ----------
  $('#oven').addEventListener('click', () => openModal('upgrade'));
  $('#bakePill').addEventListener('click', () => openModal('upgrade'));
  $('#lvBox').addEventListener('click', () => toast(`Level ${S.level} · ${S.xp}/${xpNeed(S.level)} XP to next level`));
  $('#arrowL').addEventListener('click', () => toast('The Patio opens at level 10!'));
  $('#arrowR').addEventListener('click', () => toast('The Tea Room opens at level 15!'));
  $('#expandBtn').addEventListener('click', () => {
    if (S.tables >= TABLE_POS.length) return toast('All tables placed!');
    const c = tableCost(); if (S.gems < c) return toast(`Need ${c} gems for a new table.`);
    S.gems -= c; S.tables++; renderTables(); chime(); toast('New table! Guests come faster and pay +15%.'); hud(); save();
  });
  $('#giftBtn').addEventListener('click', () => {
    if (Date.now() < S.giftAt) return toast(`Next gift in ${dur(S.giftAt - Date.now())}`);
    const c = 200 + 150 * S.level; S.coins += c; S.giftAt = Date.now() + 4 * 3600000; chime();
    floatAt(40, 220, `${icon('coin').replace('<svg', '<svg class="ico"')}+${c}`); hud(); save();
  });
  $('#speedBtn').addEventListener('click', () => {
    const now = Date.now();
    if (boosted()) return toast('Already baking at double speed!');
    if (now < S.boostReadyAt) return toast(`Speed Up ready in ${dur(S.boostReadyAt - now)}`);
    S.boostUntil = now + 60000; S.boostReadyAt = now + 60000 + 120000; chime(); buzz(30); toast('Demo ad skipped — ×2 speed for 60s!'); hud(); save();
  });
  $('#game').addEventListener('click', e => {
    const c = e.target.closest('.cust'); if (!c) return;
    const cu = customers.find(x => x.el === c); if (cu) toast(`${cu.g.name} wants a ${PASTRIES[cu.wish].name}${cu.star ? ' (pays ×2!)' : ''}`);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  addEventListener('beforeunload', save);

  // ---------- Boot ----------
  renderShelves(); renderTables(); renderBakeHead(); hud();
  const away = (Date.now() - (S.lastSeen || Date.now())) / 1000;
  let p = 0; const lf = $('#loadFill'), lt = $('#loadText');
  const load = setInterval(() => {
    p = Math.min(100, p + 4 + Math.random() * 9); lf.style.width = p + '%'; lt.textContent = `Warming up the ovens… ${Math.floor(p)}%`;
    if (p >= 100) {
      clearInterval(load);
      setTimeout(() => {
        $('#splash').classList.add('fade'); $('#game').hidden = false; running = true; last = performance.now();
        setTimeout(() => ($('#splash').hidden = true), 520);
        const firstRun = !localStorage.getItem(SAVE_KEY);
        const qv = new URLSearchParams(location.search).get('view');
        if (qv) { if (VIEWS[qv.split(':')[0]]) openModal(qv); }
        else if (firstRun) openModal('howto');
        else if (away > 60) { const mins = Math.floor(Math.min(away, 7200) / 60); const coins = Math.round(mins * (6 + S.level * 3 + S.ovenLv * 2) * (1 + .15 * S.tables)); if (coins > 0) openModal('offline', { coins, mins }); }
        if (dailyReady() && !firstRun) queueModal(['daily']);
        save();
      }, 250);
    }
  }, 90);
  setInterval(() => tick(performance.now()), 50);
})();
