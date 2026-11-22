import { TOYS, CATS, RARITY, BAGS, QUESTS, GOALS, WHEEL, STORIES, FRIENDS, byCat, TOY_LIST } from './data.js';
import { toySVG, icon, coinSVG } from './art.js';
import { store, save, P, ensureDaily, addToy, removeToy, addCoins, count, ownedList, uniqueCount, track, newProfile, onChange, goalProgress, readyGoals, rollToy, rng, pick, today } from './state.js';
import { $, esc, router, actions, sfx, toggleMute, toyCard, coins, toast, modal, closeModal, confetti, prize } from './ui.js';
import { tradeScreen } from './trade.js';
import { gamesScreen } from './games.js';

const view = $('#view');
let tab = 'home';
let shelf = 'mine';

// ---------- header + navigation ----------
function header() {
  const p = P();
  document.body.classList.toggle('no-profile', !p);
  if (!p) return;
  $('#coins').innerHTML = coins(p.coins);
  $('#who').innerHTML = `<span class="who-art">${toySVG(p.buddy)}</span><span class="who-name">${esc(p.name)}</span>`;
  $('#sound').innerHTML = icon(store.mute ? 'mute' : 'sound');
  $('#sound').setAttribute('aria-label', store.mute ? 'Turn sound on' : 'Turn sound off');
  const dot = readyGoals(p).length + p.daily.quests.filter((q) => !q.claimed && q.n >= QUESTS.find((x) => x.id === q.id).goal).length + (p.daily.spun ? 0 : 1);
  $('#nav [data-to="home"]').classList.toggle('dot', dot > 0);
}
onChange(header);

const SCREENS = { home, toys, trade: tradeScreen, games: gamesScreen, stories, shop };
function go(to = tab, arg) {
  if (router.cleanup) { router.cleanup(); router.cleanup = null; }
  if (!P()) return welcome();
  ensureDaily();
  tab = to;
  document.querySelectorAll('#nav button').forEach((b) => b.setAttribute('aria-current', b.dataset.to === to ? 'page' : 'false'));
  view.className = 'view v-' + to;
  view.innerHTML = SCREENS[to](arg);
  header();
  window.scrollTo(0, 0);
}
router.go = go;
actions.go = (el) => { sfx.tap(); go(el.dataset.to); };
actions.closeModal = () => closeModal();
actions.sound = () => { toggleMute(); header(); };

