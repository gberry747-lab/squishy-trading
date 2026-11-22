// Trading: with computer friends, with another player on this device, or online with a room code.
import { TOYS, CATS, FRIENDS, PHRASES, registerCustom } from './data.js';
import { toySVG, icon, COL } from './art.js';
import { GAME_LIST, playGame, hooks } from './games.js';
import { roomHTML, cleanRoom, roomToSend } from './extras.js';
import { TOY_LIST } from './data.js';
import { store, save, P, addToy, removeToy, addCoins, track } from './state.js';
import { $, esc, router, actions, sfx, toyCard, coins, toast, modal, closeModal, prize, glitterBurst } from './ui.js';
import { Room, cleanToys, cleanCoins, cleanInv } from './online.js';
import { hsOnline, hsMsg, hsStop } from './play.js';

const MAX = 6;
let T = null;      // the trade table that is open
let room = null;   // the online room, if we are in one
const view = () => $('#view');
const value = (ids) => ids.reduce((a, id) => a + TOYS[id].value, 0);
const toMap = (arr) => arr.reduce((m, id) => ((m[id] = (m[id] || 0) + 1), m), {});

// ---------- friendship: every trade with a computer friend wins hearts ----------
const LEVELS = [[0, 'New friend'], [3, 'Friend'], [8, 'Good friend'], [15, 'Best friend'], [25, 'Super best friend']];
const heartsOf = (id) => (P().friends || {})[id] || 0;
const levelOf = (h) => LEVELS.reduce((a, [n], i) => (h >= n ? i : a), 0);
function addHearts(b, n) {
  const p = P(); p.friends = p.friends || {};
  const before = levelOf(p.friends[b.id] || 0);
  p.friends[b.id] = (p.friends[b.id] || 0) + n;
  const after = levelOf(p.friends[b.id]);
  if (after <= before) { save(); return ''; }
  // A new friendship level comes with a present: a toy from the friend's favorite family.
  const want = after >= 4 ? 'l' : after >= 3 ? 'e' : 'r', pool = TOY_LIST.filter((t) => !t.custom && t.cat === b.fav && t.r === want), gift = (pool.filter((t) => !p.seen[t.id])[0] || pool[Math.floor(Math.random() * pool.length)] || TOY_LIST[0]).id;
  addToy(gift); save();
  return `<p class="pill big">${b.name} is now your ${LEVELS[after][1].toLowerCase()}!</p><p>Here is a friendship present: <b>${esc(TOYS[gift].name)}</b></p>`;
}
const heartLine = (id) => { const h = heartsOf(id), lv = levelOf(h), next = LEVELS[lv + 1]; return `<small class="hearts"><span aria-hidden="true">&hearts;</span> ${h} &middot; ${LEVELS[lv][1]}${next ? '' : ' &#9733;'}</small>`; };

// ---------- friend requests: three friends each want one kind of toy today ----------
const COLNAME = { pink: 'Pink', rose: 'Rose', peach: 'Peach', cream: 'Cream', tan: 'Tan', choc: 'Brown', red: 'Red', orange: 'Orange', yellow: 'Yellow', gold: 'Gold', lime: 'Green', mint: 'Mint', teal: 'Teal', sky: 'Sky blue', blue: 'Blue', lilac: 'Lilac', grape: 'Purple', white: 'White', gray: 'Gray', navy: 'Navy' };
const RARNAME = { c: 'Common', r: 'Rare' };
function asks(p = P()) {
  if (p.daily.asks) return p.daily.asks;
  const bots = [...FRIENDS].sort(() => Math.random() - 0.5).slice(0, 3), pool = TOY_LIST.filter((t) => !t.custom && (t.r === 'c' || t.r === 'r') && COLNAME[t.c1]);
  p.daily.asks = bots.map((b) => { const t = pool[Math.floor(Math.random() * pool.length)]; return Math.random() < 0.6 ? { bot: b.id, cat: t.cat, c1: t.c1 } : { bot: b.id, cat: t.cat, r: t.r }; });
  save(); return p.daily.asks;
}
const askFits = (a, t) => !t.custom && t.cat === a.cat && (a.c1 ? t.c1 === a.c1 : t.r === a.r);
const askHave = (a, p = P()) => Object.keys(p.inv).filter((id) => TOYS[id] && askFits(a, TOYS[id]) && !(id === p.buddy && p.inv[id] < 2));
const askPay = (a) => (a.c1 ? 50 : a.r === 'r' ? 60 : 40);
function asksHTML() {
  const p = P();
  return `<section class="card"><h2>Friends are looking for...</h2><p class="muted">Find the toy a friend wants and give it to them. You win coins and two hearts.</p><div class="asks">${asks(p).map((a, i) => {
    const b = FRIENDS.find((x) => x.id === a.bot), have = askHave(a, p);
    return `<div class="ask-row ${a.done ? 'done' : ''}"><span class="mini-art">${toySVG(b.avatar)}</span><span class="ask-what"><b>${b.name}</b> <span>wants</span> <span class="pill">${a.c1 ? `<i class="sw" style="background:${COL[a.c1]}"></i>${COLNAME[a.c1]}` : RARNAME[a.r]}</span> <span class="pill">${CATS[a.cat].one}</span></span>
      ${a.done ? '<span class="pill">Done!</span>' : have.length ? `<button class="btn sm primary" data-act="askGive" data-i="${i}">Give one</button>` : `<small class="muted">You do not have one yet. Win ${coins(askPay(a))}</small>`}</div>`; }).join('')}</div></section>`;
}
actions.askGive = (el) => {
  const a = asks()[+el.dataset.i]; if (!a || a.done) return;
  modal(`<h2>Which one will you give?</h2><div class="pick-grid">${askHave(a).map((id) => toyCard(id, { act: 'askPick', extra: `data-i="${el.dataset.i}"`, count: P().inv[id] })).join('')}</div>`, { label: 'Pick a toy to give', cls: 'wide' });
};
actions.askPick = (el) => {
  const p = P(), a = asks(p)[+el.dataset.i], id = el.dataset.id, b = a && FRIENDS.find((x) => x.id === a.bot);
  if (!a || a.done || !p.inv[id] || !askFits(a, TOYS[id])) return closeModal();
  removeToy(id); addCoins(askPay(a)); a.done = 1; track('ask'); const up = addHearts(b, 2); save();
  closeModal(); router.go('trade');
  prize(`${b.name} says thank you!`, `<p>You gave ${esc(TOYS[id].name)}. You win ${coins(askPay(a))} and two hearts.</p>${up}`, b.avatar);
};

