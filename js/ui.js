// Shared bits: sounds, toy cards, pop-ups, toasts, confetti.
import { TOYS, RARITY, CATS } from './data.js';
import { toySVG, coinSVG } from './art.js';
import { store, save } from './state.js';

export const $ = (sel, root = document) => root.querySelector(sel);
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const router = { go: () => {}, cleanup: null };
export const actions = {};

// ---------- sound (made in code, no files) ----------
let ctx = null;
function tone(freq, dur, type = 'sine', vol = 0.15, slideTo = null, when = 0) {
  if (store.mute) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime + when, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
  } catch { /* no sound available */ }
}
export const sfx = {
  squish: () => { tone(320, 0.12, 'sine', 0.18, 140); tone(180, 0.16, 'triangle', 0.1, 420, 0.1); },
  pop: () => tone(700 + Math.random() * 300, 0.07, 'sine', 0.2, 200),
  tap: () => tone(520, 0.05, 'triangle', 0.1),
  note: (f) => tone(f, 0.25, 'triangle', 0.16),
  coin: () => { tone(988, 0.08, 'square', 0.06); tone(1319, 0.18, 'square', 0.06, null, 0.08); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.14, null, i * 0.1)),
  no: () => tone(220, 0.22, 'sawtooth', 0.07, 150),
  whoosh: () => tone(200, 0.3, 'sine', 0.1, 900),
};
export function toggleMute() { store.mute = !store.mute; save(); if (!store.mute) sfx.tap(); }

// ---------- toy cards ----------
export function toyCard(id, o = {}) {
  const t = TOYS[id];
  const locked = o.locked ? ' locked' : '';
  const label = o.locked ? 'Not found yet' : `${t.name}, ${RARITY[t.r].name} ${CATS[t.cat].one}${o.count > 1 ? ', you have ' + o.count : ''}`;
  return `<button class="toy r-${t.r}${locked} ${o.cls || ''}" ${o.act ? `data-act="${o.act}"` : ''} data-id="${id}" ${o.extra || ''} aria-label="${esc(label)}" ${o.disabled ? 'disabled' : ''}>
    <span class="toy-art">${toySVG(id)}</span>
    <span class="toy-name">${o.locked ? '???' : esc(t.name)}</span>
    ${o.locked ? '' : `<span class="toy-rar">${RARITY[t.r].name}</span>`}
    ${o.count > 1 ? `<span class="toy-count">x${o.count}</span>` : ''}
    ${o.tag ? `<span class="toy-tag">${o.tag}</span>` : ''}
  </button>`;
}
export const coins = (n) => `<span class="coins">${coinSVG}<b>${n}</b></span>`;

// ---------- toast ----------
export function toast(html, ms = 2600) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = html;
  $('#toasts').append(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, ms);
}

// ---------- modal ----------
let lastFocus = null, onCloseFn = null;
export function modal(html, o = {}) {
  const root = $('#modal');
  lastFocus = lastFocus || document.activeElement;
  onCloseFn = o.onClose || null;
  root.innerHTML = `<div class="modal-back" ${o.sticky ? '' : 'data-act="closeModal"'}></div>
    <div class="modal-card ${o.cls || ''}" role="dialog" aria-modal="true" aria-label="${esc(o.label || 'Pop-up')}">
      ${o.sticky ? '' : '<button class="modal-x" data-act="closeModal" aria-label="Close">&times;</button>'}${html}</div>`;
  root.hidden = false;
  const f = root.querySelector('[autofocus], .btn, button:not(.modal-x)');
  if (f) f.focus({ preventScroll: true });
}
export function closeModal() {
  const root = $('#modal');
  if (root.hidden) return;
  root.hidden = true; root.innerHTML = '';
  const fn = onCloseFn; onCloseFn = null;
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  lastFocus = null;
  if (fn) fn();
}

// ---------- confetti ----------
export function confetti(n = 36) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = $('#confetti');
  const cols = ['#FF8FC0', '#FFD84A', '#8ED3FF', '#9BD84A', '#C9A8FF', '#FF9A3D'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    s.style.cssText = `left:${Math.random() * 100}%;background:${cols[i % 6]};animation-delay:${Math.random() * 0.4}s;animation-duration:${1.4 + Math.random()}s;transform:rotate(${Math.random() * 360}deg)`;
    box.append(s);
    setTimeout(() => s.remove(), 2800);
  }
}

export function prize(title, body, toyId) {
  sfx.win(); confetti();
  modal(`<div class="prize"><h2>${title}</h2>${toyId ? `<div class="prize-toy squish" data-squish>${toySVG(toyId)}</div><p class="prize-name">${esc(TOYS[toyId].name)} <span class="pill r-${TOYS[toyId].r}">${RARITY[TOYS[toyId].r].name}</span></p>` : ''}
    <div class="prize-body">${body}</div><button class="btn primary" data-act="closeModal">Yay!</button></div>`, { label: title });
}
