import { TOYS, CATS, RARITY, BAGS, QUESTS, GOALS, WHEEL, STORIES, FRIENDS, byCat, TOY_LIST, playStyle, QUEST } from './data.js';
import { toySVG, icon, coinSVG } from './art.js';
import { store, save, P, ensureDaily, addToy, removeToy, addCoins, count, ownedList, uniqueCount, track, newProfile, onChange, goalProgress, readyGoals, rollToy, rng, pick, today } from './state.js';
import { $, esc, router, actions, sfx, playSound, glitterBurst, toggleMute, toyCard, coins, toast, modal, closeModal, confetti, prize } from './ui.js';
import { tradeScreen, setHub } from './trade.js';
import { gamesScreen, GAME_LIST } from './games.js';
import { can3D, mount3D, dispose3D } from './buddy3d.js';
import { studioScreen, studioReady, myDrawings, editDrawing, newDrawing } from './studio.js';
import { initLang, lang, setLang, say } from './i18n.js';
import { guideVisit, initGuide } from './guide.js';
import { albumScreen, roomScreen, homeExtras } from './extras.js';
import { myStoryScreen, initMyStory } from './mystory.js';
import { giantsScreen, goalCard } from './giants.js';
import { basketHTML, likeScreen, pretendScreen, hideScreen } from './play.js';

const view = $('#view');
let tab = 'home';
let shelf = 'mine';

// ---------- header + navigation ----------
function header() {
  const p = P();
  document.body.classList.toggle('easy', store.easy !== false);
  document.body.classList.toggle('no-profile', !p);
  if (!p) return;
  $('#coins').innerHTML = coins(p.coins);
  $('#who').innerHTML = `<span class="who-art">${toySVG(p.buddy, p.style)}</span><span class="who-name" translate="no">${esc(p.name)}</span>`;
  $('#sound').innerHTML = icon(store.mute ? 'mute' : 'sound');
  $('#sound').setAttribute('aria-label', store.mute ? 'Turn sound on' : 'Turn sound off');
  const dot = readyGoals(p).length + p.daily.quests.filter((q) => !q.claimed && q.n >= QUESTS.find((x) => x.id === q.id).goal).length + (p.daily.spun ? 0 : 1);
  $('#nav [data-to="home"]').classList.toggle('dot', dot > 0);
}
onChange(header);

const SCREENS = { home, toys, trade: tradeScreen, games: gamesScreen, stories, shop, studio: studioScreen, quest, album: albumScreen, room: roomScreen, mystory: myStoryScreen, giants: giantsScreen, like: likeScreen, pretend: pretendScreen, hide: hideScreen };
function go(to = tab, arg) {
  if (router.cleanup) { router.cleanup(); router.cleanup = null; }
  if (!P()) return welcome();
  ensureDaily();
  tab = to;
  document.querySelectorAll('#nav button').forEach((b) => b.setAttribute('aria-current', b.dataset.to === (to === 'studio' ? 'toys' : to === 'quest' || to === 'mystory' ? 'stories' : to === 'like' || to === 'pretend' || to === 'hide' ? 'games' : to === 'album' || to === 'room' || to === 'giants' ? 'home' : to) ? 'page' : 'false'));
  view.className = 'view v-' + to;
  view.innerHTML = SCREENS[to](arg);
  header();
  if (to === 'studio') studioReady(); else window.scrollTo(0, 0);
  dispose3D();
  if (to === 'home' && can3D(P().buddy)) mount3D($('.hero-toy'), P().buddy).then((ok) => { const h = $('#squish-hint'); if (ok && h) h.hidden = false; });
  guideVisit(to);
}
router.go = go;
initGuide(go);
actions.go = (el) => { sfx.tap(); go(el.dataset.to); };
actions.closeModal = () => closeModal();
actions.sound = () => { toggleMute(); header(); };

// ---------- welcome ----------
let pickStarter = 'sq04', pickStyle = 'girl';
function welcome(adding = false) {
  document.body.classList.add('no-profile');
  view.className = 'view v-welcome';
  const first = store.profiles.length === 0;
  view.innerHTML = `<section class="welcome">
    <div class="welcome-toys" aria-hidden="true">${['sq12', 'pl02', 'fi01', 'sl05', 'sp07'].map((id, i) => `<span style="--i:${i}">${toySVG(id)}</span>`).join('')}</div>
    <div class="lang-row" role="group" aria-label="Language" translate="no"><button class="chip" data-act="lang" data-v="en" aria-pressed="${lang() === 'en'}">English</button><button class="chip" data-act="lang" data-v="es" aria-pressed="${lang() === 'es'}">Espa\u00f1ol</button></div>
    <h1 class="big-title"><small translate="no">Grace Emilia's</small><span translate="no">Squishy Trades</span></h1>
    <p class="lead">Collect squishies, slimes, fidgets and more. Trade with friends. Win coins. Squish everything.</p>
    <form class="card welcome-form" data-form="start">
      <label for="nm">What is your name?</label>
      <input id="nm" name="name" maxlength="14" autocomplete="off" value="${first ? 'Grace Emilia' : ''}" placeholder="Your name" required>
      <fieldset><legend>Is your squishy a girl or a boy?</legend>
        <div class="row"><button class="chip" type="button" data-act="pickStyle" data-v="girl" aria-pressed="${pickStyle === 'girl'}">Girl squishy</button><button class="chip" type="button" data-act="pickStyle" data-v="boy" aria-pressed="${pickStyle === 'boy'}">Boy squishy</button></div>
      </fieldset>
      <fieldset><legend>Pick your first squishy</legend>
        <div class="starter">${['sq04', 'sq08', 'sq06'].map((id) => `<button class="toy r-c ${id === pickStarter ? 'sel' : ''}" data-act="starter" data-id="${id}" type="button" aria-pressed="${id === pickStarter}"><span class="toy-art">${toySVG(id, pickStyle)}</span><span class="toy-name">${TOYS[id].name}</span></button>`).join('')}</div>
      </fieldset>
      <button class="btn primary big" type="submit">Let's play!</button>
      ${adding || !first ? '<button class="btn" type="button" data-act="cancelAdd">Back</button>' : ''}
    </form></section>`;
}
actions.starter = (el) => {
  pickStarter = el.dataset.id; sfx.squish();
  document.querySelectorAll('.starter .toy').forEach((b) => { b.classList.toggle('sel', b === el); b.setAttribute('aria-pressed', b === el); });
};
actions.pickStyle = (el) => { pickStyle = el.dataset.v; sfx.tap(); const nm = $('#nm') ? $('#nm').value : ''; welcome(true); if ($('#nm')) $('#nm').value = nm; };
actions.cancelAdd = () => { if (P()) go('home'); };
document.addEventListener('submit', (e) => {
  const f = e.target.closest('[data-form]');
  if (!f) return;
  e.preventDefault();
  if (f.dataset.form === 'start') {
    const p = newProfile(new FormData(f).get('name'), pickStarter, pickStyle);
    go('home');
    prize(`Welcome, ${esc(p.name)}!`, `<p>Here is your starter pack: <b>7 toys</b> and ${coins(120)}. Press any toy to squish it!</p>`, pickStarter);
  }
  if (f.dataset.form && actions['form_' + f.dataset.form]) actions['form_' + f.dataset.form](f);
});

