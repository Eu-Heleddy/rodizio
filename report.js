import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { avatarSVG } from './avatar.js';

export function fmt(ms) {
  if (ms == null || isNaN(ms)) return '—';
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60), r = s % 60;
  if (m < 60) return r ? `${m} min ${r} s` : `${m} min`;
  const h = Math.floor(m / 60);
  return `${h} h ${String(m % 60).padStart(2, '0')} min`;
}

const svgImg = svg => new Promise(res => {
  const i = new Image();
  i.onload = () => res(i);
  i.onerror = () => res(null);
  i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
});
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); };
function fit(c, t, max) {
  if (c.measureText(t).width <= max) return t;
  while (t.length > 1 && c.measureText(t + '…').width > max) t = t.slice(0, -1);
  return t + '…';
}
function pizzaPattern(c, w, h, alpha) {
  c.save(); c.globalAlpha = alpha; c.font = '64px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const em = ['🍕', '🧀', '🍅', '🌿', '🍄'];
  let n = 0;
  for (let y = 70; y < h; y += 190) for (let x = (n % 2 ? 130 : 40); x < w + 60; x += 260) { c.save(); c.translate(x, y); c.rotate(((n * 37) % 50 - 25) * Math.PI / 180); c.fillText(em[n % em.length], 0, 0); c.restore(); n++; }
  c.restore();
}
async function drawAvatar(c, a, x, y, s) {
  const img = await svgImg(avatarSVG(a, 256, '#ffe3b3'));
  c.save(); c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 18; c.shadowOffsetY = 6;
  c.beginPath(); c.arc(x + s / 2, y + s / 2, s / 2, 0, 7); c.fillStyle = '#ffe3b3'; c.fill(); c.restore();
  if (img) c.drawImage(img, x, y, s, s);
  c.lineWidth = 6; c.strokeStyle = '#fff'; c.beginPath(); c.arc(x + s / 2, y + s / 2, s / 2, 0, 7); c.stroke();
}
const mk = (w, h) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return [cv, cv.getContext('2d')]; };

// ---------- Story (1080x1920) ----------
export async function makeStory({ code, date, total, ranking }) {
  const [cv, c] = mk(1080, 1920);
  const g = c.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#ff4a3d'); g.addColorStop(1, '#7d1212');
  c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
  pizzaPattern(c, 1080, 1920, .13);
  c.textAlign = 'center'; c.fillStyle = '#fff';
  c.font = '900 130px system-ui, sans-serif'; c.fillText('🍕 RODÍZIO', 540, 200);
  c.font = '600 50px system-ui, sans-serif'; c.fillStyle = '#ffe9b0'; c.fillText('Ranking de fatias', 540, 275);
  c.font = '500 38px system-ui, sans-serif'; c.fillStyle = 'rgba(255,255,255,.85)'; c.fillText(date, 540, 335);

  const base = 1130, medals = [{ c: '#ffd54a', h: 340, s: 290, x: 540 }, { c: '#cfd8dc', h: 250, s: 220, x: 215 }, { c: '#e0a070', h: 190, s: 220, x: 865 }];
  for (let i = 0; i < 3; i++) {
    const p = ranking[i]; if (!p) continue; const m = medals[i];
    const top = base - m.h;
    c.fillStyle = m.c; rr(c, m.x - 145, top, 290, m.h, [28, 28, 0, 0]); c.fill();
    c.fillStyle = 'rgba(0,0,0,.65)'; c.textAlign = 'center';
    c.font = '900 120px system-ui, sans-serif'; c.fillText(String(i + 1), m.x, top + 130);
    c.font = '800 54px system-ui, sans-serif'; c.fillText(`${p.total} 🍕`, m.x, top + (i === 0 ? 220 : 175));
    c.fillStyle = '#fff'; c.font = '800 52px system-ui, sans-serif'; c.fillText(fit(c, p.name, 300), m.x, top - 24);
    await drawAvatar(c, p.avatar, m.x - m.s / 2, top - 24 - 60 - m.s + 10, m.s);
    if (i === 0) { c.font = '110px sans-serif'; c.fillText('👑', m.x, top - 24 - 60 - m.s + 20); }
  }
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(60, base, 960, 8);

  const rest = ranking.slice(3, 8);
  for (let i = 0; i < rest.length; i++) {
    const p = rest[i], y = 1185 + i * 100;
    c.fillStyle = 'rgba(255,255,255,.16)'; rr(c, 80, y, 920, 88, 44); c.fill();
    c.fillStyle = '#fff'; c.textAlign = 'left'; c.font = '800 44px system-ui, sans-serif'; c.fillText(`${i + 4}º`, 120, y + 60);
    await drawAvatar(c, p.avatar, 215, y + 6, 76);
    c.font = '700 44px system-ui, sans-serif'; c.fillText(fit(c, p.name, 480), 315, y + 60);
    c.textAlign = 'right'; c.fillText(`${p.total} 🍕`, 965, y + 60);
  }
  if (ranking.length > 8) { c.textAlign = 'center'; c.font = '500 36px system-ui'; c.fillStyle = '#fff'; c.fillText(`+ ${ranking.length - 8} pessoas`, 540, 1705); }
  c.textAlign = 'center'; c.fillStyle = '#fff'; c.font = '900 64px system-ui, sans-serif';
  c.fillText(`🍕 ${total} fatias no total`, 540, 1790);
  c.font = '500 36px system-ui, sans-serif'; c.fillStyle = 'rgba(255,255,255,.8)'; c.fillText(`Sala ${code} · app Rodízio`, 540, 1855);
  return cv;
}

