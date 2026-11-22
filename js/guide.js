// Mochi the guide. A friendly helper that walks a new player around the game, one small step at a time.
// It never blocks the screen: the player can tap anything while Mochi talks.
import { $, actions, sfx, closeModal } from './ui.js';
import { P, save, store } from './state.js';
import { toySVG, icon } from './art.js';
import { lang } from './i18n.js';

const STEPS = [
  { tab: 'home', sel: '.hero-toy', a: 's1', t: 'Hi! I am Mochi, and I love squishies! This is your buddy. Give your buddy a big squish to win coins. Go on, try it!' },
  { tab: 'home', sel: '#coins', a: 's2', t: 'Ka-ching! Your coins live up here. Squish, play games, read stories and finish challenges to win more.' },
  { tab: 'home', sel: '.quests', a: 's3', t: 'Every day you get three challenges. Finish all three and a bonus chest pops open! You can spin the prize wheel once a day too.' },
  { tab: 'toys', sel: '.toy-card, .toy', a: 's4', t: 'Ta-da! All your toys live here. Tap a toy to squish it and hear it. Pick any toy you like to be your buddy.' },
  { tab: 'shop', sel: '.bag, .shop-card, .card', a: 's5', t: 'Ooh, the shop! Spend coins on mystery bags to get new toys. What is hiding inside?' },
  { tab: 'trade', sel: '.modes, .card', a: 's6', t: 'Time to trade! Play with a computer friend, a friend on this screen, or a friend online. The check means yes, the plus adds a toy, and the X means no thanks.' },
  { tab: 'games', sel: '.card', a: 's7', t: 'Games, games, games! Reading games, math games, memory games, fidget games, and calm games for bedtime. They all win you coins!' },
  { tab: 'stories', sel: '.story-card', a: 's8', t: 'Story time! You choose what happens next. Tap any word to hear it. Every story has lots of endings to find.' },
  { tab: 'studio', sel: '.pad, .card', a: 's9', t: 'This is the Squishy Studio. Draw your very own squishy. Then keep it, squish it and trade it!' },
  { tab: 'room', sel: '.room-stage', a: 's10', t: 'Welcome to your very own room! Buy furniture and wallpaper with coins, put your toys in it, and drag things where you want them.' },
  { tab: 'album', sel: '.sticker.ready, .stickers', a: 's11', t: 'Stickers! You win them for collecting, trading, reading and playing. Tap a new sticker to stick it in and win coins.' },
  { tab: 'giants', sel: '.goal-banner', a: 's13', t: 'Meet the giant squishies! Play games with them to win coins. Wake up all 12 giants for the Giant Parade. That is your big goal!' },
  { tab: 'home', sel: '[data-act=tour]', a: 's12', t: 'And that is everything! If you forget, tap Show me around and I will pop right back. Now go squish something!' },
];
let go = null, at = -1, mode = '', glow = [], clip = null, cur = '';
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
  const nav = document.querySelector(`#nav [data-to="${tab === 'studio' ? 'toys' : tab === 'room' || tab === 'album' || tab === 'giants' ? 'home' : tab}"]`), t = sel && document.querySelector('#view ' + sel.split(', ').join(', #view ')) || (sel && document.querySelector(sel));
  [nav, t].forEach((x) => { if (x) { x.classList.add('guide-glow'); glow.push(x); } });
  if (t && !t.closest('.top')) t.scrollIntoView({ block: 'center', behavior: 'smooth' });
}
const hear = `<button class="btn sm" data-act="guideHear" aria-label="Read it to me">${icon('sound')}</button>`;
function show(text, step, btns, key) {
  build(); stopTalk(); cur = key || '';
  $('#guide-text').textContent = text; $('#guide-step').textContent = step; $('#guide-step').hidden = !step;
  $('#guide-btns').innerHTML = hear + btns;
  el().hidden = false; document.body.classList.add('guiding');
  if (!store.mute) talk(true);
}
// Mochi's lines are recorded in English. Other languages use the device's own voice, and only when asked.
function stopTalk() { if (clip) { clip.pause(); clip = null; } if ('speechSynthesis' in window) speechSynthesis.cancel(); if (el()) el().classList.remove('talking'); }
function deviceTalk() {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance($('#guide-text').textContent); u.rate = 0.9; u.pitch = 1.15; u.lang = lang() === 'es' ? 'es-US' : 'en-US'; speechSynthesis.speak(u);
}
function talk(auto) {
  if (lang() !== 'en' || !cur) { if (!auto) deviceTalk(); return; }
  const a = new Audio(`audio/guide/${cur}.mp3`), fail = () => { if (clip !== a) return; stopTalk(); if (!auto) deviceTalk(); };
  clip = a; el().classList.add('talking');
  a.onended = () => { if (clip === a) stopTalk(); }; a.onerror = fail;
  a.play().catch(fail);
}
function hide() { unglow(); stopTalk(); if (el()) el().hidden = true; document.body.classList.remove('guiding'); mode = ''; at = -1; }
function step(i) {
  at = i; mode = 'tour';
  const s = STEPS[i];
  closeModal();
  go(s.tab);
  show(s.t, `Step ${i + 1} of ${STEPS.length}`, `${i ? '<button class="btn sm" data-act="guideBack">Back</button>' : ''}<button class="btn primary" data-act="guideNext">${i === STEPS.length - 1 ? 'All done!' : 'Next'}</button>`, s.a);
  setTimeout(() => light(s.sel, s.tab), 120);
}
function done(p) { p.guide.asked = 1; STEPS.forEach((s) => (p.guide.tips[s.tab] = 1)); save(); }
actions.tour = () => { sfx.tap(); const p = P(); if (!p) return; p.guide = p.guide || { tips: {} }; done(p); step(0); };
actions.guideNext = () => { sfx.tap(); if (mode !== 'tour' || at >= STEPS.length - 1) return hide(); step(at + 1); };
actions.guideBack = () => { sfx.tap(); if (mode === 'tour' && at > 0) step(at - 1); };
actions.guideEnd = () => { const p = P(); if (p && mode === 'ask') { p.guide.asked = 1; p.guide.tips.home = 1; save(); } hide(); };
actions.guideHear = () => {
  if (clip || ('speechSynthesis' in window && speechSynthesis.speaking)) return stopTalk();
  talk(false);
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
    return show('Hi! I am Mochi. Do you want me to show you around?', '', '<button class="btn primary" data-act="tour">Yes, show me!</button><button class="btn sm" data-act="guideEnd">No thanks</button>', 'ask');
  }
  const s = STEPS.find((x) => x.tab === tab && x.tab !== 'home');
  if (!s || p.guide.tips[tab]) return hide();
  p.guide.tips[tab] = 1; save(); mode = 'tip';
  show(s.t, '', '<button class="btn primary" data-act="guideEnd">Got it!</button>', s.a);
  setTimeout(() => light(s.sel, s.tab), 120);
}
