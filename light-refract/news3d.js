/* 光線新聞台 3D 微縮場景：公園河邊（石階→淺灘→突然變深）＋阿姨＋路人
   window.NEWS3D.set('title'|'walk'|'dip'|'slip'|'float'|'floatTop'|'rescue'|'why') */
import * as THREE from './vendor/three.module.min.js';

const host=document.getElementById('scene3d');
const R=new THREE.WebGLRenderer({antialias:true,alpha:false});
R.setPixelRatio(Math.min(devicePixelRatio,1.6));R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
host.appendChild(R.domElement);
const S=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(38,16/9,.1,200);
// 天空漸層
{const c=document.createElement('canvas');c.width=2;c.height=256;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,256);
 g.addColorStop(0,'#5FA8E8');g.addColorStop(.55,'#BFE3FF');g.addColorStop(1,'#FFE9C7');x.fillStyle=g;x.fillRect(0,0,2,256);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;S.background=t;}
S.fog=new THREE.Fog('#CFE8FF',26,60);
S.add(new THREE.HemisphereLight('#EAF6FF','#6B5A3A',1.1));
const sun=new THREE.DirectionalLight('#FFF1D6',2.4);sun.position.set(-6,12,8);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-12,right:12,top:10,bottom:-8,near:1,far:40});sun.shadow.bias=-.0008;S.add(sun);

const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:0},o||{}));
function box(w,h,d,mat,x,y,z,p){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;(p||S).add(m);return m;}
const WS=0.12; // 水面高度
// ---- 地形（前方 z=2 切開，看得到剖面）----
const grass=M('#6FBF4A'),soil=M('#8B6A43'),stone=M('#B9B3A6',{roughness:.7}),sand=M('#C9A86A'),deep=M('#5C4A33');
box(8,3,6,soil,-5,-1.15,-1);box(8,.12,6,grass,-5,.41,-1);            // 左岸
box(.6,2.65,6,stone,-.7,-1.12,-1);                                      // 石階 1（頂 0.2）
box(.6,2.45,6,stone,-.1,-1.22,-1);                                      // 石階 2（頂 0.0）
box(1.4,2.3,6,sand,.9,-1.3,-1);                                         // 淺灘（頂 -0.15）
box(6.2,.3,6,deep,4.7,-2.6,-1);                                         // 深水底 -2.45
box(4,3,6,soil,9.8,-1.15,-1);box(4,.12,6,grass,9.8,.41,-1);           // 對岸
// 遠山
[[-14,-16,6,'#7FAF7A'],[2,-20,9,'#8DB98A'],[16,-17,7,'#76A673']].forEach(([x,z,r,c])=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),M(c));m.position.set(x,-1.5,z);m.scale.y=.55;S.add(m);});
// 樹、長椅、路燈
function tree(x,z,s){const g=new THREE.Group();const t=new THREE.Mesh(new THREE.CylinderGeometry(.1*s,.14*s,1.2*s,8),M('#7A5634'));t.position.y=.6*s;g.add(t);
  [[0,1.5,0,.7],[.35,1.25,.1,.5],[-.3,1.3,-.1,.55]].forEach(([a,b,c,r])=>{const l=new THREE.Mesh(new THREE.IcosahedronGeometry(r*s,1),M('#3F9A45',{flatShading:true}));l.position.set(a*s,b*s,c*s);l.castShadow=true;g.add(l);});
  t.castShadow=true;g.position.set(x,.47,z);S.add(g);}
