// Giant squishies: the big goal of the game. Play games with your giants to win coins, give toys to wake
// the next giant up, and when all of them are awake, hold the Giant Parade.
import { TOYS, RARITY } from './data.js';
import { P, save, count, removeToy, addCoins, today, track } from './state.js';
import { esc, actions, sfx, toast, confetti, router, prize, coins } from './ui.js';
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

// need: how many toys to give to wake the giant up. The first giant is awake from the start,
// and the giants wake up in order, so there is always one clear giant to work on.
const GIANTS = [
  { id: 'g1', toy: 'sq04', scene: 'city', need: 0 }, { id: 'g2', toy: 'sq155', scene: 'farm', need: 3 }, { id: 'g3', toy: 'sq01', scene: 'candy', need: 3 },
  { id: 'g4', toy: 'pl02', scene: 'toytown', need: 4 }, { id: 'g5', toy: 'pl05', scene: 'snow', need: 4 }, { id: 'g6', toy: 'pl24', scene: 'sea', need: 5 },
  { id: 'g7', toy: 'pl16', scene: 'jungle', need: 5 }, { id: 'g8', toy: 'sq117', scene: 'desert', need: 6 }, { id: 'g9', toy: 'pl04', scene: 'mountains', need: 6 },
  { id: 'g10', toy: 'pl12', scene: 'castle', need: 7 }, { id: 'g11', toy: 'sq190', scene: 'space', need: 8 }, { id: 'g12', toy: 'sq23', scene: 'night', need: 8 },
].filter((g) => TOYS[g.toy]);
const WALK_BONUS = 20, CHAMP_COINS = 500, BAG = 40;
function mine(p = P()) { const m = (p.giants = p.giants || {}); GIANTS.forEach((g) => { if (!g.need) m[g.id] = 1; }); return m; }
const byId = (id) => GIANTS.find((g) => g.id === id);
const gName = (g) => `Giant ${esc(TOYS[g.toy].name)}`;
const awake = (p = P()) => GIANTS.filter((g) => mine(p)[g.id]);
const nextGiant = (p = P()) => GIANTS.find((g) => !mine(p)[g.id]);
const fav = (p = P()) => { const a = awake(p); return a.find((g) => g.id === p.gfav) || a[a.length - 1]; };
const needText = (n) => (n === 1 ? 'Give 1 toy' : `Give ${n} toys`);
// Every copy she could give, one card each. Her buddy's last copy and her own drawings stay safe.
function canGive(p = P()) {
  const out = [];
  Object.keys(p.inv).forEach((id) => {
    const t = TOYS[id];
    if (!t || t.custom) return;
    for (let i = 0, n = count(id, p) - (p.buddy === id ? 1 : 0); i < n; i++) out.push(id);
  });
  return out.sort((a, b) => TOYS[a].value - TOYS[b].value || a.localeCompare(b));
}
export const giantsReady = (p = P()) => { const g = nextGiant(p); return g && canGive(p).length >= g.need ? 1 : 0; };

function sceneHTML(key, toy, o = {}) {
  const s = SCENES[key], n = o.live ? 8 : 4, row = (svg) => tile(svg).repeat(n);
  return `<div class="gscene${o.live ? ' live' : ''}${o.locked ? ' locked' : ''}${o.cls ? ' ' + o.cls : ''}"${o.id ? ` id="${o.id}"` : ''}${o.act ? ` data-act="${o.act}"` : ''} style="background:${s.sky}">
    <div class="glayer g-air"><div class="gtrack">${row(s.air || '')}</div></div>
    <div class="gground" style="background:${s.ground}"></div>
    <div class="glayer g-far"><div class="gtrack">${row(s.far)}</div></div>
    <div class="glayer g-near"><div class="gtrack">${row(s.near)}</div></div>
    ${o.noGiant ? '' : o.stomp ? `<button class="giant" data-act="gStomp" aria-label="Stomp">${toySVG(toy)}</button>` : `<span class="giant">${toySVG(toy)}</span>`}
    ${o.extra || ''}
    ${s.front && !o.noFront ? `<div class="glayer g-front"><div class="gtrack">${row(s.front)}</div></div>` : ''}
    ${s.fall && o.live ? '<div class="gsnow"></div>' : ''}</div>`;
}

