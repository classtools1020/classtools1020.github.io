// 光線小鎮：竹東風街景（騎樓、鐵窗、水塔、機車、欒樹、電線桿、內灣線、竹東溪）
import * as THREE from './lib/three.module.min.js';

export const SPOT = {};          // 任務地點：{pos, look, cam}
const matCache = new Map();
export function M(c, o) {
  const k = c + JSON.stringify(o || {});
  if (!matCache.has(k)) matCache.set(k, new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .85, metalness: 0 }, o || {})));
  return matCache.get(k);
}
export function box(w, h, d, mat, x, y, z, p) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (p) p.add(m); return m;
}
export function cyl(rt, rb, h, mat, x, y, z, p, seg = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (p) p.add(m); return m;
}
const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
export const rand = rnd;

// ---------- 畫布貼圖 ----------
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function tex(c, rep) {
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}
function noiseCanvas(base, amt, size = 256, extra) {
  const [c, g] = canvas(size, size); g.fillStyle = base; g.fillRect(0, 0, size, size);
  const im = g.getImageData(0, 0, size, size), d = im.data;
  for (let i = 0; i < d.length; i += 4) { const n = (rnd() - .5) * amt; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(im, 0, 0); if (extra) extra(g, size); return c;
}
export const FONT = '"Noto Sans TC","Microsoft JhengHei","PingFang TC",sans-serif';
export function signTex(text, o = {}) {
  const W = o.w || 1024, H = o.h || 256;
  const [c, g] = canvas(W, H);
  g.fillStyle = o.bg || '#fff'; g.fillRect(0, 0, W, H);
  if (o.border) { g.strokeStyle = o.border; g.lineWidth = H * .07; g.strokeRect(H * .05, H * .05, W - H * .1, H - H * .1); }
  g.fillStyle = o.fg || '#111'; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (o.vertical) {
    const chars = [...text], fs = Math.min(W * .78, H / chars.length * .86);
    g.font = `900 ${fs}px ${FONT}`;
    chars.forEach((ch, i) => g.fillText(ch, W / 2, H / chars.length * (i + .5)));
  } else {
    let fs = o.fs || H * .62; g.font = `900 ${fs}px ${FONT}`;
    while (g.measureText(text).width > W * .9 && fs > 10) { fs -= 4; g.font = `900 ${fs}px ${FONT}`; }
    g.fillText(text, W / 2, H * (o.y || .54));
    if (o.sub) { g.font = `700 ${H * .2}px ${FONT}`; g.fillText(o.sub, W / 2, H * .84); }
  }
  return tex(c);
}

// 立面：鐵窗、冷氣、陽台花草、晾衣服
function facadeTex(wall, floors, cols, seed) {
  const W = 512, H = 256 * floors; const [c, g] = canvas(W, H);
  g.fillStyle = wall; g.fillRect(0, 0, W, H);
  // 磁磚紋
  g.globalAlpha = .08; g.strokeStyle = '#000'; g.lineWidth = 1;
  for (let y = 0; y < H; y += 10) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.globalAlpha = 1;
  for (let f = 0; f < floors; f++) {
    const y0 = f * 256;
    // 樓板線
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, y0 + 244, W, 12);
    const cw = W / cols;
    for (let k = 0; k < cols; k++) {
      const x = k * cw + cw * .14, w = cw * .72, y = y0 + 52, h = 150;
      const r = (seed * 31 + f * 7 + k * 13) % 10;
      // 玻璃
      const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, '#8fb3c9'); gr.addColorStop(.5, '#5d7f96'); gr.addColorStop(1, '#2f4558');
      g.fillStyle = gr; g.fillRect(x, y, w, h);
      // 窗簾
      if (r % 3 === 0) { g.fillStyle = ['#e9d8b4', '#d6e3f0', '#f2c6c6'][r % 3 === 0 ? (k % 3) : 0]; g.fillRect(x + 4, y + 4, w * .4, h - 8); }
      // 鋁框
      g.strokeStyle = '#dfe3e6'; g.lineWidth = 6; g.strokeRect(x, y, w, h);
      g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h); g.stroke();
      // 鐵窗
      if (r < 6) {
        g.strokeStyle = r < 3 ? '#e6e6e6' : '#6b6f72'; g.lineWidth = 4;
        g.strokeRect(x - 10, y - 14, w + 20, h + 20);
        for (let i = 1; i < 8; i++) { const xx = x - 10 + (w + 20) * i / 8; g.beginPath(); g.moveTo(xx, y - 14); g.lineTo(xx, y + h + 6); g.stroke(); }
        g.beginPath(); g.moveTo(x - 10, y + h * .55); g.lineTo(x + w + 10, y + h * .55); g.stroke();
        // 盆栽
        if (r % 2 === 0) { for (let i = 0; i < 4; i++) { g.fillStyle = '#9b5b36'; g.fillRect(x + i * w / 4 + 6, y + h - 10, 22, 16); g.fillStyle = ['#3f8f3a', '#5aa64a', '#2f7a34'][i % 3]; g.beginPath(); g.arc(x + i * w / 4 + 17, y + h - 16, 16, 0, Math.PI * 2); g.fill(); } }
      }
      // 冷氣
      if (r === 2 || r === 7 || r === 5) { g.fillStyle = '#eceff0'; g.fillRect(x + w * .55, y + h + 18, 70, 40); g.fillStyle = '#9aa3a8'; for (let i = 0; i < 6; i++) g.fillRect(x + w * .55 + 6, y + h + 22 + i * 6, 58, 2); }
      // 晾衣
      if (r === 8) { g.strokeStyle = '#555'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 6, y + 30); g.lineTo(x + w + 6, y + 30); g.stroke();
        ['#ff7a7a', '#7ab8ff', '#ffe07a', '#ffffff'].forEach((cc, i) => { g.fillStyle = cc; g.fillRect(x + 10 + i * w / 4.4, y + 30, 26, 40); }); }
    }
  }
  return tex(c);
}

