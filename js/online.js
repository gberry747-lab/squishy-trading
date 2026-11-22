// Online rooms. Devices connect straight to each other (WebRTC through PeerJS).
// The player who makes the room passes messages between everyone else.
import { TOYS } from './data.js';

const PREFIX = 'gesquishy-v1-';
const LETTERS = 'BCDFGHJKLMNPQRSTVWXZ';
const makeCode = () => Array.from({ length: 4 }, () => LETTERS[Math.floor(Math.random() * LETTERS.length)]).join('');

function loadPeer() {
  return new Promise((res, rej) => {
    if (window.Peer) return res();
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
    // Only run this exact file: if it is ever changed on the server, the browser refuses it.
    s.integrity = 'sha384-nlUQ8ZqCbvStErob+biJNzSgltf6urV3VGqhfIfzhmg9RXmpeRm76ELw0pYnKlTR'; s.crossOrigin = 'anonymous';
    s.onload = res; s.onerror = () => rej(new Error('offline'));
    document.head.append(s);
  });
}
// Never trust what arrives from another device.
export const cleanInfo = (i) => ({ name: String(i?.name || 'Friend').slice(0, 14), avatar: TOYS[i?.avatar] ? i.avatar : 'sq01' });
export const cleanToys = (a) => (Array.isArray(a) ? a.filter((id) => TOYS[id]).slice(0, 6) : []);
export const cleanCoins = (n) => Math.max(0, Math.min(9999, Math.floor(Number(n) || 0)));
export function cleanInv(o) {
  const out = {};
  if (o && typeof o === 'object') for (const id in o) if (TOYS[id]) out[id] = Math.max(0, Math.min(99, Math.floor(Number(o[id]) || 0)));
  return out;
}

export class Room {
  constructor(info) { this.info = cleanInfo(info); this.h = {}; this.players = []; this.conns = {}; }
  on(e, f) { this.h[e] = f; }
  emit(e, ...a) { if (this.h[e]) this.h[e](...a); }

  async host() {
    await loadPeer();
    return new Promise((res, rej) => {
      const attempt = (n) => {
        const code = makeCode(), peer = new window.Peer(PREFIX + code);
        peer.on('open', () => {
          this.peer = peer; this.code = code; this.me = 'host'; this.isHost = true;
          this.players = [{ id: 'host', ...this.info }];
          peer.on('connection', (c) => this.accept(c));
          res(code);
        });
        peer.on('error', (err) => {
          if (err.type === 'unavailable-id' && n < 4) { peer.destroy(); attempt(n + 1); }
          else if (!this.peer) rej(err); else this.emit('error', err);
        });
      };
      attempt(0);
    });
  }
  accept(c) {
    c.on('data', (m) => {
      if (!m || typeof m !== 'object') return;
      if (m.t === 'hello') {
        if (this.players.length >= 6) return c.send({ t: 'full' });
        if (this.conns[c.peer]) return;
        this.conns[c.peer] = c;
        this.players.push({ id: c.peer, ...cleanInfo(m.info) });
        this.sync();
      } else if (!this.conns[c.peer]) return;
      else if (m.to === 'host') this.emit('msg', c.peer, m);
      else if (typeof m.to === 'string' && Object.prototype.hasOwnProperty.call(this.conns, m.to)) this.conns[m.to].send({ ...m, from: c.peer });
    });
    c.on('close', () => this.drop(c.peer));
    c.on('error', () => this.drop(c.peer));
  }
  drop(id) {
    if (!this.conns[id]) return;
    delete this.conns[id];
    this.players = this.players.filter((p) => p.id !== id);
    this.sync();
  }
  sync() {
    Object.values(this.conns).forEach((c) => c.send({ t: 'room', players: this.players }));
    this.emit('players');
  }

  async join(code) {
    await loadPeer();
    return new Promise((res, rej) => {
      const peer = new window.Peer();
      const fail = (err) => { clearTimeout(timer); if (!this.joined) { peer.destroy(); rej(err); } else this.emit('closed'); };
      const timer = setTimeout(() => fail(new Error('timeout')), 15000);
      peer.on('open', (id) => {
        this.me = id;
        const c = peer.connect(PREFIX + code, { reliable: true });
        this.hostConn = c;
        c.on('open', () => c.send({ t: 'hello', info: this.info }));
        c.on('data', (m) => {
          if (!m || typeof m !== 'object') return;
          if (m.t === 'room' && Array.isArray(m.players)) {
            this.players = m.players.filter((p) => p && typeof p === 'object' && p.id != null).slice(0, 6).map((p) => ({ id: String(p.id), ...cleanInfo(p) }));
            if (!this.joined) { this.joined = true; clearTimeout(timer); this.peer = peer; this.code = code; res(code); }
            this.emit('players');
          } else if (m.t === 'full') fail(new Error('full'));
          else this.emit('msg', String(m.from), m);
        });
        c.on('close', () => fail(new Error('closed')));
      });
      peer.on('error', fail);
    });
  }

  send(to, m) {
    if (this.isHost) { if (this.conns[to]) this.conns[to].send({ ...m, from: 'host', to }); }
    else if (this.hostConn && this.hostConn.open) this.hostConn.send({ ...m, to });
  }
  leave() { this.h = {}; try { if (this.peer) this.peer.destroy(); } catch { /* already closed */ } }
}
