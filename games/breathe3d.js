/* 光之呼吸站・3D 場景（three.js r160，MIT） */
import * as THREE from './lib/three.module.min.js';
import { RoomEnvironment } from './lib/RoomEnvironment.js';

const B3D = { ok:false };
window.B3D = B3D;
try {
  const host = document.getElementById('stagebox');
  const canvas = document.createElement('canvas'); canvas.id = 'gl';
  host.insertBefore(canvas, host.firstChild);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, powerPreference:'high-performance' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(38, 16/9, 0.1, 100); camera.position.set(0, 0, 9);
  function resize(){ const w = host.clientWidth, h = w*9/16; renderer.setSize(w, h, false); canvas.style.width = w+'px'; canvas.style.height = h+'px'; camera.aspect = w/h; camera.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(host); resize();

  /* 天空背景（漸層＋散景光點） */
  function gradTex(top, bot, bokeh){ const c = document.createElement('canvas'); c.width = 64; c.height = 512; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0,0,0,512); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0,0,64,512);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
  function glowTex(col){ const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const gr = g.createRadialGradient(64,64,0,64,64,64); gr.addColorStop(0, col); gr.addColorStop(.35, col.replace(/[\d.]+\)$/, '.35)')); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0,0,128,128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
  const BG = { night: gradTex('#0d2a4d','#040a16'), dusk: gradTex('#3a2a5e','#0b1022'), room: gradTex('#2a1e18','#0a0706'), sky: gradTex('#3f86c9','#0e2f55'), deep: gradTex('#10203a','#02050c') };
  const bokeh = new THREE.Group(); scene.add(bokeh);
  const bokehMat = new THREE.SpriteMaterial({ map: glowTex('rgba(160,210,255,1)'), transparent:true, depthWrite:false, blending: THREE.AdditiveBlending, opacity:.35 });
  for (let i=0;i<40;i++){ const s = new THREE.Sprite(bokehMat); s.position.set((Math.random()*2-1)*9, (Math.random()*2-1)*5, -6 - Math.random()*6); const k = .3 + Math.random()*1.2; s.scale.set(k,k,1); s.userData.v = .002 + Math.random()*.006; bokeh.add(s); }

  const hemi = new THREE.HemisphereLight(0xcfe6ff, 0x1a1020, .6); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3,5,6); scene.add(key);

  const G = {}; function grp(id){ const g = new THREE.Group(); g.visible = false; scene.add(g); G[id] = g; return g; }
  const glowWhite = new THREE.SpriteMaterial({ map: glowTex('rgba(255,245,200,1)'), transparent:true, depthWrite:false, blending: THREE.AdditiveBlending });

  /* 1 肥皂泡泡：彩虹薄膜＋透光 */
  { const g = grp('bubble');
    const mat = new THREE.MeshPhysicalMaterial({ color:0xffffff, metalness:0, roughness:0, transmission:1, thickness:.02, ior:1.08, iridescence:1, iridescenceIOR:1.35, iridescenceThicknessRange:[120, 900], envMapIntensity:2.2, transparent:true, opacity:.95, clearcoat:1 });
    const big = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), mat); g.add(big); g.userData.big = big;
    const smalls = []; for (let i=0;i<16;i++){ const m = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), mat); const r = .08 + Math.random()*.22; m.scale.setScalar(r); m.position.set((Math.random()*2-1)*6, -4 + Math.random()*8, -1 - Math.random()*3); m.userData.v = .006 + Math.random()*.012; m.userData.ph = Math.random()*6; g.add(m); smalls.push(m); }
    g.userData.smalls = smalls; g.userData.bg = BG.night; }

  /* 2 呼吸燈：真的房間＋燈泡照亮 */
  { const g = grp('glow');
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), new THREE.MeshStandardMaterial({ color:0x5a3b25, roughness:.6 })); floor.rotation.x = -Math.PI/2; floor.position.y = -2.2; floor.receiveShadow = true; g.add(floor);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 16), new THREE.MeshStandardMaterial({ color:0xe8dccb, roughness:.95 })); wall.position.set(0, 3, -4); wall.receiveShadow = true; g.add(wall);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,3), new THREE.MeshStandardMaterial({ color:0x222222 })); cord.position.set(0, 3.1, 0); g.add(cord);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(.22,.26,.4, 32), new THREE.MeshStandardMaterial({ color:0x9aa3ad, metalness:.9, roughness:.3 })); cap.position.set(0, 1.45, 0); g.add(cap);
    const bulbMat = new THREE.MeshPhysicalMaterial({ color:0xfff4d6, emissive:0xffd27a, emissiveIntensity:.2, roughness:.05, transmission:.6, thickness:.2 });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(.62, 64, 48), bulbMat); bulb.position.set(0, .75, 0); bulb.scale.set(1, 1.1, 1); g.add(bulb);
    const fil = new THREE.Mesh(new THREE.TorusGeometry(.16, .02, 8, 40, Math.PI), new THREE.MeshBasicMaterial({ color:0xffb347 })); fil.position.set(0, .8, 0); g.add(fil);
    const halo = new THREE.Sprite(glowWhite.clone()); halo.position.copy(bulb.position); g.add(halo);
    const light = new THREE.PointLight(0xffd9a0, 20, 30, 2); light.position.set(0, .75, .2); light.castShadow = true; light.shadow.mapSize.set(1024, 1024); g.add(light);
    const deco = [[-2.6,-1.7,0,0x3f7fbf,'cyl'],[2.5,-1.6,-.5,0xc2553a,'box'],[1.2,-1.85,1.2,0x6fbf5f,'sph']];
    deco.forEach(([x,y,z,c,t]) => { const geo = t==='cyl' ? new THREE.CylinderGeometry(.45,.35,1,32) : t==='box' ? new THREE.BoxGeometry(1.1,1.2,1.1) : new THREE.SphereGeometry(.35, 32, 24);
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color:c, roughness:.5 })); m.position.set(x,y,z); m.castShadow = true; g.add(m); });
    Object.assign(g.userData, { bulbMat, halo, light, bg: BG.room }); }

  /* 3 呼吸球（Hoberman 風格） */
  { const g = grp('ball'); const cols = [0xff5a5a,0xffb13b,0xffe14a,0x5fe08a,0x3ec2ff,0x6b7bff,0xc06bff];
    const rings = new THREE.Group(); g.add(rings);
    for (let i=0;i<9;i++){ const m = new THREE.Mesh(new THREE.TorusGeometry(1, .045, 16, 120), new THREE.MeshStandardMaterial({ color:cols[i%7], metalness:.35, roughness:.25 })); m.rotation.y = i/9*Math.PI; rings.add(m); }
    for (let j=-2;j<=2;j++){ if (!j) continue; const y = j*.38, r = Math.sqrt(1 - y*y); const m = new THREE.Mesh(new THREE.TorusGeometry(r, .04, 16, 120), new THREE.MeshStandardMaterial({ color:cols[(j+7)%7], metalness:.35, roughness:.25 })); m.rotation.x = Math.PI/2; m.position.y = y; rings.add(m); }
    const eq = new THREE.Mesh(new THREE.TorusGeometry(1, .05, 16, 120), new THREE.MeshStandardMaterial({ color:0xffffff, metalness:.5, roughness:.2 })); eq.rotation.x = Math.PI/2; rings.add(eq);
    const joints = new THREE.InstancedMesh(new THREE.SphereGeometry(.07, 16, 12), new THREE.MeshStandardMaterial({ color:0xffffff, metalness:.6, roughness:.2 }), 9*5); let n = 0; const d = new THREE.Object3D();
    for (let i=0;i<9;i++) for (let j=-2;j<=2;j++){ const a = i/9*Math.PI, y = j*.38, r = Math.sqrt(1 - y*y); d.position.set(Math.cos(a)*r*(i%2?1:-1), y, Math.sin(a)*r); d.updateMatrix(); joints.setMatrixAt(n++, d.matrix); }
    rings.add(joints); Object.assign(g.userData, { rings, bg: BG.dusk }); }

  /* 4 方塊呼吸：立體光框＋光球沿邊走 */
  { const g = grp('box'); const S = 2.6;
    const cube = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(S, S, S)), new THREE.LineBasicMaterial({ color:0x7fdcff, transparent:true, opacity:.35 })); g.add(cube);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(S, S), new THREE.MeshPhysicalMaterial({ color:0x1e4a7a, transparent:true, opacity:.35, roughness:.1, metalness:.1, side:THREE.DoubleSide })); face.position.z = S/2; g.add(face);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(.16, 32, 24), new THREE.MeshBasicMaterial({ color:0xfff3a0 })); g.add(orb);
    const orbGlow = new THREE.Sprite(glowWhite.clone()); orbGlow.scale.set(1.4, 1.4, 1); orb.add(orbGlow);
    const trailGeo = new THREE.BufferGeometry(); const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color:0xffd43b })); g.add(trail);
    function label(t){ const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d'); x.font = '900 96px "Microsoft JhengHei","PingFang TC","Noto Sans TC",sans-serif'; x.textAlign = 'center'; x.fillStyle = '#fff'; x.fillText(t, 128, 100);
      const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map:tx, transparent:true })); s.scale.set(.9,.45,1); return s; }
    const L = [['吸',0,S/2+.45],['停',S/2+.55,0],['吐',0,-S/2-.45],['停',-S/2-.55,0]].map(([t,x,y]) => { const s = label(t); s.position.set(x, y, S/2); g.add(s); return s; });
    g.rotation.set(-.18, .35, 0);
    Object.assign(g.userData, { orb, trail, trailGeo, L, S, bg: BG.deep }); }

  /* 5 彩虹：立體彩虹拱＋雲朵＋草地 */
  { const g = grp('rainbow'); const cols = [0xff4d4d,0xff9f40,0xffd43b,0x5fe08a,0x3ec2ff,0x4b6bff,0xb56bff];
    const arcs = cols.map((c,k) => { const m = new THREE.Mesh(new THREE.TorusGeometry(3.4 - k*.2, .1, 16, 160, Math.PI), new THREE.MeshStandardMaterial({ color:c, emissive:c, emissiveIntensity:.5, roughness:.4 })); m.userData.c = c; m.position.y = -1.6; g.add(m); return m; });
    const grass = new THREE.Mesh(new THREE.PlaneGeometry(40, 12), new THREE.MeshStandardMaterial({ color:0x3f8f45, roughness:.9 })); grass.rotation.x = -Math.PI/2; grass.position.y = -1.65; g.add(grass);
    const cloudMat = new THREE.MeshStandardMaterial({ color:0xffffff, roughness:1 });
    [[-3.4,-1.35],[3.4,-1.35]].forEach(([x,y]) => { for (let i=0;i<6;i++){ const s = new THREE.Mesh(new THREE.SphereGeometry(.35 + Math.random()*.3, 24, 16), cloudMat); s.position.set(x + (Math.random()*2-1)*.7, y + Math.random()*.4, (Math.random()*2-1)*.4); g.add(s); } });
    Object.assign(g.userData, { arcs, bg: BG.sky }); }

  /* 6 平靜瓶：玻璃瓶＋閃亮亮片 */
  { const g = grp('jar'); const R = 1.25, Hh = 1.7;
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(R, R, Hh*2, 64, 1, true), new THREE.MeshPhysicalMaterial({ color:0xdff3ff, metalness:0, roughness:.05, transmission:.95, thickness:.1, ior:1.45, transparent:true, opacity:.5, side:THREE.DoubleSide, envMapIntensity:1.8 }));
    g.add(glass);
    const water = new THREE.Mesh(new THREE.CylinderGeometry(R*.97, R*.97, Hh*1.9, 64), new THREE.MeshPhysicalMaterial({ color:0x6fb8ff, transparent:true, opacity:.18, roughness:.1 })); g.add(water);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(R*1.02, R*1.02, .35, 64), new THREE.MeshStandardMaterial({ color:0xb8c2cc, metalness:.9, roughness:.25 })); lid.position.y = Hh + .17; g.add(lid);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(R, R, .06, 64), new THREE.MeshStandardMaterial({ color:0xcfe6ff, roughness:.2 })); base.position.y = -Hh; g.add(base);
    const N = 420; const flake = new THREE.InstancedMesh(new THREE.BoxGeometry(.07, .07, .012), new THREE.MeshStandardMaterial({ color:0xffffff, metalness:1, roughness:.18 }), N);
    const pal = [0xffd43b,0xff8fd8,0x7fdcff,0xb98bff,0xffffff,0x7dffb0].map(c => new THREE.Color(c));
    const P = []; for (let i=0;i<N;i++){ flake.setColorAt(i, pal[i%6]); P.push({ x:0, y:-Hh+.05, z:0, vx:0, vy:0, vz:0, rx:Math.random()*6, ry:Math.random()*6, rest:true }); }
    g.add(flake);
    const back = new THREE.PointLight(0xfff2cc, 25, 12, 2); back.position.set(0, .5, -2.5); g.add(back);
    Object.assign(g.userData, { flake, P, R, Hh, bg: BG.deep }); }

  /* 7 頌缽：金屬缽＋聲波漣漪 */
  { const g = grp('bell');
    const pts = []; for (let i=0;i<=24;i++){ const t = i/24; pts.push(new THREE.Vector2(.25 + Math.sin(t*Math.PI*.5)*1.55, -1 + t*1.3)); }
    const bowl = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), new THREE.MeshStandardMaterial({ color:0xd9a441, metalness:1, roughness:.22, side:THREE.DoubleSide })); bowl.position.y = -.6; g.add(bowl);
    const cushion = new THREE.Mesh(new THREE.TorusGeometry(1.1, .35, 24, 64), new THREE.MeshStandardMaterial({ color:0x8a2130, roughness:.8 })); cushion.rotation.x = Math.PI/2; cushion.position.y = -1.65; g.add(cushion);
    const mallet = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, 2.4, 24), new THREE.MeshStandardMaterial({ color:0x7a4b24, roughness:.6 })); mallet.position.set(2.2, .1, .3); mallet.rotation.z = .7; g.add(mallet);
    const ripples = []; for (let i=0;i<4;i++){ const m = new THREE.Mesh(new THREE.TorusGeometry(1, .02, 8, 120), new THREE.MeshBasicMaterial({ color:0xffd98a, transparent:true, opacity:0 })); m.rotation.x = Math.PI/2; m.position.y = .1; g.add(m); ripples.push(m); }
    g.rotation.x = .35; Object.assign(g.userData, { ripples, bg: BG.dusk }); }

  /* 8 五指呼吸：立體的手＋光點沿手指走 */
  { const g = grp('finger'); const skin = new THREE.MeshStandardMaterial({ color:0xf0c29a, roughness:.55 });
    const palm = new THREE.Mesh(new THREE.CapsuleGeometry(1.05, .6, 12, 24), skin); palm.scale.set(1, 1, .45); palm.position.y = -1.2; g.add(palm);
    const F = [[-1.25,-.55,.35,.95,-.55],[-.6,.35,.26,1.35,-.1],[0,.5,.27,1.5,0],[.6,.35,.26,1.35,.08],[1.12,-.05,.24,1.05,.25]];
    const tips = []; F.forEach(([x,y,r,l,rot]) => { const f = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 10, 20), skin); f.position.set(x, y, 0); f.rotation.z = rot; f.scale.z = .8; g.add(f);
      const up = new THREE.Vector3(-Math.sin(rot), Math.cos(rot), 0); tips.push({ base: new THREE.Vector3(x, y, .35).addScaledVector(up, -l/2 - r*.3), top: new THREE.Vector3(x, y, .35).addScaledVector(up, l/2 + r*.6) }); });
    const orb = new THREE.Mesh(new THREE.SphereGeometry(.13, 24, 16), new THREE.MeshBasicMaterial({ color:0xfff3a0 })); const og = new THREE.Sprite(glowWhite.clone()); og.scale.set(1.2, 1.2, 1); orb.add(og); g.add(orb);
    const done = tips.map(t => { const s = new THREE.Mesh(new THREE.SphereGeometry(.12, 16, 12), new THREE.MeshBasicMaterial({ color:0x5fe08a })); s.position.copy(t.top).add(new THREE.Vector3(0, .35, 0)); s.visible = false; g.add(s); return s; });
    g.position.y = .3; Object.assign(g.userData, { tips, orb, done, bg: BG.night }); }

  /* 9 蝴蝶擁抱：立體蝴蝶左右拍翅 */
  { const g = grp('butterfly');
    function wingTex(c1, c2){ const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const gr = x.createRadialGradient(40,128,10,90,128,200); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
      x.fillStyle = gr; x.beginPath(); x.moveTo(10,128); x.bezierCurveTo(60,-10,250,0,240,90); x.bezierCurveTo(230,130,150,128,150,128); x.bezierCurveTo(230,140,220,250,130,245); x.bezierCurveTo(60,240,20,170,10,128); x.fill();
      x.fillStyle = 'rgba(255,255,255,.85)'; [[190,70,14],[170,190,11],[120,60,8]].forEach(([a,b,r]) => { x.beginPath(); x.arc(a,b,r,0,7); x.fill(); }); x.strokeStyle = 'rgba(20,20,40,.8)'; x.lineWidth = 6; x.stroke();
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
    const wtex = wingTex('#ffc629','#ff3d00'); const wl = new THREE.MeshStandardMaterial({ map: wtex, emissiveMap: wtex, emissive:0xffffff, emissiveIntensity:.45, envMapIntensity:.15, transparent:true, alphaTest:.05, side:THREE.DoubleSide, roughness:.8 });
    const wr = wl.clone();
    const pivotL = new THREE.Group(), pivotR = new THREE.Group(); g.add(pivotL, pivotR);
    const L = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), wl); L.position.x = -1.1; L.scale.x = -1; pivotL.add(L);
    const Rw = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), wr); Rw.position.x = 1.1; pivotR.add(Rw);
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(.12, 1.4, 8, 16), new THREE.MeshStandardMaterial({ color:0x2a2233, roughness:.6 })); g.add(body);
    g.rotation.x = -.35; Object.assign(g.userData, { pivotL, pivotR, wl, wr, bg: BG.dusk }); }

  /* ---------- 傾斜／滑鼠視差（4D 感） ---------- */
  let tx = 0, ty = 0, cx = 0, cy = 0;
  addEventListener('deviceorientation', e => { if (e.gamma == null) return; tx = Math.max(-1, Math.min(1, e.gamma/30)); ty = Math.max(-1, Math.min(1, (e.beta - 45)/30)); });
  host.addEventListener('pointermove', e => { const r = host.getBoundingClientRect(); tx = ((e.clientX - r.left)/r.width)*2 - 1; ty = ((e.clientY - r.top)/r.height)*2 - 1; });

  let mode = null;
  B3D.setMode = id => { mode = id; for (const k in G) G[k].visible = (k === id); if (G[id]) scene.background = G[id].userData.bg; bokeh.visible = !['glow','rainbow'].includes(id);
    camera.position.set(0, id === 'glow' ? .6 : 0, id === 'glow' ? 8.5 : 9); };
  B3D.has = id => !!G[id];
  const ease = x => .5 - .5*Math.cos(Math.PI*x);
  B3D.jarShake = () => { const u = G.jar.userData; u.P.forEach(p => { p.x = (Math.random()*2-1)*u.R*.8; p.z = (Math.random()*2-1)*u.R*.8; p.y = -u.Hh + Math.random()*u.Hh*1.9; p.vx = (Math.random()*2-1)*.05; p.vy = (Math.random()*2-1)*.05; p.vz = (Math.random()*2-1)*.05; p.rest = false; }); };
  B3D.jarLeft = () => G.jar.userData.P.filter(p => !p.rest).length;
  const dummy = new THREE.Object3D();
  B3D.frame = (L, now, st, running) => {
    const t = now/1000; cx += (tx - cx)*.05; cy += (ty - cy)*.05;
    const base = camera.position.clone(); camera.position.x = cx*1.3; camera.position.y = (mode === 'glow' ? .6 : 0) - cy*.8; camera.lookAt(0, mode === 'glow' ? 0 : 0, 0);
    bokeh.children.forEach(s => { s.position.y += s.userData.v; if (s.position.y > 5) s.position.y = -5; });
    const g = G[mode]; if (!g) { renderer.render(scene, camera); return; } const u = g.userData;
    if (mode === 'bubble'){ const s = .9 + L*1.25; u.big.scale.setScalar(s); u.big.rotation.y = t*.2; u.big.position.y = Math.sin(t*.8)*.08;
      u.smalls.forEach(m => { m.position.y += m.userData.v; m.position.x += Math.sin(t + m.userData.ph)*.004; if (m.position.y > 4.5) m.position.y = -4.5; }); }
    if (mode === 'glow'){ const k = running ? L : .15 + .05*Math.sin(t*2); u.light.intensity = 3 + k*110; u.bulbMat.emissiveIntensity = .2 + k*3.2; u.halo.scale.setScalar(1 + k*5); u.halo.material.opacity = .2 + k*.8; renderer.toneMappingExposure = .75 + k*.5; }
    else renderer.toneMappingExposure = 1.05;
    if (mode === 'ball'){ const s = .75 + L*1.05; u.rings.scale.setScalar(s); u.rings.rotation.y = t*.35; u.rings.rotation.x = Math.sin(t*.3)*.25; }
    if (mode === 'box'){ const S = u.S, h = S/2; const pts = [[-h,-h],[h,-h],[h,h],[-h,h],[-h,-h]]; // 從左下開始：吸＝往上? 依標籤：上邊吸、右邊停、下邊吐、左邊停
      const path = [[-h,h],[h,h],[h,-h],[-h,-h],[-h,h]]; const k = running ? st.k : 0, p = running ? st.p : 0; const a = path[k], b = path[k+1];
      const x = a[0] + (b[0]-a[0])*p, y = a[1] + (b[1]-a[1])*p; u.orb.position.set(x, y, h + .02);
      const arr = [path[0][0], path[0][1], h]; for (let i=1;i<=k;i++) arr.push(path[i][0], path[i][1], h); arr.push(x, y, h); u.trailGeo.setAttribute('position', new THREE.Float32BufferAttribute(running ? arr : [], 3));
      u.L.forEach((s,i) => { s.material.opacity = running && i === k ? 1 : .45; s.scale.setScalar(running && i === k ? 1.2 : .9); s.scale.y = s.scale.x/2; }); g.rotation.y = .35 + cx*.15; }
    if (mode === 'rainbow'){ const r = Math.min(2, st.round || 0); const sweep = running ? Math.max(.02, L) : .02;
      const q = Math.round(sweep*60)/60; const regen = q !== u.lastSweep; u.lastSweep = q;
      u.arcs.forEach((m,k) => { const on = k <= r*2 + 2; m.material.emissiveIntensity = on ? .6 : .02; m.material.color.setHex(on ? m.userData.c : 0x2a3a4a);
        if (regen){ m.geometry.dispose(); m.geometry = new THREE.TorusGeometry(3.4 - k*.2, .1, 12, 120, Math.PI*Math.max(.02, q)); } m.rotation.y = Math.PI; }); }
    if (mode === 'jar'){ const R = u.R*.9, H = u.Hh; u.P.forEach((p,i) => { if (running && !p.rest){ p.vx *= .985; p.vz *= .985; p.vy = p.vy*.985 - .0009; p.x += p.vx; p.y += p.vy; p.z += p.vz; p.rx += p.vx*6; p.ry += .03;
          const d = Math.hypot(p.x, p.z); if (d > R){ p.x *= R/d; p.z *= R/d; p.vx *= -.5; p.vz *= -.5; } if (p.y > H - .1) p.vy = -Math.abs(p.vy); if (p.y <= -H + .04 + (i%7)*.012){ p.y = -H + .04 + (i%7)*.012; p.rest = true; } }
        dummy.position.set(p.x, p.y, p.z); dummy.rotation.set(p.rx, p.ry, 0); dummy.updateMatrix(); u.flake.setMatrixAt(i, dummy.matrix); });
      u.flake.instanceMatrix.needsUpdate = true; g.rotation.y = Math.sin(t*.2)*.15; }
    if (mode === 'bell'){ const e = running && st.bellT ? (now - st.bellT)/1000 : 99; const a = Math.max(0, 1 - e/14);
      u.ripples.forEach((m,i) => { const ph = ((e*.5 + i*.25) % 1); m.scale.setScalar(1.8 + ph*3.2); m.material.opacity = running ? a*(1 - ph)*.9 : 0; }); }
    if (mode === 'finger'){ const i = Math.min(4, st.round || 0), tip = u.tips[i]; let q = 0; if (running){ q = st.phase === 'in' ? ease(st.p) : 1 - ease(st.p); }
      u.orb.position.lerpVectors(tip.base, tip.top, q); u.done.forEach((s,k) => s.visible = running && k < i); g.rotation.y = cx*.3; }
    if (mode === 'butterfly'){ const side = st.side || 0, iv = 900*(st.speed || 1), since = running ? ((now - (st.t0 || now)) % iv)/iv : 1; const flap = running ? Math.max(0, 1 - since*3) : .3 + .2*Math.sin(t*3);
      u.pivotL.rotation.y = (running && side === 0 ? flap : .15)*1.1; u.pivotR.rotation.y = -(running && side === 1 ? flap : .15)*1.1;
      u.wl.emissiveIntensity = running && side === 0 && flap > .2 ? 1.1 : .45; u.wr.emissiveIntensity = running && side === 1 && flap > .2 ? 1.1 : .45; g.position.y = Math.sin(t*1.5)*.2; }
    renderer.render(scene, camera);
  };
  B3D.ok = true;
  document.dispatchEvent(new Event('b3d-ready'));
} catch (e) { console.warn('3D 無法啟動，改用平面版', e); B3D.ok = false; document.dispatchEvent(new Event('b3d-ready')); }