// 店面（騎樓裡）
function shopTex(kind) {
  const [c, g] = canvas(1024, 512);
  g.fillStyle = '#2a2a2a'; g.fillRect(0, 0, 1024, 512);
  // 室內暖光
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#fff3d6'); gr.addColorStop(1, '#e8d2a8');
  g.fillStyle = gr; g.fillRect(30, 40, 964, 472);
  const shelf = (cols) => { for (let r = 0; r < 4; r++) { g.fillStyle = '#b9a07a'; g.fillRect(60, 110 + r * 90, 600, 8);
    for (let i = 0; i < 18; i++) { g.fillStyle = cols[(i + r) % cols.length]; g.fillRect(66 + i * 33, 64 + r * 90, 26, 46); } } };
  if (kind === 'store') shelf(['#e94f4f', '#f7c548', '#4fb3e9', '#5fd068', '#ff9a3c', '#ffffff', '#9a6ff0']);
  else if (kind === 'tea') { g.fillStyle = '#4a2f1f'; g.fillRect(40, 300, 940, 212); for (let i = 0; i < 10; i++) { g.fillStyle = ['#c98b4a', '#f2e2c4', '#7a4a2a', '#e8b25a'][i % 4]; g.fillRect(80 + i * 88, 220, 52, 80); g.fillStyle = '#fff'; g.fillRect(80 + i * 88, 214, 52, 10); }
    g.fillStyle = '#1d1d1d'; g.fillRect(560, 60, 400, 140); g.fillStyle = '#ffe9a8'; g.font = `900 40px ${FONT}`; g.fillText('珍珠奶茶  45', 590, 110); g.fillText('冬瓜檸檬  40', 590, 170); }
  else if (kind === 'glasses') { for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) { const x = 120 + i * 120, y = 120 + r * 110; g.strokeStyle = ['#222', '#8a4a2a', '#c23', '#246'][(i + r) % 4]; g.lineWidth = 7; g.beginPath(); g.arc(x - 24, y, 20, 0, 7); g.arc(x + 24, y, 20, 0, 7); g.stroke(); } }
  else if (kind === 'noodle') { g.fillStyle = '#8a2a1f'; g.fillRect(40, 300, 940, 212); g.fillStyle = '#fff'; g.font = `900 52px ${FONT}`; g.fillText('牛肉麵 120', 120, 140); g.fillText('乾麵 50　貢丸湯 30', 120, 220); }
  else if (kind === 'pharm') shelf(['#ffffff', '#59b36b', '#f2f2f2', '#6cc5e8', '#f7d57a']);
  else if (kind === 'scooter') { g.fillStyle = '#555'; g.fillRect(40, 380, 940, 132); for (let i = 0; i < 5; i++) { g.fillStyle = ['#d33', '#eee', '#39c', '#222', '#fc3'][i]; g.beginPath(); g.ellipse(160 + i * 170, 330, 70, 40, 0, 0, 7); g.fill(); } }
  else if (kind === 'grocery') shelf(['#d9a441', '#7bb661', '#e86f5a', '#f0e2b6', '#5b8bd6']);
  else { g.fillStyle = '#d8d0c0'; g.fillRect(30, 40, 964, 472); }
  // 鐵捲門收在上面＋玻璃反光
  g.fillStyle = '#9aa0a4'; g.fillRect(0, 0, 1024, 40); g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.moveTo(300, 40); g.lineTo(420, 40); g.lineTo(200, 512); g.lineTo(80, 512); g.fill();
  // 門框
  g.strokeStyle = '#444'; g.lineWidth = 10; g.strokeRect(30, 40, 964, 472); g.beginPath(); g.moveTo(700, 40); g.lineTo(700, 512); g.stroke();
  return tex(c);
}

// ---------- 建築 ----------
export function building(scene, o) {
  const g = new THREE.Group(); scene.add(g);
  const zf = o.side === 'N' ? -6.6 : 6.6;
  g.position.set(o.x, 0, zf); if (o.side === 'S') g.rotation.y = Math.PI;
  const w = o.w, d = o.d || 12, F = o.floors || 3, FH = 3.2, GH = 3.6, H = GH + (F - 1) * FH;
  const wallM = M(o.wall || '#d9d2c5');
  const arcade = o.arcade !== false, back = arcade ? 2.6 : 0;
  // 上層
  box(w, H - GH, d, wallM, 0, GH + (H - GH) / 2, -d / 2, g);
  // 一樓店面（退縮成騎樓）
  box(w, GH, d - back, wallM, 0, GH / 2, -back - (d - back) / 2, g);
  const front = new THREE.Mesh(new THREE.PlaneGeometry(w - .2, GH - .3), new THREE.MeshStandardMaterial({ map: shopTex(o.shop), roughness: .5, emissive: '#ffffff', emissiveIntensity: .18, emissiveMap: null }));
  front.position.set(0, (GH - .3) / 2, -back + .02); front.receiveShadow = true; g.add(front);
  if (arcade) {
    const cols = Math.max(2, Math.round(w / 4) + 1);
    for (let i = 0; i < cols; i++) box(.45, GH, .45, M(o.col || '#cfc6b6'), -w / 2 + .3 + (w - .6) * i / (cols - 1), GH / 2, -.3, g);
    // 騎樓地板
    const fl = box(w, .16, back, M('#b9a58c', { roughness: .7 }), 0, .08, -back / 2, g); fl.castShadow = false;
  }
  // 立面
  const fac = new THREE.Mesh(new THREE.PlaneGeometry(w, H - GH), new THREE.MeshStandardMaterial({ map: facadeTex(o.wall || '#d9d2c5', F - 1, Math.max(2, Math.round(w / 3)), o.seed || 1), roughness: .8 }));
  fac.position.set(0, GH + (H - GH) / 2, .02); fac.receiveShadow = true; g.add(fac);
  // 屋頂：女兒牆、水塔、鐵皮屋
  box(w, .5, .2, wallM, 0, H + .25, -.1, g); box(w, .5, .2, wallM, 0, H + .25, -d + .1, g);
  const tank = cyl(.7, .7, 1.4, M('#e8e8e8', { roughness: .4, metalness: .3 }), w / 2 - 1.4, H + 1.6, -d + 2, g);
  box(.1, .9, .1, M('#777'), w / 2 - 2, H + .45, -d + 1.4, g); box(.1, .9, .1, M('#777'), w / 2 - .8, H + .45, -d + 2.6, g);
  if ((o.seed || 1) % 2) { box(w * .5, 2.2, d * .4, M('#9fb2bf', { roughness: .5, metalness: .4 }), -w * .2, H + 1.1, -d * .65, g); }
  // 招牌
  if (o.sign) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(w * .92, 1.0, .18), [M('#ddd'), M('#ddd'), M('#ddd'), M('#ddd'), new THREE.MeshStandardMaterial({ map: signTex(o.sign, { bg: o.signBg, fg: o.signFg, border: o.signBorder, sub: o.signSub }), emissive: '#fff', emissiveIntensity: .25, roughness: .6 }), M('#ddd')]);
    s.position.set(0, GH + .55, .12); s.castShadow = true; g.add(s);
  }
  if (o.vsign) {
    const t = signTex(o.vsign, { bg: o.vBg || '#c8102e', fg: o.vFg || '#fff', w: 256, h: 1024, vertical: true });
    const mt = new THREE.MeshStandardMaterial({ map: t, emissive: '#fff', emissiveIntensity: .25 });
    const s = new THREE.Mesh(new THREE.BoxGeometry(.18, 3.2, .9), [mt, mt, M('#ccc'), M('#ccc'), M('#ccc'), M('#ccc')]);
    s.position.set(w / 2 - .4, GH + 2.4, .6); s.castShadow = true; g.add(s);
  }
  g.userData = { w, d, H };
  return g;
}

