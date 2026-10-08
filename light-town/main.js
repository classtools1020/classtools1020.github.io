// 光線小鎮：主程式（玩家、鏡頭、導覽、介面、放大鏡疊圖）
import * as THREE from './lib/three.module.min.js';
import { RoomEnvironment } from './lib/RoomEnvironment.js';
import { buildWorld, updateWorld, koko, petals, person, walkPose, M, rand } from './world.js';
import { ROUTES, setupMissions, cullMissions } from './missions.js';

const host = document.getElementById('stage');
const R = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: false });
R.setPixelRatio(Math.min(devicePixelRatio, 1.5));
R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = .8;
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.localClippingEnabled = true; R.autoClear = false;
host.appendChild(R.domElement);
const S = new THREE.Scene();
S.fog = new THREE.Fog('#cfe0ea', 90, 380);
S.environment = new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(R), .04).texture; S.environmentIntensity = .5;
const cam = new THREE.PerspectiveCamera(55, 16 / 9, .05, 900);

// 光
const hemi = new THREE.HemisphereLight('#cfe4ff', '#7d6e52', .55); S.add(hemi);
const sun = new THREE.DirectionalLight('#fff0d2', 2.5); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 160 });
sun.shadow.bias = -.0004; sun.shadow.normalBias = .03; S.add(sun); S.add(sun.target);
const SUN_DIR = new THREE.Vector3(-.45, .78, .42).normalize();

const W = buildWorld(S);

