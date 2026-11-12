export const LABELS = { hair:'Cabelo', hairColor:'Cor do cabelo', skin:'Pele', eyes:'Olhos', nose:'Nariz', mouth:'Boca', ears:'Orelhas', shirt:'Blusa', earring:'Brinco', hat:'Chapéu' };
export const COUNTS = { hair:9, hairColor:9, skin:8, eyes:7, nose:7, mouth:7, ears:7, shirt:8, earring:8, hat:8 };
const SKIN = ['#FFE0C7','#F5C9A0','#E8B48A','#D2976B','#B97A4F','#8D5A3B','#6B4128','#4A2C1B'];
const HAIRC = ['#1b1b1b','#4a2c1b','#8b5a2b','#d9a441','#f2d27a','#c0392b','#8e44ad','#2f80ed','#bdc3c7'];
const SHIRT = ['#e63946','#1d70b8','#2a9d5c','#f4c430','#2b2b2b','#f5f5f5','stripes','pizza'];
export const colorOf = (key, i) => (key === 'skin' ? SKIN[i] : HAIRC[i]);
export const defaultAvatar = () => ({ skin:1, hairColor:1, hair:1, eyes:0, nose:0, mouth:0, ears:0, shirt:0, earring:0, hat:0 });
export function randomAvatar() {
  const a = {};
  for (const k in COUNTS) a[k] = Math.floor(Math.random() * COUNTS[k]);
  if (Math.random() < 0.5) a.hat = 0;
  if (Math.random() < 0.5) a.earring = 0;
  return a;
}

