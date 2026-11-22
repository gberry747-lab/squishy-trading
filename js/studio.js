// Squishy Studio: draw your own squishy with a finger, Apple Pencil or mouse.
// The drawing is saved as lines (not a picture), so it stays sharp, gets the same
// puffy 3D look as every other toy, and can be squished, traded and used in games.
import { TOYS, registerCustom } from './data.js';
import { toySVG, customArt, icon } from './art.js';
import { store, save, P, addToy } from './state.js';
import { $, esc, router, actions, sfx, playSound, toast, prize } from './ui.js';

const COLORS = ['#2A1846', '#F0524F', '#FF9A3D', '#FFD84A', '#9BD84A', '#2CB5AC', '#4C8DF5', '#C9A8FF', '#FF8FC0', '#8A5A3C', '#FFFDF8'];
const NAMES = ['Ink', 'Red', 'Orange', 'Yellow', 'Green', 'Teal', 'Blue', 'Purple', 'Pink', 'Brown', 'White'];
const SIZES = [2.5, 5, 9];
const SOUNDS = [['squish', 'Squish'], ['crunch', 'Crunch'], ['pop', 'Pop'], ['boing', 'Boing'], ['squelch', 'Squelch'], ['soft', 'Soft']];
const MAX_TOYS = 60;

let S = fresh();
function fresh() { return { strokes: [], faces: [], undo: [], tool: 'pen', color: COLORS[8], w: 1, snd: 'squish', name: '', cur: null, pid: null, pencil: false }; }
const snapshot = () => { S.undo.push(JSON.stringify([S.strokes, S.faces])); if (S.undo.length > 40) S.undo.shift(); };
const def = () => ({ strokes: S.strokes, faces: S.faces });

export function studioScreen() {
  const chip = (act, val, label, on, extra = '') => `<button class="chip" data-act="${act}" data-v="${val}" aria-pressed="${on}" ${extra}>${label}</button>`;
  return `<button class="btn back" data-act="go" data-to="toys">${icon('back')} My toys</button>
    <h1>Squishy Studio</h1><p class="muted" id="st-hint">Draw your squishy big, in the middle. Close a shape and it fills with color.</p>
    <div class="studio">
      <div class="pad-wrap"><svg id="draw-pad" class="draw-pad" viewBox="0 0 100 100" role="img" aria-label="Drawing area"><g id="pad-done"></g><path id="pad-live" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="st-tools">
        <div class="st-row" role="group" aria-label="Tool">${chip('stTool', 'pen', 'Pen', S.tool === 'pen')}${chip('stTool', 'eraser', 'Eraser', S.tool === 'eraser')}${chip('stTool', 'face', 'Add a face', S.tool === 'face')}
          <button class="chip" data-act="stUndo">Undo</button><button class="chip" data-act="stClear">Clear</button></div>
        <div class="st-row" role="group" aria-label="Pen size">${SIZES.map((w, i) => `<button class="chip dot-chip" data-act="stSize" data-v="${i}" aria-pressed="${S.w === i}" aria-label="${['Thin', 'Medium', 'Thick'][i]} pen"><i style="width:${8 + i * 8}px;height:${8 + i * 8}px"></i></button>`).join('')}</div>
        <div class="st-row swatches" role="group" aria-label="Color">${COLORS.map((c, i) => `<button class="swatch" data-act="stColor" data-v="${c}" aria-pressed="${S.color === c}" aria-label="${NAMES[i]}" style="--c:${c}"></button>`).join('')}</div>
        <div class="st-row" role="group" aria-label="Sound when squished"><span class="st-label">Sound:</span>${SOUNDS.map(([k, l]) => chip('stSound', k, l, S.snd === k)).join('')}</div>
        <form class="st-row st-name" data-form="studio"><label for="st-name">Name</label><input id="st-name" name="name" maxlength="18" autocomplete="off" placeholder="My Squishy" value="${esc(S.name)}">
          <button class="btn primary big" type="submit">Make my squishy!</button></form>
      </div>
    </div>`;
}
// Draw the saved lines again after the screen is (re)built.
export function studioReady() { paint(); }
function paint() {
  const g = $('#pad-done');
  if (g) g.innerHTML = customArt({ art: def() });
}