// ---------- trade hub ----------
let hubMode = 'bot';
export function tradeScreen() {
  T = null;
  const p = P(), others = store.profiles.filter((x) => x.id !== p.id);
  const mode = (k, title, sub) => `<button class="mode" data-act="tMode" data-v="${k}" aria-pressed="${hubMode === k}"><b>${title}</b><small>${sub}</small></button>`;
  const panel = hubMode === 'bot'
    ? `${asksHTML()}<section><h2>Pick a computer friend</h2><p class="muted">They get new toys every day. Each one has a favorite kind and will trade extra for it. Tap one to open the trading board.</p>
      <div class="friends">${FRIENDS.map((b) => `<button class="card friend" data-act="tBot" data-id="${b.id}"><span class="friend-art">${toySVG(b.avatar)}</span>
        <span><b>${b.name}</b><small>Loves ${CATS[b.fav].name.toLowerCase()}</small>${heartLine(b.id)}</span></button>`).join('')}</div></section>`
    : hubMode === 'local'
      ? `<section class="card"><h2>Two players, one screen</h2><p class="muted">Trade with someone sitting next to you. Each player needs their own name and toys, and you both have to agree.</p>
      <div class="row">${others.map((x) => `<button class="btn" data-act="tLocal" data-id="${x.id}"><span class="mini-art">${toySVG(x.buddy)}</span>Trade with ${esc(x.name)}</button>`).join('')}
      <button class="btn ${others.length ? '' : 'primary'}" data-act="addPlayer">Add ${others.length ? 'another' : 'the second'} player</button></div></section>`
      : `<section class="card"><h2>Trade with friends online</h2><p class="muted">One friend makes a room and tells the others the 4-letter code. Up to 6 friends can join. Ask a grown-up first!</p>
      <div class="row"><button class="btn primary" data-act="tHost">Make a room</button>
      <form class="join" data-form="join"><label class="sr" for="code">Room code</label><input id="code" name="code" maxlength="4" placeholder="CODE" autocomplete="off" autocapitalize="characters" required pattern="[A-Za-z]{4}"><button class="btn" type="submit">Join a room</button></form></div></section>`;
  return `<h1>Trading post</h1><p class="muted">Who do you want to trade with?</p>
    <div class="modes" role="group" aria-label="Who to trade with">${mode('bot', '1 player', 'You and a computer friend')}${mode('local', '2 players', 'On this iPad or computer')}${mode('online', 'Online', 'Friends on their own devices')}</div>
    ${panel}
    <section class="card giant-link"><h2>The ultimate trade</h2><p class="muted">Give some of your toys to wake up a giant squishy that is bigger than a city.</p><button class="btn primary" data-act="go" data-to="giants">See the giants</button></section>`;
}
export const setHub = (m) => { hubMode = m; };
actions.tMode = (el) => { hubMode = el.dataset.v; sfx.tap(); router.go('trade'); };

// ---------- the trade table ----------
function myAvail() { return availOf(P().inv, T.mine); }
function availOf(inv, sel) {
  return Object.keys(inv).filter((id) => TOYS[id] && inv[id] > 0)
    .sort((a, b) => TOYS[b].value - TOYS[a].value || a.localeCompare(b))
    .map((id) => [id, inv[id] - sel.filter((x) => x === id).length]);
}
function shelfHTML(inv, sel, side, canPick) {
  const list = availOf(inv, sel);
  if (!list.length) return '<p class="muted">No toys here yet.</p>';
  return list.map(([id, left]) => toyCard(id, { act: canPick ? 'tPick' : (T.mode === 'online' ? 'tWish' : ''), count: left, cls: left <= 0 ? 'used' : '', disabled: left <= 0, extra: `data-side="${side}"` })).join('');
}
function trayHTML(sel, coinN, side, canEdit) {
  const items = sel.map((id, i) => toyCard(id, { act: canEdit ? 'tDrop' : '', extra: `data-side="${side}" data-i="${i}"`, cls: 'mini' })).join('');
  return `${items}${coinN ? `<span class="tray-coins">${coins(coinN)}</span>` : ''}${!sel.length && !coinN ? '<span class="tray-empty">Nothing yet</span>' : ''}`;
}
function coinRow(side, max) {
  return `<div class="coin-row"><span>Add coins:</span>${[10, 50].map((n) => `<button class="chip" data-act="tCoin" data-side="${side}" data-n="${n}" ${max < n ? 'disabled' : ''}>+${n}</button>`).join('')}<button class="chip" data-act="tCoin" data-side="${side}" data-n="0">Clear</button></div>`;
}

