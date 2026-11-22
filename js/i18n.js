// English and Spanish. The game is written in English; in Spanish mode every piece of text
// on the screen is swapped for its Spanish version as it appears.
//
// How a sentence is matched: first as it is. If that fails, numbers become {n1}, {n2}... and
// names (toys, friends, players, toy families) become {x1}, {x2}..., so "You have 3" and
// "You have 7" share one entry: "You have {n1}" -> "Tienes {n1}".
import { TOY_LIST, FRIENDS, CATS, RARITY } from './data.js';
import { store, save } from './state.js';

let D = null; // English -> Spanish, loaded only when Spanish is on
export const miss = new Set(); // text with no Spanish yet (handy when adding new screens)
if (typeof window !== 'undefined') window.__i18nMiss = miss;

export function lang() {
  if (store.lang === 'es' || store.lang === 'en') return store.lang;
  const dev = (typeof navigator !== 'undefined' && (navigator.language || (navigator.languages || [])[0])) || 'en';
  return String(dev).toLowerCase().startsWith('es') ? 'es' : 'en';
}
export function setLang(l) { store.lang = l === 'es' ? 'es' : 'en'; save(); location.reload(); }

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let nameKey = '', nameRe = null;
function names() {
  const mine = store.profiles.map((p) => p.name), made = Object.values(store.custom || {}).map((c) => c.name);
  const key = mine.join('|') + '#' + made.join('|');
  if (key !== nameKey || !nameRe) {
    const all = [...TOY_LIST.map((t) => t.name), ...FRIENDS.map((f) => f.name), ...mine, ...made, 'Player 2',
      ...Object.values(CATS).flatMap((c) => [c.name, c.one, c.name.toLowerCase()]), ...Object.values(RARITY).map((r) => r.name)]
      .filter((n) => n && n.length > 1);
    const uniq = [...new Set(all)].sort((a, b) => b.length - a.length);
    nameRe = new RegExp('(?<![A-Za-z])(?:' + uniq.map(esc).join('|') + ')(?![A-Za-z])', 'g');
    nameKey = key;
  }
  return nameRe;
}
export function normalize(core) {
  const vals = {}; let x = 0, n = 0;
  // numbers first, so the digits inside {x1} are never mistaken for a number
  let key = core.replace(/\d+(?:[.,:]\d+)*/g, (m) => { n++; vals['n' + n] = m; return `{n${n}}`; });
  key = key.replace(names(), (m) => { x++; vals['x' + x] = m; return `{x${x}}`; });
  return { key, vals };
}
// Translate one piece of text. Returns null when there is nothing to change.
export function tr(raw) {
  if (!D || raw == null) return null;
  const m = String(raw).match(/^(\s*)([\s\S]*?)(\s*)$/), core = m[2].replace(/\s+/g, ' ');
  if (!core || !/[A-Za-z]/.test(core)) return null;
  let out = D[core];
  if (out === undefined) {
    const { key, vals } = normalize(core);
    const tpl = key !== core ? D[key] : undefined;
    if (tpl !== undefined) out = tpl.replace(/\{([nx])(\d+)\}/g, (_, k, i) => { const v = vals[k + i]; return v === undefined ? '' : k === 'x' ? (D[v] !== undefined ? D[v] : v) : v; });
  }
  if (out === undefined) { if (core.length < 200 && /[A-Za-z]/.test(normalize(core).key.replace(/\{[nx]\d+\}/g, ''))) miss.add(core); return null; }
  return m[1] + out + m[3];
}
// For code that builds a sentence itself: Spanish if we have it, otherwise the English it was given.
export const say = (s) => { const t = tr(s); return t == null ? s : t; };

const seen = new WeakMap(), seenAttr = new WeakMap();
const ATTRS = ['aria-label', 'placeholder', 'title'];
const skip = (el) => !el || el.closest('[translate="no"], script, style, textarea');
function doText(node) {
  if (skip(node.parentElement)) return;
  const raw = node.nodeValue;
  if (seen.get(node) === raw) return;
  const out = tr(raw);
  if (out != null && out !== raw) { seen.set(node, out); node.nodeValue = out; }
}
function doAttrs(el) {
  if (skip(el)) return;
  ATTRS.forEach((a) => {
    const raw = el.getAttribute && el.getAttribute(a);
    if (!raw) return;
    const memo = seenAttr.get(el) || {};
    if (memo[a] === raw) return;
    const out = tr(raw);
    if (out != null && out !== raw) { memo[a] = out; seenAttr.set(el, memo); el.setAttribute(a, out); }
  });
}
function sweep(root) {
  if (root.nodeType === 3) return doText(root);
  if (root.nodeType !== 1) return;
  doAttrs(root);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let n = w.nextNode(); n; n = w.nextNode()) (n.nodeType === 3 ? doText(n) : doAttrs(n));
}

export async function initLang() {
  const l = lang();
  document.documentElement.lang = l;
  if (l !== 'es') return;
  try { D = (await import('./es.js')).default; } catch { D = null; return; }
  sweep(document.body);
  document.title = say(document.title);
  new MutationObserver((list) => {
    list.forEach((m) => {
      if (m.type === 'characterData') doText(m.target);
      else if (m.type === 'attributes') doAttrs(m.target);
      else m.addedNodes.forEach(sweep);
    });
  }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
}
