// Draws every toy as an SVG, from its shape, colours and effect.
import { TOYS } from './data.js';

export const COL = {
  pink: '#FF8FC0', rose: '#F4A6B4', peach: '#FFC59E', cream: '#FFE9C4', tan: '#E8B878', choc: '#8A5A3C',
  red: '#F0524F', orange: '#FF9A3D', yellow: '#FFD84A', gold: '#F5B921', lime: '#9BD84A', mint: '#9DE7C5',
  teal: '#2CB5AC', sky: '#8ED3FF', blue: '#4C8DF5', lilac: '#C9A8FF', grape: '#7E57C9', white: '#FFFDF8',
  gray: '#B9BEC9', navy: '#34406B',
};
const INK = '#2A1846';
const RAINBOW = ['#F0524F', '#FF9A3D', '#FFD84A', '#9BD84A', '#8ED3FF', '#C9A8FF'];
let uid = 0;

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(f > 0 ? c + (255 - c) * f : c * (1 + f)));
  return '#' + ch.map((c) => c.toString(16).padStart(2, '0')).join('');
}
function isDark(hex) {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) < 140;
}

function paint(t) {
  const base = COL[t.c1] || COL.pink;
  const P = { base, fill: base, dark: shade(base, -0.22), light: shade(base, 0.45), c2: COL[t.c2] || shade(base, 0.5), defs: '', darkFace: isDark(base) };
  if (t.fx === 'rainbow') {
    const id = 'rb' + ++uid;
    P.defs = `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">${RAINBOW.map((c, i) => `<stop offset="${i / 5}" stop-color="${c}"/>`).join('')}</linearGradient>`;
    P.fill = `url(#${id})`; P.dark = '#C9569B'; P.darkFace = false;
  } else if (t.fx === 'galaxy') {
    const id = 'gx' + ++uid;
    P.defs = `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2B2A7A"/><stop offset=".55" stop-color="#7E57C9"/><stop offset="1" stop-color="#F06FB4"/></linearGradient>`;
    P.fill = `url(#${id})`; P.dark = '#22205E'; P.darkFace = true;
  }
  return P;
}

const star4 = (x, y, r, c = '#fff') =>
  `<path d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z" fill="${c}"/>`;

function sparkles(t) {
  if (t.fx === 'glitter' || t.v === 'bomb') {
    // Lots of tiny specks that twinkle, plus a few big sparkles.
    const cols = ['#fff', '#FFF3B0', '#FFD1EC', '#BDEBFF', '#D9C4FF'];
    let s = '';
    for (let i = 0; i < 18; i++) { const a = i * 2.39996 + 0.6, r = 6 + Math.sqrt(i / 18) * 22; s += `<circle class="gl" style="animation-delay:${(i * 0.13 % 1.7).toFixed(2)}s" cx="${(50 + r * Math.cos(a)).toFixed(1)}" cy="${(59 + r * 0.85 * Math.sin(a)).toFixed(1)}" r="${i % 3 ? 1.1 : 1.7}" fill="${cols[i % 5]}"/>`; }
    const big = (x, y, r, c, d) => `<g class="gl" style="animation-delay:${d}s">${star4(x, y, r, c)}</g>`;
    if (t.fx === 'galaxy' || t.fx === 'rainbow') return s + big(26, 32, 5, '#fff', 0.2) + big(78, 46, 4, '#fff', 0.9);
    return s + big(24, 30, 6, '#fff', 0) + big(78, 44, 5, '#fff', 0.5) + big(66, 20, 4, '#fff', 1.1) + big(30, 72, 3.5, '#fff', 0.8) + big(82, 76, 4, '#FFF3B0', 1.4);
  }
  if (t.fx === 'galaxy') return star4(28, 34, 4) + star4(74, 30, 3) + star4(80, 66, 4) + `<circle cx="40" cy="74" r="1.3" fill="#fff"/><circle cx="62" cy="46" r="1.2" fill="#fff"/><circle cx="22" cy="58" r="1" fill="#fff"/>`;
  if (t.fx === 'glow') return `<circle cx="50" cy="54" r="46" fill="#D8FF7A" opacity=".28"/>`;
  return '';
}

