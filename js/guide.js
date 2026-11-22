// Mochi the guide. A friendly helper that walks a new player around the game, one small step at a time.
// It never blocks the screen: the player can tap anything while Mochi talks.
import { $, actions, sfx, closeModal } from './ui.js';
import { P, save } from './state.js';
import { toySVG, icon } from './art.js';
import { lang } from './i18n.js';

const STEPS = [
  { tab: 'home', sel: '.hero-toy', t: 'Hi! I am Mochi. I will show you around. This is your buddy. Squish your buddy to win coins. Try it now!' },
  { tab: 'home', sel: '#coins', t: 'Your coins are up here. You win coins by squishing, playing games, reading stories and finishing challenges.' },
  { tab: 'home', sel: '.quests', t: 'Every day there are three challenges. Finish all three to open a bonus chest. You can spin the prize wheel once a day too.' },
  { tab: 'toys', sel: '.toy-card, .toy', t: 'All your toys live here. Tap a toy to squish it and hear it. You can pick any toy to be your buddy.' },
  { tab: 'shop', sel: '.bag, .shop-card, .card', t: 'This is the shop. Spend coins on mystery bags to get new toys. What will be inside?' },
  { tab: 'trade', sel: '.modes, .card', t: 'Here you trade toys. Play with a computer friend, a friend on this screen, or a friend online. The check means yes, the plus adds a toy, and the X means no thanks.' },
  { tab: 'games', sel: '.card', t: 'Games win you coins! There are reading games, math games, memory games, fidget games and calm games for bedtime.' },
  { tab: 'stories', sel: '.story-card', t: 'In every story, you choose what happens next. Tap any word to hear it. Each story has many endings to find.' },
  { tab: 'studio', sel: '.pad, .card', t: 'This is the Squishy Studio. Draw your very own squishy, then keep it, squish it and trade it!' },
  { tab: 'home', sel: '[data-act=tour]', t: 'That is everything! If you forget, tap Show me around and I will come back. Have fun!' },
];
let go = null, at = -1, mode = '', glow = [];
const el = () => $('#guide');
function build() {
  if (el()) return;
  const a = document.createElement('aside');
  a.id = 'guide'; a.className = 'guide'; a.hidden = true; a.setAttribute('role', 'region'); a.setAttribute('aria-label', 'Mochi the guide');
  a.innerHTML = `<div class="guide-art squish" data-squish data-toy="sq01">${toySVG('sq01')}</div>
    <div class="guide-body"><p class="guide-step pill" id="guide-step"></p><p class="guide-text" id="guide-text" aria-live="polite"></p><div class="row" id="guide-btns"></div></div>
    <button class="guide-x" data-act="guideEnd" aria-label="Close the guide">&times;</button>`;
  document.body.append(a);
}
function unglow() { glow.forEach((x) => x.classList.remove('guide-glow')); glow = []; }
function light(sel, tab) {
  unglow();
  const nav = document.querySelector(`#nav [data-to="${tab === 'studio' ? 'toys' : tab}"]`), t = sel && document.querySelector('#view ' + sel.split(', ').join(', #view ')) || (sel && document.querySelector(sel));
  [nav, t].forEach((x) => { if (x) { x.classList.add('guide-glow'); glow.push(x); } });
  if (t && !t.closest('.top')) t.scrollIntoView({ block: 'center', behavior: 'smooth' });
}
const hear = `<button class="btn sm" data-act="guideHear" aria-label="Read it to me">${icon('sound')}</button>`;
function show(text, step, btns) {
  build(); stopTalk();
  $('#guide-text').textContent = text; $('#guide-step').textContent = step; $('#guide-step').hidden = !step;
  $('#guide-btns').innerHTML = hear + btns;
  el().hidden = false; document.body.classList.add('guiding');
}
function stopTalk() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }
function hide() { unglow(); stopTalk(); if (el()) el().hidden = true; document.body.classList.remove('guiding'); mode = ''; at = -1; }
function step(i) {
  at = i; mode = 'tour';
  const s = STEPS[i];
  closeModal();
  go(s.tab);
  show(s.t, `Step ${i + 1} of ${STEPS.length}`, `${i ? '<button class="btn sm" data-act="guideBack">Back</button>' : ''}<button class="btn primary" data-act="guideNext">${i === STEPS.length - 1 ? 'All done!' : 'Next'}</button>`);
  setTimeout(() => light(s.sel, s.tab), 120);
}
function done(p) { p.guide.asked = 1; STEPS.forEach((s) => (p.guide.tips[s.tab] = 1)); save(); }
actions.tour = () => { sfx.tap(); const p = P(); if (!p) return; p.guide = p.guide || { tips: {} }; done(p); step(0); };
actions.guideNext = () => { sfx.tap(); if (mode !== 'tour' || at >= STEPS.length - 1) return hide(); step(at + 1); };
actions.guideBack = () => { sfx.tap(); if (mode === 'tour' && at > 0) step(at - 1); };
actions.guideEnd = () => { const p = P(); if (p && mode === 'ask') { p.guide.asked = 1; p.guide.tips.home = 1; save(); } hide(); };
actions.guideHear = () => {
  if (!('speechSynthesis' in window)) return;
  if (speechSynthesis.speaking) return speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance($('#guide-text').textContent); u.rate = 0.9; u.pitch = 1.15; u.lang = lang() === 'es' ? 'es-US' : 'en-US'; speechSynthesis.speak(u);
};
export function initGuide(goFn) { go = goFn; }
// Called every time a screen opens. The first time on each screen, Mochi pops up with one tip.
export function guideVisit(tab) {
  const p = P();
  if (!p || mode === 'tour') return;
  p.guide = p.guide || { tips: {} };
  if (!p.guide.asked) {
    if (tab !== 'home') return hide();
    mode = 'ask';
    return show('Hi! I am Mochi. Do you want me to show you around?', '', '<button class="btn primary" data-act="tour">Yes, show me!</button><button class="btn sm" data-act="guideEnd">No thanks</button>');
  }
  const s = STEPS.find((x) => x.tab === tab && x.tab !== 'home');
  if (!s || p.guide.tips[tab]) return hide();
  p.guide.tips[tab] = 1; save(); mode = 'tip';
  show(s.t, '', '<button class="btn primary" data-act="guideEnd">Got it!</button>');
  setTimeout(() => light(s.sel, s.tab), 120);
}