// ---------- home ----------
function questRow(q) {
  const d = QUESTS.find((x) => x.id === q.id), done = q.n >= d.goal;
  return `<li class="quest ${q.claimed ? 'claimed' : ''}"><div class="quest-main"><b>${d.text}</b>
    <div class="bar" role="img" aria-label="${q.n} of ${d.goal}"><i style="width:${(q.n / d.goal) * 100}%"></i></div></div>
    ${q.claimed ? '<span class="tick">Done!</span>' : done ? `<button class="btn primary sm" data-act="claimQuest" data-id="${q.id}">Get ${coins(d.coins)}</button>` : `<span class="quest-rew">${q.n}/${d.goal} ${coins(d.coins)}</span>`}</li>`;
}
function goalRow(g) {
  const p = P(), [n, max] = goalProgress(g), done = n >= max;
  return `<li class="quest ${p.claimed[g.id] ? 'claimed' : ''}"><div class="quest-main"><b>${g.text}</b>
    <div class="bar" role="img" aria-label="${n} of ${max}"><i style="width:${(n / max) * 100}%"></i></div></div>
    ${p.claimed[g.id] ? '<span class="tick">Done!</span>' : done ? `<button class="btn primary sm" data-act="claimGoal" data-id="${g.id}">Get ${coins(g.coins)}</button>` : `<span class="quest-rew">${n}/${max} ${coins(g.coins)}${g.toy ? ' + plushie' : ''}</span>`}</li>`;
}
function makeOffer(p) {
  const d = p.daily;
  if (d.offer || d.offerDone) return;
  const mine = ownedList(p).filter((id) => id !== p.buddy);
  if (!mine.length) return;
  const r = rng(today() + p.id + 'offer');
  const bot = pick(FRIENDS, r);
  const want = mine.find((id) => TOYS[id].cat === bot.fav) || pick(mine, r);
  const theirs = d.bots[bot.id].filter((id) => id !== want);
  const fair = theirs.filter((id) => TOYS[id].value >= TOYS[want].value);
  const give = fair.length ? pick(fair, r) : theirs.sort((a, b) => TOYS[b].value - TOYS[a].value)[0];
  if (give) d.offer = { bot: bot.id, want, give };
  save();
}
function offerCard() {
  const p = P(), o = p.daily.offer;
  if (!o || p.daily.offerDone || !count(o.want) || !p.daily.bots[o.bot].includes(o.give)) return '';
  const b = FRIENDS.find((f) => f.id === o.bot);
  return `<section class="card offer"><h2>${b.name} wants to trade!</h2>
    <p class="muted">"I will give you my ${esc(TOYS[o.give].name)} for your ${esc(TOYS[o.want].name)}."</p>
    <div class="offer-row">${toyCard(o.want, { tag: 'You give' })}<span class="swap" aria-hidden="true">${icon('trade')}</span>${toyCard(o.give, { tag: 'You get' })}</div>
    <div class="row"><button class="btn primary" data-act="offerYes">Deal!</button><button class="btn" data-act="offerNo">No thanks</button></div></section>`;
}
actions.offerYes = () => {
  const p = P(), o = p.daily.offer;
  // Only if the offer still stands: not used already, and both toys are still where they were.
  if (!o || p.daily.offerDone || !count(o.want) || !p.daily.bots[o.bot] || !p.daily.bots[o.bot].includes(o.give)) return go('home');
  p.daily.offerDone = true;
  removeToy(o.want); addToy(o.give);
  const inv = p.daily.bots[o.bot]; inv.splice(inv.indexOf(o.give), 1); inv.push(o.want);
  p.daily.offerDone = true; track('trade');
  go('home');
  prize('Trade done!', `<p>${FRIENDS.find((f) => f.id === o.bot).name} says thank you!</p>`, o.give);
};
actions.offerNo = () => { P().daily.offerDone = true; save(); go('home'); toast('No problem. Maybe next time!'); };