function face(cx, cy, s = 1, dark = false, wide = 9) {
  const e = dark ? '#fff' : INK;
  const eye = (x) => `<ellipse cx="${x}" cy="${cy}" rx="${2.7 * s}" ry="${3.3 * s}" fill="${e}"/>` +
    (dark ? '' : `<circle cx="${x - 0.8 * s}" cy="${cy - 1.2 * s}" r="${1 * s}" fill="#fff"/>`);
  return eye(cx - wide * s) + eye(cx + wide * s) +
    `<path d="M${cx - 3 * s} ${cy + 3.5 * s}q${3 * s} ${3.2 * s} ${6 * s} 0" fill="none" stroke="${e}" stroke-width="${1.5 * s}" stroke-linecap="round"/>` +
    `<circle cx="${cx - (wide + 6) * s}" cy="${cy + 4.5 * s}" r="${3.2 * s}" fill="#FF5F9E" opacity=".45"/><circle cx="${cx + (wide + 6) * s}" cy="${cy + 4.5 * s}" r="${3.2 * s}" fill="#FF5F9E" opacity=".45"/>`;
}
const shine = (x, y, rx = 9, ry = 5, rot = -25) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".4" transform="rotate(${rot} ${x} ${y})"/>`;
const ground = (rx = 30) => `<ellipse cx="50" cy="93" rx="${rx}" ry="5" fill="${INK}" opacity=".26" filter="url(#toy-soft)"/>`;

function squishy(t, P) {
  const f = P.fill, d = P.dark, dk = P.darkFace;
  const body = `<ellipse cx="50" cy="61" rx="34" ry="27" fill="${f}"/>`;
  switch (t.v) {
    case 'cat':
      return `<path d="M22 46L25 22L44 36ZM78 46L75 22L56 36Z" fill="${f}" stroke="${f}" stroke-width="5" stroke-linejoin="round"/>${body}${shine(34, 46)}${face(50, 62, 1, dk)}<path d="M20 64h9M20 69h8M71 64h9M72 69h8" stroke="${dk ? '#fff' : INK}" stroke-width="1" stroke-linecap="round" opacity=".5"/>`;
    case 'bear':
      return `<circle cx="25" cy="38" r="11" fill="${f}"/><circle cx="75" cy="38" r="11" fill="${f}"/><circle cx="25" cy="38" r="5.5" fill="${d}"/><circle cx="75" cy="38" r="5.5" fill="${d}"/>${body}${shine(36, 46)}<ellipse cx="50" cy="67" rx="9" ry="6.5" fill="#fff" opacity=".6"/>${face(50, 61, 1, dk)}`;
    case 'bunny':
      return `<ellipse cx="37" cy="27" rx="8" ry="20" fill="${f}" transform="rotate(-9 37 27)"/><ellipse cx="63" cy="27" rx="8" ry="20" fill="${f}" transform="rotate(9 63 27)"/><ellipse cx="37" cy="28" rx="3.5" ry="13" fill="#FF9CC4" transform="rotate(-9 37 28)"/><ellipse cx="63" cy="28" rx="3.5" ry="13" fill="#FF9CC4" transform="rotate(9 63 28)"/><ellipse cx="50" cy="64" rx="32" ry="25" fill="${f}"/>${shine(34, 52)}${face(50, 65, 1, dk)}`;
    case 'frog':
      return `<circle cx="33" cy="38" r="12" fill="${f}"/><circle cx="67" cy="38" r="12" fill="${f}"/>${body}<circle cx="33" cy="37" r="7" fill="#fff"/><circle cx="67" cy="37" r="7" fill="#fff"/><circle cx="34" cy="38" r="3.6" fill="${INK}"/><circle cx="66" cy="38" r="3.6" fill="${INK}"/><path d="M38 64q12 9 24 0" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/><circle cx="28" cy="64" r="4" fill="#FF5F9E" opacity=".45"/><circle cx="72" cy="64" r="4" fill="#FF5F9E" opacity=".45"/>`;
    case 'cloud':
      return `<circle cx="30" cy="62" r="19" fill="${f}"/><circle cx="50" cy="48" r="23" fill="${f}"/><circle cx="71" cy="62" r="18" fill="${f}"/><rect x="28" y="60" width="44" height="21" rx="10" fill="${f}"/>${shine(40, 36)}${face(50, 63, 1, dk)}`;
    case 'star':
      return `<path d="M50 22L59 44L82 46L64 61L70 84L50 71L30 84L36 61L18 46L41 44Z" fill="${f}" stroke="${f}" stroke-width="11" stroke-linejoin="round"/>${shine(40, 36, 6, 3.5)}${face(50, 55, 0.9, dk)}`;
    case 'heart':
      return `<path d="M50 88C8 62 12 24 33 24C44 24 50 33 50 39C50 33 56 24 67 24C88 24 92 62 50 88Z" fill="${f}"/>${shine(30, 38, 7, 4)}${face(50, 52, 1, dk)}`;
    case 'donut':
      return `<circle cx="50" cy="56" r="22" fill="none" stroke="${f}" stroke-width="27"/><circle cx="50" cy="56" r="22" fill="none" stroke="${P.c2}" stroke-width="17"/><path d="M34 40l4 3M60 36l3 -4M70 50l5 1M28 58l-4 3M68 68l4 3M44 76l-2 4" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M48 34l4 -1M76 60l1 4M30 70l3 3" stroke="#FFD84A" stroke-width="2.4" stroke-linecap="round"/>${face(50, 78, 0.6, isDark(P.c2))}`;
    case 'berry':
      return `<path d="M50 92C22 82 14 54 23 40C31 28 69 28 77 40C86 54 78 82 50 92Z" fill="${f}"/><path d="M50 36L35 25L46 28L50 16L54 28L65 25Z" fill="#5DBB4A" stroke="#5DBB4A" stroke-width="4" stroke-linejoin="round"/><g fill="#FFF3B0"><ellipse cx="30" cy="50" rx="1.5" ry="2.3"/><ellipse cx="70" cy="50" rx="1.5" ry="2.3"/><ellipse cx="50" cy="46" rx="1.5" ry="2.3"/><ellipse cx="36" cy="76" rx="1.5" ry="2.3"/><ellipse cx="64" cy="76" rx="1.5" ry="2.3"/><ellipse cx="50" cy="82" rx="1.5" ry="2.3"/></g>${shine(32, 44, 6, 3.5)}${face(50, 60, 1, dk)}`;
    case 'drop':
      return `<path d="M50 12C50 12 19 50 19 63A31 31 0 0 0 81 63C81 50 50 12 50 12Z" fill="${f}"/>${shine(36, 50, 5, 9, 25)}${face(50, 66, 1, dk)}`;
    case 'bun':
      return `<path d="M13 73Q14 34 50 34Q86 34 87 73Q50 90 13 73Z" fill="${f}"/><path d="M38 37q4 6 2 12M50 34q0 7 0 13M62 37q-4 6 -2 12" fill="none" stroke="${d}" stroke-width="2" stroke-linecap="round"/>${shine(28, 54, 6, 3.5)}${face(50, 65, 1, dk)}`;
    case 'toast':
      return `<path d="M22 42Q20 24 38 27Q50 18 62 27Q80 24 78 42L76 84Q50 90 24 84Z" fill="${f}" stroke="${P.c2}" stroke-width="5" stroke-linejoin="round"/><rect x="42" y="36" width="16" height="9" rx="3" fill="#FFD84A"/>${face(50, 62, 1, false)}`;
    case 'egg':
      return `<path d="M16 62C10 44 26 30 42 34C56 22 84 30 84 52C96 66 82 86 62 82C46 94 20 84 16 62Z" fill="${f}" stroke="${shade(P.base, -0.1)}" stroke-width="1.5"/><circle cx="50" cy="58" r="18" fill="${P.c2}"/>${shine(42, 48, 5, 3)}${face(50, 59, 0.75, false)}`;
    case 'unicorn':
      return `<path d="M50 4L43 34L57 34Z" fill="#F5B921"/><path d="M46 22l8 -3M45 28l10 -3" stroke="#fff" stroke-width="1.5"/><path d="M22 46L25 24L44 36ZM78 46L75 24L56 36Z" fill="${f}" stroke="${f}" stroke-width="5" stroke-linejoin="round"/>${body}<path d="M70 40q14 4 12 20q-8 -6 -14 -8Z" fill="${P.c2}"/><path d="M76 50q10 6 6 20q-6 -8 -10 -10Z" fill="#C9A8FF"/>${shine(34, 46)}${face(48, 62, 1, dk)}`;
    case 'dino':
      return `<path d="M26 44l7 -14l7 11l7 -16l7 16l7 -11l7 14Z" fill="${d}" stroke="${d}" stroke-width="3" stroke-linejoin="round"/>${body}<circle cx="34" cy="76" r="3" fill="${d}" opacity=".5"/><circle cx="68" cy="50" r="3" fill="${d}" opacity=".5"/><circle cx="74" cy="72" r="2.4" fill="${d}" opacity=".5"/>${shine(34, 48)}${face(50, 62, 1, dk)}`;
    case 'icecream':
      return `<path d="M31 56L50 95L69 56Z" fill="#E8B878" stroke="#C9924E" stroke-width="2" stroke-linejoin="round"/><path d="M38 62l18 22M48 60l14 16M62 62l-18 22M52 60l-14 16" stroke="#C9924E" stroke-width="1.2"/><circle cx="50" cy="40" r="25" fill="${f}"/><path d="M27 50q6 10 12 2q5 9 11 1q6 9 12 -1q5 8 11 -2" fill="${f}" stroke="${f}" stroke-width="5" stroke-linejoin="round"/><circle cx="50" cy="13" r="5" fill="#F0524F"/>${shine(38, 26, 7, 4)}${face(50, 40, 0.9, dk)}`;
    case 'cupcake':
      return `<path d="M26 60L32 93L68 93L74 60Z" fill="${P.c2}"/><path d="M36 62l2 30M46 62l1 30M56 62l-1 30M65 62l-3 30" stroke="#fff" stroke-width="2" opacity=".6"/><ellipse cx="50" cy="56" rx="29" ry="12" fill="${f}"/><ellipse cx="50" cy="43" rx="22" ry="11" fill="${f}"/><ellipse cx="50" cy="31" rx="14" ry="9" fill="${f}"/><circle cx="50" cy="19" r="5.5" fill="#F0524F"/>${shine(38, 36, 6, 3)}${face(50, 50, 0.75, dk)}`;
    case 'avocado':
      return `<path d="M50 9C34 9 31 30 26 48C20 70 32 93 50 93C68 93 80 70 74 48C69 30 66 9 50 9Z" fill="#4E9A3E"/><path d="M50 17C38 17 36 34 32 50C28 68 36 86 50 86C64 86 72 68 68 50C64 34 62 17 50 17Z" fill="#DDF2A6"/><circle cx="50" cy="64" r="14" fill="#8A5A3C"/>${shine(44, 57, 4, 2.4)}${face(50, 64, 0.6, true)}`;
    case 'octopus': {
      let legs = '';
      [22, 36, 50, 64, 78].forEach((x) => { legs += `<rect x="${x - 7}" y="58" width="14" height="28" rx="7" fill="${f}"/>`; });
      return `${legs}<circle cx="50" cy="44" r="30" fill="${f}"/><circle cx="26" cy="30" r="2.5" fill="#fff" opacity=".6"/>${shine(36, 28)}${face(50, 50, 1, dk)}`;
    }
    case 'mushroom':
      return `<path d="M35 58Q32 91 50 91Q68 91 65 58Z" fill="#FFE9C4"/><path d="M9 58Q11 16 50 16Q89 16 91 58Q50 68 9 58Z" fill="${f}"/><circle cx="32" cy="38" r="7" fill="#fff"/><circle cx="56" cy="30" r="6" fill="#fff"/><circle cx="74" cy="46" r="5.5" fill="#fff"/><circle cx="46" cy="50" r="4" fill="#fff"/>${face(50, 74, 0.7, false)}`;
    case 'whale':
    case 'narwhal':
      return `${t.v === 'narwhal' ? '<path d="M30 36L17 6L40 30Z" fill="#F5B921"/><path d="M25 22l8 -3M29 30l9 -4" stroke="#fff" stroke-width="1.5"/>' : '<path d="M46 28q-6 -12 -14 -9M50 28q4 -14 13 -10" stroke="#5DB7F0" stroke-width="3.5" fill="none" stroke-linecap="round"/>'}<path d="M82 54L95 38Q99 50 93 57Q99 64 94 74L82 62Z" fill="${f}" stroke="${f}" stroke-width="3" stroke-linejoin="round"/><path d="M11 58C11 38 30 30 50 30C74 30 87 44 87 60C87 76 70 85 50 85C28 85 11 76 11 58Z" fill="${f}"/><path d="M15 68Q50 92 85 66Q72 85 50 85Q26 85 15 68Z" fill="#fff" opacity=".65"/>${shine(34, 42)}${face(40, 58, 0.95, dk)}`;
    case 'boba':
      return `<rect x="52" y="4" width="8" height="30" rx="3" fill="#FF8FC0" transform="rotate(12 56 19)"/><path d="M25 34L31 90Q32 95 38 95L62 95Q68 95 69 90L75 34Z" fill="${f}"/><path d="M25 34L31 90Q32 95 38 95L62 95Q68 95 69 90L75 34" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/><g fill="#5B3A29"><circle cx="38" cy="86" r="4.5"/><circle cx="49" cy="88" r="4.5"/><circle cx="60" cy="86" r="4.5"/><circle cx="43" cy="78" r="4.5"/><circle cx="55" cy="78" r="4.5"/></g><rect x="21" y="27" width="58" height="10" rx="5" fill="${d}"/>${face(50, 58, 0.85, dk)}`;
    case 'ghost':
      return `<path d="M22 56C22 30 34 16 50 16C66 16 78 30 78 56L78 90L69 82L60 90L50 82L40 90L31 82L22 90Z" fill="${f}" stroke="${d}" stroke-width="1.5" stroke-linejoin="round"/>${shine(36, 30)}${face(50, 50, 1, dk)}`;
    case 'chick':
      return `<path d="M44 30q-2 -12 4 -10q2 -8 6 0q6 -2 2 10Z" fill="${f}"/><ellipse cx="20" cy="62" rx="8" ry="12" fill="${d}" transform="rotate(20 20 62)"/><ellipse cx="80" cy="62" rx="8" ry="12" fill="${d}" transform="rotate(-20 80 62)"/><path d="M40 88l-4 6M44 88v6M56 88v6M60 88l4 6" stroke="#FF9A3D" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="58" r="31" fill="${f}"/>${shine(36, 40)}${face(50, 54, 1, dk)}<path d="M44 59L56 59L50 67Z" fill="#FF9A3D" stroke="#FF9A3D" stroke-width="2" stroke-linejoin="round"/>`;
    case 'melon':
      return `<path d="M8 36A42 42 0 0 0 92 36Z" fill="#4E9A3E" transform="translate(0 6)"/><path d="M14 36A36 36 0 0 0 86 36Z" fill="#E9F7C8" transform="translate(0 6)"/><path d="M18 36A32 32 0 0 0 82 36Z" fill="${f}" transform="translate(0 6)"/><g fill="${INK}"><ellipse cx="30" cy="50" rx="1.6" ry="2.6"/><ellipse cx="70" cy="50" rx="1.6" ry="2.6"/><ellipse cx="40" cy="66" rx="1.6" ry="2.6"/><ellipse cx="60" cy="66" rx="1.6" ry="2.6"/></g>${face(50, 54, 0.85, dk)}`;
    case 'cactus':
      return `<path d="M34 56H25Q18 56 18 48V40" stroke="${f}" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M66 48H75Q82 48 82 40V32" stroke="${f}" stroke-width="12" fill="none" stroke-linecap="round"/><rect x="33" y="16" width="34" height="66" rx="17" fill="${f}"/><path d="M42 24v8M58 26v8M50 62v8M40 66v6M60 66v6" stroke="${d}" stroke-width="1.6" stroke-linecap="round"/><circle cx="50" cy="14" r="6.5" fill="#FF8FC0"/><circle cx="50" cy="14" r="2.5" fill="#FFD84A"/><path d="M29 76L33 94L67 94L71 76Z" fill="#E08A5B"/><rect x="26" y="72" width="48" height="8" rx="4" fill="#C9703F"/>${face(50, 46, 0.8, dk)}`;
    case 'pizza':
      return `<path d="M50 94L13 28Q50 12 87 28Z" fill="${f}" stroke="${f}" stroke-width="4" stroke-linejoin="round"/><path d="M12 28Q50 8 88 28" stroke="#D99A4E" stroke-width="12" stroke-linecap="round" fill="none"/><circle cx="34" cy="42" r="5.5" fill="#E2483F"/><circle cx="64" cy="44" r="5.5" fill="#E2483F"/><circle cx="50" cy="76" r="4.5" fill="#E2483F"/><circle cx="50" cy="38" r="2" fill="#5DBB4A"/>${face(50, 57, 0.8, false)}`;
    case 'sushi':
      return `<circle cx="50" cy="56" r="36" fill="#2F3B35"/><circle cx="50" cy="56" r="29" fill="${f}"/><circle cx="45" cy="42" r="8" fill="${P.c2}"/><circle cx="57" cy="44" r="5" fill="#5DBB4A"/><circle cx="52" cy="36" r="3.5" fill="#FFD84A"/>${face(50, 64, 0.85, false)}`;
    case 'bee':
      return `<path d="M50 30q-6 -12 -14 -12M54 30q6 -12 14 -10" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="38" cy="34" rx="11" ry="15" fill="#fff" stroke="#BFE3FF" stroke-width="2" transform="rotate(-24 38 34)"/><ellipse cx="62" cy="33" rx="11" ry="15" fill="#fff" stroke="#BFE3FF" stroke-width="2" transform="rotate(20 62 33)"/><path d="M82 62l10 3l-9 5Z" fill="${INK}"/><ellipse cx="50" cy="62" rx="33" ry="26" fill="${f}"/><path d="M60 37q8 25 0 50M72 43q6 19 0 38" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>${shine(32, 48, 6, 3.5)}${face(38, 62, 0.85, false, 8)}`;
    case 'ladybug':
      return `<path d="M42 26q-4 -12 -12 -12M58 26q4 -12 12 -12" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="50" cy="32" r="15" fill="${INK}"/><circle cx="50" cy="60" r="32" fill="${f}"/><path d="M50 76V92" stroke="${INK}" stroke-width="2.5"/><g fill="${INK}"><circle cx="30" cy="52" r="5.5"/><circle cx="70" cy="52" r="5.5"/><circle cx="34" cy="76" r="4.5"/><circle cx="66" cy="76" r="4.5"/><circle cx="50" cy="40" r="4"/></g>${shine(34, 40, 6, 3.5)}${face(50, 60, 0.9, dk)}`;
    case 'turtle':
      return `<circle cx="22" cy="80" r="9" fill="${shade(P.base, 0.25)}"/><circle cx="78" cy="80" r="9" fill="${shade(P.base, 0.25)}"/><ellipse cx="50" cy="48" rx="36" ry="32" fill="${d}"/><path d="M50 18L66 30L62 50L38 50L34 30ZM34 30L16 40M66 30L84 40M38 50L26 68M62 50L74 68" fill="none" stroke="${shade(P.base, 0.2)}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="50" cy="70" r="21" fill="${shade(P.base, 0.25)}"/>${shine(42, 58, 5, 3)}${face(50, 70, 0.85, false)}`;
    case 'pig':
      return `<path d="M24 44L22 24L42 34ZM76 44L78 24L58 34Z" fill="${d}" stroke="${d}" stroke-width="5" stroke-linejoin="round"/>${body}${shine(34, 46)}${face(50, 58, 1, dk)}<ellipse cx="50" cy="69" rx="12" ry="8.5" fill="${d}"/><ellipse cx="46" cy="69" rx="2" ry="3" fill="${INK}" opacity=".6"/><ellipse cx="54" cy="69" rx="2" ry="3" fill="${INK}" opacity=".6"/>`;
    case 'moon':
      return `<path d="M64 12A42 42 0 1 0 88 74A34 34 0 1 1 64 12Z" fill="${f}"/>${star4(78, 36, 7, '#FFF3B0')}${star4(88, 54, 4, '#FFF3B0')}${shine(26, 40, 5, 9, 20)}${face(38, 60, 0.75, dk)}`;
    case 'sun': {
      let rays = '';
      for (let i = 0; i < 10; i++) rays += `<path d="M50 12L43 28L57 28Z" fill="#FF9A3D" stroke="#FF9A3D" stroke-width="3" stroke-linejoin="round" transform="rotate(${i * 36} 50 54)"/>`;
      return `${rays}<circle cx="50" cy="54" r="27" fill="${f}"/>${shine(40, 40, 6, 3.5)}${face(50, 55, 0.95, dk)}`;
    }
    case 'planet':
      return `<ellipse cx="50" cy="58" rx="45" ry="12" fill="none" stroke="${P.c2}" stroke-width="5" transform="rotate(-16 50 58)"/><circle cx="50" cy="54" r="27" fill="${f}"/><path d="M30 44q20 -8 40 0" stroke="#fff" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/>${face(50, 48, 0.85, dk)}<path d="M5 58A45 12 0 0 0 95 58" fill="none" stroke="${P.c2}" stroke-width="5" stroke-linecap="round" transform="rotate(-16 50 58)"/>`;
    case 'pumpkin':
      return `<path d="M47 30q-2 -12 6 -16l5 4q-5 4 -4 12Z" fill="#5DBB4A"/><ellipse cx="30" cy="62" rx="20" ry="27" fill="${d}"/><ellipse cx="70" cy="62" rx="20" ry="27" fill="${d}"/><ellipse cx="50" cy="62" rx="24" ry="30" fill="${f}"/>${shine(40, 42, 6, 3.5)}${face(50, 63, 1, dk)}`;
    case 'snowman':
      return `<circle cx="50" cy="70" r="25" fill="${f}" stroke="${d}" stroke-width="1.5"/><circle cx="50" cy="36" r="19" fill="${f}" stroke="${d}" stroke-width="1.5"/><rect x="33" y="50" width="34" height="8" rx="4" fill="#F0524F"/><rect x="58" y="52" width="8" height="18" rx="4" fill="#F0524F"/><rect x="36" y="6" width="28" height="16" rx="3" fill="${INK}"/><rect x="29" y="19" width="42" height="6" rx="3" fill="${INK}"/><circle cx="50" cy="68" r="2.4" fill="${INK}"/><circle cx="50" cy="78" r="2.4" fill="${INK}"/>${face(50, 35, 0.7, false)}<path d="M50 36l10 2.5l-10 2.5Z" fill="#FF9A3D" stroke="#FF9A3D" stroke-width="1.5" stroke-linejoin="round"/>`;
    case 'cherry':
      return `<path d="M32 50Q36 26 58 14M68 54Q66 30 58 14" fill="none" stroke="#5DBB4A" stroke-width="3.5" stroke-linecap="round"/><path d="M58 14q14 -8 24 2q-12 8 -24 -2Z" fill="#5DBB4A"/><circle cx="32" cy="68" r="20" fill="${f}"/><circle cx="70" cy="72" r="19" fill="${f}"/>${shine(24, 58, 5, 3)}${shine(62, 62, 5, 3)}${face(32, 69, 0.6, dk, 8)}${face(70, 73, 0.6, dk, 8)}`;
    case 'capy':
      return `<circle cx="29" cy="34" r="7" fill="${d}"/><circle cx="71" cy="34" r="7" fill="${d}"/><ellipse cx="50" cy="66" rx="35" ry="24" fill="${f}"/><rect x="24" y="30" width="52" height="46" rx="22" fill="${f}"/><circle cx="50" cy="24" r="7.5" fill="#FF9A3D"/><path d="M50 17q5 -7 10 -3q-4 5 -10 3Z" fill="#5DBB4A"/><circle cx="36" cy="50" r="2.6" fill="${INK}"/><circle cx="64" cy="50" r="2.6" fill="${INK}"/><ellipse cx="50" cy="62" rx="13" ry="8" fill="${d}"/><circle cx="45.5" cy="61" r="1.6" fill="${INK}"/><circle cx="54.5" cy="61" r="1.6" fill="${INK}"/><path d="M47 66q3 2.5 6 0" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/><circle cx="29" cy="60" r="3.4" fill="#FF5F9E" opacity=".4"/><circle cx="71" cy="60" r="3.4" fill="#FF5F9E" opacity=".4"/>${shine(36, 40, 6, 3.5)}`;
    case 'duck':
      return `<path d="M46 30q-3 -11 3 -10q3 -6 6 2q5 0 1 8Z" fill="${f}"/><ellipse cx="20" cy="64" rx="8" ry="13" fill="${d}" transform="rotate(18 20 64)"/><ellipse cx="80" cy="64" rx="8" ry="13" fill="${d}" transform="rotate(-18 80 64)"/><ellipse cx="40" cy="91" rx="8" ry="4" fill="#FF9A3D"/><ellipse cx="60" cy="91" rx="8" ry="4" fill="#FF9A3D"/><circle cx="50" cy="60" r="31" fill="${f}"/>${shine(36, 42)}${face(50, 54, 1, dk)}<ellipse cx="50" cy="63" rx="11" ry="5.5" fill="#FF9A3D"/><path d="M41 63h18" stroke="#D9731E" stroke-width="1.2"/>`;
    case 'penguin':
      return `<ellipse cx="18" cy="62" rx="7" ry="16" fill="${f}" transform="rotate(16 18 62)"/><ellipse cx="82" cy="62" rx="7" ry="16" fill="${f}" transform="rotate(-16 82 62)"/><ellipse cx="40" cy="92" rx="9" ry="4.5" fill="#FF9A3D"/><ellipse cx="60" cy="92" rx="9" ry="4.5" fill="#FF9A3D"/><ellipse cx="50" cy="58" rx="31" ry="35" fill="${f}"/><path d="M28 56Q28 36 40 36Q50 36 50 42Q50 36 60 36Q72 36 72 56Q72 86 50 86Q28 86 28 56Z" fill="#fff"/>${face(50, 54, 0.95, false)}<path d="M45 58L55 58L50 64Z" fill="#FF9A3D" stroke="#FF9A3D" stroke-width="2" stroke-linejoin="round"/>`;
    case 'clover':
      return `<path d="M50 70Q54 86 64 92" fill="none" stroke="${d}" stroke-width="5" stroke-linecap="round"/><circle cx="35" cy="40" r="18" fill="${f}"/><circle cx="65" cy="40" r="18" fill="${f}"/><circle cx="35" cy="66" r="18" fill="${f}"/><circle cx="65" cy="66" r="18" fill="${f}"/><circle cx="50" cy="53" r="14" fill="${f}"/>${shine(30, 32, 6, 3.5)}${face(50, 54, 0.9, dk)}`;
    case 'butterfly':
      return `<path d="M46 26q-6 -14 -14 -12M54 26q6 -14 14 -12" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><ellipse cx="28" cy="42" rx="22" ry="20" fill="${f}"/><ellipse cx="72" cy="42" rx="22" ry="20" fill="${f}"/><ellipse cx="32" cy="72" rx="16" ry="14" fill="${P.c2}"/><ellipse cx="68" cy="72" rx="16" ry="14" fill="${P.c2}"/><circle cx="26" cy="42" r="7" fill="#fff" opacity=".6"/><circle cx="74" cy="42" r="7" fill="#fff" opacity=".6"/><ellipse cx="50" cy="56" rx="12" ry="26" fill="${d}"/>${face(50, 48, 0.55, isDark(P.base), 8)}`;
    case 'marsh':
      return `<rect x="21" y="30" width="58" height="58" rx="18" fill="${f}" stroke="${d}" stroke-width="1.5"/><ellipse cx="50" cy="36" rx="27" ry="9" fill="#fff" stroke="${d}" stroke-width="1"/>${shine(32, 50, 5, 9, 10)}${face(50, 64, 1, false)}`;
    case 'milk':
      return `<rect x="56" y="4" width="6" height="22" rx="3" fill="${f}" transform="rotate(14 59 15)"/><path d="M26 38L50 18L74 38Z" fill="#fff" stroke="#DCE1EA" stroke-width="1.5" stroke-linejoin="round"/><rect x="43" y="12" width="14" height="9" rx="2" fill="#DCE1EA"/><rect x="26" y="37" width="48" height="54" rx="6" fill="#fff" stroke="#DCE1EA" stroke-width="1.5"/><rect x="26" y="50" width="48" height="28" fill="${f}"/>${face(50, 62, 0.9, isDark(P.base))}`;
    case 'axo':
      return `<g fill="${P.c2}" stroke="${d}" stroke-width="1.2"><ellipse cx="14" cy="42" rx="12" ry="5" transform="rotate(28 14 42)"/><ellipse cx="9" cy="56" rx="12" ry="5"/><ellipse cx="14" cy="70" rx="12" ry="5" transform="rotate(-28 14 70)"/><ellipse cx="86" cy="42" rx="12" ry="5" transform="rotate(-28 86 42)"/><ellipse cx="91" cy="56" rx="12" ry="5"/><ellipse cx="86" cy="70" rx="12" ry="5" transform="rotate(28 86 70)"/></g><ellipse cx="50" cy="58" rx="33" ry="29" fill="${f}"/><circle cx="34" cy="74" r="1.6" fill="${d}"/><circle cx="66" cy="74" r="1.6" fill="${d}"/><circle cx="50" cy="38" r="1.6" fill="${d}"/>${shine(36, 42)}${face(50, 58, 1, dk, 12)}`;
    case 'hedgehog':
      return `<path d="M11 72L15 52L22 60L24 40L32 50L36 30L44 42L50 24L56 42L64 30L68 50L76 40L78 60L85 52L89 72Q89 90 50 90Q11 90 11 72Z" fill="${P.c2}" stroke="${P.c2}" stroke-width="4" stroke-linejoin="round"/><circle cx="28" cy="52" r="6" fill="${f}"/><circle cx="72" cy="52" r="6" fill="${f}"/><ellipse cx="50" cy="70" rx="26" ry="20" fill="${f}"/>${face(50, 66, 0.8, false)}<ellipse cx="50" cy="70" rx="3" ry="2.2" fill="${INK}"/>`;
    case 'jelly':
      return `<g fill="none" stroke="${f}" stroke-width="5.5" stroke-linecap="round" opacity=".85"><path d="M30 60q-6 10 0 18t0 14"/><path d="M43 62q6 10 0 18t0 12"/><path d="M57 62q-6 10 0 18t0 12"/><path d="M70 60q6 10 0 18t0 14"/></g><path d="M15 54Q15 16 50 16Q85 16 85 54Q85 63 77 60Q70 67 62 60Q56 67 50 60Q44 67 38 60Q30 67 23 60Q15 63 15 54Z" fill="${f}"/>${shine(34, 30, 9, 5)}${face(50, 44, 0.9, dk)}`;
    case 'seal':
      return `<path d="M84 60q10 -2 12 -12q4 16 -6 28Z" fill="${d}"/><path d="M9 70Q11 38 44 38Q78 38 90 64Q92 82 62 88Q30 92 16 84Q9 80 9 70Z" fill="${f}"/><ellipse cx="60" cy="82" rx="12" ry="5" fill="${d}" transform="rotate(-12 60 82)"/><ellipse cx="34" cy="74" rx="16" ry="9" fill="#fff" opacity=".45"/>${shine(30, 48, 7, 4)}${face(34, 62, 0.75, dk, 10)}<ellipse cx="34" cy="66" rx="2.6" ry="2" fill="${INK}"/><path d="M22 68h-9M22 71l-8 3M46 68h9M46 71l8 3" stroke="${INK}" stroke-width="1" stroke-linecap="round" opacity=".5"/>`;
    case 'macaron':
      return `<path d="M15 50Q15 22 50 22Q85 22 85 50Z" fill="${f}"/><path d="M15 66Q15 90 50 90Q85 90 85 66Z" fill="${f}"/><rect x="12" y="46" width="76" height="9" rx="4.5" fill="${d}"/><rect x="12" y="61" width="76" height="9" rx="4.5" fill="${d}"/><rect x="16" y="53" width="68" height="10" rx="5" fill="#FFF8E8"/>${shine(34, 32, 8, 4)}${face(50, 38, 0.75, dk)}`;
    case 'popsicle':
      return `<rect x="45" y="68" width="10" height="28" rx="4" fill="#E8B878"/><path d="M26 34Q26 10 50 10Q74 10 74 34L74 44L26 44Z" fill="${f}"/><path d="M26 44L74 44L74 62Q74 76 60 76L40 76Q26 76 26 62Z" fill="${P.c2}"/><rect x="34" y="18" width="7" height="24" rx="3.5" fill="#fff" opacity=".45"/>${face(50, 50, 0.85, false)}`;
    case 'lollipop':
      return `<rect x="47" y="60" width="6" height="36" rx="3" fill="#FFFDF8" stroke="#DCE1EA" stroke-width="1"/><circle cx="50" cy="38" r="31" fill="${f}"/><path d="M50 38c5 -3 9 4 3 8c-9 5 -17 -6 -9 -15c10 -10 27 0 21 16c-7 17 -33 14 -35 -6c-1 -18 20 -30 36 -18" fill="none" stroke="${P.c2}" stroke-width="5.5" stroke-linecap="round" opacity=".9"/>${shine(32, 22, 8, 4)}`;
    case 'candy':
      return `<path d="M30 56L6 38Q12 56 6 74Z" fill="${P.light}" stroke="${d}" stroke-width="1.5" stroke-linejoin="round"/><path d="M70 56L94 38Q88 56 94 74Z" fill="${P.light}" stroke="${d}" stroke-width="1.5" stroke-linejoin="round"/><ellipse cx="50" cy="56" rx="27" ry="22" fill="${f}"/><path d="M34 40q-6 16 0 32M66 40q6 16 0 32" fill="none" stroke="#fff" stroke-width="4" opacity=".5" stroke-linecap="round"/>${shine(40, 42, 6, 3.5)}${face(50, 57, 0.8, dk)}`;
    case 'rainbowarc':
      return `<g fill="none" stroke-linecap="round">${RAINBOW.slice(0, 5).map((c, i) => `<path d="M${14 + i * 7} 76A${36 - i * 7} ${36 - i * 7} 0 0 1 ${86 - i * 7} 76" stroke="${c}" stroke-width="7.5"/>`).join('')}</g><g fill="#fff" stroke="#DCE1EA" stroke-width="1"><circle cx="16" cy="78" r="10"/><circle cx="28" cy="74" r="12"/><circle cx="40" cy="80" r="9"/><circle cx="62" cy="80" r="9"/><circle cx="74" cy="74" r="12"/><circle cx="86" cy="78" r="10"/></g><rect x="12" y="78" width="32" height="10" rx="5" fill="#fff"/><rect x="58" y="78" width="32" height="10" rx="5" fill="#fff"/>${face(28, 77, 0.45, false, 8)}${face(74, 77, 0.45, false, 8)}`;
    case 'apple':
      return `<path d="M50 34q0 -12 6 -18" fill="none" stroke="#6B4027" stroke-width="4" stroke-linecap="round"/><path d="M56 22q12 -10 22 -2q-10 10 -22 2Z" fill="#5DBB4A"/><path d="M50 34Q28 20 17 44Q9 72 34 89Q50 95 66 89Q91 72 83 44Q72 20 50 34Z" fill="${f}"/>${shine(32, 46, 6, 9, 20)}${face(50, 63, 1, dk)}`;
    case 'bomb':
      return `<path d="M52 22q4 -12 15 -9" fill="none" stroke="#C9924E" stroke-width="3" stroke-linecap="round"/>${star4(69, 11, 8, '#FFD84A')}${star4(69, 11, 4, '#FF9A3D')}<rect x="42" y="18" width="16" height="12" rx="4" fill="#8E96A8"/><circle cx="50" cy="60" r="33" fill="${f}"/>${shine(36, 42, 9, 5)}${face(50, 62, 1, dk)}`;
    case 'gooball':
      return `<circle cx="50" cy="56" r="35" fill="${f}"/>${P.c2 && t.c2 ? `<path d="M24 62q14 -30 30 -8t26 -12" fill="none" stroke="${P.c2}" stroke-width="9" stroke-linecap="round" opacity=".75"/>` : ''}<circle cx="50" cy="60" r="24" fill="#fff" opacity=".14"/><ellipse cx="36" cy="38" rx="12" ry="7" fill="#fff" opacity=".6" transform="rotate(-28 36 38)"/><circle cx="26" cy="54" r="3" fill="#fff" opacity=".55"/>`;
    case 'goocube':
      return `<rect x="16" y="24" width="68" height="66" rx="20" fill="${f}"/><rect x="24" y="30" width="52" height="40" rx="14" fill="#fff" opacity=".16"/><ellipse cx="36" cy="38" rx="11" ry="6" fill="#fff" opacity=".6" transform="rotate(-24 36 38)"/><circle cx="26" cy="52" r="2.6" fill="#fff" opacity=".55"/>`;
    case 'gumdrop':
      return `<path d="M17 86Q14 22 50 20Q86 22 83 86Q50 95 17 86Z" fill="${f}"/><g fill="#fff" opacity=".8"><circle cx="30" cy="60" r="1.6"/><circle cx="44" cy="44" r="1.6"/><circle cx="62" cy="52" r="1.6"/><circle cx="70" cy="72" r="1.6"/><circle cx="38" cy="78" r="1.6"/><circle cx="56" cy="74" r="1.6"/><circle cx="52" cy="30" r="1.6"/><circle cx="26" cy="76" r="1.6"/><circle cx="72" cy="40" r="1.6"/></g><ellipse cx="36" cy="38" rx="9" ry="5" fill="#fff" opacity=".5" transform="rotate(-30 36 38)"/>`;
    case 'dumpling':
      return `<path d="M13 70Q13 42 50 32Q87 42 87 70Q87 89 50 89Q13 89 13 70Z" fill="${f}"/><circle cx="50" cy="29" r="9" fill="${f}"/><path d="M50 22q5 4 0 8q-5 3 -1 7M50 36Q40 40 30 50M50 36Q50 44 50 52M50 36Q60 40 70 50M44 34Q34 36 22 44M56 34Q66 36 78 44" fill="none" stroke="${d}" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>${shine(30, 56, 6, 3.5)}${face(50, 68, 1, dk)}`;
    case 'pickle':
      return `<g transform="rotate(9 50 50)"><rect x="29" y="7" width="42" height="86" rx="21" fill="${f}"/><rect x="36" y="14" width="12" height="70" rx="6" fill="#fff" opacity=".2"/><g fill="${d}" opacity=".75"><circle cx="36" cy="24" r="2.6"/><circle cx="62" cy="20" r="2.2"/><circle cx="64" cy="38" r="2.6"/><circle cx="35" cy="66" r="2.4"/><circle cx="63" cy="70" r="2.6"/><circle cx="48" cy="82" r="2.4"/><circle cx="58" cy="54" r="2"/><circle cx="40" cy="42" r="2"/></g></g>${face(51, 48, 0.85, dk)}`;
    case 'burger':
      return `<rect x="15" y="68" width="70" height="20" rx="10" fill="${f}"/><rect x="13" y="56" width="74" height="14" rx="7" fill="#7A4A2E"/><path d="M14 56L30 56L22 66ZM58 56L80 56L70 68Z" fill="#FFD84A"/><path d="M11 54q7 -8 13 0t13 0t13 0t13 0t13 0t13 0" fill="none" stroke="#5DBB4A" stroke-width="7" stroke-linecap="round"/><path d="M13 48Q13 16 50 16Q87 16 87 48Z" fill="${f}"/><g fill="#FFF3D6"><ellipse cx="34" cy="26" rx="2.6" ry="1.6"/><ellipse cx="50" cy="21" rx="2.6" ry="1.6"/><ellipse cx="66" cy="27" rx="2.6" ry="1.6"/><ellipse cx="26" cy="36" rx="2.6" ry="1.6"/><ellipse cx="74" cy="37" rx="2.6" ry="1.6"/></g>${face(50, 38, 0.75, false)}`;
    case 'taco':
      return `<g><circle cx="28" cy="46" r="10" fill="#5DBB4A"/><circle cx="44" cy="36" r="10" fill="#5DBB4A"/><circle cx="60" cy="36" r="10" fill="#5DBB4A"/><circle cx="74" cy="48" r="9" fill="#5DBB4A"/><circle cx="36" cy="38" r="6" fill="#E2483F"/><circle cx="54" cy="31" r="6" fill="#E2483F"/><circle cx="68" cy="40" r="5" fill="#FFB02E"/></g><path d="M9 80A41 41 0 0 1 91 80Z" fill="${f}"/><g fill="${d}" opacity=".5"><circle cx="26" cy="68" r="1.6"/><circle cx="74" cy="68" r="1.6"/><circle cx="50" cy="48" r="1.6"/><circle cx="36" cy="54" r="1.6"/><circle cx="64" cy="54" r="1.6"/></g>${face(50, 66, 0.85, false)}`;
    case 'fries':
      return `<g fill="${f}" stroke="${d}" stroke-width="1.2"><rect x="28" y="20" width="8" height="46" rx="3" transform="rotate(-10 32 43)"/><rect x="38" y="12" width="8" height="52" rx="3" transform="rotate(-3 42 38)"/><rect x="48" y="8" width="8" height="56" rx="3"/><rect x="58" y="14" width="8" height="50" rx="3" transform="rotate(6 62 39)"/><rect x="66" y="24" width="8" height="42" rx="3" transform="rotate(13 70 45)"/></g><path d="M24 50Q50 62 76 50L70 90Q69 94 64 94L36 94Q31 94 30 90Z" fill="#F0524F"/>${face(50, 74, 0.7, false)}`;
    case 'hotdog':
      return `<g transform="rotate(-10 50 54)"><rect x="8" y="42" width="84" height="36" rx="18" fill="${f}"/><rect x="3" y="34" width="94" height="24" rx="12" fill="#D9634A"/><path d="M14 46q6 -8 12 0t12 0t12 0t12 0t12 0t12 0" fill="none" stroke="#FFD84A" stroke-width="3.5" stroke-linecap="round"/></g>${face(50, 66, 0.7, false)}`;
    case 'cookie':
      return `<circle cx="50" cy="56" r="35" fill="${f}"/><g fill="#6B4027"><circle cx="34" cy="40" r="5"/><circle cx="62" cy="36" r="4.5"/><circle cx="72" cy="58" r="5"/><circle cx="30" cy="70" r="4.5"/><circle cx="56" cy="80" r="4.5"/><circle cx="46" cy="30" r="3"/></g>${face(50, 58, 0.9, false)}`;
    case 'pancake':
      return `<ellipse cx="50" cy="80" rx="36" ry="11" fill="${d}"/><ellipse cx="50" cy="76" rx="36" ry="11" fill="${f}"/><ellipse cx="50" cy="66" rx="34" ry="11" fill="${d}"/><ellipse cx="50" cy="62" rx="34" ry="11" fill="${f}"/><ellipse cx="50" cy="52" rx="32" ry="11" fill="${d}"/><ellipse cx="50" cy="48" rx="32" ry="11" fill="${f}"/><path d="M24 46Q50 34 76 46Q78 56 70 54Q68 66 62 54Q50 60 40 54Q36 70 30 54Q22 56 24 46Z" fill="#8A5A3C"/><rect x="42" y="36" width="16" height="10" rx="3" fill="#FFE27A"/>${face(50, 68, 0.7, false)}`;
    case 'banana':
      return `<path d="M18 30Q22 78 70 84Q88 84 90 72Q54 68 34 26Q26 20 18 30Z" fill="${f}"/><path d="M18 30Q22 20 30 22L34 26Q26 22 18 30Z" fill="#6B4027"/><circle cx="88" cy="76" r="4" fill="#6B4027"/><path d="M28 36Q36 66 70 76" fill="none" stroke="#fff" stroke-width="3" opacity=".4" stroke-linecap="round"/>${face(52, 66, 0.6, false)}`;
    case 'loaf':
      return `<path d="M11 50Q9 28 30 28Q40 17 50 26Q60 17 70 28Q91 28 89 50L87 85Q50 91 13 85Z" fill="${f}"/><path d="M11 50Q9 28 30 28Q40 17 50 26Q60 17 70 28Q91 28 89 50Q50 42 11 50Z" fill="${d}"/><path d="M30 31q-3 6 0 12M50 28q-3 6 0 12M70 31q-3 6 0 12" stroke="#FFF3D6" stroke-width="3" fill="none" stroke-linecap="round"/>${face(50, 66, 1, false)}`;
    case 'beadball': {
      let beads = '';
      const cols = t.c1 === 'white' ? RAINBOW : [P.base, shade(P.base, 0.35), shade(P.base, -0.2), '#fff'];
      for (let i = 0; i < 30; i++) { const a = i * 2.39996, r = 4 + Math.sqrt(i / 30) * 25; beads += `<circle cx="${(50 + r * Math.cos(a)).toFixed(1)}" cy="${(56 + r * Math.sin(a)).toFixed(1)}" r="4.3" fill="${cols[i % cols.length]}" stroke="${INK}" stroke-opacity=".18" stroke-width=".7"/>`; }
      return `<circle cx="50" cy="56" r="35" fill="${P.base}" opacity=".28"/>${beads}<circle cx="50" cy="56" r="35" fill="none" stroke="#fff" stroke-width="3" opacity=".75"/><ellipse cx="36" cy="38" rx="11" ry="6" fill="#fff" opacity=".6" transform="rotate(-28 36 38)"/>`;
    }
    default:
      return `<ellipse cx="50" cy="60" rx="35" ry="29" fill="${f}"/>${shine(34, 44)}${face(50, 61, 1, dk)}`;
  }
}

