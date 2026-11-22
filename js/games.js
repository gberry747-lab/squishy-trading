// Four mini-games that pay coins.
import { TOYS, TOY_LIST, CATS, RARITY, FRIENDS } from './data.js';
import { toySVG, icon } from './art.js';
import { P, save, addCoins, track, rollToy } from './state.js';
import { $, router, actions, sfx, coins, confetti, glitterBurst, modal, closeModal } from './ui.js';
import { lang } from './i18n.js';

const GAMES = [
  { id: 'pop', name: 'Pop Party', art: 'fi01', how: 'Pop the bubbles that puff up. Gold ones are worth 3!', unit: 'pops', sec: 'fidget' },
  { id: 'match', name: 'Memory Match', art: 'sq13', how: 'Flip two cards. Find all the matching toys.', unit: 'points', sec: 'focus' },
  { id: 'mix', name: 'Slime Lab', art: 'sl12', how: 'Pick the two colors that mix into the slime on the card.', unit: 'perfect mixes' },
  { id: 'catch', name: 'Squishy Catch', art: 'do03', how: 'Slide the tub to catch falling toys. Dodge the mud!', unit: 'catches' },
  { id: 'copy', name: 'Copy Cat', art: 'fi04', how: 'Watch the bubbles light up, then tap them in the same order.', unit: 'patterns', sec: 'focus' },
  { id: 'sort', name: 'Toy Sorter', art: 'sq36', how: 'Which shelf does the toy belong on? Sort as many as you can.', unit: 'toys sorted' },
  { id: 'stairs', name: 'Springy Stairs', art: 'sp07', how: 'Tap when the dot is in the green to walk the springy down the stairs.', unit: 'steps' },
  { id: 'odd', name: 'Odd One Out', art: 'sq32', how: 'One toy is different from the rest. Find it fast!', unit: 'found' },
  { id: 'shadow', name: 'Shadow Match', art: 'sq50', how: 'Whose shadow is it? Pick the toy that matches.', unit: 'shadows' },
  { id: 'judge', name: 'Fair or Not?', art: 'sq23', how: 'Add up what each side is worth. Is the trade fair?', unit: 'right calls', sec: 'math' },
  { id: 'shuffle', name: 'Bag Shuffle', art: 'sq12', how: 'Watch the bag with the toy as they swap around. Where did it go?', unit: 'finds' },
  { id: 'count', name: 'Quick Count', art: 'sq46', how: 'Count the toys before the time runs out.', unit: 'right counts', sec: 'math' },
  { id: 'blast', name: 'Glitter Blast', art: 'sq112', how: 'Glitter bombs float up. Pop them before they get away, but leave the rain clouds!', unit: 'points' },
  { id: 'claw', name: 'Claw Machine', art: 'pl23', how: 'Line up the claw and drop it. Rarer toys score more.', unit: 'points' },
  { id: 'stack', name: 'Squishy Stack', art: 'sq97', how: 'Drop each squishy on top of the last one. How tall can you build?', unit: 'stacked' },
  { id: 'missing', name: 'What Is Missing?', art: 'sq38', how: 'Remember the toys. One sneaks away. Which one?', unit: 'spotted', sec: 'focus' },
  { id: 'tapit', name: 'Tap It!', art: 'fi02', how: 'Toys pop up. Tap only the kind the sign asks for.', unit: 'points' },
  { id: 'hilo', name: 'More or Less', art: 'sq137', how: 'Is the next toy worth more coins or less? Learn what makes a toy rare.', unit: 'right guesses', sec: 'math' },
  { id: 'pattern', name: 'Finish the Pattern', art: 'sq138', how: 'Look at the row of toys. Which one comes next?', unit: 'patterns', sec: 'math' },
  { id: 'tactoe', name: 'Squishy Tac Toe', art: 'pl32', how: 'Get three in a row. Play the computer or a friend sitting with you. Best of three rounds.', unit: 'wins', vs: true },
  { id: 'four', name: 'Four in a Row', art: 'sq145', how: 'Drop squishies into the frame. First to line up four wins. Play the computer or a friend.', unit: 'wins', vs: true },
  { id: 'tug', name: 'Tap Tug', art: 'sp05', how: 'Tap as fast as you can to pull the squishy to your side. Play the computer or a friend.', unit: 'wins', vs: true },
  { id: 'quick', name: 'Quick Squish', art: 'sq58', how: 'Wait for SQUISH, then tap first. Tap too early and you lose the round. Computer or a friend.', unit: 'rounds won', vs: true },
  { id: 'math', name: 'Shop Math', art: 'sq149', how: 'Add up toys and count your change. Pick the right number of coins.', unit: 'right answers', sec: 'math' },
  { id: 'spell', name: 'Spell It', art: 'sq04', how: 'Look at the picture and tap the letters to spell the word.', unit: 'words', sec: 'read' },
  { id: 'rhyme', name: 'Rhyme Time', art: 'sq10', how: 'Which word rhymes? Cat and hat, frog and log...', unit: 'rhymes', sec: 'read' },
  { id: 'readfind', name: 'Read and Find', art: 'sq38', how: 'Read the clue, then tap the toy it is talking about.', unit: 'clues', sec: 'read' },
  { id: 'endings', name: 'Finish the Sentence', art: 'pl19', how: 'Pick the word that makes the sentence make sense.', unit: 'sentences', sec: 'read' },
  { id: 'times', name: 'Times Tables', art: 'sq145', how: 'Groups of squishies! Work out the multiplication.', unit: 'right answers', sec: 'math' },
  { id: 'skip', name: 'Skip Count', art: 'sp07', how: 'Count by 2s, 5s, 10s and more. Find the missing number.', unit: 'right answers', sec: 'math' },
  { id: 'clock', name: 'What Time Is It?', art: 'sq51', how: 'Read the clock and pick the right time.', unit: 'right answers', sec: 'math' },
  { id: 'bonds', name: 'Make the Number', art: 'sq61', how: 'What is missing? Fill in the sum to make 10, 20 or 100.', unit: 'right answers', sec: 'math' },
  { id: 'letters', name: 'Letter Detective', art: 'fi13', how: 'Some letters look alike. Find every one that matches.', unit: 'rounds', sec: 'read' },
  { id: 'firstsound', name: 'First Sound', art: 'sq46', how: 'Say the word. Which letter does it start with?', unit: 'right answers', sec: 'read' },
  { id: 'chunks', name: 'Word Chunks', art: 'sq121', how: 'Big words are made of small parts. Put the parts in order.', unit: 'words', sec: 'read' },
  { id: 'hearfind', name: 'Hear and Find', art: 'pl19', how: 'Listen to the word, then find it. Some of them look very alike!', unit: 'right answers', sec: 'read' },
  { id: 'bigmatch', name: 'Mega Memory Match', art: 'sq158', how: 'Sixteen cards! Flip two at a time and find all eight pairs.', unit: 'points', sec: 'focus' },
  { id: 'wordmatch', name: 'Word and Toy Match', art: 'sq163', how: 'Flip two cards. Match each word to its toy.', unit: 'points', sec: 'focus' },
  { id: 'where', name: 'Where Did It Hide?', art: 'sq155', how: 'Look at the toys. The boxes close. Which box is the toy hiding in?', unit: 'found', sec: 'focus' },
  { id: 'changed', name: 'What Changed?', art: 'sq193', how: 'Look closely at the toys. One of them swaps for a new toy. Which one?', unit: 'spotted', sec: 'focus' },
  { id: 'stopgo', name: 'Stop and Go', art: 'sq10', how: 'Tap when the sign says GO. Keep your hands still when it says STOP.', unit: 'points', sec: 'focus' },
  { id: 'steps', name: 'Follow the Steps', art: 'sq13', how: 'Read the steps, remember them, then tap the toys in that order.', unit: 'rounds', sec: 'focus' },
  { id: 'breathe', name: 'Breathe with Mochi', art: 'sq01', how: 'Breathe in as Mochi grows. Breathe out as Mochi shrinks. Slow and soft.', unit: 'breaths', sec: 'calm' },
  { id: 'stars', name: 'Starry Sky', art: 'sq50', how: 'Tap the night sky to hang stars, one at a time. No score and no hurry.', unit: 'stars', sec: 'calm' },
  { id: 'tuckin', name: 'Tuck-In Time', art: 'pl01', how: 'Your toys are sleepy. Tuck each one into bed and say good night.', unit: 'toys asleep', sec: 'calm' },
  { id: 'opposites', name: 'Opposites', art: 'sq51', how: 'Hot and cold, big and small. Pick the word that means the opposite.', unit: 'opposites', sec: 'read' },
  { id: 'build', name: 'Build the Sentence', art: 'sq131', how: 'The words are mixed up. Tap them in the right order to make a sentence.', unit: 'sentences', sec: 'read' },
  { id: 'fraction', name: 'Fraction Pizza', art: 'sq44', how: 'How much of the pizza is left? Pick the right fraction.', unit: 'right answers', sec: 'math' },
  { id: 'cents', name: 'Count the Coins', art: 'sq137', how: 'Add up quarters, dimes, nickels and pennies.', unit: 'right answers', sec: 'math' },
  { id: 'addsub', name: 'Add and Take Away', art: 'sq146', how: 'Adding and subtracting, from easy to tricky.', unit: 'right answers', sec: 'math' },
  { id: 'bigger', name: 'Bigger or Smaller', art: 'sq35', how: 'Which number is bigger? Pick the right sign.', unit: 'right answers', sec: 'math' },
  { id: 'wrapgame', name: 'Bubble Wrap', art: 'fi54', how: 'Pop every bubble on the sheet. How fast can you clear it?', unit: 'points', sec: 'fidget' },
  { id: 'spin', name: 'Spinner Spin', art: 'fi06', how: 'Tap fast to get the spinner whirling. Count the spins!', unit: 'spins', sec: 'fidget' },
  { id: 'box', name: 'Fidget Box', art: 'fi09', how: 'No score, no timer. Just pop, click, slide, spin and squish for as long as you like.', unit: 'fidgets', sec: 'fidget' },
];
const view = () => $('#view');
// The player's own handmade squishies join in several games.
const mine = () => Object.keys(P().inv).filter((id) => TOYS[id] && TOYS[id].custom).map((id) => TOYS[id]);
const best = (id) => P().stats['best_' + id] || 0;

