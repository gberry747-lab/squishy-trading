// Giant squishies: the ultimate trade. Give some toys to wake up a giant, then watch it walk
// through a tiny world. Every giant you wake up also opens its place for all your giants.
import { TOYS, RARITY } from './data.js';
import { P, save, count, removeToy, addCoins, today } from './state.js';
import { esc, actions, sfx, toast, confetti, router } from './ui.js';
import { toySVG, icon } from './art.js';

// ---------- tiny scenery, drawn in 400 x 200 tiles that repeat ----------
const K = 'stroke="#2A1846" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"';
const tile = (s) => `<svg viewBox="0 0 400 200" aria-hidden="true">${s}</svg>`;
const bld = (x, w, h, c, lit = '#FFF3B0') => {
  let s = `<rect x="${x}" y="${200 - h}" width="${w}" height="${h + 6}" rx="3" fill="${c}" ${K}/>`;
  for (let yy = 200 - h + 9; yy < 188; yy += 15) for (let xx = x + 7; xx < x + w - 9; xx += 13) s += `<rect x="${xx}" y="${yy}" width="7" height="9" rx="1.5" fill="${lit}"/>`;
  return s;
};
const house = (x, w, h, c, roof) => `<rect x="${x}" y="${200 - h}" width="${w}" height="${h + 6}" fill="${c}" ${K}/><path d="M${x - 6} ${200 - h}L${x + w / 2} ${200 - h - w * 0.55}L${x + w + 6} ${200 - h}Z" fill="${roof}" ${K}/><rect x="${x + w / 2 - 6}" y="${200 - h * 0.55}" width="12" height="${h * 0.55 + 6}" rx="2" fill="#7A4A2B"/><rect x="${x + 6}" y="${200 - h + 8}" width="10" height="10" rx="2" fill="#FFF3B0"/>`;
const tree = (x, h, c = '#4FB96B') => `<rect x="${x - 3}" y="${200 - h * 0.5}" width="6" height="${h * 0.5 + 4}" fill="#7A4A2B"/><circle cx="${x}" cy="${200 - h * 0.65}" r="${h * 0.36}" fill="${c}" ${K}/>`;
const pine = (x, h, c = '#2F8F6B') => `<rect x="${x - 3}" y="${196 - h * 0.2}" width="6" height="${h * 0.2 + 8}" fill="#7A4A2B"/><path d="M${x} ${200 - h}L${x + h * 0.32} ${200 - h * 0.5}H${x + h * 0.14}L${x + h * 0.4} ${200 - h * 0.15}H${x - h * 0.4}L${x - h * 0.14} ${200 - h * 0.5}H${x - h * 0.32}Z" fill="${c}" ${K}/>`;
const palm = (x, h) => `<path d="M${x} 204Q${x + 8} ${200 - h * 0.5} ${x + 2} ${200 - h}" fill="none" stroke="#7A4A2B" stroke-width="7" stroke-linecap="round"/>${[-150, -110, -70, -30, 10].map((a) => `<path d="M0 0Q22 -16 44 2Q22 2 0 0Z" transform="translate(${x + 2} ${200 - h}) rotate(${a})" fill="#3FA86A" ${K}/>`).join('')}`;
const peak = (x, w, h, c, snow = '#fff') => `<path d="M${x} 206L${x + w / 2} ${200 - h}L${x + w} 206Z" fill="${c}" ${K}/><path d="M${x + w / 2} ${200 - h}L${x + w * 0.62} ${200 - h * 0.74}L${x + w * 0.52} ${200 - h * 0.8}L${x + w * 0.44} ${200 - h * 0.72}L${x + w * 0.38} ${200 - h * 0.74}Z" fill="${snow}" ${K}/>`;
const pyr = (x, w, h) => `<path d="M${x} 206L${x + w / 2} ${200 - h}L${x + w} 206Z" fill="#F2C063" ${K}/><path d="M${x + w / 2} ${200 - h}L${x + w} 206H${x + w * 0.62}Z" fill="#D99A3B"/>`;
const tower = (x, w, h, c, roof) => `<rect x="${x}" y="${200 - h}" width="${w}" height="${h + 6}" fill="${c}" ${K}/><path d="M${x - 4} ${200 - h}L${x + w / 2} ${200 - h - w * 1.1}L${x + w + 4} ${200 - h}Z" fill="${roof}" ${K}/><path d="M${x + w / 2} ${200 - h - w * 1.1}v-12l12 5-12 5" fill="#FF5FA8" ${K}/><rect x="${x + w / 2 - 4}" y="${200 - h + 12}" width="8" height="13" rx="4" fill="#2A1846"/>`;
const wall = (x, w, h, c) => { let s = `<rect x="${x}" y="${200 - h}" width="${w}" height="${h + 6}" fill="${c}" ${K}/>`; for (let xx = x; xx < x + w - 6; xx += 16) s += `<rect x="${xx}" y="${200 - h - 8}" width="9" height="9" fill="${c}" ${K}/>`; return s; };
const lolli = (x, h, c) => `<rect x="${x - 2.5}" y="${200 - h}" width="5" height="${h + 4}" fill="#fff" ${K}/><circle cx="${x}" cy="${200 - h}" r="${h * 0.3}" fill="${c}" ${K}/><circle cx="${x}" cy="${200 - h}" r="${h * 0.16}" fill="none" stroke="#fff" stroke-width="4"/>`;
const hill = (x, w, h, c) => `<path d="M${x} 206Q${x + w / 2} ${200 - h * 2} ${x + w} 206Z" fill="${c}" ${K}/>`;
const boat = (x, y, c) => `<path d="M${x} ${y}h44l-8 13h-28z" fill="${c}" ${K}/><path d="M${x + 22} ${y}v-34l19 26z" fill="#fff" ${K}/>`;
const planet = (x, y, r, c, ring) => `${ring ? `<ellipse cx="${x}" cy="${y}" rx="${r * 1.7}" ry="${r * 0.42}" fill="none" stroke="${ring}" stroke-width="5"/>` : ''}<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" ${K}/><circle cx="${x - r * 0.3}" cy="${y - r * 0.25}" r="${r * 0.22}" fill="#fff" opacity=".35"/>`;
const cloud = (x, y, s = 1, c = '#fff') => `<path d="M${x} ${y}a${14 * s} ${14 * s} 0 0 1 ${24 * s} ${-10 * s}a${18 * s} ${18 * s} 0 0 1 ${34 * s} ${4 * s}a${12 * s} ${12 * s} 0 0 1 ${6 * s} ${22 * s}h${-62 * s}a${11 * s} ${11 * s} 0 0 1 ${-2 * s} ${-16 * s}z" fill="${c}"/>`;
const stars = (n, seed) => { let s = '', v = seed; for (let i = 0; i < n; i++) { v = (v * 9301 + 49297) % 233280; const x = (v / 233280) * 400; v = (v * 9301 + 49297) % 233280; s += `<circle cx="${x.toFixed(0)}" cy="${((v / 233280) * 190).toFixed(0)}" r="${1 + (i % 3) * 0.7}" fill="#fff" opacity="${0.5 + (i % 4) * 0.15}"/>`; } return s; };
const car = (x, c) => `<path d="M${x} 190v-12q0-4 4-4h8l6-10h22l8 10h8q4 0 4 4v12z" fill="${c}" ${K}/><circle cx="${x + 14}" cy="190" r="6" fill="#2A1846"/><circle cx="${x + 46}" cy="190" r="6" fill="#2A1846"/>`;
const wave = (c, y) => `<path d="M0 ${y}q25 -18 50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0V210H0z" fill="${c}" ${K}/>`;
const block = (x, s, c, y = 200) => `<rect x="${x}" y="${y - s}" width="${s}" height="${s + 4}" rx="4" fill="${c}" ${K}/><circle cx="${x + s / 2}" cy="${y - s / 2}" r="${s * 0.22}" fill="#fff" opacity=".7"/>`;
const SUN = '<circle cx="320" cy="50" r="26" fill="#FFD84A" stroke="#F5B921" stroke-width="5"/>';
const MOON = '<circle cx="320" cy="50" r="24" fill="#FFF3B0"/><circle cx="310" cy="42" r="5" fill="#F2DE8A"/><circle cx="328" cy="58" r="4" fill="#F2DE8A"/>';