// What a computer friend thinks of the trade on the table.
function botView() {
  const b = T.bot, has = T.inv;
  const give = T.theirs.reduce((a, id) => a + TOYS[id].value * (TOYS[id].cat === b.fav ? 1.2 : 1), 0);
  const get = T.mine.reduce((a, id) => a + TOYS[id].value * (TOYS[id].cat === b.fav ? 1.4 : 1) * (has[id] ? 0.7 : 1), 0) + T.myCoins * 0.7;
  const ratio = give ? get / give : 0;
  let mood = 'idle', say = b.say;
  if (T.theirs.length && (T.mine.length || T.myCoins)) {
    if (ratio >= b.thr * 1.4) { mood = 'love'; say = 'Wow, yes yes YES! You are so generous!'; }
    else if (ratio >= b.thr) { mood = 'happy'; say = 'That looks fair to me. Deal?'; }
    else if (ratio >= b.thr * 0.7) { mood = 'hmm'; say = 'Hmm... almost! Can you add a little more?'; }
    else { mood = 'sad'; say = 'That is not enough for my toys.'; }
  } else if (T.theirs.length) say = 'Good pick! What will you give me for it?';
  else if (T.mine.length) say = 'Ooh! Now tap one of my toys that you want.';
  return { give, get, ratio, mood, say, ok: ratio >= b.thr && T.theirs.length > 0 };
}
function botHint() {
  const b = T.bot, v = botView(), need = v.give * b.thr - v.get;
  const cand = myAvail().filter(([id, left]) => left > 0 && !T.theirs.includes(id) && !T.inv[id]).map(([id]) => [id, TOYS[id].value * (TOYS[id].cat === b.fav ? 1.4 : 1) * (T.inv[id] ? 0.7 : 1)])
    .filter(([, val]) => val >= need).sort((a, c) => a[1] - c[1])[0];
  if (cand && T.mine.length < MAX) return `Add your ${TOYS[cand[0]].name} and it is a deal!`;
  const c = Math.ceil(need / 0.7 / 5) * 5;
  if (T.myCoins + c <= P().coins) return `Add ${c} more coins and it is a deal!`;
  return 'Try asking for fewer of my toys.';
}

// Grace's trading board: two halves with a line down the middle. Each trader has
// three buttons: check = accept, plus = add to the offer, X = decline.
const SYM = {
  yes: '<path d="M5 13l5 6L20 5"/>',
  add: '<path d="M12 4v16M4 12h16"/>',
  no: '<path d="M5 5l14 14M19 5L5 19"/>',
};
const WORD = { yes: 'Accept', add: 'Add', no: 'Decline' };
function key(kind, o = {}) {
  const inner = `<svg viewBox="0 0 24 24" aria-hidden="true">${SYM[kind]}</svg><span>${WORD[kind]}</span>`;
  const cls = `key key-${kind}${o.on ? ' on' : ''}`;
  if (!o.act) return `<span class="${cls} lamp" role="img" aria-label="${esc(o.label || WORD[kind])}${o.on ? ' (lit)' : ''}">${inner}</span>`;
  return `<button class="${cls}" data-act="${o.act}" ${o.extra || ''} aria-label="${esc(o.label || WORD[kind])}" ${o.on !== undefined ? `aria-pressed="${!!o.on}"` : ''} ${o.disabled ? 'disabled' : ''}>${inner}</button>`;
}

