// Extra things to do: the sticker album, the daily gift, the mystery egg and the room to decorate.
import { TOYS, TOY_LIST, CATS, STORIES, QUEST } from './data.js';
import { P, save, addCoins, addToy, uniqueCount, track } from './state.js';
import { $, esc, actions, sfx, coins, toast, confetti, prize, router } from './ui.js';
import { toySVG, icon } from './art.js';

const today = () => new Date().toLocaleDateString('en-CA');
const real = TOY_LIST.filter((t) => !t.custom);
const seenIf = (p, f) => Object.keys(p.seen).filter((id) => TOYS[id] && !TOYS[id].custom && f(TOYS[id])).length;
const randToy = (p, r) => { const pool = real.filter((t) => t.r === r), fresh = pool.filter((t) => !p.seen[t.id]); const from = fresh.length ? fresh : pool; return from[Math.floor(Math.random() * from.length)].id; };

// ---------- sticker album ----------
const plays = (p) => Object.keys(p.stats).filter((k) => k.startsWith('plays_')).reduce((a, k) => a + p.stats[k], 0);
const endsFound = (p) => Object.values(p.stories).reduce((a, r) => a + Object.keys(r).length, 0);
const hearts = (p) => Object.values(p.friends || {});
const S = (id, name, art, need, fn) => ({ id, name, art, need, fn });
const PAGES = [
  ['Collector', [S('c10', 'First Ten', 'sq01', 10, uniqueCount), S('c25', 'Toy Box', 'sq04', 25, uniqueCount), S('c50', 'Toy Shelf', 'sq13', 50, uniqueCount), S('c100', 'Toy Room', 'sq23', 100, uniqueCount),
    S('c200', 'Toy Shop', 'sq101', 200, uniqueCount), S('c300', 'Toy Museum', 'sq217', 300, uniqueCount), S('c400', 'Toy Kingdom', 'pl12', 400, uniqueCount), S('call', 'Every Single Toy', 'sq229', real.length, uniqueCount)]],
  ['Toy families', Object.keys(CATS).map((k, i) => S('f_' + k, `${CATS[k].name} fan`, ['sq20', 'fi04', 'sl02', 'pu01', 'do13', 'sp07', 'pl01'][i] || 'sq01', 15, (p) => seenIf(p, (t) => t.cat === k)))],
  ['Sparkle and shine', [S('g5', 'Glitter Star', 'sq160', 5, (p) => seenIf(p, (t) => t.fx === 'glitter')), S('rb3', 'Rainbow Chaser', 'sq153', 3, (p) => seenIf(p, (t) => t.fx === 'rainbow')),
    S('gx2', 'Space Explorer', 'sq157', 2, (p) => seenIf(p, (t) => t.fx === 'galaxy')), S('j3', 'Jumbo Hugger', 'sq142', 3, (p) => seenIf(p, (t) => t.big)),
    S('e10', 'Epic Hunter', 'sq172', 10, (p) => seenIf(p, (t) => t.r === 'e')), S('l1', 'Legend Finder', 'sq190', 1, (p) => seenIf(p, (t) => t.r === 'l')), S('l5', 'Legend Keeper', 'sq232', 5, (p) => seenIf(p, (t) => t.r === 'l'))]],
  ['Trader and friend', [S('t1', 'First Trade', 'fi01', 1, (p) => p.stats.trade || 0), S('t10', 'Good Trader', 'fi13', 10, (p) => p.stats.trade || 0), S('t25', 'Great Trader', 'fi24', 25, (p) => p.stats.trade || 0), S('t50', 'Trade Queen', 'sq170', 50, (p) => p.stats.trade || 0),
    S('h3', 'New Friend', 'pl02', 3, (p) => Math.max(0, ...hearts(p))), S('h15', 'Best Friend', 'pl11', 15, (p) => Math.max(0, ...hearts(p))), S('h3x', 'Friend Circle', 'pl05', 3, (p) => hearts(p).filter((h) => h >= 8).length),
    S('a1', 'Helper', 'sq225', 1, (p) => p.stats.ask || 0), S('a10', 'Super Helper', 'sq227', 10, (p) => p.stats.ask || 0)]],
  ['Reader and writer', [S('s1', 'Bookworm', 'pl19', 1, (p) => Object.keys(p.stories).length), S('s5', 'Story Lover', 'sq193', 5, (p) => Object.keys(p.stories).length), S('s10', 'Story Star', 'sq13', 10, (p) => Object.keys(p.stories).length),
    S('sall', 'Read Them All', 'sq194', STORIES.length, (p) => Object.keys(p.stories).filter((id) => STORIES.some((s) => s.id === id)).length), S('e12', 'Ending Finder', 'sq50', 12, endsFound), S('e30', 'Ending Master', 'sq51', 30, endsFound),
    S('sec', 'Secret Keeper', 'sq101', 1, (p) => ((p.stories.mountain || {})['Keeper of the Mountain'] ? 1 : 0)), S('qm', 'Crown Hero', 'sq23', QUEST.length, (p) => Math.min(QUEST.length, (p.quest || {}).ch || 0)),
    S('au', 'Author', 'sq208', 1, (p) => (p.myStories || []).length)]],
  ['Player', [S('p10', 'Game Fan', 'fi04', 10, plays), S('p50', 'Game Star', 'sq158', 50, plays), S('p150', 'Game Champion', 'sq169', 150, plays), S('calm', 'Calm Cloud', 'sq11', 3, (p) => p.stats.plays_breathe || 0),
    S('d3', 'Three Days', 'sq195', 3, (p) => p.streak || 1), S('d7', 'A Whole Week', 'sq199', 7, (p) => p.streak || 1), S('art', 'Artist', 'sq218', 1, (p) => Object.keys(p.inv).filter((id) => TOYS[id] && TOYS[id].custom).length),
    S('rm', 'Decorator', 'sq223', 6, (p) => Object.keys(p.roomOwn || {}).length), S('egg1', 'Egg Hatcher', 'sq191', 1, (p) => p.stats.egg || 0), S('egg5', 'Egg Expert', 'sq192', 5, (p) => p.stats.egg || 0)]],
];
const ALL = PAGES.flatMap((pg) => pg[1]);
export const stickersReady = (p = P()) => ALL.filter((s) => !(p.stickers || {})[s.id] && s.fn(p) >= s.need).length;
export function albumScreen() {
  const p = P(); p.stickers = p.stickers || {};
  const got = ALL.filter((s) => p.stickers[s.id]).length;
  const slot = (s) => {
    const n = Math.min(s.need, s.fn(p)), have = p.stickers[s.id], ready = !have && n >= s.need;
    return `<button class="sticker ${have ? 'have' : ready ? 'ready' : 'locked'}" ${ready ? `data-act="stick" data-id="${s.id}"` : 'disabled'}><span class="sticker-art">${toySVG(s.art)}</span><b>${s.name}</b><small>${have ? 'In your album' : ready ? 'Tap to stick it in!' : `${n} of ${s.need}`}</small></button>`;
  };
  return `<button class="btn back" data-act="go" data-to="home">${icon('back')} Home</button><h1>Sticker album</h1><p class="muted">You win stickers by collecting, trading, reading and playing. Each sticker you stick in gives ${coins(15)}. You have ${got} of ${ALL.length} stickers.</p>
    ${PAGES.map(([title, list]) => `<section class="card album-page"><h2>${title}</h2><div class="stickers">${list.map(slot).join('')}</div></section>`).join('')}`;
}
actions.stick = (el) => {
  const p = P(), s = ALL.find((x) => x.id === el.dataset.id);
  if (!s || (p.stickers || {})[s.id] || s.fn(p) < s.need) return;
  p.stickers[s.id] = 1; addCoins(15); save(); sfx.win(); confetti(18);
  const y = window.scrollY; router.go('album'); window.scrollTo(0, y);
};

