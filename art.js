// SVG art for Crumbs & Paws — mirrors the shape-built components in the Figma file.
(function () {
  const INK = '#4A2A1A', LINE = '#8A5A3C', PINK = '#FF9FB0';
  const st = (s, sw = 2.2) => (s ? ` stroke="${LINE}" stroke-width="${sw}" stroke-linejoin="round"` : '');
  const E = (x, y, w, h, f, s = true, sw, extra = '') =>
    `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${f}"${st(s, sw)}${extra}/>`;
  const R = (x, y, w, h, r, f, s = true, sw, extra = '') =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}"${st(s, sw)}${extra}/>`;
  const PATH = (d, f, s = true, sw) => `<path d="${d}" fill="${f}"${st(s, sw)}/>`;

  const SPECIES = {
    'Bunny': { c: '#FFF8F0', apron: '#FF9FB0' },
    'Pig': { c: '#FFC9C9', apron: '#8EC9F0' },
    'Bear': { c: '#C98B5E', apron: '#7FD1AE' },
    'Cat': { c: '#F7B267', apron: '#B88BE0' },
    'Sheep': { c: '#6E6766', apron: '#FF9FB0' },
    'Giraffe': { c: '#F6CF6A', apron: '#F0705A' },
    'Red Panda': { c: '#E07A4F', apron: '#FFD66B' },
    'Dog': { c: '#E8B07A', apron: '#F0705A' },
  };

  function animal(name) {
    const s = SPECIES[name]; const c = s.c; let g = '';
    g += E(18, 74, 12, 8, c, true, 2) + E(34, 74, 12, 8, c, true, 2);
    g += R(14, 50, 36, 28, 12, c) + R(19, 56, 26, 20, 8, s.apron, true, 2);
    if (name === 'Bunny') g += E(14, -14, 13, 32, c) + E(36, -14, 13, 32, c) + E(18, -8, 5, 20, PINK, false) + E(40, -8, 5, 20, PINK, false);
    if (name === 'Bear') g += E(4, 6, 18, 18, c) + E(42, 6, 18, 18, c);
    if (name === 'Pig' || name === 'Cat' || name === 'Red Panda') {
      g += PATH('M6 24 L9 0 L26 12 Z', c) + PATH('M58 24 L55 0 L38 12 Z', c);
    }
    if (name === 'Giraffe') g += R(20, -4, 4, 14, 2, LINE, false) + R(40, -4, 4, 14, 2, LINE, false) + E(17, -8, 10, 10, '#E7A93A') + E(37, -8, 10, 10, '#E7A93A');
    if (name === 'Sheep') for (const [x, y] of [[2, 14], [8, 4], [22, 0], [36, 2], [48, 10], [52, 24]]) g += E(x, y, 18, 18, '#FFF8F0', true, 2);
    if (name === 'Dog') g += E(0, 14, 16, 28, '#B9784A') + E(48, 14, 16, 28, '#B9784A');
    g += E(6, 10, 52, 46, c);
    if (name === 'Red Panda') g += E(14, 30, 14, 10, '#FFF8F0', false) + E(36, 30, 14, 10, '#FFF8F0', false);
    if (name === 'Giraffe') g += E(12, 18, 8, 6, '#E7A93A', false) + E(42, 16, 7, 5, '#E7A93A', false);
    if (name === 'Cat') g += R(30, 12, 4, 8, 2, '#E08E3E', false);
    g += `<g class="eyes">${E(20, 29, 7, 8, INK, false)}${E(37, 29, 7, 8, INK, false)}${E(22.3, 30.2, 2.6, 2.6, '#fff', false)}${E(39.3, 30.2, 2.6, 2.6, '#fff', false)}</g>`;
    g += E(13, 38, 9, 5, PINK, false, 0, ' opacity=".7"') + E(42, 38, 9, 5, PINK, false, 0, ' opacity=".7"');
    if (name === 'Pig') g += E(25, 37, 14, 10, '#F49CA6', true, 2) + E(29, 40, 2.5, 4, INK, false) + E(33, 40, 2.5, 4, INK, false);
    else if (name === 'Dog' || name === 'Bear') g += E(27, 37, 10, 8, '#FFF1DE', false) + E(29.5, 37, 5, 4, INK, false);
    else g += `<path d="M28.5 39q1.75 2 3.5 0q1.75 2 3.5 0" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`;
    g = `<ellipse cx="32" cy="82" rx="22" ry="4" fill="#8A5A3C" opacity=".14"/>` + g;
    return `<svg class="animal" viewBox="-2 -18 68 104" aria-label="${name}">${g}</svg>`;
  }

  const PASTRY = {
    waffle: () => R(4, 4, 32, 32, 6, '#FFD66B') + [12, 19.5, 27].map(x => R(x, 6, 2.5, 28, 1, '#E7A93A', false)).join('') + [12, 19.5, 27].map(y => R(6, y, 28, 2.5, 1, '#E7A93A', false)).join(''),
    cookie: () => E(4, 4, 32, 32, '#E7B577') + [[12, 12], [22, 10], [24, 22], [13, 24], [18, 17]].map(([x, y]) => E(x, y, 5, 5, INK, false)).join(''),
    chocobun: () => E(3, 6, 34, 28, '#8A5A3C') + '<path d="M11 13l18 14M29 13L11 27" stroke="#B07856" stroke-width="2.5" stroke-linecap="round"/>',
    croissant: () => E(2, 16, 14, 14, '#E7A93A') + E(24, 16, 14, 14, '#E7A93A') + E(8, 8, 24, 22, '#FFD66B') + R(14, 12, 2.5, 14, 1, '#E7A93A', false) + R(22, 12, 2.5, 14, 1, '#E7A93A', false),
    donut: () => E(3, 3, 34, 34, '#E7B577') + E(5, 4, 30, 28, '#FF9FB0', false) + E(15, 14, 10, 10, '#FFF4E2') + [[10, 10, '#8EC9F0'], [26, 9, '#FFD66B'], [27, 24, '#7FD1AE'], [9, 22, '#FFD66B']].map(([x, y, c]) => R(x, y, 5, 2, 1, c, false)).join(''),
    cake: () => R(4, 16, 32, 20, 4, '#FFF1DE') + R(4, 12, 32, 9, 4, '#FF9FB0') + R(4, 25, 32, 3, 1, '#FF9FB0', false) + E(15, 2, 11, 11, '#F0705A'),
    bread: () => R(3, 10, 34, 24, 12, '#E7A86A') + [11, 19, 27].map(x => R(x, 14, 2.5, 10, 1, '#B9784A', false)).join(''),
    tart: () => E(3, 12, 34, 24, '#E7B577') + E(7, 12, 26, 16, '#B88BE0', false) + E(12, 14, 6, 6, '#F0705A', false) + E(22, 15, 6, 6, '#F0705A', false),
  };
  const pastry = (k) => `<svg class="pastry" viewBox="0 0 40 40" aria-label="${k}">${PASTRY[k]()}</svg>`;

  const S = 'stroke="#8A5A3C" stroke-width="2.2" stroke-linejoin="round"';
  const ICONS = {
    gem: `<path d="M8 4h12l5 6-11 15L3 10z" fill="#8EC9F0" ${S}/><path d="M3 10h22M11 4l-2 6 5 15 5-15-2-6" fill="none" stroke="#4E95C9" stroke-width="1.6" stroke-linejoin="round"/>`,
    coin: `<circle cx="14" cy="14" r="12" fill="#FFD66B" ${S}/><circle cx="14" cy="14" r="7" fill="#E7A93A"/><circle cx="12" cy="11" r="2" fill="#FFF4C9"/>`,
    ticket: `<path d="M3 8h22v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4z" fill="#F0705A" ${S}/><path d="M10 9v10" stroke="#FFF4E2" stroke-width="2" stroke-dasharray="2 2"/>`,
    plus: `<path d="M14 3v22M3 14h22" stroke="#8A5A3C" stroke-width="9" stroke-linecap="round"/><path d="M14 3v22M3 14h22" stroke="#FFD66B" stroke-width="4.5" stroke-linecap="round"/>`,
    close: `<path d="M7 7l14 14M21 7L7 21" stroke="#FFFDF7" stroke-width="4.5" stroke-linecap="round"/>`,
    shop: `<rect x="4" y="11" width="20" height="14" rx="3" fill="#FFFDF7" ${S}/><rect x="2" y="4" width="24" height="9" rx="4" fill="#F0705A" ${S}/><rect x="11" y="16" width="6" height="9" rx="2" fill="#E7A93A" ${S}/>`,
    book: `<rect x="3" y="3" width="22" height="22" rx="4" fill="#8EC9F0" ${S}/><rect x="7" y="3" width="3" height="22" fill="#4E95C9"/><circle cx="17" cy="13" r="4" fill="#fff"/>`,
    wheel: `<circle cx="14" cy="15" r="11" fill="#7FD1AE" ${S}/><path d="M14 15V4.5M14 15l9 5.3M14 15l-9 5.3" stroke="#8A5A3C" stroke-width="2"/><circle cx="14" cy="15" r="3" fill="#F0705A" ${S}/><path d="M10 1h8l-4 5z" fill="#FFD66B" ${S}/>`,
    star: `<path d="M14 2.5l3.4 7 7.6 1-5.5 5.3 1.3 7.6L14 19.8l-6.8 3.6 1.3-7.6L3 10.5l7.6-1z" fill="#FFD66B" ${S}/>`,
    calendar: `<rect x="3" y="5" width="22" height="20" rx="4" fill="#FFFDF7" ${S}/><rect x="3" y="5" width="22" height="7" rx="3" fill="#F0705A" ${S}/><rect x="8" y="2" width="3" height="7" rx="1.5" fill="#5B3424"/><rect x="17" y="2" width="3" height="7" rx="1.5" fill="#5B3424"/><path d="M10 18l3 3 5-6" fill="none" stroke="#3FA57D" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`,
    gift: `<rect x="4" y="11" width="20" height="14" rx="3" fill="#FF9FB0" ${S}/><rect x="2" y="7" width="24" height="6" rx="3" fill="#E2667E" ${S}/><rect x="12" y="7" width="4" height="18" fill="#FFD66B"/><circle cx="10" cy="5" r="4" fill="#FFD66B" ${S}/><circle cx="18" cy="5" r="4" fill="#FFD66B" ${S}/>`,
    gear: `<path d="M14 2l2.2 3.2 3.8-1 .6 3.9 3.6 1.5-1.7 3.4 1.7 3.4-3.6 1.5-.6 3.9-3.8-1L14 26l-2.2-3.2-3.8 1-.6-3.9-3.6-1.5 1.7-3.4-1.7-3.4L7.4 8.1 8 4.2l3.8 1z" fill="#9A6B52" ${S}/><circle cx="14" cy="14" r="4.5" fill="#FFFDF7" ${S}/>`,
    lock: `<path d="M9 12V9a5 5 0 0 1 10 0v3" fill="none" stroke="#8A5A3C" stroke-width="2.6"/><rect x="4" y="12" width="20" height="14" rx="4" fill="#FFD66B" ${S}/><rect x="12.5" y="16" width="3" height="5" rx="1.5" fill="#5B3424"/>`,
    check: `<circle cx="14" cy="14" r="12" fill="#7FD1AE" ${S}/><path d="M8.5 14.5l4 4 7-8" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`,
    heart: `<path d="M14 24C6 18 3 14 3 9.5 3 6.5 5.5 4 8.5 4c2.3 0 4.3 1.4 5.5 3.4C15.2 5.4 17.2 4 19.5 4 22.5 4 25 6.5 25 9.5 25 14 22 18 14 24z" fill="#FF9FB0" ${S}/>`,
    arrowR: `<path d="M9 5l13 9-13 9z" fill="#FFFDF7" ${S}/>`,
    arrowL: `<path d="M19 5L6 14l13 9z" fill="#FFFDF7" ${S}/>`,
    clock: `<circle cx="14" cy="14" r="12" fill="#FFFDF7" ${S}/><path d="M14 7v7h6" fill="none" stroke="#5B3424" stroke-width="2.6" stroke-linecap="round"/>`,
    sound: `<path d="M4 10h5l7-6v20l-7-6H4z" fill="#9A6B52" ${S}/><path d="M20 9c2 2.5 2 7.5 0 10M23 6c3.5 4 3.5 12 0 16" fill="none" stroke="#8A5A3C" stroke-width="2.2" stroke-linecap="round"/>`,
    bag: `<path d="M10 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="#8A5A3C" stroke-width="2.4" stroke-linecap="round"/><rect x="4" y="10" width="20" height="15" rx="5" fill="#E7A93A" ${S}/>`,
    bolt: `<path d="M16 2L5 16h8l-2 10 11-14h-8z" fill="#FFD66B" ${S}/>`,
  };
  const icon = (k) => `<svg viewBox="0 0 28 28" aria-hidden="true">${ICONS[k] || ''}</svg>`;

  // ---------- Scenery (sunlit bakery interior) ----------
  const leaf = (x, y, w, h, r, c) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${h}" transform="rotate(${r} ${x} ${y})" fill="${c}" stroke="#4F8F45" stroke-width="1.6"/>`;
  function plant(kind = 0) {
    const pot = `<path d="M22 62h36l-4 26H26z" fill="#E29468" stroke="#A8643F" stroke-width="2" stroke-linejoin="round"/><rect x="19" y="56" width="42" height="9" rx="4" fill="#EFA97C" stroke="#A8643F" stroke-width="2"/>`;
    const L = kind === 1
      ? [[40, 30, 7, 26, 0, '#7CC46A'], [28, 36, 6, 22, -28, '#6BB55C'], [52, 36, 6, 22, 28, '#6BB55C'], [20, 46, 5, 16, -55, '#8ED27A'], [60, 46, 5, 16, 55, '#8ED27A']]
      : [[40, 24, 13, 18, 0, '#7CC46A'], [24, 38, 12, 15, -40, '#6BB55C'], [56, 38, 12, 15, 40, '#6BB55C'], [32, 48, 10, 12, -20, '#8ED27A'], [50, 48, 10, 12, 20, '#8ED27A']];
    return `<svg class="plant" viewBox="0 0 80 90" aria-hidden="true">${L.map(a => leaf(...a)).join('')}${pot}</svg>`;
  }
  const sparkle = (c = '#fff') => `<svg class="spark" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 0C11 6 14 9 20 10C14 11 11 14 10 20C9 14 6 11 0 10C6 9 9 6 10 0Z" fill="${c}"/></svg>`;
  function scene(full) {
    const win = `<div class="win"><i></i><i></i><i></i><i></i><span class="cloud c1"></span><span class="cloud c2"></span></div>`;
    const shelf = `<div class="wallshelf"><div class="board"></div>${plant(1)}${plant(0)}</div>`;
    return `<div class="scene${full ? ' soft' : ''}"><div class="sc-wall">${win}${shelf}<div class="sunbeam"></div><div class="hang left">${plant(0)}</div><div class="hang right">${plant(1)}</div></div>
      <div class="sc-floor"></div><div class="corner bl">${plant(0)}</div><div class="corner br">${plant(1)}</div></div>`;
  }

  window.ART = { animal, pastry, icon, plant, sparkle, scene, SPECIES: Object.keys(SPECIES) };
})();