// 落花（欒樹黃花）
const PN = 260; const pg = new THREE.BufferGeometry(); const pp = new Float32Array(PN * 3), pv = [];
for (let i = 0; i < PN; i++) { pp.set([(rand() - .5) * 60, rand() * 8, (rand() - .5) * 30], i * 3); pv.push(.3 + rand() * .5); }
pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
const pc = document.createElement('canvas'); pc.width = pc.height = 32; { const g = pc.getContext('2d'); const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, '#fff2a0'); gr.addColorStop(.5, '#f0c93a'); gr.addColorStop(1, 'rgba(240,200,58,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); }
const petalPts = new THREE.Points(pg, new THREE.PointsMaterial({ size: .16, map: new THREE.CanvasTexture(pc), transparent: true, depthWrite: false })); S.add(petalPts);

// 路人
const npcs = [];
[[-30, -5.4, 1, '#e57373', '#37474f'], [12, 5.4, -1, '#64b5f6', '#263238', true], [36, -5.4, -1, '#ffd54f', '#5d4037'], [-12, 5.4, 1, '#81c784', '#212121']].forEach(([x, z, dir, sh, pa, long], i) => {
  const P = person(S, { shirt: sh, pants: pa, long, hair: ['#2a2220', '#4a3020'][i % 2], bag: i % 2 ? '#3b6ea5' : null });
  P.g.position.set(x, .15, z); P.dir = dir; P.ph = i; npcs.push(P);
});

// 玩家
const K = koko(S); K.g.position.set(-52, .15, 1.5); K.g.rotation.y = Math.PI / 2;
const player = { yaw: Math.PI / 2, speed: 0, target: null, path: [], onArrive: null, walkT: 0 };

// ---------- 鏡頭 ----------
const camState = { mode: 'follow', from: null, to: null, t: 1, dur: 1.2, pose: null };
const followPose = () => {
  const p = K.g.position, back = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
  return { pos: p.clone().addScaledVector(back, 5.2).add(new THREE.Vector3(0, 2.6, 0)), look: p.clone().add(new THREE.Vector3(0, 1.1, 0)).addScaledVector(back, -3) };
};
let camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
function setCam(pose, dur = 1.2) { camState.mode = 'fixed'; camState.from = { pos: camPos.clone(), look: camLook.clone() }; camState.to = pose; camState.t = 0; camState.dur = dur; }
function followCam() { camState.mode = 'follow'; camState.from = { pos: camPos.clone(), look: camLook.clone() }; camState.t = 0; camState.dur = 1; }
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
function updateCam(dt) {
  camState.t = Math.min(1, camState.t + dt / camState.dur);
  const tgt = camState.mode === 'follow' ? followPose() : camState.to;
  if (camState.from && camState.t < 1) { const e = ease(camState.t); camPos.lerpVectors(camState.from.pos, tgt.pos, e); camLook.lerpVectors(camState.from.look, tgt.look, e); }
  else if (camState.mode === 'follow') { camPos.lerp(tgt.pos, 1 - Math.exp(-dt * 5)); camLook.lerp(tgt.look, 1 - Math.exp(-dt * 6)); }
  else { camPos.copy(tgt.pos); camLook.copy(tgt.look); }
  cam.position.copy(camPos); cam.lookAt(camLook);
  if (camState.to && camState.to.fov && camState.mode === 'fixed') { cam.fov += (camState.to.fov - cam.fov) * Math.min(1, dt * 4); cam.updateProjectionMatrix(); }
  else if (camState.mode === 'follow' && Math.abs(cam.fov - 55) > .01) { cam.fov += (55 - cam.fov) * Math.min(1, dt * 4); cam.updateProjectionMatrix(); }
}
{ const f = followPose(); camPos.copy(f.pos); camLook.copy(f.look); }

// ---------- 走路 ----------
const keys = {};
addEventListener('keydown', e => { keys[e.key] = true; if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key) && !e.target.closest('input')) e.preventDefault(); });
addEventListener('keyup', e => { keys[e.key] = false; });
const hold = { f: 0, l: 0, r: 0, b: 0 };
function walkTo(points, onArrive) { player.path = points.map(p => p.clone()); player.onArrive = onArrive; }
function updatePlayer(dt, t) {
  const p = K.g.position; let moving = false;
  if (player.path.length) {
    const tgt = player.path[0]; const d = new THREE.Vector3(tgt.x - p.x, 0, tgt.z - p.z); const L = d.length();
    if (L < .15) { player.path.shift(); if (!player.path.length && player.onArrive) { const f = player.onArrive; player.onArrive = null; f(); } }
    else { const want = Math.atan2(d.x, d.z); let dy = ((want - player.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI; player.yaw += dy * Math.min(1, dt * 8);
      const sp = Math.min(L, 7.5 * dt); p.x += d.x / L * sp; p.z += d.z / L * sp; moving = true; }
  } else if (!UI.busy) {
    const f = (keys.ArrowUp || keys.w || keys.W || hold.f ? 1 : 0) - (keys.ArrowDown || keys.s || keys.S || hold.b ? 1 : 0);
    const turn = (keys.ArrowLeft || keys.a || keys.A || hold.l ? 1 : 0) - (keys.ArrowRight || keys.d || keys.D || hold.r ? 1 : 0);
    player.yaw += turn * dt * 2.2;
    if (f) { p.x += Math.sin(player.yaw) * f * dt * 5; p.z += Math.cos(player.yaw) * f * dt * 5; moving = true; }
    p.x = THREE.MathUtils.clamp(p.x, -57, 78); p.z = THREE.MathUtils.clamp(p.z, -8.6, 8.6);
  }
  K.g.rotation.y = player.yaw;
  if (moving) { player.walkT += dt * 12; const a = Math.sin(player.walkT) * .6; K.legL.rotation.x = a; K.legR.rotation.x = -a; K.body.position.y = .82 + Math.abs(Math.sin(player.walkT)) * .05; K.body.rotation.z = Math.sin(player.walkT) * .05; }
  else { K.legL.rotation.x *= .8; K.legR.rotation.x *= .8; K.body.position.y = .82 + Math.sin(t * 2) * .02; K.body.rotation.z *= .9; }
  K.mag.rotation.z = -.5 + Math.sin(t * 1.5) * .08;
}

// ---------- 放大鏡疊圖（第二支相機把畫面放大／縮小，再貼成圓形） ----------
const RT = new THREE.WebGLRenderTarget(640, 640, { samples: 2 }); RT.texture.colorSpace = THREE.SRGBColorSpace;
const zoomCam = new THREE.PerspectiveCamera(20, 1, .02, 600);
const ovScene = new THREE.Scene(); const ovCam = new THREE.OrthographicCamera(0, 1, 1, 0, -10, 10);
const lensMat = new THREE.ShaderMaterial({
  uniforms: { map: { value: RT.texture }, k: { value: .25 }, edge: { value: 0 } }, transparent: true, depthTest: false,
  vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: `uniform sampler2D map;uniform float k;uniform float edge;varying vec2 vUv;
  void main(){vec2 c=vUv-.5;float r=length(c)*2.;if(r>1.)discard;
    vec2 uv=.5+c*(1.-k+k*r*r);                 // 中間放大、邊緣壓縮：像真的鏡片
    vec4 col=texture2D(map,uv);
    float vig=smoothstep(1.,.75,r);col.rgb*=mix(.78,1.,vig);
    col.rgb+=edge*(1.-vig)*.25;
    gl_FragColor=vec4(col.rgb,1.);}`
});
lensMat.toneMapped = false;
const lensDisc = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), lensMat); ovScene.add(lensDisc);
const ringMesh = new THREE.Mesh(new THREE.RingGeometry(.5, .56, 64), new THREE.MeshBasicMaterial({ color: '#c9a227', depthTest: false })); ovScene.add(ringMesh);
const ring2 = new THREE.Mesh(new THREE.RingGeometry(.49, .5, 64), new THREE.MeshBasicMaterial({ color: '#fff7d0', transparent: true, opacity: .7, depthTest: false })); ovScene.add(ring2);
const handle = new THREE.Mesh(new THREE.PlaneGeometry(.14, .62), new THREE.MeshBasicMaterial({ color: '#5a3416', depthTest: false })); ovScene.add(handle);
const glare = new THREE.Mesh(new THREE.CircleGeometry(.12, 24), new THREE.MeshBasicMaterial({ color: '#fff', transparent: true, opacity: .25, depthTest: false })); ovScene.add(glare);
export const lens = { on: false, x: 0, y: 0, r: 120, m: 2, k: .25, handle: true, hideKoko: true, drag: true, fixedDir: null, fov: null, onMove: null, ring: '#c9a227' };
function renderLens() {
  const w = host.clientWidth, h = host.clientHeight;
  const ndc = new THREE.Vector3(lens.x / w * 2 - 1, -(lens.y / h) * 2 + 1, .5).unproject(cam);
  const dir = lens.fixedDir ? lens.fixedDir.clone() : ndc.sub(cam.position).normalize();
  zoomCam.position.copy(lens.fixedPos || cam.position); zoomCam.up.copy(cam.up); zoomCam.lookAt(zoomCam.position.clone().add(dir));
  const F = THREE.MathUtils.degToRad(cam.fov);
  zoomCam.fov = lens.fov || THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(F / 2) * (2 * lens.r / h) / lens.m));
  zoomCam.updateProjectionMatrix();
  const kv = K.g.visible; if (lens.hideKoko) K.g.visible = false;
  R.setRenderTarget(RT); R.clear(); R.render(S, zoomCam); R.setRenderTarget(null); K.g.visible = kv;
  ovCam.right = w; ovCam.top = h; ovCam.updateProjectionMatrix();
  const X = lens.x, Y = h - lens.y, D = lens.r * 2;
  lensMat.uniforms.k.value = lens.k; ringMesh.material.color.set(lens.ring || '#c9a227');
  lensDisc.position.set(X, Y, 0); lensDisc.scale.set(D, D, 1);
  ringMesh.position.set(X, Y, 1); ringMesh.scale.set(D, D, 1); ring2.position.copy(ringMesh.position); ring2.scale.copy(ringMesh.scale);
  handle.visible = lens.handle; handle.position.set(X + lens.r * .95, Y - lens.r * 1.25, 1); handle.scale.set(D, D, 1); handle.rotation.z = .6;
  glare.position.set(X - lens.r * .4, Y + lens.r * .45, 2); glare.scale.set(D * .6, D * .35, 1);
  R.render(ovScene, ovCam);
}
// 拖曳放大鏡
let dragging = false;
R.domElement.addEventListener('pointerdown', e => {
  const r = R.domElement.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  if (lens.on && lens.drag && Math.hypot(x - lens.x, y - lens.y) < lens.r * 1.4) { dragging = true; R.domElement.setPointerCapture(e.pointerId); return; }
  onTap(x, y, e);
});
R.domElement.addEventListener('pointermove', e => { if (!dragging) return; const r = R.domElement.getBoundingClientRect(); lens.x = e.clientX - r.left; lens.y = e.clientY - r.top; lens.onMove && lens.onMove(); });
R.domElement.addEventListener('pointerup', () => { dragging = false; });