tree(-6.5,-2.5,1.3);tree(-3.6,-3.2,1);tree(-7.6,.6,1.1);tree(10,-2.6,1.2);tree(8.6,-3.6,.9);
{const g=new THREE.Group();box(1.3,.08,.4,M('#B5763A'),0,.45,0,g);box(1.3,.35,.06,M('#B5763A'),0,.68,-.18,g);[-.55,.55].forEach(x=>box(.06,.45,.4,M('#333'),x,.22,0,g));g.position.set(-4.2,.47,-1.2);S.add(g);}
{const g=new THREE.Group();box(.07,2,.07,M('#2F3A44'),0,1,0,g);const lamp=new THREE.Mesh(new THREE.SphereGeometry(.16,16,12),M('#FFF6D8',{emissive:'#FFE9A8',emissiveIntensity:.6}));lamp.position.y=2.05;g.add(lamp);g.position.set(-2.4,.47,-2.4);S.add(g);}
// 警告牌（劇情後段才出現）
const sign=new THREE.Group();{box(.06,1.1,.06,M('#555'),0,.55,0,sign);const c=document.createElement('canvas');c.width=256;c.height=160;const x=c.getContext('2d');x.fillStyle='#FFD200';x.fillRect(0,0,256,160);x.strokeStyle='#111';x.lineWidth=10;x.strokeRect(5,5,246,150);x.fillStyle='#111';x.font='900 52px "Noto Sans TC",sans-serif';x.textAlign='center';x.fillText('⚠ 水深',128,70);x.fillText('危險',128,130);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const pl=new THREE.Mesh(new THREE.PlaneGeometry(.8,.5),new THREE.MeshStandardMaterial({map:t}));pl.position.set(0,1.2,.04);sign.add(pl);sign.position.set(-1.6,.47,-1.6);sign.rotation.y=.4;S.add(sign);}
// ---- 水 ----
const water=new THREE.Mesh(new THREE.BoxGeometry(8.2,2.6,6),new THREE.MeshPhysicalMaterial({color:'#3E9AD6',transparent:true,opacity:.42,roughness:.05,metalness:0,depthWrite:false,side:THREE.DoubleSide}));
water.position.set(3.7,WS-1.3,-1);S.add(water);
const surfG=new THREE.PlaneGeometry(8.2,6,64,40);surfG.rotateX(-Math.PI/2);
const surf=new THREE.Mesh(surfG,new THREE.MeshPhysicalMaterial({color:'#7CC7F2',transparent:true,opacity:.55,roughness:.08,metalness:.1,clearcoat:1,depthWrite:false}));
surf.position.set(3.7,WS,-1);S.add(surf);const sp=surfG.attributes.position;const base=sp.array.slice();
// 漣漪
const ripples=[];function ripple(x,z){const m=new THREE.Mesh(new THREE.RingGeometry(.1,.16,40),new THREE.MeshBasicMaterial({color:'#fff',transparent:true,opacity:.8,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x,WS+.02,z);S.add(m);ripples.push({m,t:0});}
// 泡泡
const bubbles=[];function bubble(x,y,z){const m=new THREE.Mesh(new THREE.SphereGeometry(.05+Math.random()*.04,10,8),new THREE.MeshPhysicalMaterial({color:'#fff',transparent:true,opacity:.6,roughness:0}));m.position.set(x,y,z);S.add(m);bubbles.push({m,v:.6+Math.random()*.5});}
// ---- 人物 ----
function person(shirt,pants,hairC,bun){
  const g=new THREE.Group();const skin=M('#F2C9A0',{roughness:.6});const P={g};
  const cap=(r,l,mat)=>{const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,l,6,12),mat);m.castShadow=true;return m;};
  P.legL=new THREE.Group();P.legR=new THREE.Group();[P.legL,P.legR].forEach((L,i)=>{const m=cap(.075,.32,M(pants));m.position.y=-.2;L.add(m);L.position.set(i?.09:-.09,.46,0);g.add(L);});
  const body=cap(.17,.28,M(shirt));body.position.y=.72;g.add(body);P.body=body;
  P.armL=new THREE.Group();P.armR=new THREE.Group();[P.armL,P.armR].forEach((A,i)=>{const m=cap(.055,.3,M(shirt));m.position.y=-.18;A.add(m);const h=new THREE.Mesh(new THREE.SphereGeometry(.06,10,8),skin);h.position.y=-.38;A.add(h);A.position.set(i?.24:-.24,.92,0);g.add(A);});
  const head=new THREE.Group();head.position.y=1.12;g.add(head);P.head=head;
  const hd=new THREE.Mesh(new THREE.SphereGeometry(.16,24,18),skin);hd.castShadow=true;head.add(hd);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.17,24,18,0,Math.PI*2,0,Math.PI*.55),M(hairC));hair.rotation.x=-.35;hair.position.z=-.02;head.add(hair);
  if(bun){const b=new THREE.Mesh(new THREE.SphereGeometry(.08,14,10),M(hairC));b.position.set(0,.12,-.13);head.add(b);}
  [-.055,.055].forEach(x=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.022,8,6),M('#222'));e.position.set(x,.02,.148);head.add(e);});
  const mo=new THREE.Mesh(new THREE.TorusGeometry(.04,.012,6,12,Math.PI),M('#B03050'));mo.position.set(0,-.05,.15);mo.rotation.z=Math.PI;head.add(mo);
  [-.1,.1].forEach(x=>{const c=new THREE.Mesh(new THREE.SphereGeometry(.03,8,6),M('#FF9FB5'));c.position.set(x,-.03,.13);c.scale.z=.4;head.add(c);});
  S.add(g);return P;}
