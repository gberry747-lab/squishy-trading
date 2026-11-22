// Four mini-games that pay coins.
import { TOYS, TOY_LIST, CATS, RARITY, FRIENDS } from './data.js';
import { toySVG, icon } from './art.js';
import { P, save, addCoins, track, rollToy } from './state.js';
import { $, router, actions, sfx, coins, confetti, glitterBurst, modal, closeModal } from './ui.js';

const GAMES = [
  { id: 'pop', name: 'Pop Party', art: 'fi01', how: 'Pop the bubbles that puff up. Gold ones are worth 3!', unit: 'pops' },
  { id: 'match', name: 'Memory Match', art: 'sq13', how: 'Flip two cards. Find all the matching toys.', unit: 'points' },
  { id: 'mix', name: 'Slime Lab', art: 'sl12', how: 'Pick the two colors that mix into the slime on the card.', unit: 'perfect mixes' },
  { id: 'catch', name: 'Squishy Catch', art: 'do03', how: 'Slide the tub to catch falling toys. Dodge the mud!', unit: 'catches' },
  { id: 'copy', name: 'Copy Cat', art: 'fi04', how: 'Watch the bubbles light up, then tap them in the same order.', unit: 'patterns' },
  { id: 'sort', name: 'Toy Sorter', art: 'sq36', how: 'Which shelf does the toy belong on? Sort as many as you can.', unit: 'toys sorted' },
  { id: 'stairs', name: 'Springy Stairs', art: 'sp07', how: 'Tap when the dot is in the green to walk the springy down the stairs.', unit: 'steps' },
  { id: 'odd', name: 'Odd One Out', art: 'sq32', how: 'One toy is different from the rest. Find it fast!', unit: 'found' },
  { id: 'shadow', name: 'Shadow Match', art: 'sq50', how: 'Whose shadow is it? Pick the toy that matches.', unit: 'shadows' },
  { id: 'judge', name: 'Fair or Not?', art: 'sq23', how: 'Add up what each side is worth. Is the trade fair?', unit: 'right calls' },
  { id: 'shuffle', name: 'Bag Shuffle', art: 'sq12', how: 'Watch the bag with the toy as they swap around. Where did it go?', unit: 'finds' },
  { id: 'count', name: 'Quick Count', art: 'sq46', how: 'Count the toys before the time runs out.', unit: 'right counts' },
  { id: 'blast', name: 'Glitter Blast', art: 'sq112', how: 'Glitter bombs float up. Pop them before they get away, but leave the rain clouds!', unit: 'points' },
  { id: 'claw', name: 'Claw Machine', art: 'pl23', how: 'Line up the claw and drop it. Rarer toys score more.', unit: 'points' },
  { id: 'stack', name: 'Squishy Stack', art: 'sq97', how: 'Drop each squishy on top of the last one. How tall can you build?', unit: 'stacked' },
  { id: 'missing', name: 'What Is Missing?', art: 'sq38', how: 'Remember the toys. One sneaks away. Which one?', unit: 'spotted' },
  { id: 'tapit', name: 'Tap It!', art: 'fi02', how: 'Toys pop up. Tap only the kind the sign asks for.', unit: 'points' },
  { id: 'hilo', name: 'More or Less', art: 'sq137', how: 'Is the next toy worth more coins or less? Learn what makes a toy rare.', unit: 'right guesses' },
  { id: 'pattern', name: 'Finish the Pattern', art: 'sq138', how: 'Look at the row of toys. Which one comes next?', unit: 'patterns' },
  { id: 'tactoe', name: 'Squishy Tac Toe', art: 'pl32', how: 'Get three in a row. Play the computer or a friend sitting with you. Best of three rounds.', unit: 'wins', vs: true },
  { id: 'four', name: 'Four in a Row', art: 'sq145', how: 'Drop squishies into the frame. First to line up four wins. Play the computer or a friend.', unit: 'wins', vs: true },
  { id: 'tug', name: 'Tap Tug', art: 'sp05', how: 'Tap as fast as you can to pull the squishy to your side. Play the computer or a friend.', unit: 'wins', vs: true },
  { id: 'quick', name: 'Quick Squish', art: 'sq58', how: 'Wait for SQUISH, then tap first. Tap too early and you lose the round. Computer or a friend.', unit: 'rounds won', vs: true },
  { id: 'math', name: 'Shop Math', art: 'sq149', how: 'Add up toys and count your change. Pick the right number of coins.', unit: 'right answers' },
];
const view = () => $('#view');
// The player's own handmade squishies join in several games.
const mine = () => Object.keys(P().inv).filter((id) => TOYS[id] && TOYS[id].custom).map((id) => TOYS[id]);
const best = (id) => P().stats['best_' + id] || 0;

export function gamesScreen() {
  return `<h1>Mini-games</h1><p class="muted">Every game pays coins. Play as many times as you like.</p>
    <div class="game-list">${GAMES.map((g) => `<article class="card game-card"><div class="game-art squish" data-squish data-toy="${g.art}">${toySVG(g.art)}</div>
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
  view().innerHTML = `<section class="card result"><div class="game-art squish" data-squish data-toy="${g.art}">${toySVG(g.art)}</div><h1>${line}</h1>
    <p class="big-num">${score} ${g.unit}${isBest && score ? ' <span class="pill">New best!</span>' : ''}</p><p>You win ${coins(won)}</p>
    <div class="row center"><button class="btn primary big" data-act="play" data-id="${g.id}" ${g.vs ? `data-mode="${lastMode[g.id] || '1'}"` : ''}>Play again</button><button class="btn big" data-act="go" data-to="games">More games</button></div></section>`;
}
const setScore = (n) => { const el = $('#score'); if (el) el.textContent = n; };

const START = () => ({ pop, match, mix, catch: catchGame, copy, sort, stairs, odd, shadow, judge, shuffle, count, blast, claw, stack, missing, tapit, hilo, pattern, tactoe, four, tug, quick, math });
// Games marked "vs" ask first: play the computer, or a friend on the same screen?
actions.play = (el) => {
  sfx.tap();
  const g = GAMES.find((x) => x.id === el.dataset.id);
  if (g.vs && !el.dataset.mode) {
    return modal(`<h2>${g.name}</h2><p class="muted">Who is playing?</p><div class="modes"><button class="mode" data-act="play" data-id="${g.id}" data-mode="1"><b>1 player</b><small>You against the computer</small></button><button class="mode" data-act="play" data-id="${g.id}" data-mode="2"><b>2 players</b><small>Take turns on this screen</small></button></div>`, { label: g.name });
  }
  closeModal(); lastMode[g.id] = el.dataset.mode || lastMode[g.id] || '1';
  START()[g.id](g, lastMode[g.id] === '2');
};
const lastMode = {};

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
  const pool = [...mine().sort(() => Math.random() - 0.5).slice(0, 2), ...[...TOY_LIST].sort(() => Math.random() - 0.5)].slice(0, 6).map((t) => t.id);
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
  const pool = [...TOY_LIST.filter((t) => t.cat === 'squishy' || t.cat === 'plushie'), ...Array.from({ length: 12 }, () => mine()).flat()];
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