const SCENES = {
  city: { name: 'Big City', sky: 'linear-gradient(#7CC8FF,#DDF3FF)', ground: 'repeating-linear-gradient(90deg,#FFE9A8 0 26px,transparent 26px 60px) 0 46%/100% 5px no-repeat,#6E7088',
    air: SUN + cloud(40, 60) + cloud(190, 100, 0.8), far: bld(10, 60, 120, '#A9C1E8', '#DCE9FF') + bld(84, 46, 170, '#9AB3DE', '#DCE9FF') + bld(146, 70, 100, '#B7CCEE', '#DCE9FF') + bld(232, 50, 150, '#A2BAE3', '#DCE9FF') + bld(298, 86, 110, '#B0C6EA', '#DCE9FF'),
    near: bld(0, 70, 130, '#FF8FC0') + bld(82, 58, 185, '#8E7BE0') + bld(152, 74, 110, '#FFB65C') + bld(238, 52, 160, '#56C3B6') + bld(302, 86, 125, '#F0706E'), front: car(40, '#FFD84A') + car(230, '#4C8DF5') },
  farm: { name: 'Sunny Farm', sky: 'linear-gradient(#8ED3FF,#E9F8D8)', ground: '#7CC46A', air: SUN + cloud(60, 50) + cloud(210, 90, 0.7),
    far: hill(-40, 240, 60, '#A6DB8E') + hill(170, 280, 75, '#95D07E'), near: house(30, 90, 90, '#E0524F', '#8C2F2D') + `<rect x="150" y="60" width="38" height="146" rx="19" fill="#D9DEE8" ${K}/>` + tree(230, 110) + tree(285, 90, '#6ACB78') + tree(350, 120),
    front: Array.from({ length: 8 }, (_, i) => `<path d="M${i * 50 + 8} 200v-26M${i * 50 + 8} 182h50" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`).join('') },
  candy: { name: 'Candy Land', sky: 'linear-gradient(#FFC2DF,#FFF0C9)', ground: '#FF9CCB', air: cloud(40, 70, 1, '#FFE6F3') + cloud(230, 50, 0.9, '#FFE6F3'),
    far: hill(-30, 220, 55, '#FFD1A6') + hill(160, 260, 70, '#C9F0DC'), near: lolli(40, 150, '#FF5FA8') + lolli(110, 105, '#56C3B6') + lolli(180, 170, '#FFB65C') + lolli(255, 120, '#8E7BE0') + lolli(330, 150, '#F0706E'),
    front: [20, 120, 210, 320].map((x, i) => `<path d="M${x} 204q20 -44 40 0z" fill="${['#8E7BE0', '#FFD84A', '#56C3B6', '#F0706E'][i]}" ${K}/>`).join('') },
  toytown: { name: 'Toy Town', sky: 'linear-gradient(#BFE6FF,#FFF4E4)', ground: '#F2C98A', air: SUN + cloud(80, 60, 0.9),
    far: house(20, 60, 60, '#FFD84A', '#F0706E') + house(140, 70, 70, '#8ED3FF', '#8E7BE0') + house(270, 64, 55, '#C6F3C0', '#56C3B6'),
    near: block(10, 60, '#F0706E') + block(22, 44, '#FFD84A', 140) + block(100, 76, '#4C8DF5') + block(196, 56, '#56C3B6') + block(206, 40, '#FF8FC0', 144) + block(280, 90, '#8E7BE0') + block(300, 46, '#FFB65C', 110),
    front: `<rect x="60" y="162" width="52" height="30" rx="6" fill="#F0706E" ${K}/><rect x="120" y="170" width="46" height="22" rx="5" fill="#4C8DF5" ${K}/><rect x="174" y="170" width="46" height="22" rx="5" fill="#FFD84A" ${K}/><rect x="70" y="148" width="14" height="16" fill="#2A1846"/>${[74, 100, 132, 156, 186, 210].map((x) => `<circle cx="${x}" cy="194" r="6" fill="#2A1846"/>`).join('')}` },
  snow: { name: 'Winter Village', sky: 'linear-gradient(#B9D6F5,#F4FAFF)', ground: '#F4FAFF', fall: 1, air: cloud(30, 50, 1.1) + cloud(220, 80, 0.9),
    far: peak(-20, 200, 110, '#C9D8EE') + peak(150, 240, 140, '#BCCDE8'), near: house(20, 70, 60, '#F0706E', '#fff') + pine(125, 120, '#3E9C86') + house(170, 80, 70, '#8E7BE0', '#fff') + pine(285, 100, '#3E9C86') + house(315, 66, 56, '#56C3B6', '#fff'),
    front: hill(-20, 180, 14, '#fff') + hill(140, 200, 18, '#fff') + hill(300, 160, 13, '#fff') },
  sea: { name: 'Deep Blue Sea', sky: 'linear-gradient(#8ED3FF,#E3F6FF)', ground: '#3B8FD9', air: SUN + cloud(50, 70) + cloud(200, 40, 0.8),
    far: hill(20, 150, 34, '#7CC46A') + `<rect x="250" y="100" width="22" height="106" fill="#fff" ${K}/><rect x="250" y="130" width="22" height="20" fill="#F0706E"/><path d="M246 100h30l-15 -22z" fill="#F0706E" ${K}/>`,
    near: wave('#5BA8EA', 176) + boat(40, 158, '#F0706E') + boat(190, 164, '#FFD84A') + boat(310, 156, '#8E7BE0'), front: wave('#3B8FD9', 150) },
  jungle: { name: 'Wild Jungle', sky: 'linear-gradient(#FFD79A,#FFF2C9)', ground: '#5DAA5A', air: SUN,
    far: `<path d="M120 206L190 70h30L290 206Z" fill="#8C6A5A" ${K}/><path d="M190 70h30l8 16q-12 8 -22 -2q-12 10 -24 2z" fill="#FF7A3D" ${K}/>` + hill(-60, 220, 50, '#7BC47A'), near: palm(40, 150) + palm(120, 110) + tree(200, 120, '#3FA86A') + palm(270, 165) + palm(350, 120),
    front: [0, 90, 190, 290].map((x) => `<path d="M${x} 206q10 -50 34 -20q16 -44 40 -4q20 -30 30 24z" fill="#2F8F4E" ${K}/>`).join('') },
  desert: { name: 'Golden Desert', sky: 'linear-gradient(#FFB65C,#FFE9B8)', ground: '#F2D08A', air: SUN, far: pyr(10, 170, 120) + pyr(150, 220, 160) + pyr(320, 120, 90),
    near: hill(-40, 240, 30, '#EBC074') + hill(180, 260, 36, '#E6B766') + [70, 250, 360].map((x) => `<path d="M${x} 204v-70M${x} 170h-16v-22M${x} 158h16v-26" fill="none" stroke="#2A1846" stroke-width="16" stroke-linecap="round"/><path d="M${x} 204v-70M${x} 170h-16v-22M${x} 158h16v-26" fill="none" stroke="#4FB96B" stroke-width="11" stroke-linecap="round"/>`).join('') },
  mountains: { name: 'Snowy Mountains', sky: 'linear-gradient(#9CC9FF,#EAF4FF)', ground: '#8FCB8A', air: cloud(30, 40) + cloud(240, 70, 0.9), far: peak(-30, 230, 180, '#9BA9D6') + peak(150, 260, 150, '#8C9BCB'),
    near: peak(-20, 190, 130, '#7E8FC4') + peak(140, 170, 100, '#8FA0D0') + peak(270, 200, 140, '#7687BD'), front: pine(30, 60) + pine(110, 44) + pine(200, 66) + pine(290, 50) + pine(370, 58) },
  castle: { name: 'Castle Kingdom', sky: 'linear-gradient(#C9B6FF,#FFE6F0)', ground: '#8FCB8A', air: cloud(60, 60, 1, '#FFF0F7') + cloud(240, 90, 0.8, '#FFF0F7'), far: hill(-40, 260, 50, '#B6E0A8') + hill(200, 260, 62, '#A8D89A'),
    near: wall(60, 280, 70, '#E8DFF5') + tower(40, 44, 120, '#D9CCF0', '#C81E7A') + tower(178, 54, 160, '#E8DFF5', '#8E7BE0') + tower(318, 44, 120, '#D9CCF0', '#C81E7A') + `<path d="M190 206v-34a15 15 0 0 1 30 0v34z" fill="#7A4A2B" ${K}/>`,
    front: tree(20, 50) + tree(380, 56, '#6ACB78') },
  space: { name: 'Outer Space', sky: 'linear-gradient(#141238,#3B2F86)', ground: '#B9B4CF', air: stars(40, 7) + planet(70, 60, 22, '#FF8FC0', '#FFD84A') + planet(300, 110, 14, '#56C3B6'),
    far: planet(200, 120, 46, '#8E7BE0') + stars(14, 3), near: hill(-40, 220, 34, '#CFCBE0') + hill(160, 280, 42, '#C4BFD9') + `<path d="M90 206v-52q0-26 16-42q16 16 16 42v52z" fill="#fff" ${K}/><circle cx="106" cy="142" r="8" fill="#8ED3FF" ${K}/><path d="M90 190l-14 16h14zM122 190l14 16h-14z" fill="#F0706E" ${K}/><path d="M300 206v-50h4l22 10-22 10" fill="#FFD84A" ${K}/>`,
    front: [40, 170, 300].map((x) => `<ellipse cx="${x + 30}" cy="192" rx="30" ry="8" fill="#9E98BA" ${K}/>`).join('') },
  night: { name: 'City at Night', sky: 'linear-gradient(#1B1A4B,#5A3F9E)', ground: 'repeating-linear-gradient(90deg,#FFE9A8 0 26px,transparent 26px 60px) 0 46%/100% 5px no-repeat,#3A3856',
    air: MOON + stars(34, 11), far: bld(10, 60, 120, '#3D3A78', '#FFE27A') + bld(84, 46, 170, '#35326C', '#FFE27A') + bld(146, 70, 100, '#44408A', '#FFE27A') + bld(232, 50, 150, '#3A3774', '#FFE27A') + bld(298, 86, 110, '#413D82', '#FFE27A'),
    near: bld(0, 70, 130, '#5B3A9E', '#FFF3B0') + bld(82, 58, 185, '#2F5FC0', '#FFF3B0') + bld(152, 74, 110, '#A8327A', '#FFF3B0') + bld(238, 52, 160, '#1F7F86', '#FFF3B0') + bld(302, 86, 125, '#6A4BC0', '#FFF3B0'), front: car(60, '#F0706E') + car(260, '#FFD84A') },
};