// ---------- the big goal ----------
const CROWN = '<svg class="crown" viewBox="0 0 48 34" aria-hidden="true"><path d="M4 30L2 8l12 9L24 3l10 14 12-9-2 22z" fill="#FFD84A" stroke="#2A1846" stroke-width="3" stroke-linejoin="round"/><circle cx="24" cy="21" r="4" fill="#FF5FA8" stroke="#2A1846" stroke-width="2"/></svg>';
function road(p) {
  const own = mine(p), n = awake(p).length;
  return `<div class="goal-road" role="img" aria-label="${n} of ${GIANTS.length} giants awake">${GIANTS.map((g) => `<i class="${own[g.id] ? 'got' : ''}">${toySVG(g.toy)}</i>`).join('')}</div><p class="goal-count">${n} of ${GIANTS.length} giants awake</p>`;
}
function nextStep(p) {
  const nx = nextGiant(p), f = fav(p), sp = canGive(p).length, play = 'data-to="giants"';
  if (p.champ) return { toy: f.toy, title: 'You are the Squishy Champion!', text: 'You woke up every giant. Now play any game you like.', btn: 'Play with my giants', act: 'go', attrs: play };
  if (!nx) return { toy: f.toy, title: 'Start the Giant Parade!', text: 'Every giant is awake. It is time for the big parade.', btn: 'Start the parade', act: 'gParade', attrs: '' };
  if (!p.stats.ggame) return { toy: f.toy, title: 'Play with your giant', text: `${gName(f)} is awake and wants to play a game with you.`, btn: 'Play now', act: 'go', attrs: play };
  if (sp >= nx.need) return { toy: nx.toy, sleep: 1, title: 'Wake up a giant!', text: `You have enough toys to wake up ${gName(nx)}.`, btn: 'Wake it up', act: 'gTrade', attrs: `data-id="${nx.id}"` };
  const more = nx.need - sp;
  if (p.coins >= BAG) return { toy: nx.toy, sleep: 1, title: 'Open a mystery bag', text: `${more === 1 ? 'You need 1 more toy' : `You need ${more} more toys`} to wake up ${gName(nx)}. Mystery bags have toys inside.`, btn: 'Go to the shop', act: 'go', attrs: 'data-to="shop"' };
  return { toy: f.toy, title: 'Win some coins', text: 'Play a giant game to win coins. Then you can buy a mystery bag.', btn: 'Play a giant game', act: 'go', attrs: play };
}
// The card at the top of the home screen: one thing to do next, and how far along the big goal is.
export function goalCard(p = P()) {
  const s = nextStep(p);
  return `<section class="card goal-card"><div class="goal-art${s.sleep ? ' sleep' : ''}">${p.champ ? CROWN : ''}${toySVG(s.toy)}</div>
    <div class="goal-main"><p class="goal-kicker">Do this next</p><h2>${s.title}</h2><p>${s.text}</p>
    <button class="btn primary big" data-act="${s.act}" ${s.attrs}>${s.btn}</button></div>
    <div class="goal-foot"><p class="goal-big">Your big goal</p><p class="goal-say">Wake up all ${GIANTS.length} giants for the Giant Parade.</p>${road(p)}</div></section>`;
}

