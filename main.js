import './style.css';
import iconUrl from './icon.png';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Share } from '@capacitor/share';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, update, push, remove, onValue, runTransaction } from 'firebase/database';
import { firebaseConfig } from './firebase-config.js';
import { avatarSVG, randomAvatar, defaultAvatar, COUNTS, LABELS, EDIT_ORDER, colorOf } from './avatar.js';
import { makeStory, makeReport, shareImage, fmt } from './report.js';

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rid = (n = 8) => Array.from({ length: n }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
const genCode = () => Array.from({ length: 5 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
const plural = n => (n === 1 ? 'fatia' : 'fatias');
const MERGE_MS = 10000, HOLD_MS = 550;

// ---------- perfil ----------
let profile = JSON.parse(localStorage.getItem('rodizio.profile') || 'null') || { uid: 'u_' + rid(10), name: '', avatar: defaultAvatar(), photo: null };
const saveProfile = () => localStorage.setItem('rodizio.profile', JSON.stringify(profile));

// ---------- firebase ----------
const configured = !Object.values(firebaseConfig).some(v => String(v).includes('COLE_AQUI'));
let db, offset = 0;
if (configured) {
  db = getDatabase(initializeApp(firebaseConfig));
  onValue(ref(db, '.info/serverTimeOffset'), s => { offset = s.val() || 0; });
}
const now = () => Date.now() + offset;
const R = p => ref(db, `rooms/${S.code}${p ? '/' + p : ''}`);

// ---------- estado ----------
const S = { screen: profile.name ? 'home' : 'profile', code: null, room: null, detailId: null, back: 'home', edit: null, pop: null };
let unsub = null, prevSl = null, prevMem = null, press = null, pendingRender = false;
if (S.screen === 'profile') S.edit = { target: 'self', name: '', avatar: defaultAvatar(), photo: null, first: true, from: 'home' };

// ---------- dados ----------
const members = r => Object.entries(r.members || {}).map(([id, m]) => ({ id, ...m })).sort((a, b) => a.joinedAt - b.joinedAt);
const eventsOf = (r, mid) => Object.entries(r.slices || {}).filter(([, e]) => e.memberId === mid).map(([id, e]) => ({ id, ...e })).sort((a, b) => a.ts - b.ts);
function statsOf(r, m) {
  const evs = eventsOf(r, m.id); let prev = m.joinedAt, n = 0; const rows = [];
  for (const e of evs) { rows.push({ from: n + 1, count: e.count, gap: e.ts - prev }); prev = e.ts; n += e.count; }
  const per = rows.map(x => x.gap / x.count);
  return { ...m, total: n, rows, last: evs.length ? evs[evs.length - 1].lastTap || evs[evs.length - 1].ts : null,
    pace: n ? (prev - m.joinedAt) / n : null, fast: per.length ? Math.min(...per) : null, slow: per.length ? Math.max(...per) : null };
}
const ranking = r => members(r).map(m => statsOf(r, m)).sort((a, b) => b.total - a.total || (a.pace ?? 1e15) - (b.pace ?? 1e15));
const totalOf = r => Object.values(r.slices || {}).reduce((s, e) => s + e.count, 0);
const isLeader = () => S.room && S.room.leaderId === profile.uid;

// ---------- toast / modal ----------
function toast(key, text, kind = '') {
  const box = $('#toasts'); let el = [...box.children].find(c => c.dataset.k === key);
  if (!el) { el = document.createElement('div'); el.dataset.k = key; box.prepend(el); }
  el.className = 'toast ' + kind; el.textContent = text;
  clearTimeout(el._t); el._t = setTimeout(() => el.remove(), 4500);
  while (box.children.length > 4) box.lastChild.remove();
}
const modal = html => { $('#modal').innerHTML = `<div class="sheet">${html}</div>`; $('#modal').classList.add('on'); };
const closeModal = () => { $('#modal').classList.remove('on'); $('#modal').innerHTML = ''; };
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });

// ---------- foto da galeria ----------
function pickPhoto() {
  return new Promise(res => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = () => {
      const f = inp.files && inp.files[0]; if (!f) return res(null);
      const url = URL.createObjectURL(f), img = new Image();
      img.onload = () => {
        const s = 256, cv = document.createElement('canvas'); cv.width = cv.height = s;
        const m = Math.min(img.width, img.height);
        cv.getContext('2d').drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, s, s);
        URL.revokeObjectURL(url); res(cv.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => res(null); img.src = url;
    };
    inp.click();
  });
}

// ---------- sala ----------
function stopListen() { if (unsub) unsub(); unsub = null; prevSl = prevMem = null; }
function listenRoom(code) {
  stopListen(); S.code = code; S.room = null; localStorage.setItem('rodizio.room', code);
  unsub = onValue(ref(db, 'rooms/' + code), snap => {
    const r = snap.val();
    if (!r) { toast('x', 'Essa sala não existe mais', 'rm'); leaveRoom(); return; }
    if (!r.finished && !(r.members || {})[profile.uid]) { toast('x', 'Você foi removido da sala', 'rm'); leaveRoom(); return; }
    diff(r); S.room = r;
    if (S.screen === 'detail' && !(r.members || {})[S.detailId]) S.screen = r.finished ? 'results' : 'room';
    if (r.finished && S.screen === 'room') S.screen = 'results';
    render();
  });
}
function diff(r) {
  const sl = r.slices || {}, mem = r.members || {};
  if (prevSl && !r.finished) {
    const nm = id => (mem[id] || prevMem[id] || {}).name || 'Alguém';
    for (const [id, e] of Object.entries(sl)) {
      const p = prevSl[id];
      if (!p || e.count > p.count) { toast(e.memberId, `🍕 ${nm(e.memberId)} adicionou ${e.count} ${plural(e.count)}`); S.pop = e.memberId; }
      else if (e.count < p.count) { toast(e.memberId, `➖ ${nm(e.memberId)} removeu 1 fatia`, 'rm'); S.pop = e.memberId; }
    }
    for (const [id, p] of Object.entries(prevSl)) if (!sl[id] && mem[p.memberId]) toast(p.memberId, `➖ ${nm(p.memberId)} removeu 1 fatia`, 'rm');
    for (const id in mem) if (!prevMem[id]) toast('j' + id, `👋 ${mem[id].name} entrou na sala`, 'in');
    for (const id in prevMem) if (!mem[id]) toast('d' + id, `🚪 ${prevMem[id].name} foi removido(a)`, 'rm');
  }
  prevSl = sl; prevMem = mem;
}
const memberObj = () => ({ name: profile.name, avatar: profile.avatar, photo: profile.photo || null, joinedAt: now(), manual: false });

async function createRoom() {
  if (!configured) return;
  for (let i = 0; i < 10; i++) {
    const code = genCode(); const s = await get(ref(db, 'rooms/' + code));
    if (s.exists()) continue;
    await set(ref(db, 'rooms/' + code), { leaderId: profile.uid, createdAt: now(), finished: false, members: { [profile.uid]: memberObj() } });
    return enter(code);
  }
}
async function joinRoom(raw) {
  const code = (raw || '').trim().toUpperCase();
  if (code.length < 3) return toast('x', 'Digite o código da sala', 'rm');
  let s; try { s = await get(ref(db, 'rooms/' + code)); } catch (e) { return toast('x', 'Sem conexão com a internet', 'rm'); }
  if (!s.exists()) return toast('x', 'Sala não encontrada. Confira o código.', 'rm');
  const r = s.val(), mine = (r.members || {})[profile.uid];
  if (!mine && !r.finished) await set(ref(db, `rooms/${code}/members/${profile.uid}`), memberObj());
  else if (mine && !mine.edited) await update(ref(db, `rooms/${code}/members/${profile.uid}`), { name: profile.name, avatar: profile.avatar, photo: profile.photo || null });
  enter(code);
}
function enter(code) { S.screen = 'room'; listenRoom(code); render(); }
function leaveRoom(forget = true) {
  stopListen(); S.code = null; S.room = null; S.screen = 'home';
  if (forget) localStorage.removeItem('rodizio.room'); render();
}

async function addSlice(mid) {
  const r = S.room; if (!r || r.finished) return;
  const t = now(), last = eventsOf(r, mid).pop(); navigator.vibrate?.(25);
  if (last && t - (last.lastTap || last.ts) < MERGE_MS) await runTransaction(R(`slices/${last.id}`), cur => (cur ? { ...cur, count: cur.count + 1, lastTap: t } : cur));
  else await set(push(R('slices')), { memberId: mid, ts: t, lastTap: t, count: 1, by: profile.uid });
}
async function removeSlice(mid) {
  const r = S.room; if (!r || r.finished) return; const last = eventsOf(r, mid).pop(); if (!last) return;
  if (last.count > 1) await runTransaction(R(`slices/${last.id}`), cur => (cur ? { ...cur, count: cur.count - 1 } : cur));
  else await remove(R(`slices/${last.id}`));
}

// ---------- telas ----------
const pic = (m, s = 56) => (m.photo ? `<img class="ph" src="${m.photo}" style="width:${s}px;height:${s}px" alt="">` : avatarSVG(m.avatar || defaultAvatar(), s));
function render() {
  if (press) { pendingRender = true; return; }
  const f = { home, profile: editor, room, results, detail }[S.screen];
  $('#app').innerHTML = configured ? f() : setup();
}
const setup = () => `<div class="setup"><h2>⚙️ Falta configurar o Firebase</h2>Abra <b>firebase-config.js</b> e cole os dados do seu projeto Firebase. Depois é só gerar o APK de novo.</div>`;

function home() {
  const saved = localStorage.getItem('rodizio.room');
  return `<div class="pad home">
    <div class="hbar"><div class="me-chip" data-a="editSelf">${pic(profile, 40)} ${esc(profile.name)} ✏️</div></div>
    <img class="logo" src="${iconUrl}" alt="">
    <h1>Rodízio</h1><p>Conte as fatias da galera 🍕</p>
    ${saved ? `<button class="primary" data-a="resume" style="margin:8px 0">↩ Voltar para a sala ${esc(saved)}</button>` : ''}
    <div class="panel"><label>Entrar numa sala</label>
      <input id="code" class="inp" maxlength="6" placeholder="CÓDIGO" autocapitalize="characters" autocomplete="off">
      <button class="primary" data-a="join">Entrar na sala</button></div>
    <div class="or">ou</div>
    <button class="secondary" data-a="create">➕ Criar nova sala</button></div>`;
}

function editor() {
  const d = S.edit;
  const title = d.first ? 'Crie seu perfil' : d.target === 'new' ? 'Nova pessoa' : d.target === 'self' ? 'Seu perfil' : 'Editar participante';
  const cats = EDIT_ORDER.map(k => {
    const opts = Array.from({ length: COUNTS[k] }, (_, i) => {
      const sel = d.avatar[k] === i ? ' sel' : '';
      if (k === 'skin' || k === 'hairColor' || k === 'shirtColor') return `<button class="opt sw${sel}" data-a="opt" data-k="${k}" data-i="${i}" style="background:${colorOf(k, i)}"></button>`;
      if ((k === 'hat' || k === 'glasses') && i === 0) return `<button class="opt none${sel}" data-a="opt" data-k="${k}" data-i="0">🚫</button>`;
      return `<button class="opt${sel}" data-a="opt" data-k="${k}" data-i="${i}">${avatarSVG({ ...d.avatar, [k]: i }, 48)}</button>`;
    }).join('');
    return `<div class="cat"><h4>${LABELS[k]}</h4><div class="opts">${opts}</div></div>`;
  }).join('');
  return `<div class="top">${d.first ? '' : '<button class="ib" data-a="backEdit">‹</button>'}<div class="t"><b>${title}</b></div>${d.photo ? '' : '<button class="ib" data-a="rand">🎲</button>'}</div>
  <div class="pad"><div class="pv">${pic(d, 150)}</div>
  <div class="btnrow"><button class="ghost" data-a="photo">📷 Foto da galeria</button>${d.photo ? '<button class="ghost" data-a="nophoto">🙂 Usar avatar</button>' : ''}</div>
  <input id="pname" class="inp" maxlength="16" placeholder="Nome" value="${esc(d.name)}">
  ${d.photo ? '' : cats}<button class="primary" data-a="saveEdit" style="margin-top:8px">${d.target === 'new' ? 'Adicionar à sala' : 'Salvar'}</button></div>`;
}

function ago(t) { if (!t) return 'ainda sem fatias'; return now() - t < 60000 ? 'última: agora há pouco' : `última: há ${fmt(now() - t)}`; }
function room() {
  const r = S.room; if (!r) return `<div class="top"><button class="ib" data-a="home">‹</button><div class="t"><b>Conectando…</b></div></div>`;
  const rk = members(r).map(m => statsOf(r, m)); const max = Math.max(...rk.map(x => x.total));
  const cards = rk.map(m => {
    const tag = [m.id === r.leaderId ? '👑 líder' : '', m.manual ? 'adicionado pelo líder' : '', m.id === profile.uid ? 'você' : ''].filter(Boolean).join(' · ');
    return `<div class="card ${m.id === profile.uid ? 'me' : ''}">
      <div class="av" data-a="detail" data-id="${m.id}">${pic(m, 56)}</div>
      <div class="info"><b>${esc(m.name)}${max > 0 && m.total === max ? ' 🔥' : ''}</b><small>${tag ? tag + '<br>' : ''}${ago(m.last)}</small></div>
      <div class="n ${S.pop === m.id ? 'pop' : ''}">${m.total}<i>${plural(m.total)}</i></div>
      <button class="tap" data-hold="${m.id}">🍕<small>+1</small></button></div>`;
  }).join('');
  S.pop = null;
  return `<div class="top"><button class="ib" data-a="home">‹</button>
    <div class="t"><b>Sala ${esc(S.code)}</b><small>${totalOf(r)} ${plural(totalOf(r))} · ${rk.length} pessoas</small></div>
    <button class="ib" data-a="shareCode">📤</button></div>
  <div class="pad"><div class="hint">Toque = +1 fatia · Segure = −1 fatia · Toque no rosto para ver o detalhe${isLeader() ? ' ou editar/excluir' : ''}</div>${cards}</div>
  ${isLeader() ? `<div class="foot"><button class="add" data-a="addPerson">➕ Adicionar pessoa</button><button class="fin" data-a="finish">🏁 Finalizar</button></div>` : ''}`;
}

function results() {
  const r = S.room; if (!r) return '';
  const rk = ranking(r), top = rk.slice(0, 3);
  const order = [top[1], top[0], top[2]].map((p, i) => p && { p, pos: [2, 1, 3][i], h: [90, 130, 65][i], c: ['#cfd8dc', '#ffd54a', '#e0a070'][i] }).filter(Boolean);
  const pod = order.map(o => `<div class="pod">${o.pos === 1 ? '<div style="font-size:26px">👑</div>' : ''}<div style="display:flex;justify-content:center">${pic(o.p, o.pos === 1 ? 96 : 76)}</div><b>${esc(o.p.name)}</b>
    <div class="blk" style="height:${o.h}px;background:${o.c}">${o.pos}º<small>${o.p.total} 🍕</small></div></div>`).join('');
  const list = rk.map((p, i) => `<button class="rk" data-a="detail" data-id="${p.id}"><span class="pos">${i + 1}º</span>${pic(p, 44)}
    <span class="nm"><b>${esc(p.name)}</b><small>pace médio: ${p.total ? fmt(p.pace) : '—'}</small></span><span class="cn">${p.total}</span></button>`).join('');
  return `<div class="top"><button class="ib" data-a="leave">‹</button><div class="t"><b>🏁 Rodízio finalizado</b><small>Sala ${esc(S.code)} · ${totalOf(r)} fatias no total</small></div></div>
  <div class="pad"><div class="podium">${pod}</div>
    <button class="primary" data-a="story" style="margin-bottom:10px">📸 Imagem pro Story</button>
    <button class="secondary" data-a="report" style="margin-bottom:16px">📄 Relatório com todos</button>${list}</div>`;
}

function detail() {
  const r = S.room, m = r && (r.members || {})[S.detailId]; if (!m) return '';
  const s = statsOf(r, { id: S.detailId, ...m });
  const rows = s.rows.map(x => `<div class="ev"><span>🍕 ${x.count > 1 ? `${x.count} fatias (nº ${x.from}–${x.from + x.count - 1})` : `Fatia nº ${x.from}`}${x.from === 1 ? '<br><small>desde que entrou</small>' : ''}</span>
    <b>${x.count > 1 ? 'no tempo de ' : ''}${fmt(x.gap)}</b></div>`).join('');
  const mine = S.detailId === profile.uid;
  const tools = isLeader()
    ? `<div class="btnrow"><button class="ghost" data-a="editMember" data-id="${S.detailId}">✏️ Editar</button>${S.detailId !== r.leaderId && !r.finished ? `<button class="ghost danger" data-a="delMember" data-id="${S.detailId}">🗑 Excluir</button>` : ''}</div>`
    : mine ? `<div class="btnrow"><button class="ghost" data-a="editSelf">✏️ Editar meu perfil</button></div>` : '';
  return `<div class="top"><button class="ib" data-a="back">‹</button><div class="t"><b>${esc(m.name)}</b><small>Detalhe individual</small></div></div>
  <div class="pad"><div class="pv">${pic(m, 110)}</div><div class="big">${s.total} ${plural(s.total)}</div>${tools}
  <div class="stats"><div><b>${s.total ? fmt(s.pace) : '—'}</b><small>pace médio</small></div><div><b>${fmt(s.fast)}</b><small>mais rápida</small></div><div><b>${fmt(s.slow)}</b><small>mais lenta</small></div></div>
  ${rows || '<div class="center">Nenhuma fatia ainda 🍕</div>'}</div>`;
}

// ---------- ações ----------
async function image(kind) {
  const r = S.room, rk = ranking(r);
  const data = { code: S.code, date: new Date(r.finishedAt || Date.now()).toLocaleDateString('pt-BR'), total: totalOf(r), ranking: rk };
  toast('img', '🎨 Gerando imagem…', 'in');
  const cv = await (kind === 'story' ? makeStory(data) : makeReport(data));
  $('#toasts').innerHTML = '';
  window._cv = cv; window._nm = `rodizio-${kind}-${S.code}.png`;
  modal(`<h3>${kind === 'story' ? 'Story do ranking' : 'Relatório'}</h3><img src="${cv.toDataURL('image/png')}"><div class="row2"><button class="ghost" data-a="closeModal">Fechar</button><button class="primary" data-a="shareImg">Compartilhar / salvar</button></div>`);
}
const startEdit = (target, from) => {
  if (target === 'new') S.edit = { target, name: '', avatar: defaultAvatar(), photo: null, first: false, from };
  else if (target === 'self') S.edit = { target, name: profile.name, avatar: { ...defaultAvatar(), ...profile.avatar }, photo: profile.photo || null, first: false, from };
  else { const m = S.room.members[target]; S.edit = { target, name: m.name, avatar: { ...defaultAvatar(), ...(m.avatar || {}) }, photo: m.photo || null, first: false, from }; }
  S.screen = 'profile'; render();
};
const A = {
  home() { S.screen = 'home'; render(); },
  editSelf() { startEdit('self', S.screen); },
  addPerson() { startEdit('new', 'room'); },
  editMember(d) { d.id === profile.uid ? startEdit('self', 'detail') : startEdit(d.id, 'detail'); },
  rand() { S.edit.avatar = randomAvatar(); render(); },
  opt(d) { S.edit.avatar[d.k] = +d.i; render(); },
  async photo() { const p = await pickPhoto(); if (p) { S.edit.photo = p; render(); } },
  nophoto() { S.edit.photo = null; render(); },
  backEdit() { S.screen = S.edit.from; render(); },
  async saveEdit() {
    const d = S.edit, name = d.name.trim(); if (!name) return toast('x', 'Escolha um nome', 'rm');
    const data = { name, avatar: d.avatar, photo: d.photo || null };
    try {
      if (d.target === 'self') {
        profile = { ...profile, ...data }; saveProfile();
        if (S.code && S.room?.members?.[profile.uid]) await update(R(`members/${profile.uid}`), { ...data, edited: false });
        S.screen = d.first ? 'home' : d.from;
      } else if (d.target === 'new') {
        await set(R(`members/m_${rid(8)}`), { ...data, joinedAt: now(), manual: true, addedBy: profile.uid }); S.screen = 'room';
      } else { await update(R(`members/${d.target}`), { ...data, edited: true }); S.screen = 'detail'; }
    } catch (e) { return toast('x', 'Não foi possível salvar. Verifique a internet.', 'rm'); }
    render();
  },
  delMember(d) {
    const m = S.room.members[d.id];
    modal(`<h3>Excluir ${esc(m.name)}?</h3><p style="margin:0 0 10px;font-weight:600">A pessoa e todas as fatias dela serão removidas da sala.</p><div class="row2"><button class="ghost" data-a="closeModal">Cancelar</button><button class="primary" data-a="confirmDel" data-id="${d.id}">Excluir</button></div>`);
  },
  async confirmDel(d) {
    closeModal(); const up = { ['members/' + d.id]: null };
    for (const e of eventsOf(S.room, d.id)) up['slices/' + e.id] = null;
    await update(R(''), up); S.screen = 'room'; render();
  },
  create() { createRoom().catch(() => toast('x', 'Erro ao criar a sala. Verifique a internet.', 'rm')); },
  join() { joinRoom($('#code').value); },
  resume() { joinRoom(localStorage.getItem('rodizio.room')); },
  leave() { leaveRoom(true); },
  detail(d) { S.back = S.screen; S.detailId = d.id; S.screen = 'detail'; render(); },
  back() { S.screen = S.back; render(); },
  async shareCode() {
    const text = `Entra no meu rodízio! 🍕 Código da sala: ${S.code} (app Rodízio)`;
    try { await Share.share({ text }); } catch { navigator.clipboard?.writeText(text); toast('x', 'Código copiado', 'in'); }
  },
  finish() { modal(`<h3>Finalizar o rodízio?</h3><p style="margin:0 0 10px;font-weight:600">Todos vão ver o resultado final e o ranking.</p><div class="row2"><button class="ghost" data-a="closeModal">Voltar</button><button class="primary" data-a="confirmFinish">Finalizar</button></div>`); },
  async confirmFinish() { closeModal(); await update(R(''), { finished: true, finishedAt: now() }); },
  story() { image('story'); }, report() { image('report'); },
  async shareImg() { try { await shareImage(window._cv, window._nm); } catch (e) { toast('x', 'Não foi possível compartilhar', 'rm'); } },
  closeModal
};
document.addEventListener('click', e => { const el = e.target.closest('[data-a]'); if (el) A[el.dataset.a]?.(el.dataset); });
document.addEventListener('input', e => { if (e.target.id === 'pname' && S.edit) S.edit.name = e.target.value; });

// toque = +1 · segurar = −1
document.addEventListener('pointerdown', e => {
  const b = e.target.closest('[data-hold]'); if (!b) return;
  const id = b.dataset.hold; press = { id, fired: false };
  press.t = setTimeout(() => { press.fired = true; navigator.vibrate?.([40, 30, 40]); removeSlice(id); }, HOLD_MS);
});
const endPress = ok => {
  if (!press) return; clearTimeout(press.t);
  const p = press; press = null;
  if (ok && !p.fired) addSlice(p.id);
  if (pendingRender) { pendingRender = false; render(); }
};
document.addEventListener('pointerup', () => endPress(true));
document.addEventListener('pointercancel', () => endPress(false));
document.addEventListener('contextmenu', e => e.preventDefault());

// ---------- inicialização ----------
setInterval(() => { if (S.screen === 'room' && !press) render(); }, 30000);
if (Capacitor.isNativePlatform()) CapApp.addListener('backButton', () => {
  if ($('#modal').classList.contains('on')) return closeModal();
  if (S.screen === 'detail') return A.back();
  if (S.screen === 'profile') return S.edit.first ? CapApp.exitApp() : A.backEdit();
  if (S.screen === 'room' || S.screen === 'results') return A.home();
  CapApp.exitApp();
});
render();