// ---------- 機車 ----------
export function scooter(p, x, z, ry, color) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; p.add(g);
  const body = M(color, { roughness: .35, metalness: .2 }), blk = M('#222', { roughness: .6 });
  [-.55, .55].forEach(zz => { const w = new THREE.Mesh(new THREE.TorusGeometry(.2, .08, 8, 16), blk); w.position.set(0, .28, zz); w.rotation.y = Math.PI / 2; w.castShadow = true; g.add(w); });
  box(.36, .35, 1.1, body, 0, .5, 0, g);
  box(.32, .14, .55, blk, 0, .76, -.15, g);                  // 座墊
  box(.34, .7, .2, body, 0, .75, .52, g);                     // 前擋
  cyl(.025, .025, .6, M('#888', { metalness: .7, roughness: .3 }), 0, 1.15, .6, g).rotation.z = Math.PI / 2;
  box(.2, .12, .1, M('#fff', { emissive: '#fff', emissiveIntensity: .3 }), 0, 1.0, .64, g);
  return g;
}

// ---------- 台灣欒樹（十月開黃花、結紅果） ----------
export const petals = [];
export function tree(p, x, z, s = 1, kind = 'luan') {
  const g = new THREE.Group(); g.position.set(x, 0, z); p.add(g);
  cyl(.12 * s, .18 * s, 2.6 * s, M('#6b4a30'), 0, 1.3 * s, 0, g, 8);
  const green = kind === 'luan' ? ['#5b8f3a', '#4f8233', '#6b9c45'] : ['#3f7d34', '#356f2c', '#4c8a3e'];
  for (let i = 0; i < 7; i++) {
    const r = (.9 + rnd() * .6) * s; const b = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), M(green[i % 3], { roughness: .9, flatShading: true }));
    b.position.set((rnd() - .5) * 1.8 * s, (3 + rnd() * 1.4) * s, (rnd() - .5) * 1.8 * s); b.castShadow = true; b.receiveShadow = true; g.add(b);
  }
  if (kind === 'luan') {
    const pal = ['#e9c33b', '#f0d24a', '#c9533b', '#d9693f'];
    for (let i = 0; i < 26; i++) {
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(.32 * s, 0), M(pal[i % 4], { roughness: .8, flatShading: true }));
      const a = rnd() * Math.PI * 2, rr = (1.1 + rnd() * .9) * s; c.position.set(Math.cos(a) * rr, (3.2 + rnd() * 1.8) * s, Math.sin(a) * rr); g.add(c);
    }
    petals.push({ x, z, s });
  }
  return g;
}

// ---------- 電線桿＋電線 ----------
function poles(scene, xs, z) {
  const pm = M('#8d8d86', { roughness: .7 }), top = [];
  xs.forEach(x => {
    cyl(.14, .2, 10, pm, x, 5, z, scene, 10);
    box(1.8, .12, .12, M('#555'), x, 9.2, z, scene); box(1.2, .12, .12, M('#555'), x, 8.4, z, scene);
    cyl(.28, .28, .7, M('#6e7a80', { metalness: .4, roughness: .4 }), x + .35, 7.6, z, scene, 12);  // 變壓器
    // 黃黑警示
    const w = cyl(.22, .22, 1.6, new THREE.MeshStandardMaterial({ map: stripeTex() }), x, .8, z, scene, 12); w.castShadow = false;
    top.push(new THREE.Vector3(x, 9.2, z));
  });
  const lm = new THREE.MeshBasicMaterial({ color: '#1d1d1d' });
  [-.8, -.3, .3, .8].forEach((dx, k) => {
    for (let i = 0; i < top.length - 1; i++) {
      const a = top[i].clone().add(new THREE.Vector3(0, k === 1 || k === 2 ? -.8 : 0, dx * .9)), b = top[i + 1].clone().add(new THREE.Vector3(0, k === 1 || k === 2 ? -.8 : 0, dx * .9));
      const mid = a.clone().lerp(b, .5); mid.y -= .7;
      const cur = new THREE.QuadraticBezierCurve3(a, mid, b);
      scene.add(new THREE.Mesh(new THREE.TubeGeometry(cur, 16, .018, 4), lm));
    }
  });
}
let _stripe; function stripeTex() {
  if (_stripe) return _stripe; const [c, g] = canvas(64, 256); g.fillStyle = '#ffd200'; g.fillRect(0, 0, 64, 256); g.fillStyle = '#111';
  for (let y = -64; y < 256; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(64, y + 32); g.lineTo(64, y + 64); g.lineTo(0, y + 32); g.fill(); }
  return (_stripe = tex(c));
}

