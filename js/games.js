// Four mini-games that pay coins.
import { TOYS, TOY_LIST, CATS } from './data.js';
import { toySVG, icon } from './art.js';
import { P, save, addCoins, track } from './state.js';
import { $, router, actions, sfx, coins, confetti } from './ui.js';

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
];
const view = () => $('#view');
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
    <div class="row center"><button class="btn primary big" data-act="play" data-id="${g.id}">Play again</button><button class="btn big" data-act="go" data-to="games">More games</button></div></section>`;
}
const setScore = (n) => { const el = $('#score'); if (el) el.textContent = n; };

actions.play = (el) => { sfx.tap(); ({ pop, match, mix, catch: catchGame, copy, sort, stairs, odd, shadow, judge, shuffle, count })[el.dataset.id](GAMES.find((g) => g.id === el.dataset.id)); };

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
    const toy = TOY_LIST[rnd(TOY_LIST.length)];
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
