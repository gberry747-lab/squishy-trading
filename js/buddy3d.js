// A real 3D squishy you can spin and squash. Built with three.js, loaded only when needed.
// Covers the round animal squishies for now; every other toy keeps its drawn picture.
import { TOYS } from './data.js';
import { COL } from './art.js';

const SRC = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const SHAPES = new Set(['blob', 'cat', 'bear', 'bunny', 'frog', 'pig', 'unicorn', 'dino', 'gooball']);
const INK = 0x2a1846;
const A = 1.18, B = 0.95, C = 1.0; // body half-sizes: wide, short, deep (a squashed ball)
let loading = null, live = null;

export const can3D = (id) => !!TOYS[id] && (TOYS[id].custom ? !!TOYS[id].art.real : TOYS[id].cat === 'squishy' && SHAPES.has(TOYS[id].v));

function load() {
  if (window.THREE) return Promise.resolve();
  if (!loading) loading = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = SRC; s.integrity = 'sha384-CI3ELBVUz9XQO+97x6nwMDPosPR5XvsxW2ua7N1Xeygeh1IxtgqtCkGfQY9WWdHu'; s.crossOrigin = 'anonymous'; s.onload = res; s.onerror = () => { loading = null; rej(new Error('offline')); };
    document.head.append(s);
  });
  return loading;
}
export function dispose3D() { if (live) { live(); live = null; } }

function gradientTexture(T, stops, stars) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d'), grad = g.createLinearGradient(0, 0, 256, 256);
  stops.forEach((s, i) => grad.addColorStop(i / (stops.length - 1), s));
  g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
  if (stars) { g.fillStyle = '#fff'; for (let i = 0; i < 60; i++) { g.globalAlpha = 0.4 + Math.random() * 0.6; g.beginPath(); g.arc(Math.random() * 256, Math.random() * 256, Math.random() * 1.6 + 0.4, 0, 7); g.fill(); } }
  const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t;
}
function shadowTexture(T) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const g = c.getContext('2d'), grad = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  grad.addColorStop(0, 'rgba(42,24,70,.38)'); grad.addColorStop(1, 'rgba(42,24,70,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  return new T.CanvasTexture(c);
}

// A player's own drawing, puffed up into a real 3D squishy. The biggest closed shape becomes the
// body (or, if there is none, a soft outline around everything drawn), and the whole drawing is
// printed on the front like a decorated cushion.
function buildDrawing(T, t) {
  const a = t.art, pts = (k) => { const o = []; for (let i = 0; i < k.p.length; i += 2) o.push([k.p[i] / 100, 1 - k.p[i + 1] / 100]); return o; };
  const area = (o) => Math.abs(o.reduce((s, p, i) => { const q = o[(i + 1) % o.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2);
  let outline = null, body = null;
  a.strokes.filter((k) => k.f).forEach((k) => { const o = pts(k); if (!outline || area(o) > area(outline)) { outline = o; body = k; } });
  if (!outline || area(outline) < 0.03) { // no big closed shape: wrap everything in a rounded hull
    const all = a.strokes.flatMap(pts); const cx = all.reduce((s, p) => s + p[0], 0) / all.length, cy = all.reduce((s, p) => s + p[1], 0) / all.length;
    outline = []; body = null;
    for (let i = 0; i < 40; i++) { const an = (i / 40) * Math.PI * 2, dx = Math.cos(an), dy = Math.sin(an); let far = 0.12; all.forEach((p) => { const d = (p[0] - cx) * dx + (p[1] - cy) * dy; if (d > far) far = d; }); outline.push([cx + dx * (far + 0.05), cy + dy * (far + 0.05)]); }
  }
  const thin = outline.filter((p, i) => i % Math.max(1, Math.floor(outline.length / 90)) === 0);
  const shape = new T.Shape(); thin.forEach((p, i) => (i ? shape.lineTo(p[0], p[1]) : shape.moveTo(p[0], p[1]))); shape.closePath();
  // the drawing as a texture for the front and back
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), S = 5.12;
  const bodyCol = body ? body.c : '#FFD9EC', tint = (hex) => { const n = parseInt(hex.slice(1), 16); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * 0.3).toString(16).padStart(2, '0')).join(''); };
  g.fillStyle = tint(bodyCol); g.fillRect(0, 0, 512, 512); g.lineCap = g.lineJoin = 'round';
  a.strokes.forEach((k) => { g.beginPath(); for (let i = 0; i < k.p.length; i += 2) (i ? g.lineTo(k.p[i] * S, k.p[i + 1] * S) : g.moveTo(k.p[i] * S, k.p[i + 1] * S)); if (k.f) { g.closePath(); g.fillStyle = tint(k.c); g.fill(); } g.strokeStyle = k.c; g.lineWidth = k.w * S; g.stroke(); });
  a.faces.forEach((f) => {
    const s = f.s * S, x = f.x * S, y = f.y * S;
    [-9, 9].forEach((dx) => { g.fillStyle = '#2A1846'; g.beginPath(); g.ellipse(x + dx * s, y, 2.7 * s, 3.3 * s, 0, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x + dx * s - 0.8 * s, y - 1.2 * s, s, 0, 7); g.fill(); });
    g.strokeStyle = '#2A1846'; g.lineWidth = 1.5 * s; g.beginPath(); g.moveTo(x - 3 * s, y + 3.5 * s); g.quadraticCurveTo(x, y + 6.7 * s, x + 3 * s, y + 3.5 * s); g.stroke();
    g.fillStyle = 'rgba(255,95,158,.45)'; [-15, 15].forEach((dx) => { g.beginPath(); g.arc(x + dx * s, y + 4.5 * s, 3.2 * s, 0, 7); g.fill(); });
  });
  const tex = new T.CanvasTexture(c); tex.encoding = T.sRGBEncoding;
  const geo = new T.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.13, bevelSize: 0.035, bevelSegments: 10, curveSegments: 8, steps: 1 });
  const front = new T.MeshPhysicalMaterial({ map: tex, roughness: 0.45, clearcoat: 0.5, clearcoatRoughness: 0.35 });
  const side = new T.MeshPhysicalMaterial({ color: new T.Color(tint(bodyCol)).convertSRGBToLinear(), roughness: 0.45, clearcoat: 0.5, clearcoatRoughness: 0.35 });
  const mesh = new T.Mesh(geo, [front, side]);
  geo.computeBoundingBox(); const bb = geo.boundingBox, w = bb.max.x - bb.min.x, h = bb.max.y - bb.min.y, k = 2.1 / Math.max(w, h);
  mesh.position.set(-(bb.min.x + w / 2) * k, -bb.min.y * k, -((bb.min.z + bb.max.z) / 2) * k); mesh.scale.setScalar(k);
  const toy = new T.Group(); toy.add(mesh);
  return toy;
}