function fidget(t, P) {
  const f = P.fill, d = P.dark;
  const bubble = (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${shade(c, -0.18)}"/><circle cx="${x - r * 0.12}" cy="${y - r * 0.15}" r="${r * 0.78}" fill="${c}"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.4}" r="${r * 0.22}" fill="#fff" opacity=".7"/>`;
  switch (t.v) {
    case 'popper': {
      let s = `<rect x="12" y="14" width="76" height="76" rx="16" fill="${t.fx === 'rainbow' ? '#fff' : d}"/>`;
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++)
        s += bubble(23 + c * 18, 25 + r * 18, 7.6, t.fx === 'rainbow' ? RAINBOW[r + (r > 1 ? 1 : 0)] : P.base);
      return s;
    }
    case 'popround': {
      let s = `<circle cx="50" cy="52" r="40" fill="${d}"/>` + bubble(50, 52, 8, P.base);
      for (let i = 0; i < 6; i++) s += bubble(50 + 18 * Math.cos(i * 1.047), 52 + 18 * Math.sin(i * 1.047), 7.5, shade(P.base, 0.2));
      for (let i = 0; i < 10; i++) s += bubble(50 + 32 * Math.cos(i * 0.628 + 0.3), 52 + 32 * Math.sin(i * 0.628 + 0.3), 5.6, P.base);
      return s;
    }
    case 'spinner': {
      let s = '';
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + i * 2.094, x = 50 + 26 * Math.cos(a), y = 54 + 26 * Math.sin(a);
        s += `<line x1="50" y1="54" x2="${x}" y2="${y}" stroke="${f}" stroke-width="20" stroke-linecap="round"/>`;
      }
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + i * 2.094, x = 50 + 26 * Math.cos(a), y = 54 + 26 * Math.sin(a);
        s += `<circle cx="${x}" cy="${y}" r="10" fill="${P.c2}"/><circle cx="${x}" cy="${y}" r="4" fill="#fff" opacity=".7"/>`;
      }
      return s + `<circle cx="50" cy="54" r="10" fill="#fff"/><circle cx="50" cy="54" r="6" fill="${d}"/>`;
    }
    case 'cube':
      return `<path d="M50 12L86 30L86 70L50 90L14 70L14 30Z" fill="${d}" stroke="${d}" stroke-width="6" stroke-linejoin="round"/><path d="M50 12L86 30L50 48L14 30Z" fill="${shade(P.base, 0.25)}"/><path d="M14 30L50 48L50 90L14 70Z" fill="${P.base}"/><ellipse cx="50" cy="30" rx="9" ry="5" fill="${P.c2}"/><circle cx="24" cy="48" r="4" fill="${P.c2}"/><circle cx="38" cy="55" r="4" fill="${P.c2}"/><circle cx="24" cy="63" r="4" fill="#fff"/><circle cx="38" cy="70" r="4" fill="#fff"/><path d="M60 62l18 -9" stroke="${P.c2}" stroke-width="6" stroke-linecap="round"/><circle cx="74" cy="55" r="5" fill="#fff"/>`;
    case 'twisty': {
      let s = '';
      for (let i = 0; i < 10; i++) {
        const a = i * 0.628, x = 50 + 28 * Math.cos(a), y = 54 + 24 * Math.sin(a);
        s += `<ellipse cx="${x}" cy="${y}" rx="11" ry="8" fill="${i % 2 ? P.c2 : P.base}" stroke="${d}" stroke-width="1.2" transform="rotate(${(a * 180) / Math.PI + 90} ${x} ${y})"/>`;
      }
      return s;
    }
    case 'keycap':
      return `<path d="M16 78L24 26Q25 20 31 20L69 20Q75 20 76 26L84 78Q85 88 76 88L24 88Q15 88 16 78Z" fill="${d}"/><rect x="26" y="22" width="48" height="46" rx="9" fill="${f}"/>${shine(36, 30, 6, 3)}${face(50, 44, 0.9, P.darkFace)}`;
    case 'popheart': {
      let s = `<path d="M50 92C6 62 9 20 32 20C44 20 50 31 50 37C50 31 56 20 68 20C91 20 94 62 50 92Z" fill="${t.fx === 'rainbow' ? '#fff' : d}" stroke="${d}" stroke-width="2"/>`;
      const rows = [[36, [28, 42, 58, 72]], [50, [24, 37, 50, 63, 76]], [64, [37, 50, 63]], [77, [50]]];
      rows.forEach(([y, xs], r) => xs.forEach((x) => { s += bubble(x, y, 6.2, t.fx === 'rainbow' ? RAINBOW[r * 1 + (r > 1 ? 2 : 0)] : P.base); }));
      return s;
    }
    case 'peapod':
      return `<path d="M6 56Q50 16 94 56Q50 96 6 56Z" fill="${d}"/><path d="M12 56Q50 28 88 56" fill="none" stroke="${shade(P.base, 0.3)}" stroke-width="2.5" opacity=".7"/>${bubble(28, 57, 11, P.base)}${bubble(50, 57, 12.5, P.base)}${bubble(72, 57, 11, P.base)}${face(50, 57, 0.5, false, 8)}<path d="M92 54q6 -8 2 -14" fill="none" stroke="${d}" stroke-width="3" stroke-linecap="round"/>`;
    case 'gear': {
      let s = '';
      for (let i = 0; i < 8; i++) s += `<rect x="43" y="14" width="14" height="18" rx="3.5" fill="${f}" transform="rotate(${i * 45} 50 54)"/>`;
      return s + `<circle cx="50" cy="54" r="29" fill="${f}"/><circle cx="50" cy="54" r="29" fill="none" stroke="${d}" stroke-width="2" opacity=".4"/><circle cx="50" cy="54" r="17" fill="${P.c2}"/><circle cx="50" cy="54" r="7" fill="#fff"/>${shine(36, 38, 6, 3)}`;
    }
    case 'squeeze':
      return `<circle cx="50" cy="54" r="36" fill="${f}"/><path d="M20 44q30 -18 60 0M17 60q33 16 66 0" fill="none" stroke="${d}" stroke-width="1.5" opacity=".45"/>${shine(34, 34, 9, 5)}${face(50, 54, 1.25, P.darkFace)}`;
    case 'track': {
      const pts = [[13, 70], [31, 38], [50, 70], [69, 38], [87, 70]];
      let s = '';
      for (let i = 0; i < 4; i++) s += `<line x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${pts[i + 1][0]}" y2="${pts[i + 1][1]}" stroke="${shade(RAINBOW[i + 1], -0.2)}" stroke-width="17" stroke-linecap="round"/><line x1="${pts[i][0]}" y1="${pts[i][1] - 1.5}" x2="${pts[i + 1][0]}" y2="${pts[i + 1][1] - 1.5}" stroke="${t.fx === 'rainbow' ? RAINBOW[i + 1] : (i % 2 ? P.c2 : P.base)}" stroke-width="13" stroke-linecap="round"/>`;
      return s + pts.map(([x, y]) => `<circle cx="${x}" cy="${y - 1.5}" r="3.6" fill="#fff"/>`).join('');
    }
    case 'slug': {
      let s = '';
      for (let i = 0; i < 7; i++) { const c = t.fx === 'rainbow' ? RAINBOW[i % 6] : (i % 2 ? shade(P.base, 0.25) : P.base); s += `<ellipse cx="${14 + i * 11.5}" cy="${(62 + Math.sin(i * 1.05) * 9).toFixed(1)}" rx="8.5" ry="13" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="1.5"/>`; }
      const hy = 62 + Math.sin(6 * 1.05) * 9;
      return s + `<path d="M80 ${hy - 10}q-2 -12 -8 -14M86 ${hy - 10}q2 -12 8 -13" fill="none" stroke="${d}" stroke-width="2.5" stroke-linecap="round"/><circle cx="72" cy="${hy - 25}" r="3" fill="${d}"/><circle cx="94" cy="${hy - 24}" r="3" fill="${d}"/>${face(83, hy - 1, 0.45, false, 7)}`;
    }
    case 'meshball': {
      const c = P.base;
      return `<circle cx="50" cy="56" r="29" fill="${shade(c, -0.35)}"/><path d="M26 44L74 68M24 58L66 80M34 34L78 56M30 76L68 32M22 60L56 28M44 84L78 46" stroke="${INK}" stroke-width="1.6" opacity=".55"/>${bubble(30, 40, 9, c)}${bubble(70, 42, 10, shade(c, 0.2))}${bubble(50, 60, 11, c)}${bubble(28, 70, 8, shade(c, 0.2))}${bubble(72, 72, 9, c)}${bubble(50, 30, 7, shade(c, 0.3))}`;
    }
    case 'noodle': {
      let s = '';
      [26, 42, 58, 74].forEach((y, i) => { const c = i % 2 ? P.c2 : P.base; s += `<path d="M8 ${y}q14 -13 28 0t28 0t28 0" fill="none" stroke="${shade(c, -0.22)}" stroke-width="10" stroke-linecap="round"/><path d="M8 ${y - 1.5}q14 -13 28 0t28 0t28 0" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`; });
      return s;
    }
    case 'pad':
      return `<rect x="8" y="30" width="84" height="48" rx="24" fill="${d}"/><rect x="8" y="27" width="84" height="48" rx="24" fill="${f}"/><path d="M26 41v20M16 51h20" stroke="${P.c2}" stroke-width="8" stroke-linecap="round"/><circle cx="72" cy="42" r="5" fill="#F0524F"/><circle cx="82" cy="51" r="5" fill="#9BD84A"/><circle cx="62" cy="51" r="5" fill="#8ED3FF"/><circle cx="72" cy="60" r="5" fill="#FFD84A"/><rect x="42" y="34" width="16" height="8" rx="4" fill="#fff"/><circle cx="54" cy="38" r="3" fill="${d}"/><circle cx="50" cy="58" r="7" fill="${d}"/><circle cx="50" cy="56" r="5" fill="#fff" opacity=".8"/>`;
    case 'magnet': {
      const pts = [[50, 56], [50, 32], [71, 44], [71, 68], [50, 80], [29, 68], [29, 44]];
      return pts.map(([x, y], i) => bubble(x, y, 12.5, t.fx === 'rainbow' ? RAINBOW[i % 6] : (i % 2 ? P.c2 : P.base))).join('');
    }
    case 'paddle':
      return `<rect x="34" y="62" width="12" height="32" rx="6" fill="#C9924E" transform="rotate(8 40 78)"/><circle cx="42" cy="42" r="30" fill="${d}"/><circle cx="42" cy="40" r="30" fill="${f}"/><circle cx="42" cy="40" r="21" fill="none" stroke="#fff" stroke-width="2.5" opacity=".5"/><path d="M42 40Q60 30 80 22" fill="none" stroke="${INK}" stroke-width="1.2" stroke-dasharray="3 3"/>${bubble(82, 20, 9, P.c2)}`;
    case 'maze':
      return `<circle cx="50" cy="56" r="37" fill="${d}"/><circle cx="50" cy="54" r="37" fill="${f}"/><g fill="none" stroke="${P.c2}" stroke-width="5" stroke-linecap="round"><circle cx="50" cy="54" r="28" stroke-dasharray="120 24" transform="rotate(30 50 54)"/><circle cx="50" cy="54" r="19" stroke-dasharray="80 20" transform="rotate(200 50 54)"/><circle cx="50" cy="54" r="10" stroke-dasharray="40 14" transform="rotate(100 50 54)"/></g><circle cx="50" cy="54" r="3.5" fill="#fff"/>${bubble(73, 40, 4.5, '#FFFFFF')}`;
    case 'top':
      return `<rect x="46" y="8" width="8" height="26" rx="4" fill="${P.c2}"/><path d="M18 44Q50 20 82 44Q78 62 50 92Q22 62 18 44Z" fill="${f}"/><path d="M19 47Q50 60 81 47" fill="none" stroke="${P.c2}" stroke-width="7"/><path d="M27 62Q50 72 73 62" fill="none" stroke="#fff" stroke-width="4" opacity=".6"/>${shine(36, 36, 7, 4)}`;
    case 'pen':
      return `<g transform="rotate(32 50 52)"><rect x="42" y="6" width="16" height="12" rx="4" fill="${P.c2}"/><rect x="41" y="16" width="18" height="56" rx="6" fill="${f}"/><rect x="41" y="52" width="18" height="12" fill="${d}"/><rect x="58" y="18" width="5" height="26" rx="2.5" fill="#DCE1EA"/><path d="M43 72L57 72L50 90Z" fill="#B9BEC9"/><circle cx="50" cy="88" r="2" fill="${INK}"/><rect x="45" y="22" width="4" height="24" rx="2" fill="#fff" opacity=".5"/></g>`;
    case 'dimple': {
      const cs = t.fx === 'rainbow' ? ['#FF8FC0', '#FFD84A', '#8ED3FF'] : [P.base, shade(P.base, 0.3), P.base];
      return `<circle cx="14" cy="30" r="8" fill="none" stroke="#B9BEC9" stroke-width="3.5"/><rect x="7" y="34" width="86" height="42" rx="21" fill="${t.fx === 'rainbow' ? '#fff' : d}" stroke="${d}" stroke-width="2"/>${bubble(27, 55, 12.5, cs[0])}${bubble(50, 55, 12.5, cs[1])}${bubble(73, 55, 12.5, cs[2])}`;
    }
    case 'yoyo':
      return `<path d="M50 30V8" stroke="#B9BEC9" stroke-width="2.5"/><circle cx="50" cy="7" r="4.5" fill="none" stroke="#B9BEC9" stroke-width="2.5"/><circle cx="50" cy="60" r="31" fill="${d}"/><circle cx="50" cy="58" r="31" fill="${f}"/><circle cx="50" cy="58" r="19" fill="${P.c2}"/>${star4(50, 58, 11, '#fff')}${shine(34, 40, 7, 4)}`;
    case 'ring': {
      let s = '';
      for (let i = 0; i < 14; i++) s += `<circle cx="${(50 + 34 * Math.cos(i * 0.4488)).toFixed(1)}" cy="${(54 + 34 * Math.sin(i * 0.4488)).toFixed(1)}" r="5" fill="${d}"/>`;
      return s + `<circle cx="50" cy="54" r="25" fill="none" stroke="${d}" stroke-width="15"/><circle cx="50" cy="53" r="25" fill="none" stroke="${f}" stroke-width="12"/><path d="M30 40q8 -10 20 -11" stroke="#fff" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`;
    }
    case 'pinwheel': {
      const cs = t.fx === 'rainbow' ? [RAINBOW[0], RAINBOW[2], RAINBOW[3], RAINBOW[4]] : [P.base, P.c2, P.base, P.c2];
      let s = `<rect x="48" y="44" width="4.5" height="52" rx="2" fill="#B9BEC9"/>`;
      for (let i = 0; i < 4; i++) s += `<path d="M50 44L50 8Q78 16 50 44Z" fill="${cs[i]}" stroke="${shade(cs[i], -0.2)}" stroke-width="1.5" stroke-linejoin="round" transform="rotate(${i * 90} 50 44)"/>`;
      return s + `<circle cx="50" cy="44" r="6" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
    }
    default:
      return `<circle cx="50" cy="54" r="34" fill="${f}"/>`;
  }
}

function slime(t, P) {
  const f = P.fill, clear = t.v === 'clear';
  let s = `<path d="M18 46Q14 26 34 24Q42 10 56 18Q76 12 82 32Q90 44 80 52L78 62Q77 68 73 62L71 54L64 54L63 70Q61 77 58 70L57 54L36 54L35 64Q33 70 30 64L29 54Z" fill="${f}" opacity="${clear ? 0.75 : 1}"/>`;
  s += `<path d="M24 50L28 86Q29 92 36 92L64 92Q71 92 72 86L76 50Z" fill="${f}" opacity="${clear ? 0.5 : 0.85}"/><path d="M24 50L28 86Q29 92 36 92L64 92Q71 92 72 86L76 50" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/><path d="M33 58L35 82" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>`;
  if (t.v === 'cloud') s += `<g fill="#fff" opacity=".85"><circle cx="30" cy="32" r="9"/><circle cx="44" cy="24" r="10"/><circle cx="60" cy="26" r="10"/><circle cx="72" cy="36" r="8"/><circle cx="50" cy="36" r="10"/></g>`;
  if (t.v === 'crunchy') {
    const pts = [[28, 34], [40, 26], [52, 34], [64, 26], [74, 38], [34, 44], [46, 42], [60, 42], [40, 66], [56, 74], [48, 84], [62, 62], [34, 80]];
    s += pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="3.4" fill="${t.c1 === 'white' ? RAINBOW[i % 6] : '#fff'}" stroke="${P.dark}" stroke-width=".6"/>`).join('');
  }
  if (t.v === 'butter') s += `<path d="M30 36q10 -10 20 0t20 0" fill="none" stroke="${P.light}" stroke-width="3" stroke-linecap="round"/>`;
  if (clear) s += `<circle cx="44" cy="70" r="3" fill="#fff" opacity=".7"/><circle cx="58" cy="62" r="2" fill="#fff" opacity=".7"/><circle cx="54" cy="80" r="2.4" fill="#fff" opacity=".7"/>`;
  return s + shine(34, 30, 6, 3.5) + face(50, 38, 0.8, P.darkFace && t.v !== 'cloud');
}