// ---------- 點畫面：任務物件或地板 ----------
const ray = new THREE.Raycaster(); const tapTargets = [];
function onTap(x, y) {
  const w = host.clientWidth, h = host.clientHeight; ray.setFromCamera(new THREE.Vector2(x / w * 2 - 1, -(y / h) * 2 + 1), cam);
  if (UI.tapHandler) { UI.tapHandler(ray, x, y); return; }
  if (UI.busy) return;
  const hits = ray.intersectObjects(tapTargets, true);
  if (hits.length) { let o = hits[0].object; while (o && !o.userData.onTap) o = o.parent; if (o) { o.userData.onTap(); return; } }
  const gp = new THREE.Vector3(); if (ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -.15), gp)) {
    gp.x = THREE.MathUtils.clamp(gp.x, -57, 78); gp.z = THREE.MathUtils.clamp(gp.z, -8.6, 8.6); walkTo([gp]);
    const m = tapMark; m.position.set(gp.x, .2, gp.z); m.visible = true; m.scale.setScalar(.2); tapMarkT = 0;
  }
}
const tapMark = new THREE.Mesh(new THREE.RingGeometry(.3, .42, 32), new THREE.MeshBasicMaterial({ color: '#ffd84a', transparent: true })); tapMark.rotation.x = -Math.PI / 2; tapMark.visible = false; S.add(tapMark); let tapMarkT = 0;

