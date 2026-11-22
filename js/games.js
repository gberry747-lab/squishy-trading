// Four mini-games that pay coins.
import { TOYS, TOY_LIST } from './data.js';
import { toySVG, icon } from './art.js';
import { P, save, addCoins, track } from './state.js';
import { $, router, actions, sfx, coins, confetti } from './ui.js';

const GAMES = [
  { id: 'pop', name: 'Pop Party', art: 'fi01', how: 'Pop the bubbles that puff up. Gold ones are worth 3!', unit: 'pops' },
  { id: 'match', name: 'Memory Match', art: 'sq13', how: 'Flip two cards. Find all the matching toys.', unit: 'points' },
  { id: 'mix', name: 'Slime Lab', art: 'sl12', how: 'Pick the two colors that mix into the slime on the card.', unit: 'perfect mixes' },
  { id: 'catch', name: 'Squishy Catch', art: 'do03', how: 'Slide the tub to catch falling toys. Dodge the mud!', unit: 'catches' },
];
const view = () => $('#view');
const best = (id) => P().stats['best_' + id] || 0;

export function gamesScreen() {
  return `<h1>Mini-games</h1><p class="muted">Every game pays coins. Play as many times as you like.</p>
    <div class="game-list">${GAMES.map((g) => `<article class="card game-card"><div class="game-art squish" data-squish>${toySVG(g.art)}</div>
      <div><h2>${g.name}</h2><p class="muted">${g.how}</p>${best(g.id) ? `<p class="pill">Best: ${best(g.id)} ${g.unit}</p>` : ''}</div>
      <button class="btn primary" data-act="play" data-id="${g.id}">Play</button></article>`).join('')}</div>`;
}

let timers = [];
const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(() => clearTimeout(t)); return t; };
const every = (fn, ms) => { const t = setInterval(fn, ms); timers.push(() => clearInterval(t)); return t; };
function stopAll() { timers.forEach((f) => f()); timers = []; }

function frame(g, inner) {
  stopAll();
  router.cleanup = stopAll;
  view().className = 'view v-game';
  view().innerHTML = `<button class="btn back" data-act="go" data-to="games">${icon('back')} Games</button>
    <div class="game-head"><h1>${g.name}</h1><p class="score">Score <b id="score">0</b></p></div>
    <div class="timebar" id="timebar" hidden><i></i></div>${inner}`;
  window.scrollTo(0, 0);
}
function countdown(sec, done) {
  const bar = $('#timebar'); bar.hidden = false;
  const start = Date.now();
  every(() => {
    const left = 1 - (Date.now() - start) / (sec * 1000);
    bar.firstElementChild.style.width = Math.max(0, left * 100) + '%';
    if (left <= 0) done();
  }, 100);
}
function finish(g, score, won, line) {
  stopAll();
  const p = P(), isBest = score > best(g.id);
  if (isBest) p.stats['best_' + g.id] = score;
  addCoins(won); track('game'); save();
  sfx.win(); if (won >= 20) confetti();
  view().innerHTML = `<section class="card result"><div class="game-art squish" data-squish>${toySVG(g.art)}</div><h1>${line}</h1>
    <p class="big-num">${score} ${g.unit}${isBest && score ? ' <span class="pill">New best!</span>' : ''}</p><p>You win ${coins(won)}</p>
    <div class="row center"><button class="btn primary big" data-act="play" data-id="${g.id}">Play again</button><button class="btn big" data-act="go" data-to="games">More games</button></div></section>`;
}
const setScore = (n) => { const el = $('#score'); if (el) el.textContent = n; };

actions.play = (el) => { sfx.tap(); ({ pop, match, mix, catch: catchGame })[el.dataset.id](GAMES.find((g) => g.id === el.dataset.id)); };

// ---------- Pop Party ----------
function pop(g) {
  let score = 0, pops = 0;
  frame(g, `<div class="pop-grid">${Array.from({ length: 16 }, (_, i) => `<button class="bub" data-act="bub" data-i="${i}" aria-label="Bubble"></button>`).join('')}</div>`);
  const bubs = [...document.querySelectorAll('.bub')];
  const puff = () => {
    const idle = bubs.filter((b) => !b.classList.contains('up'));
    if (!idle.length) return;
    const b = idle[Math.floor(Math.random() * idle.length)];
    b.classList.add('up'); b.classList.toggle('gold', Math.random() < 0.12);
    later(() => b.classList.remove('up', 'gold'), 1400);
  };
  actions.bub = (b) => {
    if (!b.classList.contains('up')) return;
    score += b.classList.contains('gold') ? 3 : 1; pops++;
    b.classList.remove('up', 'gold'); b.classList.add('popped'); later(() => b.classList.remove('popped'), 200);
    sfx.pop(); setScore(score);
  };
  puff(); every(puff, 480);
  countdown(30, () => { track('pop', pops); finish(g, score, Math.min(40, Math.round(score * 0.8)), score >= 30 ? 'Pop star!' : 'Nice popping!'); });
}