const auntie=person('#FF6FA8','#3B5BA5','#3A2A22',true);
const passer=person('#2FB36E','#333','#1E1E1E',false);
[auntie,passer].forEach(P=>P.g.scale.setScalar(1.3));
const phone=box(.06,.12,.02,M('#111'),0,0,0);phone.castShadow=false;
const ring=new THREE.Mesh(new THREE.TorusGeometry(.3,.09,14,32),M('#F23B3B',{roughness:.5}));ring.castShadow=true;S.add(ring);
[0,1,2,3].forEach(k=>{const w=new THREE.Mesh(new THREE.TorusGeometry(.3,.095,14,6,Math.PI/8),M('#fff'));w.rotation.z=k*Math.PI/2;ring.add(w);});
// ---- 「為什麼」用：光線與假的池底 ----
const whyG=new THREE.Group();S.add(whyG);
function tube(a,b,color,r){const v=new THREE.Vector3().subVectors(b,a);const m=new THREE.Mesh(new THREE.CylinderGeometry(r||.05,r||.05,v.length(),12),new THREE.MeshBasicMaterial({color}));
  m.position.copy(a).addScaledVector(v,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());whyG.add(m);return m;}
function label(text,color,x,y,z,s){const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');g.font='900 72px "Noto Sans TC",sans-serif';g.textAlign='center';g.textBaseline='middle';
  g.lineWidth=14;g.strokeStyle='#000';g.strokeText(text,256,64);g.fillStyle=color;g.fillText(text,256,64);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false}));sp.scale.set(2.4*(s||1),.6*(s||1),1);sp.position.set(x,y,z);sp.renderOrder=9;whyG.add(sp);return sp;}
{const stoneB=new THREE.Mesh(new THREE.DodecahedronGeometry(.22,0),M('#E8D27A',{roughness:.4,metalness:.3}));stoneB.position.set(3.4,-2.3,1);whyG.add(stoneB);
 const ghost=new THREE.Mesh(new THREE.DodecahedronGeometry(.22,0),new THREE.MeshBasicMaterial({color:'#FF5E8A',transparent:true,opacity:.45,wireframe:true}));ghost.position.set(2.85,-1.3,1);whyG.add(ghost);
 const hit=new THREE.Vector3(1.9,WS,1),eye=new THREE.Vector3(-1.2,1.6,1);
 tube(new THREE.Vector3(3.4,-2.3,1),hit,'#FFE14D',.045);tube(hit,eye,'#FFE14D',.045);
 const ext=tube(hit,new THREE.Vector3(2.85,-1.3,1),'#FF5E8A',.03);ext.material.transparent=true;ext.material.opacity=.7;
 const fake=new THREE.Mesh(new THREE.BoxGeometry(6,.04,.02),new THREE.MeshBasicMaterial({color:'#FF5E8A'}));fake.position.set(4.6,-1.35,2.02);whyG.add(fake);
 const real=new THREE.Mesh(new THREE.BoxGeometry(6,.06,.02),new THREE.MeshBasicMaterial({color:'#FFE14D'}));real.position.set(4.6,-2.43,2.03);whyG.add(real);
 const eyeS=new THREE.Mesh(new THREE.SphereGeometry(.16,20,14),M('#fff'));eyeS.position.copy(eye);whyG.add(eyeS);const pu=new THREE.Mesh(new THREE.SphereGeometry(.08,14,10),M('#222'));pu.position.copy(eye).add(new THREE.Vector3(.1,-.06,.05));whyG.add(pu);
 label('👁 眼睛',  '#FFFFFF',-1.3,2.15,1,.8);label('看起來的底','#FF8FB0',5.8,-1.05,2.1,.9);label('真的底','#FFE14D',5.8,-2.15,2.1,.9);label('在水面折一下','#FFE14D',.9,.75,1,.8);}