// ---------- Relatório completo ----------
export async function makeReport({ code, date, total, ranking }) {
  const rowH = 170, H = 330 + ranking.length * rowH + 140;
  const [cv, c] = mk(1080, H);
  c.fillStyle = '#efe6d8'; c.fillRect(0, 0, 1080, H);
  pizzaPattern(c, 1080, H, .22);
  const g = c.createLinearGradient(0, 0, 0, 250); g.addColorStop(0, '#e53935'); g.addColorStop(1, '#a31515');
  c.fillStyle = g; c.fillRect(0, 0, 1080, 250);
  c.textAlign = 'center'; c.fillStyle = '#fff'; c.font = '900 84px system-ui, sans-serif'; c.fillText('🍕 Relatório do Rodízio', 540, 120);
  c.font = '500 40px system-ui, sans-serif'; c.fillStyle = '#ffe9b0'; c.fillText(`${date} · Sala ${code} · ${total} fatias`, 540, 190);
  for (let i = 0; i < ranking.length; i++) {
    const p = ranking[i], y = 290 + i * rowH;
    c.save(); c.shadowColor = 'rgba(0,0,0,.18)'; c.shadowBlur = 14; c.shadowOffsetY = 4; c.fillStyle = '#fff'; rr(c, 50, y, 980, rowH - 22, 30); c.fill(); c.restore();
    c.textAlign = 'center'; c.fillStyle = i < 3 ? ['#e0a800', '#8d98a0', '#b9773a'][i] : '#999'; c.font = '900 56px system-ui, sans-serif'; c.fillText(`${i + 1}º`, 125, y + 92);
    await drawAvatar(c, p.avatar, 195, y + 14, 120);
    c.textAlign = 'left'; c.fillStyle = '#222'; c.font = '800 46px system-ui, sans-serif'; c.fillText(fit(c, p.name, 430), 340, y + 62);
    c.fillStyle = '#6b5d50'; c.font = '500 33px system-ui, sans-serif'; c.fillText(`⏱ pace médio: ${p.total ? fmt(p.pace) : '—'}`, 340, y + 112);
    c.textAlign = 'right'; c.fillStyle = '#c62828'; c.font = '900 72px system-ui, sans-serif'; c.fillText(String(p.total), 960, y + 90);
    c.font = '500 28px system-ui, sans-serif'; c.fillStyle = '#6b5d50'; c.fillText(p.total === 1 ? 'fatia' : 'fatias', 1000, y + 125);
  }
  c.textAlign = 'center'; c.fillStyle = '#8a7a6a'; c.font = '500 34px system-ui, sans-serif'; c.fillText('Gerado pelo app Rodízio 🍕', 540, H - 60);
  return cv;
}

export async function shareImage(canvas, name) {
  const data = canvas.toDataURL('image/png');
  if (Capacitor.isNativePlatform()) {
    const r = await Filesystem.writeFile({ path: name, data: data.split(',')[1], directory: Directory.Cache });
    await Share.share({ title: 'Rodízio', files: [r.uri] });
  } else {
    const a = document.createElement('a'); a.href = data; a.download = name; a.click();
  }
}