// ---------- 人 ----------
export function person(p, o = {}) {
  const g = new THREE.Group(); const skin = M(o.skin || '#f1c8a0', { roughness: .6 }); const P = { g };
  const cap = (r, l, mat) => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 6, 12), mat); m.castShadow = true; return m; };
  P.legL = new THREE.Group(); P.legR = new THREE.Group();
  [P.legL, P.legR].forEach((L, i) => { const m = cap(.075, .36, M(o.pants || '#2c3e66')); m.position.y = -.22; L.add(m); L.position.set(i ? .09 : -.09, .5, 0); g.add(L); });
  const body = cap(.18, .3, M(o.shirt || '#ffffff')); body.position.y = .8; g.add(body);
  P.armL = new THREE.Group(); P.armR = new THREE.Group();
  [P.armL, P.armR].forEach((A, i) => { const m = cap(.055, .32, M(o.shirt || '#ffffff')); m.position.y = -.19; A.add(m); const h = new THREE.Mesh(new THREE.SphereGeometry(.06, 10, 8), skin); h.position.y = -.4; A.add(h); A.position.set(i ? .25 : -.25, 1.02, 0); g.add(A); });
  const head = new THREE.Group(); head.position.y = 1.24; g.add(head); P.head = head;
  const hd = new THREE.Mesh(new THREE.SphereGeometry(.17, 24, 18), skin); hd.castShadow = true; head.add(hd);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(.18, 24, 18, 0, Math.PI * 2, 0, Math.PI * .55), M(o.hair || '#2a2220')); hair.rotation.x = -.35; hair.position.z = -.02; head.add(hair);
  if (o.long) { const b = cap(.15, .22, M(o.hair || '#2a2220')); b.position.set(0, -.12, -.1); head.add(b); }
  if (o.capC) { const c = new THREE.Mesh(new THREE.SphereGeometry(.185, 20, 12, 0, Math.PI * 2, 0, Math.PI * .5), M(o.capC)); c.position.y = .03; head.add(c); const br = box(.26, .03, .2, M(o.capC), 0, .05, .2, head); br.castShadow = false; }
  [-.06, .06].forEach(x => { const e = new THREE.Mesh(new THREE.SphereGeometry(.024, 8, 6), M('#222')); e.position.set(x, .02, .158); head.add(e); });
  const mo = new THREE.Mesh(new THREE.TorusGeometry(.04, .012, 6, 12, Math.PI), M('#b03050')); mo.position.set(0, -.055, .16); mo.rotation.z = Math.PI; head.add(mo);
  if (o.bag) box(.3, .36, .14, M(o.bag), 0, .85, -.2, g);
  const s = o.scale || 1; g.scale.setScalar(s);
  p.add(g); return P;
}
export function walkPose(P, t, amp = .5) {
  const a = Math.sin(t) * amp; P.legL.rotation.x = a; P.legR.rotation.x = -a; P.armL.rotation.x = -a * .8; P.armR.rotation.x = a * .8;
}

// ---------- 光光偵探（玩家） ----------
export function koko(p) {
  const g = new THREE.Group(); p.add(g); const K = { g };
  const pts = []; for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i / 10 * Math.PI * 2, r = i % 2 ? .23 : .5; pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r)); }
  const shape = new THREE.Shape(pts);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: .2, bevelEnabled: true, bevelThickness: .08, bevelSize: .06, bevelSegments: 4 }); geo.center();
  const bodyM = new THREE.MeshStandardMaterial({ color: '#ffcf2e', emissive: '#ff9f1a', emissiveIntensity: .3, roughness: .35 });
  const body = new THREE.Mesh(geo, bodyM); body.castShadow = true; body.position.y = .82; g.add(body); K.body = body;
  // 臉
  const face = new THREE.Group(); face.position.set(0, .8, .19); g.add(face); K.face = face;
  [-.13, .13].forEach(x => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(.075, 16, 12), M('#2b1b4a', { roughness: .3 })); e.scale.set(.8, 1.1, .4); e.position.set(x, .02, 0); face.add(e);
    const hl = new THREE.Mesh(new THREE.SphereGeometry(.025, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff' })); hl.position.set(x - .025, .06, .03); face.add(hl);
    const ck = new THREE.Mesh(new THREE.SphereGeometry(.05, 10, 8), new THREE.MeshBasicMaterial({ color: '#ff8fb0' })); ck.scale.set(1, .5, .3); ck.position.set(x * 1.75, -.09, -.01); face.add(ck);
  });
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(.05, .014, 6, 14, Math.PI), new THREE.MeshBasicMaterial({ color: '#b03050' })); mouth.rotation.z = Math.PI; mouth.position.set(0, -.08, .01); face.add(mouth);
  // 偵探帽
  const hat = new THREE.Group(); hat.position.set(0, 1.27, -.02); hat.rotation.z = -.12; g.add(hat);
  const hm = M('#a8743f', { roughness: .8 }), hb = M('#7a4a22', { roughness: .8 });
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(.34, .36, .04, 28), hb); brim.scale.z = .75; brim.castShadow = true; hat.add(brim);
  const crown = new THREE.Mesh(new THREE.SphereGeometry(.24, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), hm); crown.scale.set(1, .8, .9); crown.castShadow = true; hat.add(crown);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(.245, .245, .06, 24, 1, true), M('#3e2410')); band.position.y = .04; hat.add(band);
  // 放大鏡
  const mg = new THREE.Group(); mg.position.set(.48, .7, .12); mg.rotation.z = -.5; g.add(mg); K.mag = mg;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.15, .03, 10, 28), M('#c9a227', { metalness: .7, roughness: .3 })); rim.position.y = .28; mg.add(rim);
  const gl = new THREE.Mesh(new THREE.CircleGeometry(.15, 28), new THREE.MeshPhysicalMaterial({ color: '#cfefff', transmission: .6, transparent: true, opacity: .45, roughness: 0 })); gl.position.y = .28; mg.add(gl);
  cyl(.03, .035, .28, M('#5a3416'), 0, .07, 0, mg, 10);
  // 小腳
  K.legL = new THREE.Group(); K.legR = new THREE.Group();
  [K.legL, K.legR].forEach((L, i) => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(.06, .2, 4, 10), M('#e58a00')); m.position.y = -.12; m.castShadow = true; L.add(m);
    const shoe = new THREE.Mesh(new THREE.SphereGeometry(.09, 12, 8), M('#7a4a22')); shoe.scale.set(1, .6, 1.4); shoe.position.set(0, -.26, .03); L.add(shoe); L.position.set(i ? .14 : -.14, .35, 0); g.add(L); });
  // 光暈
  const glow = new THREE.PointLight('#ffd27a', 1.2, 4, 2); glow.position.set(0, .9, .6); g.add(glow);
  return K;
}