function build(T, t) {
  if (t.custom) return buildDrawing(T, t);
  const base = new T.Color(COL[t.c1] || COL.pink).convertSRGBToLinear();
  const dark = base.clone().multiplyScalar(0.72), isDark = base.r * 0.3 + base.g * 0.59 + base.b * 0.11 < 0.22 || t.fx === 'galaxy';
  const skin = (color, o = {}) => new T.MeshPhysicalMaterial({ color, roughness: 0.42, clearcoat: 0.55, clearcoatRoughness: 0.35, ...o });
  let bodyMat = skin(base, t.c1 === 'gold' ? { metalness: 0.55, roughness: 0.28 } : {});
  if (t.fx === 'rainbow') bodyMat = skin(0xffffff, { map: gradientTexture(T, ['#F0524F', '#FF9A3D', '#FFD84A', '#9BD84A', '#8ED3FF', '#C9A8FF']) });
  if (t.fx === 'galaxy') bodyMat = skin(0xffffff, { map: gradientTexture(T, ['#2B2A7A', '#7E57C9', '#F06FB4'], true) });
  if (t.fx === 'glitter') { bodyMat.clearcoat = 1; bodyMat.clearcoatRoughness = 0.1; }
  const pink = skin(new T.Color('#FF9CC4').convertSRGBToLinear());
  const g = new T.Group(); // origin at the middle of the body
  const add = (geo, mat, x, y, z, s) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); if (s) m.scale.set(s[0], s[1], s[2]); g.add(m); return m; };
  const ball = (r) => new T.SphereGeometry(r, 28, 20);
  const front = (x, y) => C * Math.sqrt(Math.max(0, 1 - (x / A) ** 2 - (y / B) ** 2)); // z of the body surface
  const faceOut = (m) => { const p = m.position; m.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), new T.Vector3(p.x / A ** 2, p.y / B ** 2, p.z / C ** 2).normalize()); return m; };

  if (t.v === 'gooball') { // a plain glossy goo ball: no face, extra shine
    bodyMat.clearcoat = 1; bodyMat.clearcoatRoughness = 0.08; bodyMat.roughness = 0.25;
    add(new T.SphereGeometry(1, 56, 40), bodyMat, 0, 0, 0, [1.05, 1, 1.05]);
    const ball3 = new T.Group(); g.position.y = 1; ball3.add(g); if (t.big) ball3.scale.setScalar(1.15);
    return ball3;
  }
  add(new T.SphereGeometry(1, 56, 40), bodyMat, 0, 0, 0, [A, B, C]);

  // face
  const eyeMat = new T.MeshStandardMaterial({ color: isDark ? 0xffffff : INK, roughness: 0.15 });
  const white = new T.MeshBasicMaterial({ color: 0xffffff });
  const mouthMat = new T.MeshBasicMaterial({ color: isDark ? 0xffffff : INK });
  if (t.v !== 'frog') [-1, 1].forEach((sx) => {
    const x = sx * 0.37, y = 0.1, z = front(x, y);
    faceOut(add(ball(0.1), eyeMat, x, y, z - 0.02, [1, 1.22, 0.55]));
    if (!isDark) add(ball(0.032), white, x - 0.035, y + 0.045, z + 0.035);
  });
  if (t.v !== 'pig') {
    const w = t.v === 'frog' ? 0.22 : 0.1, my = t.v === 'frog' ? -0.02 : -0.08;
    const m = add(new T.TorusGeometry(w, 0.02, 8, 24, Math.PI), mouthMat, 0, my, front(0, my) + 0.012);
    m.rotation.z = Math.PI;
  }
  const blush = new T.MeshBasicMaterial({ color: 0xff5f9e, transparent: true, opacity: 0.42, depthWrite: false });
  [-1, 1].forEach((sx) => { const x = sx * 0.66, y = -0.08; faceOut(add(new T.CircleGeometry(0.13, 24), blush, x, y, front(x, y) + 0.008)); });

  // ears, tails and extras
  const cone = (r, h) => new T.ConeGeometry(r, h, 28);
  const catEars = (mat, inner) => [-1, 1].forEach((sx) => {
    add(cone(0.4, 0.8), mat, sx * 0.66, 0.9, 0).rotation.z = -sx * 0.45;
    if (inner) { const e = add(cone(0.24, 0.5), inner, sx * 0.67, 0.92, 0.16); e.rotation.z = -sx * 0.45; e.rotation.x = 0.2; }
  });
  switch (t.v) {
    case 'cat': catEars(bodyMat, pink); add(ball(0.2), bodyMat, 0.25, -0.5, -0.95, [1, 1, 1.5]); break;
    case 'unicorn': {
      catEars(bodyMat, pink);
      const gold = skin(new T.Color('#F5B921').convertSRGBToLinear(), { metalness: 0.5, roughness: 0.25 });
      add(cone(0.13, 0.7), gold, 0, 1.2, 0.25).rotation.x = 0.2;
      [['#FF8FC0', 0.5], ['#C9A8FF', 0.15], ['#8ED3FF', -0.2]].forEach(([c, y], i) => add(ball(0.26), skin(new T.Color(c).convertSRGBToLinear()), 0.2 * (i % 2 ? -1 : 1), y + 0.3, -0.75 - i * 0.08));
      break;
    }
    case 'bear': [-1, 1].forEach((sx) => { add(ball(0.32), bodyMat, sx * 0.82, 0.68, 0); add(ball(0.19), skin(dark), sx * 0.82, 0.68, 0.2, [1, 1, 0.5]); });
      add(ball(0.26), skin(base.clone().lerp(new T.Color(1, 1, 1), 0.55)), 0, -0.1, front(0, -0.1) - 0.12, [1.15, 0.85, 0.6]); add(ball(0.2), bodyMat, 0, -0.45, -0.98); break;
    case 'bunny': [-1, 1].forEach((sx) => {
      const e = add(ball(1), bodyMat, sx * 0.4, 1.3, 0, [0.22, 0.66, 0.17]); e.rotation.z = -sx * 0.16;
      const i = add(ball(1), pink, sx * 0.4, 1.3, 0.13, [0.11, 0.48, 0.06]); i.rotation.z = -sx * 0.16;
    }); add(ball(0.24), skin(0xffffff), 0, -0.4, -0.97); break;
    case 'frog': [-1, 1].forEach((sx) => { add(ball(0.33), bodyMat, sx * 0.5, 0.8, 0.25); add(ball(0.21), skin(0xffffff), sx * 0.5, 0.84, 0.44); add(ball(0.1), eyeMat, sx * 0.5, 0.85, 0.6); }); break;
    case 'pig': {
      catEars(skin(dark));
      const sn = add(new T.CylinderGeometry(0.24, 0.26, 0.16, 28), skin(dark), 0, -0.1, front(0, -0.1) + 0.02); sn.rotation.x = Math.PI / 2;
      [-1, 1].forEach((sx) => add(ball(0.045), eyeMat, sx * 0.09, -0.1, front(0, -0.1) + 0.1, [1, 1.4, 0.6]));
      const tail = add(new T.TorusGeometry(0.12, 0.04, 8, 20, Math.PI * 1.6), skin(dark), 0, -0.2, -1.05); tail.rotation.y = Math.PI / 2;
      break;
    }
    case 'dino': for (let i = 0; i < 6; i++) {
      const a = 0.1 + i * 0.42, y = B * Math.cos(a), z = -C * Math.sin(a);
      const sp = add(cone(0.16, 0.34), skin(dark), 0, y * 1.08, z * 1.08);
      sp.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(0, y / B ** 2, z / C ** 2).normalize());
    } break;
    default: break;
  }
  const toy = new T.Group(); // origin on the ground, so squashing keeps it sitting on the table
  g.position.y = B; toy.add(g);
  const wrap = new T.Group(); wrap.add(toy); if (t.big) wrap.scale.setScalar(1.15);
  return wrap;
}

