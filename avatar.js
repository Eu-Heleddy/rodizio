export const LABELS = { skin:'Pele', hair:'Cabelo', hairColor:'Cor do cabelo', eyes:'Olhos', glasses:'Óculos', nose:'Nariz', mouth:'Boca', ears:'Orelhas', shirt:'Estilo da blusa', shirtColor:'Cor da blusa', hat:'Chapéu' };
export const COUNTS = { skin:8, hair:12, hairColor:9, eyes:7, glasses:8, nose:7, mouth:7, ears:7, shirt:8, shirtColor:10, hat:8 };
export const EDIT_ORDER = ['skin', 'hair', 'hairColor', 'eyes', 'glasses', 'nose', 'mouth', 'ears', 'shirt', 'shirtColor', 'hat'];
const SKIN = ['#FFE0C7','#F5C9A0','#E8B48A','#D2976B','#B97A4F','#8D5A3B','#6B4128','#4A2C1B'];
const HAIRC = ['#1b1b1b','#4a2c1b','#8b5a2b','#d9a441','#f2d27a','#c0392b','#8e44ad','#2f80ed','#bdc3c7'];
const SHIRTC = ['#e63946','#f4802a','#f4c430','#2a9d5c','#12a4a4','#1d70b8','#5b3fb5','#ec5fa5','#2b2b2b','#f5f5f5'];
export const colorOf = (key, i) => (key === 'skin' ? SKIN[i] : key === 'shirtColor' ? SHIRTC[i] : HAIRC[i]);
export const defaultAvatar = () => ({ skin:1, hair:1, hairColor:1, eyes:0, glasses:0, nose:0, mouth:0, ears:0, shirt:0, shirtColor:0, hat:0 });
export function randomAvatar() {
  const a = {};
  for (const k in COUNTS) a[k] = Math.floor(Math.random() * COUNTS[k]);
  if (Math.random() < 0.6) a.glasses = 0;
  if (Math.random() < 0.6) a.hat = 0;
  return a;
}
const mir = p => `<g transform="translate(100 0) scale(-1 1)">${p}</g>`;