// ---------- 天空 ----------
function sky(scene) {
  const geo = new THREE.SphereGeometry(400, 32, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color('#3f8fe0') }, mid: { value: new THREE.Color('#9cc9ef') }, bot: { value: new THREE.Color('#e9f2f7') } },
    vertexShader: 'varying vec3 vp;void main(){vp=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'uniform vec3 top,mid,bot;varying vec3 vp;void main(){float h=vp.y;vec3 c=h>0.15?mix(mid,top,smoothstep(.15,.7,h)):mix(bot,mid,smoothstep(-.05,.15,h));gl_FragColor=vec4(c,1.);}'
  });
  const m = new THREE.Mesh(geo, mat); m.renderOrder = -1; scene.add(m);
  // 雲
  const [c, g] = canvas(256, 128);
  for (let i = 0; i < 18; i++) { const x = 40 + rnd() * 176, y = 50 + rnd() * 40, r = 22 + rnd() * 26; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  const ct = tex(c);
  for (let i = 0; i < 16; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: ct, fog: false, depthWrite: false, opacity: .9 }));
    const a = rnd() * Math.PI * 2, r = 200 + rnd() * 120; sp.position.set(Math.cos(a) * r, 60 + rnd() * 50, Math.sin(a) * r); sp.scale.set(90 + rnd() * 60, 36 + rnd() * 20, 1); scene.add(sp);
  }
  // 遠山（竹東四周的丘陵）：圓圓矮矮、一層一層
  for (let i = 0; i < 46; i++) {
    const a = i / 46 * Math.PI * 2 + rnd() * .1, r = 210 + rnd() * 90, R = 45 + rnd() * 45, h = 22 + rnd() * 40;
    const mnt = new THREE.Mesh(new THREE.SphereGeometry(R, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(['#4f7a52', '#5b875c', '#46704b', '#62905f'][i % 4], { flatShading: true, roughness: 1 }));
    mnt.scale.set(1, h / R, .8); mnt.position.set(Math.cos(a) * r, -2, Math.sin(a) * r); mnt.rotation.y = rnd() * 3; scene.add(mnt);
  }
}

// ---------- 地面、道路 ----------
function ground(scene) {
  const gm = new THREE.MeshStandardMaterial({ map: tex(noiseCanvas('#6f9a4f', 40, 256), [40, 80]), roughness: 1 });
  [[-300, 55], [77, 300]].forEach(([a, b]) => { const grass = new THREE.Mesh(new THREE.PlaneGeometry(b - a, 600), gm); grass.rotation.x = -Math.PI / 2; grass.position.set((a + b) / 2, -.02, 0); grass.receiveShadow = true; scene.add(grass); });
  const asphalt = new THREE.MeshStandardMaterial({ map: tex(noiseCanvas('#4b4e52', 30, 256), [40, 3]), roughness: .95 });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(150, 9), asphalt); road.rotation.x = -Math.PI / 2; road.position.set(-2, 0, 0); road.receiveShadow = true; scene.add(road);
  const line = (w, d, c, x, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color: c, roughness: .7 })); m.rotation.x = -Math.PI / 2; m.position.set(x, .012, z); m.receiveShadow = true; scene.add(m); return m; };
  line(150, .12, '#e8c02a', -2, -.1); line(150, .12, '#e8c02a', -2, .1);               // 雙黃線
  line(150, .14, '#f2f2f2', -2, -4.2); line(150, .14, '#f2f2f2', -2, 4.2);             // 白邊線
  for (let i = 0; i < 9; i++) line(.6, 8.2, '#f4f4f4', 10 + i * 1.1, 0).position.x = -15.5 + i * 1.1;   // 斑馬線（學校前）
  for (let i = 0; i < 9; i++) line(.6, 8.2, '#f4f4f4', 0, 0).position.x = 44 + i * 1.1;
  // 「慢」字
  const slow = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshStandardMaterial({ map: signTex('慢', { bg: '#4b4e52', fg: '#f4f4f4', w: 256, h: 256, fs: 220 }), roughness: .9 }));
  slow.rotation.x = -Math.PI / 2; slow.rotation.z = -Math.PI / 2; slow.position.set(-21, .013, 2.2); scene.add(slow);
  // 人行道
  const tile = new THREE.MeshStandardMaterial({ map: tex(noiseCanvas('#c9c2b6', 18, 128, (g, s) => { g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; for (let i = 0; i <= s; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, s); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(s, i); g.stroke(); } }), [75, 1]), roughness: .85 });
  [-5.5, 5.5].forEach(z => { const s = box(150, .15, 2.2, tile, -2, .075, z, scene); s.castShadow = false; box(150, .16, .18, M('#b8b2a8'), -2, .08, z > 0 ? 4.45 : -4.45, scene).castShadow = false; });
}

// ---------- 內灣線竹東站＋火車 ----------
export const train = {};
function station(scene) {
  const X = -62;
  // 軌道
  const rail = M('#777', { metalness: .6, roughness: .4 });
  [-.72, .72].forEach(dx => box(.08, .12, 600, rail, X + dx, .2, 0, scene));
  for (let z = -300; z < 300; z += 1.2) box(2.4, .1, .25, M('#6b5a48'), X, .08, z, scene).castShadow = false;
  box(3.2, .12, 600, M('#8a8378', { roughness: 1 }), X, .02, 0, scene).castShadow = false;
  // 月台＋雨棚
  box(4, .9, 40, M('#bdb5a8'), X + 3.6, .45, 0, scene);
  box(.15, .02, 40, M('#ffd200'), X + 1.85, .91, 0, scene);
  for (let z = -15; z <= 15; z += 6) cyl(.08, .08, 3, M('#3c6e8f'), X + 4.5, 2.4, z, scene, 8);
  box(4.6, .12, 34, M('#3c6e8f', { metalness: .3, roughness: .5 }), X + 3.8, 3.95, 0, scene);
  // 站房
  const st = box(7, 4.2, 10, M('#f1ece2'), X + 9.5, 2.1, -9, scene);
  box(7.6, .4, 10.6, M('#6d4b35'), X + 9.5, 4.4, -9, scene);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.1), new THREE.MeshStandardMaterial({ map: signTex('竹東車站', { bg: '#ffffff', fg: '#1f3f73', border: '#1f3f73', sub: 'ZHUDONG' }), emissive: '#fff', emissiveIntensity: .2 }));
  sg.position.set(X + 13.05, 3.3, -9); sg.rotation.y = Math.PI / 2; scene.add(sg);
  const nm = new THREE.Mesh(new THREE.PlaneGeometry(2.2, .6), new THREE.MeshStandardMaterial({ map: signTex('內灣線', { bg: '#1f3f73', fg: '#fff' }) }));
  nm.position.set(X + 5.62, 2.6, 6); nm.rotation.y = Math.PI / 2; scene.add(nm);
  // 火車（白車身＋藍橘條）
  const tg = new THREE.Group(); scene.add(tg); train.g = tg; train.z = -120; train.X = X;
  const tm = M('#f4f4f2', { roughness: .4, metalness: .1 });
  for (let k = 0; k < 2; k++) {
    const car = new THREE.Group(); car.position.z = k * 20.5; tg.add(car);
    box(2.9, 3.0, 20, tm, 0, 2.0, 0, car);
    box(2.92, .25, 20, M('#1f5fa8'), 0, 1.45, 0, car); box(2.92, .12, 20, M('#f08a24'), 0, 1.68, 0, car);
    for (let i = 0; i < 6; i++) [-1.47, 1.47].forEach(x => box(.04, .9, 2.2, M('#22303a', { roughness: .2, metalness: .5 }), x, 2.55, -7.5 + i * 3, car));
    box(2.4, 1.0, .05, M('#22303a', { roughness: .2, metalness: .5 }), 0, 2.6, -10.02, car);
    box(2.4, 1.0, .05, M('#22303a', { roughness: .2, metalness: .5 }), 0, 2.6, 10.02, car);
    box(2.5, .5, 18, M('#333'), 0, .55, 0, car);
  }
  tg.position.set(X, 0, train.z);
}