// need: [how many toys, the lowest rarity that counts]
const GIANTS = [
  { id: 'g1', toy: 'sq04', scene: 'city', need: [3, 'c'] }, { id: 'g2', toy: 'sq155', scene: 'farm', need: [4, 'c'] }, { id: 'g3', toy: 'sq01', scene: 'candy', need: [5, 'c'] },
  { id: 'g4', toy: 'pl02', scene: 'toytown', need: [2, 'r'] }, { id: 'g5', toy: 'pl05', scene: 'snow', need: [3, 'r'] }, { id: 'g6', toy: 'pl24', scene: 'sea', need: [4, 'r'] },
  { id: 'g7', toy: 'pl16', scene: 'jungle', need: [1, 'e'] }, { id: 'g8', toy: 'sq117', scene: 'desert', need: [2, 'e'] }, { id: 'g9', toy: 'pl04', scene: 'mountains', need: [3, 'e'] },
  { id: 'g10', toy: 'pl12', scene: 'castle', need: [4, 'e'] }, { id: 'g11', toy: 'sq190', scene: 'space', need: [1, 'l'] }, { id: 'g12', toy: 'sq23', scene: 'night', need: [2, 'l'] },
].filter((g) => TOYS[g.toy]);
const RANK = { c: 0, r: 1, e: 2, l: 3 };
const WALK_BONUS = 20;
const mine = (p = P()) => (p.giants = p.giants || {});
const byId = (id) => GIANTS.find((g) => g.id === id);
const gName = (g) => `Giant ${esc(TOYS[g.toy].name)}`;
const needText = ([n, r]) => (n === 1 ? `Give 1 ${RARITY[r].name} toy or better` : `Give ${n} ${RARITY[r].name} toys or better`);
// Every copy she could give, one card each. Her buddy's last copy and her own drawings stay safe.
function canGive(g, p = P()) {
  const out = [];
  Object.keys(p.inv).forEach((id) => {
    const t = TOYS[id];
    if (!t || t.custom || !(t.r in RANK) || RANK[t.r] < RANK[g.need[1]]) return;
    for (let i = 0, n = Math.min(count(id, p) - (p.buddy === id ? 1 : 0), g.need[0]); i < n; i++) out.push(id);
  });
  return out.sort((a, b) => TOYS[a].value - TOYS[b].value || a.localeCompare(b));
}
export const giantsReady = (p = P()) => GIANTS.filter((g) => !mine(p)[g.id] && canGive(g, p).length >= g.need[0]).length;

