// Pretend play: the squishy basket, Which Do You Like?, Squishy Play Time and Squishy Hide and Seek.
// The last two share five little scenes. Each scene is a backdrop with things a squishy can hide behind.
import { TOYS, TOY_LIST } from './data.js';
import { toySVG, icon } from './art.js';
import { P, save, addCoins, ownedList, track } from './state.js';
import { $, esc, router, actions, sfx, coins, toast, confetti, glitterBurst } from './ui.js';

const view = () => $('#view');
const rnd = (n) => Math.floor(Math.random() * n);
const mix = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((x) => x[1]);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const K = 'stroke="#2A1846" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';

// ---------- things in a scene (each is drawn in a 100 by 100 box, standing on the bottom edge) ----------
const win = (x, y) => `<rect x="${x}" y="${y}" width="12" height="12" rx="2" fill="#FFF3B0" ${K}/>`;
const ART = {
  tree: (c = '#5DBB63') => `<rect x="43" y="58" width="14" height="42" rx="4" fill="#9A6B43" ${K}/><circle cx="50" cy="38" r="34" fill="${c}" ${K}/><circle cx="38" cy="28" r="6" fill="#fff" opacity=".35"/>`,
  bush: (c = '#6ACB78') => `<path d="M6 100c-8-30 14-44 26-34 4-22 34-22 38 0 14-8 32 6 24 34z" fill="${c}" ${K}/>`,
  rock: () => `<path d="M8 100c-6-26 10-46 30-48 22-4 50 8 54 48z" fill="#B9B4CF" ${K}/><path d="M34 70l10-6M60 80l8-4" fill="none" ${K}/>`,
  bld: (c = '#F7A8C8') => `<rect x="14" y="6" width="72" height="94" rx="6" fill="${c}" ${K}/>${[18, 38, 58].map((y) => [24, 44, 64].map((x) => win(x, y)).join('')).join('')}<rect x="42" y="78" width="16" height="22" rx="3" fill="#9A6B43" ${K}/>`,
  car: (c = '#FFD84A') => `<path d="M6 84V68q0-6 8-8l12-2 10-16q3-4 9-4h18q6 0 10 5l9 15 8 3q6 2 6 8v15z" fill="${c}" ${K}/><path d="M40 44h14v14H34zM60 44h6l8 14H60z" fill="#BFE6FF" ${K}/><circle cx="28" cy="86" r="11" fill="#2A1846"/><circle cx="74" cy="86" r="11" fill="#2A1846"/><circle cx="28" cy="86" r="4" fill="#fff"/><circle cx="74" cy="86" r="4" fill="#fff"/>`,
  mailbox: () => `<rect x="44" y="52" width="12" height="48" fill="#9A6B43" ${K}/><path d="M18 56V36q0-18 18-18h30q16 0 16 18v20z" fill="#4C8DF5" ${K}/><path d="M82 32h10V20H82" fill="#F0706E" ${K}/>`,
  fountain: () => `<path d="M8 100V82h84v18z" fill="#CFE3FF" ${K}/><rect x="44" y="50" width="12" height="32" fill="#B9B4CF" ${K}/><ellipse cx="50" cy="50" rx="26" ry="8" fill="#CFE3FF" ${K}/><path d="M50 44V22M50 22q-14 2-18 18M50 22q14 2 18 18" fill="none" stroke="#6FB7FF" stroke-width="4" stroke-linecap="round"/>`,
  bench: () => `<path d="M18 78v22M82 78v22M18 46v-8M82 46v-8" fill="none" ${K}/><rect x="8" y="44" width="84" height="12" rx="4" fill="#C98B55" ${K}/><rect x="8" y="66" width="84" height="12" rx="4" fill="#C98B55" ${K}/>`,
  barn: () => `<path d="M10 100V50l14-26h52l14 26v50z" fill="#E0564F" ${K}/><path d="M10 50h80" fill="none" ${K}/><rect x="36" y="62" width="28" height="38" fill="#fff" ${K}/><path d="M36 62l28 38M64 62L36 100" fill="none" ${K}/><rect x="42" y="32" width="16" height="12" fill="#fff" ${K}/>`,
  hay: () => `<rect x="8" y="46" width="84" height="54" rx="14" fill="#F4C95D" ${K}/><path d="M8 64h84M8 82h84M30 46v54M70 46v54" stroke="#C99A2E" stroke-width="2.5" fill="none"/>`,
  fence: () => `<path d="M4 62h92M4 84h92" stroke="#2A1846" stroke-width="10" stroke-linecap="round"/><path d="M4 62h92M4 84h92" stroke="#fff" stroke-width="5" stroke-linecap="round"/>${[10, 37, 64].map((x) => `<path d="M${x} 100V48l8-9 8 9v52z" fill="#fff" ${K}/>`).join('')}`,
  well: () => `<path d="M24 62V30M76 62V30M50 30v18" fill="none" ${K}/><rect x="20" y="62" width="60" height="38" rx="6" fill="#B9B4CF" ${K}/><path d="M14 34L50 10l36 24z" fill="#C98B55" ${K}/><rect x="43" y="46" width="14" height="12" rx="2" fill="#9A6B43" ${K}/>`,
  pumpkin: () => `<path d="M50 36q0-14 12-16" stroke="#3E8E4E" stroke-width="7" stroke-linecap="round" fill="none"/><ellipse cx="50" cy="68" rx="42" ry="32" fill="#FF9A3D" ${K}/><path d="M50 36c-14 10-14 54 0 64M50 36c14 10 14 54 0 64" fill="none" ${K}/>`,
  umbrella: () => `<path d="M50 30v70" fill="none" ${K}/><path d="M6 46q4-36 44-36t44 36q-12-8-22 0-10-8-22 0-10-8-22 0-10-8-22 0z" fill="#FF8FC0" ${K}/>`,
  castle: () => `<path d="M50 34V14l14 6-14 6" fill="#F0706E" ${K}/><path d="M14 100V52h12V42h10v10h8V34h12v18h8V42h10v10h12v48z" fill="#F2D49B" ${K}/><path d="M42 100V78q8-10 16 0v22z" fill="#C9A45F" ${K}/>`,
  boat: () => `<path d="M50 70V10" fill="none" ${K}/><path d="M50 14l32 44H50z" fill="#fff" ${K}/><path d="M46 22L22 58h24z" fill="#FFD84A" ${K}/><path d="M6 70h88L80 98H20z" fill="#C98B55" ${K}/>`,
  palm: () => `<path d="M46 100q-4-40 6-62" stroke="#2A1846" stroke-width="14" stroke-linecap="round" fill="none"/><path d="M46 100q-4-40 6-62" stroke="#C98B55" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M52 38q-26-22-46-6 24-4 46 6zM52 38q26-22 46-6-24-4-46 6zM52 38Q36 8 12 10q24 6 40 28zM52 38q16-30 40-28-24 6-40 28z" fill="#5DBB63" ${K}/>`,
  shell: () => `<path d="M50 100Q4 90 8 50q4-26 42-28 38 2 42 28 4 40-42 50z" fill="#FFC9DE" ${K}/><path d="M50 100V24M50 100L22 36M50 100l28-64M50 100L10 58M50 100l40-42" fill="none" stroke="#2A1846" stroke-width="2" stroke-linecap="round"/>`,
  ball: () => `<circle cx="50" cy="60" r="38" fill="#fff" ${K}/><path d="M50 22q-22 38 0 76-38-6-38-38t38-38z" fill="#F0706E" ${K}/><path d="M50 22q22 38 0 76 38-6 38-38T50 22z" fill="#4C8DF5" ${K}/>`,
  bucket: () => `<path d="M22 44q28-40 56 0" fill="none" ${K}/><path d="M20 44h60l-8 56H28z" fill="#FFD84A" ${K}/><ellipse cx="50" cy="44" rx="30" ry="6" fill="#F2D49B" ${K}/>`,
  sofa: () => `<path d="M16 90v10M84 90v10" fill="none" ${K}/><rect x="6" y="40" width="88" height="42" rx="14" fill="#B79CF2" ${K}/><rect x="14" y="60" width="72" height="26" rx="8" fill="#CDB8FF" ${K}/><rect x="2" y="54" width="18" height="36" rx="8" fill="#B79CF2" ${K}/><rect x="80" y="54" width="18" height="36" rx="8" fill="#B79CF2" ${K}/>`,
  bed: () => `<path d="M10 92v8M92 86v14" fill="none" ${K}/><rect x="4" y="60" width="92" height="26" rx="6" fill="#8ED3FF" ${K}/><rect x="4" y="34" width="14" height="58" rx="4" fill="#C98B55" ${K}/><rect x="20" y="48" width="26" height="16" rx="7" fill="#fff" ${K}/><path d="M46 60h50v22H46z" fill="#FF8FC0" ${K}/>`,
  lamp: () => `<path d="M50 44v50" fill="none" ${K}/><ellipse cx="50" cy="96" rx="20" ry="4" fill="#C98B55" ${K}/><path d="M28 46l8-34h28l8 34z" fill="#FFD84A" ${K}/>`,
  plant: () => `<path d="M50 70Q20 60 22 26q22 8 28 44zM50 70q30-10 28-44-22 8-28 44zM50 70q-8-30 0-56 8 26 0 56z" fill="#5DBB63" ${K}/><path d="M30 70h40l-6 30H36z" fill="#E08A5B" ${K}/>`,
  toybox: () => `<path d="M10 50l10-22h60l10 22z" fill="#FFB3D3" ${K}/><rect x="10" y="50" width="80" height="50" rx="6" fill="#FF8FC0" ${K}/><path d="M50 60l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" fill="#FFD84A" ${K}/>`,
  table: () => `<path d="M18 58v42M82 58v42" stroke="#2A1846" stroke-width="10" stroke-linecap="round"/><path d="M18 58v42M82 58v42" stroke="#C98B55" stroke-width="5" stroke-linecap="round"/><path d="M8 56h84v18q-42 12-84 0z" fill="#FFF4E4" ${K}/><rect x="6" y="46" width="88" height="12" rx="5" fill="#C98B55" ${K}/>`,
  shelf: () => `<rect x="16" y="8" width="68" height="92" rx="5" fill="#C98B55" ${K}/><path d="M16 38h68M16 68h68" fill="none" ${K}/>${[[24, 16, '#F0706E'], [34, 18, '#4C8DF5'], [44, 16, '#FFD84A'], [58, 46, '#56C3B6'], [68, 48, '#FF8FC0'], [26, 78, '#B79CF2'], [36, 76, '#F0706E']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="9" height="${y < 40 ? 38 - y : y < 70 ? 68 - y : 100 - y - 2}" fill="${c}" ${K}/>`).join('')}`,
  basket: () => `<path d="M16 52h68l-8 48H24z" fill="#F2D49B" ${K}/><path d="M22 66h56M24 80h52M36 52l4 48M64 52l-4 48M50 52v48" stroke="#C9A45F" stroke-width="2.5" fill="none"/><ellipse cx="50" cy="52" rx="34" ry="7" fill="#fff" ${K}/>`,
  lolly: (c = '#FF8FC0') => `<rect x="46" y="54" width="8" height="46" rx="3" fill="#fff" ${K}/><circle cx="50" cy="36" r="32" fill="${c}" ${K}/><path d="M30 36a20 20 0 1 1 20 20 12 12 0 1 1-12-12" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`,
  mushroom: () => `<path d="M34 60h32l6 40H28z" fill="#FFF4E4" ${K}/><path d="M4 62q4-48 46-48t46 48z" fill="#F0706E" ${K}/><circle cx="30" cy="42" r="7" fill="#fff"/><circle cx="56" cy="30" r="8" fill="#fff"/><circle cx="76" cy="48" r="6" fill="#fff"/>`,
  cupcake: () => `<path d="M18 58h64l-10 42H28z" fill="#8ED3FF" ${K}/><path d="M30 58l4 42M50 58v42M70 58l-4 42" stroke="#2A1846" stroke-width="2" fill="none"/><path d="M12 58q-4-18 14-20 2-20 24-20t24 20q18 2 14 20z" fill="#FFB3D3" ${K}/><circle cx="50" cy="14" r="8" fill="#F0706E" ${K}/>`,
  rainbow: () => `<path d="M4 100a46 46 0 0 1 92 0H82a32 32 0 0 0-64 0z" fill="#F0706E" ${K}/><path d="M18 100a32 32 0 0 1 64 0H70a20 20 0 0 0-40 0z" fill="#FFD84A" ${K}/><path d="M30 100a20 20 0 0 1 40 0H60a10 10 0 0 0-20 0z" fill="#56C3B6" ${K}/>`,
  gift: () => `<path d="M50 34Q28 8 22 26q4 10 28 8zM50 34q22-26 28-8-4 10-28 8z" fill="#FFD84A" ${K}/><rect x="12" y="46" width="76" height="54" rx="5" fill="#B79CF2" ${K}/><rect x="8" y="34" width="84" height="16" rx="5" fill="#CDB8FF" ${K}/><rect x="44" y="34" width="12" height="66" fill="#FFD84A" ${K}/>`,
  donut: () => `<circle cx="50" cy="60" r="38" fill="#F2B880" ${K}/><path d="M14 54q4-30 36-32t36 32q-6 10-14 2-8 12-18 2-10 10-18 0-10 8-22-4z" fill="#FF8FC0" ${K}/><circle cx="50" cy="58" r="11" fill="#BFF0D4" ${K}/>`,
};
// How far down its box each thing starts, so a hiding squishy peeks over the top of it.
const TOPS = { tree: 4, bush: 40, rock: 50, bld: 6, car: 36, mailbox: 18, fountain: 22, bench: 38, barn: 24, hay: 46, fence: 40, well: 10, pumpkin: 22, umbrella: 10, castle: 16, boat: 12, palm: 10, shell: 22, ball: 22, bucket: 12, sofa: 40, bed: 36, lamp: 12, plant: 16, toybox: 28, table: 46, shelf: 8, basket: 45, lolly: 4, mushroom: 14, cupcake: 8, rainbow: 54, gift: 12, donut: 22 };

// A spot is [thing, color, middle (% across), bottom (% down), width (% of the scene)].
const SCENES = {
  city: { name: 'Big City',
    back: '<rect width="800" height="500" fill="#CFEBFF"/><circle cx="690" cy="80" r="44" fill="#FFE27A"/><path d="M0 300V170h70v-50h60v80h50V90h80v110h60v-60h70v60h50V120h70v80h60v-50h70v60h60V150h70v150z" fill="#B8C6E8"/><rect y="290" width="800" height="210" fill="#C9C6D6"/><rect y="290" width="800" height="24" fill="#A8D89A"/><path d="M0 410h800" stroke="#fff" stroke-width="8" stroke-dasharray="50 40"/>',
    spots: [['bld', '#F7A8C8', 14, 62, 22], ['bld', '#8ED3FF', 86, 62, 22], ['tree', '', 36, 64, 14], ['fountain', '', 57, 70, 16], ['mailbox', '', 73, 76, 9], ['bench', '', 26, 86, 15], ['car', '#FFD84A', 50, 97, 20], ['bush', '', 82, 95, 14], ['bush', '#56C3B6', 8, 96, 12]] },
  farm: { name: 'Sunny Farm',
    back: '<rect width="800" height="500" fill="#CFEBFF"/><circle cx="110" cy="80" r="44" fill="#FFE27A"/><path d="M560 70q20-24 44 0 30-6 30 20H524q0-22 36-20z" fill="#fff"/><path d="M0 300q200-120 400-20t400-40v260H0z" fill="#B6E0A8"/><rect y="296" width="800" height="204" fill="#8FCB8A"/>',
    spots: [['barn', '', 16, 66, 26], ['tree', '', 44, 62, 15], ['well', '', 64, 68, 12], ['hay', '', 83, 70, 14], ['tree', '#3E8E4E', 95, 60, 10], ['fence', '', 35, 86, 18], ['pumpkin', '', 57, 91, 11], ['hay', '', 12, 95, 14], ['bush', '', 78, 95, 14]] },
  beach: { name: 'Sandy Beach',
    back: '<rect width="800" height="500" fill="#CFEBFF"/><circle cx="680" cy="80" r="46" fill="#FFE27A"/><rect y="200" width="800" height="120" fill="#6FC3F0"/><path d="M0 232q50-16 100 0t100 0 100 0 100 0 100 0 100 0 100 0 100 0" fill="none" stroke="#fff" stroke-width="5"/><path d="M0 306q200-30 400 0t400 0v194H0z" fill="#F7E3A7"/>',
    spots: [['palm', '', 10, 70, 20], ['boat', '', 36, 60, 18], ['umbrella', '', 60, 76, 20], ['rock', '', 88, 72, 16], ['castle', '', 30, 93, 16], ['shell', '', 49, 95, 9], ['ball', '', 70, 94, 10], ['bucket', '', 88, 95, 9], ['rock', '', 8, 97, 12]] },
  house: { name: 'Cozy House',
    back: '<rect width="800" height="500" fill="#FFE1C9"/><rect x="300" y="46" width="200" height="150" rx="10" fill="#BFE6FF" stroke="#2A1846" stroke-width="6"/><path d="M400 46v150M300 121h200" stroke="#2A1846" stroke-width="5"/><rect x="600" y="70" width="110" height="80" rx="6" fill="#FFF4E4" stroke="#2A1846" stroke-width="5"/><circle cx="655" cy="110" r="22" fill="#FF8FC0"/><rect y="300" width="800" height="200" fill="#D9B38C"/><path d="M0 300h800" stroke="#2A1846" stroke-width="5"/><ellipse cx="400" cy="430" rx="250" ry="52" fill="#F7A8C8" opacity=".7"/>',
    spots: [['shelf', '', 10, 66, 16], ['plant', '', 26, 66, 10], ['sofa', '', 48, 70, 28], ['lamp', '', 70, 66, 10], ['bed', '', 88, 72, 22], ['toybox', '', 18, 95, 14], ['table', '', 44, 97, 18], ['basket', '', 66, 95, 11], ['ball', '', 86, 96, 9]] },
  land: { name: 'Squishyland',
    back: '<rect width="800" height="500" fill="#E3D4FF"/><rect y="150" width="800" height="160" fill="#FFE6F0"/><path d="M90 60l6 14 15 2-11 10 3 15-13-8-13 8 3-15-11-10 15-2zM620 40l5 11 12 2-9 8 2 12-10-6-10 6 2-12-9-8 12-2zM380 90l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" fill="#FFF3B0"/><path d="M0 310q130-110 260-10 140-120 280 0 130-90 260 0v200H0z" fill="#FFD3E4"/><rect y="300" width="800" height="200" fill="#BFF0D4"/>',
    spots: [['lolly', '#FF8FC0', 9, 66, 14], ['cupcake', '', 29, 68, 18], ['rainbow', '', 53, 64, 26], ['mushroom', '', 77, 68, 16], ['lolly', '#8ED3FF', 93, 66, 12], ['gift', '', 16, 95, 13], ['donut', '', 40, 95, 13], ['mushroom', '', 62, 97, 11], ['bush', '#FFB3D3', 84, 95, 15]] },
};
const KEYS = Object.keys(SCENES);
const backSVG = (key) => `<svg class="pback" viewBox="0 0 800 500" preserveAspectRatio="none" aria-hidden="true">${SCENES[key].back}</svg>`;
function spotHTML(key, i, o = {}) {
  const [kind, color, cx, by, w] = SCENES[key].spots[i];
  return `<button class="spot ${o.cls || ''}" style="left:${cx - w / 2}%;top:${(by - w * 1.6).toFixed(1)}%;width:${w}%;--tw:${(1000 / w).toFixed(0)}%;--tt:${TOPS[kind]}%;z-index:${Math.round(by)}" ${o.act ? `data-act="${o.act}"` : ''} data-i="${i}" aria-label="${o.label || `Hiding place ${i + 1}`}">${o.inner || ''}<svg viewBox="0 0 100 100" aria-hidden="true">${ART[kind](color || undefined)}</svg></button>`;
}
const stageHTML = (key, spot, extra = '', cls = '') => `<div class="pstage ${cls}" id="pstage">${backSVG(key)}${SCENES[key].spots.map((_, i) => spotHTML(key, i, spot(i))).join('')}${extra}</div>`;
const scenePick = (act, cur) => `<div class="scene-pick">${KEYS.map((k) => `<button class="scene-btn" data-act="${act}" data-v="${k}" aria-pressed="${k === cur}"><span class="scene-thumb">${backSVG(k)}<svg class="scene-thing" viewBox="0 0 100 100" aria-hidden="true">${ART[SCENES[k].spots[0][0]](SCENES[k].spots[0][1] || undefined)}</svg></span><b>${SCENES[k].name}</b></button>`).join('')}</div>`;
// Squishies to play with: her own first, topped up so there are always enough.
function handful(n) {
  const mine = mix(ownedList().filter((id) => !TOYS[id].custom)), more = mix(TOY_LIST.filter((t) => !t.custom && t.r === 'c' && !mine.includes(t.id)).map((t) => t.id));
  return [...mine, ...more].slice(0, n);
}

// ================= the squishy basket =================
// Every player's toys live in a basket with their own name on it.
export function basketHTML(p = P()) {
  const all = ownedList(p), total = Object.values(p.inv).reduce((a, b) => a + b, 0);
  const top = [p.buddy, ...all.filter((id) => id !== p.buddy)].filter((id) => TOYS[id]).slice(0, 9);
  return `<button class="basket" data-act="basketShake" aria-label="Shake the basket">
    <svg class="basket-handle" viewBox="0 0 300 150" aria-hidden="true"><path d="M50 150Q50 14 150 14t100 136" fill="none" stroke="#2A1846" stroke-width="20" stroke-linecap="round"/><path d="M50 150Q50 14 150 14t100 136" fill="none" stroke="#C98B55" stroke-width="12" stroke-linecap="round"/></svg>
    <span class="basket-toys">${top.map((id, i) => `<i style="--i:${i}">${toySVG(id, id === p.buddy ? p.style : undefined)}</i>`).join('')}</span>
    <svg class="basket-body" viewBox="0 0 300 150" aria-hidden="true"><path d="M18 24h264l-26 112q-3 12-16 12H60q-13 0-16-12z" fill="#E2B26B" ${K}/><path d="M26 58h248M34 90h232M42 122h216M70 24l12 124M115 24l6 124M150 24v124M185 24l-6 124M230 24l-12 124" stroke="#B98846" stroke-width="3" fill="none"/><rect x="6" y="8" width="288" height="28" rx="14" fill="#C98B55" ${K}/></svg>
    <span class="basket-tag" translate="no">${esc(p.name)}</span></button>
    <p class="basket-count">${total === 1 ? '1 squishy inside' : `${total} squishies inside`}</p>`;
}
actions.basketShake = (el) => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); sfx.squish(); setTimeout(sfx.boing, 160); };

// ================= Which Do You Like? =================
let L = null;
export function likeScreen() { L = null; return likeHTML(); }
function likeHTML() {
  const back = `<button class="btn back" data-act="go" data-to="games">${icon('back')} Games</button>`;
  if (!L) return `${back}<h1>Which Do You Like?</h1><p class="muted">Two squishies pop up. Tap the one you like better. There is no wrong answer!</p>
    <section class="card"><h2>How many rounds?</h2><div class="like-rounds">${[5, 10, 15].map((n) => `<button class="btn primary big" data-act="likeStart" data-n="${n}">${n}</button>`).join('')}</div></section>`;
  if (L.i >= L.n) {
    const p = P(), uniq = [...new Set(L.picks)], best = Object.keys(p.likes).filter((id) => TOYS[id]).sort((a, b) => p.likes[b] - p.likes[a])[0];
    return `${back}<h1>You picked your favorites!</h1><section class="card like-end"><p class="game-say">You win ${coins(L.won)}</p>
      <div class="like-picks">${uniq.map((id) => `<span class="squish" data-squish data-toy="${id}">${toySVG(id)}</span>`).join('')}</div>
      ${best ? `<div class="like-best"><span class="squish" data-squish data-toy="${best}">${toySVG(best)}</span><p>Your number one squishy is <b>${esc(TOYS[best].name)}</b></p></div>` : ''}
      <div class="row center"><button class="btn primary big" data-act="go" data-to="like">Play again</button><button class="btn big" data-act="go" data-to="games">More games</button></div></section>`;
  }
  const [a, b] = [L.pool[L.i * 2], L.pool[L.i * 2 + 1]];
  const card = (t) => `<button class="like-card" data-act="likePick" data-id="${t.id}">${toySVG(t.id)}<b>${esc(t.name)}</b></button>`;
  return `${back}<h1>Which Do You Like?</h1><p class="pill big" id="like-round">Round ${L.i + 1} of ${L.n}</p>
    <div class="like-row">${card(a)}<span class="like-or">or</span>${card(b)}</div><p class="game-say">Tap the one you like better.</p>`;
}
const likeShow = () => { view().innerHTML = likeHTML(); window.scrollTo(0, 0); };
actions.likeStart = (el) => {
  const n = [5, 10, 15].includes(+el.dataset.n) ? +el.dataset.n : 5;
  L = { n, i: 0, pool: mix(TOY_LIST.filter((t) => !t.custom)).slice(0, n * 2), picks: [], won: 0, busy: false };
  sfx.tap(); likeShow();
};
actions.likePick = (el) => {
  if (!L || L.busy) return;
  L.busy = true;
  const p = P(), id = el.dataset.id;
  L.picks.push(id); p.likes = p.likes || {}; p.likes[id] = (p.likes[id] || 0) + 1;
  document.querySelectorAll('.like-card').forEach((c) => c.classList.add(c === el ? 'won' : 'lost'));
  sfx.boing(); setTimeout(sfx.pop, 180);
  setTimeout(() => {
    if (!L) return;
    L.i++; L.busy = false;
    if (L.i >= L.n) { L.won = L.n * 2; addCoins(L.won); track('game'); sfx.win(); confetti(30); }
    save();
    if ($('.like-row') || L.i >= L.n) likeShow();
  }, 750);
};

// ================= Squishy Play Time =================
const SAYS = ['Hello!', 'Let us play!', 'I love you!', 'I am hungry!', 'Good night!', 'Yay!', 'Let us go!', 'Thank you!', 'Come with me!', 'Surprise!'];
const MAX_ACTORS = 10;
let R = null;
export function pretendScreen() {
  const p = P(); p.play = p.play || {};
  R = { scene: KEYS.includes(p.playScene) ? p.playScene : 'city', sel: -1, say: false, tray: handful(12) };
  setTimeout(pretendWire, 0);
  return pretendHTML();
}
const actors = () => { const p = P(); return (p.play[R.scene] = (p.play[R.scene] || []).filter((a) => a && TOYS[a.id])); };
function pretendHTML() {
  const list = actors(), it = list[R.sel];
  const who = list.map((a, k) => `<span class="actor${k === R.sel ? ' sel' : ''}${a.zz ? ' asleep' : ''}" data-k="${k}" style="left:${a.x}%;top:${a.y}%;--s:${a.s || 1};--f:${a.f ? -1 : 1};z-index:${Math.round(a.y) + 1}">${a.say ? `<b class="say">${a.say}</b>` : ''}${a.zz ? '<b class="zz">z z z</b>' : ''}<i>${toySVG(a.id)}</i></span>`).join('');
  const btn = (act, label) => `<button class="btn sm" data-act="${act}">${label}</button>`;
  return `<div class="h-top"><button class="btn back" data-act="go" data-to="games">${icon('back')} Games</button><h1>Squishy Play Time</h1></div>
    ${scenePick('pScene', R.scene)}
    ${stageHTML(R.scene, () => ({ act: 'pWiggle', label: 'Wiggle' }), who, 'pretend')}
    ${it ? `<div class="p-acts"><b>${esc(TOYS[it.id].name)}</b>${R.say ? SAYS.map((s, i) => `<button class="chip" data-act="pPhrase" data-i="${i}">${s}</button>`).join('') : btn('pSay', 'Talk') + btn('pJump', 'Jump') + btn('pSpin', 'Spin') + btn('pSleep', it.zz ? 'Wake up' : 'Sleep') + btn('pBig', 'Bigger') + btn('pSmall', 'Smaller') + btn('pFlip', 'Turn around') + btn('pAway', 'Put away')}</div>`
    : `<p class="game-say">${list.length ? 'Drag a squishy to move it. Tap it to make it talk and jump.' : 'Tap a squishy to put it in the scene.'}</p>`}
    <div class="p-tray">${R.tray.map((id) => `<button class="p-toy" data-act="pAdd" data-id="${id}" aria-label="${esc(TOYS[id].name)}">${toySVG(id)}</button>`).join('')}</div>
    ${list.length ? '<div class="row center"><button class="btn sm" data-act="pClear">Put them all away</button></div>' : ''}`;
}
function pretendShow() { const y = window.scrollY; view().innerHTML = pretendHTML(); window.scrollTo(0, y); pretendWire(); }
// Drag a squishy around with a finger. A tap without a drag picks it.
function pretendWire() {
  const st = $('#pstage');
  if (!st || !R) return;
  st.onpointerdown = (e) => {
    const el = e.target.closest('.actor');
    if (!el) return;
    const k = +el.dataset.k, it = actors()[k], box = st.getBoundingClientRect(), sx = e.clientX, sy = e.clientY;
    if (!it) return;
    let moved = false;
    e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch { /* fine without it */ }
    el.onpointermove = (ev) => {
      if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 7) return;
      moved = true; el.classList.add('drag');
      it.x = +clamp(((ev.clientX - box.left) / box.width) * 100, 5, 95).toFixed(1); it.y = +clamp(((ev.clientY - box.top) / box.height) * 100 + 8, 24, 99).toFixed(1);
      el.style.left = it.x + '%'; el.style.top = it.y + '%'; el.style.zIndex = Math.round(it.y) + 1;
    };
    el.onpointerup = el.onpointercancel = () => {
      el.onpointermove = el.onpointerup = el.onpointercancel = null; el.classList.remove('drag');
      if (moved) { save(); sfx.soft(); } else { R.sel = R.sel === k ? -1 : k; R.say = false; sfx.pop(); pretendShow(); }
    };
  };
}
const picked = () => (R ? actors()[R.sel] : null);
const actorEl = () => document.querySelector(`.actor[data-k="${R.sel}"]`);
const bounce = (cls, ms) => { const el = actorEl(); if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), ms); };
actions.pScene = (el) => { if (!R || !SCENES[el.dataset.v]) return; R.scene = el.dataset.v; R.sel = -1; R.say = false; P().playScene = R.scene; save(); sfx.whoosh(); pretendShow(); };
actions.pWiggle = (el) => { el.classList.remove('wiggle'); void el.offsetWidth; el.classList.add('wiggle'); sfx.soft(); };
actions.pAdd = (el) => {
  const list = actors(), id = el.dataset.id;
  if (!R || !TOYS[id]) return;
  if (list.length >= MAX_ACTORS) return toast('The scene is full. Put one away first.');
  list.push({ id, x: 20 + rnd(60), y: 70 + rnd(26), s: 1 });
  R.sel = list.length - 1; R.say = false; save(); sfx.boing(); pretendShow();
};
actions.pSay = () => { if (picked()) { R.say = true; sfx.tap(); pretendShow(); } };
actions.pPhrase = (el) => {
  const it = picked(), s = SAYS[+el.dataset.i];
  if (!it || !s) return;
  it.say = s; it.zz = false; R.say = false; sfx.pop(); pretendShow();
  setTimeout(() => { if (it.say === s) { it.say = ''; if (R && $('#pstage.pretend')) pretendShow(); } }, 3500);
};
actions.pJump = () => { if (picked()) { bounce('jump', 700); sfx.boing(); } };
actions.pSpin = () => { if (picked()) { bounce('spin', 800); sfx.whirr(); } };
actions.pSleep = () => { const it = picked(); if (it) { it.zz = !it.zz; it.say = ''; save(); sfx.soft(); pretendShow(); } };
actions.pBig = () => { const it = picked(); if (it) { it.s = Math.min(2, (it.s || 1) + 0.25); save(); sfx.stretch(); pretendShow(); } };
actions.pSmall = () => { const it = picked(); if (it) { it.s = Math.max(0.5, (it.s || 1) - 0.25); save(); sfx.stretch(); pretendShow(); } };
actions.pFlip = () => { const it = picked(); if (it) { it.f = !it.f; save(); sfx.tap(); pretendShow(); } };
actions.pAway = () => { if (picked()) { actors().splice(R.sel, 1); R.sel = -1; save(); sfx.whoosh(); pretendShow(); } };
actions.pClear = () => { if (!R) return; P().play[R.scene] = []; R.sel = -1; save(); sfx.whoosh(); pretendShow(); };

// ================= Squishy Hide and Seek =================
// One player hides squishies behind things in a scene while the other cannot see. Then the seeker
// has one minute to find them. Works with Mochi, with a friend on this tablet, or with a friend online.
const HN = 5, HIDE_SECS = 45, SEEK_SECS = 60, BOT_LOOKS = 6, TRAP_COST = 5;
let H = null;
export const hsActive = () => !!H;
export function hsStop() { if (H) { clearInterval(H.tick); clearTimeout(H.botT); } H = null; }
export function hideScreen() {
  hsStop(); router.cleanup = hsStop;
  return `<button class="btn back" data-act="go" data-to="games">${icon('back')} Games</button><h1>Squishy Hide and Seek</h1>
    <p class="muted">Hide ${HN} squishies in a scene. Can the seeker find them all in one minute?</p>
    <div class="modes"><button class="mode" data-act="hMode" data-v="bot"><b>With Mochi</b><small>You hide, Mochi seeks. Then you swap.</small></button>
    <button class="mode" data-act="hMode" data-v="local"><b>2 players</b><small>Take turns on this screen</small></button>
    <button class="mode" data-act="modeGo" data-to="trade" data-v="online"><b>Online</b><small>Join a room, tap your friend, then tap Hide and seek</small></button></div>
    <section class="card"><h2>Cool things to try</h2><ul class="h-tips"><li>The first squishy you hide is the golden squishy. It is worth 2 points.</li><li>Hide one glitter trap. If the seeker taps it, they lose ${TRAP_COST} seconds.</li><li>The seeker gets 2 hints. A hint makes one hiding place giggle.</li></ul></section>`;
}
actions.hMode = (el) => {
  const mode = el.dataset.v === 'local' ? 'local' : 'bot';
  H = { mode, first: 'me', them: mode === 'bot' ? 'Mochi' : 'Player 2', score: { me: 0, them: 0 } };
  router.cleanup = hsStop; sfx.tap(); hRound(1);
};
// Called by the online room when two friends agree to play.
export function hsOnline(o) {
  hsStop();
  H = { mode: 'online', first: o.first === 'me' ? 'me' : 'them', them: o.name, link: o, score: { me: 0, them: 0 } };
  hRound(1);
}
const other = (w) => (w === 'me' ? 'them' : 'me');
const nameOf = (w) => (w === 'me' ? P().name : H.them);
const iAct = () => H.mode === 'local' || H.hider === 'me'; // this screen does the hiding
const hidCount = () => Object.keys(H.hid).length;
function hRound(r) {
  clearInterval(H.tick); clearTimeout(H.botT);
  Object.assign(H, { round: r, hider: r % 2 ? H.first : other(H.first), scene: '', hid: {}, trap: -1, gold: -1, take: '', found: {}, looked: {}, hints: 2, left: HIDE_SECS, paid: false, tray: handful(8), result: null });
  H.seeker = other(H.hider);
  if (H.mode === 'bot' && H.hider === 'them') { // Mochi hides
    H.scene = KEYS[rnd(KEYS.length)];
    const spots = mix(SCENES[H.scene].spots.map((_, i) => i));
    H.tray.slice(0, HN).forEach((id, k) => { H.hid[spots[k]] = id; }); H.gold = spots[0]; H.trap = spots[HN];
    return hSeek();
  }
  if (H.mode === 'online' && H.hider === 'them') { H.phase = 'dark'; hTimer(() => {}); return hDraw(); }
  H.phase = H.mode === 'local' ? 'eyes' : 'scene';
  hDraw();
}
function hTimer(onEnd) {
  clearInterval(H.tick);
  H.tick = setInterval(() => {
    if (!H || !$('.v-hide')) return hsStop();
    H.left = Math.max(0, H.left - 1);
    const t = $('#h-time'); if (t) { t.textContent = H.left; t.classList.toggle('low', H.left <= 10); }
    if (H.left <= 0) { clearInterval(H.tick); onEnd(); }
  }, 1000);
}
const hTop = (title, timed) => `<div class="h-top"><button class="btn back" data-act="hQuit">${icon('back')} Stop</button><h1>${title}</h1>${timed ? `<span class="pill big h-time${H.left <= 10 ? ' low' : ''}" id="h-time" aria-label="Seconds left">${H.left}</span>` : ''}</div>`;
const peek = (id, gold) => `<span class="peek${gold ? ' gold' : ''}">${toySVG(id)}</span>`;
const TRAP = '<span class="peek trap"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2l5 11 12 2-9 8 2 13-10-6-10 6 2-13-9-8 12-2z" fill="#FF5FA8" stroke="#2A1846" stroke-width="2.5" stroke-linejoin="round"/><circle cx="20" cy="21" r="4" fill="#FFF3B0"/></svg></span>';
function hDraw() {
  if (!H) return;
  const v = view(); v.className = 'view v-hide'; let html = '';
  if (H.phase === 'eyes') {
    html = `${hTop('Squishy Hide and Seek')}<section class="card h-card"><div class="h-big">${toySVG('sq01')}</div><h2><span translate="no">${esc(nameOf(H.seeker))}</span>, <span>close your eyes!</span></h2><p>No peeking while <span translate="no">${esc(nameOf(H.hider))}</span> hides the squishies.</p>
      <button class="btn primary big" data-act="hEyes">Eyes are closed. Go!</button></section>`;
  } else if (H.phase === 'scene') {
    html = `${hTop('Where will you hide them?')}<p class="game-say"><span translate="no">${esc(nameOf(H.hider))}</span>, <span>pick a place.</span></p>${scenePick('hScene', '')}`;
  } else if (H.phase === 'hide') {
    const n = hidCount(), used = Object.values(H.hid);
    html = `${hTop('Hide your squishies!', true)}
      <p class="game-say" id="h-say">${H.take ? 'Now tap a hiding place.' : n >= HN ? 'All hidden! Tap Done, or tap a hiding place to take one back.' : 'Tap a squishy, then tap a hiding place.'}</p>
      ${stageHTML(H.scene, (i) => ({ act: 'hSpot', cls: H.hid[i] || H.trap === i ? 'full' : '', inner: H.hid[i] ? peek(H.hid[i], H.gold === i) : H.trap === i ? TRAP : '' }))}
      <div class="h-tray">${H.tray.map((id) => `<button class="p-toy${H.take === id ? ' sel' : ''}" data-act="hTake" data-id="${id}" ${used.includes(id) || n >= HN ? 'disabled' : ''} aria-label="${esc(TOYS[id].name)}" aria-pressed="${H.take === id}">${toySVG(id)}</button>`).join('')}
        <button class="p-toy trap-btn${H.take === 'trap' ? ' sel' : ''}" data-act="hTake" data-id="trap" ${H.trap >= 0 ? 'disabled' : ''} aria-pressed="${H.take === 'trap'}">${TRAP}<small>Glitter trap</small></button></div>
      <div class="row center"><span class="pill">${n} of ${HN} hidden</span><button class="btn primary big" data-act="hDone" ${n ? '' : 'disabled'}>Done hiding!</button></div>`;
  } else if (H.phase === 'dark') {
    const wait = H.mode === 'online';
    html = `<section class="h-dark">${Array.from({ length: 14 }, (_, i) => `<button class="dstar" data-act="hStar" style="left:${6 + ((i * 37) % 88)}%;top:${8 + ((i * 53) % 78)}%;--d:${(i % 5) * 0.4}s" aria-label="Star"></button>`).join('')}
      <div class="h-dark-in"><div class="h-big">${toySVG('sq01')}</div><h1>No peeking!</h1>
      ${wait ? `<p><span translate="no">${esc(H.them)}</span> <span>is hiding the squishies.</span></p><p class="pill big h-time" id="h-time">${H.left}</p><p class="muted-light">Tap the stars while you wait.</p>`
    : `<p><span>Pass the tablet to</span> <span translate="no">${esc(nameOf(H.seeker))}</span>.</p><button class="btn primary big" data-act="hReady">I am ready to seek!</button>`}
      <button class="btn sm" data-act="hQuit">Stop</button></div></section>`;
  } else if (H.phase === 'seek' || H.phase === 'watch') {
    const seek = H.phase === 'seek', total = hidCount(), got = Object.keys(H.found).length;
    html = `${hTop(seek ? 'Find the squishies!' : 'Shh! Watch them look', seek)}
      <p class="game-say" id="h-say">${seek ? `Tap a hiding place to look behind it.` : `<span translate="no">${esc(nameOf(H.seeker))}</span> <span>is looking for your squishies.</span>`}</p>
      ${stageHTML(H.scene, (i) => ({ act: seek ? 'hSpot' : '', cls: `${H.looked[i] ? 'looked' : ''}${H.found[i] ? ' found' : ''}${!seek && (H.hid[i] || H.trap === i) ? ' full' : ''}`,
    inner: H.hid[i] && (H.found[i] || !seek) ? peek(H.hid[i], H.gold === i) : H.trap === i && (!seek || H.looked[i]) ? TRAP : '' }), '', seek ? 'seeking' : 'watching')}
      <div class="row center"><span class="pill big" id="h-got">Found ${got} of ${total}</span>${seek ? `<button class="btn" data-act="hHint" ${H.hints ? '' : 'disabled'}>Hint (${H.hints} left)</button>` : ''}</div>`;
  } else if (H.phase === 'result') {
    const r = H.result, all = r.found >= r.total;
    html = `${hTop('Squishy Hide and Seek')}<section class="card h-card"><h2>${all ? 'Found them all!' : r.found ? 'Good seeking!' : 'Great hiding!'}</h2>
      <p class="game-say"><span translate="no">${esc(nameOf(H.seeker))}</span> <span>found ${r.found} of ${r.total} squishies.</span></p>
      <div class="like-picks">${Object.keys(H.hid).map((i) => `<span class="${H.found[i] ? '' : 'missed'}${H.gold === +i ? ' gold' : ''}">${toySVG(H.hid[i])}</span>`).join('')}</div>
      ${r.gold ? '<p class="pill">The golden squishy was found! 2 points.</p>' : ''}${r.trap ? '<p class="pill">The glitter trap went off!</p>' : ''}
      <div class="vs-row"><div><b translate="no">${esc(P().name)}</b><span class="vs-n">${H.score.me}</span></div><div><b translate="no">${esc(H.them)}</b><span class="vs-n">${H.score.them}</span></div></div>
      ${r.coins ? `<p>You win ${coins(r.coins)}</p>` : ''}
      <div class="row center"><button class="btn primary big" data-act="hSwap">Swap and play again</button><button class="btn big" data-act="hQuit">All done</button></div></section>`;
  }
  v.innerHTML = html; window.scrollTo(0, 0);
}
actions.hEyes = () => { if (H && H.phase === 'eyes') { H.phase = 'scene'; sfx.tap(); hDraw(); } };
actions.hScene = (el) => {
  if (!H || H.phase !== 'scene' || !SCENES[el.dataset.v]) return;
  H.scene = el.dataset.v; H.phase = 'hide'; H.left = HIDE_SECS; sfx.whoosh(); hDraw();
  hTimer(() => { // time is up: Mochi tucks the rest away
    const free = mix(SCENES[H.scene].spots.map((_, i) => i).filter((i) => !H.hid[i] && H.trap !== i)), rest = H.tray.filter((id) => !Object.values(H.hid).includes(id));
    while (hidCount() < HN && free.length && rest.length) { const i = free.pop(); H.hid[i] = rest.pop(); if (H.gold < 0) H.gold = i; }
    hHidden();
  });
};
actions.hTake = (el) => { if (!H || H.phase !== 'hide') return; H.take = H.take === el.dataset.id ? '' : el.dataset.id; sfx.tap(); hDraw(); };
actions.hStar = (el) => { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); sfx.twinkle(); };
actions.hDone = () => { if (H && H.phase === 'hide' && hidCount()) hHidden(); };
actions.hReady = () => { if (H && H.phase === 'dark' && H.mode === 'local') hSeek(); };
function hHidden() {
  clearInterval(H.tick); H.take = '';
  if (H.gold < 0 || !H.hid[H.gold]) H.gold = +Object.keys(H.hid)[0];
  sfx.win();
  if (H.mode === 'local') { H.phase = 'dark'; return hDraw(); }
  H.phase = 'watch'; hDraw();
  if (H.mode === 'online') H.link.send({ k: 'ready', r: H.round, scene: H.scene, hid: Object.entries(H.hid).map(([i, id]) => [+i, id]), trap: H.trap, gold: H.gold });
  else hBot(BOT_LOOKS);
}
function hSeek() {
  H.phase = 'seek'; H.left = SEEK_SECS; H.found = {}; H.looked = {}; H.hints = 2; H.trapped = false;
  hDraw(); sfx.whoosh();
  hTimer(hEnd);
}
// Looking behind one hiding place. Used by a real seeker, by Mochi, and to show a far-away friend's taps.
function hLook(i, quiet) {
  if (H.looked[i]) return;
  H.looked[i] = 1;
  const el = document.querySelector(`.spot[data-i="${i}"]`), say = $('#h-say');
  if (H.hid[i]) {
    H.found[i] = 1; sfx.boing(); if (H.gold === i) { setTimeout(sfx.win, 200); confetti(14); }
    if (say && !quiet) say.textContent = H.gold === i ? 'You found the golden squishy!' : 'You found one!';
  } else if (H.trap === i) {
    H.trapped = true; sfx.bomb();
    if (el) { const b = el.getBoundingClientRect(); glitterBurst(b.left + b.width / 2, b.top + b.height / 2, 90, 1.2); }
    if (!quiet) { H.left = Math.max(1, H.left - TRAP_COST); if (say) say.textContent = `Glitter trap! You lose ${TRAP_COST} seconds.`; }
  } else { sfx.soft(); if (say && !quiet) say.textContent = 'Nobody here. Keep looking!'; }
  const keep = say ? say.textContent : '';
  hDraw();
  if (keep && !quiet && $('#h-say')) $('#h-say').textContent = keep;
  const now = document.querySelector(`.spot[data-i="${i}"]`); if (now) now.classList.add(H.hid[i] ? 'pop' : 'wiggle');
}
actions.hSpot = (el) => {
  if (!H) return;
  const i = +el.dataset.i;
  if (H.phase === 'hide') {
    if (H.hid[i]) { delete H.hid[i]; if (H.gold === i) H.gold = hidCount() ? +Object.keys(H.hid)[0] : -1; sfx.whoosh(); }
    else if (H.trap === i) { H.trap = -1; sfx.whoosh(); }
    else if (H.take === 'trap') { H.trap = i; H.take = ''; sfx.twinkle(); }
    else if (H.take && hidCount() < HN) { H.hid[i] = H.take; if (H.gold < 0) H.gold = i; H.take = ''; sfx.pop(); }
    else { sfx.no(); return toast(hidCount() >= HN ? 'They are all hidden.' : 'Tap a squishy first.', 1600); }
    return hDraw();
  }
  if (H.phase !== 'seek' || H.looked[i]) return;
  if (H.mode === 'online') H.link.send({ k: 'tap', r: H.round, i });
  hLook(i);
  if (Object.keys(H.found).length >= hidCount()) hEnd();
};
actions.hHint = () => {
  if (!H || H.phase !== 'seek' || !H.hints) return;
  const left = Object.keys(H.hid).filter((i) => !H.found[i]);
  if (!left.length) return;
  H.hints--; hDraw();
  const el = document.querySelector(`.spot[data-i="${left[rnd(left.length)]}"]`);
  if (el) el.classList.add('giggle');
  sfx.twinkle(); setTimeout(sfx.twinkle, 250);
  if ($('#h-say')) $('#h-say').textContent = 'Did you hear that giggle?';
};
// Mochi takes a few looks, one at a time.
function hBot(looks) {
  H.botT = setTimeout(() => {
    if (!H || H.phase !== 'watch') return;
    const free = SCENES[H.scene].spots.map((_, i) => i).filter((i) => !H.looked[i]);
    if (!looks || !free.length || Object.keys(H.found).length >= hidCount()) return hEnd();
    hLook(free[rnd(free.length)], true);
    hBot(looks - 1);
  }, 1500);
}
function hEnd(fromFriend) {
  if (!H || H.phase === 'result') return;
  clearInterval(H.tick); clearTimeout(H.botT);
  const total = hidCount(), found = Object.keys(H.found).length, gold = !!H.found[H.gold], mine = H.seeker === 'me' || H.mode === 'local';
  if (H.mode === 'online' && H.seeker === 'me' && !fromFriend) H.link.send({ k: 'done', r: H.round, found: Object.keys(H.found).map(Number), trap: !!H.trapped });
  H.score[H.seeker] += found + (gold ? 1 : 0); H.score[H.hider] += total - found;
  const won = H.mode === 'local' ? 10 : H.seeker === 'me' ? Math.max(5, found * 5) : 5 + (total - found) * 5;
  if (!H.paid) { H.paid = true; addCoins(won); track('game'); }
  H.result = { total, found, gold, trap: !!H.trapped, coins: won };
  H.phase = 'result'; hDraw();
  if (found >= total && mine) { confetti(50); sfx.win(); } else sfx.coin();
}
actions.hSwap = () => {
  if (!H || H.phase !== 'result') return;
  if (H.mode === 'online') H.link.send({ k: 'swap', r: H.round + 1 });
  sfx.tap(); hRound(H.round + 1);
};
actions.hQuit = () => {
  if (!H) return router.go('games');
  const link = H.link;
  if (link) link.send({ k: 'bye' });
  hsStop(); sfx.tap();
  if (link) link.exit(); else router.go('hide');
};
// Messages from a friend's device. Nothing that arrives is trusted.
export function hsMsg(m) {
  if (!H || H.mode !== 'online' || !m) return;
  if (m.k === 'bye') { const link = H.link; hsStop(); toast('Your friend stopped playing.'); return link.exit(); }
  if (m.k === 'swap') { if (H.phase === 'result' && m.r === H.round + 1) hRound(H.round + 1); return; }
  if (m.r !== H.round) return;
  if (m.k === 'ready' && H.hider === 'them' && H.phase === 'dark') {
    if (!SCENES[m.scene] || !Array.isArray(m.hid)) return;
    const n = SCENES[m.scene].spots.length, ok = (i) => Number.isInteger(i) && i >= 0 && i < n;
    H.scene = m.scene; H.hid = {};
    m.hid.slice(0, HN).forEach((x) => { if (Array.isArray(x) && ok(x[0]) && TOYS[x[1]] && !TOYS[x[1]].custom) H.hid[x[0]] = x[1]; });
    if (!hidCount()) return;
    H.trap = ok(m.trap) && !H.hid[m.trap] ? m.trap : -1; H.gold = H.hid[m.gold] ? m.gold : +Object.keys(H.hid)[0];
    return hSeek();
  }
  if (H.hider !== 'me' || H.phase !== 'watch') return;
  if (m.k === 'tap' && Number.isInteger(m.i) && m.i >= 0 && m.i < SCENES[H.scene].spots.length) return hLook(m.i, true);
  if (m.k === 'done') {
    if (Array.isArray(m.found)) m.found.forEach((i) => { if (H.hid[i]) { H.found[i] = 1; H.looked[i] = 1; } });
    H.trapped = !!m.trap; hEnd(true);
  }
}