// ---------- Memory Match ----------
function match(g) {
  const pool = [...TOY_LIST].sort(() => Math.random() - 0.5).slice(0, 6).map((t) => t.id);
  const deck = [...pool, ...pool].sort(() => Math.random() - 0.5);
  let open = [], found = 0, moves = 0, lock = false;
  frame(g, `<p class="muted">Moves: <b id="moves">0</b></p><div class="mem-grid">${deck.map((id, i) => `<button class="mem" data-act="mem" data-i="${i}" aria-label="Card ${i + 1}, face down"><span class="mem-front">${toySVG(id)}</span><span class="mem-back">?</span></button>`).join('')}</div>`);
  actions.mem = (c) => {
    const i = +c.dataset.i;
    if (lock || c.classList.contains('open')) return;
    c.classList.add('open'); c.setAttribute('aria-label', TOYS[deck[i]].name); sfx.tap(); open.push(c);
    if (open.length < 2) return;
    moves++; $('#moves').textContent = moves;
    const [a, b] = open; open = [];
    if (deck[+a.dataset.i] === deck[+b.dataset.i]) {
      a.classList.add('done'); b.classList.add('done'); a.disabled = b.disabled = true; found++; sfx.pop(); setScore(found * 10);
      if (found === 6) { track('match'); const pts = Math.max(20, 120 - moves * 5); later(() => finish(g, pts, Math.max(12, 44 - moves * 2), moves <= 9 ? 'Super memory!' : 'All matched!'), 600); }
    } else {
      lock = true;
      later(() => { [a, b].forEach((x, k) => { x.classList.remove('open'); x.setAttribute('aria-label', `Card ${+x.dataset.i + 1}, face down`); }); lock = false; }, 800);
    }
  };
}

// ---------- Slime Lab ----------
const PAINT = { red: '#F0524F', yellow: '#FFD84A', blue: '#4C8DF5', white: '#FFFDF8' };
const MIXES = { 'red+yellow': ['orange', '#FF9A3D'], 'blue+yellow': ['green', '#6CC24A'], 'blue+red': ['purple', '#8E5BD0'], 'red+white': ['pink', '#FF8FC0'], 'blue+white': ['sky blue', '#8ED3FF'], 'white+yellow': ['lemon cream', '#FFF0A0'] };
const blob = (c) => `<svg viewBox="0 0 100 100" class="toy-svg" aria-hidden="true"><path d="M16 56C10 34 30 22 44 28C56 14 86 24 82 48C94 62 80 86 60 80C44 92 20 82 16 56Z" fill="${c}" stroke="#2A1846" stroke-width="3"/><ellipse cx="38" cy="42" rx="8" ry="4" fill="#fff" opacity=".5" transform="rotate(-25 38 42)"/></svg>`;
function mix(g) {
  const rounds = Object.keys(MIXES).sort(() => Math.random() - 0.5).slice(0, 5);
  let r = 0, score = 0, sel = [];
  const round = () => {
    sel = [];
    const [name, col] = MIXES[rounds[r]];
    $('#lab').innerHTML = `<p class="muted">Slime ${r + 1} of 5</p><div class="lab-target">${blob(col)}<p>Make <b>${name}</b> slime</p></div>
      <div class="bottles">${Object.keys(PAINT).map((k) => `<button class="bottle" data-act="bottle" data-id="${k}" aria-pressed="false"><i style="background:${PAINT[k]}"></i><span>${k}</span></button>`).join('')}</div>
      <button class="btn primary big" data-act="mixIt" id="mix-btn" disabled>Pick 2 colors</button><p id="lab-say" class="lab-say" aria-live="polite"></p>`;
  };
  frame(g, `<section class="card lab" id="lab"></section>`);
  round();
  actions.bottle = (b) => {
    const k = b.dataset.id;
    if (sel.includes(k)) sel = sel.filter((x) => x !== k); else if (sel.length < 2) sel.push(k);
    document.querySelectorAll('.bottle').forEach((x) => x.setAttribute('aria-pressed', sel.includes(x.dataset.id)));
    sfx.tap();
    const btn = $('#mix-btn'); btn.disabled = sel.length !== 2; btn.textContent = sel.length === 2 ? 'Mix!' : 'Pick 2 colors';
  };
  actions.mixIt = (btn) => {
    const key = [...sel].sort().join('+'), made = MIXES[key], right = key === rounds[r];
    btn.disabled = true; document.querySelectorAll('.bottle').forEach((x) => (x.disabled = true));
    $('.lab-target').innerHTML = `${blob(made[1])}<p>You made <b>${made[0]}</b> slime!</p>`;
    if (right) { score++; sfx.win(); setScore(score); $('#lab-say').textContent = 'Perfect mix!'; }
    else { sfx.no(); $('#lab-say').textContent = `Oops! We wanted ${MIXES[rounds[r]][0]}.`; }
    later(() => { r++; if (r < 5) round(); else { track('mix', score); finish(g, score, 8 + score * 6, score === 5 ? 'Slime genius!' : 'Good mixing!'); } }, 1500);
  };
}