function home() {
  const p = P(), d = p.daily;
  makeOffer(p);
  const allClaimed = d.quests.every((q) => q.claimed);
  const goals = [...GOALS].filter((g) => !p.claimed[g.id]).sort((a, b) => {
    const pa = goalProgress(a), pb = goalProgress(b);
    return pb[0] / pb[1] - pa[0] / pa[1];
  }).slice(0, 4);
  return `${goalCard(p)}<section class="hero">
      <div class="hero-text"><p class="hello">Hi, ${esc(p.name)}!${p.streak > 1 ? ` <span class="pill">${p.streak} days in a row</span>` : ''}</p>
        <h1>Squish ${esc(TOYS[p.buddy].name)} for coins</h1>
        <div class="squish-cta" id="squish-left">${squishText(d.squish)}</div><p class="pill" id="squish-hint" hidden>3D buddy: drag to spin, press to squish</p>
        <div class="row"><button class="btn big" data-act="go" data-to="trade">Start trading</button>
        ${d.spun ? '' : '<button class="btn big" data-act="wheel">Spin the prize wheel</button>'}<button class="btn" data-act="tour">Show me around</button></div></div>
      <button class="hero-toy squish ${d.squish > 0 ? 'pay' : ''}" data-squish data-toy="${p.buddy}" data-act="heroSquish" aria-label="Squish ${esc(TOYS[p.buddy].name)}"><span class="squish-tag" aria-hidden="true">Squish me!</span>${toySVG(p.buddy, p.style)}</button>
    </section>
    <section class="card"><h2>How do you want to play?</h2>
      <div class="modes"><button class="mode" data-act="go" data-to="quest"><b>Story Mode</b><small>1 player. An adventure through the whole game.</small></button>
      <button class="mode" data-act="playMode" data-v="bot"><b>1 player</b><small>You against the computer</small></button>
      <button class="mode" data-act="playMode" data-v="local"><b>2 players</b><small>Together on this screen</small></button>
      <button class="mode" data-act="playMode" data-v="online"><b>Online</b><small>A friend on their own device</small></button></div></section>
    ${homeExtras()}
    ${offerCard()}
    <section class="card"><h2>Today's challenges</h2><ul class="quests">${d.quests.map(questRow).join('')}</ul>
      ${allClaimed ? (d.chest ? '<p class="muted">All done. New challenges tomorrow!</p>' : `<button class="btn primary" data-act="chest">Open the bonus chest</button>`) : '<p class="muted">Finish all three to open the bonus chest.</p>'}</section>
    <section class="card"><h2>Big goals</h2><ul class="quests">${goals.map(goalRow).join('') || '<li>You finished every goal. Amazing!</li>'}</ul>
      <button class="btn" data-act="allGoals">See all goals</button></section>
    <section class="stats"><div><b>${uniqueCount()}</b><span>of ${TOY_LIST.length} toys found</span></div><div><b>${p.stats.trade || 0}</b><span>trades made</span></div><div><b>${Object.keys(p.stories).length}</b><span>of ${STORIES.length} stories read</span></div></section>`;
}
const squishText = (n) => (n > 0 ? `<b>Squish your buddy to win coins!</b><span class="squish-meter" aria-hidden="true">${'<i class="on"></i>'.repeat(n)}${'<i></i>'.repeat(10 - n)}</span><small>Each squish gives +2 coins. ${n} left today.</small>` : '<small>You got all your squish coins today. More tomorrow! You can still squish for fun.</small>');
actions.playMode = (el) => {
  const v = el.dataset.v; sfx.tap();
  if (v === 'online') { setHub('online'); return go('trade'); }
  modal(`<h2>${v === 'bot' ? '1 player' : '2 players'}</h2><p class="muted">What would you like to do?</p><div class="modes"><button class="mode" data-act="modeGo" data-v="${v}" data-to="trade"><b>Trade toys</b><small>${v === 'bot' ? 'With a computer friend' : 'With a friend on this screen'}</small></button><button class="mode" data-act="modeGo" data-v="${v}" data-to="games"><b>Play games</b><small>${v === 'bot' ? 'Against the computer' : 'Take turns on this screen'}</small></button></div>`, { label: 'Choose what to play' });
};
actions.modeGo = (el) => { closeModal(); if (el.dataset.to === 'trade') setHub(el.dataset.v); go(el.dataset.to); if (el.dataset.to === 'games') document.querySelector('#sec-vs')?.scrollIntoView({ block: 'start' }); };
actions.heroSquish = (el) => {
  const d = P().daily;
  if (d.squish <= 0) return;
  d.squish--; addCoins(2); sfx.coin();
  $('#squish-left').innerHTML = squishText(d.squish); el.classList.toggle('pay', d.squish > 0);
  const f = document.createElement('span');
  f.className = 'float-coin'; f.innerHTML = '+2 ' + coinSVG;
  el.append(f); setTimeout(() => f.remove(), 900);
};
actions.claimQuest = (el) => {
  const q = P().daily.quests.find((x) => x.id === el.dataset.id), d = q && QUESTS.find((x) => x.id === q.id);
  if (!q || !d) return go('home'); // yesterday's button after midnight
  if (q.claimed || q.n < d.goal) return;
  q.claimed = true; addCoins(d.coins); sfx.coin(); confetti(16); go('home');
  toast(`Challenge done! +${d.coins} coins`);
};
actions.chest = () => {
  const d = P().daily;
  if (d.chest) return;
  d.chest = true; addCoins(50); go('home');
  prize('Bonus chest!', `<p>You finished every challenge today. Here are ${coins(50)}.</p>`);
};
actions.claimGoal = (el) => {
  const p = P(), g = GOALS.find((x) => x.id === el.dataset.id), [n, max] = goalProgress(g);
  if (p.claimed[g.id] || n < max) return;
  p.claimed[g.id] = 1; addCoins(g.coins);
  if (g.toy) addToy(g.toy);
  closeModal(); go(tab);
  prize('Goal complete!', `<p>${g.text}. You win ${coins(g.coins)}${g.toy ? ' and a bonus plushie!' : '.'}</p>`, g.toy);
};
actions.allGoals = () => modal(`<h2>All goals</h2><ul class="quests">${GOALS.map(goalRow).join('')}</ul>`, { label: 'All goals', cls: 'wide' });

// ---------- prize wheel ----------
actions.wheel = () => {
  const cols = ['#FF8FC0', '#FFD84A', '#8ED3FF', '#9BD84A', '#C9A8FF', '#FF9A3D', '#9DE7C5', '#F4A6B4'];
  const grad = cols.map((c, i) => `${c} ${i * 45}deg ${(i + 1) * 45}deg`).join(',');
  modal(`<h2>Daily prize wheel</h2><div class="wheel-wrap"><div class="wheel-pin" aria-hidden="true"></div>
    <div class="wheel" id="wheel" style="background:conic-gradient(${grad})">${WHEEL.map((w, i) => `<span style="transform:rotate(${i * 45 + 22.5}deg)"><b>${w.label}</b></span>`).join('')}</div></div>
    <button class="btn primary big" data-act="spin" id="spin-btn">Spin!</button>`, { label: 'Prize wheel' });
};
actions.spin = (el) => {
  const p = P();
  if (p.daily.spun) return;
  p.daily.spun = true; save(); el.disabled = true; sfx.whoosh();
  const i = Math.floor(Math.random() * WHEEL.length), w = WHEEL[i];
  const wonId = w.coins ? null : w.plushie ? rollToy(['plushie'], [0, 70, 25, 5]) : rollToy(['squishy'], [50, 35, 12, 3]);
  const wonNew = wonId ? !p.seen[wonId] : false;
  if (w.coins) addCoins(w.coins); else addToy(wonId);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('#wheel').style.transition = reduce ? 'none' : 'transform 3.2s cubic-bezier(.15,.8,.2,1)';
  $('#wheel').style.transform = `rotate(${360 * 5 - (i * 45 + 22.5)}deg)`;
  setTimeout(() => {
    closeModal(); go('home');
    if (w.coins) { prize('You won coins!', `<p>The wheel gives you ${coins(w.coins)}. Come back tomorrow for another spin.</p>`); }
    else {
      const id = wonId, isNew = wonNew;
      prize(w.plushie ? 'A bonus plushie!' : 'A free squishy!', `<p>${isNew ? 'It is brand new for your shelf!' : 'Another one to trade!'}</p>`, id);
    }
  }, reduce ? 300 : 3400);
};