// ---------- screens ----------
const GAMES = {
  jump: { name: 'Giant Jump', how: 'Cars are coming! Tap Jump to hop over them.', art: car(8, '#FFD84A'), total: 10 },
  stars: { name: 'Star Catch', how: 'Stars are falling! Move your giant to catch them.', art: '<path d="M40 150l8 18 20 2-15 13 5 19-18-10-18 10 5-19-15-13 20-2z" fill="#FFD84A" stroke="#2A1846" stroke-width="2" stroke-linejoin="round"/>', total: 15 },
  hide: { name: 'Hide and Seek', how: 'Your giant is hiding. Tap the wall it is behind!', art: block(14, 52, '#8E7BE0'), total: 5 },
};
const gameArt = (k) => `<svg viewBox="0 140 80 70" aria-hidden="true">${GAMES[k].art}</svg>`;
let view = null; // null = the list, { trade, sel } = giving toys, { g, scene } = walking, { pick } = one giant and its games, { game, g, scene } = a game, { parade } = the end
let run = null; // the game that is running right now
function stopGame() { if (run) { cancelAnimationFrame(run.raf); clearTimeout(run.t); run = null; } }
export function giantsScreen() {
  const p = P(), own = mine(p);
  router.cleanup = stopGame;
  if (view && view.trade) return tradeHTML(p);
  if (view && view.game) return gameHTML(p);
  if (view && view.parade) return paradeHTML(p);
  if (view && view.g) return walkHTML(p);
  if (view && view.pick) return pickHTML(byId(view.pick));
  const nx = nextGiant(p), sp = canGive(p).length, f = fav(p);
  return `<button class="btn back" data-act="go" data-to="home">${icon('back')} Home</button><h1>Giant squishies</h1>
    <section class="card goal-banner"><p class="goal-big">Your big goal</p><p class="goal-say">Wake up all ${GIANTS.length} giants for the Giant Parade.</p>${road(p)}
      ${nx ? '' : `<div class="row center"><button class="btn primary big" data-act="gParade">${p.champ ? 'Watch the Giant Parade' : 'Start the Giant Parade!'}</button></div>`}</section>
    <section class="card"><h2>Play with ${gName(f)}</h2>${gameList()}</section>
    <h2>Your giants</h2>
    <div class="giant-grid">${GIANTS.map((g) => {
    const has = own[g.id], isNext = nx && g.id === nx.id, ok = isNext && sp >= g.need;
    return `<section class="card giant-card${ok ? ' ready' : ''}${has && g.id === f.id ? ' picked' : ''}">${sceneHTML(g.scene, g.toy, { locked: !has })}<h2>${gName(g)}</h2><small>${SCENES[g.scene].name}</small>
      ${has ? `<div class="row center"><button class="btn primary" data-act="gFav" data-id="${g.id}">Play with me</button><button class="btn" data-act="gWalk" data-id="${g.id}">Watch me walk</button></div>`
    : isNext ? `<span class="pill">${needText(g.need)}</span><button class="btn${ok ? ' primary' : ''}" data-act="gTrade" data-id="${g.id}">${ok ? 'Wake it up' : 'How to wake it up'}</button>`
      : '<span class="pill">Sleeping</span>'}</section>`;
  }).join('')}</div>`;
}
function gameList() {
  return `<p class="muted">Pick a game. Every game wins coins.</p>
      <div class="gg-list">${Object.keys(GAMES).map((k) => `<button class="gg-pick" data-act="gGame" data-v="${k}">${gameArt(k)}<b>${GAMES[k].name}</b><small>${GAMES[k].how}</small></button>`).join('')}</div>`;
}
function pickHTML(g) {
  return `<button class="btn back" data-act="gBack">${icon('back')} Giants</button><h1>Play with ${gName(g)}</h1>
    <div class="giant-stage">${sceneHTML(g.scene, g.toy, { live: true, stomp: true })}</div>
    <section class="card">${gameList()}</section>`;
}
function tradeHTML(p) {
  const g = byId(view.trade), all = canGive(p), list = all.slice(0, 40), n = g.need, got = view.sel.length;
  return `<button class="btn back" data-act="gBack">${icon('back')} Giants</button><h1>Wake up ${gName(g)}</h1>
    <div class="giant-stage">${sceneHTML(g.scene, g.toy, { locked: true })}</div>
    <section class="card"><h2>${needText(n)}</h2>
    ${all.length >= n ? `<p class="muted">The giant keeps the toys you give. Tap the toys to give, or let me pick for you.</p><p><span class="pill big">${got} of ${n} picked</span></p>
      <div class="row"><button class="btn" data-act="gAuto">Pick for me</button></div>
      <div class="grid">${list.map((id, i) => `<button class="toy r-${TOYS[id].r}${view.sel.includes(i) ? ' sel' : ''}" data-act="gPick" data-i="${i}" aria-pressed="${view.sel.includes(i)}" aria-label="${esc(TOYS[id].name)}"><span class="toy-art">${toySVG(id)}</span><span class="toy-name">${esc(TOYS[id].name)}</span><span class="toy-rar">${RARITY[TOYS[id].r].name}</span></button>`).join('')}</div>
      <div class="row center giant-go"><button class="btn primary big" data-act="gDeal" ${got === n ? '' : 'disabled'}>Wake up the giant!</button></div>`
    : `<p class="muted">You do not have enough toys yet. Play giant games to win coins. Then open mystery bags to get more toys.</p><p><span class="pill big">You have ${all.length} of ${n}</span></p>
      <div class="row"><button class="btn primary" data-act="gBack">Play a giant game</button><button class="btn" data-act="go" data-to="shop">Go to the shop</button></div>`}</section>`;
}
const chips = (p, g) => { const own = awake(p); return own.length > 1 ? `<section class="card"><h2>Pick a giant</h2><div class="row">${own.map((x) => `<button class="giant-chip" data-act="gWho" data-id="${x.id}" aria-pressed="${x.id === g.id}" aria-label="${esc(TOYS[x.toy].name)}">${toySVG(x.toy)}</button>`).join('')}</div>` : ''; };
function walkHTML(p) {
  const own = awake(p), g = byId(view.g);
  return `<button class="btn back" data-act="gBack">${icon('back')} Giants</button><h1>${gName(g)}</h1><p class="muted">${SCENES[view.scene].name}</p>
    <div class="giant-stage">${sceneHTML(view.scene, g.toy, { live: true, stomp: true })}</div>
    <div class="row center"><button class="btn primary big" data-act="gStomp">Stomp!</button><button class="btn big" data-act="gBack">Play a game</button></div>
    ${own.length > 1 ? `${chips(p, g)}<h2>Pick a place</h2><div class="row">${own.map((x) => `<button class="chip" data-act="gWhere" data-v="${x.scene}" aria-pressed="${x.scene === view.scene}">${SCENES[x.scene].name}</button>`).join('')}</div></section>`
    : '<p class="muted">Wake up more giants to open more places to walk.</p>'}`;
}
const WALLS = ['#FF8FC0', '#8E7BE0', '#FFB65C', '#56C3B6'];
function gameHTML(p) {
  const g = byId(view.g), k = view.game, G = GAMES[k], own = awake(p);
  const extra = k === 'hide' ? WALLS.map((c, i) => `<button class="gwall" data-act="ggSpot" data-i="${i}" style="left:${i * 25}%;background-color:${c}" aria-label="Wall ${i + 1}"></button>`).join('') : '';
  return `<button class="btn back" data-act="gBack">${icon('back')} Giants</button><h1>${G.name}</h1><p class="gg-how" id="gg-how">${G.how}</p>
    <div class="giant-stage gg-stage"><div class="gg-hud"><span class="pill big" id="gg-score">0 of ${G.total}</span></div>
      ${sceneHTML(view.scene, g.toy, { live: k === 'jump', cls: 'play g-' + k, id: 'gg-scene', act: k === 'jump' ? 'ggJump' : '', extra, noFront: true })}
      <button class="btn primary big gg-start" id="gg-start" data-act="ggStart">${view.played ? 'Play again' : 'Start!'}</button></div>
    ${k === 'jump' ? '<div class="row center"><button class="btn primary big gg-btn" data-act="ggJump">Jump!</button></div>' : ''}
    ${k === 'stars' ? `<div class="row center"><button class="btn primary big gg-btn" data-act="ggMove" data-v="-1" aria-label="Move left">${icon('back')}</button><button class="btn primary big gg-btn flip" data-act="ggMove" data-v="1" aria-label="Move right">${icon('back')}</button></div><p class="muted center">Or slide your finger on the picture.</p>` : ''}
    ${own.length > 1 ? `${chips(p, g)}</section>` : ''}`;
}
function paradeHTML(p) {
  const marchers = `<div class="gparade">${GIANTS.map((g, i) => `<span style="animation-delay:${(-i * 0.17).toFixed(2)}s">${toySVG(g.toy)}</span>`).join('')}</div>`;
  return `<button class="btn back" data-act="gBack">${icon('back')} Giants</button><h1>The Giant Parade</h1>
    <div class="giant-stage">${sceneHTML('castle', '', { live: true, noGiant: true, cls: 'parade', extra: marchers })}</div>
    <section class="card champ">${CROWN}<h2>You are the Squishy Champion!</h2><p>You woke up every giant. They are all marching for you, ${esc(p.name)}!</p>
    <div class="row center"><button class="btn primary big" data-act="gBack">Play with my giants</button><button class="btn" data-act="go" data-to="home">Home</button></div></section>`;
}
const show = () => { const y = window.scrollY; router.go('giants'); window.scrollTo(0, y); };
function startWalk(g) {
  const p = P();
  view = { g: g.id, scene: g.scene }; router.go('giants'); window.scrollTo(0, 0);
  if (p.gwalk !== today()) { p.gwalk = today(); addCoins(WALK_BONUS); save(); sfx.coin(); toast(`Giant parade bonus! +${WALK_BONUS} coins`); }
}
actions.gTrade = (el) => { const g = byId(el.dataset.id); if (!g || mine()[g.id]) return; view = { trade: g.id, sel: [] }; sfx.tap(); router.go('giants'); window.scrollTo(0, 0); };
actions.gBack = () => { view = null; sfx.tap(); router.go('giants'); };
actions.gPick = (el) => {
  if (!view || !view.trade) return;
  const i = +el.dataset.i, at = view.sel.indexOf(i), n = byId(view.trade).need;
  if (at >= 0) view.sel.splice(at, 1); else if (view.sel.length < n) view.sel.push(i); else { sfx.no(); return toast(`You only need ${n}. Tap one to take it back.`); }
  sfx.pop(); show();
};
actions.gAuto = () => { if (!view || !view.trade) return; view.sel = Array.from({ length: byId(view.trade).need }, (_, i) => i); sfx.pop(); show(); };
actions.gDeal = (el) => {
  if (!view || !view.trade) return;
  const p = P(), g = byId(view.trade), list = canGive(p);
  if (view.sel.length !== g.need || mine(p)[g.id]) return;
  if (el.dataset.sure !== '1') { el.dataset.sure = '1'; el.textContent = 'Tap again to give the toys'; return; }
  view.sel.forEach((i) => removeToy(list[i], 1, p));
  mine(p)[g.id] = 1; p.gfav = g.id; p.stats.giant = (p.stats.giant || 0) + 1; save();
  confetti(60); sfx.win(); setTimeout(sfx.bomb, 350);
  toast('You woke up a giant! A new place is open.', 3600);
  startWalk(g);
};
actions.gWalk = (el) => { const g = byId(el.dataset.id); if (g && mine()[g.id]) { sfx.tap(); startWalk(g); } };
// "Play with me" on a giant's card opens that giant with its three games, so the tap always goes somewhere.
actions.gFav = (el) => { const g = byId(el.dataset.id); if (!g || !mine()[g.id]) return; P().gfav = g.id; save(); sfx.pop(); view = { pick: g.id }; router.go('giants'); window.scrollTo(0, 0); };
actions.gWho = (el) => {
  const g = byId(el.dataset.id);
  if (!g || !mine()[g.id] || !view || !view.g) return;
  view.g = g.id; if (view.game) { view.scene = g.scene; P().gfav = g.id; save(); }
  sfx.pop(); show();
};
actions.gWhere = (el) => { if (SCENES[el.dataset.v] && view && view.g) { view.scene = el.dataset.v; sfx.whoosh(); show(); } };
actions.gStomp = () => {
  const sc = document.querySelector('.gscene.live');
  if (!sc || sc.classList.contains('stomp')) return;
  sc.classList.add('stomp'); sfx.boing(); setTimeout(sfx.squelch, 330);
  setTimeout(() => sc.classList.remove('stomp'), 720);
};
actions.gParade = () => {
  const p = P();
  if (nextGiant(p)) return;
  view = { parade: 1 }; router.go('giants'); window.scrollTo(0, 0); confetti(90); sfx.win();
  if (!p.champ) { p.champ = today(); addCoins(CHAMP_COINS); save(); prize('Squishy Champion!', `<p>You woke up every giant and finished the big goal. You win the champion crown and ${coins(CHAMP_COINS)}!</p>`); }
};