function putty(t, P) {
  const f = P.fill;
  let s = `<ellipse cx="50" cy="62" rx="38" ry="26" fill="#8E96A8"/><ellipse cx="50" cy="56" rx="38" ry="26" fill="#DCE1EA"/><ellipse cx="50" cy="56" rx="32" ry="21" fill="${f}"/>`;
  if (t.v === 'swirl') s += `<path d="M50 56c6 -2 8 6 1 8c-10 3 -15 -9 -5 -14c13 -6 25 6 16 17" fill="none" stroke="${P.c2}" stroke-width="4.5" stroke-linecap="round" opacity=".9"/>`;
  if (t.v === 'metal') s += `<path d="M24 54q12 -16 34 -14" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".75"/><path d="M44 70q18 4 30 -10" fill="none" stroke="${P.dark}" stroke-width="4" stroke-linecap="round" opacity=".6"/>`;
  if (t.v === 'glow') s = `<ellipse cx="50" cy="56" rx="48" ry="36" fill="${P.light}" opacity=".5"/>` + s + `<path d="M34 50q8 -8 18 -6" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>` + star4(72, 40, 5) + star4(26, 68, 4);
  if (t.v === 'magnet') s += `<path d="M30 56l6 -16l6 12l8 -18l8 18l6 -12l6 16Z" fill="${P.dark}" stroke="${P.dark}" stroke-width="3" stroke-linejoin="round"/>` + face(50, 62, 0.75, true) + `<rect x="68" y="20" width="16" height="14" rx="3" fill="#F0524F"/><rect x="68" y="20" width="8" height="14" rx="3" fill="#B9BEC9"/>`;
  s += `<path d="M10 40Q22 14 58 16Q84 20 90 36Q70 26 50 28Q26 30 10 40Z" fill="#B9BEC9"/><path d="M22 30Q40 20 62 22" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`;
  return s;
}