// ---------- daily gift: seven days of gifts, then it starts again ----------
const GIFTS = [[20], [30], [0, 'r'], [40], [60], [0, 'r'], [100, 'e']];
function giftCard(p) {
  const g = (p.gift = p.gift || { n: 0, last: '' }), open = g.last !== today();
  return `<section class="card gift-card"><h2>Daily gift</h2><div class="gift-row">${GIFTS.map(([c, r], i) => `<span class="gift ${i < g.n ? 'done' : ''} ${i === g.n && open ? 'now' : ''}"><small>Day ${i + 1}</small><span class="gift-what">${r ? toySVG(r === 'e' ? 'sq172' : 'sq13') : coins(c)}</span></span>`).join('')}</div>
    ${open ? '<button class="btn primary big" data-act="gift">Open today\'s gift</button>' : '<p class="muted">Come back tomorrow for your next gift!</p>'}</section>`;
}
actions.gift = () => {
  const p = P(), g = p.gift || { n: 0, last: '' };
  if (g.last === today()) return;
  const [c, r] = GIFTS[g.n % 7], id = r ? randToy(p, r) : null;
  g.last = today(); g.n = (g.n + 1) % 7; p.gift = g;
  if (c) addCoins(c);
  if (id) addToy(id);
  save();
  prize('Your daily gift!', `<p>You got ${c ? coins(c) : ''}${c && id ? ' and ' : ''}${id ? `<b>${esc(TOYS[id].name)}</b>` : ''}!</p>`, id || undefined);
  router.go('home');
};