// ---------- 竹東溪＋橋 ----------
export const water = [];
function creek(scene) {
  const X0 = 56, X1 = 76, Z = 300;
  // 河床（低一點）
  const bed = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0 - 4, Z * 2, 40, 200), new THREE.MeshStandardMaterial({ map: tex(noiseCanvas('#8f8a73', 50, 256, (g, s) => { for (let i = 0; i < 160; i++) { g.fillStyle = ['#b9b4a4', '#9c9784', '#d1cbbb', '#7f7a6a'][i % 4]; g.beginPath(); g.ellipse(rnd() * s, rnd() * s, 3 + rnd() * 7, 2 + rnd() * 5, rnd() * 3, 0, 7); g.fill(); } }), [6, 60]), roughness: 1 }));
  bed.rotation.x = -Math.PI / 2; bed.position.set((X0 + X1) / 2, -2.4, 0); bed.receiveShadow = true; scene.add(bed);
  // 堤岸斜坡（從草地斜斜下到河床）
  const bankM = M('#7f8a6a', { roughness: 1, side: THREE.DoubleSide });
  [[55, 58], [77, 74]].forEach(([a, b]) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([a, -.02, -Z, b, -2.4, -Z, a, -.02, Z, b, -2.4, Z], 3)); g.setIndex([0, 2, 1, 1, 2, 3]); g.computeVertexNormals();
    const m = new THREE.Mesh(g, bankM); m.receiveShadow = true; scene.add(m); });
  // 石頭
  for (let i = 0; i < 220; i++) { const s = .2 + rnd() * .7; const r = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), M(['#a9a493', '#c2bcac', '#8d8878'][i % 3], { flatShading: true })); r.position.set(X0 + 2.5 + rnd() * (X1 - X0 - 5), -2.4 + s * .3, (rnd() - .5) * 200); r.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); r.castShadow = r.receiveShadow = true; scene.add(r); }
  // 水
  const wm = new THREE.MeshStandardMaterial({ color: '#2f8fae', transparent: true, opacity: .5, roughness: .08, metalness: .15, depthWrite: false });
  const wg = new THREE.PlaneGeometry(X1 - X0 - 2.4, Z * 2, 30, 120);
  const w = new THREE.Mesh(wg, wm); w.rotation.x = -Math.PI / 2; w.position.set((X0 + X1) / 2, -1.0, 0); w.receiveShadow = true; scene.add(w);
  water.push({ mesh: w, base: wg.attributes.position.array.slice() });
  // 橋
  box(X1 - X0 + 6, .6, 9, M('#bdb7ab'), (X0 + X1) / 2, -.3, 0, scene);
  [-4.4, 4.4].forEach(z => { box(X1 - X0 + 6, .9, .25, M('#d7d1c4'), (X0 + X1) / 2, .45, z, scene); for (let x = X0 - 2; x <= X1 + 2; x += 2.5) box(.3, 1.1, .3, M('#c4bdb0'), x, .55, z, scene); });
  for (let x = X0 + 4; x < X1; x += 6) box(1, 2.4, 1, M('#a8a297'), x, -1.4, 0, scene);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.4, .7), new THREE.MeshStandardMaterial({ map: signTex('竹東溪', { bg: '#2d5f3f', fg: '#fff', border: '#fff' }) }));
  sg.position.set(X0 - 2.2, 1.3, 4.7); sg.rotation.y = -Math.PI / 2 + .6; scene.add(sg); cyl(.05, .05, 1.2, M('#888'), X0 - 2.2, .6, 4.7, scene, 6);
  // 對岸
  for (let i = 0; i < 18; i++) tree(scene, X1 + 4 + rnd() * 18, -60 + i * 7 + rnd() * 3, .9 + rnd() * .5, 'green');
}