export async function mount3D(host, id) {
  if (!host || !can3D(id)) return false;
  try { await load(); } catch { return false; }
  if (!host.isConnected) return false;
  dispose3D();
  const T = window.THREE, t = TOYS[id];
  let renderer;
  try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch { return false; }
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const canvas = renderer.domElement; canvas.className = 'toy-3d';
  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(30, 1, 0.1, 50); cam.position.set(0, 1.55, 5.7); cam.lookAt(0, 1.08, 0);
  scene.add(new T.HemisphereLight(0xffffff, 0xf2c9a8, 0.62));
  const key = new T.DirectionalLight(0xffffff, 0.72); key.position.set(-3, 5, 4); scene.add(key);
  const rim = new T.PointLight(0xffc9e2, 0.5); rim.position.set(3, 2.5, -3); scene.add(rim);
  const toy = build(T, t); scene.add(toy);
  const shadow = new T.Mesh(new T.PlaneGeometry(3.4, 3.4), new T.MeshBasicMaterial({ map: shadowTexture(T), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.005; scene.add(shadow);

  host.classList.add('is3d'); host.append(canvas);
  const size = () => { const w = host.clientWidth || 200; renderer.setSize(w, w, false); };
  size();
  const ro = 'ResizeObserver' in window ? new ResizeObserver(size) : null; if (ro) ro.observe(host);

  // interaction: drag to spin, press to squash
  let hover = false, pressed = false, lastX = 0, lastY = 0, yaw = 0, pitch = 0, yawV = 0, idle = 0, sq = 0, sqV = 0, lean = 0, leanT = 0;
  const down = (e) => { pressed = true; lastX = e.clientX; lastY = e.clientY; idle = 0; const r = canvas.getBoundingClientRect(); leanT = ((e.clientX - r.left) / r.width - 0.5) * 0.5; };
  const move = (e) => { if (!pressed) return; const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; yawV = dx * 0.012; yaw += yawV; pitch = Math.max(-0.35, Math.min(0.45, pitch + dy * 0.006)); idle = 0; };
  const up = () => { pressed = false; leanT = 0; };
  canvas.addEventListener('pointerenter', (e) => { hover = e.pointerType === 'mouse'; }); canvas.addEventListener('pointerleave', () => { hover = false; });
  canvas.addEventListener('pointerdown', down); window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf = 0, last = performance.now(), time = 0, dead = false;
  const frame = (now) => {
    if (dead) return;
    if (!host.isConnected) return stop();
    const dt = Math.min(0.04, (now - last) / 1000); last = now; time += dt; idle += dt;
    // jelly spring: squash while pressed, wobble back when let go
    sqV += (190 * ((pressed ? 1 : hover ? 0.22 : 0) - sq) - 11 * sqV) * dt; sq += sqV * dt;
    lean += (leanT - lean) * Math.min(1, dt * 10);
    if (!pressed) { yaw += yawV; yawV *= 0.93; pitch += (0 - pitch) * Math.min(1, dt * 3); }
    if (idle > 2.5 && !still) { const home = Math.round(yaw / (Math.PI * 2)) * Math.PI * 2 + Math.sin(time * 0.7) * 0.38; yaw += (home - yaw) * Math.min(1, dt * 1.6); }
    const breathe = still ? 0 : Math.sin(time * 2) * 0.012;
    const sy = 1 - 0.36 * sq + breathe, sxz = 1 + 0.24 * sq - breathe * 0.6;
    toy.scale.set(sxz, sy, sxz); toy.rotation.set(pitch, yaw, -lean * (0.4 + sq));
    shadow.scale.setScalar(0.92 + 0.22 * sq); shadow.material.opacity = 0.85 + 0.15 * sq;
    renderer.render(scene, cam);
    raf = requestAnimationFrame(frame);
  };
  function stop() {
    if (dead) return; dead = true; cancelAnimationFrame(raf);
    if (ro) ro.disconnect();
    window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
    scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach((m) => { if (m.map && m.map.dispose) m.map.dispose(); m.dispose(); }); });
    renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss();
    canvas.remove(); host.classList.remove('is3d');
    if (live === stop) live = null;
  }
  live = stop;
  raf = requestAnimationFrame(frame);
  return true;
}