const SECTIONS = [['read', 'Reading games', 'Spelling, rhymes and reading for meaning.'], ['math', 'Math and thinking games', 'Adding, times tables, clocks, patterns and fair trades.'], ['focus', 'Memory and focus games', 'Remembering, listening and stopping to think.'], ['fidget', 'Fidget games', 'Pop, spin and click. Good for calm, busy fingers.'], ['calm', 'Calm and bedtime', 'Slow, quiet games for winding down.'], ['vs', 'Play together', 'Play the computer, or a friend on this screen.'], ['fun', 'Fun games', 'Quick games to win coins.']];
const secOf = (g) => g.sec || (g.vs ? 'vs' : 'fun');
export const GAME_LIST = GAMES;
export function gamesScreen() {
  const card = (g) => `<article class="card game-card"><div class="game-art squish" data-squish data-toy="${g.art}">${toySVG(g.art)}</div>
      <div><h3>${g.name}</h3><p class="muted">${g.how}</p>${best(g.id) ? `<p class="pill">Best: ${best(g.id)} ${g.unit}</p>` : ''}</div>
      <button class="btn primary" data-act="play" data-id="${g.id}">Play</button></article>`;
  return `<h1>Mini-games</h1><p class="muted">Every game pays coins. Play as many times as you like.</p>
    <div class="chips" role="group" aria-label="Jump to a kind of game">${SECTIONS.map(([k, t]) => `<button class="chip" data-act="gameSec" data-v="${k}">${t.replace(' games', '')}</button>`).join('')}</div>
    ${SECTIONS.map(([k, t, sub]) => `<section id="sec-${k}"><h2>${t}</h2><p class="muted">${sub}</p><div class="game-list">${GAMES.filter((g) => secOf(g) === k).map(card).join('')}</div></section>`).join('')}`;
}
actions.gameSec = (el) => { const t = $('#sec-' + el.dataset.v); if (t) t.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); };

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
  p.stats['plays_' + g.id] = (p.stats['plays_' + g.id] || 0) + 1;
  addCoins(won); track('game'); save();
  sfx.win(); if (won >= 20) confetti();
  view().innerHTML = `<section class="card result"><div class="game-art squish" data-squish data-toy="${g.art}">${toySVG(g.art)}</div><h1>${line}</h1>
    <p class="big-num">${score} ${g.unit}${isBest && score ? ' <span class="pill">New best!</span>' : ''}</p><p>You win ${coins(won)}</p>
    <div class="row center"><button class="btn primary big" data-act="play" data-id="${g.id}" ${g.vs ? `data-mode="${lastMode[g.id] || '1'}"` : ''}>Play again</button><button class="btn big" data-act="go" data-to="games">More games</button></div></section>`;
}
const setScore = (n) => { const el = $('#score'); if (el) el.textContent = n; };