// ---------- 學校 ----------
function school(scene) {
  const wallM = M('#e7e0d2');
  // 圍牆＋校門
  box(28, 1.6, .3, wallM, -35 + 14, .8, 7, scene); box(26, 1.6, .3, wallM, -3 + 13 + 4, .8, 7, scene).position.x = 3 + 12;
  [-7.2, -2.8].forEach(x => box(.8, 3, .8, M('#bfb4a2'), x, 1.5, 7, scene));
  const gs = new THREE.Mesh(new THREE.BoxGeometry(5.2, .9, .3), [M('#ccc'), M('#ccc'), M('#ccc'), M('#ccc'), new THREE.MeshStandardMaterial({ map: signTex('光線國中', { bg: '#7a1f1f', fg: '#ffe9a8', border: '#ffe9a8' }) }), M('#ccc')]);
  gs.position.set(-5, 3.3, 7); scene.add(gs);
  // 教室大樓（三層，走廊在北邊）
  const B = new THREE.Group(); B.position.set(-28, 0, 30); scene.add(B);
  box(20, 10, 8, M('#efe7d6'), 0, 5, 0, B);
  for (let f = 0; f < 3; f++) {
    box(20.4, .25, 2.2, M('#d9cfbd'), 0, f * 3.3 + .12, -5, B);
    box(20.4, 1.0, .18, M('#cfc4b0'), 0, f * 3.3 + .75, -6.05, B);
    for (let i = 0; i < 6; i++) { box(2.2, 1.3, .05, M('#3b5368', { roughness: .2, metalness: .4 }), -8 + i * 3.2, f * 3.3 + 1.9, -4.02, B); box(.9, 2.1, .05, M('#6d4b35'), -9.3 + i * 3.2, f * 3.3 + 1.1, -4.02, B); }
  }
  box(20.6, .4, 10.6, M('#8b3a2a'), 0, 10.2, -1, B);
  const cl = new THREE.Mesh(new THREE.CircleGeometry(.8, 32), M('#fff')); cl.position.set(0, 8.6, -4.03); cl.rotation.y = Math.PI; B.add(cl);
  // 操場跑道
  const tr = new THREE.Mesh(new THREE.RingGeometry(6, 9, 48), M('#b5503c', { roughness: 1 })); tr.rotation.x = -Math.PI / 2; tr.scale.set(1.2, 1, 1); tr.position.set(-8, .015, 21); tr.receiveShadow = true; scene.add(tr);
  const fd = new THREE.Mesh(new THREE.CircleGeometry(6, 48), M('#5f9a45', { roughness: 1 })); fd.rotation.x = -Math.PI / 2; fd.scale.set(1.2, 1, 1); fd.position.set(-8, .016, 21); fd.receiveShadow = true; scene.add(fd);
  cyl(.06, .08, 9, M('#ddd', { metalness: .6, roughness: .3 }), -16, 4.5, 12, scene, 8);
  const flag = box(1.6, 1, .03, M('#2f6fd1'), -15.15, 8.3, 12, scene);
  const P = { x: 9, z: 18 };
  for (let i = 0; i < 5; i++) tree(scene, 16 + (i % 2) * 2, 10 + i * 4, .9);
  return { pool: P };
}

// ---------- 土地公廟 ----------
function temple(scene) {
  const g = new THREE.Group(); g.position.set(24, 0, -13); scene.add(g);
  box(10, .3, 8, M('#b9a58c'), 0, .15, 3.5, g);                     // 廟埕
  box(6, 3.6, 4.6, M('#c23a2a', { roughness: .6 }), 0, 1.8, -1, g);
  box(5.8, 2.6, .1, M('#6b2015'), 0, 1.4, 1.36, g);
  // 燕尾屋脊
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(.1, 4.2, 1.6, 4, 1), M('#2f6b4f', { roughness: .5, flatShading: true }));
  roof.rotation.y = Math.PI / 4; roof.scale.set(1.15, 1, .8); roof.position.set(0, 4.3, -1); roof.castShadow = true; g.add(roof);
  [-1, 1].forEach(s => { const t = new THREE.Mesh(new THREE.ConeGeometry(.18, 1.6, 6), M('#e8c35a')); t.position.set(s * 3.2, 5.0, -1); t.rotation.z = -s * 1.1; g.add(t); });
  box(5, .25, .25, M('#e8c35a'), 0, 5.05, -1, g);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.6, .7), new THREE.MeshStandardMaterial({ map: signTex('福德祠', { bg: '#1d1d1d', fg: '#f2c94c', border: '#f2c94c' }), emissive: '#fff', emissiveIntensity: .15 }));
  sg.position.set(0, 3.2, 1.33); g.add(sg);
  // 燈籠
  [-2.4, 2.4].forEach(x => { const l = new THREE.Mesh(new THREE.SphereGeometry(.38, 16, 12), new THREE.MeshStandardMaterial({ color: '#e0302a', emissive: '#ff3a2a', emissiveIntensity: .5 })); l.scale.y = 1.25; l.position.set(x, 3.0, 1.6); g.add(l); });
  // 香爐
  cyl(.5, .4, .7, M('#7a6a3a', { metalness: .6, roughness: .4 }), 0, .65, 4.2, g, 16);
  // 供桌（硬幣任務在這裡）
  box(2.4, .9, 1.1, M('#8a2a1f', { roughness: .5 }), 0, .6, 2.4, g);
  return g;
}

// ---------- 公園 ----------
function park(scene) {
  const g = new THREE.Group(); g.position.set(47, 0, 15); scene.add(g);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(4, 16), M('#d8cbb0', { roughness: 1 })); path.rotation.x = -Math.PI / 2; path.position.set(0, .02, 0); path.receiveShadow = true; g.add(path);
  // 長椅
  const wood = M('#9a6a3f', { roughness: .7 });
  for (let i = 0; i < 4; i++) box(1.8, .06, .14, wood, 3, .5, -.25 + i * .17, g);
  for (let i = 0; i < 3; i++) box(1.8, .12, .05, wood, 3, .75 + i * .16, .35, g);
  [-.8, .8].forEach(x => { box(.06, .5, .6, M('#333'), 3 + x, .25, 0, g); });
  for (let i = 0; i < 6; i++) tree(scene, 41 + (i % 3) * 5, 10 + Math.floor(i / 3) * 10 + rnd() * 2, 1 + rnd() * .3);
  return g;
}

