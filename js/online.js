// Online rooms. Devices connect straight to each other (WebRTC through PeerJS).
// The player who makes the room passes messages between everyone else.
import { TOYS } from './data.js';

const PREFIX = 'gesquishy-v1-';
const LETTERS = 'BCDFGHJKLMNPQRSTVWXZ';
export const MAX_PLAYERS = 6; // everyone in a room, counting the player who made it
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

// How devices find a way to each other. (The free relay servers that come with PeerJS no longer exist.)
const NET = { config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun.cloudflare.com:3478' }] } };
const JOIN_WAIT = 25000;   // how long a first join keeps trying
const REJOIN_WAIT = 60000; // how long we keep trying to get back after the connection drops

export class Room {
  constructor(info) { this.info = cleanInfo(info); this.h = {}; this.players = []; this.conns = {}; }
  on(e, f) { this.h[e] = f; }
  emit(e, ...a) { if (this.h[e]) this.h[e](...a); }

  // A tablet that sleeps, or a child who switches apps to share the code, drops the link to the
  // meeting-point server. Without that link nobody new can find this device, so keep it open.
  keepOpen(peer) {
    let tries = 0, timer = null, hidden = 0;
    const again = () => {
      clearTimeout(timer);
      if (this.gone || peer.destroyed) return;
      if (!peer.disconnected) { tries = 0; return; }
      try { peer.reconnect(); } catch { /* try again below */ }
      timer = setTimeout(again, Math.min(8000, 1000 * 2 ** tries++));
    };
    peer.on('disconnected', () => { clearTimeout(timer); timer = setTimeout(again, 400); });
    this.wake = () => {
      if (this.gone || peer.destroyed) return;
      if (document.visibilityState === 'hidden') { hidden = Date.now(); return; }
      // After a long sleep the link can look fine but be dead: start it fresh.
      if (hidden && Date.now() - hidden > 8000 && !peer.disconnected) { try { peer.disconnect(); } catch { /* fine */ } }
      hidden = 0; again();
    };
    document.addEventListener('visibilitychange', this.wake);
    window.addEventListener('online', this.wake);
    window.addEventListener('pageshow', this.wake);
  }

  async host() {
    await loadPeer();
    return new Promise((res, rej) => {
      const attempt = (n) => {
        const code = makeCode(), peer = new window.Peer(PREFIX + code, NET);
        peer.on('open', () => {
          if (this.peer) return; // this fires again each time the link comes back
          this.peer = peer; this.code = code; this.me = 'host'; this.isHost = true;
          this.players = [{ id: 'host', ...this.info }];
          peer.on('connection', (c) => this.accept(c));
          this.keepOpen(peer);
          res(code);
        });
        peer.on('error', (err) => {
          if (this.peer) return; // later trouble is handled by keepOpen
          if (err.type === 'unavailable-id' && n < 4) { peer.destroy(); attempt(n + 1); }
          else rej(err);
        });
      };
      attempt(0);
    });
  }
  accept(c) {
    c.on('data', (m) => {
      if (!m || typeof m !== 'object') return;
      if (m.t === 'hello') {
        const old = this.conns[c.peer];
        if (old === c) return;
        if (old) { // the same friend coming back after their connection dropped
          this.conns[c.peer] = c;
          try { old.close(); } catch { /* already closed */ }
          return this.sync();
        }
        if (this.players.length >= MAX_PLAYERS) return c.send({ t: 'full' });
        this.conns[c.peer] = c;
        this.players.push({ id: c.peer, ...cleanInfo(m.info) });
        this.sync();
      } else if (this.conns[c.peer] !== c) return;
      else if (m.to === 'host') this.emit('msg', c.peer, m);
      else if (typeof m.to === 'string' && Object.prototype.hasOwnProperty.call(this.conns, m.to)) this.conns[m.to].send({ ...m, from: c.peer });
    });
    // Give a friend whose connection dropped a little time to come back before taking them out.
    const lost = () => { if (this.conns[c.peer] === c) setTimeout(() => this.drop(c.peer, c), 12000); };
    c.on('close', lost);
    c.on('error', lost);
  }
  drop(id, c) {
    if (!this.conns[id] || (c && this.conns[id] !== c)) return;
    delete this.conns[id];
    this.players = this.players.filter((p) => p.id !== id);
    this.sync();
  }
  sync() {
    Object.values(this.conns).forEach((c) => { if (c.open) c.send({ t: 'room', players: this.players }); });
    this.emit('players');
  }

  async join(code) {
    await loadPeer();
    return new Promise((res, rej) => {
      const peer = new window.Peer(NET);
      let over = false, redial = null, giveUp = null, away = false, missed = null;
      const stop = (err) => {
        if (over) return; over = true;
        clearTimeout(redial); clearTimeout(giveUp); clearTimeout(missed);
        if (!this.joined) { rej(err); this.gone = true; peer.destroy(); } else this.emit('closed');
      };
      // The server says so when a room is not there. If it never did and we still could not get in,
      // the two networks are blocking each other.
      giveUp = setTimeout(() => stop(new Error('blocked')), JOIN_WAIT);
      const dial = () => {
        clearTimeout(redial);
        if (over || this.gone) return;
        if (peer.disconnected) { redial = setTimeout(dial, 1500); return; } // keepOpen is bringing the link back
        const c = peer.connect(PREFIX + code, { reliable: true });
        this.hostConn = c;
        c.on('open', () => c.send({ t: 'hello', info: this.info }));
        c.on('data', (m) => {
          if (this.hostConn !== c || !m || typeof m !== 'object') return;
          if (m.t === 'room' && Array.isArray(m.players)) {
            this.players = m.players.filter((p) => p && typeof p === 'object' && p.id != null).slice(0, MAX_PLAYERS).map((p) => ({ id: String(p.id), ...cleanInfo(p) }));
            clearTimeout(giveUp); clearTimeout(missed); away = false;
            if (!this.joined) { this.joined = true; this.peer = peer; this.code = code; res(code); }
            this.emit('players');
          } else if (m.t === 'full') stop(new Error('full'));
          else this.emit('msg', String(m.from), m);
        });
        const lost = () => {
          if (this.hostConn !== c || over || this.gone) return;
          if (this.joined && !away) { // we were in the room: quietly try to get back in
            away = true; this.emit('error');
            clearTimeout(giveUp); giveUp = setTimeout(() => stop(new Error('closed')), REJOIN_WAIT);
          }
          redial = setTimeout(dial, 1500);
        };
        c.on('close', lost);
        c.on('error', lost);
      };
      peer.on('open', () => { if (!this.me) { this.me = peer.id; this.keepOpen(peer); dial(); } });
      peer.on('error', (err) => {
        if (over) return;
        // The room maker may be reconnecting: keep knocking until the time runs out.
        if (err.type === 'peer-unavailable') {
          // The server said "no such room". Keep knocking for 8 more seconds in case it is coming back.
          if (!this.joined && !missed) missed = setTimeout(() => stop(new Error('timeout')), 8000);
          clearTimeout(redial); redial = setTimeout(dial, 1500); return; }
        if (this.me) return; // our own link dropped: keepOpen brings it back
        stop(err);
      });
    });
  }

  send(to, m) {
    if (this.isHost) { if (this.conns[to] && this.conns[to].open) this.conns[to].send({ ...m, from: 'host', to }); }
    else if (this.hostConn && this.hostConn.open) this.hostConn.send({ ...m, to });
  }
  leave() {
    this.h = {}; this.gone = true;
    if (this.wake) { document.removeEventListener('visibilitychange', this.wake); window.removeEventListener('online', this.wake); window.removeEventListener('pageshow', this.wake); }
    try { if (this.peer) this.peer.destroy(); } catch { /* already closed */ }
  }
}