function sceneHTML(key, toy, o = {}) {
  const s = SCENES[key], n = o.live ? 8 : 4, row = (svg) => tile(svg).repeat(n);
  return `<div class="gscene${o.live ? ' live' : ''}${o.locked ? ' locked' : ''}" style="background:${s.sky}">
    <div class="glayer g-air"><div class="gtrack">${row(s.air || '')}</div></div>
    <div class="gground" style="background:${s.ground}"></div>
    <div class="glayer g-far"><div class="gtrack">${row(s.far)}</div></div>
    <div class="glayer g-near"><div class="gtrack">${row(s.near)}</div></div>
    ${o.live ? `<button class="giant" data-act="gStomp" aria-label="Stomp">${toySVG(toy)}</button>` : `<span class="giant">${toySVG(toy)}</span>`}
    ${s.front ? `<div class="glayer g-front"><div class="gtrack">${row(s.front)}</div></div>` : ''}
    ${s.fall && o.live ? '<div class="gsnow"></div>' : ''}</div>`;
}

let view = null; // null = the list, { trade, sel } = picking toys, { g, scene } = walking
export function giantsScreen() {
  const p = P(), own = mine(p);
  if (view && view.trade) return tradeHTML(p);
  if (view && view.g) return walkHTML(p);
  const n = GIANTS.filter((g) => own[g.id]).length;
  return `<button class="btn back" data-act="go" data-to="home">${icon('back')} Home</button><h1>Giant squishies</h1>
    <p class="muted">This is the ultimate trade! Give some of your toys to wake up a giant. Then watch it walk through a tiny world.</p>
    <p><span class="pill big">${n} of ${GIANTS.length} giants</span></p>
    <div class="giant-grid">${GIANTS.map((g) => {
    const has = own[g.id], ok = !has && canGive(g, p).length >= g.need[0];
    return `<section class="card giant-card${ok ? ' ready' : ''}">${sceneHTML(g.scene, g.toy, { locked: !has })}<h2>${gName(g)}</h2><small>${SCENES[g.scene].name}</small>
      ${has ? `<button class="btn primary" data-act="gWalk" data-id="${g.id}">Watch it walk</button>` : `<span class="pill r-${g.need[1]}">${needText(g.need)}</span><button class="btn${ok ? ' primary' : ''}" data-act="gTrade" data-id="${g.id}">${ok ? 'Make the trade' : 'See the trade'}</button>`}</section>`;
  }).join('')}</div>`;
}
function tradeHTML(p) {
  const g = byId(view.trade), list = canGive(g, p), [n] = g.need, got = view.sel.length;
  return `<button class="btn back" data-act="gBack">${icon('back')} Giants</button><h1>${gName(g)}</h1>
    <div class="giant-stage">${sceneHTML(g.scene, g.toy, { locked: true })}</div>
    <section class="card"><h2>${needText(g.need)}</h2>
    ${list.length >= n ? `<p class="muted">Tap the toys you want to give. You will not get them back, so pick ones you have extra of.</p><p><span class="pill big">${got} of ${n} picked</span></p>
      <div class="grid">${list.map((id, i) => `<button class="toy r-${TOYS[id].r}${view.sel.includes(i) ? ' sel' : ''}" data-act="gPick" data-i="${i}" aria-pressed="${view.sel.includes(i)}" aria-label="${esc(TOYS[id].name)}"><span class="toy-art">${toySVG(id)}</span><span class="toy-name">${esc(TOYS[id].name)}</span><span class="toy-rar">${RARITY[TOYS[id].r].name}</span></button>`).join('')}</div>
      <div class="row center giant-go"><button class="btn primary big" data-act="gDeal" ${got === n ? '' : 'disabled'}>Make the ultimate trade</button></div>`
    : `<p class="muted">You do not have enough of these toys yet. Open mystery bags, play games and trade with friends to find more.</p><p><span class="pill big">You have ${list.length} of ${n}</span></p>
      <div class="row"><button class="btn primary" data-act="go" data-to="shop">Go to the shop</button><button class="btn" data-act="go" data-to="trade">Go trading</button></div>`}</section>`;
}
function walkHTML(p) {
  const own = GIANTS.filter((g) => mine(p)[g.id]), g = byId(view.g);
  return `<button class="btn back" data-act="gBack">${icon('back')} Giants</button><h1>${gName(g)}</h1><p class="muted">${SCENES[view.scene].name}</p>
    <div class="giant-stage">${sceneHTML(view.scene, g.toy, { live: true })}</div>
    <div class="row center"><button class="btn primary big" data-act="gStomp">Stomp!</button></div>
    ${own.length > 1 ? `<section class="card"><h2>Pick a giant</h2><div class="row">${own.map((x) => `<button class="giant-chip" data-act="gWho" data-id="${x.id}" aria-pressed="${x.id === g.id}" aria-label="${esc(TOYS[x.toy].name)}">${toySVG(x.toy)}</button>`).join('')}</div>
      <h2>Pick a place</h2><div class="row">${own.map((x) => `<button class="chip" data-act="gWhere" data-v="${x.scene}" aria-pressed="${x.scene === view.scene}">${SCENES[x.scene].name}</button>`).join('')}</div></section>`
    : '<p class="muted">Wake up more giants to open more places to walk.</p>'}`;
}
const show = () => { const y = window.scrollY; router.go('giants'); window.scrollTo(0, y); };
function startWalk(g) {
  const p = P();
  view = { g: g.id, scene: g.scene }; router.go('giants'); window.scrollTo(0, 0);
  if (p.gwalk !== today()) { p.gwalk = today(); addCoins(WALK_BONUS); save(); sfx.coin(); toast(`Giant parade bonus! +${WALK_BONUS} coins`); }
}
actions.gTrade = (el) => { if (!byId(el.dataset.id)) return; view = { trade: el.dataset.id, sel: [] }; sfx.tap(); router.go('giants'); window.scrollTo(0, 0); };
actions.gBack = () => { view = null; sfx.tap(); router.go('giants'); };
actions.gPick = (el) => {
  if (!view || !view.trade) return;
  const i = +el.dataset.i, at = view.sel.indexOf(i), n = byId(view.trade).need[0];
  if (at >= 0) view.sel.splice(at, 1); else if (view.sel.length < n) view.sel.push(i); else { sfx.no(); return toast(`You only need ${n}. Tap one to take it back.`); }
  sfx.pop(); show();
};
actions.gDeal = (el) => {
  if (!view || !view.trade) return;
  const p = P(), g = byId(view.trade), list = canGive(g, p);
  if (view.sel.length !== g.need[0] || mine(p)[g.id]) return;
  if (el.dataset.sure !== '1') { el.dataset.sure = '1'; el.textContent = 'Tap again to trade'; return; }
  view.sel.forEach((i) => removeToy(list[i], 1, p));
  mine(p)[g.id] = 1; p.stats.giant = (p.stats.giant || 0) + 1; save();
  confetti(60); sfx.win(); setTimeout(sfx.bomb, 350);
  toast('You woke up a giant! A new place is open.', 3600);
  startWalk(g);
};
actions.gWalk = (el) => { const g = byId(el.dataset.id); if (g && mine()[g.id]) { sfx.tap(); startWalk(g); } };
actions.gWho = (el) => { const g = byId(el.dataset.id); if (g && mine()[g.id] && view && view.g) { view.g = g.id; sfx.pop(); show(); } };
actions.gWhere = (el) => { if (SCENES[el.dataset.v] && view && view.g) { view.scene = el.dataset.v; sfx.whoosh(); show(); } };
actions.gStomp = () => {
  const sc = document.querySelector('.gscene.live');
  if (!sc || sc.classList.contains('stomp')) return;
  sc.classList.add('stomp'); sfx.boing(); setTimeout(sfx.squelch, 330);
  setTimeout(() => sc.classList.remove('stomp'), 720);
};
export const giantsHome = () => { view = null; };