// The trading table always fits on one screen, so nothing has to be scrolled to read it.
function fitTable() {
  const v = view();
  if (!v || !v.classList.contains('v-table')) return;
  window.scrollTo(0, 0);
  const nav = $('#nav'), under = nav && getComputedStyle(nav).position === 'fixed' ? nav.offsetHeight : 0;
  document.documentElement.style.setProperty('--table-h', Math.max(430, window.innerHeight - v.getBoundingClientRect().top - under) + 'px');
}
window.addEventListener('resize', fitTable);
function draw() {
  const p = P();
  let who, theirShelf = '', say = '', mood = 'idle', mine, theirs, extra = '';
  const ready = T.mine.length + T.theirs.length + T.myCoins + T.theirCoins > 0;
  if (T.mode === 'bot') {
    const v = botView(); say = v.say; mood = v.mood;
    who = { name: T.bot.name, art: T.bot.avatar };
    theirShelf = `<h2>${esc(who.name)}'s toys <small>Tap the ones you want</small></h2><div class="shelf">${shelfHTML(T.inv, T.theirs, 'theirs', true)}</div>`;
    mine = key('no', { act: 'tDecline', label: 'Decline and clear the board', disabled: !ready }) + key('add', { act: 'tAdd', extra: 'data-side="mine"', label: 'Add your toys or coins to the offer' }) + key('yes', { act: 'tOffer', label: 'Accept and offer this trade', disabled: !(T.theirs.length && (T.mine.length || T.myCoins)) });
    theirs = key('yes', { on: mood === 'happy' || mood === 'love', label: `${who.name} would accept` }) + key('add', { on: mood === 'hmm', label: `${who.name} wants you to add more` }) + key('no', { on: mood === 'sad', label: `${who.name} would decline` });
  } else if (T.mode === 'local') {
    who = { name: T.other.name, art: T.other.buddy };
    say = 'Press + to add toys. When you both press the check, it is a deal!';
    mine = key('no', { act: 'tDecline', label: `${p.name} declines`, disabled: !ready }) + key('add', { act: 'tAdd', extra: 'data-side="mine"', label: `${p.name} adds to the offer` }) + key('yes', { act: 'tAgree', extra: 'data-who="A"', on: T.agreeA, label: `${p.name} accepts`, disabled: !ready });
    theirs = key('yes', { act: 'tAgree', extra: 'data-who="B"', on: T.agreeB, label: `${T.other.name} accepts`, disabled: !ready }) + key('add', { act: 'tAdd', extra: 'data-side="theirs"', label: `${T.other.name} adds to the offer` }) + key('no', { act: 'tDecline', label: `${T.other.name} declines`, disabled: !ready });
  } else {
    who = { name: T.name, art: T.avatar };
    say = T.said || (T.theirLock ? 'I pressed the check. I am ready to deal!' : 'Tap my toys to tell me what you would like.');
    mood = T.theirLock ? 'happy' : 'idle';
    theirShelf = `<h2>${esc(who.name)}'s toys <small>Tap to ask for one</small></h2><div class="shelf">${shelfHTML(T.theirInv, T.theirs, 'theirs', false)}</div>`;
    mine = key('no', { act: 'tDecline', label: 'Decline and clear the board', disabled: !ready }) + key('add', { act: 'tAdd', extra: 'data-side="mine"', label: 'Add your toys or coins to the offer' }) + key('yes', { act: 'tDeal', on: T.myLock, label: T.myLock ? 'You accepted. Tap to change your mind' : 'Accept this trade', disabled: !ready });
    theirs = key('yes', { on: T.theirLock, label: `${who.name} accepted` }) + key('add', { on: T.said === PHRASES[2], label: `${who.name} asks you to add more` }) + key('no', { on: T.said === PHRASES[3], label: `${who.name} said no thanks` });
    extra = `<div class="phrases">${PHRASES.map((ph, i) => `<button class="chip" data-act="tSay" data-i="${i}">${ph}</button>`).join('')}</div>`;
  }
  const worthMine = value(T.mine) + T.myCoins, worthTheirs = value(T.theirs) + T.theirCoins;
  const keep = [...document.querySelectorAll('.v-table .shelf')].map((el) => el.scrollLeft);
  view().className = 'view v-table';
  view().innerHTML = `<div class="table-top"><button class="btn back" data-act="tBack">${icon('back')} ${T.mode === 'online' ? 'Room' : 'Trading post'}</button>
    <section class="who-row mood-${mood}"><span class="friend-art squish" data-squish data-toy="${who.art}">${toySVG(who.art)}</span><p class="bubble" aria-live="polite"><b translate="no">${esc(who.name)}:</b> ${esc(say)}</p></section></div>
    ${theirShelf}
    <section class="board" aria-label="Trading board">
      <div class="keys keys-theirs" role="group" aria-label="${esc(who.name)}'s buttons">${theirs}</div>
      <div class="half half-theirs"><h3>${esc(who.name)} gives <small>worth ${worthTheirs}</small></h3><div class="tray-items">${trayHTML(T.theirs, T.theirCoins, 'theirs', T.mode !== 'online')}</div></div>
      <div class="half half-mine"><h3>${T.mode === 'local' ? esc(p.name) + ' gives' : 'You give'} <small>worth ${worthMine}</small></h3><div class="tray-items">${trayHTML(T.mine, T.myCoins, 'mine', true)}</div></div>
      <div class="keys keys-mine" role="group" aria-label="Your buttons">${mine}</div>
    </section>
    <div class="table-foot"><p class="board-help muted"><b>&check;</b> accept &nbsp; <b>+</b> add to the offer &nbsp; <b>&times;</b> decline. Tap a toy on the board to take it off.</p>
    <button class="btn sm" data-act="tBomb">Throw a glitter bomb</button></div>${extra}`;
  fitTable();
  document.querySelectorAll('.v-table .shelf').forEach((el, i) => { el.scrollLeft = keep[i] || 0; });
  if (T.pick && !$('#modal').hidden) picker(T.pick);
}

// The "+" button opens this: pick toys and coins to put on the board.
function picker(side) {
  const p = P(), mineSide = side === 'mine';
  const owner = mineSide ? p : T.other;
  const sel = mineSide ? T.mine : T.theirs, coinN = mineSide ? T.myCoins : T.theirCoins;
  const top = $('#modal .modal-card') ? $('#modal .modal-card').scrollTop : 0;
  const again = !$('#modal').hidden && T.pick === side;
  T.pick = side;
  modal(`<h2>${T.mode === 'local' ? esc(owner.name) + ' adds to the offer' : 'Add to your offer'}</h2>
    <p class="muted">Tap a toy to put it on the board. ${sel.length} of ${MAX} toys added${coinN ? `, plus ${coinN} coins` : ''}.</p>
    ${coinRow(side, owner.coins - coinN)}
    <div class="grid pick-grid">${shelfHTML(owner.inv, sel, side, true)}</div>
    <button class="btn primary big" data-act="closeModal">Done</button>`, { cls: 'wide picker' + (again ? ' still' : ''), label: 'Add to the offer', onClose: () => { if (T) T.pick = null; } });
  $('#modal .modal-card').scrollTop = top;
}
let lastBomb = 0;
function boom(who) {
  glitterBurst(innerWidth / 2, innerHeight * 0.45, 130, 1.4); sfx.bomb();
  if (who) toast(`${esc(who)} threw a glitter bomb!`, 1800);
}
actions.tBomb = () => {
  if (Date.now() - lastBomb < 1200) return;
  lastBomb = Date.now(); boom(); track('bomb');
  if (T && T.mode === 'online' && room) room.send(T.pid, { t: 'bomb' });
};
actions.tAdd = (el) => { sfx.tap(); picker(el.dataset.side); };
actions.tDecline = () => {
  sfx.no();
  if (T.mode === 'online') room.send(T.pid, { t: 'decline' });
  Object.assign(T, { mine: [], theirs: T.mode === 'online' ? T.theirs : [], myCoins: 0, theirCoins: T.mode === 'online' ? T.theirCoins : 0, pick: null });
  closeModal();
  changedOffer();
  toast(T.mode === 'bot' ? 'No deal. The board is clear.' : 'Declined. The board is clear.');
};

