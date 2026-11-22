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
// A short burst of hiss. Stacked in quick bursts it sounds like crunching beads.
function hiss(dur, vol, freq, when = 0, q = 1.2) {
  if (store.mute) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const n = Math.max(1, Math.floor(ctx.sampleRate * dur)), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), t = ctx.currentTime + when;
    src.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f).connect(g).connect(ctx.destination); src.start(t);
  } catch { /* no sound available */ }
}
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
  crunch: () => { for (let i = 0; i < 7; i++) hiss(0.025 + Math.random() * 0.03, 0.3, 1500 + Math.random() * 3200, i * 0.032 + Math.random() * 0.02, 2.5); },
  squelch: () => { tone(160, 0.22, 'sine', 0.16, 70); hiss(0.18, 0.12, 500, 0.02, 0.8); tone(240, 0.12, 'sine', 0.08, 420, 0.16); },
  boing: () => { tone(180, 0.38, 'sine', 0.16, 520); tone(360, 0.3, 'triangle', 0.06, 900, 0.03); },
  whirr: () => { tone(300, 0.6, 'sawtooth', 0.045, 900); hiss(0.5, 0.05, 2400, 0, 0.7); },
  stretch: () => { tone(260, 0.3, 'sine', 0.13, 150); tone(150, 0.2, 'triangle', 0.08, 300, 0.24); },
  soft: () => { hiss(0.16, 0.16, 700, 0, 0.6); tone(220, 0.14, 'sine', 0.07, 160); },
  twinkle: () => { tone(2093, 0.09, 'sine', 0.07); tone(2637, 0.12, 'sine', 0.06, null, 0.07); tone(3136, 0.16, 'sine', 0.05, null, 0.14); },
  bomb: () => { hiss(0.4, 0.34, 260, 0, 0.6); tone(120, 0.3, 'sine', 0.2, 50); [1568, 2093, 2637, 3136, 3951].forEach((f, i) => tone(f, 0.16, 'sine', 0.06, null, 0.12 + i * 0.07)); },
  click: () => { tone(900, 0.03, 'square', 0.08); tone(1300, 0.03, 'square', 0.06, null, 0.07); },
  note: (f) => tone(f, 0.25, 'triangle', 0.16),
  coin: () => { tone(988, 0.08, 'square', 0.06); tone(1319, 0.18, 'square', 0.06, null, 0.08); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.14, null, i * 0.1)),
  no: () => tone(220, 0.22, 'sawtooth', 0.07, 150),
  whoosh: () => tone(200, 0.3, 'sine', 0.1, 900),
};
// The right sound for playing with each kind of toy.
export function playSound(style) {
  ({ crunch: sfx.crunch, pop: sfx.pop, spin: sfx.whirr, boing: sfx.boing, squelch: sfx.squelch, stretch: sfx.stretch, soft: sfx.soft, click: sfx.click }[style] || sfx.squish)();
}
export function toggleMute() { store.mute = !store.mute; save(); if (!store.mute) sfx.tap(); }

// ---------- toy cards ----------
export function toyCard(id, o = {}) {
  const t = TOYS[id];
  const locked = o.locked ? ' locked' : '';
  const label = o.locked ? 'Not found yet' : `${t.name}, ${RARITY[t.r].name} ${CATS[t.cat].one}${o.count > 1 ? ', you have ' + o.count : ''}`;
  return `<button class="toy r-${t.r}${locked}${t.big ? ' jumbo' : ''} ${o.cls || ''}" ${o.act ? `data-act="${o.act}"` : ''} data-id="${id}" ${o.extra || ''} aria-label="${esc(label)}" ${o.disabled ? 'disabled' : ''}>
    <span class="toy-art">${toySVG(id)}</span>
    <span class="toy-name">${o.locked ? '???' : esc(t.name)}</span>
    ${o.locked ? '' : `<span class="toy-rar">${RARITY[t.r].name}${t.big ? ' &middot; Jumbo' : ''}</span>`}
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

// Glitter flying out from a point on the screen.
export function glitterBurst(x, y, n = 70, power = 1) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = $('#confetti'), cols = ['#FF8FC0', '#FFD84A', '#8ED3FF', '#C9A8FF', '#FFFFFF', '#9DE7C5', '#FFB36B'];
  for (let i = 0; i < n; i++) {
    const el = document.createElement('i'), s = 5 + Math.random() * 9;
    el.className = 'glit' + (i % 3 === 0 ? ' star' : i % 3 === 1 ? ' dot' : '');
    el.style.cssText = `left:${x}px;top:${y}px;width:${s}px;height:${s}px;background:${cols[i % cols.length]}`;
    box.append(el);
    const a = Math.random() * 6.283, d = (70 + Math.random() * 280) * power, dx = Math.cos(a) * d, dy = Math.sin(a) * d - 70 * power, rot = Math.random() * 720 - 360;
    el.animate([
      { transform: 'translate(-50%, -50%) scale(0) rotate(0deg)', opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1.1) rotate(${rot}deg)`, opacity: 1, offset: 0.55 },
      { transform: `translate(calc(-50% + ${dx * 1.12}px), calc(-50% + ${dy + 150 * power}px)) scale(.5) rotate(${rot * 1.6}deg)`, opacity: 0 },
    ], { duration: 900 + Math.random() * 800, easing: 'cubic-bezier(.12, .7, .3, 1)' }).onfinish = () => el.remove();
  }
}

export function prize(title, body, toyId) {
  sfx.win(); confetti();
  if (toyId && (TOYS[toyId].fx === 'glitter' || TOYS[toyId].v === 'bomb')) { glitterBurst(innerWidth / 2, innerHeight * 0.4, 80, 1.1); sfx.twinkle(); }
  modal(`<div class="prize"><h2>${title}</h2>${toyId ? `<div class="prize-toy squish${TOYS[toyId].big ? ' jumbo' : ''}" data-squish data-toy="${toyId}">${toySVG(toyId)}</div><p class="prize-name">${esc(TOYS[toyId].name)} <span class="pill r-${TOYS[toyId].r}">${RARITY[TOYS[toyId].r].name}</span></p>` : ''}
    <div class="prize-body">${body}</div><button class="btn primary" data-act="closeModal">Yay!</button></div>`, { label: title });
}
