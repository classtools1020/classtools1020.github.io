// 光線小鎮：任務（透鏡路線＋折射路線）
import * as THREE from './lib/three.module.min.js';
import { M, box, cyl, signTex, person, FONT, tree } from './world.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
let C;                         // ctx
const N_WATER = 1.33;

// ---------- 共用：水面上下分開，水下那一段「看起來」被壓扁（光在水面折一下） ----------
function cloneMats(o, planes, extra) {
  o.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.clippingPlanes = planes.map(p => p.clone()); m.material.clipShadows = true; if (extra) extra(m.material); } });
}
function splitWater(obj, s, f = .7) {
  const g = new THREE.Group();
  const up = obj.clone(true); cloneMats(up, [new THREE.Plane(V(0, 1, 0), -s)]);
  const dn = obj.clone(true); cloneMats(dn, [new THREE.Plane(V(0, -1, 0), s)]);
  const sg = new THREE.Group(); sg.position.y = s; sg.scale.y = f; const inner = new THREE.Group(); inner.position.y = -s; inner.add(dn); sg.add(inner);
  const real = obj.clone(true); cloneMats(real, [new THREE.Plane(V(0, -1, 0), s)], m => { m.transparent = true; m.opacity = .5; m.depthWrite = false; m.color = new THREE.Color('#ff5e8a'); if (m.emissive) { m.emissive = new THREE.Color('#ff5e8a'); m.emissiveIntensity = .5; } });
  real.visible = false;
  g.add(up, sg, real);
  const planesOf = o => { const a = []; o.traverse(m => m.isMesh && a.push(m.material.clippingPlanes[0])); return a; };
  const pu = planesOf(up), pd = planesOf(dn), pr = planesOf(real);
  g.userData = { up, dn, sg, real, inner,
    setF(v) { sg.scale.y = v; },
    setS(ns) { sg.position.y = ns; inner.position.y = -ns; pu.forEach(p => p.constant = -ns); pd.forEach(p => p.constant = ns); pr.forEach(p => p.constant = ns); } };
  return g;
}
function waterMat(c = '#58b8d8', o = .42) { return new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: o, roughness: .05, metalness: .1, depthWrite: false, side: THREE.DoubleSide }); }
function glassMat() { return new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: .2, roughness: .02, metalness: 0, side: THREE.DoubleSide, depthWrite: false }); }
function tube(a, b, color, r = .012, parent) {
  const v = new THREE.Vector3().subVectors(b, a); const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, v.length(), 10), new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true }));
  m.position.copy(a).addScaledVector(v, .5); m.quaternion.setFromUnitVectors(V(0, 1, 0), v.clone().normalize()); m.renderOrder = 8; parent.add(m); return m;
}
function label3d(text, color, pos, s = 1, parent) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128; const g = c.getContext('2d'); g.font = `900 64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 12; g.strokeStyle = '#000'; g.strokeText(text, 256, 64); g.fillStyle = color; g.fillText(text, 256, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false })); sp.scale.set(1.6 * s, .4 * s, 1); sp.position.copy(pos); sp.renderOrder = 9; parent.add(sp); return sp;
}
function screenOf(p) { const v = p.clone().project(C.cam); return { x: (v.x + 1) / 2 * C.host.clientWidth, y: (1 - v.y) / 2 * C.host.clientHeight }; }
function tween(dur, fn, done) { const t0 = performance.now(); (function f() { const k = Math.min(1, (performance.now() - t0) / (dur * 1000 / (window.__dtScale || 1))); fn(k); if (k < 1) requestAnimationFrame(f); else done && done(); })(); }
function holdBtn(id, step) { const e = document.getElementById(id); if (!e) return; e.onclick = null; let iv; const on = ev => { ev.preventDefault(); clearInterval(iv); step(); iv = setInterval(step, 30); }; const off = () => clearInterval(iv);
  e.addEventListener('pointerdown', on); e.addEventListener('pointerup', off); e.addEventListener('pointerleave', off); e.addEventListener('pointercancel', off); }
const setQ = h => { const e = document.getElementById('pq'); if (e) e.innerHTML = h; };
const LENS_SVG = (thick) => thick
  ? '<svg viewBox="0 0 60 80" width="30" height="40" style="vertical-align:middle"><path d="M30 4 Q54 40 30 76 Q6 40 30 4Z" fill="#bfe9ff" stroke="#2a7fb8" stroke-width="4"/></svg>'
  : '<svg viewBox="0 0 60 80" width="30" height="40" style="vertical-align:middle"><path d="M12 4 L48 4 Q34 40 48 76 L12 76 Q26 40 12 4Z" fill="#bfe9ff" stroke="#2a7fb8" stroke-width="4"/></svg>';
function options(list, correct, onRight, wrongHint) {
  list.forEach(t => C.addBtn({ label: t, kind: 'opt', on: e => {
    if (correct == null || t === correct) { e.classList.add('sel'); C.FXs('powerup'); onRight(t); }
    else { e.classList.add('wrong'); C.FXs('wrongsoft'); C.hint(wrongHint || '再想一次！沒關係～'); }
  } }));
}

// ======================================================================
// 透鏡 1：光光眼鏡行
// ======================================================================
const glasses = {
  stand: V(-36, .15, -5.4), face: Math.PI,
  build(S) {
    const g = new THREE.Group(); S.add(g); this.g = g;
    const c = document.createElement('canvas'); c.width = 512; c.height = 768; const x = c.getContext('2d');
    x.fillStyle = '#fbfbf6'; x.fillRect(0, 0, 512, 768); x.fillStyle = '#c0392b'; x.font = `900 44px ${FONT}`; x.textAlign = 'center'; x.fillText('視力表', 256, 60);
    const rows = [[150, 'E'], [96, 'Ǝ E'], [64, 'E m Ǝ'], [44, 'Ǝ E Ш m'], [30, 'm E Ǝ Ш E'], [20, 'E Ш m Ǝ E m']]; let y = 160;
    x.fillStyle = '#111'; rows.forEach(([s, t]) => { x.font = `900 ${s}px Arial`; x.fillText(t, 256, y + s * .5); y += s + 24; });
    x.font = `700 16px ${FONT}`; x.fillStyle = '#333'; x.fillText('看得到這一行嗎？光光偵探最棒！', 256, 742);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    const chart = new THREE.Mesh(new THREE.PlaneGeometry(.9, 1.35), new THREE.MeshStandardMaterial({ map: t, roughness: .7, emissive: '#ffffff', emissiveIntensity: .15, emissiveMap: t }));
    chart.position.set(-36.9, 1.55, -8.95); g.add(chart); box(.98, 1.43, .04, M('#7a4a22'), -36.9, 1.55, -8.98, g);
    const p = signTex('老花眼鏡 中間厚・近視眼鏡 中間薄', { w: 1024, h: 160, bg: '#fff8e1', fg: '#5a3416', fs: 60 });
    const poster = new THREE.Mesh(new THREE.PlaneGeometry(1.2, .19), new THREE.MeshStandardMaterial({ map: p })); poster.position.set(-35.5, 2.0, -8.95); g.add(poster);
    box(1.4, .9, .45, M('#e8e2d6'), -35.4, .45, -8.7, g);
    const frame = (xx, col) => { const fg = new THREE.Group(); fg.position.set(xx, .95, -8.6); g.add(fg); [-.07, .07].forEach(dx => { const r = new THREE.Mesh(new THREE.TorusGeometry(.055, .01, 8, 24), M(col)); r.position.x = dx; fg.add(r); const l = new THREE.Mesh(new THREE.CircleGeometry(.05, 20), glassMat()); l.position.x = dx; fg.add(l); }); return fg; };
    frame(-35.7, '#8a4a2a'); frame(-35.1, '#1b3a6b');
    this.chart = chart;
  },
  enter(c) {
    c.setCam({ pos: V(-36.4, 1.6, -6.8), look: V(-36.6, 1.5, -8.9), fov: 50 });
    const tried = new Set(); this._asked = false;
    const put = (thick) => {
      const L = c.lens; const sp = screenOf(this.chart.position.clone().add(V(0, .05, 0)));
      Object.assign(L, { on: true, ring: '#c9a227', x: sp.x, y: sp.y, r: Math.min(150, c.host.clientHeight * .2), m: thick ? 2.1 : .5, k: thick ? .28 : -.15, handle: true, drag: true, fixedDir: null, fixedPos: null, fov: null, hideKoko: true });
      tried.add(thick); c.FXs('pop');
      c.hint(thick ? '中間厚的鏡片：字變<b>大</b>了嗎？（可以拖著鏡片移動）' : '中間薄的鏡片：字變<b>小</b>了嗎？（可以拖著鏡片移動）');
      if (tried.size === 2 && !this._asked) { this._asked = true;
        c.addBtn({ label: '我知道答案了！', kind: 'go', on: () => { c.clearBtns(); c.hint('');
          setQ('哪一副讓字<b>變大</b>？');
          options(['中間厚（老花眼鏡）', '中間薄（近視眼鏡）'], '中間厚（老花眼鏡）', () => c.complete(`${LENS_SVG(true)} 中間厚＝<b>凸透鏡</b>：字變大<br>${LENS_SVG(false)} 中間薄＝<b>凹透鏡</b>：字變小`), '再拿近視眼鏡看一次～');
        } }); }
    };
    c.panel({ tag: '透鏡任務・第 1 站', title: '👓 光光眼鏡行', q: '老花眼鏡、近視眼鏡，鏡片不一樣。<br>拿起來看視力表——<b>哪一副讓字變大？</b>', hint: '兩副都試試看',
      buttons: [
        { label: LENS_SVG(true) + ' 老花眼鏡<br><small>中間厚</small>', kind: 'act', on: () => put(true) },
        { label: LENS_SVG(false) + ' 近視眼鏡<br><small>中間薄</small>', kind: 'act', on: () => put(false) },
      ] });
  },
  exit(c) { c.lens.on = false; },
};

// ======================================================================
// 透鏡 2：自然教室・放大鏡投影（窗外景色倒過來）
// ======================================================================
const darkroom = {
  stand: V(-10.7, .15, 34.0), face: Math.PI * .8, tp: true,
  build(S) {
    const g = new THREE.Group(); S.add(g); this.g = g;
    const X = -8, Z = 36, Wd = 7, D = 6, H = 3.2;
    const wall = M('#3a3f46', { roughness: 1 }), wall2 = M('#2f343a', { roughness: 1 });
    box(Wd, .1, D, M('#4a3b2f'), X, .05, Z, g); box(Wd, .1, D, wall2, X, H, Z, g);
    box(.2, H, D, wall, X - Wd / 2, H / 2, Z, g); box(.2, H, D, wall, X + Wd / 2, H / 2, Z, g);
    box(Wd, H, .2, wall, X, H / 2, Z - D / 2, g);
    const zS = Z + D / 2;
    box(2, H, .2, wall, X - 2.5, H / 2, zS, g); box(2, H, .2, wall, X + 2.5, H / 2, zS, g);
    box(3, 1, .2, wall, X, .5, zS, g); box(3, .6, .2, wall, X, H - .3, zS, g);
    box(3.1, .08, .3, M('#ddd'), X, 1, zS, g); box(.08, 1.6, .3, M('#ddd'), X, 1.8, zS, g);
    // 黑板
    const bb = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.1), new THREE.MeshStandardMaterial({ map: signTex('放大鏡投影實驗', { bg: '#2f4a3a', fg: '#f4f4e8', w: 1024, h: 420, fs: 90 }) })); bb.position.set(X - Wd / 2 + .12, 1.7, Z - .5); bb.rotation.y = Math.PI / 2; g.add(bb);
    // 窗外：陽光下的紅磚樓、大樹、黃旗
    const out = new THREE.Group(); g.add(out);
    box(9, 6, 1, M('#b5503c'), X - 1, 3, zS + 14, out); for (let i = 0; i < 4; i++) box(1.2, 1, .1, M('#2f4558'), X - 4 + i * 2.2, 3.6, zS + 13.45, out);
    tree(out, X + 3, zS + 8, 1.2, 'luan'); tree(out, X - 4.5, zS + 9, 1.1, 'green');
    cyl(.05, .06, 7, M('#eee'), X + .8, 3.5, zS + 6, out, 8); box(1.2, .8, .03, M('#ffcf2e'), X + 1.45, 6.4, zS + 6, out);
    const grass = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), M('#6f9a4f')); grass.rotation.x = -Math.PI / 2; grass.position.set(X, .01, zS + 15); out.add(grass);
    // 桌子
    box(1.6, .06, 1.6, M('#9a6a3f'), X, .76, Z + .6, g); [[-.7, -.7], [.7, -.7], [-.7, .7], [.7, .7]].forEach(([a, b]) => box(.05, .76, .05, M('#555'), X + a, .38, Z + .6 + b, g));
    // 放大鏡（架子上，對著窗戶）
    this.LZ = Z + 1.2; this.LY = 1.15;
    const lg = new THREE.Group(); lg.position.set(X, this.LY, this.LZ); g.add(lg);
    lg.add(new THREE.Mesh(new THREE.TorusGeometry(.11, .012, 10, 32), M('#c9a227', { metalness: .7, roughness: .3 })));
    const gl = new THREE.Mesh(new THREE.SphereGeometry(.11, 24, 12), glassMat()); gl.scale.z = .18; lg.add(gl);
    cyl(.01, .012, .36, M('#555'), X, .97, this.LZ, g, 8);
    // 白紙
    this.F = .5;
    const RT2 = new THREE.WebGLRenderTarget(512, 384, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter }); RT2.texture.colorSpace = THREE.SRGBColorSpace; this.RT2 = RT2;
    this.pcam = new THREE.PerspectiveCamera(42, 4 / 3, .05, 200);
    this.pmat = new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms: { map: { value: RT2.texture }, blur: { value: 6 }, lit: { value: 1 } },
      vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: `uniform sampler2D map;uniform float blur;uniform float lit;varying vec2 vUv;
        void main(){vec2 uv=vec2(vUv.x,1.-vUv.y);
          vec3 c=texture2D(map,uv,blur).rgb; float b=clamp(blur/7.,0.,1.);
          vec3 paper=vec3(.55,.54,.5); c=mix(c,paper+c*.2,b*.85);
          float r=length(vUv-.5); c*=mix(1.,.6,smoothstep(.3,.65,r));
          gl_FragColor=vec4(c*lit,1.);}` });
    this.pmat.toneMapped = false;
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(.6, .45), this.pmat); this.paper = paper; g.add(paper);
    this.pback = box(.62, .47, .01, M('#ddd'), 0, 0, 0, g);
    this.stand2 = cyl(.012, .012, .5, M('#555'), 0, 0, 0, g, 8);
    this.d = .95; this.place();
  },
  place() { const z = this.LZ - this.d; this.paper.position.set(-8, this.LY, z); this.paper.rotation.y = 1.0; this.pback.position.set(-8 - Math.sin(1.0) * .01, this.LY, z - Math.cos(1.0) * .01); this.pback.rotation.y = 1.0; this.stand2.position.set(-8, this.LY - .32, z); },
  enter(c) {
    this.saved = [c.hemi.intensity, c.S.environmentIntensity]; c.hemi.intensity = .05; c.S.environmentIntensity = .06;
    c.setCam({ pos: V(-6.2, 1.6, 35.55), look: V(-8.05, 1.22, 36.45), fov: 56 });
    this.d = .95; this.place(); this.live = true; this.sharpSeen = false;
    c.panel({ tag: '透鏡任務・第 2 站', title: '🏫 自然教室：放大鏡投影', q: '窗外很亮、教室很暗。<br>白紙放在放大鏡後面，<b>前後移動</b>——白紙上出現什麼？', hint: '按住按鈕移動白紙',
      buttons: [{ label: '⬅ 白紙靠近放大鏡', kind: 'act', id: 'pn' }, { label: '白紙離遠一點 ➡', kind: 'act', id: 'pf' }] });
    holdBtn('pn', () => { this.d = THREE.MathUtils.clamp(this.d - .01, .2, 1.05); this.place(); });
    holdBtn('pf', () => { this.d = THREE.MathUtils.clamp(this.d + .01, .2, 1.05); this.place(); });
  },
  update(dt, t, c) {
    if (!this.live) return;
    this.pcam.position.set(-8, this.LY, this.LZ); this.pcam.lookAt(-8, this.LY + .55, this.LZ + 10);
    const kv = c.K.g.visible; c.K.g.visible = false; this.paper.visible = false;
    c.R.setRenderTarget(this.RT2); c.R.clear(); c.R.render(c.S, this.pcam); c.R.setRenderTarget(null); c.K.g.visible = kv; this.paper.visible = true;
    const err = Math.abs(this.d - this.F); this.pmat.uniforms.blur.value = Math.min(8, err * 28);
    this.pmat.uniforms.lit.value = .7 + .3 * Math.max(0, 1 - err * 3);
    if (err < .035 && !this.sharpSeen) { this.sharpSeen = true; c.FXs('coin'); { const P = this.paper.position, n = V(Math.sin(1.0), 0, Math.cos(1.0)); c.setCam({ pos: P.clone().addScaledVector(n, .95).add(V(0, .12, 0)), look: P.clone(), fov: 50 }, 1.4); } c.hint('✨ 清楚了！白紙上出現窗外的大樹和紅磚樓——是正的還是倒的？');
      c.addBtn({ label: '我看到了！', kind: 'go', on: () => { c.clearBtns(); setQ('白紙上的窗外景色是——');
        options(['正的', '上下顛倒'], '上下顛倒', () => c.complete('凸透鏡（中間厚）把窗外的光<b>聚在一起</b>，投影出來是<b>上下顛倒</b>的！<br>📷 相機、我們的眼睛裡面也是這樣。'), '再看一次：大樹的樹幹在上面還是下面？'); } }); }
  },
  exit(c) { this.live = false; if (this.saved) { c.hemi.intensity = this.saved[0]; c.S.environmentIntensity = this.saved[1]; } },
};

// ======================================================================
// 透鏡 3：操場・陽光聚焦
// ======================================================================
const sunfocus = {
  stand: V(-5.1, .15, 18.9), face: .8, tp: true,
  build(S) {
    const g = new THREE.Group(); g.position.set(-4, .02, 20); S.add(g); this.g = g;
    const leaf = new THREE.Mesh(new THREE.CircleGeometry(.12, 20), M('#a8743f', { roughness: .9 })); leaf.scale.set(1, .55, 1); leaf.rotation.x = -Math.PI / 2; leaf.position.y = .01; g.add(leaf);
    this.R0 = .2; this.F = .6;
    const mg = new THREE.Group(); g.add(mg); this.mg = mg;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(this.R0, .018, 10, 40), M('#c9a227', { metalness: .7, roughness: .3 })); rim.rotation.x = Math.PI / 2; mg.add(rim);
    const gl = new THREE.Mesh(new THREE.SphereGeometry(this.R0, 32, 12), glassMat()); gl.scale.y = .14; mg.add(gl);
    const hd = cyl(.02, .025, .35, M('#5a3416'), this.R0 + .17, 0, 0, mg, 10); hd.rotation.z = Math.PI / 2;
    const cm = () => new THREE.MeshBasicMaterial({ color: '#fff6c8', transparent: true, opacity: .2, depthWrite: false, side: THREE.DoubleSide });
    this.colU = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 32, 1, true), cm()); g.add(this.colU);
    this.coneA = new THREE.Mesh(new THREE.CylinderGeometry(1, 0, 1, 32, 1, true), cm()); g.add(this.coneA);
    this.coneB = new THREE.Mesh(new THREE.CylinderGeometry(0, 1, 1, 32, 1, true), cm()); g.add(this.coneB);
    this.spot = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshBasicMaterial({ color: '#fff8d0', transparent: true, opacity: .9, depthWrite: false })); this.spot.rotation.x = -Math.PI / 2; this.spot.position.y = .015; g.add(this.spot);
    this.glow = new THREE.PointLight('#ffb347', 0, 1.5, 2); this.glow.position.y = .1; g.add(this.glow);
    this.h = 1.05; this.place();
  },
  geo(m, a, b) { if (m._a === a && m._b === b) return; m.geometry.dispose(); m.geometry = new THREE.CylinderGeometry(a, b, 1, 32, 1, true); m._a = a; m._b = b; },
  place() {
    const h = this.h, R0 = this.R0, F = this.F; this.mg.position.y = h;
    this.colU.scale.set(R0, 3, R0); this.colU.position.y = h + 1.5;
    const r = Math.max(.012, R0 * Math.abs(h - F) / F); this.r = r;
    if (h > F) { this.geo(this.coneA, 1, 0); this.coneA.scale.set(R0, F, R0); this.coneA.position.y = h - F / 2; this.coneB.visible = true; this.coneB.scale.set(r, h - F, r); this.coneB.position.y = (h - F) / 2; }
    else { this.geo(this.coneA, 1, +(r / R0).toFixed(2)); this.coneA.scale.set(R0, h, R0); this.coneA.position.y = h / 2; this.coneB.visible = false; }
    this.spot.scale.set(r, r, 1);
    const I = Math.min(1, (R0 * R0) / (r * r) / 110); this.I = I;
    this.spot.material.color.setRGB(1, 1 - I * .3, .85 - I * .7); this.glow.intensity = I * 5;
  },
  enter(c) {
    c.setCam({ pos: V(-2.7, 1.45, 21.25), look: V(-4, .45, 20), fov: 48 });
    this.h = 1.05; this.place(); this.hot = false;
    c.panel({ tag: '透鏡任務・第 3 站', title: '☀️ 操場：陽光聚焦', q: '太陽光穿過放大鏡，地上出現光點。<br>放大鏡<b>往上、往下</b>，光點什麼時候<b>最亮、最燙</b>？',
      hint: '<div style="display:flex;align-items:center;gap:8px">🌡️<div style="flex:1;height:16px;border-radius:9px;background:#24384d;overflow:hidden"><div id="thermo" style="height:100%;width:5%;background:linear-gradient(90deg,#ffe27a,#ff7a2a,#e0302a);transition:width .2s"></div></div></div>',
      buttons: [{ label: '⬆ 放大鏡往上', kind: 'act', id: 'up' }, { label: '⬇ 放大鏡往下', kind: 'act', id: 'dn' }] });
    holdBtn('up', () => { this.h = THREE.MathUtils.clamp(this.h + .008, .15, 1.3); this.place(); this.check(c); });
    holdBtn('dn', () => { this.h = THREE.MathUtils.clamp(this.h - .008, .15, 1.3); this.place(); this.check(c); });
    c.toast('⚠️ 放大鏡不能對著人、不能看太陽！', 2600);
  },
  check(c) {
    const th = document.getElementById('thermo'); if (th) th.style.width = (5 + this.I * 95) + '%';
    if (this.I > .85 && !this.hot) { this.hot = true; c.FXs('coin'); c.toast('🔥 好燙！光點變成小小的亮點！', 2000);
      c.addBtn({ label: '我知道了！', kind: 'go', on: () => { c.clearBtns(); setQ('光點什麼時候最亮、最燙？');
        options(['光點最大的時候', '光點最小的時候'], '光點最小的時候', () => c.complete('光點最小、最亮的地方叫做<b>焦點</b>——凸透鏡把光<b>聚在一起</b>。<br>⚠️ 很燙！放大鏡不能對著人、不能看太陽。'), '看溫度計：光點大的時候燙不燙？'); } }); }
  },
};

// ======================================================================
// 透鏡 4：光明公寓・門上的貓眼
// ======================================================================
const peephole = {
  stand: V(-3.0, .15, -7.4), face: .5, tp: true,
  build(S) {
    const g = new THREE.Group(); S.add(g); this.g = g;
    const room = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.9, 2.8), new THREE.MeshStandardMaterial({ color: '#efe6d6', side: THREE.BackSide, roughness: 1 })); room.position.set(-2, 1.45, -8.05); room.receiveShadow = true; g.add(room);
    box(1.0, 2.1, .08, M('#7a4a2a', { roughness: .6 }), -2, 1.05, -6.72, g);
    const ph = new THREE.Mesh(new THREE.TorusGeometry(.03, .012, 8, 20), M('#c9a227', { metalness: .8, roughness: .2 })); ph.position.set(-2, 1.52, -6.77); g.add(ph);
    box(.06, .2, .06, M('#c9a227', { metalness: .8, roughness: .2 }), -1.62, 1.05, -6.79, g);
    box(.9, .9, .35, M('#b98a5a'), -3.2, .45, -7.0, g);
    const mat = new THREE.Mesh(new THREE.PlaneGeometry(1.2, .6), M('#c0392b')); mat.rotation.x = -Math.PI / 2; mat.position.set(-2, .02, -7.2); g.add(mat);
    const lamp = new THREE.PointLight('#ffe2b0', 3, 6, 2); lamp.position.set(-2, 2.6, -8); g.add(lamp);
    box(1.0, 2.1, .08, M('#7a4a2a', { roughness: .6 }), -2, 1.05, -6.55, g);
    // 門外：送貨員＋兩個躲在旁邊的同學＋一隻貓
    const out = new THREE.Group(); g.add(out); this.out = out; out.visible = false;
    const d = person(out, { shirt: '#2f6fd1', pants: '#333', capC: '#2f6fd1' }); d.g.position.set(-2, .15, -4.9); d.g.rotation.y = Math.PI; box(.45, .35, .35, M('#c8a46e'), 0, .9, .3, d.g);
    const a = person(out, { shirt: '#ff7aa8', pants: '#3b5ba5', long: true }); a.g.position.set(-3.6, .15, -5.6); a.g.rotation.y = Math.PI - .5; a.armR.rotation.x = -2.6;
    const b = person(out, { shirt: '#42c27a', pants: '#2c3e50' }); b.g.position.set(-.4, .15, -5.5); b.g.rotation.y = Math.PI + .5; b.armL.rotation.x = -2.6;
    const ban = new THREE.Mesh(new THREE.PlaneGeometry(1.7, .5), new THREE.MeshStandardMaterial({ map: signTex('驚喜！', { bg: '#ffd84a', fg: '#c0392b', w: 512, h: 160 }), side: THREE.DoubleSide })); ban.position.set(-2, 2.05, -5.45); ban.rotation.y = Math.PI; out.add(ban);
    const cat = new THREE.Group(); cat.position.set(-1.3, .15, -5.9); out.add(cat);
    const cb = new THREE.Mesh(new THREE.CapsuleGeometry(.1, .22, 6, 12), M('#e8a24a')); cb.rotation.z = Math.PI / 2; cb.position.y = .16; cat.add(cb);
    const chd = new THREE.Mesh(new THREE.SphereGeometry(.1, 16, 12), M('#e8a24a')); chd.position.set(-.2, .3, 0); cat.add(chd);
    [-.05, .05].forEach(z => { const e = new THREE.Mesh(new THREE.ConeGeometry(.04, .08, 4), M('#e8a24a')); e.position.set(-.2, .42, z); cat.add(e); });
  },
  enter(c) {
    this.out.visible = true; this.asked = false;
    c.setCam({ pos: V(-2, 1.55, -9.1), look: V(-2, 1.4, -6.7), fov: 52 });
    setTimeout(() => { c.FXs('coin'); setTimeout(() => c.FXs('coin'), 350); }, 600);
    c.panel({ tag: '透鏡任務・第 4 站', title: '🚪 光明公寓：門上的貓眼', q: '叮咚！有人按門鈴。<br>從門上的小洞看出去——<b>外面有幾個人？</b>',
      buttons: [{ label: '🕳️ 只有小洞<br><small>沒有鏡片</small>', kind: 'act', on: () => this.look(c, false) }, { label: '🔍 裝了貓眼<br><small>凹透鏡・中間薄</small>', kind: 'act', on: () => this.look(c, true) }] });
    this.seen = new Set();
  },
  look(c, wide) {
    const L = c.lens, h = c.host.clientHeight, w = c.host.clientWidth;
    Object.assign(L, { on: true, ring: '#c9a227', x: Math.min(w * .4, w - 520 - h * .3), y: h * .5, r: h * .33, m: 1, k: wide ? .5 : 0, handle: false, drag: false, fixedPos: V(-2, 1.5, -6.4), fixedDir: V(0, -.1, 1).normalize(), fov: wide ? 120 : 15, hideKoko: true });
    if (L.x < L.r + 10) L.x = L.r + 10;
    c.FXs('pop'); this.seen.add(wide);
    c.hint(wide ? '哇！看到好多，但是每個都變<b>小</b>了' : '只看得到一點點……是誰？');
    if (this.seen.size === 2 && !this.asked) { this.asked = true;
      c.addBtn({ label: '我數好了！', kind: 'go', on: () => { c.clearBtns(); setQ('門外有幾個人？（貓不算 🐱）');
        options(['1 個', '2 個', '3 個'], '3 個', () => { c.complete(`${LENS_SVG(false)} 貓眼是<b>凹透鏡</b>（中間薄）：光散開，<b>看得更廣</b>，東西變小。<br>所以門外 3 個人都看到了！`); }, '用貓眼再看一次，左右兩邊也要看喔'); } }); }
  },
  exit(c) { c.lens.on = false; this.out.visible = false; },
};

// ======================================================================
// 共用：公園長椅・一滴水
// ======================================================================
const drop = {
  stand: V(49.0, .15, 14.0), face: 0, tp: true,
  build(S) {
    const g = new THREE.Group(); S.add(g); this.g = g;
    const c = document.createElement('canvas'); c.width = 1024; c.height = 720; const x = c.getContext('2d');
    x.fillStyle = '#f1ece0'; x.fillRect(0, 0, 1024, 720); x.fillStyle = '#222'; x.font = `900 58px ${FONT}`; x.fillText('竹東小鎮日報', 40, 80);
    x.fillRect(40, 100, 944, 6); x.font = `700 24px ${FONT}`;
    ['光線特勤隊今天在竹東街上找到好多光的祕密。', '一滴圓圓的水，可以讓報紙上的字變大。', '放大鏡、眼鏡、相機，都在讓光換方向。', '竹東溪的水很清，看起來淺淺的，其實更深。', '下水前先看深度標示，大人在旁邊才安全。', '十月的台灣欒樹開黃花，滿街都是金色的。', '內灣線小火車每天載著大家上山下山。', '光光偵探說：打開眼睛，世界就是實驗室。'].forEach((t, i) => x.fillText(t, 40, 152 + i * 36));
    x.font = `700 19px ${FONT}`; for (let i = 0; i < 8; i++) x.fillText('小小字：光走直線，碰到水面折一下，再繼續直直走。光光偵探好棒！', 40, 452 + i * 30);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(.6, .42), new THREE.MeshStandardMaterial({ map: t, roughness: .9 })); paper.rotation.set(-Math.PI / 2, 0, Math.PI + .2); paper.position.set(50.0, .545, 15.0); g.add(paper);
    const dm = new THREE.Mesh(new THREE.SphereGeometry(.03, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: '#cfeeff', transparent: true, opacity: .6, roughness: 0, clearcoat: 1 })); dm.scale.y = .55; dm.position.set(49.95, .548, 14.95); g.add(dm); this.drop = dm;
    const hl = new THREE.Mesh(new THREE.SphereGeometry(.007, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff' })); hl.position.set(-.008, .012, -.006); dm.add(hl);
  },
  enter(c, kind) {
    c.setCam({ pos: V(49.98, 1.15, 14.42), look: V(50.0, .54, 15.0), fov: 46 });
    const sync = () => { const sp = screenOf(this.drop.position); Object.assign(c.lens, { x: sp.x, y: sp.y }); };
    this.moved = 0; this.asked = false;
    const lensQ = kind === 'lens';
    const ask = () => { if (this.asked) return; this.asked = true; c.clearBtns(); setQ('水滴下面的字——');
      options(['變大', '變小'], '變大', () => {
        if (!lensQ) { c.complete('字<b>變大</b>了！圓圓的水滴<b>讓光換方向</b>，就跟放大鏡一樣。'); return; }
        c.clearBtns(); setQ('水滴的形狀是 ' + LENS_SVG(true) + ' 還是 ' + LENS_SVG(false) + ' ？');
        options(['中間厚', '中間薄'], '中間厚', () => c.complete(`${LENS_SVG(true)} 水滴<b>中間厚</b>，就是一個小小的<b>凸透鏡</b>！<br>讓光換方向，字就變大了。`), '從旁邊看，水滴是不是圓圓鼓鼓的？');
      }, '再拖一次水滴，仔細看字');
    };
    setTimeout(() => {
      Object.assign(c.lens, { on: true, ring: '#9fe3ff', r: Math.max(48, c.host.clientHeight * .09), m: 2.3, k: .35, handle: false, drag: true, fixedPos: null, fixedDir: null, fov: null, hideKoko: true });
      sync();
      c.lens.onMove = () => {
        const w = c.host.clientWidth, h = c.host.clientHeight; const rc = new THREE.Raycaster(); rc.setFromCamera(new THREE.Vector2(c.lens.x / w * 2 - 1, -(c.lens.y / h) * 2 + 1), c.cam);
        const p = new THREE.Vector3(); if (rc.ray.intersectPlane(new THREE.Plane(V(0, 1, 0), -.548), p)) { p.x = THREE.MathUtils.clamp(p.x, 49.75, 50.25); p.z = THREE.MathUtils.clamp(p.z, 14.82, 15.18); this.drop.position.set(p.x, .548, p.z); }
        this.dragged = true;
        if (++this.moved === 30 && !this.asked) c.hint('看到了嗎？按「我看出來了！」');
      };
    }, 1300);
    this.dragged = false; this.sync = sync;
    c.panel({ tag: (lensQ ? '透鏡任務' : '折射任務') + '・第 5 站', title: '💧 公園：一滴水', q: '剛下過雨，長椅上的報紙有一滴水。<br>用手指<b>拖著水滴</b>走過報紙上的字——字怎麼了？', hint: '拖曳畫面上的水滴',
      buttons: [{ label: '我看出來了！', kind: 'go', on: () => ask() }] });
  },
  update(dt, t, c) { if (c.lens.on && !this.dragged && this.sync) this.sync(); },
  exit(c) { c.lens.on = false; c.lens.onMove = null; },
};

// ======================================================================
// 折射 1：光光茶飲・杯子裡的吸管
// ======================================================================
const straw = {
  stand: V(-27.9, .15, -7.3), face: Math.PI - .6,
  build(S) {
    const g = new THREE.Group(); S.add(g); this.g = g;
    box(2.2, 1.1, .6, M('#6b4a30', { roughness: .6 }), -27, .55, -8.55, g); box(2.3, .05, .7, M('#e8dcc4'), -27, 1.125, -8.55, g);
    // 菜單小立牌
    const mn = new THREE.Mesh(new THREE.PlaneGeometry(.3, .4), new THREE.MeshStandardMaterial({ map: signTex('冬瓜茶', { w: 256, h: 340, bg: '#fff3d6', fg: '#5a3416', fs: 70 }) })); mn.position.set(-26.4, 1.35, -8.6); g.add(mn);
    this.B = 1.15; this.CX = -27; this.CZ = -8.45; const R0 = .085, H = .3;
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(R0, R0 * .82, H, 40, 1, true), glassMat()); cup.position.set(this.CX, this.B + H / 2, this.CZ); g.add(cup);
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(R0 * .82, 32), glassMat()); bottom.rotation.x = -Math.PI / 2; bottom.position.set(this.CX, this.B + .003, this.CZ); g.add(bottom);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(R0, .003, 6, 40), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .6 })); lip.rotation.x = Math.PI / 2; lip.position.set(this.CX, this.B + H, this.CZ); g.add(lip);
    const lip2 = lip.clone(); lip2.scale.setScalar(.82); lip2.position.y = this.B + .004; g.add(lip2);
    this.water = new THREE.Mesh(new THREE.CylinderGeometry(R0 * .97, R0 * .8, 1, 40), waterMat('#bfe3f2', .35)); this.water.position.set(this.CX, this.B, this.CZ); g.add(this.water);
    this.surf = new THREE.Mesh(new THREE.CircleGeometry(R0 * .97, 40), new THREE.MeshBasicMaterial({ color: '#e8f6ff', transparent: true, opacity: .4, side: THREE.DoubleSide, depthWrite: false })); this.surf.rotation.x = -Math.PI / 2; g.add(this.surf);
    const so = new THREE.Group();
    const st = new THREE.Mesh(new THREE.CylinderGeometry(.0075, .0075, .42, 12), M('#ff4f8b', { roughness: .4 })); so.add(st);
    so.position.set(this.CX - .035, this.B + .2, this.CZ); so.rotation.z = .32;
    const strawObj = new THREE.Group(); strawObj.add(so);
    this.split = splitWater(strawObj, this.B + .001, 1); g.add(this.split);
    this.setLevel(0);
  },
  setLevel(l) {
    this.level = l; const s = this.B + .004 + l;
    this.water.visible = l > .005; this.water.scale.y = Math.max(.001, l); this.water.position.y = this.B + .004 + l / 2;
    this.surf.visible = l > .005; this.surf.position.set(this.CX, s, this.CZ);
    this.split.userData.setS(s);
    const wet = l > .005;
    this.split.userData.sg.scale.y = wet ? .72 : 1;
    this.split.userData.inner.position.x = wet ? .03 : 0;      // 從旁邊看：水裡那段看起來往旁邊偏
  },
  setLift(v) { this.split.userData.up.position.y = v; this.split.userData.dn.position.y = v; },
  enter(c) {
    this.setLevel(0); this.setLift(0);
    const side = { pos: V(-27, 1.3, -7.78), look: V(-27, 1.3, -8.45), fov: 38 }, top = { pos: V(-27, 1.8, -8.15), look: V(-27, 1.2, -8.45), fov: 40 };
    c.setCam(side); this.view = 'side';
    const ask = () => { c.addBtn({ label: '我看到了！', kind: 'go', on: () => { c.clearBtns(); setQ('吸管真的斷掉了嗎？');
      options(['斷掉了', '沒有斷'], '沒有斷', () => { c.clearBtns(); c.hint('拿出來確認一下～');
        c.addBtn({ label: '🥤 拿出來看看', kind: 'act', on: (e) => { e.disabled = true; c.setCam({ pos: V(-27, 1.5, -7.62), look: V(-27.04, 1.42, -8.45), fov: 44 }, 1.2); tween(1.2, k => this.setLift(k * .3), () => { c.FXs('coin'); c.complete('吸管<b>沒有斷</b>，是直的！<br>光從水裡出來，在<b>水面折一下</b>，眼睛就被騙了。'); }); } }); },
        '先猜猜看：拿出來會是斷的嗎？'); } }); };
    c.panel({ tag: '折射任務・第 1 站', title: '🧋 光光茶飲：吸管', q: '杯子裡有一根吸管。<br>先<b>倒水</b>，再<b>從旁邊看</b>——吸管怎麼了？',
      buttons: [{ label: '💧 倒水', kind: 'act', on: (e) => { e.disabled = true; c.FXs('whoosh'); tween(1.6, k => this.setLevel(k * .2), () => { c.hint('水倒好了！仔細看水面那裡的吸管'); ask(); }); } },
        { label: '👀 換角度看', kind: 'act', on: () => { this.view = this.view === 'side' ? 'top' : 'side'; c.setCam(this.view === 'side' ? side : top, .8); } }] });
  },
  exit() { this.setLift(0); this.setLevel(0); },
};

// ======================================================================
// 折射 2：福德祠・碗裡的硬幣
// ======================================================================
const coin = {
  stand: V(25.2, .3, -9.0), face: Math.PI + .5,
  build(S) {
    const g = new THREE.Group(); S.add(g); this.g = g;
    this.C = V(24, 1.06, -10.6); const Rb = .22;
    const prof = []; for (let i = 0; i <= 12; i++) { const a = i / 12; prof.push(new THREE.Vector2(.08 + Math.sin(a * Math.PI / 2) * (Rb - .08), a * .12)); }
    const bowl = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), new THREE.MeshStandardMaterial({ color: '#f4f7fb', roughness: .35, side: THREE.DoubleSide })); bowl.position.copy(this.C).add(V(0, -.005, 0)); bowl.castShadow = true; g.add(bowl);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(Rb, .006, 6, 48), M('#2a6fb8')); ring.rotation.x = Math.PI / 2; ring.position.copy(this.C).add(V(0, .115, 0)); g.add(ring);
    const base = new THREE.Mesh(new THREE.CircleGeometry(.08, 32), M('#f4f7fb')); base.rotation.x = -Math.PI / 2; base.position.copy(this.C).add(V(0, .001, 0)); g.add(base);
    const coinObj = new THREE.Group(); const cm = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .006, 32), M('#d9a520', { metalness: .8, roughness: .25, emissive: '#5a3a00', emissiveIntensity: .3 })); cm.position.copy(this.C).add(V(0, .006, -.01)); coinObj.add(cm);
    this.split = splitWater(coinObj, this.C.y + .001, 1); g.add(this.split);
    this.water = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 48), waterMat('#cfe9f5', .3)); g.add(this.water);
    this.setLevel(0);
    [-.6, .6].forEach(dx => { const f = new THREE.Mesh(new THREE.SphereGeometry(.07, 14, 10), M(dx < 0 ? '#ff8a2a' : '#e0302a')); f.position.set(24 + dx, 1.12, -10.7); g.add(f); });
  },
  setLevel(l) {
    const s = this.C.y + .002 + l; this.split.userData.setS(s); this.split.userData.sg.scale.y = l > .003 ? Math.max(.45, 1 - l * 5.5) : 1;
    const r = .08 + Math.sin(Math.min(1, l / .12) * Math.PI / 2) * (.22 - .08) - .006;
    this.water.visible = l > .003;
    if (this.water.visible) { this.water.geometry.dispose(); this.water.geometry = new THREE.CylinderGeometry(r, .076, Math.max(.001, l), 48); }
    this.water.scale.set(1, 1, 1); this.water.position.set(this.C.x, this.C.y + l / 2, this.C.z);
  },
  enter(c) {
    this.setLevel(0);
    c.setCam({ pos: V(24, 1.435, -9.7), look: V(24, 1.08, -10.62), fov: 40 });
    const pour = () => c.addBtn({ label: '💧 慢慢倒水', kind: 'act', on: (e) => { e.disabled = true; c.FXs('whoosh'); tween(2.4, k => this.setLevel(k * .1), () => { c.FXs('coin'); c.hint('硬幣出現了！它自己浮上來了嗎？');
      c.addBtn({ label: '揭曉', kind: 'go', on: () => { c.clearBtns(); setQ('硬幣真的動了嗎？');
        options(['硬幣浮上來了', '硬幣沒有動'], '硬幣沒有動', () => c.complete('硬幣<b>沒有動</b>！光在水面<b>折一下</b>，硬幣看起來<b>浮上來</b>，我們就看到了。'), '想一想：我們只有倒水，有碰到硬幣嗎？'); } }); }); } });
    c.panel({ tag: '折射任務・第 2 站', title: '🪙 福德祠：碗裡的硬幣', q: '碗裡有一枚硬幣，從這裡<b>看不到</b>。<br>如果<b>倒水</b>進去，會看到硬幣嗎？先猜猜看！' });
    options(['會看到', '看不到'], null, () => { c.clearBtns(); c.hint('猜好了！倒水看看 👇'); pour(); });
  },
  exit() { this.setLevel(0); },
};

// ======================================================================
// 折射 3：光線國中游泳池（同學的腿看起來變短）
// ======================================================================
const pool = {
  stand: V(4.6, 1.45, 13.2), face: Math.PI / 4, tp: true,
  build(S) {
    const g = new THREE.Group(); S.add(g); this.g = g;
    const X = 9, Z = 18, Wd = 7.4, D = 11.4, top = 1.45, floor = .1; this.s = 1.3;
    const tc = document.createElement('canvas'); tc.width = tc.height = 128; const x = tc.getContext('2d'); x.fillStyle = '#7fd3ee'; x.fillRect(0, 0, 128, 128); x.strokeStyle = '#5cb8d8'; x.lineWidth = 3; for (let i = 0; i <= 128; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 128); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(128, i); x.stroke(); }
    const tile = (w, h) => { const t = new THREE.CanvasTexture(tc); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w, h); return new THREE.MeshStandardMaterial({ map: t, roughness: .5 }); };
    const flo = new THREE.Group();
    const fl = box(Wd, .1, D, tile(Wd * 2, D * 2), X, floor - .05, Z, flo); fl.castShadow = false;
    for (let i = 0; i < 4; i++) { const l = box(.25, .02, D - 1, M('#1f4f8f'), X - 2.6 + i * 1.75, floor + .01, Z, flo); l.castShadow = false; }
    cyl(.12, .12, .02, M('#d9a520', { metalness: .8, roughness: .3 }), 10.2, floor + .03, 17.6, flo, 24);
    this.floorSplit = splitWater(flo, this.s, .62); g.add(this.floorSplit);
    box(Wd, top - floor, .1, tile(Wd * 2, 3), X, (top + floor) / 2, Z - D / 2, g); box(Wd, top - floor, .1, tile(Wd * 2, 3), X, (top + floor) / 2, Z + D / 2, g);
    box(.1, top - floor, D, tile(D * 2, 3), X - Wd / 2, (top + floor) / 2, Z, g); box(.1, top - floor, D, tile(D * 2, 3), X + Wd / 2, (top + floor) / 2, Z, g);
    const deck = M('#e8e3da', { roughness: .8 });
    box(Wd + 3, top, 1.5, deck, X, top / 2, Z - D / 2 - .8, g); box(Wd + 3, top, 1.5, deck, X, top / 2, Z + D / 2 + .8, g);
    box(1.5, top, D, deck, X - Wd / 2 - .8, top / 2, Z, g); box(1.5, top, D, deck, X + Wd / 2 + .8, top / 2, Z, g);
    const dm = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .32), new THREE.MeshStandardMaterial({ map: signTex('水深 1.2M', { bg: '#e8e3da', fg: '#c0392b', w: 512, h: 150 }) })); dm.rotation.x = -Math.PI / 2; dm.position.set(X - 2.4, top + .006, Z - D / 2 - .45); g.add(dm);
    for (let k = 0; k < 2; k++) for (let i = 0; i < 28; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.06, 10, 8), M(i % 4 < 2 ? '#e0302a' : '#ffffff')); b.position.set(X - 1.2 + k * 2.4, this.s, Z - D / 2 + .3 + i * .4); g.add(b); }
    this.water = new THREE.Mesh(new THREE.BoxGeometry(Wd - .1, this.s - floor, D - .1), waterMat('#2e9fd0', .3)); this.water.position.set(X, (this.s + floor) / 2, Z); g.add(this.water);
    // 水面：波光（像真的游泳池）
    const cc = document.createElement('canvas'); cc.width = cc.height = 256; const q = cc.getContext('2d'); q.clearRect(0, 0, 256, 256); q.strokeStyle = 'rgba(255,255,255,.55)'; q.lineWidth = 2.2;
    for (let i = 0; i < 70; i++) { const x0 = Math.random() * 256, y0 = Math.random() * 256; q.beginPath(); q.moveTo(x0, y0); for (let k = 0; k < 4; k++) q.quadraticCurveTo(x0 + (Math.random() - .5) * 60, y0 + (Math.random() - .5) * 60, x0 + (Math.random() - .5) * 50, y0 + (Math.random() - .5) * 50); q.stroke(); }
    const ct = new THREE.CanvasTexture(cc); ct.wrapS = ct.wrapT = THREE.RepeatWrapping; ct.repeat.set(4, 6); this.ct = ct;
    this.surf = new THREE.Mesh(new THREE.PlaneGeometry(Wd - .1, D - .1), new THREE.MeshStandardMaterial({ color: '#5cc8ee', map: ct, transparent: true, opacity: .55, roughness: .05, metalness: .2, depthWrite: false }));
    this.surf.rotation.x = -Math.PI / 2; this.surf.position.set(X, this.s + .002, Z); g.add(this.surf);
    const pg = new THREE.Group(); const P = person(pg, { shirt: '#ffd84a', pants: '#1f4f8f', capC: '#1f4f8f', scale: 1.18 }); P.g.position.set(7.5, floor, 16.4); P.g.rotation.y = -2.5; P.armR.rotation.x = -2.8; P.armL.rotation.z = .5;
    this.split = splitWater(pg, this.s, .62); g.add(this.split);
    this.f = .62;
  },
  setF(f) { this.f = f; this.split.userData.setF(f); this.floorSplit.userData.setF(f); },
  update(dt, t) { if (this.ct) { this.ct.offset.x = Math.sin(t * .3) * .05; this.ct.offset.y = t * .02; } },
  enter(c) {
    this.setF(.62); this.water.material.opacity = .3; this.surf.material.opacity = .55; this.asked = false;
    c.setCam({ pos: V(5.0, 2.95, 12.9), look: V(7.8, .85, 16.8), fov: 52 });
    const ask = () => { this.asked = true; c.addBtn({ label: '我知道了！', kind: 'go', on: () => { c.clearBtns(); setQ('游泳池真的那麼淺嗎？');
      options(['真的很淺', '其實比較深'], '其實比較深', () => c.complete('看起來淺，<b>其實更深</b>！光在水面折一下，池底和腿都<b>看起來變高、變短</b>了。<br>🏊 下水前先看<b>水深標示</b>、大人在旁邊。'), '按「看真相」再比一次：腿的長度一樣嗎？'); } }); };
    c.panel({ tag: '折射任務・第 3 站', title: '🏊 光線國中游泳池', q: '同學站在水裡跟你揮手！<br>他的<b>腿看起來怎麼樣</b>？游泳池看起來淺淺的，<b>真的淺嗎？</b>',
      buttons: [{ label: '🔍 看真相：把水變透明', kind: 'act', on: (e) => { const on = this.f < .99; tween(1.4, k => { this.setF(on ? .62 + .38 * k : 1 - .38 * k); this.water.material.opacity = on ? .3 - .27 * k : .03 + .27 * k; this.surf.material.opacity = on ? .55 - .5 * k : .05 + .5 * k; }); e.innerHTML = on ? '💧 水放回來' : '🔍 看真相：把水變透明'; if (!this.asked) ask(); } }] });
  },
  exit() { this.setF(.62); this.water.material.opacity = .3; this.surf.material.opacity = .55; },
};

// ======================================================================
// 折射 4：竹東溪撈魚（真的光路：在水面折一下）
// ======================================================================
const fishing = {
  stand: V(54.6, .0, 12.0), face: Math.PI / 2, tp: true,
  build(S) {
    const g = new THREE.Group(); S.add(g); this.g = g; this.s = -1.0; this.f = .68;
    const fish = (col, sc) => { const f = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(.2, 18, 12), M(col, { roughness: .4, metalness: .2 })); b.scale.set(1.6, .7, .55); b.castShadow = true; f.add(b);
      const t = new THREE.Mesh(new THREE.ConeGeometry(.14, .22, 4), M(col)); t.rotation.z = Math.PI / 2; t.position.x = -.4; t.scale.z = .3; f.add(t);
      [-1, 1].forEach(s => { const e = new THREE.Mesh(new THREE.SphereGeometry(.03, 8, 6), M('#111')); e.position.set(.2, .04, s * .09); f.add(e); }); f.scale.setScalar(sc); return f; };
    const fg = new THREE.Group();
    const gold = fish('#f2b01e', 1.3); gold.position.set(61.5, -2.05, 12.6); fg.add(gold);
    gold.children[0].material = M('#f2b01e', { roughness: .3, metalness: .3, emissive: '#7a4a00', emissiveIntensity: .35 });
    [['#7c8a96', .9], ['#8a7a66', .8], ['#6f8f8a', 1], ['#9a8c7a', .7]].forEach(([c, s], i) => { const f = fish(c, s); f.position.set(61 + i * 1.3, -1.8 - (i % 2) * .4, 10 + i * 1.6); fg.add(f); });
    this.split = splitWater(fg, this.s, this.f); g.add(this.split);
    const net = new THREE.Group(); const rim = new THREE.Mesh(new THREE.TorusGeometry(.3, .02, 8, 32), M('#333')); rim.rotation.x = Math.PI / 2; net.add(rim);
    const bag = new THREE.Mesh(new THREE.ConeGeometry(.3, .4, 24, 1, true), new THREE.MeshStandardMaterial({ color: '#e8e8e8', wireframe: true })); bag.position.y = -.2; bag.rotation.x = Math.PI; net.add(bag);
    cyl(.018, .018, 2.4, M('#a8743f'), 0, 1.2, 0, net, 8); this.net = net; net.visible = false; g.add(net);
    this.ray = new THREE.Group(); g.add(this.ray);
  },
  groups() { const u = this.split.userData; return [u.inner.children[0], u.real, u.up]; },
  update(dt, t) {
    this.groups().forEach(grp => grp.children.forEach((f, i) => {
      if (i === 0) { if (!this.freeze) { f.position.z = 12.6 + Math.sin(t * .35) * .5; f.rotation.y = Math.cos(t * .35) > 0 ? -Math.PI / 2 : Math.PI / 2; } }
      else { const a = t * (.3 + i * .07) + i; f.position.x = 64 + Math.cos(a) * (1.2 + i * .3); f.position.z = 12 + Math.sin(a) * (1.6 + i * .2); f.rotation.y = -a - Math.PI / 2; }
    }));
  },
  goldReal() { return this.split.userData.real.children[0]; },
  goldSeen() { return this.split.userData.inner.children[0].children[0]; },
  aim(c, point, deeper) {
    const gold = this.goldReal(); this.freeze = true; c.UI.tapHandler = null;
    const E = (this.camBack0 ? this.camBack0.pos : c.cam.position).clone(); let end;
    if (deeper) end = gold.position.clone();
    else { const dir = point.clone().sub(E).normalize(); const tHit = (gold.position.y - E.y) / dir.y; end = E.clone().addScaledVector(dir, tHit); }
    const start = end.clone().add(V(0, 2.4, 0)); this.net.visible = true; c.FXs('whoosh');
    tween(.9, k => this.net.position.lerpVectors(start, end, k), () => {
      const miss = Math.hypot(end.x - gold.position.x, end.z - gold.position.z) > .35;
      if (miss) { c.FXs('wrongsoft'); c.toast('😮 撲空了！', 1300); c.hint('魚明明就在那裡啊……');
        c.clearBtns(); c.addBtn({ label: '👀 看真相', kind: 'act', on: () => this.truth(c) }); }
      else this.caught(c);
    });
  },
  truth(c) {
    this.net.visible = false;
    const gold = this.goldReal(); const F = gold.position.clone(); const E = this.camBack0.pos.clone(); const s = this.s;
    this.split.userData.real.visible = true; this.split.userData.real.children.forEach((f, i) => f.visible = i === 0);
    this.camBack = { pos: c.cam.position.clone(), look: F.clone() };
    let lo = 0, hi = 1; const P = new THREE.Vector3();
    for (let i = 0; i < 40; i++) { const t = (lo + hi) / 2; P.set(F.x + (E.x - F.x) * t, s, F.z + (E.z - F.z) * t);
      const sw = Math.hypot(P.x - F.x, P.z - F.z) / P.distanceTo(F), sa = Math.hypot(E.x - P.x, E.z - P.z) / E.distanceTo(P); if (N_WATER * sw > sa) hi = t; else lo = t; }
    this.ray.clear();
    tube(F, P, '#ffe14d', .025, this.ray); tube(P, P.clone().lerp(E, .7), '#ffe14d', .025, this.ray);
    const back = P.clone().sub(E).normalize(); const appY = this.goldSeen().getWorldPosition(new THREE.Vector3()).y; const A = P.clone().addScaledVector(back, (appY - P.y) / back.y);
    tube(P, A, '#ff9fbf', .012, this.ray).material.opacity = .85;
    const kink = new THREE.Mesh(new THREE.RingGeometry(.12, .17, 32), new THREE.MeshBasicMaterial({ color: '#ffe14d', depthTest: false, side: THREE.DoubleSide })); kink.position.copy(P); kink.rotation.x = -Math.PI / 2; kink.renderOrder = 9; this.ray.add(kink);
    label3d('真的魚', '#ff8fb0', F.clone().add(V(.5, -.45, 0)), 1.1, this.ray); label3d('看起來的魚', '#ffe14d', A.clone().add(V(.6, .45, 0)), 1.1, this.ray); label3d('在水面折一下', '#ffffff', P.clone().add(V(-.6, .6, 0)), 1.0, this.ray);
    // 眼睛＋從側面看整條光路
    label3d('👁 你的眼睛', '#ffffff', E.clone().add(V(0, .35, 0)), 1.1, this.ray);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.12, 20, 14), new THREE.MeshBasicMaterial({ color: '#ffffff', depthTest: false })); eye.position.copy(E); eye.renderOrder = 9; this.ray.add(eye);
    const pu = new THREE.Mesh(new THREE.SphereGeometry(.06, 12, 10), new THREE.MeshBasicMaterial({ color: '#222', depthTest: false })); pu.position.copy(E).add(F.clone().sub(E).normalize().multiplyScalar(.09)); pu.renderOrder = 10; this.ray.add(pu);
    tube(P.clone().lerp(E, .7), E, '#ffe14d', .025, this.ray);
    const surf = tube(V(Math.min(E.x, F.x) - 1, s, (E.z + F.z) / 2), V(Math.max(E.x, F.x) + 1.5, s, (E.z + F.z) / 2), '#9fe3ff', .008, this.ray); surf.material.opacity = .7;
    const Mid = E.clone().add(F).multiplyScalar(.5), hz = V(F.x - E.x, 0, F.z - E.z).normalize(), nrm = V(-hz.z, 0, hz.x);
    const rgt = new THREE.Vector3().crossVectors(nrm.clone().negate(), V(0, 1, 0)).normalize();
    c.setCam({ pos: Mid.clone().addScaledVector(nrm, 7.2).add(V(0, .8, 0)).addScaledVector(rgt, 1.8), look: Mid.clone().addScaledVector(rgt, 2.0).add(V(0, -.95, 0)), fov: 50 }, 1.6);
    c.FXs('coin');
    c.clearBtns(); setQ('粉紅色的才是<b>真的魚</b>！<br>下次網子要往哪裡撈？'); c.hint('黃色是光走的路：從魚出發，在水面<b>折一下</b>，才到你的眼睛');
    options(['看起來的魚「上面」', '看起來的魚「下面」（更深）'], '看起來的魚「下面」（更深）', () => { c.clearBtns(); c.hint('對！再撈一次 👇');
      c.addBtn({ label: '🎣 往下面一點撈！', kind: 'go', on: () => { this.ray.clear(); this.split.userData.real.visible = false; c.setCam(this.camBack0, .8); setTimeout(() => this.aim(c, null, true), 700); } }); }, '粉紅色的魚在黃色的魚上面還是下面？');
  },
  caught(c) {
    c.FXs('powerup');
    const y0 = this.goldReal().position.y;
    tween(1.0, k => { this.net.position.y = y0 + k * 1.9; this.groups().forEach(grp => grp.children[0].position.y = y0 + k * 1.9); }, () => {
      c.complete('撈到了！🐟 魚真正的位置<b>比看起來更深</b>。<br>光從水裡出來，在<b>水面折一下</b>，眼睛以為光是直直來的。<br>（撈完放回竹東溪～）');
      setTimeout(() => this.reset(), 4000);
    });
  },
  reset() { this.net.visible = false; this.freeze = false; this.groups().forEach(grp => grp.children[0].position.y = -2.05); this.ray.clear(); this.split.userData.real.visible = false; },
  enter(c) {
    this.reset();
    this.camBack0 = { pos: V(55.7, .75, 13.6), look: V(61.8, -1.75, 12.4), fov: 46 }; c.setCam(this.camBack0);
    c.panel({ tag: '折射任務・第 4 站', title: '🐟 竹東溪：撈魚', q: '竹東溪的水好清！<br><b>點一下金色的魚</b>，用網子撈撈看！', hint: '直接點畫面上的金色魚' });
    c.UI.tapHandler = (ray) => { const p = new THREE.Vector3(); const hits = ray.intersectObject(this.split.userData.inner, true);
      if (hits.length) p.copy(hits[0].point); else if (!ray.ray.intersectPlane(new THREE.Plane(V(0, 1, 0), -this.s), p)) return;
      this.aim(c, p, false); };
  },
  exit(c) { c.UI.tapHandler = null; this.reset(); },
};

// ======================================================================
export const ROUTES = {
  lens: { name: '🔍 透鏡任務', kind: 'lens', intro: '透鏡任務開始！跟著光光偵探，去找「中間厚」和「中間薄」的鏡片',
    finale: `${LENS_SVG(true)} <b>中間厚＝凸透鏡</b>：字變大、把光聚在一起（焦點）、遠處景色投影會<b>倒過來</b>。<br>${LENS_SVG(false)} <b>中間薄＝凹透鏡</b>：字變小、光散開、<b>看得更廣</b>。<br>💧 一滴水也是小小的凸透鏡！`,
    stops: [
      { icon: '👓', short: '眼鏡行', m: glasses },
      { icon: '🏫', short: '教室投影', m: darkroom },
      { icon: '☀️', short: '操場聚光', m: sunfocus },
      { icon: '🚪', short: '貓眼', m: peephole },
      { icon: '💧', short: '一滴水', m: drop },
    ] },
  refract: { name: '💧 折射任務', kind: 'refract', intro: '折射任務開始！光走直線，碰到水面會「折一下」——去找出眼睛被騙的地方',
    finale: '光走直線，碰到<b>水面折一下</b>，再繼續直直走——這就是<b>折射</b>！<br>🧋 吸管看起來斷了　🪙 硬幣看起來浮上來<br>🏊 游泳池看起來淺　🐟 魚看起來比較高<br>💧 圓圓的水滴讓光換方向，字變大',
    stops: [
      { icon: '🧋', short: '吸管', m: straw },
      { icon: '🪙', short: '硬幣', m: coin },
      { icon: '🏊', short: '游泳池', m: pool },
      { icon: '🐟', short: '撈魚', m: fishing },
      { icon: '💧', short: '一滴水', m: drop },
    ] },
};

const ALL = [glasses, darkroom, sunfocus, peephole, drop, straw, coin, pool, fishing];
export function setupMissions(c) {
  C = c;
  ALL.forEach(m => m.build(c.S, c.R));
}
// 小道具只在附近才畫（大型的教室、游泳池一直顯示）
const SMALL = [glasses, sunfocus, peephole, drop, straw, coin, fishing];
export function cullMissions(p, current) {
  SMALL.forEach(m => { if (m.g) m.g.visible = m === current || Math.hypot(p.x - m.stand.x, p.z - m.stand.z) < 40; });
}
