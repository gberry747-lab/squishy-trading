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
  if (t.fx === 'glitter') return star4(24, 30, 6) + star4(78, 44, 5) + star4(66, 20, 4) + star4(30, 72, 3.5) + star4(82, 76, 4, '#FFF3B0');
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
const ground = (rx = 30) => `<ellipse cx="50" cy="92" rx="${rx}" ry="4" fill="${INK}" opacity=".12"/>`;

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
  return s + shine(34, 30, 6, 3.5) + face(50, 38, 0.8, P.darkFace);
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
    case 'unicorn': ears = `<path d="M50 0L45 20L55 20Z" fill="#F5B921"/><path d="M28 28L29 10L44 20ZM72 28L71 10L56 20Z" fill="${f}" stroke="${f}" stroke-width="4" stroke-linejoin="round"/>`; extra = `<path d="M70 20q14 6 10 26q-8 -8 -12 -12Z" fill="${c2}"/><path d="M76 34q8 8 2 22q-4 -10 -8 -12Z" fill="#FF8FC0"/>`; break;
  }
  const isPeng = t.v === 'penguin';
  return `${ears}<ellipse cx="29" cy="72" rx="8" ry="11" fill="${limb}" transform="rotate(25 29 72)"/><ellipse cx="71" cy="72" rx="8" ry="11" fill="${limb}" transform="rotate(-25 71 72)"/><ellipse cx="50" cy="76" rx="21" ry="17" fill="${f}"/>${patch}<ellipse cx="38" cy="91" rx="9" ry="5.5" fill="${isPeng ? '#FF9A3D' : limb === f ? d : limb}"/><ellipse cx="62" cy="91" rx="9" ry="5.5" fill="${isPeng ? '#FF9A3D' : limb === f ? d : limb}"/><circle cx="50" cy="38" r="26" fill="${f}"/>${extra}${shine(36, 22, 6, 3.5)}${isPeng ? face(50, 38, 0.85, false, 9).replace(/<path[^>]*stroke-linecap="round"\/>/, '') : (faceStr || face(50, 40, 0.95, dk && t.v !== 'fox'))}${post}`;
}

const DRAW = { squishy, fidget, slime, putty, dough, springy, plushie };

export function toySVG(id) {
  const t = TOYS[id];
  if (!t) return '';
  const P = paint(t);
  const glow = t.fx === 'glow' ? sparkles(t) : '';
  const spark = t.fx !== 'glow' ? sparkles(t) : '';
  return `<svg class="toy-svg" viewBox="0 0 100 100" aria-hidden="true"><defs>${P.defs}</defs>${ground(t.cat === 'springy' ? 34 : 30)}${glow}${DRAW[t.cat](t, P)}${spark}</svg>`;
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