// ---------- 介面 ----------
const $ = id => document.getElementById(id);
export const UI = { busy: false, tapHandler: null };
const FXs = n => { try { window.FX && FX.sound[n] && FX.sound[n](); } catch (e) {} };
const say = t => { try { window.FX && FX.speak && FX.speak(t); } catch (e) {} };
function panel(o) {
  const p = $('panel'); p.innerHTML = ''; p.classList.remove('hide');
  const h = document.createElement('div'); h.className = 'ptag'; h.textContent = o.tag || ''; p.appendChild(h);
  const t = document.createElement('div'); t.className = 'ptitle'; t.textContent = o.title; p.appendChild(t);
  const q = document.createElement('div'); q.className = 'pq'; q.id = 'pq'; q.innerHTML = o.q || ''; p.appendChild(q);
  const hint = document.createElement('div'); hint.className = 'phint'; hint.id = 'phint'; hint.innerHTML = o.hint || ''; p.appendChild(hint);
  const row = document.createElement('div'); row.className = 'prow'; row.id = 'prow'; p.appendChild(row);
  (o.buttons || []).forEach(b => addBtn(b));
  const ans = document.createElement('div'); ans.className = 'pans hide'; ans.id = 'pans'; p.appendChild(ans);
  if (o.q) say(o.q.replace(/<[^>]+>/g, ''));
}
function addBtn(b) {
  const row = $('prow'); const e = document.createElement('button'); e.className = 'pbtn ' + (b.kind || ''); e.innerHTML = b.label; if (b.id) e.id = b.id;
  e.onclick = () => { FXs('blip'); b.on && b.on(e); }; row.appendChild(e); return e;
}
function clearBtns() { $('prow').innerHTML = ''; }
function hint(t) { $('phint').innerHTML = t; }
function answer(t) { const a = $('pans'); a.innerHTML = t; a.classList.remove('hide'); a.classList.remove('pop'); void a.offsetWidth; a.classList.add('pop'); say(t.replace(/<[^>]+>/g, '')); }
function hidePanel() { $('panel').classList.add('hide'); }
function toast(t, ms = 1600) { const e = $('toast'); e.innerHTML = t; e.classList.add('show'); clearTimeout(e._t); e._t = setTimeout(() => e.classList.remove('show'), ms); }