whyG.visible=false;
// ---- 狀態 ----
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const CAM={title:[V(-7,4.2,9),V(-1,1.2,-1)],walk:[V(-5.6,2.1,5.4),V(-2.3,1.15,.2)],dip:[V(-3.5,1.5,4.4),V(-.5,.95,.3)],slip:[V(1,-.1,8.4),V(1,-.25,0)],
  float:[V(5,3,5),V(2.6,.9,.2)],floatTop:[V(2.6,5,3.4),V(2.6,.5,-.7)],rescue:[V(-4,2.6,7),V(.4,1,0)],why:[V(1.6,.1,10.5),V(1.6,.25,0)]};
let st='title',stT=0;const camPos=CAM.title[0].clone(),camLook=CAM.title[1].clone();
function set(n){if(!CAM[n])return;st=n;stT=0;whyG.visible=n==='why';sign.visible=['rescue','why','float','floatTop'].includes(n);}
window.NEWS3D={set};
function pose(P,o){P.g.position.set(o.x,o.y,o.z);P.g.rotation.set(o.rx||0,o.ry||0,o.rz||0);
  P.legL.rotation.set(o.ll||0,0,o.lz||0);P.legR.rotation.set(o.lr||0,0,-(o.lz||0));P.armL.rotation.set(o.al||0,0,-(o.az||0));P.armR.rotation.set(o.ar||0,0,o.az||0);}