// ---------- Squishy Catch ----------
function catchGame(g) {
  let score = 0, caught = 0, x = 50, items = [], last = performance.now(), spawnAt = 0, run = true;
  frame(g, `<div class="arena" id="arena" tabindex="0" aria-label="Catch arena. Use the arrow keys or drag to move the tub."><div class="tub" id="tub"><svg viewBox="0 0 100 60" aria-hidden="true"><path d="M6 8L16 52Q17 58 24 58L76 58Q83 58 84 52L94 8Z" fill="#FFD84A" stroke="#2A1846" stroke-width="4" stroke-linejoin="round"/><rect x="2" y="2" width="96" height="12" rx="6" fill="#C81E7A" stroke="#2A1846" stroke-width="4"/></svg></div></div>
    <div class="row center catch-keys"><button class="btn big" data-act="tubL" aria-label="Move left">${icon('back')}</button><button class="btn big flip" data-act="tubR" aria-label="Move right">${icon('back')}</button></div>`);
  const arena = $('#arena'), tub = $('#tub');
  const place = () => { x = Math.max(8, Math.min(92, x)); tub.style.left = x + '%'; };
  const move = (e) => { const r = arena.getBoundingClientRect(); x = ((e.clientX - r.left) / r.width) * 100; place(); };
  arena.addEventListener('pointermove', move); arena.addEventListener('pointerdown', move);
  arena.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') { x -= 8; place(); e.preventDefault(); } if (e.key === 'ArrowRight') { x += 8; place(); e.preventDefault(); } });
  actions.tubL = () => { x -= 12; place(); }; actions.tubR = () => { x += 12; place(); };
  place();
  const pool = TOY_LIST.filter((t) => t.cat === 'squishy' || t.cat === 'plushie');
  const loop = (now) => {
    if (!run) return;
    const dt = Math.min(50, now - last); last = now;
    if (now > spawnAt) {
      const mud = Math.random() < 0.16, el = document.createElement('div');
      el.className = 'drop' + (mud ? ' mud' : '');
      el.innerHTML = mud ? blob('#8A5A3C') : toySVG(pool[Math.floor(Math.random() * pool.length)].id);
      const it = { el, x: 8 + Math.random() * 84, y: -12, mud, v: 0.035 + Math.random() * 0.02 + caught * 0.0006 };
      el.style.left = it.x + '%'; arena.append(el); items.push(it);
      spawnAt = now + Math.max(380, 800 - caught * 8);
    }
    items = items.filter((it) => {
      it.y += it.v * dt; it.el.style.top = it.y + '%';
      if (it.y > 76 && it.y < 90 && Math.abs(it.x - x) < 13) {
        if (it.mud) { score = Math.max(0, score - 2); sfx.no(); arena.classList.add('oops'); later(() => arena.classList.remove('oops'), 250); }
        else { score++; caught++; sfx.pop(); }
        setScore(score); it.el.remove(); return false;
      }
      if (it.y > 104) { it.el.remove(); return false; }
      return true;
    });
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  timers.push(() => { run = false; });
  countdown(30, () => { track('catch', caught); finish(g, score, Math.min(40, score), score >= 25 ? 'Catch champion!' : 'Great catching!'); });
}