// ---------- Copy Cat ----------
function copy(g) {
  const cols = ['#FF8FC0', '#8ED3FF', '#FFD84A', '#9BD84A'], notes = [392, 494, 587, 698];
  let seq = [], at = 0, rounds = 0, busy = true;
  frame(g, `<p class="game-say" id="say" aria-live="polite">Watch closely...</p><div class="copy-grid">${cols.map((c, i) => `<button class="pad" data-act="pad" data-i="${i}" style="--c:${c}" aria-label="Bubble ${i + 1}"></button>`).join('')}</div>`);
  const pads = [...document.querySelectorAll('.pad')];
  const flash = (i, ms = 320) => { pads[i].classList.add('lit'); sfx.note(notes[i]); later(() => pads[i].classList.remove('lit'), ms); };
  const show = () => {
    busy = true; at = 0; seq.push(Math.floor(Math.random() * 4));
    $('#say').textContent = 'Watch closely...';
    const gap = Math.max(380, 620 - seq.length * 20);
    seq.forEach((n, k) => later(() => flash(n), 600 + k * gap));
    later(() => { busy = false; $('#say').textContent = 'Your turn!'; }, 600 + seq.length * gap);
  };
  actions.pad = (b) => {
    if (busy) return;
    const i = +b.dataset.i; flash(i, 180);
    if (i !== seq[at]) { busy = true; sfx.no(); $('#say').textContent = 'Oops, wrong bubble!'; track('copy', rounds); return later(() => finish(g, rounds, Math.min(45, 5 + rounds * 5), rounds >= 6 ? 'Amazing memory!' : 'Good copying!'), 900); }
    at++;
    if (at === seq.length) { rounds++; setScore(rounds); busy = true; $('#say').textContent = 'Yes! Here comes a longer one.'; later(show, 700); }
  };
  show();
}

// ---------- Toy Sorter ----------
function sort(g) {
  const cats = Object.keys(CATS);
  let score = 0, cur = null;
  frame(g, `<section class="card sorter"><div class="sort-toy" id="sort-toy"></div><p class="game-say" id="say">Which shelf?</p><div class="bins" id="bins"></div></section>`);
  const next = () => {
    cur = TOY_LIST[Math.floor(Math.random() * TOY_LIST.length)];
    const opts = [cur.cat, ...cats.filter((c) => c !== cur.cat).sort(() => Math.random() - 0.5).slice(0, 2)].sort(() => Math.random() - 0.5);
    $('#sort-toy').innerHTML = `<div class="squish boing">${toySVG(cur.id)}</div><b>${cur.name}</b>`;
    $('#bins').innerHTML = opts.map((c) => `<button class="btn big bin" data-act="bin" data-id="${c}">${CATS[c].name}</button>`).join('');
  };
  actions.bin = (b) => {
    if (b.dataset.id === cur.cat) { score++; sfx.pop(); setScore(score); $('#say').textContent = 'Yes!'; next(); }
    else { sfx.no(); b.disabled = true; $('#say').textContent = `Not that one. Try again!`; }
  };
  next();
  countdown(30, () => { track('sort', score); finish(g, score, Math.min(45, Math.round(score * 1.8)), score >= 18 ? 'Super sorter!' : 'Nicely sorted!'); });
}