// ---------- my toys ----------
function toys() {
  const p = P();
  const chips = [['mine', `My basket (${Object.values(p.inv).reduce((a, b) => a + b, 0)})`], ...Object.keys(CATS).map((c) => [c, `${CATS[c].name} ${byCat(c).filter((t) => p.seen[t.id]).length}/${byCat(c).length}`])];
  let grid;
  if (shelf === 'mine') {
    const mine = ownedList();
    grid = mine.length ? mine.map((id) => toyCard(id, { act: 'toy', count: count(id), tag: id === p.buddy ? 'Buddy' : '' })).join('') : '<p class="muted">Your shelf is empty. Open a mystery bag in the shop!</p>';
  } else {
    grid = byCat(shelf).map((t) => p.seen[t.id] ? toyCard(t.id, { act: 'toy', count: count(t.id), cls: count(t.id) ? '' : 'gone', tag: count(t.id) ? '' : 'Traded' }) : toyCard(t.id, { locked: true, disabled: true })).join('');
  }
  return `<h1>${shelf === 'mine' ? `${esc(p.name)}'s Squishy Basket` : CATS[shelf].name + ' shelf'}</h1>${shelf === 'mine' ? basketHTML(p) : ''}
    <p class="muted">${shelf === 'mine' ? 'Tap a toy to squish it, sell extras or make it your buddy.' : shelf === 'plushie' ? 'Plushies are bonus prizes. Win them from stories, goals, the prize wheel and Mega bags.' : 'Find every toy on this shelf to win a bonus plushie.'}</p>
    <div class="row"><button class="btn primary" data-act="newDraw">Draw your own squishy</button>${myDrawings().length ? `<span class="pill">${myDrawings().length} handmade</span>` : ''}</div>
    <div class="chips" role="tablist">${chips.map(([k, l]) => `<button class="chip" role="tab" aria-selected="${k === shelf}" data-act="shelf" data-id="${k}">${l}</button>`).join('')}</div>
    <div class="grid">${grid}</div>`;
}
actions.shelf = (el) => { shelf = el.dataset.id; sfx.tap(); go('toys'); };
actions.toy = (el) => {
  const id = el.dataset.id, t = TOYS[id], n = count(id), p = P();
  sfx.squish();
  modal(`<div class="detail"><div class="detail-toy squish" data-squish data-toy="${id}">${toySVG(id)}</div>
    <h2>${esc(t.name)}</h2><p><span class="pill r-${t.r}">${RARITY[t.r].name}</span> <span class="pill">${CATS[t.cat].one}</span></p>
    <p>Worth ${coins(t.value)} &middot; ${n ? `You have ${n}` : 'You traded this one away'}</p><p class="muted">${can3D(id) ? 'Drag to spin it around. Press and hold to squish!' : 'Press and hold to squish!'}</p>
    <div class="row center">${n && p.buddy !== id ? `<button class="btn primary" data-act="buddy" data-id="${id}">Make my buddy</button>` : ''}
    ${n > 1 ? `<button class="btn" data-act="sell" data-id="${id}">Sell 1 extra for ${coins(Math.round(t.value / 2))}</button>` : ''}</div>
    ${t.custom && n ? `<div class="row center made-row"><button class="btn" data-act="editToy" data-id="${id}">Edit drawing</button><button class="btn" data-act="realToy" data-id="${id}">${t.art.real ? 'Back to my drawing' : 'Make it lifelike (3D)'}</button><button class="btn danger" data-act="delToy" data-id="${id}">Delete</button></div>` : ''}</div>`, { label: t.name, onClose: dispose3D });
  if (can3D(id)) mount3D($('.detail-toy'), id);
};
actions.editToy = (el) => { closeModal(); editDrawing(el.dataset.id); };
// Turn a drawing into a puffy 3D squishy you can spin (and back again).
actions.realToy = (el) => {
  const id = el.dataset.id, t = TOYS[id];
  t.art.real = !t.art.real; store.custom[id] = t.art; save();
  closeModal(); go(tab);
  document.querySelector(`.grid .toy[data-id="${id}"]`)?.click();
  toast(t.art.real ? 'Now it is lifelike! Drag to spin it around.' : 'Back to your drawing.');
};
actions.delToy = (el) => {
  const id = el.dataset.id;
  modal(`<div class="detail"><div class="detail-toy">${toySVG(id)}</div><h2>Delete ${esc(TOYS[id].name)}?</h2><p>This drawing will be gone for good. It cannot be undone.</p>
    <div class="row center"><button class="btn" data-act="closeModal" autofocus>Keep it</button><button class="btn danger" data-act="delToyYes" data-id="${id}">Yes, delete</button></div></div>`, { label: 'Delete drawing' });
};
actions.delToyYes = (el) => {
  const id = el.dataset.id, p = P(), name = TOYS[id].name;
  removeToy(id, count(id));
  if (p.buddy === id) p.buddy = ownedList()[0] || 'sq04';
  // Keep the picture only if someone else on this device still holds a copy.
  const held = store.profiles.some((x) => x.inv[id] || (x.daily && Object.values(x.daily.bots || {}).some((b) => b.includes(id))));
  if (!held) delete store.custom[id];
  save(); closeModal(); go(tab); toast(`${esc(name)} was deleted.`);
};
actions.buddy = (el) => { P().buddy = el.dataset.id; save(); closeModal(); go(tab); toast(`${esc(TOYS[el.dataset.id].name)} is your buddy now!`); };
actions.sell = (el) => {
  const id = el.dataset.id;
  if (count(id) < 2) return;
  removeToy(id); addCoins(Math.round(TOYS[id].value / 2)); sfx.coin(); track('sell');
  closeModal(); go(tab); toast(`Sold! +${Math.round(TOYS[id].value / 2)} coins`);
};

// ---------- shop ----------
const bagSVG = (i) => {
  const c = ['#FF8FC0', '#8ED3FF', '#9BD84A', '#FFD84A', '#C9A8FF'][i % 5];
  return `<svg class="bag-svg" viewBox="0 0 100 100" aria-hidden="true"><path d="M20 30L26 20L32 30L38 20L44 30L50 20L56 30L62 20L68 30L74 20L80 30L84 88Q84 94 78 94L22 94Q16 94 16 88Z" fill="${c}" stroke="#2A1846" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="62" r="17" fill="#fff"/><text x="50" y="71" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="26" fill="#2A1846">?</text></svg>`;
};
function shop() {
  return `<h1>Mystery bag shop</h1><p class="muted">What is inside? Every bag hides one surprise toy. Rare, Epic and Legendary toys are harder to find.</p>
    <div class="bags">${BAGS.map((b, i) => `<article class="card bag"><div class="bag-art">${bagSVG(i)}</div><h2>${b.name}</h2>
      <p class="muted">${b.glitter ? 'Only sparkly toys and glitter bombs.' : b.jumbo ? 'Only the big, extra-squishy ones.' : b.cats.length > 2 ? 'Any toy, even plushies. Best luck!' : b.cats.map((c) => CATS[c].name).join(' and ')}</p>
      <button class="btn primary" data-act="buy" data-id="${b.id}">Open for ${coins(b.cost)}</button></article>`).join('')}</div>
    <section class="card"><h2>Need more coins?</h2><p class="muted">Play mini-games, read stories, finish challenges, or sell your extra toys.</p>
      <div class="row"><button class="btn" data-act="go" data-to="games">Play games</button><button class="btn" data-act="go" data-to="stories">Read stories</button></div></section>`;
}
actions.buy = (el) => {
  const b = BAGS.find((x) => x.id === el.dataset.id), p = P(), i = BAGS.indexOf(b);
  if (p.coins < b.cost) { sfx.no(); return toast(`You need ${b.cost - p.coins} more coins. Try a mini-game!`); }
  addCoins(-b.cost);
  const only = b.jumbo ? (t) => t.big : b.glitter ? (t) => t.fx === 'glitter' || t.v === 'bomb' : null;
  const id = rollToy(b.cats, b.odds, Math.random, only), isNew = !p.seen[id];
  addToy(id); track('bag'); sfx.whoosh();
  modal(`<div class="opening"><h2>Opening...</h2><div class="bag-art shake">${bagSVG(i)}</div></div>`, { sticky: true, label: 'Opening bag' });
  setTimeout(() => {
    closeModal(); if (tab === 'shop') go('shop');
    sfx.pop();
    prize(isNew ? 'New toy!' : 'You got...', `<p>${isNew ? 'A brand new toy for your shelf.' : `You have ${count(id)} of these now. Extras are great for trading!`}</p>`, id);
  }, 1200);
};

// ---------- stories ----------
const endings = (s) => Object.values(s.nodes).filter((n) => n.end).length;
function stories() {
  const p = P();
  const q = p.quest || { ch: 0 };
  return `<h1>Story time</h1><p class="muted">You choose what happens next. Every story has lots of endings to find. Finish a story to win coins and a plushie.</p>
    <button class="card story-card quest-card" data-act="go" data-to="quest"><span class="story-art">${toySVG('sq23')}</span><span><b>Story Mode: The Glitter Crown</b><small>${q.ch >= QUEST.length ? 'Finished! The crown is whole.' : `Chapter ${Math.min(q.ch + 1, QUEST.length)} of ${QUEST.length}. Read, solve and explore.`}</small></span></button>
    <button class="card story-card quest-card" data-act="go" data-to="mystory"><span class="story-art">${toySVG('sq208')}</span><span><b>Story maker</b><small>${(p.myStories || []).length ? `You have written ${(p.myStories || []).length} stories. Read them or write a new one.` : 'Write your own choose-your-path story.'}</small></span></button>
    <div class="story-list">${STORIES.map((s) => {
      const got = Object.keys(p.stories[s.id] || {}).length;
      return `<button class="card story-card" data-act="story" data-id="${s.id}"><span class="story-art">${toySVG(s.toy)}</span>
        <span><b>${s.title}</b><small><span class="pill">${s.kind || 'Friends'}</span> ${got ? `${got} of ${endings(s)} endings found` : `Prize: ${coins(s.coins)} + ${esc(TOYS[s.prize].name)}`}</small></span></button>`;
    }).join('')}</div>`;
}
let reading = null;
const findStory = (id) => STORIES.find((x) => x.id === id) || (P().myStories || []).find((x) => x.id === id);
initMyStory((s) => { reading = { s, ok: {}, has: {} }; reading.at = s.start; page(); window.scrollTo(0, 0); });
actions.story = (el) => { reading = { s: findStory(el.dataset.id), ok: {}, has: {} }; if (!reading.s) return go('stories'); reading.at = reading.s.start; sfx.tap(); page(); };
actions.choose = (el) => { if (el.dataset.set) reading.has[el.dataset.set] = 1; reading.at = el.dataset.id; sfx.tap(); page(); };
// A choice may need things packed or won earlier: 'a+b' needs both, 'a|b' needs either one.
const canPick = (need) => !need || (need.includes('|') ? need.split('|').some((k) => reading.has[k]) : need.split('+').every((k) => reading.has[k]));
const fillStory = (t, p) => say(t).replaceAll('{name}', p.name).replaceAll('{buddy}', say(TOYS[p.buddy].name));
// The story map: every page of a story, row by row. Pages not found yet show a question mark.
actions.storyMap = () => {
  const p = P(), s = reading.s, seen = (p.pages || {})[s.id] || {}, rec = p.stories[s.id] || {};
  const depth = { [s.start]: 0 }, order = [s.start];
  for (let i = 0; i < order.length; i++) (s.nodes[order[i]].c || []).forEach(([, to]) => { if (!(to in depth)) { depth[to] = depth[order[i]] + 1; order.push(to); } });
  const rows = []; order.forEach((id) => (rows[depth[id]] = rows[depth[id]] || []).push(id));
  const cell = (id) => { const n = s.nodes[id], got = seen[id], secret = n.end && n.end === s.secret;
    return `<span class="map-cell ${got ? 'got' : ''} ${n.end ? 'end' : ''} ${id === reading.at ? 'here' : ''}">${got ? toySVG(n.art) : `<b>${secret ? '★' : '?'}</b>`}${n.end ? `<small>${rec[n.end] ? n.end : secret ? 'Secret ending' : 'Ending'}</small>` : ''}</span>`; };
  const found = order.filter((id) => seen[id]).length;
  modal(`<h2>Story map</h2><p>You have found ${found} of ${order.length} pages and ${Object.keys(rec).length} of ${endings(s)} endings.</p>
    <div class="story-map">${rows.map((r) => `<div class="map-row">${r.map(cell).join('')}</div>`).join('')}</div>
    <p class="muted">${found < order.length ? 'Read again and pick a different path to fill in the question marks.' : 'You found every page. Amazing!'}${s.secret && !rec[s.secret] ? ' The star is a secret ending. What you pack and who you help will open it.' : ''}</p>`, { label: 'Story map', cls: 'wide' });
};
// Story pages are read by a recorded narrator. Pages that say the player's name were
// recorded as "Grace Emilia", so other names fall back to the device's own voice.
let voice = null;
function stopVoice() { if (voice) { voice.pause(); voice = null; } if ('speechSynthesis' in window) speechSynthesis.cancel(); const b = $('#read-btn'); if (b) b.setAttribute('aria-pressed', 'false'); }
actions.readAloud = (btn) => {
  if (voice || ('speechSynthesis' in window && speechSynthesis.speaking)) return stopVoice();
  const { s, at } = reading, raw = s.nodes[at].t;
  if (!s.mine && lang() === 'en' && !raw.includes('{buddy}') && (!raw.includes('{name}') || P().name.trim().toLowerCase() === 'grace emilia')) {
    const a = new Audio(`audio/stories/${s.id}_${at}.mp3`);
    voice = a; btn.setAttribute('aria-pressed', 'true');
    a.onended = () => { if (voice === a) stopVoice(); };
    a.onerror = () => { if (voice === a) { voice = null; deviceVoice(); } };
    a.play().catch(() => { if (voice === a) { voice = null; deviceVoice(); } });
    return;
  }
  deviceVoice();
};
const deviceVoice = () => {
  if (!('speechSynthesis' in window)) return toast('This device cannot read aloud.');
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance($('#story-text').textContent); u.rate = 0.9; u.pitch = 1.1; u.lang = lang() === 'es' ? 'es-US' : 'en-US';
  speechSynthesis.speak(u);
};
function page() {
  const p = P(), { s, at } = reading, n = s.nodes[at];
  stopVoice();
  router.cleanup = stopVoice;
  p.pages = p.pages || {}; (p.pages[s.id] = p.pages[s.id] || {})[at] = 1; save();
  let foot;
  if (n.end && s.mine) {
    const paid = (p.daily.read = p.daily.read || {});
    if (!paid[s.id]) { paid[s.id] = 1; track('story'); }
    sfx.win(); confetti(20);
    foot = `<div class="ending"><p class="pill big" translate="no">${esc(n.end)}</p><p>You wrote this story. Great job, author!</p>
      <div class="row center"><button class="btn primary" data-act="story" data-id="${s.id}">Read again</button><button class="btn" data-act="go" data-to="mystory">My stories</button></div></div>`;
  } else if (n.end) {
    const rec = (p.stories[s.id] = p.stories[s.id] || {}), first = Object.keys(rec).length === 0, newEnd = !rec[n.end];
    rec[n.end] = 1;
    const paid = (p.daily.read = p.daily.read || {});
    const c = first ? s.coins : newEnd ? 15 : paid[s.id] ? 0 : 5;
    paid[s.id] = 1;
    addCoins(c); track('story');
    if (first) addToy(s.prize);
    sfx.win(); confetti();
    foot = `<div class="ending"><p class="pill big">Ending: <span>${n.end}</span></p><p>${c ? `You win ${coins(c)}${first ? ` and <b>${esc(TOYS[s.prize].name)}</b>!` : newEnd ? ' for finding a new ending.' : '.'}` : 'You found this ending already today. Try a different choice to find a new one!'}</p>
      ${first ? `<div class="prize-toy squish" data-squish data-toy="${s.prize}">${toySVG(s.prize)}</div>` : ''}
      <p class="muted">${Object.keys(rec).length} of ${endings(s)} endings found.</p>
      <div class="row center"><button class="btn primary" data-act="story" data-id="${s.id}">Read again</button><button class="btn" data-act="storyMap">Story map</button><button class="btn" data-act="go" data-to="stories">More stories</button></div></div>`;
  } else {
    foot = n.ask && !reading.ok[at] ? askHTML(n.ask, 'storyAsk') : `<p class="what">What do you do?</p><div class="choices">${n.c.filter((c) => canPick(c[3])).map(([l, to, set]) => `<button class="btn big choice" data-act="choose" data-id="${to}" data-set="${set || ''}" ${s.mine ? 'translate="no"' : ''}>${esc(l)}</button>`).join('')}</div><button class="btn sm map-btn" data-act="storyMap">Story map</button>`;
  }
  view.className = 'view v-reader';
  view.innerHTML = `<button class="btn back" data-act="go" data-to="stories">${icon('back')} Stories</button>
    <article class="card reader"><h1 ${s.mine ? 'translate="no"' : ''}>${esc(s.title)}</h1><div class="reader-stage"><div class="reader-art squish" data-squish data-toy="${TOYS[n.art] ? n.art : 'sq01'}">${toySVG(TOYS[n.art] ? n.art : 'sq01')}</div><div class="reader-buddy"><div class="squish" data-squish data-toy="${p.buddy}">${toySVG(p.buddy, p.style)}</div><small>with ${esc(TOYS[p.buddy].name)}</small></div></div>
    <p id="story-text" class="story-text" translate="no">${wordsHTML(fillStory(n.t, p))}</p><p class="muted tap-hint">Tap any word to hear it.</p>
    <button class="btn sm" data-act="readAloud" id="read-btn" aria-pressed="false">${icon('sound')} Read it to me</button>${foot}</article>`;
  window.scrollTo(0, 0);
}

// ---------- players, sound, grown-ups ----------
actions.who = () => {
  const p = P();
  modal(`<h2>Who is playing?</h2><div class="players">${store.profiles.map((x) => `<button class="player ${x.id === p.id ? 'sel' : ''}" data-act="switch" data-id="${x.id}"><span class="who-art">${toySVG(x.buddy)}</span><b translate="no">${esc(x.name)}</b><small>${coins(x.coins)}</small></button>`).join('')}</div>
    <div class="lang-row" role="group" aria-label="Language" translate="no"><span>Language / Idioma:</span><button class="chip" data-act="lang" data-v="en" aria-pressed="${lang() === 'en'}">English</button><button class="chip" data-act="lang" data-v="es" aria-pressed="${lang() === 'es'}">Espa\u00f1ol</button></div>
    <div class="row"><button class="chip" data-act="easy" aria-pressed="${store.easy !== false}">Easy-read letters</button></div>
    <div class="row"><button class="btn primary" data-act="pickIcon">Change my squishy icon</button><button class="btn" data-act="tour">Show me around</button><button class="btn" data-act="addPlayer">Add a player</button><button class="btn" data-act="grownups">For grown-ups</button></div>`, { label: 'Players' });
};
actions.pickIcon = () => {
  const p = P();
  modal(`<h2>Pick your squishy icon</h2><p class="muted">This is the toy next to your name, and your buddy on the home screen. Tap any toy you own.</p>
    <div class="grid pick-grid">${ownedList().map((id) => toyCard(id, { act: 'buddy', cls: id === p.buddy ? 'sel' : '', tag: id === p.buddy ? 'Now' : '' })).join('')}</div>
    <div class="row"><button class="btn" data-act="closeModal">Done</button><button class="btn" data-act="iconDraw">Draw a new one</button></div>`, { label: 'Pick your icon', cls: 'wide picker' });
};
actions.iconDraw = () => { closeModal(); newDrawing(); };
actions.newDraw = () => { sfx.tap(); newDrawing(); };
actions.easy = (el) => { store.easy = store.easy === false; save(); header(); el.setAttribute('aria-pressed', store.easy !== false); };
actions.lang = (el) => { if (el.dataset.v !== lang()) setLang(el.dataset.v); };
actions.switch = (el) => { store.cur = el.dataset.id; save(); closeModal(); go('home'); toast(`Hi, ${esc(P().name)}!`); };
actions.addPlayer = () => { closeModal(); welcome(true); };
actions.grownups = () => modal(`<h2>For grown-ups</h2>
  <p>This game has no accounts, no ads and no real money. Coins are pretend. Each player's toys are saved in this browser on this device.</p>
  <p><b>Online trading</b> connects two devices directly with a 4-letter room code. Share the code only with friends you know. Players can send toys, pretend coins and six preset phrases. There is no typing or chat. Only the player's nickname is shared.</p>
  <h3>Break reminder</h3><p class="muted">Pause the game with a stretch break after this much play.</p>
  <div class="row" role="group" aria-label="Break reminder">${[[0, 'Off'], [20, '20 minutes'], [30, '30 minutes'], [45, '45 minutes']].map(([v, l]) => `<button class="chip" data-act="breakSet" data-v="${v}" aria-pressed="${(store.breakMin || 0) === v}">${l}</button>`).join('')}</div>
  <div class="row"><button class="btn" data-act="progress">See learning progress</button></div>
  <p class="muted">Removing a player deletes their toys from this device for good.</p>
  <button class="btn danger" data-act="removePlayer">Remove ${esc(P().name)}</button>`, { label: 'For grown-ups' });
actions.breakSet = (el) => { store.breakMin = +el.dataset.v; save(); played = 0; document.querySelectorAll('[data-act=breakSet]').forEach((b) => b.setAttribute('aria-pressed', b === el)); };
actions.progress = () => {
  const p = P(), learn = GAME_LIST.filter((g) => ['read', 'math', 'focus', 'calm'].includes(g.sec));
  const row = (g) => `<tr><td>${g.name}</td><td>${p.stats['plays_' + g.id] || 0}</td><td>${p.stats['best_' + g.id] || '-'}</td></tr>`;
  const part = (sec, title) => `<h3>${title}</h3><div class="tbl"><table><thead><tr><th>Game</th><th>Times played</th><th>Best score</th></tr></thead><tbody>${learn.filter((g) => g.sec === sec).map(row).join('')}</tbody></table></div>`;
  const q = p.quest || { ch: 0 };
  modal(`<h2>Learning progress</h2><p translate="no"><b>${esc(p.name)}</b></p>
    <p>Story Mode: chapter ${Math.min(q.ch + 1, QUEST.length)} of ${QUEST.length}. Stories finished: ${Object.keys(p.stories).length} of ${STORIES.length}. Days in a row: ${p.streak || 1}.</p>
    ${part('read', 'Reading')}${part('math', 'Math and thinking')}${part('focus', 'Focus')}${part('calm', 'Calm')}
    <p class="muted">Scores are counted from this update on. A dash means not played yet.</p>`, { label: 'Learning progress', cls: 'wide' });
};
// A stretch break after a set amount of play. Counted only while the game is on screen.
let played = 0;
setInterval(() => {
  if (!store.breakMin || document.hidden || !P() || !$('#modal').hidden) return;
  played += 0.5;
  if (played < store.breakMin) return;
  played = 0;
  modal(`<div class="prize"><div class="prize-toy">${toySVG(P().buddy, P().style)}</div><h2>Stretch break!</h2><p>You have been playing for a while. Stand up, wiggle, get a drink of water, and look out a window.</p>
    <p class="muted" id="break-left">You can keep playing in 60 seconds.</p><button class="btn primary" data-act="closeModal" id="break-ok" disabled>Keep playing</button></div>`, { sticky: true, label: 'Stretch break' });
  let left = 60; const t = setInterval(() => { left -= 1; const el = $('#break-left'), ok = $('#break-ok'); if (!el || !ok) return clearInterval(t); if (left <= 0) { el.textContent = 'All rested? Off you go!'; ok.disabled = false; clearInterval(t); } else el.textContent = `You can keep playing in ${left} seconds.`; }, 1000);
}, 30000);
actions.removePlayer = () => modal(`<h2>Remove ${esc(P().name)}?</h2><p>All of their toys and coins will be gone. This cannot be undone.</p>
  <div class="row"><button class="btn" data-act="closeModal" autofocus>Keep playing</button><button class="btn danger" data-act="removeYes">Yes, remove</button></div>`, { label: 'Remove player' });
actions.removeYes = () => {
  store.profiles = store.profiles.filter((x) => x.id !== store.cur);
  store.cur = store.profiles[0]?.id || null; save(); closeModal(); go('home');
};

// ---------- reading help: every word in a story can be tapped to hear it ----------
const wordsHTML = (text) => esc(text).split(/(\s+)/).map((w) => (/\S/.test(w) ? `<span class="w" data-act="word">${w}</span>` : w)).join('');
actions.word = (el) => {
  if (!('speechSynthesis' in window)) return;
  stopVoice();
  document.querySelectorAll('.w.on').forEach((x) => x.classList.remove('on')); el.classList.add('on');
  const u = new SpeechSynthesisUtterance(el.textContent.replace(/[^\p{L}\p{N}' -]/gu, '')); u.rate = 0.8; u.lang = lang() === 'es' ? 'es-US' : 'en-US';
  u.onend = () => el.classList.remove('on'); speechSynthesis.speak(u);
};

// ---------- questions that make the reader read and count ----------
function askHTML(ask, act) {
  const opts = [ask.a, ...ask.w].sort(() => Math.random() - 0.5);
  return `<div class="ask"><p class="what">Answer to keep going:</p><p class="ask-q">${ask.q}</p>
    <div class="choices">${opts.map((o) => `<button class="btn big choice" data-act="${act}" data-hit="${o === ask.a ? 1 : 0}">${o}</button>`).join('')}</div><p class="muted" id="ask-say" aria-live="polite"></p></div>`;
}
const wrongAsk = (el) => { sfx.no(); el.disabled = true; const s = $('#ask-say'); if (s) s.textContent = 'Not quite. Read the page again, slowly, and try once more.'; };
actions.storyAsk = (el) => {
  if (el.dataset.hit !== '1') return wrongAsk(el);
  reading.ok[reading.at] = 1; sfx.win(); page();
};

// ---------- Story Mode: The Glitter Crown ----------
const qState = (p) => (p.quest = p.quest || { ch: 0, step: 'read', base: 0 });
function quest() {
  const p = P(), q = qState(p), n = QUEST.length;
  const gems = `<div class="gems" role="img" aria-label="${q.ch} of ${n} gems found">${QUEST.map((_, i) => `<i class="${i < q.ch ? 'got' : ''}"></i>`).join('')}</div>`;
  const top = `<button class="btn back" data-act="go" data-to="home">${icon('back')} Home</button><h1>The Glitter Crown</h1>${gems}`;
  if (q.ch >= n) return `${top}<article class="card reader"><div class="reader-art squish" data-squish data-toy="pl08">${toySVG('pl08')}</div><p class="story-text">The Glitter Crown is whole again, and Squishy Town is brighter than ever. Mayor Mochi bows. You are the hero of the town!</p><p class="muted">You finished Story Mode. You can still play everything, any time.</p><div class="row center"><button class="btn primary" data-act="go" data-to="stories">Read more stories</button><button class="btn" data-act="questAgain">Play Story Mode again</button></div></article>`;
  const c = QUEST[q.ch];
  let body;
  if (q.step === 'mission') {
    const done = Math.min(c.goal, (p.stats[c.ev] || 0) - q.base), ok = done >= c.goal;
    body = `<p class="what">Your mission</p><p class="ask-q">${c.todo}</p><div class="bar" role="img" aria-label="${done} of ${c.goal}"><i style="width:${(done / c.goal) * 100}%"></i></div><p class="muted">${done} of ${c.goal} done</p>
      <div class="row center">${ok ? `<button class="btn primary big" data-act="questGem">Collect the gem!</button>` : `<button class="btn primary big" data-act="go" data-to="${c.to}">Go do it</button>`}</div>${ok ? '' : '<p class="muted">Come back here when you are done.</p>'}`;
  } else {
    body = askHTML(q.step === 'math' ? c.mq : c.rq, 'questAsk').replace('Answer to keep going:', q.step === 'math' ? 'Now a number puzzle:' : 'First, a question about what you read:');
  }
  return `${top}<article class="card reader"><p class="pill">Chapter ${q.ch + 1} of ${n}</p><h2>${c.title}</h2><div class="reader-stage"><div class="reader-art squish" data-squish data-toy="${c.art}">${toySVG(c.art)}</div><div class="reader-buddy"><div class="squish" data-squish data-toy="${p.buddy}">${toySVG(p.buddy, p.style)}</div><small>with ${esc(TOYS[p.buddy].name)}</small></div></div>
    <p id="story-text" class="story-text" translate="no">${wordsHTML(say(c.t))}</p><p class="muted tap-hint">Tap any word to hear it.</p>${q.step === 'read' ? `<button class="btn sm" data-act="questRead" id="read-btn" aria-pressed="false">${icon('sound')} Read it to me</button>` : ''}${body}</article>`;
}
// Story Mode chapters are read by the same recorded narrator as the stories.
actions.questRead = (btn) => {
  if (voice || ('speechSynthesis' in window && speechSynthesis.speaking)) return stopVoice();
  if (lang() !== 'en') return deviceVoice();
  const a = new Audio(`audio/quest/c${qState(P()).ch + 1}.mp3`), fail = () => { if (voice === a) { voice = null; deviceVoice(); } };
  voice = a; btn.setAttribute('aria-pressed', 'true'); router.cleanup = stopVoice;
  a.onended = () => { if (voice === a) stopVoice(); }; a.onerror = fail;
  a.play().catch(fail);
};
actions.questAsk = (el) => {
  if (el.dataset.hit !== '1') return wrongAsk(el);
  const p = P(), q = qState(p), c = QUEST[q.ch];
  stopVoice(); sfx.win();
  if (q.step === 'read') q.step = 'math';
  else { q.step = 'mission'; q.base = p.stats[c.ev] || 0; if (c.grant) addCoins(c.grant); }
  save(); go('quest');
};
actions.questGem = () => {
  const p = P(), q = qState(p), c = QUEST[q.ch];
  if (q.step !== 'mission' || (p.stats[c.ev] || 0) - q.base < c.goal) return;
  q.ch++; q.step = 'read'; q.base = 0; addCoins(c.coins); if (c.toy) addToy(c.toy);
  save(); go('quest');
  prize(q.ch >= QUEST.length ? 'The crown is whole!' : `Gem ${q.ch} of ${QUEST.length} found!`, `<p>You win ${coins(c.coins)}${c.toy ? ' and a Legendary plushie!' : '.'}</p>`, c.toy);
};
actions.questAgain = () => { P().quest = { ch: 0, step: 'read', base: 0 }; save(); go('quest'); };

// ---------- global input ----------
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (el && !el.disabled && actions[el.dataset.act]) actions[el.dataset.act](el, e);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#modal .modal-back:not([data-act])')) closeModal(); });
// Big toys lean toward your finger, so they feel like something you can hold.
document.addEventListener('pointermove', (e) => {
  const el = e.target.closest && e.target.closest('[data-squish]');
  document.querySelectorAll('[data-squish].tilting').forEach((x) => { if (x !== el) { x.classList.remove('tilting'); x.style.removeProperty('--rx'); x.style.removeProperty('--ry'); } });
  if (!el) return;
  const r = el.getBoundingClientRect();
  el.classList.add('tilting');
  el.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 34).toFixed(1) + 'deg');
  el.style.setProperty('--rx', ((0.5 - (e.clientY - r.top) / r.height) * 26).toFixed(1) + 'deg');
}, { passive: true });
// Every toy can be played with: press to squeeze, drag to stretch, let go and it springs back.
// Each kind of toy has its own sound and move (crunch, pop, spin, boing...).
let lastSquish = 0, held = null, heldRect = null, hx = 0, hy = 0;
const toyOf = (el) => { const h = el.closest('[data-toy], [data-id]'); const id = h && (h.dataset.toy || h.dataset.id); return TOYS[id] ? id : null; };
document.addEventListener('pointerdown', (e) => {
  const card = e.target.closest('.toy');
  const el = e.target.closest('[data-squish]') || (card && !card.disabled && !card.classList.contains('locked') && card.querySelector('.toy-art'));
  if (!el) return;
  const id = toyOf(el), style = id ? playStyle(id) : 'squish';
  held = el; heldRect = el.getBoundingClientRect(); hx = e.clientX; hy = e.clientY;
  el.classList.remove('boing', 'spin', 'sproing'); void el.offsetWidth;
  el.classList.add('down');
  if (style === 'spin') el.classList.add('spin');
  if (Date.now() - lastSquish > 110) {
    playSound(style); if (P()) track('squish'); lastSquish = Date.now();
    const t = id && TOYS[id];
    // Glitter bombs explode in a shower of glitter. Glitter toys shed a little sparkle.
    if (t && t.v === 'bomb') { glitterBurst(e.clientX, e.clientY, 110, 1.25); sfx.bomb(); if (P()) track('bomb'); }
    else if (t && t.fx === 'glitter') { glitterBurst(e.clientX, e.clientY, 14, 0.42); sfx.twinkle(); }
  }
});
document.addEventListener('pointermove', (e) => {
  if (!held || held.classList.contains('is3d') || held.classList.contains('spin')) return;
  const px = Math.max(-1, Math.min(1, (e.clientX - hx) / heldRect.width)), py = Math.max(-1, Math.min(1, (e.clientY - hy) / heldRect.height));
  const up = Math.max(0, -py), dn = Math.max(0, py);
  held.style.transform = `skewX(${(-px * 20).toFixed(1)}deg) scale(${(1.2 + Math.abs(px) * 0.22 - up * 0.3 + dn * 0.12).toFixed(3)}, ${(0.72 + up * 0.75 - dn * 0.18).toFixed(3)})`;
}, { passive: true });
['pointerup', 'pointercancel'].forEach((ev) => document.addEventListener(ev, () => {
  if (!held) return;
  const id = toyOf(held);
  held.style.transform = '';
  held.classList.remove('down');
  held.classList.add(id && playStyle(id) === 'boing' ? 'sproing' : 'boing');
  held = null;
}, true));

$('#nav').innerHTML = [['home', 'Home'], ['toys', 'My basket'], ['trade', 'Trade'], ['games', 'Games'], ['stories', 'Stories'], ['shop', 'Shop']]
  .map(([k, l]) => `<button data-act="go" data-to="${k}">${icon(k)}<span>${l}</span></button>`).join('');
await initLang();
if (P()) ensureDaily();
go('home');