// ---------- 導覽 ----------
let route = null, idx = 0; const done = new Set(); let markers = [];
function stampBar() {
  const b = $('stamps'); b.innerHTML = '';
  if (!route) { b.classList.add('hide'); return; } b.classList.remove('hide');
  const t = document.createElement('div'); t.className = 'stitle'; t.textContent = route.name; b.appendChild(t);
  route.stops.forEach((s, i) => { const d = document.createElement('div'); d.className = 'stamp' + (done.has(i) ? ' on' : '') + (i === idx && !done.has(i) ? ' cur' : ''); d.innerHTML = `<span>${done.has(i) ? s.icon : i + 1}</span><small>${s.short}</small>`; d.onclick = () => goStop(i); b.appendChild(d); });
}
function nextBtn() {
  const b = $('next');
  if (!route) { b.classList.add('hide'); return; }
  if (done.size >= route.stops.length) { b.innerHTML = '🏆 結案！'; b.onclick = finale; b.classList.remove('hide'); return; }
  while (done.has(idx)) idx = (idx + 1) % route.stops.length;
  b.innerHTML = `▶ 下一站：${route.stops[idx].short}`; b.onclick = () => goStop(idx); b.classList.remove('hide');
}
function placeMarkers() {
  markers.forEach(m => S.remove(m)); markers = []; tapTargets.length = 0;
  if (!route) return;
  route.stops.forEach((s, i) => {
    const g = new THREE.Group(); g.position.copy(s.m.stand).add(new THREE.Vector3(0, 0, 0)); S.add(g);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.55, .07, 10, 40), new THREE.MeshBasicMaterial({ color: '#ffd84a' })); ring.rotation.x = Math.PI / 2; ring.position.y = .22; g.add(ring);
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    x.fillStyle = '#ffd84a'; x.beginPath(); x.arc(128, 128, 110, 0, 7); x.fill(); x.lineWidth = 14; x.strokeStyle = '#7a4a22'; x.stroke();
    x.font = '120px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s.icon, 128, 136);
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, depthTest: false })); sp.scale.set(1.2, 1.2, 1); sp.position.y = 2.6; sp.renderOrder = 5; g.add(sp);
    g.userData.onTap = () => goStop(i); g.userData.i = i; tapTargets.push(g); markers.push(g);
  });
}
function pathTo(stand) {
  const p = K.g.position, pts = [];
  const lane = stand.z < 0 ? -1.6 : 1.6;
  if (Math.abs(p.z) > 3.5 || Math.abs(p.x - stand.x) > 3) { pts.push(new THREE.Vector3(p.x, 0, lane)); pts.push(new THREE.Vector3(stand.x, 0, lane)); }
  if (stand.via) stand.via.forEach(v => pts.push(v));
  pts.push(stand.clone()); return pts;
}
let current = null;
function fadeTo(cb) {
  const f = $('fade'); f.classList.add('on');
  setTimeout(() => { cb(); camState.t = 1; updateCam(0); setTimeout(() => f.classList.remove('on'), 120); }, 380);
}
function goStop(i) {
  if (!route) return; if (current) endMission(false);
  idx = i; stampBar(); $('next').classList.add('hide'); UI.busy = true; followCam(); FXs('jump');
  const s = route.stops[i], st = s.m.stand;
  const far = s.m.tp || Math.abs(st.z) > 8.8;
  if (far) {
    const near = new THREE.Vector3(THREE.MathUtils.clamp(st.x, -57, 76), .15, st.z < 0 ? -1.6 : 1.6);
    walkTo(pathTo(near), () => fadeTo(() => { K.g.position.copy(st); startMission(i, near); }));
  } else walkTo(pathTo(st), () => startMission(i));
}
function startMission(i, back) {
  const s = route.stops[i]; current = s.m; current._back = back || null; markers.forEach(m => m.visible = false);
  if (s.m.face != null) player.yaw = s.m.face;
  UI.busy = true; FXs('whoosh');
  s.m.enter(ctx, route.kind);
  addEventListener('keydown', escH);
}
function escH(e) { if (e.key === 'Escape') endMission(false); }
function complete(text) {
  // text：最後的重點一句
  if (!current) return;
  const i = idx; if (!done.has(i)) { done.add(i); FXs('stamp'); setTimeout(() => FXs('clear'), 300); try { FX.confetti(80); } catch (e) {} }
  answer(text);
  clearBtns();
  addBtn({ label: done.size >= route.stops.length ? '🏆 去結案' : '▶ 下一站', kind: 'go', on: () => { endMission(true); } });
  stampBar();
}
function endMission(next) {
  removeEventListener('keydown', escH);
  if (current) { current.exit && current.exit(ctx); if (current._back) { const b = current._back; K.g.position.copy(b); camState.t = 1; } current = null; }
  lens.on = false; UI.tapHandler = null; UI.busy = false; hidePanel(); followCam(); markers.forEach((m, i) => m.visible = !done.has(i));
  if (next) { if (done.size >= route.stops.length) finale(); else { nextBtn(); goStop(idx); } } else nextBtn();
  stampBar();
}
function finale() {
  $('next').classList.add('hide'); UI.busy = true;
  setCam({ pos: K.g.position.clone().add(new THREE.Vector3(0, 1.6, 4.5).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.yaw)), look: K.g.position.clone().add(new THREE.Vector3(0, 1, 0)) }, 1.5);
  try { FX.sound.clear(); FX.fireworks(3200); FX.confetti(200); } catch (e) {}
  const f = $('finale'); f.querySelector('.fl').innerHTML = route.finale; f.classList.remove('hide');
  f.querySelector('button').onclick = () => { f.classList.add('hide'); UI.busy = false; followCam(); };
}

// 給任務用的工具箱
export const ctx = { THREE, S, R, cam, K, W, player, hemi, sun, setCam, followCam, panel, addBtn, clearBtns, hint, answer, complete, toast, lens, UI, M, person, walkPose, say, FXs, host, tapTargets };
setupMissions(ctx);