const pad = () => $('#draw-pad');
function at(e) { const r = pad().getBoundingClientRect(); return [Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)), Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100))].map((n) => Math.round(n * 10) / 10); }
function erase(x, y) {
  const before = S.strokes.length + S.faces.length;
  S.strokes = S.strokes.filter((k) => { for (let i = 0; i < k.p.length; i += 2) if (Math.hypot(k.p[i] - x, k.p[i + 1] - y) < 3.5 + k.w / 2) return false; return true; });
  S.faces = S.faces.filter((f) => Math.hypot(f.x - x, f.y - y) > 9 * f.s);
  if (S.strokes.length + S.faces.length !== before) { paint(); sfx.tap(); }
}
function finish() {
  const k = S.cur;
  S.cur = null; S.pid = null;
  const live = $('#pad-live'); if (live) live.setAttribute('d', '');
  if (!k) return;
  // A line that comes back to where it started is a closed shape, so fill it in.
  const n = k.p.length;
  if (n >= 16 && Math.hypot(k.p[0] - k.p[n - 2], k.p[1] - k.p[n - 1]) < 9) k.f = true;
  S.strokes.push(k); paint();
  if (S.strokes.length === 1) { const h = $('#st-hint'); if (h) h.textContent = 'Nice! Tap "Add a face" and then tap your squishy to give it eyes and a smile.'; }
}
document.addEventListener('pointerdown', (e) => {
  if (!e.target.closest || !e.target.closest('#draw-pad')) return;
  // Once an Apple Pencil is used, ignore fingers so a resting palm does not leave marks.
  if (e.pointerType === 'pen' && !S.pencil) { S.pencil = true; if (S.cur) { S.cur = null; S.undo.pop(); paint(); } }
  if (S.pencil && e.pointerType === 'touch') return;
  if (S.cur) finish();
  e.preventDefault();
  const [x, y] = at(e);
  try { pad().setPointerCapture(e.pointerId); } catch { /* fine without capture */ }
  S.pid = e.pointerId;
  if (S.tool === 'face') { snapshot(); S.faces.push({ x, y, s: [0.7, 1, 1.4][S.w] }); if (S.faces.length > 6) S.faces.shift(); paint(); sfx.pop(); S.pid = null; return; }
  snapshot();
  if (S.tool === 'eraser') { S.cur = null; S.erasing = true; erase(x, y); return; }
  if (S.strokes.length >= 150) { toast('That is a lot of lines! Press Undo or Clear to draw more.'); S.undo.pop(); S.pid = null; return; }
  S.cur = { c: S.color, w: SIZES[S.w], f: false, p: [x, y] };
  const live = $('#pad-live'); live.setAttribute('stroke', S.color); live.setAttribute('stroke-width', SIZES[S.w]); live.setAttribute('d', `M${x} ${y}l0.01 0`);
});
document.addEventListener('pointermove', (e) => {
  if (S.pid !== e.pointerId || !pad()) return;
  const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
  (evs.length ? evs : [e]).forEach((ev) => {
    const [x, y] = at(ev);
    if (S.erasing) return erase(x, y);
    const k = S.cur; if (!k) return;
    const n = k.p.length;
    if (Math.hypot(x - k.p[n - 2], y - k.p[n - 1]) < 0.7 || n >= 700) return;
    k.p.push(x, y);
  });
  if (S.cur) { const p = S.cur.p; let d = `M${p[0]} ${p[1]}`; for (let i = 2; i < p.length; i += 2) d += `L${p[i]} ${p[i + 1]}`; $('#pad-live').setAttribute('d', d); }
}, { passive: true });
const stop = (e) => { if (S.pid !== e.pointerId) return; if (S.erasing) { S.erasing = false; S.pid = null; return; } finish(); };
document.addEventListener('pointerup', stop);
document.addEventListener('pointercancel', stop);
window.addEventListener('blur', () => { if (S.cur) finish(); S.erasing = false; });

const redraw = () => { if (S.cur) finish(); S.name = $('#st-name') ? $('#st-name').value : S.name; router.go('studio'); };
actions.stTool = (el) => { S.tool = el.dataset.v; sfx.tap(); redraw(); };
actions.stSize = (el) => { S.w = +el.dataset.v; sfx.tap(); redraw(); };
actions.stColor = (el) => { S.color = el.dataset.v; if (S.tool === 'eraser') S.tool = 'pen'; sfx.tap(); redraw(); };
actions.stSound = (el) => { S.snd = el.dataset.v; playSound(S.snd); redraw(); };
actions.stUndo = () => { if (S.cur) finish(); const u = S.undo.pop(); if (!u) return toast('Nothing to undo.'); [S.strokes, S.faces] = JSON.parse(u); sfx.tap(); paint(); };
actions.stClear = () => { if (S.cur) finish(); if (!S.strokes.length && !S.faces.length) return; snapshot(); S.strokes = []; S.faces = []; sfx.tap(); paint(); toast('Cleared. Press Undo to bring it back.'); };
actions.form_studio = (f) => {
  if (S.cur) finish();
  if (!S.strokes.length) { sfx.no(); return toast('Draw something first!'); }
  store.custom = store.custom || {};
  if (Object.keys(store.custom).length >= MAX_TOYS) { sfx.no(); return toast(`You have made ${MAX_TOYS} squishies. That is the most this device can keep.`); }
  const id = 'cu' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  const made = registerCustom({ id, name: String(new FormData(f).get('name') || '').trim() || 'My Squishy', snd: S.snd, strokes: S.strokes, faces: S.faces });
  if (!made) { sfx.no(); return toast('That drawing could not be saved. Try again.'); }
  store.custom[id] = made.art; addToy(id); save();
  S = fresh();
  router.go('toys');
  prize('You made a squishy!', `<p><b>${esc(made.name)}</b> is on your shelf. Squish it, trade it, or make it your buddy.</p><p><button class="btn" data-act="buddy" data-id="${id}">Make it my buddy</button></p>`, id);
};
export const myDrawings = (p = P()) => Object.keys(p.inv).filter((id) => TOYS[id] && TOYS[id].custom);
export { toySVG };