function changedOffer() {
  if (T.mode === 'local') T.agreeA = T.agreeB = false;
  if (T.mode === 'online') sendOffer();
  draw();
}
actions.tPick = (el) => {
  const side = el.dataset.side, list = side === 'mine' ? T.mine : T.theirs;
  if (list.length >= MAX) return toast(`Only ${MAX} toys on each side.`);
  list.push(el.dataset.id); sfx.pop(); changedOffer();
};
actions.tDrop = (el) => { (el.dataset.side === 'mine' ? T.mine : T.theirs).splice(+el.dataset.i, 1); sfx.tap(); changedOffer(); };
actions.tCoin = (el) => {
  const n = +el.dataset.n, mine = el.dataset.side === 'mine';
  const max = mine ? P().coins : T.other ? T.other.coins : 0;
  if (mine) T.myCoins = n ? Math.min(max, T.myCoins + n) : 0; else T.theirCoins = n ? Math.min(max, T.theirCoins + n) : 0;
  sfx.tap(); changedOffer();
};
actions.tBack = () => {
  if (T && T.mode === 'online' && room) { room.send(T.pid, { t: 'bye' }); T = null; return lobby(); }
  router.go('trade');
};

function doSwap(p, give, giveCoins, get, getCoins, friend) {
  get.forEach((id) => addToy(id, 1, p));
  give.forEach((id) => removeToy(id, 1, p));
  addCoins(getCoins - giveCoins, p);
  track('trade', 1, p);
  if (friend) track('friendtrade', 1, p);
}
function celebrate(get, getCoins, line) {
  const names = get.map((id) => esc(TOYS[id].name)).join(', ');
  prize('Trade done!', `<p>${line}</p>${get.length ? `<p>You got: <b>${names}</b>${getCoins ? ` and ${coins(getCoins)}` : ''}.</p>` : getCoins ? `<p>You got ${coins(getCoins)}.</p>` : ''}`, get[0]);
}

// ---------- computer friends ----------
actions.tBot = (el) => {
  const base = FRIENDS.find((b) => b.id === el.dataset.id), bot = { ...base, thr: base.thr * (1 - 0.03 * levelOf(heartsOf(base.id))) }; // better friends give kinder deals
  T = { mode: 'bot', bot, inv: toMap(P().daily.bots[bot.id]), mine: [], theirs: [], myCoins: 0, theirCoins: 0 };
  sfx.tap(); draw(); window.scrollTo(0, 0);
};
actions.tOffer = () => {
  const v = botView(), b = T.bot, p = P();
  if (!v.ok) {
    sfx.no(); $('.who-row').classList.add('shake');
    return toast(`<b>${b.name}:</b> ${esc(botHint())}`, 4200);
  }
  // A friend who gets much more than they give hands some coins back. Fair is fair.
  const back = v.mood === 'love' ? Math.max(0, Math.round(((v.get - v.give * b.thr * 1.2) * 0.5) / 5) * 5) : 0;
  const get = [...T.theirs], give = [...T.mine];
  doSwap(p, give, T.myCoins, get, back, false);
  const inv = p.daily.bots[b.id];
  get.forEach((id) => { const k = inv.indexOf(id); if (k >= 0) inv.splice(k, 1); });
  inv.push(...give); save();
  T = { mode: 'bot', bot: b, inv: toMap(inv), mine: [], theirs: [], myCoins: 0, theirCoins: 0 };
  draw();
  const up = addHearts(b, v.mood === 'love' ? 2 : 1);
  celebrate(get, back, (back ? `${b.name} says: "You gave me so much! Here are some coins to make it fair."` : `${b.name} says: "Thank you! Great trade!"`) + (up ? `</p>${up}<p>` : ''));
};

// ---------- a friend on this device ----------
actions.tLocal = (el) => {
  const other = store.profiles.find((x) => x.id === el.dataset.id);
  T = { mode: 'local', other, mine: [], theirs: [], myCoins: 0, theirCoins: 0, agreeA: false, agreeB: false };
  sfx.tap(); draw(); window.scrollTo(0, 0);
};
actions.tAgree = (el) => {
  if (el.dataset.who === 'A') T.agreeA = !T.agreeA; else T.agreeB = !T.agreeB;
  sfx.tap();
  if (!(T.agreeA && T.agreeB)) return draw();
  const p = P(), o = T.other, get = [...T.theirs], give = [...T.mine], gc = T.theirCoins, mc = T.myCoins;
  doSwap(p, give, mc, get, gc, true);
  doSwap(o, get, gc, give, mc, true);
  T = { mode: 'local', other: o, mine: [], theirs: [], myCoins: 0, theirCoins: 0, agreeA: false, agreeB: false };
  draw();
  celebrate(get, gc, `${esc(p.name)} and ${esc(o.name)} shook hands. Both shelves are updated!`);
};

// Buttons on a trading board that has just closed (the friend left a moment ago) do nothing.
['tPick', 'tDrop', 'tCoin', 'tDecline', 'tDeal', 'tSay', 'tWish', 'tAdd', 'tOffer', 'tAgree'].forEach((k) => {
  const fn = actions[k];
  actions[k] = (...a) => { if (!T || ((k === 'tDeal' || k === 'tSay' || k === 'tWish') && !room)) return; return fn(...a); };
});