const START = () => ({ pop, match, mix, catch: catchGame, copy, sort, stairs, odd, shadow, judge, shuffle, count, blast, claw, stack, missing, tapit, hilo, pattern, tactoe, four, tug, quick, math, spell, rhyme, readfind, endings, times, skip, clock, bonds, opposites, build, fraction, cents, addsub, bigger, wrapgame, spin, box, bigmatch, wordmatch, where, changed, letters, firstsound, chunks, hearfind, stopgo, steps, breathe, stars, tuckin });
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
function match(g, N = 6) {
  const pool = [...mine().sort(() => Math.random() - 0.5).slice(0, 2), ...[...TOY_LIST].sort(() => Math.random() - 0.5)].slice(0, N).map((t) => t.id);
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
      if (found === N) { track('match'); const pts = Math.max(20, N * 20 - moves * 5); later(() => finish(g, pts, Math.max(12, N * 7 + 2 - moves * 2), moves <= N + 3 ? 'Super memory!' : 'All matched!'), 600); }
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
    fair = $('#judge-row').dataset.l === $('#judge-row').dataset.r; // the real totals decide, not the plan
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
const twoCoins = () => { const d = P().daily; d.vs = (d.vs || 0) + 1; return d.vs <= 6 ? 10 : 0; };
const vsCoins = (two, won, tied) => (two ? twoCoins() : won ? 28 : tied ? 14 : 8);

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
    later(() => { if (round >= 3) { track('tactoe', wins); finish(g, wins, two ? twoCoins() : 8 + wins * 12 + draws * 5, two ? (wins > losses ? `${myName} wins!` : losses > wins ? `${bot.name} wins!` : 'It is a tie!') : wins >= 2 ? 'Tac Toe champion!' : wins ? 'Nice playing!' : 'Good game!'); } else start(); }, 1500);
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
    later(() => finish(g, iWon ? 1 : 0, two ? twoCoins() : iWon ? 14 : 5, `${iWon ? myName : bot.name} wins!`), 1400);
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
    if (round >= ROUNDS) { track('quick', a); return finish(g, a, two ? twoCoins() : 6 + a * 6, a > b ? `${myName} wins!` : b > a ? `${bot.name} wins!` : 'It is a tie!'); }
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

// ================= Learning games: reading =================
// Reading games teach the language the game is set to, so each has its own Spanish word list.
const ES = () => lang() === 'es';
const L = (en, es) => (ES() ? es : en);
const WORDS_ES = [['gato', 'sq04'], ['oso', 'sq06'], ['sol', 'sq51'], ['rana', 'sq10'], ['luna', 'sq50'], ['pato', 'sq118'], ['nube', 'sq11'], ['taco', 'sq79'], ['dona', 'sq16'], ['abeja', 'sq46'], ['cerdo', 'sq49'], ['leche', 'sq123'], ['pizza', 'sq44'], ['dulce', 'sq136'], ['conejo', 'sq08'], ['paleta', 'sq133'], ['cactus', 'sq42'],
  ['ballena', 'sq35'], ['manzana', 'sq139'], ['tortuga', 'sq48'], ['galleta', 'sq82'], ['estrella', 'sq13'], ['fantasma', 'sq38'], ['calabaza', 'sq54'], ['mariposa', 'sq121'], ['unicornio', 'sq23'], ['pepinillo', 'sq75'], ['capibara', 'sq117']];
const RHYMES_ES = [['gato', 'pato'], ['luna', 'cuna'], ['sol', 'caracol'], ['rana', 'manzana'], ['casa', 'taza'], ['flor', 'amor'], ['mesa', 'fresa'], ['cama', 'rama'], ['queso', 'beso'], ['estrella', 'botella'], ['nube', 'sube'], ['dedo', 'miedo'], ['mano', 'hermano'], ['silla', 'ardilla'], ['globo', 'lobo'], ['vaca', 'hamaca'], ['camino', 'pepino'], ['ventana', 'campana'], ['juego', 'fuego'], ['oso', 'hermoso'], ['pelota', 'gota'], ['brillo', 'grillo']];
const SENT_ES = [['El squishy es muy ___.', 'suave', ['ruidoso', 'alto']], ['Pongo mis juguetes en la ___.', 'repisa', ['nube', 'cuchara']], ['El slime se siente frío y ___.', 'pegajoso', ['enojado', 'dormido']], ['Hicimos un ___ justo en el recreo.', 'intercambio', ['pan', 'trueno']], ['El resorte bajó por las ___.', 'escaleras', ['nubes', 'sopas']], ['Le dio a su amiga un gran ___.', 'abrazo', ['zapato', 'árbol']], ['Conté mis monedas antes de ir a la ___.', 'tienda', ['luna', 'bañera']], ['La brillantina hizo ___ el cuarto.', 'brillar', ['susurrar', 'galopar']], ['Una empanada es algo que puedes ___.', 'comer', ['vestir', 'montar']], ['El peluche tenía sueño y se fue a ___.', 'dormir', ['correr', 'cocinar']], ['Empezó a llover, así que entramos a la ___.', 'casa', ['piscina', 'playa']], ['Por favor ___ antes de tomar mi juguete.', 'pregunta', ['corre', 'salta']], ['Si un intercambio no es justo, puedes decir ___.', 'no, gracias', ['hurra', 'buenas noches']], ['Al capibara le encanta sentarse en agua ___.', 'tibia', ['cuadrada', 'ruidosa']], ['Estaba tan feliz que empecé a ___.', 'sonreír', ['llorar', 'estornudar']]];
const OPP_ES = [['caliente', 'frío'], ['grande', 'pequeño'], ['arriba', 'abajo'], ['feliz', 'triste'], ['rápido', 'lento'], ['día', 'noche'], ['abierto', 'cerrado'], ['mojado', 'seco'], ['suave', 'duro'], ['lleno', 'vacío'], ['ruidoso', 'silencioso'], ['temprano', 'tarde'], ['ligero', 'pesado'], ['limpio', 'sucio'], ['cerca', 'lejos'], ['primero', 'último'], ['dar', 'quitar'], ['empujar', 'jalar'], ['alto', 'bajo'], ['dentro', 'fuera'], ['recordar', 'olvidar'], ['justo', 'injusto']];
const SENTENCES_ES = ['El gato es muy suave.', 'Me gusta intercambiar mis juguetes.', 'Mi slime es frío y pegajoso.', 'Leemos un cuento antes de dormir.', 'La rana saltó al estanque.', 'Hoy dibujé un squishy rosa.', 'Un trato justo hace amigos felices.', 'El conejo se escondió bajo mi cama.', 'Por favor comparte tus juguetes conmigo.', 'Conté diez monedas doradas y brillantes.', 'El fantasmita era muy tímido.', 'Ella reventó todas las burbujas rápido.'];
const speak = (text) => { try { if ('speechSynthesis' in window) { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 0.85; u.lang = lang() === 'es' ? 'es-US' : 'en-US'; speechSynthesis.speak(u); } } catch { /* no voice on this device */ } };
const WORDS = [['cat', 'sq04'], ['pig', 'sq49'], ['bee', 'sq46'], ['sun', 'sq51'], ['bear', 'sq06'], ['frog', 'sq10'], ['star', 'sq13'], ['duck', 'sq118'], ['moon', 'sq50'], ['milk', 'sq123'], ['cloud', 'sq11'], ['heart', 'sq15'], ['donut', 'sq16'], ['whale', 'sq35'], ['ghost', 'sq38'], ['pizza', 'sq44'], ['apple', 'sq139'], ['candy', 'sq136'], ['bunny', 'sq08'], ['taco', 'sq79'],
  ['turtle', 'sq48'], ['pickle', 'sq75'], ['cookie', 'sq82'], ['banana', 'sq84'], ['cactus', 'sq42'], ['burger', 'sq78'], ['penguin', 'sq119'], ['unicorn', 'sq23'], ['rainbow', 'sq138'], ['pumpkin', 'sq54'], ['snowman', 'sq55'], ['dumpling', 'sq20'], ['popsicle', 'sq133'], ['capybara', 'sq117'], ['butterfly', 'sq121']];

// ---------- Spell It ----------
function spell(g) {
  let score = 0, word = '', got = 0, last = '';
  frame(g, `<section class="card missing"><div class="spell-toy squish" data-squish id="spell-toy"></div><div class="spell-word" id="spell-word" aria-live="polite" translate="no"></div><p class="game-say" id="say">Tap the letters in order.</p><div class="tiles" id="tiles" translate="no"></div>
    <button class="btn sm" data-act="spellHear">${icon('sound')} Say the word</button></section>`);
  const drawWord = () => { $('#spell-word').innerHTML = word.split('').map((ch, i) => `<span class="${i < got ? 'in' : ''}">${i < got ? ch : ''}</span>`).join(''); };
  const next = () => {
    const pool = (ES() ? WORDS_ES : WORDS).filter(([w]) => w !== last && (score < 4 ? w.length <= 4 : score < 9 ? w.length <= 6 : true));
    const [w, id] = pool[rnd(pool.length)]; word = last = w; got = 0;
    $('#spell-toy').innerHTML = toySVG(id); $('#spell-toy').dataset.toy = id;
    const extra = mixUp(L('abcdefghiklmnoprstuw', 'abcdefghijlmnoprstuvz').split('').filter((c) => !w.includes(c))).slice(0, score < 4 ? 1 : 3);
    $('#tiles').innerHTML = mixUp([...w.split(''), ...extra]).map((ch) => `<button class="tile" data-act="spellTile" data-ch="${ch}">${ch}</button>`).join('');
    drawWord(); $('#say').textContent = 'Tap the letters in order.';
  };
  actions.spellHear = () => speak(word);
  actions.spellTile = (b) => {
    if (b.dataset.ch !== word[got]) { sfx.no(); b.classList.add('bad'); later(() => b.classList.remove('bad'), 300); $('#say').textContent = got ? L(`Not that one. What comes after "${word.slice(0, got)}"?`, `Esa no. \u00bfQu\u00e9 sigue despu\u00e9s de "${word.slice(0, got)}"?`) : 'Not that one. What sound does it start with?'; return; }
    got++; b.disabled = true; b.classList.add('used'); sfx.pop(); drawWord();
    if (got === word.length) { score++; setScore(score); sfx.win(); $('#say').textContent = L(`Yes! ${word.toUpperCase()}!`, `\u00a1S\u00ed! \u00a1${word.toUpperCase()}!`); speak(word); later(next, 1100); }
  };
  next();
  countdown(75, () => { track('spell', score); finish(g, score, Math.min(50, score * 5), score >= 8 ? 'Super speller!' : 'Great spelling!'); });
}

// ---------- Rhyme Time ----------
const RHYMES = [['cat', 'hat'], ['bear', 'chair'], ['frog', 'log'], ['star', 'car'], ['duck', 'truck'], ['pig', 'wig'], ['bee', 'tree'], ['moon', 'spoon'], ['sun', 'bun'], ['cake', 'snake'], ['slime', 'time'], ['dough', 'snow'], ['spring', 'ring'], ['ball', 'wall'], ['goo', 'shoe'], ['mouse', 'house'], ['fox', 'box'], ['sheep', 'sleep'], ['kite', 'night'], ['boat', 'coat'], ['whale', 'snail'], ['ghost', 'toast'], ['heart', 'cart'], ['trade', 'shade'], ['squish', 'wish'], ['glitter', 'litter'], ['bright', 'light'], ['pickle', 'tickle']];
function rhyme(g) {
  let score = 0, last = -1;
  frame(g, `<section class="card missing"><p class="game-say">Which word rhymes with</p><div class="big-word" id="big-word" translate="no"></div><div class="word-opts" id="opts" translate="no"></div><p class="game-say" id="say" aria-live="polite"></p></section>`);
  const RH = ES() ? RHYMES_ES : RHYMES;
  const next = () => {
    let i = rnd(RH.length); if (i === last) i = (i + 1) % RH.length; last = i;
    const flip = rnd(2), ask = RH[i][flip], right = RH[i][1 - flip];
    const wrong = mixUp(RH.filter((_, k) => k !== i).map((p) => p[rnd(2)])).filter((w) => w.slice(-2) !== right.slice(-2)).slice(0, 2);
    $('#big-word').textContent = ask; $('#say').textContent = '';
    $('#opts').innerHTML = mixUp([right, ...wrong]).map((w) => `<button class="btn big word" data-act="rhymePick" data-hit="${w === right ? 1 : 0}">${w}</button>`).join('');
  };
  actions.rhymePick = (b) => {
    if (b.dataset.hit === '1') { score++; sfx.pop(); setScore(score); $('#say').textContent = L(`${$('#big-word').textContent} and ${b.textContent} rhyme!`, `\u00a1${$('#big-word').textContent} y ${b.textContent} riman!`); document.querySelectorAll('.word').forEach((x) => (x.disabled = true)); later(next, 800); }
    else { sfx.no(); b.disabled = true; $('#say').textContent = 'Say them out loud. Do the endings sound the same?'; }
  };
  next();
  countdown(60, () => { track('rhyme', score); finish(g, score, Math.min(45, score * 3), score >= 12 ? 'Rhyme star!' : 'Nice rhyming!'); });
}

// ---------- Read and Find ----------
const CLUES = [['sq10', 'It is green and it says ribbit.'], ['sq35', 'It lives in the ocean and it is very big.'], ['sq46', 'It buzzes around flowers and makes honey.'], ['sq51', 'It shines in the sky during the day.'], ['sq50', 'You can see it in the sky at night.'], ['sq44', 'It is a slice of food with cheese on top.'], ['sq118', 'It is yellow, it swims, and it says quack.'], ['sq119', 'It is a bird that cannot fly and loves the snow.'], ['sq48', 'It carries its home on its back.'], ['sq139', 'It is a red fruit that grows on a tree.'], ['sq84', 'It is a long yellow fruit that monkeys love.'], ['sq38', 'It is white and it says boo!'], ['sq55', 'It is made of snow and wears a hat.'], ['sq16', 'It is a round treat with a hole in the middle.'], ['sq13', 'It twinkles high up in the night sky.'], ['sq15', 'It is the shape that means love.'], ['sq138', 'It has many colors and comes out after the rain.'], ['sq121', 'It has pretty wings and used to be a caterpillar.'], ['sq42', 'It is a prickly plant that grows in the desert.'], ['pl24', 'It is a fish with a tall fin and sharp teeth.'], ['pl25', 'It has spots and a very long neck.'], ['pl16', 'It has a big furry mane and a loud roar.'], ['sq117', 'It is the biggest rodent in the world and it loves water.'], ['sq49', 'It is pink, it has a snout, and it says oink.'], ['sq78', 'It is a sandwich with a bun on the top and the bottom.'], ['sq133', 'It is a frozen treat on a stick.'], ['pl19', 'It is a bird that stays awake at night and says hoo.'], ['pl21', 'It is gray with big ears and a long trunk.']];
function readfind(g) {
  let score = 0, last = '';
  frame(g, `<section class="card missing"><p class="read-clue" id="clue"></p><button class="btn sm" data-act="clueHear">${icon('sound')} Help me read it</button><div class="shadow-opts" id="opts"></div><p class="game-say" id="say" aria-live="polite"></p></section>`);
  const next = () => {
    const set = mixUp(CLUES.filter(([id]) => id !== last)).slice(0, 4), [id, clue] = set[0]; last = id;
    $('#clue').textContent = clue; $('#say').textContent = '';
    $('#opts').innerHTML = mixUp(set).map(([tid]) => `<button class="odd-cell" data-act="cluePick" data-hit="${tid === id ? 1 : 0}" aria-label="${TOYS[tid].name}">${toySVG(tid)}</button>`).join('');
  };
  actions.clueHear = () => speak($('#clue').textContent);
  actions.cluePick = (b) => {
    if (b.dataset.hit === '1') { score++; sfx.pop(); setScore(score); next(); }
    else { sfx.no(); b.classList.add('wrong'); b.disabled = true; $('#say').textContent = 'Read the clue one more time.'; }
  };
  next();
  countdown(75, () => { track('readfind', score); finish(g, score, Math.min(45, score * 4), score >= 9 ? 'Reading detective!' : 'Good reading!'); });
}

// ---------- Finish the Sentence ----------
const SENT = [['The squishy is very ___.', 'soft', ['loud', 'tall']], ['I put my toys back on the ___.', 'shelf', ['cloud', 'spoon']], ['The slime feels cold and ___.', 'gooey', ['angry', 'sleepy']], ['We made a fair ___ at recess.', 'trade', ['bread', 'storm']], ['The springy went down the ___.', 'stairs', ['clouds', 'soup']], ['She gave her friend a big ___.', 'hug', ['rock', 'door']], ['The popper goes pop, pop, ___!', 'pop', ['moo', 'tick']], ['I counted my coins before I went to the ___.', 'shop', ['moon', 'bath']], ['The glitter made the room ___.', 'sparkle', ['whisper', 'gallop']], ['A dumpling is something you can ___.', 'eat', ['wear', 'ride']], ['The plushie was sleepy, so it went to ___.', 'bed', ['school', 'work']], ['It started to rain, so we went ___.', 'inside', ['swimming', 'upside']], ['Please ___ before you borrow my toy.', 'ask', ['run', 'jump']], ['The play dough was dry, so it felt ___.', 'hard', ['wet', 'quiet']], ['When a trade is not fair, you can say ___.', 'no thanks', ['hooray', 'goodnight']], ['The capybara loves to sit in warm ___.', 'water', ['shoes', 'boxes']], ['I was so happy that I began to ___.', 'smile', ['frown', 'sneeze']], ['Two toys for one rare toy can be a ___ trade.', 'fair', ['fuzzy', 'frozen']]];
function endings(g) {
  const SN = ES() ? SENT_ES : SENT;
  let score = 0, order = mixUp(SN), n = 0;
  frame(g, `<section class="card missing"><p class="read-clue" id="clue" translate="no"></p><div class="word-opts" id="opts" translate="no"></div><p class="game-say" id="say" aria-live="polite"></p></section>`);
  const next = () => {
    if (n >= order.length) { order = mixUp(SN); n = 0; }
    const [text, right, wrong] = order[n++];
    $('#clue').innerHTML = text.replace('___', '<span class="blank">?</span>'); $('#say').textContent = '';
    $('#opts').innerHTML = mixUp([right, ...wrong]).map((w) => `<button class="btn big word" data-act="endPick" data-hit="${w === right ? 1 : 0}">${w}</button>`).join('');
  };
  actions.endPick = (b) => {
    if (b.dataset.hit === '1') { score++; sfx.pop(); setScore(score); $('#clue .blank').textContent = b.textContent; $('#clue .blank').classList.add('in'); document.querySelectorAll('.word').forEach((x) => (x.disabled = true)); later(next, 900); }
    else { sfx.no(); b.disabled = true; $('#say').textContent = 'Read it with that word. Does it make sense?'; }
  };
  next();
  countdown(75, () => { track('endings', score); finish(g, score, Math.min(45, score * 4), score >= 9 ? 'Sentence superstar!' : 'Good reading!'); });
}

// ================= Learning games: math =================
// Shared quiz: show a question, three or four number answers, a timer.
function quiz(g, secs, ev, make, cheer) {
  let score = 0;
  frame(g, `<section class="card missing"><div class="quiz-art" id="quiz-art"></div><p class="big-word sum" id="quiz-q"></p><div class="count-opts" id="opts" translate="no"></div><p class="game-say" id="say" aria-live="polite"></p></section>`);
  const next = () => {
    const { q, right, art = '', near = [1, 2, 3, 10], opts: given, hint = 'Try again. You can do it!' } = make(score);
    const set = new Set([right]);
    if (given) given.forEach((v) => set.add(v));
    let guard = 0;
    while (set.size < 3 && guard++ < 60) { const v = right + (rnd(2) ? 1 : -1) * near[rnd(near.length)]; if (v >= 0) set.add(v); }
    $('#quiz-art').innerHTML = art; $('#quiz-q').innerHTML = q; $('#say').textContent = ''; $('#say').dataset.hint = hint;
    const list = [...set]; if (typeof right === 'number') list.sort((a, b) => a - b); else list.sort(() => Math.random() - 0.5);
    $('#opts').innerHTML = list.map((v) => `<button class="btn big" data-act="quizPick" data-hit="${v === right ? 1 : 0}">${v}</button>`).join('');
  };
  actions.quizPick = (b) => {
    if (b.dataset.hit === '1') { score++; sfx.coin(); setScore(score); next(); }
    else { sfx.no(); b.disabled = true; $('#say').textContent = $('#say').dataset.hint; }
  };
  next();
  countdown(secs, () => { track(ev, score); finish(g, score, Math.min(45, score * 3), score >= 10 ? cheer : 'Good thinking!'); });
}
const dots = (rows, cols) => `<div class="dot-rows">${Array.from({ length: rows }, () => `<div>${'<i></i>'.repeat(cols)}</div>`).join('')}</div>`;

function times(g) {
  quiz(g, 60, 'times', (score) => {
    const tables = score < 4 ? [2, 5, 10] : score < 9 ? [2, 3, 4, 5, 10] : [3, 4, 6, 7, 8, 9];
    const a = tables[rnd(tables.length)], b = 1 + rnd(score < 4 ? 5 : 10);
    return { q: `${b} &times; ${a} = ?`, right: a * b, art: b <= 6 && a <= 10 ? dots(b, a) : '', near: [a, a * 2, 1, 2], hint: `Count ${b} groups of ${a}.` };
  }, 'Times table champion!');
}
function skip(g) {
  quiz(g, 60, 'skip', (score) => {
    const steps = score < 4 ? [2, 5, 10] : score < 9 ? [2, 3, 4, 5, 10] : [3, 4, 6, 7, 9, 25], step = steps[rnd(steps.length)];
    const down = score >= 6 && rnd(3) === 0, start = step * (1 + rnd(8)) + (down ? step * 5 : 0), hole = 1 + rnd(4);
    const seq = Array.from({ length: 5 }, (_, i) => start + (down ? -1 : 1) * step * i), right = seq[hole];
    return { q: seq.map((v, i) => (i === hole ? '<span class="blank">?</span>' : v)).join('<span class="comma">,</span> '), right, near: [step, 1, 2], hint: `The numbers go ${down ? 'down' : 'up'} by ${step} each time.` };
  }, 'Skip counting star!');
}
function bonds(g) {
  quiz(g, 60, 'bonds', (score) => {
    const total = score < 4 ? 10 : score < 9 ? 20 : 100, a = total === 100 ? 5 * (1 + rnd(19)) : rnd(total + 1), left = rnd(2);
    return { q: left ? `<span class="blank">?</span> + ${a} = ${total}` : `${a} + <span class="blank">?</span> = ${total}`, right: total - a, near: total === 100 ? [5, 10] : [1, 2, 3], hint: `Start at ${a} and count up to ${total}.` };
  }, 'Number wizard!');
}
function clock(g) {
  const face = (h, m) => {
    const ha = ((h % 12) + m / 60) * 30, ma = m * 6, pt = (ang, len) => `${(50 + len * Math.sin((ang * Math.PI) / 180)).toFixed(1)} ${(50 - len * Math.cos((ang * Math.PI) / 180)).toFixed(1)}`;
    return `<svg class="clock" viewBox="0 0 100 100" role="img" aria-label="A clock"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#2A1846" stroke-width="4"/>${Array.from({ length: 12 }, (_, i) => `<text x="${(50 + 36 * Math.sin(((i + 1) * 30 * Math.PI) / 180)).toFixed(1)}" y="${(50 - 36 * Math.cos(((i + 1) * 30 * Math.PI) / 180) + 4).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="800" font-family="Baloo 2, sans-serif" fill="#2A1846">${i + 1}</text>`).join('')}
      <path d="M50 50L${pt(ha, 20)}" stroke="#C81E7A" stroke-width="5" stroke-linecap="round"/><path d="M50 50L${pt(ma, 31)}" stroke="#2A1846" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="50" r="3.5" fill="#2A1846"/></svg>`;
  };
  const txt = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
  quiz(g, 60, 'clock', (score) => {
    const mins = score < 3 ? [0] : score < 6 ? [0, 30] : score < 10 ? [0, 15, 30, 45] : Array.from({ length: 12 }, (_, i) => i * 5);
    const h = 1 + rnd(12), m = mins[rnd(mins.length)], right = txt(h, m);
    const wrong = new Set(); let guard = 0;
    while (wrong.size < 2 && guard++ < 40) { const w = rnd(3) === 0 && m % 5 === 0 && m / 5 >= 1 && m / 5 <= 12 ? txt(m / 5, (h % 12) * 5) : txt(1 + ((h - 1 + 1 + rnd(11)) % 12), rnd(2) ? m : mins[rnd(mins.length)]); if (w !== right) wrong.add(w); }
    return { q: 'What time is it?', right, opts: [...wrong], art: face(h, m), hint: 'The short pink hand shows the hour. The long hand shows the minutes.' };
  }, 'Clock master!');
}

// ---------- more reading ----------
const OPP = [['hot', 'cold'], ['big', 'small'], ['up', 'down'], ['happy', 'sad'], ['fast', 'slow'], ['day', 'night'], ['open', 'closed'], ['wet', 'dry'], ['soft', 'hard'], ['full', 'empty'], ['loud', 'quiet'], ['early', 'late'], ['light', 'heavy'], ['clean', 'dirty'], ['near', 'far'], ['first', 'last'], ['give', 'take'], ['push', 'pull'], ['tall', 'short'], ['start', 'finish'], ['inside', 'outside'], ['remember', 'forget'], ['rare', 'common'], ['fair', 'unfair']];
function opposites(g) {
  let last = -1;
  quiz(g, 60, 'opposites', () => {
    const OP = ES() ? OPP_ES : OPP;
    let i = rnd(OP.length); if (i === last) i = (i + 1) % OP.length; last = i;
    const flip = rnd(2), ask = OP[i][flip], right = OP[i][1 - flip];
    const wrong = mixUp(OP.filter((_, k) => k !== i).map((p) => p[rnd(2)])).slice(0, 2);
    return { q: `<small class="q-small">The opposite of</small><span class="q-word" translate="no">${ask}</span>`, right, opts: wrong, near: [], hint: 'Think of the word that means the other way around.' };
  }, 'Opposites expert!');
}
const SENTENCES = ['The cat is very soft.', 'I like to trade my toys.', 'My slime is cold and gooey.', 'We read a story at bedtime.', 'The frog jumped into the pond.', 'She drew a pink squishy today.', 'A fair trade makes friends happy.', 'The bunny hid under my bed.', 'Please share your toys with me.', 'I counted ten shiny gold coins.', 'The little ghost was too shy.', 'He popped all the bubbles fast.'];
function build(g) {
  let score = 0, words = [], got = 0, lastS = '';
  frame(g, `<section class="card missing"><p class="game-say" id="say">Tap the words in the right order.</p><div class="built" id="built" aria-live="polite" translate="no"></div><div class="tiles word-tiles" id="tiles" translate="no"></div></section>`);
  const show = () => { $('#built').textContent = words.slice(0, got).join(' ') || '...'; };
  const next = () => {
    const pool = (ES() ? SENTENCES_ES : SENTENCES).filter((x) => x !== lastS && (score < 3 ? x.split(' ').length <= 5 : true));
    const sentence = pool[rnd(pool.length)]; lastS = sentence; words = sentence.split(' '); got = 0;
    $('#tiles').innerHTML = mixUp(words.map((w, i) => [w, i])).map(([w]) => `<button class="tile word-tile" data-act="buildTile" data-w="${w}">${w}</button>`).join('');
    show(); $('#say').textContent = 'Tap the words in the right order.';
  };
  actions.buildTile = (b) => {
    if (b.dataset.w !== words[got]) { sfx.no(); b.classList.add('bad'); later(() => b.classList.remove('bad'), 300); $('#say').textContent = got ? 'Not that word yet. Read what you have so far.' : 'A sentence starts with a capital letter.'; return; }
    got++; b.disabled = true; b.classList.add('used'); sfx.pop(); show();
    if (got === words.length) { score++; setScore(score); sfx.win(); $('#say').textContent = 'You built it!'; later(next, 1200); }
  };
  next();
  countdown(90, () => { track('build', score); finish(g, score, Math.min(48, score * 6), score >= 6 ? 'Sentence builder!' : 'Great building!'); });
}

// ---------- more math ----------
function fraction(g) {
  const pie = (n, k) => { let s = ''; for (let i = 0; i < n; i++) { const a0 = (i / n) * 6.2832 - 1.5708, a1 = ((i + 1) / n) * 6.2832 - 1.5708; s += `<path d="M50 50L${(50 + 44 * Math.cos(a0)).toFixed(1)} ${(50 + 44 * Math.sin(a0)).toFixed(1)}A44 44 0 0 1 ${(50 + 44 * Math.cos(a1)).toFixed(1)} ${(50 + 44 * Math.sin(a1)).toFixed(1)}Z" fill="${i < k ? '#FFD84A' : '#FFF4E4'}" stroke="#2A1846" stroke-width="2.5" stroke-linejoin="round"/>${i < k ? `<circle cx="${(50 + 26 * Math.cos((a0 + a1) / 2)).toFixed(1)}" cy="${(50 + 26 * Math.sin((a0 + a1) / 2)).toFixed(1)}" r="5" fill="#E2483F"/>` : ''}`; } return `<svg class="clock" viewBox="0 0 100 100" role="img" aria-label="A pizza cut into ${n} slices with ${k} left">${s}</svg>`; };
  quiz(g, 60, 'fraction', (score) => {
    const ns = score < 4 ? [2, 3, 4] : score < 9 ? [3, 4, 5, 6] : [5, 6, 8, 10], n = ns[rnd(ns.length)], k = 1 + rnd(n - 1), right = `${k}/${n}`;
    const wrong = [`${n - k}/${n}`, `${k}/${n + 1}`, `${Math.min(n, k + 1)}/${n}`, `${n}/${k}`].filter((w) => w !== right);
    return { q: 'How much pizza is left?', right, opts: mixUp([...new Set(wrong)]).slice(0, 2), near: [], art: pie(n, k), hint: `Count the slices that are left, then count all ${n} slices.` };
  }, 'Fraction whiz!');
}
function cents(g) {
  const COIN = [[25, '#DCE1EA', 22], [10, '#DCE1EA', 14], [5, '#C9CFDA', 18], [1, '#E0A070', 16]];
  quiz(g, 70, 'cents', (score) => {
    const kinds = score < 3 ? [3, 2] : score < 7 ? [1, 2, 3] : [0, 1, 2, 3], n = 2 + rnd(score < 3 ? 3 : 5);
    const picked = Array.from({ length: n }, () => COIN[kinds[rnd(kinds.length)]]).sort((a, b) => b[0] - a[0]), right = picked.reduce((a, c) => a + c[0], 0);
    return { q: 'How many cents?', right, near: [1, 5, 10], art: `<div class="coin-row2">${picked.map(([v, c, r]) => `<span class="cent" style="width:${r * 2 + 8}px;height:${r * 2 + 8}px;background:${c}">${v}&cent;</span>`).join('')}</div>`, hint: 'Start with the biggest coin and count on.' };
  }, 'Coin counter!');
}
function addsub(g) {
  quiz(g, 60, 'addsub', (score) => {
    const top = score < 3 ? 10 : score < 7 ? 20 : score < 12 ? 100 : 500, minus = rnd(2) && score >= 2;
    let a = 1 + rnd(top), b = 1 + rnd(top); if (minus && b > a) [a, b] = [b, a];
    return { q: `${a} ${minus ? '&minus;' : '+'} ${b} = ?`, right: minus ? a - b : a + b, near: top > 20 ? [1, 2, 10] : [1, 2, 3], hint: minus ? `Start at ${a} and count back ${b}.` : `Start at ${a} and count on ${b}.` };
  }, 'Adding ace!');
}
function bigger(g) {
  quiz(g, 60, 'bigger', (score) => {
    const top = score < 4 ? 20 : score < 9 ? 100 : 1000; let a = 1 + rnd(top), b = rnd(6) === 0 ? a : 1 + rnd(top);
    if (score >= 9 && rnd(2)) b = Number(String(a).split('').reverse().join('')) || b; // 47 against 74
    const right = a > b ? '>' : a < b ? '<' : '=';
    return { q: `${a} <span class="blank">?</span> ${b}`, right, opts: ['<', '>', '='].filter((x) => x !== right), near: [], hint: 'The open mouth of the sign always eats the bigger number.' };
  }, 'Number detective!');
}

// ---------- fidget games ----------
function wrapgame(g) {
  const N = 42; let popped = 0; const t0 = Date.now();
  frame(g, `<p class="game-say" id="say">Pop them all!</p><div class="wrap-grid">${Array.from({ length: N }, () => '<button class="bub up wrapb" data-act="wrapPop" aria-label="Bubble"></button>').join('')}</div>`);
  actions.wrapPop = (b) => {
    if (b.disabled) return;
    b.disabled = true; b.classList.remove('up'); b.classList.add('flat'); popped++; sfx.pop(); setScore(popped);
    if (popped === N) { const secs = Math.round((Date.now() - t0) / 1000), pts = Math.max(5, 70 - secs); track('pop', N); later(() => finish(g, pts, Math.min(40, 10 + Math.round(pts / 2)), `All popped in ${secs} seconds!`), 400); }
  };
}
function spin(g) {
  let vel = 0, ang = 0, run = true, last = performance.now();
  frame(g, `<p class="game-say" id="say">Tap the spinner again and again!</p><button class="spin-big" data-act="spinTap" id="spin-big" aria-label="Spinner. Tap to spin it faster.">${toySVG('fi06')}</button><p class="game-say">Speed <b id="speed">0</b></p>`);
  const el = $('#spin-big');
  actions.spinTap = () => { vel = Math.min(2600, vel + 300); sfx.tap(); };
  const loop = (now) => {
    if (!run) return;
    const dt = Math.min(50, now - last) / 1000; last = now;
    ang += vel * dt; vel *= Math.pow(0.55, dt);
    el.firstElementChild.style.transform = `rotate(${(ang % 360).toFixed(1)}deg)`;
    setScore(Math.floor(ang / 360)); const sp = $('#speed'); if (sp) sp.textContent = Math.round(vel / 26);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  timers.push(() => { run = false; });
  countdown(20, () => { const spins = Math.floor(ang / 360); track('spin', spins); finish(g, spins, Math.min(40, Math.round(spins / 2)), spins >= 60 ? 'Whirlwind!' : 'Nice spinning!'); });
}
function box(g) {
  frame(g, `<p class="game-say">Just for fun. Fiddle with anything!</p><div class="fbox">
    <div class="fb-pops" role="group" aria-label="Popper">${Array.from({ length: 12 }, () => '<button class="bub up" data-act="fbPop" aria-label="Pop bubble" aria-pressed="false"></button>').join('')}</div>
    <div class="fb-row"><button class="fb-switch" data-act="fbSwitch" aria-pressed="false" aria-label="Click switch"><i></i></button>
      <button class="fb-spin" data-act="fbSpin" aria-label="Spinner">${toySVG('fi07')}</button>
      <div class="fb-squish squish" data-squish data-toy="sq58" role="button" tabindex="0" aria-label="Squeeze ball">${toySVG('sq58')}</div></div>
    <label class="fb-slide"><span>Slide</span><input type="range" min="0" max="20" value="10" id="fb-range" aria-label="Slider"></label></div>`);
  $('#score').parentElement.hidden = true;
  actions.fbPop = (b) => { const on = b.classList.toggle('up'); b.classList.toggle('flat', !on); b.setAttribute('aria-pressed', !on); sfx.pop(); };
  actions.fbSwitch = (b) => { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); sfx.click(); };
  actions.fbSpin = (b) => { b.classList.remove('whirl'); void b.offsetWidth; b.classList.add('whirl'); sfx.whirr(); };
  $('#fb-range').addEventListener('input', () => sfx.tap());
}

// ---------- letters and sounds ----------
function letters(g) {
  const SETS = [['b', 'd', 'p', 'q'], ['b', 'd', 'p', 'q'], ['m', 'w', 'n', 'u'], ['b', 'd', 'h', 'n'], ['6', '9', 'b', 'q'], ['f', 't', 'l', 'j']];
  let score = 0, target = '', left = 0;
  frame(g, `<section class="card missing"><p class="game-say">${L('Find every', 'Encuentra cada')} <span class="big-letter" id="target" translate="no"></span></p><div class="letter-grid" id="lg" translate="no"></div><p class="game-say" id="say" aria-live="polite"></p></section>`);
  const next = () => {
    const set = SETS[Math.min(SETS.length - 1, rnd(1 + Math.min(SETS.length - 1, score)))]; target = set[rnd(set.length)];
    const n = score < 3 ? 12 : 16, hits = 3 + rnd(3), cells = mixUp([...Array(hits).fill(target), ...Array.from({ length: n - hits }, () => { const o = set.filter((c) => c !== target); return o[rnd(o.length)]; })]);
    left = hits; $('#target').textContent = target; $('#say').textContent = '';
    $('#lg').innerHTML = cells.map((c) => `<button class="tile letter" data-act="letterPick" data-hit="${c === target ? 1 : 0}">${c}</button>`).join('');
  };
  actions.letterPick = (b) => {
    if (b.dataset.hit !== '1') { sfx.no(); b.classList.add('bad'); later(() => b.classList.remove('bad'), 300); $('#say').textContent = L('Look at which way it faces.', 'Mira hacia dónde mira la letra.'); return; }
    b.disabled = true; b.classList.add('found'); sfx.pop(); left--;
    if (left === 0) { score++; setScore(score); sfx.win(); later(next, 700); }
  };
  next();
  countdown(70, () => { track('letters', score); finish(g, score, Math.min(45, score * 5), score >= 7 ? 'Letter detective!' : 'Sharp eyes!'); });
}
function firstsound(g) {
  let score = 0, word = '', last = '';
  frame(g, `<section class="card missing"><div class="spell-toy squish" data-squish id="fs-toy"></div><p class="game-say">Which letter does it start with?</p><div class="count-opts" id="opts" translate="no"></div><button class="btn sm" data-act="fsHear">${icon('sound')} Say the word</button><p class="game-say" id="say" aria-live="polite"></p></section>`);
  const next = () => {
    const pool = (ES() ? WORDS_ES : WORDS).filter(([w]) => w !== last), [w, id] = pool[rnd(pool.length)]; word = last = w;
    $('#fs-toy').innerHTML = toySVG(id); $('#fs-toy').dataset.toy = id; $('#say').textContent = '';
    const look = { b: 'd', d: 'b', p: 'q', q: 'p', m: 'n', n: 'm' }, right = w[0], wrong = new Set([look[right]].filter(Boolean));
    while (wrong.size < 2) { const c = 'bcdfghlmnprst'[rnd(13)]; if (c !== right) wrong.add(c); }
    $('#opts').innerHTML = mixUp([right, ...wrong]).map((c) => `<button class="btn big letter-btn" data-act="fsPick" data-hit="${c === right ? 1 : 0}">${c}</button>`).join('');
    later(() => speak(word), 250);
  };
  actions.fsHear = () => speak(word);
  actions.fsPick = (b) => {
    if (b.dataset.hit === '1') { score++; sfx.pop(); setScore(score); $('#say').textContent = L(`Yes! ${word} starts with ${word[0]}.`, `¡Sí! ${word} empieza con ${word[0]}.`); document.querySelectorAll('.letter-btn').forEach((x) => (x.disabled = true)); later(next, 1100); }
    else { sfx.no(); b.disabled = true; $('#say').textContent = L('Say the word slowly. What is the very first sound?', 'Di la palabra despacio. ¿Cuál es el primer sonido?'); }
  };
  next();
  countdown(70, () => { track('firstsound', score); finish(g, score, Math.min(45, score * 4), score >= 9 ? 'Sound star!' : 'Good listening!'); });
}
const CHUNKS = [['but', 'ter', 'fly', 'sq121'], ['u', 'ni', 'corn', 'sq23'], ['pump', 'kin', 'sq54'], ['cook', 'ie', 'sq82'], ['tur', 'tle', 'sq48'], ['pick', 'le', 'sq75'], ['pen', 'guin', 'sq119'], ['cac', 'tus', 'sq42'], ['dump', 'ling', 'sq20'], ['rain', 'bow', 'sq138'], ['pop', 'si', 'cle', 'sq133'], ['can', 'dy', 'sq136'], ['bun', 'ny', 'sq08'], ['ap', 'ple', 'sq139'], ['snow', 'man', 'sq55'], ['do', 'nut', 'sq16']];
const CHUNKS_ES = [['ga', 'to', 'sq04'], ['pa', 'to', 'sq118'], ['lu', 'na', 'sq50'], ['nu', 'be', 'sq11'], ['ra', 'na', 'sq10'], ['a', 'be', 'ja', 'sq46'], ['co', 'ne', 'jo', 'sq08'], ['tor', 'tu', 'ga', 'sq48'], ['man', 'za', 'na', 'sq139'], ['ga', 'lle', 'ta', 'sq82'], ['es', 'tre', 'lla', 'sq13'], ['ma', 'ri', 'po', 'sa', 'sq121'], ['u', 'ni', 'cor', 'nio', 'sq23'], ['ba', 'lle', 'na', 'sq35'], ['pa', 'le', 'ta', 'sq133']];
function chunks(g) {
  let score = 0, parts = [], got = 0, lastW = '';
  frame(g, `<section class="card missing"><div class="spell-toy squish" data-squish id="ck-toy"></div><div class="built" id="built" translate="no"></div><p class="game-say" id="say">Tap the parts in order to build the word.</p><div class="tiles word-tiles" id="tiles" translate="no"></div><button class="btn sm" data-act="ckHear">${icon('sound')} Say the word</button></section>`);
  const show = () => { $('#built').innerHTML = parts.map((x, i) => `<span class="chunk ${i < got ? 'in' : ''}">${i < got ? x : '&nbsp;'}</span>`).join(''); };
  const next = () => {
    const pool = (ES() ? CHUNKS_ES : CHUNKS).filter((c) => c.join('') !== lastW && (score < 3 ? c.length <= 3 : true)), pick = pool[rnd(pool.length)];
    lastW = pick.join(''); parts = pick.slice(0, -1); got = 0; const id = pick[pick.length - 1];
    $('#ck-toy').innerHTML = toySVG(id); $('#ck-toy').dataset.toy = id;
    $('#tiles').innerHTML = mixUp(parts.map((x, i) => [x, i])).map(([x]) => `<button class="tile word-tile" data-act="ckTile" data-w="${x}">${x}</button>`).join('');
    show(); $('#say').textContent = 'Tap the parts in order to build the word.'; later(() => speak(parts.join('')), 250);
  };
  actions.ckHear = () => speak(parts.join(''));
  actions.ckTile = (b) => {
    if (b.dataset.w !== parts[got]) { sfx.no(); b.classList.add('bad'); later(() => b.classList.remove('bad'), 300); $('#say').textContent = 'Say the word slowly and clap each part.'; return; }
    got++; b.disabled = true; b.classList.add('used'); sfx.pop(); show();
    if (got === parts.length) { score++; setScore(score); sfx.win(); speak(parts.join('')); later(next, 1200); }
  };
  next();
  countdown(80, () => { track('chunks', score); finish(g, score, Math.min(45, score * 5), score >= 7 ? 'Word builder!' : 'Great chunking!'); });
}
const LOOKALIKE = [['was', 'saw', 'as'], ['on', 'no', 'in'], ['of', 'for', 'from'], ['there', 'three', 'tree'], ['who', 'how', 'now'], ['left', 'felt', 'lift'], ['big', 'dig', 'pig'], ['bad', 'dad', 'pad'], ['pat', 'tap', 'apt'], ['top', 'pot', 'opt'], ['quiet', 'quite', 'quit'], ['were', 'where', 'wear'], ['then', 'than', 'them'], ['dog', 'bog', 'god']];
const LOOKALIKE_ES = [['sol', 'los', 'sal'], ['mesa', 'masa', 'misa'], ['paso', 'peso', 'piso'], ['casa', 'cosa', 'caso'], ['mano', 'mono', 'malo'], ['pato', 'palo', 'pavo'], ['boca', 'bota', 'boda'], ['luna', 'lana', 'lona'], ['dedo', 'debo', 'bebo'], ['pala', 'bala', 'sala']];
function hearfind(g) {
  let score = 0, word = '', last = -1;
  frame(g, `<section class="card missing"><p class="game-say">Listen, then find the word.</p><button class="btn primary big" data-act="hfHear">${icon('sound')} Say it again</button><div class="word-opts hf" id="opts" translate="no"></div><p class="game-say" id="say" aria-live="polite"></p></section>`);
  const LK = ES() ? LOOKALIKE_ES : LOOKALIKE, canTalk = 'speechSynthesis' in window;
  const next = () => {
    let i = rnd(LK.length); if (i === last) i = (i + 1) % LK.length; last = i;
    word = LK[i][rnd(3)]; $('#say').textContent = canTalk ? '' : word;
    $('#opts').innerHTML = mixUp(LK[i]).map((w) => `<button class="btn big word" data-act="hfPick" data-hit="${w === word ? 1 : 0}">${w}</button>`).join('');
    later(() => speak(word), 300); if (!canTalk) later(() => { if ($('#say')) $('#say').textContent = ''; }, 1500);
  };
  actions.hfHear = () => speak(word);
  actions.hfPick = (b) => {
    if (b.dataset.hit === '1') { score++; sfx.pop(); setScore(score); document.querySelectorAll('.hf .word').forEach((x) => (x.disabled = true)); later(next, 700); }
    else { sfx.no(); b.disabled = true; $('#say').textContent = L('Look at each letter, one by one.', 'Mira cada letra, una por una.'); speak(word); }
  };
  next();
  countdown(70, () => { track('hearfind', score); finish(g, score, Math.min(45, score * 4), score >= 9 ? 'Super listener!' : 'Good listening!'); });
}

// ---------- focus ----------
function stopgo(g) {
  let score = 0, state = 'wait', tapped = false;
  frame(g, `<p class="game-say" id="say" aria-live="polite">Get ready...</p><button class="sg-pad" data-act="sgTap" id="sg" aria-label="Tap here when it says GO"><span class="sg-sign" id="sg-sign"></span><span class="sg-toy">${toySVG('sq10')}</span></button>`);
  const pad = $('#sg'), sign = $('#sg-sign');
  const round = () => {
    const go = Math.random() < 0.65; state = go ? 'go' : 'stop'; tapped = false;
    pad.className = 'sg-pad ' + state; sign.textContent = L(go ? 'GO!' : 'STOP', go ? '¡YA!' : 'ALTO'); $('#say').textContent = '';
    later(() => {
      if (state === 'stop' && !tapped) { score++; setScore(score); $('#say').textContent = L('Great waiting!', '¡Qué buena espera!'); }
      else if (state === 'go' && !tapped) $('#say').textContent = L('That one was a GO.', 'Esa era de ¡YA!');
      state = 'wait'; pad.className = 'sg-pad'; sign.textContent = '';
      later(round, 500 + rnd(600));
    }, Math.max(850, 1500 - score * 25));
  };
  actions.sgTap = () => {
    if (state === 'wait' || tapped) return;
    tapped = true;
    if (state === 'go') { score++; setScore(score); sfx.pop(); $('#say').textContent = L('Yes!', '¡Sí!'); }
    else { sfx.no(); $('#say').textContent = L('Oops, that was a STOP. Hands still next time.', 'Uy, era ALTO. Manos quietas la próxima vez.'); }
  };
  later(round, 900);
  countdown(45, () => { track('stopgo', score); finish(g, score, Math.min(45, score * 2), score >= 20 ? 'Super self-control!' : 'Good stopping and going!'); });
}
function steps(g) {
  let score = 0, order = [], at = 0, open = false;
  const ITEMS = () => (ES() ? WORDS_ES : WORDS).filter(([w]) => w.length <= 6).slice(0, 14);
  frame(g, `<section class="card missing"><p class="read-clue" id="clue" translate="no"></p><div class="shadow-opts steps-grid" id="opts"></div><p class="game-say" id="say" aria-live="polite"></p></section>`);
  const next = () => {
    const n = score < 2 ? 2 : score < 5 ? 3 : 4, six = mixUp(ITEMS()).slice(0, 6); order = mixUp(six).slice(0, n); at = 0; open = false;
    const names = order.map(([w]) => w), text = ES() ? `Primero toca: ${names[0]}. ${names.slice(1).map((w, i) => (i === names.length - 2 ? `Al final: ${w}.` : `Luego: ${w}.`)).join(' ')}` : `First tap the ${names[0]}. ${names.slice(1).map((w, i) => (i === names.length - 2 ? `Last, the ${w}.` : `Then the ${w}.`)).join(' ')}`;
    $('#clue').textContent = text; $('#opts').innerHTML = ''; $('#say').textContent = L('Read the steps. Get ready to remember them.', 'Lee los pasos. Prepárate para recordarlos.');
    later(() => { $('#clue').textContent = L('Now tap them in order.', 'Ahora tócalos en orden.'); $('#say').textContent = ''; open = true;
      $('#opts').innerHTML = six.map(([w, id]) => `<button class="odd-cell" data-act="stepPick" data-w="${w}" aria-label="${w}">${toySVG(id)}</button>`).join(''); }, 2600 + n * 1300);
  };
  actions.stepPick = (b) => {
    if (!open) return;
    if (b.dataset.w !== order[at][0]) { sfx.no(); open = false; $('#say').textContent = L('Not that one. Here are the steps again.', 'Esa no. Aquí van los pasos otra vez.'); return later(next, 1300); }
    b.disabled = true; b.classList.add('found'); sfx.pop(); at++;
    if (at === order.length) { score++; setScore(score); sfx.win(); open = false; later(next, 900); }
  };
  next();
  countdown(110, () => { track('steps', score); finish(g, score, Math.min(45, score * 6), score >= 6 ? 'Amazing memory!' : 'Good remembering!'); });
}

// ---------- calm and bedtime: slow, quiet, no timers ----------
const chime = (n) => { try { sfx.note([262, 294, 330, 392, 440, 523][n % 6] / 1); } catch { /* quiet */ } };
function calmFrame(g, inner) { frame(g, inner); view().classList.add('calm'); const sc = $('#score'); if (sc) sc.parentElement.hidden = true; }
function breathe(g) {
  const ROUNDS = 6; let n = 0;
  calmFrame(g, `<div class="calm-stage"><div class="breath" id="breath">${toySVG('sq01')}</div><p class="calm-say" id="say" aria-live="polite">Get comfy...</p><p class="calm-sub" id="sub"></p></div>`);
  const b = $('#breath');
  const cycle = () => {
    if (n >= ROUNDS) { track('breathe', n); return finish(g, n, 10, 'Nice and calm.'); }
    n++; $('#sub').textContent = L(`Breath ${n} of ${ROUNDS}`, `Respiración ${n} de ${ROUNDS}`);
    b.className = 'breath in'; $('#say').textContent = L('Breathe in...', 'Inhala...');
    later(() => { $('#say').textContent = L('Hold...', 'Sostén...'); }, 4000);
    later(() => { b.className = 'breath out'; $('#say').textContent = L('Breathe out...', 'Exhala...'); }, 5500);
    later(cycle, 11500);
  };
  later(cycle, 1500);
}
function stars(g) {
  let n = 0;
  calmFrame(g, `<div class="sky" id="sky" data-act="skyTap" role="button" tabindex="0" aria-label="Night sky. Tap to hang a star."><span class="moon">${toySVG('sq50')}</span></div><p class="calm-say" id="say" aria-live="polite">Tap the sky to hang a star.</p><div class="row center"><button class="btn" data-act="skyClear">Clear the sky</button><button class="btn" data-act="go" data-to="games">Good night</button></div>`);
  actions.skyTap = (el, e) => {
    const r = $('#sky').getBoundingClientRect(), st = document.createElement('i');
    st.className = 'star'; st.style.left = (((e.clientX || r.left + r.width / 2) - r.left) / r.width) * 100 + '%'; st.style.top = (((e.clientY || r.top + r.height / 2) - r.top) / r.height) * 100 + '%';
    st.style.setProperty('--s', 0.6 + Math.random() * 0.9); st.style.animationDelay = Math.random() * 2 + 's';
    $('#sky').append(st); n++; chime(n);
    $('#say').textContent = n >= 20 ? L('What a beautiful sky. Sweet dreams.', 'Qué cielo tan bonito. Dulces sueños.') : L(`${n} stars`, `${n} estrellas`);
    if (n === 20) track('stars', 20);
  };
  actions.skyClear = () => { document.querySelectorAll('#sky .star').forEach((x) => x.remove()); n = 0; $('#say').textContent = L('Tap the sky to hang a star.', 'Toca el cielo para colgar una estrella.'); };
}
function tuckin(g) {
  const own = Object.keys(P().inv).filter((id) => TOYS[id]).sort(() => Math.random() - 0.5).slice(0, 6); let asleep = 0;
  calmFrame(g, `<p class="calm-say" id="say" aria-live="polite">Tap each toy to tuck it in.</p><div class="beds">${own.map((id) => `<button class="bed" data-act="tuck" aria-label="Tuck in ${TOYS[id].name}" aria-pressed="false"><span class="bed-toy">${toySVG(id)}</span><span class="blanket"></span><span class="zzz" aria-hidden="true">z z z</span></button>`).join('')}</div>`);
  actions.tuck = (b) => {
    if (b.getAttribute('aria-pressed') === 'true') return;
    b.setAttribute('aria-pressed', 'true'); asleep++; chime(asleep);
    $('#say').textContent = asleep === own.length ? L('Everyone is asleep. Good night!', 'Todos están dormidos. ¡Buenas noches!') : L('Shhh... good night.', 'Shhh... buenas noches.');
    if (asleep === own.length) { track('tuckin', asleep); later(() => finish(g, asleep, 10, 'Good night, sleep tight.'), 2600); }
  };
}

// ---------- more memory games ----------
function bigmatch(g) { match(g, 8); }
function wordmatch(g) {
  const W = mixUp(ES() ? WORDS_ES : WORDS).slice(0, 6);
  const deck = mixUp([...W.map(([w, id]) => ({ k: w, h: toySVG(id) })), ...W.map(([w]) => ({ k: w, h: `<b class="mem-word" translate="no">${w}</b>` }))]);
  let open = [], found = 0, moves = 0, lock = false;
  frame(g, `<p class="muted">Moves: <b id="moves">0</b></p><div class="mem-grid">${deck.map((c, i) => `<button class="mem" data-act="wmem" data-i="${i}" aria-label="Card ${i + 1}, face down"><span class="mem-front">${c.h}</span><span class="mem-back">?</span></button>`).join('')}</div>`);
  actions.wmem = (c) => {
    if (lock || c.classList.contains('open')) return;
    c.classList.add('open'); c.setAttribute('aria-label', deck[+c.dataset.i].k); sfx.tap(); open.push(c);
    if (open.length < 2) return;
    moves++; $('#moves').textContent = moves;
    const [a, b] = open; open = [];
    if (deck[+a.dataset.i].k === deck[+b.dataset.i].k) {
      a.classList.add('done'); b.classList.add('done'); a.disabled = b.disabled = true; found++; sfx.pop(); setScore(found * 10); speak(deck[+a.dataset.i].k);
      if (found === 6) { track('match'); const pts = Math.max(20, 130 - moves * 5); later(() => finish(g, pts, Math.max(12, 46 - moves * 2), moves <= 10 ? 'Super memory!' : 'All matched!'), 700); }
    } else { lock = true; later(() => { [a, b].forEach((x) => { x.classList.remove('open'); x.setAttribute('aria-label', `Card ${+x.dataset.i + 1}, face down`); }); lock = false; }, 1000); }
  };
}
function where(g) {
  let score = 0, cells = [], target = -1, open = false;
  frame(g, `<section class="card missing"><p class="game-say" id="say" aria-live="polite">Remember where each toy is.</p><div class="where-ask" id="ask"></div><div class="shadow-opts steps-grid" id="opts"></div></section>`);
  const next = () => {
    const n = score < 2 ? 3 : score < 5 ? 4 : score < 8 ? 5 : 6; open = false;
    cells = mixUp(TOY_LIST).slice(0, n).map((t) => t.id); target = rnd(n);
    $('#ask').innerHTML = ''; $('#say').textContent = 'Remember where each toy is.';
    $('#opts').innerHTML = cells.map((id, i) => `<button class="odd-cell box" data-act="wherePick" data-i="${i}" aria-label="Box ${i + 1}"><span class="box-toy">${toySVG(id)}</span><span class="box-lid">?</span></button>`).join('');
    later(() => { document.querySelectorAll('.box').forEach((b) => b.classList.add('shut')); $('#ask').innerHTML = toySVG(cells[target]); $('#say').textContent = 'Which box is this toy hiding in?'; open = true; }, 1800 + n * 700);
  };
  actions.wherePick = (b) => {
    if (!open) return; open = false;
    document.querySelectorAll('.box').forEach((x) => x.classList.remove('shut'));
    if (+b.dataset.i === target) { score++; setScore(score); sfx.win(); b.classList.add('found'); $('#say').textContent = 'You remembered!'; }
    else { sfx.no(); b.classList.add('bad'); $('#say').textContent = 'Not that box. Look where it was.'; }
    later(next, 1400);
  };
  next();
  countdown(100, () => { track('where', score); finish(g, score, Math.min(45, score * 5), score >= 7 ? 'Super memory!' : 'Good remembering!'); });
}
function changed(g) {
  let score = 0, open = false, at = -1;
  frame(g, `<section class="card missing"><p class="game-say" id="say" aria-live="polite">Look closely at the toys.</p><div class="shadow-opts steps-grid" id="opts"></div></section>`);
  const draw = (ids) => { $('#opts').innerHTML = ids.map((id, i) => `<button class="odd-cell" data-act="chPick" data-i="${i}" aria-label="${TOYS[id].name}">${toySVG(id)}</button>`).join(''); };
  const next = () => {
    const n = score < 3 ? 4 : score < 6 ? 5 : 6; open = false;
    const pool = mixUp(TOY_LIST).slice(0, n + 1).map((t) => t.id), ids = pool.slice(0, n);
    draw(ids); $('#opts').classList.remove('hide'); $('#say').textContent = 'Look closely at the toys.';
    later(() => { $('#opts').classList.add('hide'); $('#say').textContent = 'Close your eyes...'; }, 2200 + n * 500);
    later(() => { at = rnd(n); ids[at] = pool[n]; draw(ids); $('#opts').classList.remove('hide'); $('#say').textContent = 'One toy changed. Which one is new?'; open = true; }, 3400 + n * 500);
  };
  actions.chPick = (b) => {
    if (!open) return; open = false;
    if (+b.dataset.i === at) { score++; setScore(score); sfx.win(); b.classList.add('found'); $('#say').textContent = 'Yes! That one is new.'; }
    else { sfx.no(); b.classList.add('bad'); const r = document.querySelector(`[data-act=chPick][data-i="${at}"]`); if (r) r.classList.add('found'); $('#say').textContent = 'It was this one.'; }
    later(next, 1400);
  };
  next();
  countdown(100, () => { track('changed', score); finish(g, score, Math.min(45, score * 5), score >= 7 ? 'Eagle eyes!' : 'Good looking!'); });
}