// ---------- giant games ----------
actions.gGame = (el) => { const k = el.dataset.v, g = fav(); if (!GAMES[k]) return; view = { game: k, g: g.id, scene: g.scene }; sfx.tap(); router.go('giants'); window.scrollTo(0, 0); };
const scn = () => document.getElementById('gg-scene');
const setScore = () => { const e = document.getElementById('gg-score'); if (e && run) e.textContent = `${run.hit} of ${run.total}`; };
const tell = (t) => { const e = document.getElementById('gg-how'); if (e) e.textContent = t; };
function finish() {
  const r = run, p = P();
  if (!r) return;
  stopGame(); if (view) view.played = 1;
  const won = r.kind === 'jump' ? 10 + r.hit * 2 : r.kind === 'stars' ? 8 + Math.round(r.hit * 1.5) : 10 + r.hit * 4;
  addCoins(won); track('game'); p.stats.ggame = (p.stats.ggame || 0) + 1; save();
  sfx.win(); confetti(30); show();
  const line = r.kind === 'jump' ? `You jumped over ${r.hit} of ${r.total} cars.` : r.kind === 'stars' ? `You caught ${r.hit} of ${r.total} stars.` : `You found your giant ${r.hit} of ${r.total} times on the first try.`;
  prize(r.hit >= r.total ? 'Perfect game!' : 'Great game!', `<p>${line} You win ${coins(won)}.</p>`);
}
actions.ggStart = () => {
  const sc = scn(), k = view && view.game;
  if (!sc || !k || run) return;
  document.getElementById('gg-start').hidden = true; sfx.whoosh();
  run = { kind: k, total: GAMES[k].total, hit: 0, n: 0, last: performance.now() };
  setScore();
  if (k === 'jump') { run.jumpAt = -9999; loop(jumpFrame); }
  if (k === 'stars') {
    run.gx = 50; run.stars = []; run.next = 0;
    sc.onpointerdown = sc.onpointermove = (e) => { if (!run || (e.type === 'pointermove' && e.pointerType === 'mouse' && !e.buttons)) return; const b = sc.getBoundingClientRect(); moveTo(((e.clientX - b.left) / b.width) * 100); };
    loop(starFrame);
  }
  if (k === 'hide') { run.round = 0; hideRound(); }
};
function loop(frame) {
  const step = (t) => { if (!run || !scn()) return stopGame(); const dt = Math.min(0.05, (t - run.last) / 1000); run.last = t; frame(dt, t); if (run) run.raf = requestAnimationFrame(step); };
  run.raf = requestAnimationFrame(step);
}
// Giant Jump: one car at a time. In the air when it arrives = jumped it. On the ground = squished it flat.
function jumpFrame(dt, t) {
  const sc = scn();
  if (!run.ob) {
    if (run.n >= run.total) return finish();
    const el = document.createElement('span');
    el.className = 'gob'; el.innerHTML = `<svg viewBox="0 150 72 50" aria-hidden="true">${car(4, ['#FFD84A', '#4C8DF5', '#F0706E', '#56C3B6'][run.n % 4])}</svg>`;
    sc.append(el); run.ob = { el, x: 108, done: false }; run.n++;
  }
  const o = run.ob;
  o.x -= (46 + run.n * 2.5) * dt; o.el.style.left = o.x + '%';
  if (!o.done && o.x <= 26) {
    o.done = true;
    const air = t - run.jumpAt;
    if (air > 60 && air < 760) { run.hit++; setScore(); sfx.pop(); tell('Nice jump!'); }
    else { o.el.classList.add('flat'); sc.classList.add('bonk'); setTimeout(() => sc.classList.remove('bonk'), 420); sfx.squelch(); tell('Squish! Jump a little sooner.'); }
  }
  if (o.x < -16) { o.el.remove(); run.ob = null; }
}
actions.ggJump = () => {
  const sc = scn(), t = performance.now();
  if (!run || run.kind !== 'jump' || !sc || t - run.jumpAt < 820) return;
  run.jumpAt = t; sc.classList.add('up'); sfx.boing(); setTimeout(() => sc.classList.remove('up'), 800);
};
// Star Catch: nothing to lose. Stars that land just fade away.
function moveTo(x) { if (!run || run.kind !== 'stars') return; run.gx = Math.max(14, Math.min(86, x)); scn().style.setProperty('--gx', run.gx + '%'); }
actions.ggMove = (el) => { if (run && run.kind === 'stars') moveTo(run.gx + 14 * +el.dataset.v); };
function starFrame(dt, t) {
  const sc = scn();
  if (run.n < run.total && t >= run.next) {
    const el = document.createElement('span');
    el.className = 'gstar'; el.innerHTML = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" fill="#FFD84A" stroke="#2A1846" stroke-width="2.5" stroke-linejoin="round"/></svg>';
    const s = { el, x: 12 + Math.random() * 76, y: -12, v: 34 + run.n * 1.4 };
    el.style.left = s.x + '%'; sc.append(el); run.stars.push(s); run.n++; run.next = t + 1050 - run.n * 20;
  }
  run.stars = run.stars.filter((s) => {
    s.y += s.v * dt; s.el.style.top = s.y + '%';
    if (s.y > 38 && s.y < 66 && Math.abs(s.x - run.gx) < 15) { s.el.remove(); run.hit++; setScore(); sfx.coin(); return false; }
    if (s.y > 84) { s.el.remove(); return false; }
    return true;
  });
  if (run.n >= run.total && !run.stars.length) finish();
}
// Hide and Seek: the giant is too big to hide well, so its ears stick up over one wall.
function hideRound() {
  const sc = scn();
  if (!run || !sc) return;
  if (run.round >= run.total) return finish();
  const peek = [20, 17, 14, 11, 9][run.round];
  let spot = Math.floor(Math.random() * 4);
  if (spot === run.spot) spot = (spot + 1) % 4;
  run.spot = spot; run.tried = false; run.open = false;
  sc.classList.remove('found'); sc.style.setProperty('--gy', '-70%'); tell('Where is your giant hiding?');
  run.t = setTimeout(() => { if (!run) return; sc.style.setProperty('--gx', spot * 25 + 12.5 + '%'); run.t = setTimeout(() => { if (!run) return; sc.style.setProperty('--gy', peek - 2 + '%'); run.open = true; }, 260); }, 420);
}
actions.ggSpot = (el) => {
  const sc = scn();
  if (!run || run.kind !== 'hide' || !run.open || !sc) return;
  if (+el.dataset.i !== run.spot) { run.tried = true; sfx.no(); el.classList.add('nope'); setTimeout(() => el.classList.remove('nope'), 450); return tell('Not there. Look over the walls!'); }
  run.open = false; if (!run.tried) run.hit++;
  run.round++; setScore(); sfx.boing(); sc.classList.add('found'); sc.style.setProperty('--gy', '34%'); tell('You found me!');
  run.t = setTimeout(hideRound, 1100);
};
export const giantsHome = () => { view = null; };