function hair(i, c) {
  const bangs = `<path d="M24 46 Q22 18 50 18 Q78 18 76 46 Q68 30 50 30 Q32 30 24 46Z" fill="${c}"/>`;
  switch (i) {
    case 1: return ['', bangs];
    case 2: return ['', `<path d="M26 42 Q28 24 50 24 Q72 24 74 42 Q66 31 50 31 Q34 31 26 42Z" fill="${c}"/>`];
    case 3: return [`<path d="M20 52 Q16 12 50 12 Q84 12 80 52 L84 94 L16 94Z" fill="${c}"/>`, bangs];
    case 4: return [`<path d="M21 52 Q18 14 50 14 Q82 14 79 52 L80 72 Q50 78 20 72Z" fill="${c}"/>`, bangs];
    case 5: return ['', `<path d="M24 46 L24 20 L35 32 L42 10 L50 29 L58 10 L65 32 L76 20 L76 46 Q66 31 50 31 Q34 31 24 46Z" fill="${c}"/>`];
    case 6: return [`<circle cx="50" cy="38" r="34" fill="${c}"/>`, `<path d="M25 46 Q28 28 50 28 Q72 28 75 46 Q66 36 50 36 Q34 36 25 46Z" fill="${c}"/>`];
    case 7: return [`<circle cx="50" cy="11" r="10" fill="${c}"/>`, bangs];
    case 8: return ['', `<path d="M42 32 Q40 6 50 2 Q60 6 58 32Z" fill="${c}"/><path d="M28 40 Q32 30 42 30 L58 30 Q68 30 72 40 Q64 34 50 34 Q36 34 28 40Z" fill="${c}"/>`];
    default: return ['', ''];
  }
}
function ear(t, s) {
  const f = `fill="${s}"`;
  switch (t) {
    case 1: return `<circle cx="24" cy="53" r="7" ${f}/><circle cx="24" cy="53" r="3.5" fill="#000" opacity=".1"/>`;
    case 2: return `<path d="M27 48 L10 38 L27 62Z" ${f}/>`;
    case 3: return `<circle cx="25" cy="53" r="2.8" ${f}/>`;
    case 4: return `<ellipse cx="24" cy="52" rx="4" ry="8.5" ${f}/>`;
    case 5: return `<ellipse cx="22" cy="55" rx="9" ry="5" ${f}/>`;
    case 6: return `<path d="M28 50 L16 22 L34 42Z" ${f}/>`;
    default: return `<circle cx="24" cy="53" r="4.5" ${f}/>`;
  }
}
function eyes(t) {
  const L = 40, R = 60, y = 50, k = '#222';
  const dot = (x, r = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${k}"/>`;
  const big = x => `<ellipse cx="${x}" cy="${y}" rx="5" ry="5.5" fill="#fff" stroke="${k}" stroke-width="1.5"/><circle cx="${x + 1}" cy="${y + .5}" r="2.6" fill="${k}"/>`;
  const happy = x => `<path d="M${x - 5} ${y + 2} Q${x} ${y - 6} ${x + 5} ${y + 2}" stroke="${k}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  const sleepy = x => `<path d="M${x - 5} ${y} H${x + 5}" stroke="${k}" stroke-width="3" stroke-linecap="round"/>`;
  const lash = x => dot(x) + `<path d="M${x - 5} ${y - 3} L${x - 7} ${y - 6} M${x} ${y - 5} V${y - 9} M${x + 5} ${y - 3} L${x + 7} ${y - 6}" stroke="${k}" stroke-width="1.6" stroke-linecap="round"/>`;
  const gl = x => `<circle cx="${x}" cy="${y}" r="8.5" fill="#fff" fill-opacity=".3" stroke="#333" stroke-width="2"/>`;
  switch (t) {
    case 1: return big(L) + big(R);
    case 2: return happy(L) + happy(R);
    case 3: return sleepy(L) + sleepy(R);
    case 4: return dot(L) + dot(R) + gl(L) + gl(R) + `<path d="M48.5 ${y} H51.5" stroke="#333" stroke-width="2"/>`;
    case 5: return dot(L) + sleepy(R);
    case 6: return lash(L) + lash(R);
    default: return dot(L) + dot(R);
  }
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
function star(cx, cy, r, f) {
  let p = '';
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; p += `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)} `; }
  return `<polygon points="${p}" fill="${f}"/>`;
}
function earring(t) {
  const one = x => {
    switch (t) {
      case 1: return `<circle cx="${x}" cy="64" r="4.5" fill="none" stroke="#e0b030" stroke-width="2"/>`;
      case 2: return `<circle cx="${x}" cy="59" r="2" fill="#c8ccd0"/>`;
      case 3: return `<circle cx="${x}" cy="59" r="2.2" fill="#e0b030"/>`;
      case 4: return `<path d="M${x} 59 V64" stroke="#999" stroke-width="1"/><circle cx="${x}" cy="66" r="2.8" fill="#e63946"/>`;
      case 5: return `<circle cx="${x}" cy="60" r="2.6" fill="#fff" stroke="#bbb" stroke-width=".8"/>`;
      case 6: return star(x, 63, 4.5, '#e0b030');
      case 7: return `<circle cx="${x}" cy="66" r="6.5" fill="none" stroke="#c8ccd0" stroke-width="2"/>`;
      default: return '';
    }
  };
  return t ? one(24) + one(76) : '';
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
function shirt(t) {
  const body = 'M10 100 Q12 80 36 77 L64 77 Q88 80 90 100Z';
  const c = SHIRT[t] ?? SHIRT[0];
  let s;
  if (c === 'stripes') s = `<path d="${body}" fill="#fff"/><clipPath id="shc"><path d="${body}"/></clipPath><g clip-path="url(#shc)" fill="#e63946"><rect x="0" y="82" width="100" height="5"/><rect x="0" y="92" width="100" height="5"/></g>`;
  else if (c === 'pizza') s = `<path d="${body}" fill="#c62828"/><circle cx="26" cy="90" r="3" fill="#f4c430"/><circle cx="42" cy="95" r="3" fill="#f4c430"/><circle cx="62" cy="91" r="3" fill="#f4c430"/><circle cx="78" cy="96" r="3" fill="#f4c430"/><circle cx="52" cy="86" r="2.4" fill="#5d1010"/>`;
  else s = `<path d="${body}" fill="${c}"/>`;
  return s + `<path d="M40 77 Q50 90 60 77Z" fill="#000" opacity=".12"/>`;
}

export function avatarSVG(a, size = 64, bg = '#ffe3b3') {
  const skin = SKIN[a.skin] ?? SKIN[1];
  const [hb, hf] = hair(a.hair, HAIRC[a.hairColor] ?? HAIRC[1]);
  const leftEar = ear(a.ears, skin);
  const rightEar = `<g transform="translate(100 0) scale(-1 1)">${leftEar}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">` +
    (bg ? `<circle cx="50" cy="50" r="50" fill="${bg}"/>` : '') +
    `<clipPath id="avc"><circle cx="50" cy="50" r="50"/></clipPath><g clip-path="url(#avc)">` +
    hb + `<rect x="42" y="68" width="16" height="16" fill="${skin}"/><rect x="42" y="68" width="16" height="16" fill="#000" opacity=".08"/>` +
    shirt(a.shirt) + leftEar + rightEar +
    `<ellipse cx="50" cy="52" rx="26" ry="29" fill="${skin}"/>` +
    `<circle cx="35" cy="62" r="4.5" fill="#ff6b6b" opacity=".22"/><circle cx="65" cy="62" r="4.5" fill="#ff6b6b" opacity=".22"/>` +
    eyes(a.eyes) + nose(a.nose) + mouth(a.mouth) + hf + earring(a.earring) + hat(a.hat) +
    `</g></svg>`;
}
