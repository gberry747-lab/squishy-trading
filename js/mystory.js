// Story maker: write your own choose-your-path story. Stories are saved with the player on this device.
import { TOYS } from './data.js';
import { P, save } from './state.js';
import { $, esc, actions, sfx, toast, modal, closeModal, router } from './ui.js';
import { toySVG, icon } from './art.js';
import { lang } from './i18n.js';

let ed = null, read = null;
export const initMyStory = (fn) => { read = fn; };
const list = (p = P()) => (p.myStories = p.myStories || []);
const MAX_PAGES = 15, MAX_STORIES = 12;
const art = (id) => (TOYS[id] ? id : 'sq01');
// Pages in reading order, with how deep each one is.
function order(s) {
  const out = [s.start], d = { [s.start]: 0 }, from = {};
  for (let i = 0; i < out.length; i++) (s.nodes[out[i]].c || []).forEach(([l, to], k) => { if (s.nodes[to] && !(to in d)) { d[to] = d[out[i]] + 1; from[to] = [out[i], k]; out.push(to); } });
  return { out, d, from };
}
const fresh = (a) => ({ art: a, t: '', end: 'The End' });
const ideas = () => { const p = P(), es = lang() === 'es'; return [...(es ? ['Un día,', 'De pronto,', 'Entonces', 'Pero', 'Al final,', 'dijo'] : ['One day,', 'Suddenly,', 'Then', 'But', 'At last,', 'said']), p.name, TOYS[p.buddy].name]; };

