// Saved game: players, coins, toys, daily challenges. Lives in this browser only.
import { TOYS, TOY_LIST, QUESTS, GOALS, FRIENDS, STORIES, byCat, registerCustom } from './data.js';

const KEY = 'gest.v1';
function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
}
export const store = load() || { profiles: [], cur: null, mute: false };
// Squishies drawn on this device (or received in a trade) live here, so every player can see them.
store.custom = store.custom || {};
Object.values(store.custom).forEach(registerCustom);
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* private window: play without saving */ }
}
export const P = () => store.profiles.find((p) => p.id === store.cur) || null;
export const today = () => new Date().toLocaleDateString('en-CA');

const listeners = [];
export const onChange = (fn) => listeners.push(fn);
const changed = () => { save(); listeners.forEach((fn) => fn()); };

// Small seeded random so each day's friends and challenges stay the same all day.
export function rng(seed) {
  let h = 1779033703;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 3432918353), h = (h << 13) | (h >>> 19);
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
export const pick = (arr, r = Math.random) => arr[Math.floor(r() * arr.length)];

export function rollToy(cats, odds, r = Math.random, only = null) {
  const roll = r() * 100;
  let acc = 0, rar = 'c';
  ['c', 'r', 'e', 'l'].some((k, i) => { acc += odds[i]; if (roll < acc) { rar = k; return true; } return false; });
  const ok = (t) => cats.includes(t.cat) && (!only || only(t));
  let pool = TOY_LIST.filter((t) => ok(t) && t.r === rar);
  if (!pool.length) pool = TOY_LIST.filter(ok);
  return pick(pool, r).id;
}

export function newProfile(name, starter, style = 'girl') {
  const p = {
    id: 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
    name: name.trim().slice(0, 14) || 'Player', buddy: starter, style, coins: 120, inv: {}, seen: {},
    stats: {}, claimed: {}, stories: {}, daily: null, streak: 0, lastDay: '',
  };
  store.profiles.push(p);
  store.cur = p.id;
  ensureDaily(p);
  addToy(starter, 1, p);
  ['fidget', 'slime', 'putty', 'dough', 'springy'].forEach((c) => addToy(pick(byCat(c).filter((t) => t.r === 'c')).id, 1, p));
  addToy(pick(byCat('squishy').filter((t) => t.r === 'c' && t.id !== starter)).id, 1, p);
  changed();
  return p;
}

export function botInventory(bot, seed) {
  const r = rng(seed + bot.id);
  const inv = [];
  for (let i = 0; i < 3; i++) inv.push(rollToy([bot.fav], [50, 32, 14, 4], r));
  const others = ['squishy', 'fidget', 'slime', 'putty', 'dough', 'springy'].filter((c) => c !== bot.fav);
  for (let i = 0; i < 4; i++) inv.push(rollToy([pick(others, r)], [55, 30, 12, 3], r));
  if (r() < 0.3) inv.push(rollToy(['plushie'], [0, 70, 30, 0], r));
  return inv;
}

export function ensureDaily(p = P()) {
  if (!p) return;
  const d = today();
  if (p.daily && p.daily.date === d) {
    // Friends added in a game update get their toys for today too.
    FRIENDS.forEach((b) => { if (!p.daily.bots[b.id]) p.daily.bots[b.id] = botInventory(b, d + p.id); });
    // A challenge that no longer exists (after a game update) is dropped instead of crashing the screen.
    p.daily.quests = p.daily.quests.filter((q) => QUESTS.some((x) => x.id === q.id));
    return;
  }
  const r = rng(d + p.id);
  const pool = [...QUESTS];
  const quests = [];
  while (quests.length < 3) quests.push({ id: pool.splice(Math.floor(r() * pool.length), 1)[0].id, n: 0, claimed: false });
  const yesterday = new Date(Date.now() - 864e5).toLocaleDateString('en-CA');
  p.streak = p.lastDay === yesterday ? p.streak + 1 : 1;
  p.lastDay = d;
  const bots = {};
  FRIENDS.forEach((b) => { bots[b.id] = botInventory(b, d + p.id); });
  p.daily = { date: d, quests, chest: false, spun: false, squish: 10, bots, offer: null, offerDone: false };
  save();
}

export const count = (id, p = P()) => (p.inv[id] || 0);
export function addToy(id, n = 1, p = P()) {
  p.inv[id] = (p.inv[id] || 0) + n;
  p.seen[id] = 1;
  changed();
}
export function removeToy(id, n = 1, p = P()) {
  p.inv[id] = Math.max(0, (p.inv[id] || 0) - n);
  if (!p.inv[id]) delete p.inv[id];
  if (p.buddy === id && !p.inv[id]) p.buddy = Object.keys(p.inv)[0] || p.buddy;
  changed();
}
export function addCoins(n, p = P()) { p.coins = Math.max(0, p.coins + n); changed(); }
// Handmade squishies are extra: they do not count toward the collection goals.
export const uniqueCount = (p = P()) => Object.keys(p.seen).filter((id) => TOYS[id] && !TOYS[id].custom).length;
export const ownedList = (p = P()) => Object.keys(p.inv).filter((id) => TOYS[id]).sort((a, b) => TOYS[b].value - TOYS[a].value || a.localeCompare(b));

export function track(ev, n = 1, p = P()) {
  if (!p) return;
  p.stats[ev] = (p.stats[ev] || 0) + n;
  if (ev === 'game' || ev === 'story' || ev === 'trade') p.egg = Math.min(10, (p.egg || 0) + 1);
  if (p.daily) p.daily.quests.forEach((q) => {
    const def = QUESTS.find((x) => x.id === q.id);
    if (def.ev === ev) q.n = Math.min(def.goal, q.n + n);
  });
  changed();
}

export function goalProgress(g, p = P()) {
  if (g.kind === 'unique') return [Math.min(uniqueCount(p), g.goal), g.goal];
  if (g.kind === 'stat') return [Math.min(p.stats[g.ev] || 0, g.goal), g.goal];
  if (g.kind === 'stories') return [Object.keys(p.stories).length, STORIES.length];
  if (g.kind === 'storiesN') return [Math.min(Object.keys(p.stories).length, g.goal), g.goal];
  const set = byCat(g.cat);
  return [set.filter((t) => p.seen[t.id]).length, set.length];
}
export const readyGoals = (p = P()) => GOALS.filter((g) => !p.claimed[g.id] && goalProgress(g, p)[0] >= goalProgress(g, p)[1]);