// ---------- 開始畫面 ----------
function startRoute(key) {
  $('start').classList.add('hide');
  route = key ? ROUTES[key] : null; done.clear(); idx = 0;
  placeMarkers(); stampBar(); nextBtn();
  try { history.replaceState(null, '', '#' + (key || 'walk')); } catch (e) {}
  if (route) { toast(route.intro, 2600); say(route.intro); }
  else toast('用方向鍵或下面的按鈕走路，也可以點地板走過去', 2600);
}
document.querySelectorAll('[data-route]').forEach(b => b.onclick = () => { FXs('powerup'); startRoute(b.dataset.route || null); });
$('menuBtn').onclick = () => { if (current) endMission(false); $('start').classList.remove('hide'); };
// 移動按鈕
[['mvF', 'f'], ['mvL', 'l'], ['mvR', 'r'], ['mvB', 'b']].forEach(([id, k]) => { const e = $(id); const on = ev => { ev.preventDefault(); hold[k] = 1; }, off = () => { hold[k] = 0; };
  e.addEventListener('pointerdown', on); e.addEventListener('pointerup', off); e.addEventListener('pointerleave', off); e.addEventListener('pointercancel', off); });
const hashKey = location.hash.replace('#', '');
if (ROUTES[hashKey]) { /* 直接顯示開始畫面，預選路線 */ document.querySelector(`[data-route="${hashKey}"]`)?.classList.add('pre'); }

// ---------- 迴圈 ----------
function size() { const w = host.clientWidth, h = host.clientHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
addEventListener('resize', size); size();
const clock = new THREE.Clock(); let T = 0; const Q = { t: 0, n: 0, lv: 0 };
function frame() {
  window.__frames = (window.__frames || 0) + 1;
  const raw = clock.getDelta(); const dt = Math.min(.05, raw) * (window.__dtScale || 1); T += dt;
  // 自動降畫質：電腦太慢就降解析度、關柔和陰影
  if (!window.__dtScale) { Q.t += raw; Q.n++; if (Q.t > 3) { const ms = Q.t / Q.n * 1000; if (ms > 45 && Q.lv < 2) { Q.lv++; if (Q.lv === 1) { R.setPixelRatio(1); size(); } else { sun.shadow.mapSize.set(1024, 1024); sun.shadow.map && sun.shadow.map.dispose(); sun.shadow.map = null; R.shadowMap.type = THREE.PCFShadowMap; } } Q.t = 0; Q.n = 0; } }
  updatePlayer(dt, T); updateCam(dt); updateWorld(T, dt);
  // 太陽跟著玩家，讓陰影清楚
  const c = K.g.position; sun.position.copy(c).addScaledVector(SUN_DIR, 80); sun.target.position.copy(c);
  // 路人
  npcs.forEach(P => { P.g.position.x += P.dir * dt * 1.1; if (P.g.position.x > 54) P.dir = -1; if (P.g.position.x < -50) P.dir = 1; P.g.rotation.y = P.dir > 0 ? Math.PI / 2 : -Math.PI / 2; walkPose(P, T * 6 + P.ph); });
  // 落花
  const a = pg.attributes.position; for (let i = 0; i < PN; i++) { let y = a.array[i * 3 + 1] - pv[i] * dt; if (y < 0) { y = 6 + rand() * 4; a.array[i * 3] = c.x + (rand() - .5) * 50; a.array[i * 3 + 2] = (rand() - .5) * 24; } a.array[i * 3 + 1] = y; a.array[i * 3] += Math.sin(T + i) * dt * .3; } a.needsUpdate = true;
  markers.forEach((m, i) => { m.children[0].rotation.z = T; m.children[1].position.y = 2.6 + Math.sin(T * 2 + i) * .15; });
  if (tapMark.visible) { tapMarkT += dt; tapMark.scale.setScalar(.2 + tapMarkT * 2); tapMark.material.opacity = 1 - tapMarkT * 1.5; if (tapMarkT > .66) tapMark.visible = false; }
  if ((frame._c = (frame._c || 0) + 1) % 15 === 0) cullMissions(K.g.position, current);
  if (current && current.update) current.update(dt, T, ctx);
  const padOn = !UI.busy; if (padOn !== frame._pad) { frame._pad = padOn; $('pad').style.display = padOn ? '' : 'none'; }
  R.clear(); R.render(S, cam);
  if (lens.on) renderLens();
  requestAnimationFrame(frame);
}
frame();
window.__town = { camState, ctx, startRoute, goStop, ROUTES, get route() { return route; }, done, endMission };