const clock=new THREE.Clock();let bubT=0,ripT=0;
function frame(){
  const dt=window.__news3dDT||Math.min(clock.getDelta(),.05);const t=clock.elapsedTime;stT+=dt;
  // 水波
  for(let i=0;i<sp.count;i++){const x=base[i*3],z=base[i*3+2];sp.array[i*3+1]=Math.sin(x*2.2+t*1.6)*.025+Math.cos(z*2.6+t*1.3)*.02;}sp.needsUpdate=true;surfG.computeVertexNormals();
  const A=auntie;let ph=passer;ph.g.visible=false;ring.visible=false;phone.visible=false;
  if(st==='title'){const k=(t*.25)%1;pose(A,{x:-3.5+Math.sin(t*.5)*.6,y:.47,z:.6,ry:Math.PI/2,al:Math.sin(t*6)*.5,ar:-Math.sin(t*6)*.5,ll:Math.sin(t*6)*.5,lr:-Math.sin(t*6)*.5});A.armR.rotation.z=1.2+Math.sin(t*8)*.4;}
  else if(st==='walk'){const x=Math.min(-1.0,-5.5+stT*1.1);const w=x<-1.01?Math.sin(t*7):0;pose(A,{x,y:.47,z:.6,ry:Math.PI/2,ll:w*.5,lr:-w*.5,al:-w*.45,ar:w*.45});}
  else if(st==='dip'){pose(A,{x:-.95,y:.2,z:.6,ry:Math.PI/2,ll:-1.35+Math.sin(t*3)*.18,lr:-1.35-Math.sin(t*3)*.18,al:-.3,ar:-.3});A.g.position.y=.22;A.g.position.x=-.62;
    ripT+=dt;if(ripT>.9){ripT=0;ripple(-.15+Math.random()*.1,.6);}}
  else if(st==='slip'){const k=Math.min(1,stT/2.2);const x=-.4+k*2.4,y=k<.35?.0-k*.4:Math.max(-1.6,-.14-(k-.35)*2.3);
    pose(A,{x,y,z:.6,ry:Math.PI/2,rz:k>.3?-.35:0,al:-2.6+Math.sin(t*10)*.6,ar:-2.6-Math.sin(t*10)*.6,ll:Math.sin(t*9)*.6,lr:-Math.sin(t*9)*.6});
    bubT+=dt;if(k>.4&&bubT>.12){bubT=0;bubble(x+(Math.random()-.5)*.3,y+1,.6);}if(k>.35&&k<.45){ripT+=dt;if(ripT>.1){ripT=0;ripple(x,.6);}}}
  else if(st==='float'||st==='floatTop'){const b=Math.sin(t*1.6)*.03;pose(A,{x:2.6,y:WS+.02+b,z:-.2,rx:-Math.PI/2,az:1.25+Math.sin(t*1.2)*.08,lz:.35});A.armL.rotation.x=A.armR.rotation.x=0;
    ripT+=dt;if(ripT>1.4){ripT=0;ripple(2.6,.4);}}
  else if(st==='rescue'){pose(A,{x:2.4,y:WS+.02+Math.sin(t*1.6)*.03,z:-.2,rx:-Math.PI/2,az:1.25,lz:.35});
    ph.g.visible=true;pose(ph,{x:-1.6,y:.47,z:.9,ry:.9,ar:-2.2,al:Math.min(0,-3+stT*1.2)});phone.visible=true;ph.armR.add(phone);phone.position.set(0,-.42,.06);
    ring.visible=true;const k=Math.min(1,Math.max(0,(stT-1)/1.4));const p0=V(-1.4,1.4,.9),p1=V(2.4,WS+.05,.2);ring.position.lerpVectors(p0,p1,k);ring.position.y+=Math.sin(k*Math.PI)*1.6;ring.rotation.set(Math.PI/2+k*6,k*3,0);if(k>=1){ring.rotation.set(Math.PI/2,0,0);ring.position.y=WS+.05+Math.sin(t*1.6)*.03;}}
  else if(st==='why'){pose(A,{x:-2.6,y:.47,z:1,ry:Math.PI/2});}
  // 漣漪與泡泡
  for(let i=ripples.length-1;i>=0;i--){const r=ripples[i];r.t+=dt;const s=1+r.t*4;r.m.scale.set(s,s,s);r.m.material.opacity=Math.max(0,.8-r.t*.55);if(r.t>1.5){S.remove(r.m);ripples.splice(i,1);}}
  for(let i=bubbles.length-1;i>=0;i--){const b=bubbles[i];b.m.position.y+=b.v*dt;b.m.position.x+=Math.sin(t*5+i)*.003;if(b.m.position.y>WS){S.remove(b.m);bubbles.splice(i,1);}}
  // 鏡頭：平滑移動＋微微繞（4D 感）
  const [cp,cl]=CAM[st];const orb=st==='float'?V(Math.sin(t*.25)*2.2,0,Math.cos(t*.25)*2.2-2.2):st==='title'?V(Math.sin(t*.12)*3,0,0):V(Math.sin(t*.3)*.25,Math.sin(t*.4)*.12,0);
  camPos.lerp(cp.clone().add(orb),1-Math.pow(.02,dt));camLook.lerp(cl,1-Math.pow(.02,dt));cam.position.copy(camPos);cam.lookAt(camLook);
  R.render(S,cam);requestAnimationFrame(frame);}
function size(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
new ResizeObserver(size).observe(host);size();set(window.__news3dWant||'title');requestAnimationFrame(frame);