// ---------- 店家與房子 ----------
function street(scene) {
  const N = [
    { x: -46, w: 8, sign: '阿德機車行', signBg: '#1c4f9c', signFg: '#fff', shop: 'scooter', wall: '#c9b79c', floors: 3, vsign: '機車', vBg: '#1c4f9c', seed: 3 },
    { x: -36, w: 8, sign: '光光眼鏡', signBg: '#ffffff', signFg: '#1b3a6b', signBorder: '#1b3a6b', signSub: '驗光配鏡・老花・近視', shop: 'glasses', wall: '#b9c6cc', floors: 4, vsign: '眼鏡', vBg: '#1b3a6b', seed: 2 },
    { x: -27, w: 7, sign: '光光茶飲', signBg: '#f4e3c3', signFg: '#5a3416', signBorder: '#5a3416', shop: 'tea', wall: '#d9a994', floors: 3, vsign: '手搖飲', vBg: '#5a3416', seed: 5 },
    { x: -19, w: 8, sign: '光光商店', signBg: '#18a0a0', signFg: '#fff', shop: 'store', wall: '#e4d3a6', floors: 4, seed: 4 },
    { x: -11, w: 6, sign: '早餐店', signBg: '#ffd84a', signFg: '#b03020', shop: 'noodle', wall: '#a9bba0', floors: 3, vsign: '蛋餅', vBg: '#e0502a', seed: 7 },
    { x: -2, w: 9, sign: '光明公寓', signBg: '#f2efe8', signFg: '#444', shop: 'home', wall: '#c8c1d6', floors: 5, arcade: false, seed: 6 },
    { x: 8, w: 7, sign: '老張牛肉麵', signBg: '#8a1f1f', signFg: '#ffe9a8', shop: 'noodle', wall: '#d8c39c', floors: 3, vsign: '麵', vBg: '#8a1f1f', seed: 8 },
    { x: 15.5, w: 6, sign: '大眾藥局', signBg: '#1f7a3f', signFg: '#fff', shop: 'pharm', wall: '#bcd2c8', floors: 3, vsign: '藥局', vBg: '#1f7a3f', seed: 9 },
    { x: 34, w: 8, sign: '福利雜貨', signBg: '#e8762a', signFg: '#fff', shop: 'grocery', wall: '#d6b49a', floors: 2, seed: 10 },
    { x: 43, w: 8, sign: '', shop: 'home', wall: '#c7cfd6', floors: 3, arcade: false, seed: 11 },
    { x: 51, w: 6, sign: '', shop: 'home', wall: '#e2c7a8', floors: 2, arcade: false, seed: 12 },
  ];
  const S = [
    { x: -46, w: 8, sign: '', shop: 'home', wall: '#cdb8a0', floors: 3, arcade: false, seed: 13 },
    { x: 22, w: 7, sign: '光華文具', signBg: '#ffffff', signFg: '#c0392b', signBorder: '#c0392b', shop: 'store', wall: '#b8c9d9', floors: 3, vsign: '文具', vBg: '#c0392b', seed: 14 },
    { x: 30, w: 7, sign: '', shop: 'home', wall: '#d9c6b0', floors: 3, arcade: false, seed: 15 },
    { x: 37, w: 6, sign: '小美髮廊', signBg: '#ff8fb0', signFg: '#fff', shop: 'home', wall: '#e6c6cf', floors: 2, seed: 16 },
  ];
  const out = {};
  N.forEach(o => { const b = building(scene, Object.assign({ side: 'N' }, o)); out[o.sign || ('n' + o.x)] = b; });
  S.forEach(o => building(scene, Object.assign({ side: 'S' }, o)));
  // 騎樓前停機車
  const cs = ['#d33', '#eee', '#39c', '#222', '#fc3', '#7c4', '#c6c'];
  [-48, -44, -40, -33, -30, -24, -21, -16, 5, 10, 13, 31, 33].forEach((x, i) => scooter(scene, x + rnd() * .6, -5.3, Math.PI / 2 + (rnd() - .5) * .2, cs[i % cs.length]));
  [20, 24, 28, 36].forEach((x, i) => scooter(scene, x, 5.3, -Math.PI / 2, cs[(i + 3) % cs.length]));
  // 欒樹（南側人行道）
  [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50].forEach(x => tree(scene, x + 2, 5.9, .95));
  // 電線桿（北側）
  poles(scene, [-52, -38, -24, -10, 4, 18, 32, 46], -4.75);
  return out;
}

export function buildWorld(scene) {
  const root = new THREE.Group(); scene.add(root);
  sky(root); ground(root); station(root); creek(root);
  const sch = school(root); temple(root); park(root); const shops = street(root);
  mergeStatic(root, new Set([train.g, ...water.map(w => w.mesh)]));
  return { shops, pool: sch.pool };
}

// 靜態物件依材質合併成一個大網格：繪製次數從幾千次降到幾百次（學校筆電也跑得動）
export function mergeStatic(root, skip = new Set()) {
  root.updateMatrixWorld(true);
  const groups = new Map(), victims = [];
  (function walk(o) {
    if (skip.has(o)) return;
    if (o.isMesh && !o.isInstancedMesh && !Array.isArray(o.material) && o.geometry.attributes.position) {
      const k = o.material.uuid + '|' + o.castShadow + '|' + o.receiveShadow + '|' + o.renderOrder;
      if (!groups.has(k)) groups.set(k, []); groups.get(k).push(o);
    }
    o.children.slice().forEach(walk);
  })(root);
  let merged = 0;
  groups.forEach(list => {
    if (list.length < 2) return;
    const pos = [], nor = [], uv = [];
    list.forEach(m => {
      let g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
      g.applyMatrix4(m.matrixWorld);
      if (!g.attributes.normal) g.computeVertexNormals();
      pos.push(g.attributes.position.array); nor.push(g.attributes.normal.array);
      uv.push(g.attributes.uv ? g.attributes.uv.array : new Float32Array(g.attributes.position.count * 2));
      g.dispose(); victims.push(m);
    });
    const cat = arrs => { const n = arrs.reduce((a, b) => a + b.length, 0), out = new Float32Array(n); let o = 0; arrs.forEach(a => { out.set(a, o); o += a.length; }); return out; };
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(cat(pos), 3)); geo.setAttribute('normal', new THREE.BufferAttribute(cat(nor), 3)); geo.setAttribute('uv', new THREE.BufferAttribute(cat(uv), 2));
    geo.computeBoundingSphere();
    const mm = new THREE.Mesh(geo, list[0].material); mm.castShadow = list[0].castShadow; mm.receiveShadow = list[0].receiveShadow; mm.renderOrder = list[0].renderOrder; mm.matrixAutoUpdate = false;
    root.add(mm); merged++;
  });
  victims.forEach(m => m.parent && m.parent.remove(m));
  return merged;
}

export function updateWorld(t, dt) {
  // 火車：每 70 秒經過一次
  const ph = (t % 70) / 70; train.g.position.z = -160 + ph * 340; train.g.visible = ph > .05 && ph < .95;
  // 水波
  water.forEach(w => { const a = w.mesh.geometry.attributes.position; for (let i = 0; i < a.count; i++) { const x = w.base[i * 3], y = w.base[i * 3 + 1]; a.array[i * 3 + 2] = Math.sin(x * 1.3 + t * 1.6) * .03 + Math.cos(y * .9 - t * 1.2) * .03; } a.needsUpdate = true; w.mesh.geometry.computeVertexNormals(); });
}