function dough(t, P) {
  const f = P.fill, d = P.dark, dk = P.darkFace;
  const tub = `<path d="M22 60L27 88Q28 93 34 93L66 93Q72 93 73 88L78 60Z" fill="#FFD84A"/><rect x="18" y="54" width="64" height="9" rx="4" fill="${P.base}"/><rect x="33" y="68" width="34" height="16" rx="5" fill="#fff"/><circle cx="50" cy="76" r="5" fill="${P.base}"/>`;
  switch (t.v) {
    case 'swirl':
      return `<ellipse cx="50" cy="48" rx="24" ry="10" fill="${f}"/><ellipse cx="50" cy="38" rx="18" ry="9" fill="${f}"/><ellipse cx="50" cy="29" rx="12" ry="7" fill="${f}"/><path d="M50 12q8 6 2 14q-8 0 -8 -6Z" fill="${f}"/><path d="M30 46q20 8 40 0M36 36q14 6 28 0" fill="none" stroke="${d}" stroke-width="1.6" opacity=".5"/>${face(50, 40, 0.7, dk)}${tub}`;
    case 'star':
      return `<path d="M50 8L57 26L76 27L61 39L66 57L50 47L34 57L39 39L24 27L43 26Z" fill="${f}" stroke="${f}" stroke-width="8" stroke-linejoin="round"/>${face(50, 34, 0.7, dk)}${tub}`;
    case 'heart':
      return `<path d="M50 54C22 38 25 8 39 8C46 8 50 14 50 19C50 14 54 8 61 8C75 8 78 38 50 54Z" fill="${f}"/>${shine(36, 18, 5, 3)}${face(50, 28, 0.65, dk)}${tub}`;
    case 'snake':
      return `<path d="M26 50Q30 34 50 38T72 26Q78 16 68 12" fill="none" stroke="${f}" stroke-width="13" stroke-linecap="round"/><circle cx="68" cy="13" r="9" fill="${f}"/><circle cx="65" cy="11" r="1.6" fill="${INK}"/><circle cx="72" cy="11" r="1.6" fill="${INK}"/><path d="M68 20v5l-2 2M68 25l2 2" stroke="#F0524F" stroke-width="1.5" fill="none" stroke-linecap="round"/>${tub}`;
    default:
      return `<circle cx="50" cy="36" r="24" fill="${f}"/>${shine(40, 24, 6, 3.5)}${face(50, 38, 0.85, dk)}${tub}`;
  }
}