// ---------- online ----------
const info = () => ({ name: P().name, avatar: P().buddy });
function leaveRoom() { if (room) { room.leave(); room = null; } T = null; VS = null; HS = null; hsStop(); hooks.finish = null; }
function wire() {
  room.on('players', () => {
    if (T && T.mode === 'online' && !room.players.some((x) => x.id === T.pid)) { closeModal(); T = null; toast('Your friend left the room.'); }
    if (VS && !room.players.some((x) => x.id === VS.pid)) { toast('Your friend left the room.'); if (VS.theirs == null) VS.theirs = -1; if (VS.mine != null) showVs(); }
    if (HS && !room.players.some((x) => x.id === HS.pid)) { toast('Your friend left the room.'); hsStop(); HS = null; }
    if (!T && !VS && !HS) lobby();
  });
  room.on('closed', () => { leaveRoom(); router.go('trade'); toast('The room closed.'); });
  room.on('error', () => toast('The connection had a hiccup.'));
  room.on('msg', onMsg);
}
function connecting(text) {
  view().innerHTML = `<section class="card room"><h1>${text}</h1><div class="loader" aria-hidden="true">${toySVG('sp07')}</div><p class="muted">This can take a few seconds.</p></section>`;
}
actions.tHost = async () => {
  leaveRoom(); connecting('Making your room...');
  room = new Room(info());
  router.cleanup = leaveRoom;
  try { await room.host(); wire(); lobby(); }
  catch { leaveRoom(); router.go('trade'); toast('Could not make a room. Check the internet and try again.', 4000); }
};
actions.form_join = async (f) => {
  const code = String(new FormData(f).get('code') || '').toUpperCase().replace(/[^A-Z]/g, '');
  if (code.length !== 4) return toast('Room codes have 4 letters.');
  leaveRoom(); connecting(`Joining room ${code}...`);
  room = new Room(info());
  router.cleanup = leaveRoom;
  try { await room.join(code); wire(); lobby(); }
  catch (e) { leaveRoom(); router.go('trade'); toast(e.message === 'full' ? 'That room is full.' : 'Could not find that room. Check the code and try again.', 4000); }
};
function lobby() {
  if (!room) return;
  const others = room.players.filter((x) => x.id !== room.me);
  view().className = 'view v-lobby';
  view().innerHTML = `<button class="btn back" data-act="go" data-to="trade">${icon('back')} Leave room</button>
    <section class="card room"><p class="muted">Room code</p><p class="code" aria-label="Room code ${room.code.split('').join(' ')}">${room.code.split('').map((c) => `<span>${c}</span>`).join('')}</p>
      <p>Tell your friend this code. They tap <b>Trade</b>, type the code and press <b>Join a room</b>.</p></section>
    <h2>Friends in this room</h2>
    <div class="friends">${others.map((x) => `<button class="card friend" data-act="tMenu" data-id="${esc(x.id)}"><span class="friend-art">${toySVG(x.avatar)}</span><span><b translate="no">${esc(x.name)}</b><small>Tap to trade, play or visit</small></span></button>`).join('') || '<p class="muted">Waiting for friends to join... Keep this screen open.</p>'}</div>`;
}
actions.tInvite = (el) => { closeModal(); room.send(el.dataset.id, { t: 'invite' }); toast('Asking them to trade...'); };
// ---------- online: play a game against a friend, or visit their room ----------
const VS_GAMES = ['pop', 'letters', 'stopgo', 'addsub', 'bigger', 'firstsound', 'where'].filter((id) => GAME_LIST.some((g) => g.id === id));
const gameName = (id) => (GAME_LIST.find((g) => g.id === id) || {}).name || '';
let VS = null, askedGame = null, askedRoom = '', HS = null, askedHide = '';
actions.tMenu = (el) => {
  const pl = room && room.players.find((x) => x.id === el.dataset.id); if (!pl) return;
  const id = esc(pl.id);
  modal(`<div class="prize"><div class="prize-toy">${toySVG(pl.avatar)}</div><h2 translate="no">${esc(pl.name)}</h2>
    <div class="modes"><button class="mode" data-act="tInvite" data-id="${id}"><b>Trade</b><small>Swap toys on the trading board</small></button>
    <button class="mode" data-act="tGamePick" data-id="${id}"><b>Play a game</b><small>Same game, same time. Who gets the best score?</small></button>
    <button class="mode" data-act="tHideAsk" data-id="${id}"><b>Hide and seek</b><small>Hide squishies for your friend to find</small></button>
    <button class="mode" data-act="tVisit" data-id="${id}"><b>Visit their room</b><small>See how they decorated it</small></button></div></div>`, { label: 'What do you want to do?' });
};
actions.tGamePick = (el) => {
  modal(`<h2>Pick a game to play together</h2><div class="modes">${VS_GAMES.map((g) => `<button class="mode" data-act="tGameAsk" data-id="${esc(el.dataset.id)}" data-g="${g}"><b>${gameName(g)}</b></button>`).join('')}</div>`, { label: 'Pick a game' });
};
actions.tGameAsk = (el) => { closeModal(); askedGame = { pid: el.dataset.id, g: el.dataset.g }; room.send(el.dataset.id, { t: 'game?', g: el.dataset.g }); toast('Asking them to play...'); };
actions.tGameYes = (el) => { room.send(el.dataset.id, { t: 'game!', g: el.dataset.g }); startVs(el.dataset.id, el.dataset.g); };
actions.tVisit = (el) => { closeModal(); askedRoom = el.dataset.id; room.send(el.dataset.id, { t: 'room?' }); toast('Knocking on their door...'); };
// ---------- online: hide and seek ----------
actions.tHideAsk = (el) => { closeModal(); askedHide = el.dataset.id; room.send(el.dataset.id, { t: 'hs?' }); toast('Asking them to play...'); };
actions.tHideYes = (el) => { if (!room) return; room.send(el.dataset.id, { t: 'hs!' }); startHs(el.dataset.id, 'them'); };
function startHs(pid, first) {
  const pl = room.players.find((x) => x.id === pid); if (!pl) return;
  closeModal(); askedHide = '';
  HS = { pid };
  router.cleanup = leaveRoom; // walking away from the game leaves the room
  hsOnline({ first, name: pl.name, send: (m) => { if (room) room.send(pid, { ...m, t: 'hs' }); }, exit: () => { HS = null; if (room) { router.cleanup = leaveRoom; lobby(); } else router.go('trade'); } });
}
function startVs(pid, g) {
  const pl = room.players.find((x) => x.id === pid); if (!pl || !VS_GAMES.includes(g)) return;
  closeModal(); askedGame = null;
  VS = { pid, g, name: pl.name, avatar: pl.avatar, mine: null, theirs: null, paid: false };
  hooks.finish = (gm, score) => { if (!VS || !room) return; VS.mine = score; room.send(VS.pid, { t: 'score', g: VS.g, n: score }); showVs(); };
  playGame(g);
  const stop = router.cleanup;
  router.cleanup = () => { if (stop) stop(); endVs(); leaveRoom(); }; // walking away from the game leaves the room
}
function endVs() { hooks.finish = null; VS = null; }
function showVs() {
  if (!VS) return;
  const me = VS.mine, them = VS.theirs, both = them != null, gone = them === -1;
  const line = !both ? 'Waiting for your friend to finish...' : gone ? 'Your friend left the game.' : me > them ? 'You win!' : me < them ? 'Your friend wins this time. Good game!' : 'It is a tie!';
  if (both && !gone && me >= them && !VS.paid) { VS.paid = true; addCoins(10); sfx.win(); }
  view().className = 'view v-lobby';
  view().innerHTML = `<section class="card result"><h1>${gameName(VS.g)}</h1><div class="vs-row"><div><div class="vs-art">${toySVG(P().buddy)}</div><b>You</b><span class="vs-n">${me}</span></div><div><div class="vs-art">${toySVG(VS.avatar)}</div><b translate="no">${esc(VS.name)}</b><span class="vs-n">${both && !gone ? them : '...'}</span></div></div>
    <p class="game-say">${line}</p>${both && !gone && me >= them ? `<p>Bonus: ${coins(10)}</p>` : ''}<button class="btn primary big" data-act="tVsBack">Back to the room</button></section>`;
}
actions.tVsBack = () => { endVs(); router.cleanup = leaveRoom; lobby(); };
function openOnline(pid) {
  const pl = room.players.find((x) => x.id === pid);
  if (!pl) return;
  closeModal();
  T = { mode: 'online', pid, name: pl.name, avatar: pl.avatar, theirInv: {}, mine: [], theirs: [], myCoins: 0, theirCoins: 0, myLock: false, theirLock: false, theirSig: '', said: '' };
  // Send the drawings of any handmade squishies first, so the other device can show them.
  const defs = Object.keys(P().inv).filter((id) => TOYS[id] && TOYS[id].custom).map((id) => TOYS[id].art);
  if (defs.length) room.send(pid, { t: 'defs', defs });
  sendOffer(); draw(); window.scrollTo(0, 0);
}
const dropVote = () => { const t = T; setTimeout(() => { if (t && !t.myLock) t.voted = ''; }, 2500); };
function sendOffer() {
  if (T.myLock) { T.myLock = false; room.send(T.pid, { t: 'lock', v: false }); dropVote(); }
  T.theirLock = false;
  room.send(T.pid, { t: 'offer', toys: T.mine, coins: T.myCoins, inv: P().inv });
}
const sigOf = (mine, mc, theirs, tc) => JSON.stringify([[room.me, [...mine].sort(), mc], [T.pid, [...theirs].sort(), tc]].sort((a, b) => (a[0] < b[0] ? -1 : 1)));
const sig = () => sigOf(T.mine, T.myCoins, T.theirs, T.theirCoins);
function tryCommit() {
  // The player with the "smaller" id decides, so both devices can never disagree.
  if (!(room.me < T.pid) || !T.myLock || !T.theirLock || T.theirSig !== sig()) return;
  room.send(T.pid, { t: 'commit', give: T.mine, giveCoins: T.myCoins, get: T.theirs, getCoins: T.theirCoins });
  finishOnline(T.mine, T.myCoins, T.theirs, T.theirCoins);
}
function finishOnline(give, giveCoins, get, getCoins) {
  const p = P(), name = T.name;
  const left = { ...p.inv };
  give = give.filter((id) => left[id] > 0 && left[id]-- > 0);
  doSwap(p, give, Math.min(giveCoins, p.coins), get, getCoins, true);
  Object.assign(T, { mine: [], theirs: [], myCoins: 0, theirCoins: 0, myLock: false, theirLock: false, said: '' });
  room.send(T.pid, { t: 'offer', toys: [], coins: 0, inv: p.inv });
  draw();
  celebrate(get, getCoins, `You and ${esc(name)} made a deal!`);
}
actions.tDeal = () => {
  if (!T || !room) return;
  T.myLock = !T.myLock; sfx.tap();
  if (T.myLock) T.voted = sig(); else dropVote();
  room.send(T.pid, { t: 'lock', v: T.myLock, sig: sig() });
  draw(); tryCommit();
};
actions.tSay = (el) => { if (!T || !room) return; room.send(T.pid, { t: 'say', i: +el.dataset.i }); toast(`You said: "${PHRASES[+el.dataset.i]}"`, 1500); };
actions.tWish = (el) => { if (!T || !room) return; room.send(T.pid, { t: 'wish', id: el.dataset.id }); toast(`You asked for ${esc(TOYS[el.dataset.id].name)}.`, 1500); };
actions.tInviteYes = (el) => { room.send(el.dataset.id, { t: 'accept' }); openOnline(el.dataset.id); };
actions.tInviteNo = (el) => { room.send(el.dataset.id, { t: 'no' }); closeModal(); };

