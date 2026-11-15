// Simple original SVG artwork and layout helpers for Raccoon Rovers.

export const KIT = { main: '#f28c28', dark: '#1d3557', light: '#fff4e6' };

// Coony: raccoon captain and coach. mood: 'happy' | 'think' | 'cheer' | 'ooh'
export function coony(size = 90, mood = 'happy') {
  const mouth = {
    happy: '<path d="M42 70 Q50 77 58 70" stroke="#222" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
    cheer: '<path d="M41 68 Q50 82 59 68 Z" fill="#7a1f1f" stroke="#222" stroke-width="2"/>',
    think: '<path d="M44 72 L56 70" stroke="#222" stroke-width="2.5" stroke-linecap="round"/>',
    ooh: '<ellipse cx="50" cy="72" rx="4" ry="5" fill="#7a1f1f" stroke="#222" stroke-width="2"/>'
  }[mood] || '';
  return `<svg class="coony" width="${size}" height="${size}" viewBox="0 0 100 100" aria-label="Coony the raccoon">
  <path d="M18 92 Q50 74 82 92 L82 100 L18 100 Z" fill="${KIT.main}"/>
  <path d="M42 80 L50 90 L58 80" fill="none" stroke="${KIT.dark}" stroke-width="3"/>
  <ellipse cx="22" cy="24" rx="12" ry="14" fill="#7d838d"/>
  <ellipse cx="78" cy="24" rx="12" ry="14" fill="#7d838d"/>
  <ellipse cx="22" cy="26" rx="6" ry="8" fill="#2d3038"/>
  <ellipse cx="78" cy="26" rx="6" ry="8" fill="#2d3038"/>
  <ellipse cx="50" cy="52" rx="36" ry="32" fill="#9aa0a9"/>
  <ellipse cx="50" cy="64" rx="24" ry="18" fill="#f1f2f4"/>
  <path d="M16 46 Q30 34 46 44 Q50 47 54 44 Q70 34 84 46 Q80 60 66 58 Q56 56 50 52 Q44 56 34 58 Q20 60 16 46 Z" fill="#2d3038"/>
  <circle cx="34" cy="48" r="6.5" fill="#fff"/><circle cx="66" cy="48" r="6.5" fill="#fff"/>
  <circle cx="35" cy="49" r="3.4" fill="#111"/><circle cx="65" cy="49" r="3.4" fill="#111"/>
  <circle cx="36" cy="47.6" r="1.1" fill="#fff"/><circle cx="66" cy="47.6" r="1.1" fill="#fff"/>
  <ellipse cx="50" cy="62" rx="6" ry="4.5" fill="#1b1b1f"/>
  ${mouth}
  <path d="M30 30 Q50 22 70 30" stroke="#c9ccd1" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;
}

export function frac(n, d) {
  return `<span class="frac"><span>${n}</span><span>${d}</span></span>`;
}

// Bar model. parts: [{label, w, shade}]
export function bar(whole, parts) {
  const total = parts.reduce((s, p) => s + (p.w || 1), 0);
  return `<div class="barmodel">
    <div class="bar-whole"><span>${whole}</span></div>
    <div class="bar-parts">${parts.map(p =>
      `<div class="bar-part${p.shade ? ' shade' : ''}" style="flex:${(p.w || 1) / total}">${p.label}</div>`).join('')}</div>
  </div>`;
}

// Pictogram for Q4. Each quarter square drawn separately.
export function pictogram() {
  const rows = [
    { label: 'Green bottles', q: [4, 4, 4, 4] },
    { label: 'Blue bottles', q: [4, 4, 'L3'] },
    { label: 'Brown bottles', q: [4, 'H'] },
    { label: 'Transparent bottles', q: [4, 4, 4, 4, 4, 4, 'Q'] }
  ];
  const s = 15, gap = 8, rowH = 50, lw = 150;
  let out = '';
  rows.forEach((r, i) => {
    const y = i * rowH;
    out += `<rect x="0" y="${y}" width="${lw}" height="${rowH}" fill="#e6e6e6" stroke="#333"/>`;
    out += `<rect x="${lw}" y="${y}" width="340" height="${rowH}" fill="#fff" stroke="#333"/>`;
    out += `<text x="10" y="${y + 30}" font-size="15">${r.label}</text>`;
    r.q.forEach((q, j) => {
      const x0 = lw + 10 + j * (2 * s + gap), y0 = y + 10;
      const cells = q === 4 ? [[0, 0], [1, 0], [0, 1], [1, 1]]
        : q === 'L3' ? [[0, 0], [1, 0], [0, 1]]
        : q === 'H' ? [[0, 0], [0, 1]]
        : [[0, 0]];
      cells.forEach(([cx, cy]) => {
        out += `<rect x="${x0 + cx * s}" y="${y0 + cy * s}" width="${s}" height="${s}" fill="#fff" stroke="#111" stroke-width="2"/>`;
      });
    });
  });
  const key = `<g transform="translate(0,0)">
    <rect x="0" y="0" width="15" height="15" fill="#fff" stroke="#111" stroke-width="2"/><rect x="15" y="0" width="15" height="15" fill="#fff" stroke="#111" stroke-width="2"/>
    <rect x="0" y="15" width="15" height="15" fill="#fff" stroke="#111" stroke-width="2"/><rect x="15" y="15" width="15" height="15" fill="#fff" stroke="#111" stroke-width="2"/>
    <text x="40" y="21" font-size="16">= 100 bottles</text></g>`;
  return `<div class="diagram"><svg viewBox="-2 -2 160 36" style="width:160px">${key}</svg>
  <svg viewBox="-2 -2 494 204" style="width:100%;max-width:520px">${out}</svg></div>`;
}

// Angle A for Q12 (75 degrees) with an optional protractor.
export function angleDiagram(showProtractor) {
  const vx = 190, vy = 210, r = 160;
  const ang = 75 * Math.PI / 180;
  const ax = vx + 185 * Math.cos(ang), ay = vy - 185 * Math.sin(ang);
  let prot = '';
  if (showProtractor) {
    prot += `<path d="M${vx - r} ${vy} A${r} ${r} 0 0 1 ${vx + r} ${vy} Z" fill="rgba(120,180,255,0.18)" stroke="#2a6fdb" stroke-width="1.5"/>`;
    for (let d = 0; d <= 180; d += 5) {
      const t = d * Math.PI / 180, long = d % 10 === 0;
      const r1 = r, r2 = r - (long ? 12 : 6);
      prot += `<line x1="${vx + r1 * Math.cos(t)}" y1="${vy - r1 * Math.sin(t)}" x2="${vx + r2 * Math.cos(t)}" y2="${vy - r2 * Math.sin(t)}" stroke="#2a6fdb" stroke-width="${long ? 1.4 : 0.8}"/>`;
      if (d % 10 === 0) {
        const ro = r - 22, ri = r - 40;
        prot += `<text x="${vx + ro * Math.cos(t)}" y="${vy - ro * Math.sin(t) + 4}" font-size="10" text-anchor="middle" fill="#1d4ea8">${d}</text>`;
        prot += `<text x="${vx + ri * Math.cos(t)}" y="${vy - ri * Math.sin(t) + 4}" font-size="9" text-anchor="middle" fill="#b04a00">${180 - d}</text>`;
      }
    }
    prot += `<circle cx="${vx}" cy="${vy}" r="3" fill="#2a6fdb"/>`;
  }
  return `<svg class="angle-svg" viewBox="20 10 360 215" style="width:100%;max-width:420px">
    <line x1="${vx}" y1="${vy}" x2="${vx + 180}" y2="${vy}" stroke="#111" stroke-width="2.5"/>
    <line x1="${vx}" y1="${vy}" x2="${ax}" y2="${ay}" stroke="#111" stroke-width="2.5"/>
    <path d="M${vx + 34} ${vy} A34 34 0 0 0 ${vx + 34 * Math.cos(ang)} ${vy - 34 * Math.sin(ang)}" fill="none" stroke="#111" stroke-width="2"/>
    <text x="${vx + 16}" y="${vy - 10}" font-size="16">A</text>
    ${prot}
  </svg>`;
}

export function crayonBox() {
  const cols = ['#e63946', '#2a9d8f', '#f4a261', '#457b9d', '#8e44ad', '#2ecc71', '#f1c40f', '#ff6f91'];
  let sticks = '';
  let i = 0;
  for (let row = 0; row < 4; row++) {
    for (let k = 0; k < 6; k++) {
      const x = 28 + k * 27 + (row % 2) * 12, y = 30 + row * 22;
      const a = (row % 2 ? 1 : -1) * (25 + (k * 13) % 30);
      const c = cols[i++ % cols.length];
      sticks += `<g transform="translate(${x},${y}) rotate(${a})"><rect x="-24" y="-4" width="44" height="8" rx="2" fill="${c}" stroke="#333" stroke-width=".8"/><rect x="-14" y="-4" width="5" height="8" fill="#fff" opacity=".6"/><path d="M20 -4 L28 0 L20 4 Z" fill="${c}" stroke="#333" stroke-width=".8"/></g>`;
    }
  }
  return `<svg viewBox="0 0 190 120" style="width:180px"><defs><clipPath id="boxclip"><rect x="7" y="12" width="176" height="101"/></clipPath></defs>
    <rect x="5" y="10" width="180" height="105" fill="#fff" stroke="#111" stroke-width="2.5"/>
    <g clip-path="url(#boxclip)">${sticks}</g>
    <rect x="5" y="10" width="180" height="105" fill="none" stroke="#111" stroke-width="2.5"/></svg>`;
}

export function teacups(n = 4) {
  const cup = x => `<g transform="translate(${x},0)"><ellipse cx="32" cy="50" rx="30" ry="8" fill="#fff" stroke="#111" stroke-width="2"/>
  <path d="M10 16 L16 46 Q32 52 48 46 L54 16 Z" fill="#fff" stroke="#111" stroke-width="2"/>
  <ellipse cx="32" cy="16" rx="22" ry="6" fill="#c8a27a" stroke="#111" stroke-width="2"/>
  <path d="M54 22 Q66 24 60 36 Q56 40 51 38" fill="none" stroke="#111" stroke-width="2"/></g>`;
  let s = '';
  for (let i = 0; i < n; i++) s += cup(i * 72);
  return `<svg viewBox="0 0 ${n * 72} 62" style="width:${n * 60}px">${s}</svg>`;
}

export function biscuits(n = 5) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const cx = 28 + i * 54;
    let edge = '';
    for (let k = 0; k < 16; k++) {
      const t = k / 16 * Math.PI * 2;
      edge += `${k ? 'L' : 'M'}${cx + 24 * Math.cos(t)} ${30 + 24 * Math.sin(t)} L${cx + 21 * Math.cos(t + 0.2)} ${30 + 21 * Math.sin(t + 0.2)} `;
    }
    s += `<path d="${edge}Z" fill="#e9c98b" stroke="#111" stroke-width="1.6"/><circle cx="${cx - 6}" cy="26" r="2" fill="#8a6a3a"/><circle cx="${cx + 7}" cy="34" r="2" fill="#8a6a3a"/><circle cx="${cx + 3}" cy="22" r="1.6" fill="#8a6a3a"/>`;
  }
  return `<svg viewBox="0 0 ${n * 54 + 4} 60" style="width:${n * 46}px">${s}</svg>`;
}

export function hamster() {
  return `<svg viewBox="0 0 140 100" style="width:130px">
  <ellipse cx="72" cy="60" rx="58" ry="36" fill="#8d6e63" stroke="#111" stroke-width="2"/>
  <ellipse cx="38" cy="62" rx="26" ry="22" fill="#f3e5d8"/>
  <circle cx="30" cy="30" r="10" fill="#f3e5d8" stroke="#111" stroke-width="2"/>
  <circle cx="56" cy="30" r="10" fill="#f3e5d8" stroke="#111" stroke-width="2"/>
  <circle cx="34" cy="50" r="4" fill="#111"/><circle cx="52" cy="50" r="4" fill="#111"/>
  <ellipse cx="43" cy="60" rx="4" ry="3" fill="#e57373"/>
  <path d="M30 62 L14 58 M30 66 L14 68 M56 62 L72 58 M56 66 L72 68" stroke="#555" stroke-width="1.2"/>
  </svg>`;
}

export function viking() {
  return `<svg viewBox="0 0 120 120" style="width:100px">
  <path d="M30 50 Q14 40 12 18 Q26 30 36 38 Z" fill="#f5f0e1" stroke="#111" stroke-width="2"/>
  <path d="M90 50 Q106 40 108 18 Q94 30 84 38 Z" fill="#f5f0e1" stroke="#111" stroke-width="2"/>
  <path d="M28 56 Q30 22 60 22 Q90 22 92 56 Z" fill="#9e9e9e" stroke="#111" stroke-width="2"/>
  <rect x="26" y="52" width="68" height="8" fill="#757575" stroke="#111" stroke-width="2"/>
  <ellipse cx="60" cy="78" rx="26" ry="22" fill="#f1c8a5" stroke="#111" stroke-width="2"/>
  <circle cx="50" cy="72" r="3" fill="#111"/><circle cx="70" cy="72" r="3" fill="#111"/>
  <path d="M36 82 Q60 120 84 82 Q72 92 60 90 Q48 92 36 82 Z" fill="#c0703a" stroke="#111" stroke-width="2"/>
  </svg>`;
}

export function kidSpeaking(textHtml) {
  return `<div class="speaker"><svg viewBox="0 0 90 100" style="width:80px">
    <path d="M14 100 Q45 70 76 100 Z" fill="#5c7cfa" stroke="#111" stroke-width="2"/>
    <circle cx="45" cy="46" r="26" fill="#8d5524" stroke="#111" stroke-width="2"/>
    <path d="M19 40 Q22 14 45 16 Q70 14 71 40 Q62 28 45 28 Q28 28 19 40 Z" fill="#2b1b10"/>
    <circle cx="36" cy="46" r="3" fill="#111"/><circle cx="54" cy="46" r="3" fill="#111"/>
    <path d="M36 58 Q45 66 54 58" stroke="#111" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </svg><div class="bubble">${textHtml}</div></div>`;
}

// Trophy for the cup final.
export function trophy(size = 140) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
  <path d="M28 12 H72 V30 Q72 56 50 60 Q28 56 28 30 Z" fill="#f4c430" stroke="#8a6d00" stroke-width="2"/>
  <path d="M28 18 Q12 18 14 32 Q16 44 30 44" fill="none" stroke="#8a6d00" stroke-width="4"/>
  <path d="M72 18 Q88 18 86 32 Q84 44 70 44" fill="none" stroke="#8a6d00" stroke-width="4"/>
  <rect x="45" y="60" width="10" height="16" fill="#f4c430" stroke="#8a6d00" stroke-width="2"/>
  <rect x="32" y="76" width="36" height="12" rx="2" fill="${KIT.dark}"/>
  <text x="50" y="40" font-size="12" text-anchor="middle" fill="#8a6d00" font-weight="700">RR</text>
  </svg>`;
}