// ---------- mystery egg: every game, story and trade warms it up ----------
const EGG_NEED = 10;
function eggSVG(n) {
  const cr = n >= EGG_NEED ? '<path d="M30 52l8 -7l7 8l8 -9l7 8l9 -6" fill="none" stroke="#2A1846" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' : n >= 6 ? '<path d="M38 50l6 -6l6 7" fill="none" stroke="#2A1846" stroke-width="2" stroke-linecap="round"/>' : '';
  return `<svg viewBox="0 0 100 100" class="egg-svg" aria-hidden="true"><ellipse cx="50" cy="92" rx="24" ry="4" fill="#2A1846" opacity=".2"/><path d="M50 10C30 10 18 42 18 60C18 80 32 90 50 90C68 90 82 80 82 60C82 42 70 10 50 10Z" fill="#FFF3D6" stroke="#2A1846" stroke-width="3"/><circle cx="36" cy="38" r="6" fill="#FF8FC0"/><circle cx="62" cy="30" r="4.5" fill="#8ED3FF"/><circle cx="66" cy="62" r="7" fill="#C9A8FF"/><circle cx="34" cy="68" r="5" fill="#9DE7C5"/><circle cx="50" cy="76" r="3.5" fill="#FFD84A"/>${cr}</svg>`;
}
function eggCard(p) {
  const n = Math.min(EGG_NEED, p.egg || 0), ready = n >= EGG_NEED;
  return `<section class="card egg-card ${ready ? 'ready' : ''}"><div class="egg">${eggSVG(n)}</div><div><h2>Mystery egg</h2>
    ${ready ? '<p>It is wiggling! Something wants to come out.</p><button class="btn primary big" data-act="hatch">Hatch it!</button>' : `<p class="muted">Play games, read stories and trade to warm it up.</p><div class="egg-bar" role="img" aria-label="${n} of ${EGG_NEED}"><i style="width:${n * 10}%"></i></div><small>${n} of ${EGG_NEED}</small>`}</div></section>`;
}
actions.hatch = () => {
  const p = P();
  if ((p.egg || 0) < EGG_NEED) return;
  const roll = Math.random(), id = randToy(p, roll < 0.08 ? 'l' : roll < 0.4 ? 'e' : 'r');
  p.egg = 0; addToy(id); track('egg'); p.egg = 0; save(); confetti(50);
  prize('Your egg hatched!', `<p>Out popped <b>${esc(TOYS[id].name)}</b>! A new egg is waiting for you.</p>`, id);
  router.go('home');
};

export function homeExtras() {
  const p = P(), ready = stickersReady(p);
  return `${giftCard(p)}${eggCard(p)}<section class="card"><h2>More fun</h2><div class="modes">
    <button class="mode" data-act="go" data-to="room"><b>My room</b><small>Decorate it with your coins and toys</small></button>
    <button class="mode" data-act="go" data-to="album"><b>Sticker album${ready ? ` <span class="pill">${ready} new</span>` : ''}</b><small>Win stickers for everything you do</small></button>
    <button class="mode" data-act="go" data-to="mystory"><b>Story maker</b><small>Write your own choose-your-path story</small></button></div></section>`;
}