function springy(t, P) {
  const ring = (i, n) => t.fx === 'rainbow' ? RAINBOW[Math.floor((i / n) * 6) % 6] : (t.c2 && i % 2 ? P.c2 : P.base);
  let s = '';
  if (t.v === 'stack') {
    const n = 9;
    for (let i = 0; i < n; i++) {
      const y = 84 - i * 7.4, c = ring(i, n);
      s += `<ellipse cx="${50 + Math.sin(i * 0.5) * 2}" cy="${y}" rx="27" ry="9" fill="none" stroke="${shade(c, -0.25)}" stroke-width="5"/><ellipse cx="${50 + Math.sin(i * 0.5) * 2}" cy="${y - 1.3}" rx="27" ry="9" fill="none" stroke="${c}" stroke-width="3.6"/>`;
    }
    return s;
  }
  const n = 11;
  for (let i = 0; i < n; i++) {
    const a = Math.PI - (i / (n - 1)) * Math.PI, x = 50 + 28 * Math.cos(a), y = 80 - 44 * Math.sin(a), c = ring(i, n);
    const rot = 90 - (a * 180) / Math.PI;
    s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="16" ry="5.5" fill="none" stroke="${shade(c, -0.25)}" stroke-width="4" transform="rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/><ellipse cx="${x.toFixed(1)}" cy="${(y - 1).toFixed(1)}" rx="16" ry="5.5" fill="none" stroke="${c}" stroke-width="2.8" transform="rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  return s;
}

function plushie(t, P) {
  const f = P.fill, d = P.dark, c2 = P.c2, dk = P.darkFace;
  let ears = '', extra = '', patch = `<ellipse cx="50" cy="76" rx="11" ry="10" fill="${c2}"/>`;
  let post = '', faceStr = '', limb = f;
  switch (t.v) {
    case 'bear': ears = `<circle cx="28" cy="20" r="10" fill="${f}"/><circle cx="72" cy="20" r="10" fill="${f}"/><circle cx="28" cy="20" r="5" fill="${c2}"/><circle cx="72" cy="20" r="5" fill="${c2}"/>`; extra = `<ellipse cx="50" cy="46" rx="8" ry="6" fill="${c2}"/>`; break;
    case 'bunny': ears = `<ellipse cx="38" cy="14" rx="7" ry="17" fill="${f}" transform="rotate(-8 38 14)"/><ellipse cx="62" cy="14" rx="7" ry="17" fill="${f}" transform="rotate(8 62 14)"/><ellipse cx="38" cy="15" rx="3" ry="11" fill="#FF9CC4" transform="rotate(-8 38 15)"/><ellipse cx="62" cy="15" rx="3" ry="11" fill="#FF9CC4" transform="rotate(8 62 15)"/>`; break;
    case 'cat': ears = `<path d="M26 30L27 8L44 20ZM74 30L73 8L56 20Z" fill="${f}" stroke="${f}" stroke-width="4" stroke-linejoin="round"/><path d="M30 22L30 14L38 20ZM70 22L70 14L62 20Z" fill="${c2}"/>`; extra = `<path d="M72 80q16 -2 12 -18" fill="none" stroke="${f}" stroke-width="6" stroke-linecap="round"/>`; break;
    case 'fox': ears = `<path d="M26 30L25 6L44 20ZM74 30L75 6L56 20Z" fill="${f}" stroke="${f}" stroke-width="4" stroke-linejoin="round"/><path d="M28 14L27 8L32 12ZM72 14L73 8L68 12Z" fill="${INK}"/>`; extra = `<path d="M28 44Q38 58 50 50Q62 58 72 44Q66 60 50 62Q34 60 28 44Z" fill="#fff"/><path d="M72 82q18 0 14 -20q-10 4 -12 12Z" fill="${f}"/><path d="M86 62q2 8 -3 10" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/>`; break;
    case 'dino': ears = `<path d="M36 16l5 -10l5 8l4 -10l4 10l5 -8l5 10Z" fill="${c2}" stroke="${c2}" stroke-width="3" stroke-linejoin="round"/>`; extra = `<path d="M70 82q18 4 20 -10q-12 -2 -18 2Z" fill="${f}"/><circle cx="33" cy="30" r="2.4" fill="${d}" opacity=".6"/><circle cx="68" cy="26" r="2.4" fill="${d}" opacity=".6"/>`; break;
    case 'penguin': patch = `<ellipse cx="50" cy="76" rx="13" ry="13" fill="${c2}"/>`; extra = `<path d="M30 40Q30 26 42 26Q50 26 50 32Q50 26 58 26Q70 26 70 40Q70 56 50 56Q30 56 30 40Z" fill="#fff"/><path d="M45 44L55 44L50 50Z" fill="#FF9A3D" stroke="#FF9A3D" stroke-width="2" stroke-linejoin="round"/>`; break;
    case 'axolotl': ears = `<g fill="${c2}" stroke="${d}" stroke-width="1"><ellipse cx="18" cy="26" rx="10" ry="4" transform="rotate(25 18 26)"/><ellipse cx="14" cy="38" rx="10" ry="4"/><ellipse cx="18" cy="50" rx="10" ry="4" transform="rotate(-25 18 50)"/><ellipse cx="82" cy="26" rx="10" ry="4" transform="rotate(-25 82 26)"/><ellipse cx="86" cy="38" rx="10" ry="4"/><ellipse cx="82" cy="50" rx="10" ry="4" transform="rotate(25 82 50)"/></g>`; break;
    case 'panda': ears = `<circle cx="28" cy="18" r="10" fill="${c2}"/><circle cx="72" cy="18" r="10" fill="${c2}"/>`; extra = `<ellipse cx="40.5" cy="41" rx="7.5" ry="9" fill="${c2}" transform="rotate(-14 40.5 41)"/><ellipse cx="59.5" cy="41" rx="7.5" ry="9" fill="${c2}" transform="rotate(14 59.5 41)"/>`; post = `<circle cx="41" cy="40" r="3.6" fill="#fff"/><circle cx="59" cy="40" r="3.6" fill="#fff"/><circle cx="41.4" cy="40.4" r="2" fill="${INK}"/><circle cx="58.6" cy="40.4" r="2" fill="${INK}"/>`; limb = c2; patch = ''; break;
    case 'koala': ears = `<circle cx="21" cy="26" r="14" fill="${f}"/><circle cx="79" cy="26" r="14" fill="${f}"/><circle cx="21" cy="26" r="8" fill="#FFC9DC"/><circle cx="79" cy="26" r="8" fill="#FFC9DC"/>`; post = `<ellipse cx="50" cy="44" rx="5.5" ry="7.5" fill="${INK}"/><ellipse cx="48.6" cy="41" rx="1.6" ry="2.2" fill="#fff" opacity=".7"/>`; break;
    case 'frog': ears = `<circle cx="35" cy="16" r="11" fill="${f}"/><circle cx="65" cy="16" r="11" fill="${f}"/>`; post = `<circle cx="35" cy="15" r="6.5" fill="#fff"/><circle cx="65" cy="15" r="6.5" fill="#fff"/><circle cx="36" cy="16" r="3.4" fill="${INK}"/><circle cx="64" cy="16" r="3.4" fill="${INK}"/>`; faceStr = `<path d="M38 44q12 9 24 0" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/><circle cx="30" cy="46" r="3.4" fill="#FF5F9E" opacity=".45"/><circle cx="70" cy="46" r="3.4" fill="#FF5F9E" opacity=".45"/>`; break;
    case 'lion': { let mane = ''; for (let i = 0; i < 12; i++) mane += `<circle cx="${(50 + 27 * Math.cos(i * 0.5236)).toFixed(1)}" cy="${(38 + 27 * Math.sin(i * 0.5236)).toFixed(1)}" r="9.5" fill="${c2}"/>`; ears = mane; extra = `<ellipse cx="50" cy="47" rx="9" ry="6.5" fill="#FFF3D6"/><path d="M72 84q16 2 14 -14" fill="none" stroke="${f}" stroke-width="5" stroke-linecap="round"/><circle cx="86" cy="68" r="5" fill="${c2}"/>`; break; }
    case 'puppy': ears = `<ellipse cx="22" cy="42" rx="9" ry="19" fill="${c2}" transform="rotate(14 22 42)"/><ellipse cx="78" cy="42" rx="9" ry="19" fill="${c2}" transform="rotate(-14 78 42)"/>`; extra = `<ellipse cx="50" cy="48" rx="10" ry="7.5" fill="#FFF3D6"/><circle cx="62" cy="30" r="8" fill="${c2}" opacity=".85"/>`; post = `<ellipse cx="50" cy="45" rx="3.6" ry="2.6" fill="${INK}"/>`; break;
    case 'shark': ears = `<path d="M50 2L38 22L64 20Z" fill="${d}" stroke="${d}" stroke-width="3" stroke-linejoin="round"/>`; extra = `<path d="M27 44Q50 66 73 44Q70 60 50 62Q30 60 27 44Z" fill="${c2}"/><path d="M34 51l3 5l3 -4l3 5l3 -4l4 5l4 -5l3 4l3 -5l3 4l3 -5" fill="none" stroke="${d}" stroke-width="1.4" stroke-linejoin="round"/><path d="M72 84q16 2 18 -12q-10 0 -16 4Z" fill="${f}"/>`; faceStr = `<ellipse cx="41" cy="36" rx="2.9" ry="3.5" fill="${INK}"/><ellipse cx="59" cy="36" rx="2.9" ry="3.5" fill="${INK}"/><circle cx="40.2" cy="34.8" r="1" fill="#fff"/><circle cx="58.2" cy="34.8" r="1" fill="#fff"/><circle cx="29" cy="42" r="3.2" fill="#FF5F9E" opacity=".4"/><circle cx="71" cy="42" r="3.2" fill="#FF5F9E" opacity=".4"/>`; patch = `<ellipse cx="50" cy="76" rx="12" ry="11" fill="${c2}"/>`; break;
    case 'giraffe': ears = `<rect x="39" y="4" width="4.5" height="14" rx="2" fill="${f}"/><rect x="56.5" y="4" width="4.5" height="14" rx="2" fill="${f}"/><circle cx="41.2" cy="5" r="4" fill="${c2}"/><circle cx="58.8" cy="5" r="4" fill="${c2}"/><ellipse cx="22" cy="30" rx="9" ry="5" fill="${f}" transform="rotate(-20 22 30)"/><ellipse cx="78" cy="30" rx="9" ry="5" fill="${f}" transform="rotate(20 78 30)"/>`; extra = `<g fill="${c2}" opacity=".8"><circle cx="34" cy="24" r="5"/><circle cx="66" cy="22" r="4.5"/><circle cx="70" cy="48" r="4"/><circle cx="34" cy="74" r="4"/><circle cx="66" cy="80" r="4.5"/></g><ellipse cx="50" cy="49" rx="11" ry="7.5" fill="#FFF3D6"/>`; patch = ''; break;
    case 'sheep': ears = `<ellipse cx="22" cy="40" rx="9" ry="5" fill="#4B4460" transform="rotate(-18 22 40)"/><ellipse cx="78" cy="40" rx="9" ry="5" fill="#4B4460" transform="rotate(18 78 40)"/>`; extra = `<ellipse cx="50" cy="43" rx="17" ry="16" fill="#4B4460"/><g fill="${f}" stroke="${d}" stroke-width=".8"><circle cx="31" cy="24" r="9"/><circle cx="43" cy="16" r="10"/><circle cx="57" cy="16" r="10"/><circle cx="69" cy="24" r="9"/><circle cx="50" cy="22" r="9"/></g>`; faceStr = face(50, 43, 0.85, true, 7); limb = '#4B4460'; patch = ''; break;
    case 'tiger': ears = `<path d="M26 30L27 8L44 20ZM74 30L73 8L56 20Z" fill="${f}" stroke="${f}" stroke-width="4" stroke-linejoin="round"/><path d="M30 22L30 14L38 20ZM70 22L70 14L62 20Z" fill="${c2}"/>`; extra = `<ellipse cx="50" cy="48" rx="10" ry="7" fill="${c2}"/><path d="M50 13v9M43 15l1.5 8M57 15l-1.5 8M25 36l8 2M25 44l8 0M75 36l-8 2M75 44l-8 0M34 68l6 3M66 68l-6 3" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/><path d="M72 80q16 -2 12 -18" fill="none" stroke="${f}" stroke-width="6" stroke-linecap="round"/>`; break;
    case 'cow': ears = `<path d="M34 16q-6 -10 -12 -8q2 8 8 12ZM66 16q6 -10 12 -8q-2 8 -8 12Z" fill="#FFF3D6" stroke="${d}" stroke-width="1"/><ellipse cx="22" cy="34" rx="9" ry="5.5" fill="${f}" stroke="${d}" stroke-width="1" transform="rotate(-18 22 34)"/><ellipse cx="78" cy="34" rx="9" ry="5.5" fill="${f}" stroke="${d}" stroke-width="1" transform="rotate(18 78 34)"/>`; extra = `<path d="M30 22q10 -8 16 2q-2 12 -14 8Z" fill="${c2}"/><circle cx="68" cy="34" r="6" fill="${c2}"/><circle cx="40" cy="76" r="6" fill="${c2}"/>`; post = `<ellipse cx="50" cy="51" rx="13" ry="8" fill="#FFB7CF"/><ellipse cx="45.5" cy="51" rx="1.8" ry="2.6" fill="${INK}" opacity=".6"/><ellipse cx="54.5" cy="51" rx="1.8" ry="2.6" fill="${INK}" opacity=".6"/>`; patch = `<ellipse cx="50" cy="78" rx="10" ry="8" fill="#FFB7CF"/>`; break;
    case 'sloth': extra = `<ellipse cx="50" cy="42" rx="20" ry="17" fill="${c2}"/><ellipse cx="40" cy="40" rx="8" ry="5" fill="#8A5A3C" transform="rotate(24 40 40)"/><ellipse cx="60" cy="40" rx="8" ry="5" fill="#8A5A3C" transform="rotate(-24 60 40)"/>`; post = `<circle cx="41" cy="40" r="2.2" fill="#fff"/><circle cx="59" cy="40" r="2.2" fill="#fff"/><ellipse cx="50" cy="45" rx="3" ry="2.2" fill="${INK}"/>`; faceStr = `<path d="M42 50q8 6 16 0" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/><circle cx="31" cy="48" r="3.2" fill="#FF5F9E" opacity=".4"/><circle cx="69" cy="48" r="3.2" fill="#FF5F9E" opacity=".4"/>`; break;
    case 'hippo': ears = `<circle cx="30" cy="17" r="7" fill="${f}"/><circle cx="70" cy="17" r="7" fill="${f}"/><circle cx="30" cy="17" r="3.5" fill="${c2}"/><circle cx="70" cy="17" r="3.5" fill="${c2}"/>`; extra = `<ellipse cx="50" cy="50" rx="21" ry="13" fill="${P.light}"/>`; post = `<ellipse cx="43" cy="46" rx="2" ry="2.6" fill="${INK}" opacity=".6"/><ellipse cx="57" cy="46" rx="2" ry="2.6" fill="${INK}" opacity=".6"/><rect x="44" y="57" width="4" height="5" rx="1" fill="#fff"/><rect x="52" y="57" width="4" height="5" rx="1" fill="#fff"/>`; faceStr = `<ellipse cx="40" cy="32" rx="2.8" ry="3.4" fill="${INK}"/><ellipse cx="60" cy="32" rx="2.8" ry="3.4" fill="${INK}"/><circle cx="39.2" cy="30.8" r="1" fill="#fff"/><circle cx="59.2" cy="30.8" r="1" fill="#fff"/><path d="M44 55q6 4 12 0" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/><circle cx="28" cy="42" r="3.2" fill="#FF5F9E" opacity=".4"/><circle cx="72" cy="42" r="3.2" fill="#FF5F9E" opacity=".4"/>`; break;
    case 'raccoon': ears = `<circle cx="28" cy="20" r="10" fill="${f}"/><circle cx="72" cy="20" r="10" fill="${f}"/><circle cx="28" cy="20" r="5" fill="#4B4460"/><circle cx="72" cy="20" r="5" fill="#4B4460"/>`; extra = `<path d="M26 40Q38 28 50 36Q62 28 74 40Q62 52 50 44Q38 52 26 40Z" fill="#4B4460"/><ellipse cx="50" cy="50" rx="10" ry="7" fill="${c2}"/><path d="M72 84q18 0 14 -22" fill="none" stroke="${f}" stroke-width="8" stroke-linecap="round"/><path d="M82 80l6 2M86 72l6 0M86 64l6 -2" stroke="#4B4460" stroke-width="3.5" stroke-linecap="round"/>`; post = `<circle cx="40.5" cy="40" r="3.2" fill="#fff"/><circle cx="59.5" cy="40" r="3.2" fill="#fff"/><circle cx="41" cy="40.4" r="1.8" fill="${INK}"/><circle cx="59" cy="40.4" r="1.8" fill="${INK}"/><ellipse cx="50" cy="47" rx="3" ry="2.2" fill="${INK}"/>`; faceStr = `<path d="M46 52q4 3 8 0" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>`; break;
    case 'deer': ears = `<g fill="none" stroke="#8A5A3C" stroke-width="3.5" stroke-linecap="round"><path d="M38 18q-6 -8 -4 -16M36 10q-8 0 -10 -6"/><path d="M62 18q6 -8 4 -16M64 10q8 0 10 -6"/></g><ellipse cx="22" cy="30" rx="10" ry="5.5" fill="${f}" transform="rotate(-24 22 30)"/><ellipse cx="78" cy="30" rx="10" ry="5.5" fill="${f}" transform="rotate(24 78 30)"/>`; extra = `<ellipse cx="50" cy="49" rx="11" ry="8" fill="${c2}"/><g fill="${c2}"><circle cx="36" cy="24" r="2.6"/><circle cx="46" cy="18" r="2.2"/><circle cx="62" cy="22" r="2.6"/><circle cx="34" cy="70" r="2.6"/><circle cx="66" cy="72" r="2.6"/></g>`; post = `<ellipse cx="50" cy="46" rx="3.2" ry="2.4" fill="${INK}"/>`; break;
    case 'hamster': ears = `<circle cx="29" cy="19" r="9" fill="${f}"/><circle cx="71" cy="19" r="9" fill="${f}"/><circle cx="29" cy="19" r="4.5" fill="#FF9CC4"/><circle cx="71" cy="19" r="4.5" fill="#FF9CC4"/>`; extra = `<ellipse cx="35" cy="48" rx="13" ry="11" fill="${c2}"/><ellipse cx="65" cy="48" rx="13" ry="11" fill="${c2}"/>`; post = `<ellipse cx="50" cy="44" rx="2.6" ry="2" fill="#FF7FB0"/><rect x="48" y="50" width="4" height="4.5" rx="1" fill="#fff" stroke="${INK}" stroke-width=".6"/>`; break;
    case 'owl': ears = `<path d="M27 26L24 4L44 16ZM73 26L76 4L56 16Z" fill="${f}" stroke="${f}" stroke-width="4" stroke-linejoin="round"/>`; extra = `<circle cx="39" cy="38" r="11" fill="${c2}"/><circle cx="61" cy="38" r="11" fill="${c2}"/>`; post = `<circle cx="39" cy="38" r="4.6" fill="${INK}"/><circle cx="61" cy="38" r="4.6" fill="${INK}"/><circle cx="37.6" cy="36.4" r="1.6" fill="#fff"/><circle cx="59.6" cy="36.4" r="1.6" fill="#fff"/><path d="M46 46L54 46L50 53Z" fill="#FF9A3D" stroke="#FF9A3D" stroke-width="2" stroke-linejoin="round"/>`; faceStr = `<circle cx="27" cy="48" r="3.4" fill="#FF5F9E" opacity=".45"/><circle cx="73" cy="48" r="3.4" fill="#FF5F9E" opacity=".45"/>`; break;
    case 'pig': ears = `<path d="M27 24L24 6L44 16ZM73 24L76 6L56 16Z" fill="${c2}" stroke="${c2}" stroke-width="4" stroke-linejoin="round"/>`; post = `<ellipse cx="50" cy="50" rx="10" ry="7.5" fill="${c2}"/><ellipse cx="46.5" cy="50" rx="1.8" ry="2.8" fill="${INK}" opacity=".6"/><ellipse cx="53.5" cy="50" rx="1.8" ry="2.8" fill="${INK}" opacity=".6"/>`; break;
    case 'elephant': ears = `<circle cx="16" cy="38" r="17" fill="${f}"/><circle cx="84" cy="38" r="17" fill="${f}"/><circle cx="16" cy="38" r="10" fill="${c2}"/><circle cx="84" cy="38" r="10" fill="${c2}"/>`; post = `<path d="M50 45Q50 62 59 60" fill="none" stroke="${d}" stroke-width="9" stroke-linecap="round"/>`; break;
    case 'monkey': ears = `<circle cx="22" cy="38" r="10" fill="${f}"/><circle cx="78" cy="38" r="10" fill="${f}"/><circle cx="22" cy="38" r="5.5" fill="${c2}"/><circle cx="78" cy="38" r="5.5" fill="${c2}"/>`; extra = `<path d="M31 40Q30 25 42 28Q50 31 58 28Q70 25 69 40Q71 59 50 59Q29 59 31 40Z" fill="${c2}"/><path d="M72 84q18 0 14 -22" fill="none" stroke="${f}" stroke-width="5" stroke-linecap="round"/>`; faceStr = face(50, 41, 0.95, false); break;
    case 'unicorn': ears = `<path d="M50 0L45 20L55 20Z" fill="#F5B921"/><path d="M28 28L29 10L44 20ZM72 28L71 10L56 20Z" fill="${f}" stroke="${f}" stroke-width="4" stroke-linejoin="round"/>`; extra = `<path d="M70 20q14 6 10 26q-8 -8 -12 -12Z" fill="${c2}"/><path d="M76 34q8 8 2 22q-4 -10 -8 -12Z" fill="#FF8FC0"/>`; break;
  }
  const isPeng = t.v === 'penguin';
  return `${ears}<ellipse cx="29" cy="72" rx="8" ry="11" fill="${limb}" transform="rotate(25 29 72)"/><ellipse cx="71" cy="72" rx="8" ry="11" fill="${limb}" transform="rotate(-25 71 72)"/><ellipse cx="50" cy="76" rx="21" ry="17" fill="${f}"/>${patch}<ellipse cx="38" cy="91" rx="9" ry="5.5" fill="${isPeng ? '#FF9A3D' : limb === f ? d : limb}"/><ellipse cx="62" cy="91" rx="9" ry="5.5" fill="${isPeng ? '#FF9A3D' : limb === f ? d : limb}"/><circle cx="50" cy="38" r="26" fill="${f}"/>${extra}${shine(36, 22, 6, 3.5)}${isPeng ? face(50, 38, 0.85, false, 9).replace(/<path[^>]*stroke-linecap="round"\/>/, '') : (faceStr || face(50, 40, 0.95, dk && t.v !== 'fox'))}${post}`;
}

// A player's own drawing, turned into the same kind of picture as every other toy.
export function customArt(t) {
  const a = t.art;
  let s = '';
  a.strokes.forEach((k) => {
    let d = `M${k.p[0]} ${k.p[1]}`;
    for (let i = 2; i < k.p.length; i += 2) d += `L${k.p[i]} ${k.p[i + 1]}`;
    if (k.p.length === 2) d += 'l0.01 0';
    s += `<path d="${d}${k.f ? 'Z' : ''}" fill="${k.f ? shade(k.c, 0.3) : 'none'}" stroke="${k.c}" stroke-width="${k.w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  });
  a.faces.forEach((f) => { s += face(f.x, f.y, f.s, false); });
  return s;
}

const DRAW = { squishy, fidget, slime, putty, dough, springy, plushie };

export function toySVG(id) {
  const t = TOYS[id];
  if (!t) return '';
  const P = paint(t);
  const glow = t.fx === 'glow' ? sparkles(t) : '';
  const spark = t.fx !== 'glow' ? sparkles(t) : '';
  return `<svg class="toy-svg" viewBox="0 0 100 100" aria-hidden="true"><defs>${P.defs}</defs>${ground(t.cat === 'springy' ? 34 : 30)}${glow}<g filter="url(#toy-puff)">${t.custom ? customArt(t) : DRAW[t.cat](t, P)}</g>${spark}</svg>`;
}

export const coinSVG = `<svg class="coin" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="#F5B921" stroke="#2A1846" stroke-width="2"/><path d="M12 6.5l1.6 3.4 3.7.4-2.8 2.5.8 3.7L12 14.6l-3.3 1.9.8-3.7-2.8-2.5 3.7-.4z" fill="#FFF3B0"/></svg>`;

export const ICONS = {
  home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>',
  toys: '<circle cx="12" cy="13" r="7"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="6.5" r="2.5"/>',
  trade: '<path d="M4 8h13l-3-3M20 16H7l3 3" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  games: '<rect x="3" y="8" width="18" height="10" rx="5"/><path d="M8 11v4M6 13h4" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><circle cx="16" cy="13" r="1.4" fill="#fff"/>',
  stories: '<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v13c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 6v13" stroke="#fff" stroke-width="1.4"/>',
  shop: '<path d="M5 9h14l-1 11H6z"/><path d="M9 9V7a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="2"/>',
  sound: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9q3 3 0 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  mute: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  back: '<path d="M14 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
};
export const icon = (k) => `<svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${ICONS[k]}</svg>`;