function hair(i, c) {
  const f = d => `<path d="${d}" fill="${c}"/>`;
  const shine = `<path d="M33 23 Q43 16 55 17" stroke="#fff" stroke-opacity=".22" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  const dark = d => `<path d="${d}" stroke="#000" stroke-opacity=".25" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  const cap = 'M23 50 C20 20 38 14 50 14 C62 14 80 20 77 50 C73 38 64 30 50 30 C36 30 27 38 23 50Z';
  switch (i) {
    case 1: return ['', f('M23 50 C19 20 38 13 52 13 C68 13 81 24 77 50 C75 40 71 34 63 31 C54 35 40 33 30 28 C27 34 25 41 23 50Z') + dark('M45 15 Q43 24 34 28') + shine];
    case 2: return ['', `<path d="M25 44 C24 24 38 19 50 19 C62 19 76 24 75 44 C72 34 64 29 50 29 C36 29 28 34 25 44Z" fill="${c}" fill-opacity=".85"/>`];
    case 3: return [f('M19 52 C14 14 38 8 50 8 C62 8 86 14 81 52 C82 70 84 84 88 96 L12 96 C16 84 18 70 19 52Z'),
      f('M22 54 C18 18 38 11 50 11 C62 11 82 18 78 54 C76 44 72 36 62 32 C58 28 54 27 50 27 C46 27 42 28 38 32 C28 36 24 44 22 54Z') + dark('M50 12 V27') + f('M25 46 C20 60 20 78 22 92 L30 92 C28 76 28 60 30 44Z') + mir(f('M25 46 C20 60 20 78 22 92 L30 92 C28 76 28 60 30 44Z')) + shine];
    case 4: return [f('M20 52 C16 14 38 10 50 10 C62 10 84 14 80 52 L81 76 C70 82 30 82 19 76Z'),
      f('M22 52 C18 16 38 11 50 11 C62 11 82 16 78 52 L75 38 C60 34 40 34 25 38Z') + f('M25 44 C21 56 21 68 23 76 L31 74 C29 64 29 54 30 42Z') + mir(f('M25 44 C21 56 21 68 23 76 L31 74 C29 64 29 54 30 42Z')) + shine];
    case 5: return ['', f('M22 48 L20 24 L33 31 L33 12 L43 26 L50 6 L57 26 L67 12 L67 31 L80 24 L78 48 C74 38 64 31 50 31 C36 31 26 38 22 48Z')];
    case 6: return [`<ellipse cx="50" cy="36" rx="38" ry="33" fill="${c}"/><g fill="none" stroke="#fff" stroke-opacity=".15" stroke-width="2"><circle cx="30" cy="22" r="6"/><circle cx="50" cy="12" r="6"/><circle cx="70" cy="22" r="6"/><circle cx="18" cy="40" r="6"/><circle cx="82" cy="40" r="6"/></g>`,
      f('M24 48 C24 30 36 25 50 25 C64 25 76 30 76 48 C72 38 62 33 50 33 C38 33 28 38 24 48Z')];
    case 7: return [`<circle cx="50" cy="11" r="9.5" fill="${c}"/>`, f(cap) + `<rect x="43" y="14" width="14" height="3" rx="1.5" fill="#e63946"/>` + shine];
    case 8: return ['', `<path d="M25 44 C26 28 38 22 50 22 C62 22 74 28 75 44 C70 32 62 28 50 28 C38 28 30 32 25 44Z" fill="${c}" fill-opacity=".35"/>` + f('M40 32 C35 12 44 3 50 3 C56 3 65 12 60 32 C56 28 44 28 40 32Z')];
    case 9: { const circ = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
      return [[[28, 40, 13], [23, 56, 11], [72, 40, 13], [77, 56, 11], [36, 22, 13], [50, 16, 13], [64, 22, 13], [26, 28, 12], [74, 28, 12]].map(a => circ(...a)).join(''),
        [[33, 31, 8], [43, 27, 8], [53, 26, 8], [63, 28, 8], [70, 34, 7]].map(a => circ(...a)).join('')]; }
    case 10: return [f('M74 24 C97 22 99 52 88 76 C84 62 82 48 74 40Z') + `<circle cx="78" cy="30" r="3.2" fill="#e63946"/>`, f(cap) + shine];
    case 11: return ['', f('M23 50 C17 22 30 5 52 5 C70 5 83 20 77 50 C74 40 70 33 62 30 C52 28 40 30 34 32 C28 34 25 40 23 50Z') + shine];
    default: return ['', ''];
  }
}
function ears(t, s) {
  const f = d => `<path d="${d}" fill="${s}"/>`, i = d => `<path d="${d}" fill="#000" opacity=".13"/>`;
  switch (t) {
    case 1: return f('M27 40 C10 34 8 62 24 68 L27 64Z') + i('M23 46 C15 46 15 61 24 62Z');
    case 2: return f('M27 47 C20 45 19 55 25 58Z') + i('M25 49 C22 49 22 54 25 55Z');
    case 3: return f('M27 42 C12 30 6 52 22 62 L27 58Z') + i('M23 44 C14 40 12 52 21 56Z');
    case 4: return f('M27 46 C20 44 8 34 5 26 C10 46 17 60 27 62Z') + i('M24 48 C18 44 12 40 10 35 C13 47 18 55 24 57Z');
    case 5: return f('M27 44 C17 40 15 56 22 66 C25 69 28 66 27 62Z') + i('M24 47 C19 47 19 56 23 60Z');
    case 6: return f('M27 46 C21 45 15 41 12 36 C14 48 18 56 26 58Z') + i('M24 48 C19 46 16 43 15 41 C16 49 19 53 24 55Z');
    default: return f('M27 44 C16 40 14 58 24 62 C26 62 27 61 27 60Z') + i('M24 47 C19 47 19 55 24 57Z');
  }
}
function eyes(t) {
  const L = 40, R = 60, y = 50, k = '#222';
  const dot = (x, r = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${k}"/>`;
  const big = x => `<ellipse cx="${x}" cy="${y}" rx="5" ry="5.5" fill="#fff" stroke="${k}" stroke-width="1.5"/><circle cx="${x + 1}" cy="${y + .5}" r="2.6" fill="${k}"/>`;
  const happy = x => `<path d="M${x - 5} ${y + 2} Q${x} ${y - 6} ${x + 5} ${y + 2}" stroke="${k}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  const sleepy = x => `<path d="M${x - 5} ${y} H${x + 5}" stroke="${k}" stroke-width="3" stroke-linecap="round"/>`;
  const lash = x => dot(x) + `<path d="M${x - 5} ${y - 3} L${x - 7} ${y - 6} M${x} ${y - 5} V${y - 9} M${x + 5} ${y - 3} L${x + 7} ${y - 6}" stroke="${k}" stroke-width="1.6" stroke-linecap="round"/>`;
  const shiny = x => `<ellipse cx="${x}" cy="${y}" rx="3.6" ry="4.2" fill="${k}"/><circle cx="${x + 1.2}" cy="${y - 1.4}" r="1.2" fill="#fff"/>`;
  switch (t) {
    case 1: return big(L) + big(R);
    case 2: return happy(L) + happy(R);
    case 3: return sleepy(L) + sleepy(R);
    case 4: return shiny(L) + shiny(R);
    case 5: return dot(L) + sleepy(R);
    case 6: return lash(L) + lash(R);
    default: return dot(L) + dot(R);
  }
}
function glasses(t) {
  if (!t) return '';
  const k = '#2b2b2b'; let lens;
  switch (t) {
    case 1: lens = `<circle cx="40" cy="50" r="8.5" fill="#fff" fill-opacity=".25" stroke="${k}" stroke-width="2"/>`; break;
    case 2: lens = `<rect x="31" y="43.5" width="18" height="13" rx="3" fill="#fff" fill-opacity=".25" stroke="${k}" stroke-width="2"/>`; break;
    case 3: lens = `<path d="M30.5 44 H49.5 Q49.5 58 40 58 Q30.5 58 30.5 44Z" fill="#7fb7d6" fill-opacity=".35" stroke="${k}" stroke-width="1.8" stroke-linejoin="round"/>`; break;
    case 4: lens = `<path d="M29 43 L32 45 H49 Q49 57.5 39.5 57.5 Q30 57.5 29.5 47Z" fill="#fff" fill-opacity=".25" stroke="#c2185b" stroke-width="2" stroke-linejoin="round"/>`; break;
    case 5: lens = `<rect x="30.5" y="43.5" width="19" height="12.5" rx="5" fill="#111" stroke="#111" stroke-width="1.5"/><path d="M34 46.5 L39 46.5" stroke="#fff" stroke-opacity=".5" stroke-width="1.6" stroke-linecap="round"/>`; break;
    case 6: lens = `<path d="M31 45 H49" stroke="${k}" stroke-width="2.4" stroke-linecap="round"/><path d="M31.5 45 Q32 57 40 57 Q48 57 48.5 45" fill="#fff" fill-opacity=".2" stroke="${k}" stroke-width=".9"/>`; break;
    default: lens = `<path d="M40 57 C28 50 32 40 40 45.5 C48 40 52 50 40 57Z" fill="#e63946" fill-opacity=".8" stroke="#7a1f1f" stroke-width="1.6" stroke-linejoin="round"/>`;
  }
  return lens + mir(lens) + `<path d="M48.5 49 Q50 47.5 51.5 49" stroke="${k}" stroke-width="1.8" fill="none"/><path d="M30 49 L25 47.5 M70 49 L75 47.5" stroke="${k}" stroke-width="1.8" stroke-linecap="round"/>`;
}
function nose(t) {
  switch (t) {
    case 1: return `<path d="M50 52 L47 60 L51 60" stroke="#000" stroke-opacity=".5" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 2: return `<path d="M50 53 L45.5 61 L54.5 61Z" fill="#000" opacity=".17"/>`;
    case 3: return `<circle cx="50" cy="58" r="4" fill="#e5675a" opacity=".85"/>`;
    case 4: return `<circle cx="47.5" cy="59" r="1.3" fill="#000" opacity=".5"/><circle cx="52.5" cy="59" r="1.3" fill="#000" opacity=".5"/>`;
    case 5: return `<path d="M50 49 V60 Q50 62 54 61" stroke="#000" stroke-opacity=".5" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    case 6: return `<path d="M50 51 Q56 60 50 62 Q44 60 50 51Z" fill="#000" opacity=".15"/>`;
    default: return `<circle cx="50" cy="58" r="1.8" fill="#000" opacity=".45"/>`;
  }
}
function mouth(t) {
  const st = `stroke="#7a2e2e" stroke-width="2.5" fill="none" stroke-linecap="round"`;
  switch (t) {
    case 1: return `<path d="M40 65 Q50 81 60 65Z" fill="#7a1f1f"/><path d="M42 65.5 Q50 69 58 65.5 L58 67.5 Q50 71 42 67.5Z" fill="#fff"/>`;
    case 2: return `<path d="M43 68 H57" ${st}/>`;
    case 3: return `<path d="M46 70 Q50 82 54 70Z" fill="#ff7a93"/><path d="M41 66 Q50 74 59 66" ${st}/>`;
    case 4: return `<ellipse cx="50" cy="69" rx="4" ry="5" fill="#7a1f1f"/>`;
    case 5: return `<path d="M43 69 Q53 71 58 64" ${st}/>`;
    case 6: return `<rect x="40" y="64" width="20" height="9" rx="4" fill="#fff" stroke="#7a2e2e" stroke-width="2"/><path d="M40 68.5 H60 M50 64 V73" stroke="#7a2e2e" stroke-width="1.2"/>`;
    default: return `<path d="M42 66 Q50 74 58 66" ${st}/>`;
  }
}
function hat(t) {
  switch (t) {
    case 1: return `<path d="M24 38 Q24 10 50 10 Q76 10 76 38Z" fill="#e63946"/><path d="M28 36 H92 Q92 43 80 43 H28Z" fill="#b02a35"/><circle cx="50" cy="10" r="2.5" fill="#b02a35"/>`;
    case 2: return `<path d="M23 40 Q22 8 50 8 Q78 8 77 40Z" fill="#3a6ea5"/><rect x="21" y="33" width="58" height="9" rx="4" fill="#2b507a"/><circle cx="50" cy="6" r="6" fill="#fff"/>`;
    case 3: return `<circle cx="35" cy="14" r="11" fill="#fff" stroke="#ddd"/><circle cx="50" cy="9" r="13" fill="#fff" stroke="#ddd"/><circle cx="65" cy="14" r="11" fill="#fff" stroke="#ddd"/><rect x="30" y="20" width="40" height="15" rx="3" fill="#fff" stroke="#ddd"/>`;
    case 4: return `<ellipse cx="50" cy="32" rx="42" ry="7" fill="#8b5a2b"/><path d="M32 32 Q31 8 50 11 Q69 8 68 32Z" fill="#a06a32"/><rect x="32" y="26" width="36" height="5" fill="#5e3b17"/>`;
    case 5: return `<path d="M28 36 L25 12 L38 23 L50 7 L62 23 L75 12 L72 36Z" fill="#f2c230" stroke="#c9a227" stroke-width="1.5"/><circle cx="50" cy="29" r="3" fill="#e63946"/><circle cx="36" cy="30" r="2" fill="#2f80ed"/><circle cx="64" cy="30" r="2" fill="#2a9d5c"/>`;
    case 6: return `<path d="M50 2 L71 35 H29Z" fill="#ff5fa2"/><circle cx="43" cy="24" r="2.5" fill="#fff"/><circle cx="55" cy="18" r="2.5" fill="#f4c430"/><circle cx="58" cy="29" r="2.5" fill="#fff"/><circle cx="50" cy="3" r="4.5" fill="#f4c430"/>`;
    case 7: return `<path d="M50 0 L74 36 H26Z" fill="#f4c430"/><path d="M24 33 Q50 28 76 33 Q76 40 50 40 Q24 40 24 33Z" fill="#d98a3d"/><circle cx="50" cy="20" r="5" fill="#d32f2f"/><circle cx="42" cy="30" r="3.5" fill="#d32f2f"/><circle cx="59" cy="29" r="3.5" fill="#d32f2f"/>`;
    default: return '';
  }
}
function shirt(style, c, skin) {
  const body = 'M10 100 Q12 80 36 77 L64 77 Q88 80 90 100Z';
  const B = `<path d="${body}" fill="${c}"/>`;
  const neck = d => `<path d="${d}" fill="${skin}"/><path d="${d}" fill="#000" opacity=".1"/>`;
  switch (style) {
    case 1: return B + neck('M39 77 L50 93 L61 77Z');
    case 2: return B + neck('M40 77 Q50 86 60 77Z') + `<path d="M38 76 L47 89 L50 79Z M62 76 L53 89 L50 79Z" fill="#fff" fill-opacity=".88" stroke="#0004" stroke-width=".8"/><path d="M50 80 V97" stroke="#0004"/><circle cx="50" cy="86" r="1.1" fill="#0006"/><circle cx="50" cy="92" r="1.1" fill="#0006"/>`;
    case 3: { const sc = c === '#f5f5f5' ? '#b0b0b0' : c;
      return `<path d="${body}" fill="#fff"/><clipPath id="shc"><path d="${body}"/></clipPath><g clip-path="url(#shc)" fill="${sc}"><rect x="0" y="82" width="100" height="5"/><rect x="0" y="92" width="100" height="5"/></g>` + neck('M40 77 Q50 87 60 77Z'); }
    case 4: return `<path d="${body}" fill="${skin}"/><path d="${body}" fill="#000" opacity=".07"/><path d="M27 100 L31 82 Q34 77 41 77 Q50 91 59 77 Q66 77 69 82 L73 100Z" fill="${c}"/>`;
    case 5: return B + `<path d="M33 78 Q50 68 67 78 Q73 92 50 97 Q27 92 33 78Z" fill="${c}"/><path d="M33 78 Q50 68 67 78 Q73 92 50 97 Q27 92 33 78Z" fill="#000" opacity=".17"/>` + neck('M41 77 Q50 88 59 77Z') + `<path d="M45 88 V99 M55 88 V99" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`;
    case 6: return B + neck('M42 76 L50 90 L58 76Z') + `<path d="M37 76 L50 92 L63 76 L58 73 L50 81 L42 73Z" fill="#fff" stroke="#0004" stroke-width=".8"/><path d="M50 92 V100" stroke="#0004"/><circle cx="50" cy="96" r="1.1" fill="#0006"/>`;
    case 7: return B + neck('M40 77 Q50 87 60 77Z') + `<path d="M41 86 L59 86 L50 99Z" fill="#f4c430" stroke="#d98a3d" stroke-width="1.5" stroke-linejoin="round"/><circle cx="48" cy="90.5" r="1.8" fill="#d32f2f"/><circle cx="53" cy="92.5" r="1.6" fill="#d32f2f"/>`;
    default: return B + neck('M39 77 Q50 89 61 77Z');
  }
}

export function avatarSVG(a, size = 64, bg = '#ffe3b3') {
  const skin = SKIN[a.skin] ?? SKIN[1];
  const hc = HAIRC[a.hairColor] ?? HAIRC[1];
  const [hb, hf] = hair(a.hair, hc);
  const le = ears(a.ears, skin);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">` +
    (bg ? `<circle cx="50" cy="50" r="50" fill="${bg}"/>` : '') +
    `<clipPath id="avc"><circle cx="50" cy="50" r="50"/></clipPath><g clip-path="url(#avc)">` +
    hb + `<rect x="42" y="68" width="16" height="16" fill="${skin}"/><rect x="42" y="68" width="16" height="16" fill="#000" opacity=".08"/>` +
    shirt(a.shirt || 0, SHIRTC[a.shirtColor ?? 0] ?? SHIRTC[0], skin) + le + mir(le) +
    `<ellipse cx="50" cy="52" rx="26" ry="29" fill="${skin}"/>` +
    `<circle cx="35" cy="62" r="4.5" fill="#ff6b6b" opacity=".22"/><circle cx="65" cy="62" r="4.5" fill="#ff6b6b" opacity=".22"/>` +
    `<path d="M34 43 Q40 39.5 46 42.5 M54 42.5 Q60 39.5 66 43" stroke="#2b1d14" stroke-opacity=".6" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
    eyes(a.eyes) + nose(a.nose) + mouth(a.mouth) + glasses(a.glasses) + hf + hat(a.hat) +
    `</g></svg>`;
}