// ---------- Springy Stairs ----------
function stairs(g) {
  const STEPS = 12;
  let step = 0, lives = 3, pos = 0, dir = 1, speed = 0.07, zone = [38, 62], run = true, last = performance.now(), pause = false;
  frame(g, `<div class="stairs" id="stairs" aria-hidden="true">${Array.from({ length: STEPS + 1 }, (_, i) => `<i style="--n:${i}"></i>`).join('')}<div class="walker" id="walker">${toySVG('sp07')}</div></div>
    <p class="game-say" id="say" aria-live="polite">Lives: <span id="lives">3</span></p>
    <button class="timing" data-act="stepIt" id="timing" aria-label="Tap when the dot is in the green zone"><span class="zone" id="zone"></span><span class="dot" id="dot"></span></button>
    <div class="row center"><button class="btn primary big" data-act="stepIt">Step!</button></div>`);
  const setZone = () => {
    const w = Math.max(12, 26 - step * 1.2), c = 20 + Math.random() * 60;
    zone = [Math.max(0, c - w / 2), Math.min(100, c + w / 2)];
    $('#zone').style.left = zone[0] + '%'; $('#zone').style.width = zone[1] - zone[0] + '%';
  };
  const walk = () => { const w = $('#walker'); w.style.setProperty('--n', step); w.classList.remove('hop'); void w.offsetWidth; w.classList.add('hop'); };
  setZone(); walk();
  const loop = (now) => {
    if (!run) return;
    const dt = Math.min(50, now - last); last = now;
    if (!pause) { pos += dir * speed * dt; if (pos >= 100) { pos = 100; dir = -1; } if (pos <= 0) { pos = 0; dir = 1; } $('#dot').style.left = pos + '%'; }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  timers.push(() => { run = false; });
  const end = () => { track('step', step); finish(g, step, step * 3 + (step === STEPS ? 9 : 0), step === STEPS ? 'All the way down!' : 'Boing! Good try!'); };
  actions.stepIt = () => {
    if (pause) return;
    if (pos >= zone[0] && pos <= zone[1]) {
      step++; sfx.pop(); setScore(step); walk(); speed += 0.006;
      if (step === STEPS) { pause = true; return later(end, 700); }
      setZone();
    } else {
      lives--; sfx.no(); $('#lives').textContent = lives; $('#timing').classList.add('miss'); later(() => $('#timing').classList.remove('miss'), 250);
      if (lives === 0) { pause = true; later(end, 600); }
    }
  };
}

// ---------- Odd One Out ----------
function odd(g) {
  let score = 0;
  frame(g, `<p class="game-say" id="say">Find the toy that is different.</p><div class="odd-grid" id="odd"></div>`);
  const next = () => {
    const n = score < 3 ? 3 : score < 8 ? 4 : 5;
    const base = TOY_LIST[Math.floor(Math.random() * TOY_LIST.length)];
    const sameShape = TOY_LIST.filter((t) => t.id !== base.id && t.cat === base.cat && t.v === base.v);
    const sameCat = TOY_LIST.filter((t) => t.id !== base.id && t.cat === base.cat);
    const pool = score >= 5 && sameShape.length ? sameShape : sameCat;
    const other = pool[Math.floor(Math.random() * pool.length)];
    const spot = Math.floor(Math.random() * n * n);
    const grid = $('#odd');
    grid.style.setProperty('--n', n);
    grid.innerHTML = Array.from({ length: n * n }, (_, i) => `<button class="odd-cell" data-act="oddPick" data-hit="${i === spot ? 1 : 0}" aria-label="${i === spot ? other.name : base.name}">${toySVG(i === spot ? other.id : base.id)}</button>`).join('');
  };
  actions.oddPick = (b) => {
    if (b.dataset.hit === '1') { score++; sfx.pop(); setScore(score); next(); }
    else { sfx.no(); b.classList.add('wrong'); b.disabled = true; }
  };
  next();
  countdown(40, () => { track('odd', score); finish(g, score, Math.min(45, score * 3), score >= 12 ? 'Eagle eyes!' : 'Sharp spotting!'); });
}

const rnd = (n) => Math.floor(Math.random() * n);
const mixUp = (a) => [...a].sort(() => Math.random() - 0.5);

// ---------- Shadow Match ----------
function shadow(g) {
  let score = 0;
  frame(g, `<section class="card shadow-card"><div class="shadow-toy" id="shadow-toy"></div><p class="game-say" id="say">Whose shadow is this?</p><div class="shadow-opts" id="opts"></div></section>`);
  const next = () => {
    const first = TOY_LIST[rnd(TOY_LIST.length)];
    const pool = score >= 4 ? TOY_LIST.filter((t) => t.cat === first.cat) : TOY_LIST;
    const seen = new Set(), opts = [first];
    seen.add(first.cat + first.v);
    mixUp(pool).forEach((t) => { if (opts.length < 4 && !seen.has(t.cat + t.v)) { seen.add(t.cat + t.v); opts.push(t); } });
    mixUp(TOY_LIST).forEach((t) => { if (opts.length < 4 && !seen.has(t.cat + t.v)) { seen.add(t.cat + t.v); opts.push(t); } });
    $('#shadow-toy').innerHTML = toySVG(first.id);
    $('#opts').innerHTML = mixUp(opts).map((t) => `<button class="odd-cell" data-act="shadowPick" data-hit="${t.id === first.id ? 1 : 0}" aria-label="${t.name}">${toySVG(t.id)}</button>`).join('');
  };
  actions.shadowPick = (b) => {
    if (b.dataset.hit === '1') { score++; sfx.pop(); setScore(score); next(); }
    else { sfx.no(); b.classList.add('wrong'); b.disabled = true; }
  };
  next();
  countdown(35, () => { track('shadow', score); finish(g, score, Math.min(45, score * 3), score >= 12 ? 'Shadow master!' : 'Good guessing!'); });
}

// ---------- Fair or Not? ----------
const MARK = { yes: '<path d="M5 13l5 6L20 5"/>', no: '<path d="M5 5l14 14M19 5L5 19"/>' };
function judge(g) {
  let score = 0, fair = true, busy = false;
  const byR = (r) => TOY_LIST.filter((t) => t.r === r);
  const side = (toys) => `<div class="judge-side">${toys.map((t) => `<div class="judge-toy">${toySVG(t.id)}<b>${t.value}</b></div>`).join('')}</div>`;
  frame(g, `<section class="card judge"><p class="game-say" id="say">Add up each side. Is it a fair trade?</p><div class="judge-row" id="judge-row"></div>
    <div class="judge-keys"><button class="key key-yes" data-act="judgeIt" data-v="1" aria-label="Fair"><svg viewBox="0 0 24 24" aria-hidden="true">${MARK.yes}</svg><span>Fair</span></button><button class="key key-no" data-act="judgeIt" data-v="0" aria-label="Not fair"><svg viewBox="0 0 24 24" aria-hidden="true">${MARK.no}</svg><span>Not fair</span></button></div></section>`);
  const next = () => {
    busy = false;
    const rs = score < 4 ? ['c', 'r'] : ['c', 'r', 'e'];
    const n = score < 3 ? 1 + rnd(2) : 2 + rnd(2);
    const left = Array.from({ length: n }, () => rs[rnd(rs.length)]);
    let right = mixUp(left);
    fair = Math.random() < 0.5;
    if (!fair) { const i = rnd(n), others = rs.filter((r) => r !== right[i]); right[i] = others[rnd(others.length)]; }
    const pick = (r) => { const pool = byR(r); return pool[rnd(pool.length)]; };
    const L = left.map(pick), R = right.map(pick);
    $('#judge-row').dataset.l = L.reduce((a, t) => a + t.value, 0); $('#judge-row').dataset.r = R.reduce((a, t) => a + t.value, 0);
    $('#judge-row').innerHTML = `${side(L)}<span class="swap" aria-hidden="true">${icon('trade')}</span>${side(R)}`;
    $('#say').textContent = 'Add up each side. Is it a fair trade?';
  };
  actions.judgeIt = (b) => {
    if (busy) return;
    busy = true;
    const row = $('#judge-row'), right = (b.dataset.v === '1') === fair;
    if (right) { score++; sfx.pop(); setScore(score); }
    else sfx.no();
    $('#say').textContent = `${right ? 'Yes!' : 'Not quite.'} ${row.dataset.l} and ${row.dataset.r}: ${fair ? 'fair' : 'not fair'}.`;
    later(next, right ? 700 : 1500);
  };
  next();
  countdown(45, () => { track('judge', score); finish(g, score, Math.min(45, score * 3), score >= 10 ? 'Fairest judge ever!' : 'Good judging!'); });
}

// ---------- Bag Shuffle ----------
const bagArt = `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M20 30L26 20L32 30L38 20L44 30L50 20L56 30L62 20L68 30L74 20L80 30L84 88Q84 94 78 94L22 94Q16 94 16 88Z" fill="#C9A8FF" stroke="#2A1846" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="62" r="15" fill="#fff"/></svg>`;
function shuffle(g) {
  let score = 0, lives = 2, slots = [0, 1, 2], prize = 0, open = false, round = 0;
  const X = [17, 50, 83];
  frame(g, `<p class="game-say" id="say" aria-live="polite">Watch the toy!</p><div class="cups" id="cups">${[0, 1, 2].map((i) => `<button class="cup" data-act="cup" data-i="${i}" aria-label="Bag ${i + 1}"><span class="cup-toy"></span>${bagArt}</button>`).join('')}</div><p class="game-say">Tries left: <span id="lives">2</span></p>`);
  const cups = [...document.querySelectorAll('.cup')];
  const place = () => cups.forEach((c, i) => { c.style.left = X[slots[i]] + '%'; });
  const start = () => {
    open = false; round++;
    cups.forEach((c) => c.classList.remove('peek', 'miss'));
    prize = rnd(3);
    const own = mine(), toy = own.length && Math.random() < 0.5 ? own[rnd(own.length)] : TOY_LIST[rnd(TOY_LIST.length)];
    cups.forEach((c, i) => { c.querySelector('.cup-toy').innerHTML = i === prize ? toySVG(toy.id) : ''; });
    $('#say').textContent = 'Watch the toy!';
    cups[prize].classList.add('peek');
    const swaps = 3 + Math.min(6, round), d = Math.max(230, 520 - round * 40);
    cups.forEach((c) => { c.style.transitionDuration = d + 'ms'; });
    later(() => cups[prize].classList.remove('peek'), 1000);
    for (let k = 0; k < swaps; k++) later(() => {
      const a = rnd(3), b = (a + 1 + rnd(2)) % 3;
      [slots[a], slots[b]] = [slots[b], slots[a]]; place(); sfx.tap();
    }, 1400 + k * (d + 60));
    later(() => { open = true; $('#say').textContent = 'Which bag has the toy?'; }, 1400 + swaps * (d + 60));
  };
  actions.cup = (c) => {
    if (!open) return;
    open = false;
    cups[prize].classList.add('peek');
    if (+c.dataset.i === prize) { score++; sfx.win(); setScore(score); $('#say').textContent = 'You found it!'; later(start, 1100); }
    else {
      lives--; sfx.no(); c.classList.add('miss'); $('#lives').textContent = lives; $('#say').textContent = 'Oops! It was in the other bag.';
      later(() => { if (lives > 0) start(); else { track('shuffle', score); finish(g, score, Math.min(45, 5 + score * 5), score >= 6 ? 'Eagle-eyed!' : 'Nice watching!'); } }, 1300);
    }
  };
  place(); start();
}

// ---------- Quick Count ----------
function count(g) {
  let score = 0;
  frame(g, `<section class="card counter"><div class="count-box" id="count-box"></div><p class="game-say" id="say"></p><div class="count-opts" id="opts"></div></section>`);
  const next = () => {
    const kinds = mixUp(TOY_LIST).slice(0, score < 3 ? 2 : 3);
    const nums = kinds.map(() => 2 + rnd(score < 5 ? 4 : 6));
    const cells = mixUp(Array.from({ length: 24 }, (_, i) => i));
    let html = '', k = 0;
    kinds.forEach((t, i) => { for (let j = 0; j < nums[i]; j++) { const c = cells[k++]; html += `<span style="left:${(c % 6) * 16.6 + rnd(4)}%;top:${Math.floor(c / 6) * 25 + rnd(4)}%;transform:rotate(${rnd(30) - 15}deg)">${toySVG(t.id)}</span>`; } });
    $('#count-box').innerHTML = html;
    const ask = rnd(kinds.length), right = nums[ask];
    const opts = new Set([right]);
    while (opts.size < 3) { const v = right + rnd(5) - 2; if (v > 0) opts.add(v); }
    $('#say').innerHTML = `How many <b>${kinds[ask].name}</b> toys?`;
    $('#opts').innerHTML = [...opts].sort((a, b) => a - b).map((v) => `<button class="btn big" data-act="countPick" data-hit="${v === right ? 1 : 0}">${v}</button>`).join('');
  };
  actions.countPick = (b) => {
    if (b.dataset.hit === '1') { score++; sfx.pop(); setScore(score); next(); }
    else { sfx.no(); b.disabled = true; }
  };
  next();
  countdown(45, () => { track('count', score); finish(g, score, Math.min(45, score * 4), score >= 8 ? 'Counting champion!' : 'Good counting!'); });
}

// ---------- Glitter Blast ----------
function blast(g) {
  let score = 0, hits = 0, items = [], last = performance.now(), spawnAt = 0, run = true, n = 0;
  const bombs = ['sq112', 'sq113', 'sq114', 'sq116'];
  frame(g, `<div class="arena blast" id="arena" aria-label="Glitter bombs float up. Tap them to pop them."></div>`);
  const arena = $('#arena');
  actions.blastPop = (b, e) => {
    const it = items.find((x) => x.el === b);
    if (!it || it.dead) return;
    it.dead = true; b.remove();
    if (it.cloud) { score = Math.max(0, score - 2); sfx.no(); arena.classList.add('oops'); later(() => arena.classList.remove('oops'), 250); }
    else { score += it.gold ? 3 : 1; hits++; glitterBurst(e.clientX, e.clientY, it.gold ? 46 : 24, it.gold ? 0.8 : 0.55); sfx.pop(); sfx.twinkle(); }
    setScore(score);
  };
  const loop = (now) => {
    if (!run) return;
    const dt = Math.min(50, now - last); last = now;
    if (now > spawnAt) {
      const cloud = Math.random() < 0.15, gold = !cloud && Math.random() < 0.1, el = document.createElement('button');
      el.className = 'flyer' + (cloud ? ' cloud' : ''); el.dataset.act = 'blastPop';
      el.setAttribute('aria-label', cloud ? 'Rain cloud, do not tap' : gold ? 'Golden glitter bomb' : 'Glitter bomb');
      el.innerHTML = toySVG(cloud ? 'sl22' : gold ? 'sq115' : bombs[n++ % 4]);
      const it = { el, x: 10 + Math.random() * 80, y: 108, cloud, gold, v: 0.03 + Math.random() * 0.018 + hits * 0.0005, sway: Math.random() * 6 };
      el.style.left = it.x + '%'; arena.append(el); items.push(it);
      spawnAt = now + Math.max(330, 640 - hits * 6);
    }
    items = items.filter((it) => {
      if (it.dead) return false;
      it.y -= it.v * dt; it.el.style.top = it.y + '%'; it.el.style.left = it.x + Math.sin(now / 500 + it.sway) * 3 + '%';
      if (it.y < -18) { it.el.remove(); return false; }
      return true;
    });
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  timers.push(() => { run = false; });
  countdown(30, () => { track('blast', hits); finish(g, score, Math.min(45, Math.round(score * 1.4)), score >= 25 ? 'Glitter everywhere!' : 'Sparkly work!'); });
}

// ---------- Claw Machine ----------
const PTS = { c: 1, r: 2, e: 4, l: 8 };
function claw(g) {
  const SLOTS = 5, CATS_ALL = ['squishy', 'fidget', 'slime', 'putty', 'dough', 'springy', 'plushie'];
  let tries = 6, score = 0, grabs = 0, x = 10, dir = 1, moving = true, run = true, last = performance.now(), speed = 0.045;
  const slotX = (i) => 12 + i * (76 / (SLOTS - 1));
  const newToy = () => rollToy(CATS_ALL, [46, 32, 16, 6]);
  let toys = Array.from({ length: SLOTS }, newToy);
  frame(g, `<p class="game-say" id="say" aria-live="polite">Drops left: <span id="tries">6</span></p>
    <div class="claw-box" id="claw-box" data-act="clawDrop"><div class="claw" id="claw"><i></i><svg viewBox="0 0 60 44" aria-hidden="true"><path d="M30 0v10M30 10L10 22L14 42M30 10L50 22L46 42M30 10v14" fill="none" stroke="#2A1846" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="30" cy="10" r="6" fill="#C81E7A" stroke="#2A1846" stroke-width="3"/></svg><span class="claw-hold" id="hold"></span></div>
      <div class="claw-row" id="claw-row"></div></div>
    <div class="row center"><button class="btn primary big" data-act="clawDrop" id="drop-btn">Drop the claw!</button></div>`);
  const cl = $('#claw'), row = $('#claw-row');
  const drawRow = () => { row.innerHTML = toys.map((id, i) => id ? `<span class="claw-toy r-${TOYS[id].r}" style="left:${slotX(i)}%">${toySVG(id)}</span>` : '').join(''); };
  drawRow();
  const loop = (now) => {
    if (!run) return;
    const dt = Math.min(50, now - last); last = now;
    if (moving) { x += dir * speed * dt; if (x >= 92) { x = 92; dir = -1; } if (x <= 8) { x = 8; dir = 1; } cl.style.left = x + '%'; }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  timers.push(() => { run = false; });
  const end = () => { track('claw', grabs); finish(g, score, Math.min(50, 6 + score * 4), grabs >= 4 ? 'Claw master!' : grabs ? 'Nice grabbing!' : 'So close! Try again.'); };
  actions.clawDrop = () => {
    if (!moving || tries <= 0) return;
    moving = false; tries--; $('#tries').textContent = tries; sfx.whoosh();
    cl.classList.add('down');
    later(() => {
      let hit = -1;
      toys.forEach((id, i) => { if (id && Math.abs(slotX(i) - x) < 7.5) hit = i; });
      if (hit >= 0) {
        const id = toys[hit]; toys[hit] = null; drawRow();
        $('#hold').innerHTML = toySVG(id); grabs++; score += PTS[TOYS[id].r]; setScore(score); sfx.win();
        $('#say').innerHTML = `Got ${TOYS[id].name}! +${PTS[TOYS[id].r]} &middot; Drops left: <span id="tries">${tries}</span>`;
      } else { sfx.no(); $('#say').innerHTML = `Missed! Drops left: <span id="tries">${tries}</span>`; }
      cl.classList.remove('down');
      later(() => {
        $('#hold').innerHTML = '';
        toys = toys.map((id) => id || newToy()); drawRow();
        if (tries <= 0) return end();
        speed += 0.006; moving = true;
      }, 800);
    }, 650);
  };
}

// ---------- Squishy Stack ----------
function stack(g) {
  const STEP = 50, pool = TOY_LIST.filter((t) => t.cat === 'squishy' && ['blob', 'bun', 'bear', 'cat', 'goocube', 'marsh', 'loaf', 'gooball', 'dumpling'].includes(t.v)).concat(mine(), mine());
  let n = 0, lives = 2, x = 50, dir = 1, speed = 0.05, prevX = 50, run = true, busy = false, last = performance.now(), piece = null;
  frame(g, `<p class="game-say" id="say" aria-live="polite">Tries left: <span id="lives">2</span></p><div class="stack-box" id="stack-box" data-act="stackDrop"><div class="stack-inner" id="stack-inner"></div></div>
    <div class="row center"><button class="btn primary big" data-act="stackDrop">Drop!</button></div>`);
  const inner = $('#stack-inner');
  const make = (cls) => { const el = document.createElement('div'); el.className = 'stack-piece ' + cls; el.innerHTML = toySVG(pool[rnd(pool.length)].id); inner.append(el); return el; };
  const base = make('set'); base.style.left = '50%'; base.style.bottom = '0px';
  const next = () => { piece = make('moving'); piece.style.bottom = (n + 1) * STEP + 26 + 'px'; x = Math.random() < 0.5 ? 12 : 88; dir = x < 50 ? 1 : -1; busy = false; inner.style.transform = `translateY(${Math.max(0, n - 3) * STEP}px)`; };
  next();
  const loop = (now) => {
    if (!run) return;
    const dt = Math.min(50, now - last); last = now;
    if (!busy && piece) { x += dir * speed * dt; if (x >= 88) { x = 88; dir = -1; } if (x <= 12) { x = 12; dir = 1; } piece.style.left = x + '%'; }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  timers.push(() => { run = false; });
  const end = () => { track('stack', n); finish(g, n, Math.min(45, n * 3), n >= 10 ? 'Sky-high tower!' : 'Good stacking!'); };
  actions.stackDrop = () => {
    if (busy || !piece) return;
    busy = true;
    const el = piece;
    if (Math.abs(x - prevX) <= 13) {
      n++; prevX = x; el.classList.remove('moving'); el.classList.add('set'); el.style.bottom = n * STEP + 'px';
      sfx.squish(); setScore(n); speed += 0.004; later(next, 260);
    } else {
      lives--; sfx.no(); $('#lives').textContent = lives; el.classList.add('fall'); later(() => el.remove(), 600);
      later(() => { if (lives > 0) next(); else end(); }, 650);
    }
  };
}

// ---------- What Is Missing? ----------
function missing(g) {
  let score = 0, answer = null;
  frame(g, `<section class="card missing"><p class="game-say" id="say" aria-live="polite"></p><div class="miss-row" id="miss-row"></div><div class="shadow-opts miss-opts" id="opts"></div></section>`);
  const cell = (t) => `<span class="miss-toy">${toySVG(t.id)}</span>`;
  const round = () => {
    const n = 4 + Math.min(3, Math.floor(score / 2));
    const all = mixUp(TOY_LIST).slice(0, n + 2), set = all.slice(0, n), decoys = all.slice(n);
    answer = set[rnd(n)];
    $('#opts').innerHTML = '';
    $('#say').textContent = 'Remember these toys!';
    $('#miss-row').innerHTML = set.map(cell).join('');
    later(() => { $('#miss-row').innerHTML = set.map(() => '<span class="miss-toy hide">?</span>').join(''); $('#say').textContent = 'Shuffling...'; }, Math.max(1500, 2800 - score * 110));
    later(() => {
      $('#miss-row').innerHTML = mixUp(set.filter((t) => t !== answer)).map(cell).join('');
      $('#say').textContent = 'Which toy is missing?';
      $('#opts').innerHTML = mixUp([answer, ...decoys]).map((t) => `<button class="odd-cell" data-act="missPick" data-hit="${t === answer ? 1 : 0}" aria-label="${t.name}">${toySVG(t.id)}</button>`).join('');
    }, Math.max(1500, 2800 - score * 110) + 600);
  };
  actions.missPick = (b) => {
    if (b.dataset.hit === '1') { score++; sfx.pop(); setScore(score); round(); }
    else { sfx.no(); b.classList.add('wrong'); b.disabled = true; }
  };
  round();
  countdown(50, () => { track('missing', score); finish(g, score, Math.min(45, score * 5), score >= 6 ? 'Super memory!' : 'Good remembering!'); });
}

// ---------- Tap It! ----------
function tapit(g) {
  const cats = Object.keys(CATS), want = cats[rnd(cats.length)];
  let score = 0, hits = 0;
  frame(g, `<p class="game-say">Tap only the <b class="pill big">${CATS[want].name}</b></p><div class="tap-grid">${Array.from({ length: 9 }, (_, i) => `<button class="tap-cell" data-act="tapCell" data-i="${i}" aria-label="Empty spot"></button>`).join('')}</div>`);
  const cells = [...document.querySelectorAll('.tap-cell')];
  const clear = (c) => { c.innerHTML = ''; c.dataset.cat = ''; c.classList.remove('full'); c.setAttribute('aria-label', 'Empty spot'); };
  const pop = () => {
    const free = cells.filter((c) => !c.classList.contains('full'));
    if (!free.length) return;
    const c = free[rnd(free.length)], pool = Math.random() < 0.45 ? TOY_LIST.filter((t) => t.cat === want) : TOY_LIST.filter((t) => t.cat !== want), t = pool[rnd(pool.length)];
    c.innerHTML = toySVG(t.id); c.dataset.cat = t.cat; c.classList.add('full'); c.setAttribute('aria-label', `${t.name}, ${CATS[t.cat].one}`);
    const stamp = String(Math.random()); c.dataset.stamp = stamp;
    later(() => { if (c.dataset.stamp === stamp) clear(c); }, Math.max(900, 1500 - hits * 15));
  };
  actions.tapCell = (c) => {
    if (!c.classList.contains('full')) return;
    if (c.dataset.cat === want) { score++; hits++; sfx.pop(); c.classList.add('good'); }
    else { score = Math.max(0, score - 1); sfx.no(); c.classList.add('bad'); }
    setScore(score); clear(c); later(() => c.classList.remove('good', 'bad'), 220);
  };
  pop(); every(pop, 520);
  countdown(30, () => { track('tapit', hits); finish(g, score, Math.min(45, score * 2), score >= 18 ? 'Lightning fingers!' : 'Sharp tapping!'); });
}

// ---------- More or Less ----------
function hilo(g) {
  let score = 0, lives = 3, cur = TOY_LIST[rnd(TOY_LIST.length)], nxt = null, busy = false;
  const card = (t, hidden) => `<div class="hilo-card">${hidden ? '<div class="hilo-q">?</div>' : toySVG(t.id)}<b>${hidden ? 'Next toy' : t.name}</b><span class="pill ${hidden ? '' : 'r-' + t.r}">${hidden ? 'Worth ?' : `${RARITY[t.r].name}${t.big ? ' Jumbo' : ''}: worth ${t.value}`}</span></div>`;
  frame(g, `<section class="card hilo"><p class="game-say" id="say" aria-live="polite">Tries left: 3</p><div class="hilo-row" id="hilo-row"></div>
    <div class="row center"><button class="btn primary big" data-act="hiloPick" data-v="more">Worth more</button><button class="btn big" data-act="hiloPick" data-v="less">Worth less</button></div></section>`);
  const deal = () => {
    busy = false;
    const others = TOY_LIST.filter((t) => t.id !== cur.id && t.value !== cur.value);
    nxt = Math.random() < 0.88 ? others[rnd(others.length)] : TOY_LIST[rnd(TOY_LIST.length)];
    $('#hilo-row').innerHTML = card(cur) + '<span class="swap" aria-hidden="true">' + icon('trade') + '</span>' + card(nxt, true);
  };
  const end = () => { track('hilo', score); finish(g, score, Math.min(45, score * 3), score >= 10 ? 'Toy expert!' : 'Good guessing!'); };
  actions.hiloPick = (b) => {
    if (busy) return;
    busy = true;
    const right = nxt.value === cur.value || (b.dataset.v === 'more') === (nxt.value > cur.value);
    $('#hilo-row').innerHTML = card(cur) + '<span class="swap" aria-hidden="true">' + icon('trade') + '</span>' + card(nxt);
    if (right) { score++; sfx.pop(); setScore(score); $('#say').textContent = `Yes! ${nxt.value} is ${nxt.value === cur.value ? 'the same as' : nxt.value > cur.value ? 'more than' : 'less than'} ${cur.value}.`; }
    else { lives--; sfx.no(); $('#say').textContent = `Not this time. ${nxt.value} is ${nxt.value > cur.value ? 'more' : 'less'} than ${cur.value}. Tries left: ${lives}`; }
    later(() => { if (lives <= 0 || score >= 15) return end(); cur = nxt; deal(); }, right ? 1000 : 1700);
  };
  deal();
}

// ---------- Finish the Pattern ----------
function pattern(g) {
  let score = 0;
  frame(g, `<section class="card pattern"><p class="game-say" id="say">Which toy comes next?</p><div class="pat-row" id="pat-row"></div><div class="shadow-opts miss-opts" id="opts"></div></section>`);
  const next = () => {
    const kinds = score < 2 ? ['AB'] : score < 5 ? ['AB', 'AAB', 'ABB'] : ['AAB', 'ABB', 'ABC', 'AABB', 'ABCB'];
    const unit = kinds[rnd(kinds.length)], cats = mixUp(Object.keys(CATS)).slice(0, 3);
    const toys = cats.map((c) => { const p = TOY_LIST.filter((t) => t.cat === c); return p[rnd(p.length)]; });
    const map = { A: toys[0], B: toys[1], C: toys[2] };
    const len = unit.length * 2 + 1 + rnd(2), seq = Array.from({ length: len }, (_, i) => map[unit[i % unit.length]]);
    const answer = seq[len - 1];
    $('#pat-row').innerHTML = seq.slice(0, -1).map((t) => `<span class="miss-toy">${toySVG(t.id)}</span>`).join('') + '<span class="miss-toy hide">?</span>';
    $('#opts').innerHTML = mixUp(toys).map((t) => `<button class="odd-cell" data-act="patPick" data-hit="${t === answer ? 1 : 0}" aria-label="${t.name}">${toySVG(t.id)}</button>`).join('');
  };
  actions.patPick = (b) => {
    if (b.dataset.hit === '1') { score++; sfx.pop(); setScore(score); next(); }
    else { sfx.no(); b.classList.add('wrong'); b.disabled = true; }
  };
  next();
  countdown(45, () => { track('pattern', score); finish(g, score, Math.min(45, score * 4), score >= 8 ? 'Pattern pro!' : 'Good thinking!'); });
}

// Helpers for games you can play against the computer or a friend on the same screen.
const rival = (two) => (two ? { name: 'Player 2', avatar: P().buddy === 'sq08' ? 'sq06' : 'sq08' } : FRIENDS[rnd(FRIENDS.length)]);
const vsCoins = (two, won, tied) => (two ? 10 : won ? 28 : tied ? 14 : 8);

// ---------- Squishy Tac Toe ----------
function tactoe(g, two) {
  const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  const me = P().buddy, bot = rival(two), myName = P().name;
  let wins = 0, losses = 0, draws = 0, round = 0, cells = [], busy = false, turn = 'me';
  frame(g, `<p class="game-say" id="say" aria-live="polite"></p><div class="ttt" id="ttt"></div>`);
  const winner = (b) => { for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return [b[a], [a, c, d]]; return b.every(Boolean) ? ['draw', []] : null; };
  const draw = (line = []) => { $('#ttt').innerHTML = cells.map((v, i) => `<button class="ttt-cell${line.includes(i) ? ' win' : ''}${v ? ' p-' + v : ''}" data-act="tttPick" data-i="${i}" aria-label="${v === 'me' ? myName + "'s squishy" : v === 'bot' ? bot.name + "'s squishy" : 'Empty square ' + (i + 1)}" ${v ? 'disabled' : ''}>${v ? toySVG(v === 'me' ? me : bot.avatar) : ''}</button>`).join(''); };
  const say = () => { $('#say').textContent = turn === 'me' ? `${myName}, your turn!` : two ? `${bot.name}, your turn!` : `${bot.name} is thinking...`; };
  const start = () => { round++; cells = Array(9).fill(''); busy = false; turn = round % 2 ? 'me' : 'bot'; draw(); say(); if (turn === 'bot' && !two) { busy = true; later(botMove, 700); } };
  const over = (res, line) => {
    busy = true; draw(line);
    if (res === 'me') { wins++; setScore(wins); sfx.win(); $('#say').textContent = `Three in a row. ${myName} wins this round!`; }
    else if (res === 'bot') { losses++; two ? sfx.win() : sfx.no(); $('#say').textContent = `${bot.name} got three in a row.`; }
    else { draws++; $('#say').textContent = 'A tie! Nobody got three.'; }
    later(() => { if (round >= 3) { track('tactoe', wins); finish(g, wins, two ? 10 : 8 + wins * 12 + draws * 5, two ? (wins > losses ? `${myName} wins!` : losses > wins ? `${bot.name} wins!` : 'It is a tie!') : wins >= 2 ? 'Tac Toe champion!' : wins ? 'Nice playing!' : 'Good game!'); } else start(); }, 1500);
  };
  const place = (i, who) => { cells[i] = who; const w = winner(cells); if (w) { over(w[0], w[1]); return true; } return false; };
  function botMove() {
    const free = cells.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
    const find = (who) => free.find((i) => { const b = [...cells]; b[i] = who; const w = winner(b); return w && w[0] === who; });
    let m = find('bot');
    if (m === undefined && Math.random() < 0.75) m = find('me');
    if (m === undefined && !cells[4] && Math.random() < 0.6) m = 4;
    if (m === undefined) m = free[rnd(free.length)];
    sfx.tap();
    if (place(m, 'bot')) return;
    turn = 'me'; busy = false; draw(); say();
  }
  actions.tttPick = (b) => {
    const i = +b.dataset.i;
    if (busy || cells[i]) return;
    sfx.squish();
    if (place(i, turn)) return;
    turn = turn === 'me' ? 'bot' : 'me'; draw(); say();
    if (turn === 'bot' && !two) { busy = true; later(botMove, 650); }
  };
  start();
}

// ---------- Four in a Row ----------
function four(g, two) {
  const W = 7, H = 6, me = P().buddy, bot = rival(two), myName = P().name;
  let b = Array.from({ length: H }, () => Array(W).fill('')), turn = 'me', busy = false;
  frame(g, `<p class="game-say" id="say" aria-live="polite"></p><div class="four-cols" id="four-cols"></div><div class="four" id="four"></div>`);
  const lowest = (c, board = b) => { for (let r = H - 1; r >= 0; r--) if (!board[r][c]) return r; return -1; };
  const won = (board, who) => {
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      const cells = [0, 1, 2, 3].map((k) => [r + dr * k, c + dc * k]);
      if (cells.every(([y, x]) => y >= 0 && y < H && x >= 0 && x < W && board[y][x] === who)) return cells;
    }
    return null;
  };
  const draw = (line = []) => {
    const hit = (r, c) => line.some(([y, x]) => y === r && x === c);
    $('#four-cols').innerHTML = Array.from({ length: W }, (_, c) => `<button class="four-drop" data-act="fourDrop" data-c="${c}" aria-label="Drop in column ${c + 1}" ${lowest(c) < 0 ? 'disabled' : ''}>${icon('back')}</button>`).join('');
    $('#four').innerHTML = b.map((row, r) => row.map((v, c) => `<span class="four-cell${v ? ' p-' + v : ''}${hit(r, c) ? ' win' : ''}">${v ? toySVG(v === 'me' ? me : bot.avatar) : ''}</span>`).join('')).join('');
  };
  const say = () => { $('#say').textContent = turn === 'me' ? `${myName}, pick a column.` : two ? `${bot.name}, pick a column.` : `${bot.name} is thinking...`; };
  const end = (res, line) => {
    busy = true; draw(line || []);
    const iWon = res === 'me';
    if (res === 'draw') $('#say').textContent = 'The frame is full. It is a tie!'; else { $('#say').textContent = `${iWon ? myName : bot.name} lined up four!`; iWon || two ? sfx.win() : sfx.no(); }
    if (iWon) setScore(1);
    later(() => { if (iWon) track('four'); finish(g, iWon ? 1 : 0, vsCoins(two, iWon, res === 'draw'), res === 'draw' ? 'A tie game!' : `${iWon ? myName : bot.name} wins!`); }, 1700);
  };
  const drop = (c, who) => {
    const r = lowest(c); if (r < 0) return false;
    b[r][c] = who; sfx.squish();
    const line = won(b, who);
    if (line) { end(who, line); return true; }
    if (b[0].every(Boolean)) { end('draw'); return true; }
    return false;
  };
  const botMove = () => {
    const cols = Array.from({ length: W }, (_, c) => c).filter((c) => lowest(c) >= 0);
    const wins = (who) => cols.find((c) => { const t = b.map((r) => [...r]); t[lowest(c)][c] = who; return won(t, who); });
    let c = wins('bot');
    if (c === undefined && Math.random() < 0.8) c = wins('me');
    if (c === undefined) { const fav = cols.filter((x) => x >= 2 && x <= 4); c = fav.length && Math.random() < 0.6 ? fav[rnd(fav.length)] : cols[rnd(cols.length)]; }
    if (drop(c, 'bot')) return;
    turn = 'me'; busy = false; draw(); say();
  };
  actions.fourDrop = (el) => {
    if (busy) return;
    if (drop(+el.dataset.c, turn)) return;
    turn = turn === 'me' ? 'bot' : 'me'; draw(); say();
    if (turn === 'bot' && !two) { busy = true; later(botMove, 700); }
  };
  draw(); say();
}

// ---------- Tap Tug ----------
function tug(g, two) {
  const me = P().buddy, bot = rival(two), myName = P().name;
  let pos = 50, run = false, over = false;
  frame(g, `<div class="tug">
    <button class="tug-btn top" data-act="tugTap" data-who="bot" ${two ? '' : 'disabled'} aria-label="${bot.name} taps here"><span>${toySVG(bot.avatar)}</span><b>${two ? bot.name + ': tap here!' : bot.name}</b></button>
    <div class="tug-rope" aria-hidden="true"><i class="tug-line"></i><span class="tug-knot" id="knot">${toySVG('sp05')}</span></div>
    <p class="game-say" id="say" aria-live="polite">Get ready...</p>
    <button class="tug-btn" data-act="tugTap" data-who="me" aria-label="${myName} taps here"><span>${toySVG(me)}</span><b>${myName}: tap here!</b></button></div>`);
  const knot = $('#knot');
  const place = () => { knot.style.top = pos + '%'; };
  const end = (who) => {
    if (over) return; over = true; run = false;
    const iWon = who === 'me';
    $('#say').textContent = `${iWon ? myName : bot.name} wins the tug!`; iWon || two ? sfx.win() : sfx.no();
    if (iWon) { setScore(1); track('tug'); }
    later(() => finish(g, iWon ? 1 : 0, vsCoins(two, iWon, false), `${iWon ? myName : bot.name} wins!`), 1400);
  };
  const pull = (who) => { if (!run) return; pos += who === 'me' ? 2.4 : -2.4; place(); if (pos >= 88) end('me'); else if (pos <= 12) end('bot'); };
  actions.tugTap = (el) => { sfx.tap(); pull(el.dataset.who); };
  place();
  later(() => { run = true; $('#say').textContent = 'TAP! TAP! TAP!'; sfx.whoosh(); if (!two) every(() => { if (run && Math.random() < 0.8) pull('bot'); }, 175); }, 1400);
  later(() => { if (!over) end(pos >= 50 ? 'me' : 'bot'); }, 21400);
}

// ---------- Quick Squish ----------
function quick(g, two) {
  const me = P().buddy, bot = rival(two), myName = P().name, ROUNDS = 5;
  let round = 0, a = 0, b = 0, state = 'wait', timer = 0, botTimer = 0;
  frame(g, `<div class="tug quick">
    <button class="tug-btn top" data-act="quickTap" data-who="bot" ${two ? '' : 'disabled'} aria-label="${bot.name} taps here"><span>${toySVG(bot.avatar)}</span><b id="q-b">${bot.name}: 0</b></button>
    <div class="quick-sign" id="q-sign" aria-live="assertive">Wait...</div>
    <button class="tug-btn" data-act="quickTap" data-who="me" aria-label="${myName} taps here"><span>${toySVG(me)}</span><b id="q-a">${myName}: 0</b></button></div>`);
  const sign = $('#q-sign');
  const show = () => { $('#q-a').textContent = `${myName}: ${a}`; $('#q-b').textContent = `${bot.name}: ${b}`; setScore(a); };
  const next = () => {
    if (round >= ROUNDS) { track('quick', a); return finish(g, a, two ? 10 : 6 + a * 6, a > b ? `${myName} wins!` : b > a ? `${bot.name} wins!` : 'It is a tie!'); }
    round++; state = 'wait'; sign.className = 'quick-sign'; sign.textContent = `Round ${round}: wait...`;
    timer = later(() => { state = 'go'; sign.className = 'quick-sign go'; sign.textContent = 'SQUISH!'; sfx.pop(); if (!two) botTimer = later(() => point('bot', `${bot.name} was faster.`), 380 + Math.random() * 330); }, 1400 + Math.random() * 2600);
  };
  const point = (who, text) => {
    if (state === 'done') return;
    state = 'done'; clearTimeout(timer); clearTimeout(botTimer);
    if (who === 'me') { a++; sfx.win(); } else { b++; two ? sfx.win() : sfx.no(); }
    sign.className = 'quick-sign'; sign.textContent = text; show(); later(next, 1300);
  };
  actions.quickTap = (el) => {
    const who = el.dataset.who, name = who === 'me' ? myName : bot.name;
    if (state === 'wait') return point(who === 'me' ? 'bot' : 'me', `${name} tapped too early!`);
    if (state === 'go') point(who, `${name} was fastest!`);
  };
  show(); next();
}

// ---------- Shop Math ----------
function math(g) {
  let score = 0;
  frame(g, `<section class="card missing"><div class="math-art" id="math-art"></div><p class="game-say" id="say"></p><div class="count-opts" id="opts"></div></section>`);
  const toy = () => TOY_LIST[rnd(TOY_LIST.length)];
  const next = () => {
    const kind = rnd(score < 3 ? 2 : 3);
    let art = '', q = '', right = 0;
    if (kind === 0) { const x = toy(), y = toy(); right = x.value + y.value; art = toySVG(x.id) + toySVG(y.id); q = `<b>${x.name}</b> is worth ${x.value} coins and <b>${y.name}</b> is worth ${y.value}. How much together?`; }
    else if (kind === 1) { const cost = [40, 40, 50, 90, 120, 150][rnd(6)], have = cost + 10 * (1 + rnd(12)); right = have - cost; art = toySVG('sq01'); q = `You have ${have} coins. A mystery bag costs ${cost}. How many coins are left?`; }
    else { const x = toy(), n = 2 + rnd(3); right = x.value * n; art = Array.from({ length: n }, () => toySVG(x.id)).join(''); q = `You have ${n} of <b>${x.name}</b>. Each is worth ${x.value} coins. How much for all ${n}?`; }
    const opts = new Set([right]);
    while (opts.size < 3) { const v = right + (rnd(2) ? 1 : -1) * [5, 10, 15, 20][rnd(4)]; if (v > 0) opts.add(v); }
    $('#math-art').innerHTML = art; $('#say').innerHTML = q;
    $('#opts').innerHTML = [...opts].sort((m, n) => m - n).map((v) => `<button class="btn big" data-act="mathPick" data-hit="${v === right ? 1 : 0}">${v}</button>`).join('');
  };
  actions.mathPick = (el) => {
    if (el.dataset.hit === '1') { score++; sfx.coin(); setScore(score); next(); }
    else { sfx.no(); el.disabled = true; }
  };
  next();
  countdown(50, () => { track('math', score); finish(g, score, Math.min(45, score * 4), score >= 8 ? 'Math whiz!' : 'Good counting!'); });
}