function onMsg(from, m) {
  const pl = room.players.find((x) => x.id === from);
  if (!pl) return;
  if (m.t === 'room?') return room.send(from, { t: 'room', room: roomToSend() });
  if (m.t === 'room') {
    if (askedRoom !== from) return;
    askedRoom = '';
    return modal(`<h2><span translate="no">${esc(pl.name)}</span></h2><p class="muted">This is their room.</p>${roomHTML(cleanRoom(m.room), false)}`, { label: 'A friend\'s room', cls: 'wide' });
  }
  if (m.t === 'game?') {
    const g = String(m.g || '');
    if (T || VS || HS || !VS_GAMES.includes(g)) return room.send(from, { t: 'no', busy: true });
    sfx.pop();
    return modal(`<div class="prize"><div class="prize-toy">${toySVG(pl.avatar)}</div><h2><span translate="no">${esc(pl.name)}</span> <span>wants to play</span> <span>${gameName(g)}</span></h2>
      <div class="row center"><button class="btn primary big" data-act="tGameYes" data-id="${esc(from)}" data-g="${g}">Yes!</button><button class="btn big" data-act="tInviteNo" data-id="${esc(from)}">Not now</button></div></div>`, { label: 'Game invite' });
  }
  if (m.t === 'hs?') {
    if (T || VS || HS) return room.send(from, { t: 'no', busy: true });
    sfx.pop();
    return modal(`<div class="prize"><div class="prize-toy">${toySVG(pl.avatar)}</div><h2><span translate="no">${esc(pl.name)}</span> <span>wants to play</span> <span>Hide and seek</span></h2><p class="muted">They hide the squishies first. You seek.</p>
      <div class="row center"><button class="btn primary big" data-act="tHideYes" data-id="${esc(from)}">Yes!</button><button class="btn big" data-act="tInviteNo" data-id="${esc(from)}">Not now</button></div></div>`, { label: 'Game invite' });
  }
  if (m.t === 'hs!') { if (askedHide === from && !T && !VS && !HS) startHs(from, 'me'); return; }
  if (m.t === 'hs') { if (HS && HS.pid === from) hsMsg(m); return; }
  if (m.t === 'game!') { if (askedGame && askedGame.pid === from && askedGame.g === m.g && !T && !VS) startVs(from, askedGame.g); return; }
  if (m.t === 'score') { if (VS && VS.pid === from && m.g === VS.g) { VS.theirs = cleanCoins(m.n); if (VS.mine != null) showVs(); } return; }
  if (m.t === 'invite') {
    if (T || VS || HS) return room.send(from, { t: 'no', busy: true });
    sfx.pop();
    return modal(`<div class="prize"><div class="prize-toy">${toySVG(pl.avatar)}</div><h2>${esc(pl.name)} wants to trade!</h2>
      <div class="row center"><button class="btn primary big" data-act="tInviteYes" data-id="${esc(from)}">Yes!</button><button class="btn big" data-act="tInviteNo" data-id="${esc(from)}">Not now</button></div></div>`, { label: 'Trade invite' });
  }
  if (m.t === 'accept') return openOnline(from);
  if (m.t === 'no') return toast(m.busy ? `${esc(pl.name)} is busy trading.` : `${esc(pl.name)} said not right now.`);
  if (!T || T.mode !== 'online' || T.pid !== from) return;
  if (m.t === 'defs' && Array.isArray(m.defs)) {
    m.defs.slice(0, 60).forEach((d) => { if (!d || TOYS[d.id] || Object.keys(store.custom).length >= 300) return; const made = registerCustom(d); if (made) store.custom[made.id] = made.art; });
    save(); return draw();
  }
  if (m.t === 'offer') {
    T.theirs = cleanToys(m.toys); T.theirCoins = cleanCoins(m.coins); T.theirInv = cleanInv(m.inv);
    T.theirLock = false;
    if (T.myLock) { T.myLock = false; room.send(from, { t: 'lock', v: false }); dropVote(); }
    draw();
  } else if (m.t === 'lock') {
    T.theirLock = !!m.v; T.theirSig = String(m.sig || '');
    if (T.theirLock) sfx.pop();
    draw(); tryCommit();
  } else if (m.t === 'commit') {
    // Only accept a deal this player really pressed Deal on.
    const give = cleanToys(m.get), gc = cleanCoins(m.getCoins), get = cleanToys(m.give), tc = cleanCoins(m.giveCoins);
    if (sigOf(give, gc, get, tc) === T.voted) { T.voted = ''; finishOnline(give, gc, get, tc); }
  } else if (m.t === 'say' && PHRASES[m.i]) { T.said = PHRASES[m.i]; sfx.pop(); draw(); }
  else if (m.t === 'wish' && TOYS[m.id]) { T.said = `I would love your ${TOYS[m.id].name}!`; sfx.pop(); draw(); }
  else if (m.t === 'bomb') { if (Date.now() - lastBomb > 1200) { lastBomb = Date.now(); boom(pl.name); } }
  else if (m.t === 'decline') { T.mine = []; T.myCoins = 0; T.said = PHRASES[3]; sfx.no(); closeModal(); sendOffer(); draw(); toast(`${esc(pl.name)} declined. The board is clear.`); }
  else if (m.t === 'bye') { closeModal(); T = null; toast(`${esc(pl.name)} left the trade.`); lobby(); }
}