// ---------- welcome ----------
let pickStarter = 'sq04';
function welcome(adding = false) {
  document.body.classList.add('no-profile');
  view.className = 'view v-welcome';
  const first = store.profiles.length === 0;
  view.innerHTML = `<section class="welcome">
    <div class="welcome-toys" aria-hidden="true">${['sq12', 'pl02', 'fi01', 'sl05', 'sp07'].map((id, i) => `<span style="--i:${i}">${toySVG(id)}</span>`).join('')}</div>
    <h1 class="big-title"><small>Grace Emilia's</small>Squishy Trading</h1>
    <p class="lead">Collect squishies, slimes, fidgets and more. Trade with friends. Win coins. Squish everything.</p>
    <form class="card welcome-form" data-form="start">
      <label for="nm">What is your name?</label>
      <input id="nm" name="name" maxlength="14" autocomplete="off" value="${first ? 'Grace Emilia' : ''}" placeholder="Your name" required>
      <fieldset><legend>Pick your first squishy</legend>
        <div class="starter">${['sq04', 'sq08', 'sq06'].map((id) => toyCard(id, { act: 'starter', cls: id === pickStarter ? 'sel' : '', extra: `type="button" aria-pressed="${id === pickStarter}"` })).join('')}</div>
      </fieldset>
      <button class="btn primary big" type="submit">Let's play!</button>
      ${adding || !first ? '<button class="btn" type="button" data-act="cancelAdd">Back</button>' : ''}
    </form></section>`;
}
actions.starter = (el) => {
  pickStarter = el.dataset.id; sfx.squish();
  document.querySelectorAll('.starter .toy').forEach((b) => { b.classList.toggle('sel', b === el); b.setAttribute('aria-pressed', b === el); });
};
actions.cancelAdd = () => { if (P()) go('home'); };
document.addEventListener('submit', (e) => {
  const f = e.target.closest('[data-form]');
  if (!f) return;
  e.preventDefault();
  if (f.dataset.form === 'start') {
    const p = newProfile(new FormData(f).get('name'), pickStarter);
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
  return `<section class="hero">
      <div class="hero-text"><p class="hello">Hi, ${esc(p.name)}!${p.streak > 1 ? ` <span class="pill">${p.streak} days in a row</span>` : ''}</p>
        <h1>Squish ${esc(TOYS[p.buddy].name)} for coins</h1>
        <p class="muted" id="squish-left">${squishText(d.squish)}</p>
        <div class="row"><button class="btn primary big" data-act="go" data-to="trade">Start trading</button>
        ${d.spun ? '' : '<button class="btn big" data-act="wheel">Spin the prize wheel</button>'}</div></div>
      <button class="hero-toy squish" data-squish data-act="heroSquish" aria-label="Squish ${esc(TOYS[p.buddy].name)}">${toySVG(p.buddy)}</button>
    </section>
    ${offerCard()}
    <section class="card"><h2>Today's challenges</h2><ul class="quests">${d.quests.map(questRow).join('')}</ul>
      ${allClaimed ? (d.chest ? '<p class="muted">All done. New challenges tomorrow!</p>' : `<button class="btn primary" data-act="chest">Open the bonus chest</button>`) : '<p class="muted">Finish all three to open the bonus chest.</p>'}</section>
    <section class="card"><h2>Big goals</h2><ul class="quests">${goals.map(goalRow).join('') || '<li>You finished every goal. Amazing!</li>'}</ul>
      <button class="btn" data-act="allGoals">See all goals</button></section>
    <section class="stats"><div><b>${uniqueCount()}</b><span>of ${TOY_LIST.length} toys found</span></div><div><b>${p.stats.trade || 0}</b><span>trades made</span></div><div><b>${Object.keys(p.stories).length}</b><span>of ${STORIES.length} stories read</span></div></section>`;
}
const squishText = (n) => (n > 0 ? `Press your buddy! ${n} coin squish${n === 1 ? '' : 'es'} left today.` : 'No coin squishes left today. You can still squish for fun!');
actions.heroSquish = (el) => {
  const d = P().daily;
  if (d.squish <= 0) return;
  d.squish--; addCoins(2); sfx.coin();
  $('#squish-left').textContent = squishText(d.squish);
  const f = document.createElement('span');
  f.className = 'float-coin'; f.innerHTML = '+2 ' + coinSVG;
  el.append(f); setTimeout(() => f.remove(), 900);
};
actions.claimQuest = (el) => {
  const q = P().daily.quests.find((x) => x.id === el.dataset.id), d = QUESTS.find((x) => x.id === q.id);
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
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('#wheel').style.transition = reduce ? 'none' : 'transform 3.2s cubic-bezier(.15,.8,.2,1)';
  $('#wheel').style.transform = `rotate(${360 * 5 - (i * 45 + 22.5)}deg)`;
  setTimeout(() => {
    closeModal(); go('home');
    if (w.coins) { addCoins(w.coins); prize('You won coins!', `<p>The wheel gives you ${coins(w.coins)}. Come back tomorrow for another spin.</p>`); }
    else {
      const id = w.plushie ? rollToy(['plushie'], [0, 70, 25, 5]) : rollToy(['squishy'], [50, 35, 12, 3]);
      const isNew = !p.seen[id]; addToy(id);
      prize(w.plushie ? 'A bonus plushie!' : 'A free squishy!', `<p>${isNew ? 'It is brand new for your shelf!' : 'Another one to trade!'}</p>`, id);
    }
  }, reduce ? 300 : 3400);
};

// ---------- my toys ----------
function toys() {
  const p = P();
  const chips = [['mine', `My toys (${Object.values(p.inv).reduce((a, b) => a + b, 0)})`], ...Object.keys(CATS).map((c) => [c, `${CATS[c].name} ${byCat(c).filter((t) => p.seen[t.id]).length}/${byCat(c).length}`])];
  let grid;
  if (shelf === 'mine') {
    const mine = ownedList();
    grid = mine.length ? mine.map((id) => toyCard(id, { act: 'toy', count: count(id), tag: id === p.buddy ? 'Buddy' : '' })).join('') : '<p class="muted">Your shelf is empty. Open a mystery bag in the shop!</p>';
  } else {
    grid = byCat(shelf).map((t) => p.seen[t.id] ? toyCard(t.id, { act: 'toy', count: count(t.id), cls: count(t.id) ? '' : 'gone', tag: count(t.id) ? '' : 'Traded' }) : toyCard(t.id, { locked: true, disabled: true })).join('');
  }
  return `<h1>${shelf === 'mine' ? 'My toys' : CATS[shelf].name + ' shelf'}</h1>
    <p class="muted">${shelf === 'mine' ? 'Tap a toy to squish it, sell extras or make it your buddy.' : shelf === 'plushie' ? 'Plushies are bonus prizes. Win them from stories, goals, the prize wheel and Mega bags.' : 'Find every toy on this shelf to win a bonus plushie.'}</p>
    <div class="chips" role="tablist">${chips.map(([k, l]) => `<button class="chip" role="tab" aria-selected="${k === shelf}" data-act="shelf" data-id="${k}">${l}</button>`).join('')}</div>
    <div class="grid">${grid}</div>`;
}
actions.shelf = (el) => { shelf = el.dataset.id; sfx.tap(); go('toys'); };
actions.toy = (el) => {
  const id = el.dataset.id, t = TOYS[id], n = count(id), p = P();
  sfx.squish();
  modal(`<div class="detail"><div class="detail-toy squish" data-squish>${toySVG(id)}</div>
    <h2>${esc(t.name)}</h2><p><span class="pill r-${t.r}">${RARITY[t.r].name}</span> <span class="pill">${CATS[t.cat].one}</span></p>
    <p>Worth ${coins(t.value)} &middot; ${n ? `You have ${n}` : 'You traded this one away'}</p><p class="muted">Press and hold to squish!</p>
    <div class="row center">${n && p.buddy !== id ? `<button class="btn primary" data-act="buddy" data-id="${id}">Make my buddy</button>` : ''}
    ${n > 1 ? `<button class="btn" data-act="sell" data-id="${id}">Sell 1 extra for ${coins(Math.round(t.value / 2))}</button>` : ''}</div></div>`, { label: t.name });
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
      <p class="muted">${b.cats.length > 2 ? 'Any toy, even plushies. Best luck!' : b.cats.map((c) => CATS[c].name).join(' and ')}</p>
      <button class="btn primary" data-act="buy" data-id="${b.id}">Open for ${coins(b.cost)}</button></article>`).join('')}</div>
    <section class="card"><h2>Need more coins?</h2><p class="muted">Play mini-games, read stories, finish challenges, or sell your extra toys.</p>
      <div class="row"><button class="btn" data-act="go" data-to="games">Play games</button><button class="btn" data-act="go" data-to="stories">Read stories</button></div></section>`;
}
actions.buy = (el) => {
  const b = BAGS.find((x) => x.id === el.dataset.id), p = P(), i = BAGS.indexOf(b);
  if (p.coins < b.cost) { sfx.no(); return toast(`You need ${b.cost - p.coins} more coins. Try a mini-game!`); }
  addCoins(-b.cost);
  const id = rollToy(b.cats, b.odds), isNew = !p.seen[id];
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
  return `<h1>Story time</h1><p class="muted">You choose what happens next. Every story has four endings to find. Finish a story to win coins and a plushie.</p>
    <div class="story-list">${STORIES.map((s) => {
      const got = Object.keys(p.stories[s.id] || {}).length;
      return `<button class="card story-card" data-act="story" data-id="${s.id}"><span class="story-art">${toySVG(s.toy)}</span>
        <span><b>${s.title}</b><small>${got ? `${got} of ${endings(s)} endings found` : `Prize: ${coins(s.coins)} + ${esc(TOYS[s.prize].name)}`}</small></span></button>`;
    }).join('')}</div>`;
}
let reading = null;
actions.story = (el) => { reading = { s: STORIES.find((x) => x.id === el.dataset.id) }; reading.at = reading.s.start; sfx.tap(); page(); };
actions.choose = (el) => { reading.at = el.dataset.id; sfx.tap(); speechSynthesis?.cancel(); page(); };
actions.readAloud = () => {
  if (!('speechSynthesis' in window)) return toast('This device cannot read aloud.');
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance($('#story-text').textContent); u.rate = 0.9; u.pitch = 1.1;
  speechSynthesis.speak(u);
};
function page() {
  const p = P(), { s, at } = reading, n = s.nodes[at];
  router.cleanup = () => window.speechSynthesis?.cancel();
  let foot;
  if (n.end) {
    const rec = (p.stories[s.id] = p.stories[s.id] || {}), first = Object.keys(rec).length === 0, newEnd = !rec[n.end];
    rec[n.end] = 1;
    const c = first ? s.coins : newEnd ? 15 : 5;
    addCoins(c); track('story');
    if (first) addToy(s.prize);
    sfx.win(); confetti();
    foot = `<div class="ending"><p class="pill big">Ending: ${n.end}</p><p>You win ${coins(c)}${first ? ` and <b>${esc(TOYS[s.prize].name)}</b>!` : newEnd ? ' for finding a new ending.' : '.'}</p>
      ${first ? `<div class="prize-toy squish" data-squish>${toySVG(s.prize)}</div>` : ''}
      <p class="muted">${Object.keys(rec).length} of ${endings(s)} endings found.</p>
      <div class="row center"><button class="btn primary" data-act="story" data-id="${s.id}">Read again</button><button class="btn" data-act="go" data-to="stories">More stories</button></div></div>`;
  } else {
    foot = `<p class="what">What do you do?</p><div class="choices">${n.c.map(([l, to]) => `<button class="btn big choice" data-act="choose" data-id="${to}">${l}</button>`).join('')}</div>`;
  }
  view.className = 'view v-reader';
  view.innerHTML = `<button class="btn back" data-act="go" data-to="stories">${icon('back')} Stories</button>
    <article class="card reader"><h1>${s.title}</h1><div class="reader-art squish" data-squish>${toySVG(n.art)}</div>
    <p id="story-text" class="story-text">${esc(n.t.replaceAll('{name}', p.name))}</p>
    <button class="btn sm" data-act="readAloud">${icon('sound')} Read it to me</button>${foot}</article>`;
  window.scrollTo(0, 0);
}

// ---------- players, sound, grown-ups ----------
actions.who = () => {
  const p = P();
  modal(`<h2>Who is playing?</h2><div class="players">${store.profiles.map((x) => `<button class="player ${x.id === p.id ? 'sel' : ''}" data-act="switch" data-id="${x.id}"><span class="who-art">${toySVG(x.buddy)}</span><b>${esc(x.name)}</b><small>${coins(x.coins)}</small></button>`).join('')}</div>
    <div class="row"><button class="btn primary" data-act="addPlayer">Add a player</button><button class="btn" data-act="grownups">For grown-ups</button></div>`, { label: 'Players' });
};
actions.switch = (el) => { store.cur = el.dataset.id; save(); closeModal(); go('home'); toast(`Hi, ${esc(P().name)}!`); };
actions.addPlayer = () => { closeModal(); welcome(true); };
actions.grownups = () => modal(`<h2>For grown-ups</h2>
  <p>This game has no accounts, no ads and no real money. Coins are pretend. Each player's toys are saved in this browser on this device.</p>
  <p><b>Online trading</b> connects two devices directly with a 4-letter room code. Share the code only with friends you know. Players can send toys, pretend coins and six preset phrases. There is no typing or chat. Only the player's nickname is shared.</p>
  <p class="muted">Removing a player deletes their toys from this device for good.</p>
  <button class="btn danger" data-act="removePlayer">Remove ${esc(P().name)}</button>`, { label: 'For grown-ups' });
actions.removePlayer = () => modal(`<h2>Remove ${esc(P().name)}?</h2><p>All of their toys and coins will be gone. This cannot be undone.</p>
  <div class="row"><button class="btn" data-act="closeModal" autofocus>Keep playing</button><button class="btn danger" data-act="removeYes">Yes, remove</button></div>`, { label: 'Remove player' });
actions.removeYes = () => {
  store.profiles = store.profiles.filter((x) => x.id !== store.cur);
  store.cur = store.profiles[0]?.id || null; save(); closeModal(); go('home');
};

// ---------- global input ----------
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (el && !el.disabled && actions[el.dataset.act]) actions[el.dataset.act](el, e);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#modal .modal-back:not([data-act])')) closeModal(); });
let lastSquish = 0;
document.addEventListener('pointerdown', (e) => {
  const el = e.target.closest('[data-squish]');
  if (!el) return;
  el.classList.remove('boing'); el.classList.add('down');
  if (Date.now() - lastSquish > 120) { sfx.squish(); if (P()) track('squish'); lastSquish = Date.now(); }
});
['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => document.addEventListener(ev, (e) => {
  document.querySelectorAll('[data-squish].down').forEach((el) => { el.classList.remove('down'); el.classList.add('boing'); });
}, true));

$('#nav').innerHTML = [['home', 'Home'], ['toys', 'My toys'], ['trade', 'Trade'], ['games', 'Games'], ['stories', 'Stories'], ['shop', 'Shop']]
  .map(([k, l]) => `<button data-act="go" data-to="${k}">${icon(k)}<span>${l}</span></button>`).join('');
if (P()) ensureDaily();
go('home');