// ---------- my room ----------
const K = 'stroke="#2A1846" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"';
const WALLS = [
  { id: 'w0', name: 'Peach wall', price: 0, bg: '#FFE1C9' },
  { id: 'w1', name: 'Pink stripes', price: 60, bg: 'repeating-linear-gradient(90deg,#FFD3E4 0 24px,#FFE6F0 24px 48px)' },
  { id: 'w2', name: 'Sky and clouds', price: 80, bg: 'radial-gradient(60px 26px at 22% 30%,#fff 98%,transparent),radial-gradient(70px 28px at 70% 18%,#fff 98%,transparent),radial-gradient(50px 22px at 88% 52%,#fff 98%,transparent),#BFE6FF' },
  { id: 'w3', name: 'Lilac dots', price: 80, bg: 'radial-gradient(#fff 5px,transparent 6px) 0 0/40px 40px,#D9C4FF' },
  { id: 'w4', name: 'Minty hearts', price: 100, bg: 'radial-gradient(#FF8FC0 4px,transparent 5px) 0 0/36px 36px,radial-gradient(#FF8FC0 4px,transparent 5px) 18px 18px/36px 36px,#C6F3DE' },
  { id: 'w5', name: 'Starry night', price: 150, bg: 'radial-gradient(#FFF3B0 2px,transparent 3px) 0 0/46px 46px,radial-gradient(#fff 1.5px,transparent 2.5px) 20px 26px/46px 46px,linear-gradient(#232058,#4B3F9E)' },
  { id: 'w6', name: 'Rainbow wall', price: 200, bg: 'linear-gradient(#FFB3B3 0 16.6%,#FFD6A5 0 33.3%,#FFF3B0 0 50%,#C6F3C0 0 66.6%,#BFE6FF 0 83.3%,#D9C4FF 0)' },
];
const FLOORS = [
  { id: 'f0', name: 'Wood floor', price: 0, bg: 'repeating-linear-gradient(90deg,#D9A66B 0 46px,#C99253 46px 49px)' },
  { id: 'f1', name: 'Pink carpet', price: 60, bg: 'radial-gradient(#FF9CC4 2px,transparent 3px) 0 0/14px 14px,#FFB8D6' },
  { id: 'f2', name: 'Checker floor', price: 80, bg: 'repeating-conic-gradient(#fff 0 25%,#C9A8FF 0 50%) 0 0/48px 48px' },
  { id: 'f3', name: 'Soft grass', price: 100, bg: 'repeating-linear-gradient(100deg,#8FD86A 0 9px,#7CCB58 9px 18px)' },
  { id: 'f4', name: 'Cloud floor', price: 150, bg: 'radial-gradient(40px 18px at 30% 40%,#fff 98%,transparent) 0 0/120px 60px,radial-gradient(34px 15px at 78% 76%,#fff 98%,transparent) 0 0/120px 60px,#CDEBFF' },
];
const ITEMS = [
  { id: 'bed', name: 'Cozy bed', price: 80, w: 34, svg: `<rect x="6" y="28" width="16" height="56" rx="6" fill="#B07A4E" ${K}/><rect x="14" y="52" width="80" height="30" rx="7" fill="#FF8FC0" ${K}/><rect x="20" y="42" width="26" height="16" rx="8" fill="#fff" ${K}/><path d="M50 60h44" ${K} fill="none"/><path d="M12 84v8M90 82v10" ${K}/>` },
  { id: 'rug', name: 'Rainbow rug', price: 50, w: 34, svg: `<ellipse cx="50" cy="60" rx="46" ry="24" fill="#FFB3B3" ${K}/><ellipse cx="50" cy="60" rx="36" ry="18" fill="#FFF3B0"/><ellipse cx="50" cy="60" rx="25" ry="12" fill="#BFE6FF"/><ellipse cx="50" cy="60" rx="13" ry="6" fill="#D9C4FF"/>` },
  { id: 'lamp', name: 'Star lamp', price: 60, w: 14, svg: `<path d="M50 36v52M34 90h32" ${K} fill="none"/><path d="M28 40L38 8H62L72 40Z" fill="#FFE27A" ${K}/><path d="M50 16l2.5 6h6l-5 4l2 6l-5.500 -4l-5.500 4l2 -6l-5 -4h6Z" fill="#fff"/>` },
  { id: 'plant', name: 'Happy plant', price: 40, w: 14, svg: `<path d="M50 62C30 60 22 40 26 26C42 28 50 44 50 62ZM50 62C70 60 78 40 74 26C58 28 50 44 50 62ZM50 62C44 44 46 22 50 10C54 22 56 44 50 62Z" fill="#6CC45A" ${K}/><path d="M30 62H70L64 92H36Z" fill="#FF9A6B" ${K}/><circle cx="43" cy="76" r="2" fill="#2A1846"/><circle cx="57" cy="76" r="2" fill="#2A1846"/><path d="M46 81q4 3 8 0" ${K} fill="none"/>` },
  { id: 'window', name: 'Sunny window', price: 70, w: 24, svg: `<rect x="10" y="10" width="80" height="76" rx="8" fill="#BFE6FF" ${K}/><circle cx="68" cy="32" r="11" fill="#FFD84A"/><path d="M10 70q20 -16 40 -4q20 12 40 -6V78Q90 86 82 86H18Q10 86 10 78Z" fill="#8FD86A"/><path d="M50 10v76M10 48h80" ${K} fill="none"/>` },
  { id: 'poster', name: 'Kitty poster', price: 40, w: 16, svg: `<rect x="14" y="8" width="72" height="84" rx="5" fill="#FFF4E4" ${K}/><path d="M30 46L33 28L46 38ZM70 46L67 28L54 38Z" fill="#FFC59E" ${K}/><ellipse cx="50" cy="56" rx="24" ry="19" fill="#FFC59E" ${K}/><circle cx="42" cy="55" r="2.6" fill="#2A1846"/><circle cx="58" cy="55" r="2.6" fill="#2A1846"/><path d="M46 62q4 3 8 0" ${K} fill="none"/>` },
  { id: 'shelf', name: 'Wall shelf', price: 60, w: 26, svg: `<rect x="4" y="54" width="92" height="10" rx="4" fill="#B07A4E" ${K}/><path d="M16 64l6 14M84 64l-6 14" ${K}/><rect x="14" y="26" width="10" height="28" fill="#FF8FC0" ${K}/><rect x="24" y="20" width="9" height="34" fill="#8ED3FF" ${K}/><rect x="33" y="30" width="11" height="24" fill="#FFD84A" ${K}/><circle cx="68" cy="42" r="12" fill="#C9A8FF" ${K}/>` },
  { id: 'beanbag', name: 'Bean bag', price: 70, w: 22, svg: `<path d="M14 78C8 54 26 28 50 28C74 28 92 54 86 78C82 92 18 92 14 78Z" fill="#9DE7C5" ${K}/><path d="M30 50q20 12 40 0" ${K} fill="none"/>` },
  { id: 'table', name: 'Tea table', price: 70, w: 22, svg: `<ellipse cx="50" cy="46" rx="42" ry="12" fill="#FFE9C4" ${K}/><path d="M26 56v34M74 56v34M50 58v34" ${K}/><path d="M40 38h18v-10h-18Z" fill="#FF8FC0" ${K}/><path d="M58 30q8 0 6 6" ${K} fill="none"/>` },
  { id: 'lights', name: 'Fairy lights', price: 90, w: 44, svg: `<path d="M2 30Q26 58 50 34Q74 58 98 30" ${K} fill="none"/>${[[10, 42, '#FF8FC0'], [24, 50, '#FFD84A'], [38, 46, '#8ED3FF'], [62, 46, '#9DE7C5'], [76, 50, '#C9A8FF'], [90, 42, '#FF9A3D']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="6" fill="${c}" ${K}/>`).join('')}` },
  { id: 'chest', name: 'Toy chest', price: 80, w: 24, svg: `<rect x="10" y="44" width="80" height="44" rx="6" fill="#C9A8FF" ${K}/><path d="M10 50Q10 26 50 26Q90 26 90 50Z" fill="#B48CF5" ${K}/><rect x="43" y="44" width="14" height="14" rx="3" fill="#FFD84A" ${K}/>` },
  { id: 'tent', name: 'Play tent', price: 120, w: 32, svg: `<path d="M50 8L94 90H6Z" fill="#FFB8D6" ${K}/><path d="M50 8L66 90H34Z" fill="#7E57C9" ${K}/><path d="M50 8v-6M50 2l10 4l-10 4" ${K} fill="#FFD84A"/>` },
  { id: 'clock', name: 'Cat clock', price: 50, w: 12, svg: `<path d="M26 34L28 12L44 26ZM74 34L72 12L56 26Z" fill="#FFD84A" ${K}/><circle cx="50" cy="54" r="34" fill="#fff" ${K}/><path d="M50 54V34M50 54L64 62" ${K} fill="none"/><circle cx="50" cy="54" r="3" fill="#2A1846"/>` },
  { id: 'books', name: 'Bookcase', price: 100, w: 22, svg: `<rect x="12" y="6" width="76" height="88" rx="5" fill="#B07A4E" ${K}/><rect x="18" y="12" width="64" height="22" fill="#FFF4E4"/><rect x="18" y="40" width="64" height="22" fill="#FFF4E4"/><rect x="18" y="68" width="64" height="20" fill="#FFF4E4"/>${[[20, 14, '#FF8FC0'], [29, 14, '#8ED3FF'], [38, 14, '#FFD84A'], [52, 14, '#9DE7C5'], [22, 42, '#C9A8FF'], [31, 42, '#FF9A3D'], [46, 42, '#FF8FC0'], [62, 42, '#8ED3FF'], [24, 70, '#9DE7C5'], [40, 70, '#FFD84A'], [56, 70, '#C9A8FF']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="8" height="${y > 60 ? 18 : 20}" fill="${c}" stroke="#2A1846" stroke-width="1.5"/>`).join('')}` },
  { id: 'mirror', name: 'Heart mirror', price: 60, w: 14, svg: `<path d="M50 90C8 60 10 20 32 20C44 20 50 30 50 36C50 30 56 20 68 20C90 20 92 60 50 90Z" fill="#DFF4FF" stroke="#FF8FC0" stroke-width="7" stroke-linejoin="round"/><path d="M30 36q4 -8 12 -6" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>` },
  { id: 'balloons', name: 'Balloons', price: 50, w: 16, svg: `<path d="M34 44Q40 70 50 92M66 40Q58 70 50 92M50 34V92" fill="none" stroke="#2A1846" stroke-width="1.5"/><ellipse cx="32" cy="30" rx="14" ry="17" fill="#FF8FC0" ${K}/><ellipse cx="68" cy="26" rx="14" ry="17" fill="#8ED3FF" ${K}/><ellipse cx="50" cy="20" rx="14" ry="17" fill="#FFD84A" ${K}/>` },
  { id: 'castle', name: 'Toy castle', price: 150, w: 26, svg: `<rect x="22" y="40" width="56" height="50" fill="#FFD3E4" ${K}/><rect x="8" y="26" width="20" height="64" fill="#FFB8D6" ${K}/><rect x="72" y="26" width="20" height="64" fill="#FFB8D6" ${K}/><path d="M6 28L18 6L30 28ZM70 28L82 6L94 28Z" fill="#7E57C9" ${K}/><path d="M42 90V70q8 -12 16 0V90Z" fill="#7E57C9" ${K}/><rect x="14" y="40" width="8" height="10" rx="4" fill="#fff" ${K}/><rect x="78" y="40" width="8" height="10" rx="4" fill="#fff" ${K}/>` },
  { id: 'fishtank', name: 'Fish tank', price: 110, w: 22, svg: `<rect x="8" y="24" width="84" height="56" rx="8" fill="#BFE6FF" ${K}/><path d="M8 34h84" stroke="#fff" stroke-width="3"/><path d="M30 56q10 -10 20 0q-10 10 -20 0ZM50 56l8 -6v12Z" fill="#FF9A3D" ${K}/><path d="M74 78q-4 -14 2 -22M66 78q2 -8 -2 -14" fill="none" stroke="#6CC45A" stroke-width="3" stroke-linecap="round"/><rect x="16" y="80" width="68" height="10" rx="3" fill="#B07A4E" ${K}/>` },
];
const byId = (list, id) => list.find((x) => x.id === id);
const MAXT = 24;
// Anything that arrives from another player is checked before it is drawn.
export function cleanRoom(o) {
  const r = o && typeof o === 'object' ? o : {};
  return { wall: byId(WALLS, r.wall) ? r.wall : 'w0', floor: byId(FLOORS, r.floor) ? r.floor : 'f0',
    things: (Array.isArray(r.things) ? r.things : []).filter((t) => t && (byId(ITEMS, t.k) || (TOYS[t.k] && !TOYS[t.k].custom))).slice(0, MAXT)
      .map((t) => ({ k: String(t.k), x: Math.max(4, Math.min(96, Number(t.x) || 50)), y: Math.max(8, Math.min(94, Number(t.y) || 70)) })) };
}
export function roomHTML(room, edit) {
  const things = room.things.map((t, i) => ({ ...t, i })).sort((a, b) => a.y - b.y);
  return `<div class="room-stage ${edit ? 'edit' : ''}" id="room"><div class="room-wall" style="background:${byId(WALLS, room.wall).bg}"></div><div class="room-floor" style="background:${byId(FLOORS, room.floor).bg}"></div>
    ${things.map((t) => { const it = byId(ITEMS, t.k); return `<${edit ? 'button' : 'span'} class="thing ${it ? '' : 'thing-toy'}" data-i="${t.i}" style="left:${t.x}%;top:${t.y}%;width:${it ? it.w : 13}%;z-index:${Math.round(t.y)}" ${edit ? `aria-label="${esc(it ? it.name : TOYS[t.k].name)}"` : ''}>${it ? `<svg viewBox="0 0 100 100">${it.svg}</svg>` : toySVG(t.k)}</${edit ? 'button' : 'span'}>`; }).join('')}</div>`;
}
const myRoom = (p = P()) => { p.room = p.room || { wall: 'w0', floor: 'f0', things: [] }; p.roomOwn = p.roomOwn || { w0: 1, f0: 1 }; return p.room; };
export const roomToSend = () => cleanRoom(myRoom());
let rtab = 'items', picked = -1;
export function roomScreen() {
  const p = P(), room = myRoom(p), own = p.roomOwn;
  const opt = (x, kind) => { const has = own[x.id], on = kind !== 'items' && room[kind] === x.id;
    return `<button class="room-opt ${on ? 'on' : ''}" data-act="roomOpt" data-kind="${kind}" data-id="${x.id}"><span class="room-sw" ${kind === 'items' ? '' : `style="background:${x.bg}"`}>${kind === 'items' ? `<svg viewBox="0 0 100 100">${x.svg}</svg>` : ''}</span><b>${x.name}</b><small>${has ? (kind === 'items' ? 'Tap to put it in' : on ? 'In your room' : 'Tap to use') : coins(x.price)}</small></button>`; };
  const toys = Object.keys(p.inv).filter((id) => TOYS[id] && !TOYS[id].custom).sort((a, b) => TOYS[b].value - TOYS[a].value).slice(0, 60);
  const panel = rtab === 'items' ? ITEMS.map((x) => opt(x, 'items')).join('') : rtab === 'wall' ? WALLS.map((x) => opt(x, 'wall')).join('') : rtab === 'floor' ? FLOORS.map((x) => opt(x, 'floor')).join('')
    : toys.map((id) => `<button class="room-opt" data-act="roomToy" data-id="${id}"><span class="room-sw">${toySVG(id)}</span><b>${esc(TOYS[id].name)}</b><small>Tap to put it in</small></button>`).join('');
  const tab = (k, l) => `<button class="chip" data-act="roomTab" data-v="${k}" aria-pressed="${rtab === k}">${l}</button>`;
  return `<button class="btn back" data-act="go" data-to="home">${icon('back')} Home</button><h1>My room</h1><p class="muted">Drag things to move them. Tap a thing to pick it, then you can put it away.</p>
    ${roomHTML(room, true)}
    <div class="row room-bar"><button class="btn sm" data-act="roomAway" id="room-away" ${picked < 0 ? 'disabled' : ''}>Put it away</button><span class="muted">${room.things.length} of ${MAXT} things</span></div>
    <div class="row" role="group" aria-label="What to add">${tab('items', 'Furniture')}${tab('wall', 'Walls')}${tab('floor', 'Floors')}${tab('toys', 'My toys')}</div>
    <div class="room-opts">${panel}</div>`;
}
const redraw = () => { const y = window.scrollY; router.go('room'); window.scrollTo(0, y); };
actions.roomTab = (el) => { rtab = el.dataset.v; sfx.tap(); redraw(); };
actions.roomOpt = (el) => {
  const p = P(), room = myRoom(p), kind = el.dataset.kind, list = kind === 'items' ? ITEMS : kind === 'wall' ? WALLS : FLOORS, x = byId(list, el.dataset.id);
  if (!x) return;
  if (!p.roomOwn[x.id]) {
    if (p.coins < x.price) { sfx.no(); return toast(`You need ${x.price - p.coins} more coins for that.`); }
    addCoins(-x.price); p.roomOwn[x.id] = 1; sfx.coin(); toast('You bought it!');
  }
  if (kind === 'items') { if (room.things.length >= MAXT) return toast('Your room is full. Put something away first.'); room.things.push({ k: x.id, x: 30 + Math.random() * 40, y: x.id === 'window' || x.id === 'poster' || x.id === 'shelf' || x.id === 'lights' || x.id === 'clock' || x.id === 'mirror' ? 30 : 78 }); }
  else room[kind] = x.id;
  save(); sfx.pop(); redraw();
};
actions.roomToy = (el) => {
  const room = myRoom();
  if (room.things.length >= MAXT) return toast('Your room is full. Put something away first.');
  room.things.push({ k: el.dataset.id, x: 20 + Math.random() * 60, y: 82 }); save(); sfx.pop(); redraw();
};
actions.roomAway = () => { const room = myRoom(); if (picked < 0 || !room.things[picked]) return; room.things.splice(picked, 1); picked = -1; save(); sfx.tap(); redraw(); };
// Drag to move. A short press with no movement picks the thing instead.
let drag = null;
document.addEventListener('pointerdown', (e) => {
  const th = e.target.closest && e.target.closest('#room.edit .thing');
  if (!th) return;
  e.preventDefault();
  const st = $('#room').getBoundingClientRect();
  drag = { th, i: +th.dataset.i, st, sx: e.clientX, sy: e.clientY, moved: false };
  try { th.setPointerCapture(e.pointerId); } catch { /* fine */ }
});
document.addEventListener('pointermove', (e) => {
  if (!drag) return;
  if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6) return;
  drag.moved = true;
  const x = Math.max(4, Math.min(96, ((e.clientX - drag.st.left) / drag.st.width) * 100)), y = Math.max(8, Math.min(94, ((e.clientY - drag.st.top) / drag.st.height) * 100));
  drag.th.style.left = x + '%'; drag.th.style.top = y + '%'; drag.th.style.zIndex = Math.round(y); drag.x = x; drag.y = y;
});
const drop = () => {
  if (!drag) return;
  const room = myRoom(), t = room.things[drag.i];
  if (drag.moved && t) { t.x = drag.x; t.y = drag.y; save(); }
  else if (t) { picked = drag.i; document.querySelectorAll('#room .thing').forEach((x) => x.classList.toggle('picked', x === drag.th)); const b = $('#room-away'); if (b) b.disabled = false; sfx.tap(); }
  drag = null;
};
document.addEventListener('pointerup', drop);
document.addEventListener('pointercancel', drop);