export function myStoryScreen() {
  if (ed) return editor();
  const p = P(), mine = list(p);
  return `<button class="btn back" data-act="go" data-to="stories">${icon('back')} Stories</button><h1>Story maker</h1>
    <p class="muted">Write your own story where the reader chooses what happens next. Your stories are saved on this device.</p>
    ${mine.length < MAX_STORIES ? '<button class="btn primary big" data-act="msNew">Make a new story</button>' : '<p class="muted">Your story shelf is full. Delete one to write a new one.</p>'}
    <div class="story-list">${mine.map((s, i) => `<div class="card story-card ms-row"><span class="story-art">${toySVG(art(s.toy))}</span><span><b translate="no">${esc(s.title)}</b><small>${Object.keys(s.nodes).length} pages</small>
      <span class="row"><button class="btn sm primary" data-act="msRead" data-i="${i}">Read</button><button class="btn sm" data-act="msEdit" data-i="${i}">Change</button><button class="btn sm" data-act="msDel" data-i="${i}">Delete</button></span></span></div>`).join('') || '<p class="muted">You have not written a story yet. Yours will be the first!</p>'}</div>`;
}
function editor() {
  const { out, d, from } = order(ed), n = out.length;
  const pageCard = (id, i) => {
    const nd = ed.nodes[id], src = from[id];
    return `<section class="card ms-page" style="margin-left:${Math.min(d[id], 3) * 12}px"><div class="ms-head"><button class="ms-art" data-act="msArt" data-n="${id}" aria-label="Change the picture">${toySVG(art(nd.art))}</button>
      <div><h2>Page ${i + 1}</h2>${src ? `<small class="muted">After choice ${src[1] + 1} on page ${out.indexOf(src[0]) + 1}</small>` : '<small class="muted">The story starts here</small>'}</div></div>
      <label class="sr" for="t-${id}">What happens on this page?</label><textarea id="t-${id}" data-ms="t" data-n="${id}" maxlength="300" rows="4" placeholder="What happens on this page?" translate="no">${esc(nd.t)}</textarea>
      <div class="row ms-ideas">${ideas().map((w) => `<button class="chip" data-act="msWord" data-n="${id}" data-w="${esc(w)}" translate="no">${esc(w)}</button>`).join('')}<button class="btn sm" data-act="msHear" data-n="${id}">${icon('sound')} Hear my page</button></div>
      ${nd.c ? `<p class="what">The reader can choose:</p>${[0, 1].map((k) => `<div class="ms-choice"><label class="sr" for="c${k}-${id}">Choice ${k + 1}</label><input id="c${k}-${id}" data-ms="c${k}" data-n="${id}" maxlength="40" value="${esc(nd.c[k][0])}" placeholder="Choice ${k + 1}" translate="no"><span class="pill">Goes to page ${out.indexOf(nd.c[k][1]) + 1}</span></div>`).join('')}
        <button class="btn sm" data-act="msEnd" data-n="${id}">Make this page an ending</button>`
    : `<div class="ms-choice"><label for="e-${id}">Name of this ending</label><input id="e-${id}" data-ms="end" data-n="${id}" maxlength="30" value="${esc(nd.end)}" translate="no"></div>
        ${d[id] < 3 && n + 2 <= MAX_PAGES ? `<button class="btn sm" data-act="msGrow" data-n="${id}">Add two choices here</button>` : ''}`}</section>`;
  };
  return `<button class="btn back" data-act="msCancel">${icon('back')} Stop writing</button><h1>Write your story</h1>
    <section class="card"><label for="ms-title"><b>Story name</b></label><input id="ms-title" class="ms-title" data-ms="title" maxlength="40" value="${esc(ed.title)}" placeholder="My story" translate="no">
    <p class="muted">Tap a picture to change it. Tap the word buttons to add words. A page with choices lets the reader pick what happens.</p></section>
    ${out.map(pageCard).join('')}
    <div class="row center ms-foot"><button class="btn primary big" data-act="msSave">Save and read it</button></div>`;
}
const redraw = () => { const y = window.scrollY; router.go('mystory'); window.scrollTo(0, y); };
actions.msNew = () => { const p = P(); ed = { id: 'my' + Date.now().toString(36), mine: true, title: '', toy: p.buddy, start: 'n1', seq: 1, nodes: { n1: fresh(p.buddy) } }; sfx.tap(); router.go('mystory'); };
actions.msEdit = (el) => { const s = list()[+el.dataset.i]; if (!s) return; ed = JSON.parse(JSON.stringify(s)); sfx.tap(); router.go('mystory'); };
actions.msRead = (el) => { const s = list()[+el.dataset.i]; if (s && read) read(s); };
actions.msDel = (el) => {
  if (el.dataset.sure !== '1') { el.dataset.sure = '1'; el.textContent = 'Tap again to delete'; return; }
  list().splice(+el.dataset.i, 1); save(); sfx.tap(); router.go('mystory');
};
actions.msCancel = () => { ed = null; router.go('mystory'); };
document.addEventListener('input', (e) => {
  const f = e.target.closest && e.target.closest('[data-ms]');
  if (!f || !ed) return;
  const k = f.dataset.ms, nd = ed.nodes[f.dataset.n];
  if (k === 'title') ed.title = f.value;
  else if (!nd) return;
  else if (k === 't') nd.t = f.value;
  else if (k === 'end') nd.end = f.value;
  else if (nd.c) nd.c[+k[1]][0] = f.value;
});
actions.msWord = (el) => {
  const nd = ed && ed.nodes[el.dataset.n], box = $('#t-' + el.dataset.n);
  if (!nd || !box) return;
  nd.t = (nd.t + (nd.t && !/\s$/.test(nd.t) ? ' ' : '') + el.dataset.w + ' ').slice(0, 300); box.value = nd.t; box.focus(); sfx.tap();
};
actions.msHear = (el) => {
  const nd = ed && ed.nodes[el.dataset.n];
  if (!nd || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  if (!nd.t.trim()) return toast('Write some words first, then I can read them.');
  const u = new SpeechSynthesisUtterance(nd.t); u.rate = 0.9; u.lang = lang() === 'es' ? 'es-US' : 'en-US'; speechSynthesis.speak(u);
};
actions.msArt = (el) => {
  const p = P(), ids = Object.keys(p.inv).filter((id) => TOYS[id]).sort((a, b) => TOYS[b].value - TOYS[a].value).slice(0, 80);
  modal(`<h2>Pick a picture</h2><div class="ms-pick">${ids.map((id) => `<button class="ms-art" data-act="msArtPick" data-n="${el.dataset.n}" data-id="${id}" aria-label="${esc(TOYS[id].name)}">${toySVG(id)}</button>`).join('')}</div>`, { label: 'Pick a picture', cls: 'wide' });
};
actions.msArtPick = (el) => { const nd = ed && ed.nodes[el.dataset.n]; if (nd) { nd.art = el.dataset.id; if (el.dataset.n === ed.start) ed.toy = el.dataset.id; } closeModal(); redraw(); };
actions.msGrow = (el) => {
  const nd = ed.nodes[el.dataset.n];
  if (!nd || nd.c || Object.keys(ed.nodes).length + 2 > MAX_PAGES) return;
  const a = 'n' + ++ed.seq, b = 'n' + ++ed.seq;
  ed.nodes[a] = fresh(nd.art); ed.nodes[b] = fresh(nd.art); nd.c = [['', a], ['', b]]; delete nd.end; sfx.pop(); redraw();
};
actions.msEnd = (el) => {
  const nd = ed.nodes[el.dataset.n];
  if (!nd || !nd.c) return;
  if (el.dataset.sure !== '1') { el.dataset.sure = '1'; el.textContent = 'Tap again. The pages after it will go away.'; return; }
  const kill = (id) => { const x = ed.nodes[id]; if (!x) return; (x.c || []).forEach(([, to]) => kill(to)); delete ed.nodes[id]; };
  nd.c.forEach(([, to]) => kill(to)); delete nd.c; nd.end = 'The End'; redraw();
};
actions.msSave = () => {
  const { out } = order(ed), empty = out.findIndex((id) => !ed.nodes[id].t.trim());
  if (empty >= 0) { sfx.no(); toast(`Page ${empty + 1} needs some words.`); const b = $('#t-' + out[empty]); if (b) { b.scrollIntoView({ block: 'center' }); b.focus(); } return; }
  const es = lang() === 'es';
  ed.title = ed.title.trim() || (es ? 'Mi cuento' : 'My story');
  out.forEach((id) => { const nd = ed.nodes[id]; if (nd.c) nd.c.forEach((c, k) => { c[0] = c[0].trim() || (es ? `Opción ${k + 1}` : `Choice ${k + 1}`); }); else nd.end = (nd.end || '').trim() || (es ? 'Fin' : 'The End'); });
  const all = list(), i = all.findIndex((s) => s.id === ed.id), s = ed;
  if (i >= 0) all[i] = s; else all.push(s);
  ed = null; save(); sfx.win();
  if (read) read(s);
};
