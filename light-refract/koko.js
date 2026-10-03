/* 光光偵探：原創角色（星星身體＋偵探帽＋放大鏡）
   用法：const k=Koko.mount(parentEl,{size:180}); k.say('文字','wow'|'happy'|'think'|'point'); */
(function(){
const NS='http://www.w3.org/2000/svg';
function el(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
let uid=0;
function build(svg){
  const id='kk'+(uid++);
  const defs=el('defs',{},svg);
  const g1=el('radialGradient',{id:id+'b',cx:'40%',cy:'35%'},defs);[[0,'#FFFBE0'],[.55,'#FFE14D'],[1,'#FFB21E']].forEach(([o,c])=>el('stop',{offset:o,'stop-color':c},g1));
  const g2=el('linearGradient',{id:id+'e',x1:0,y1:0,x2:0,y2:1},defs);[[0,'#7A5CFF'],[1,'#2CE6FF']].forEach(([o,c])=>el('stop',{offset:o,'stop-color':c},g2));
  const f=el('filter',{id:id+'g',x:'-50%',y:'-50%',width:'200%',height:'200%'},defs);el('feGaussianBlur',{stdDeviation:14},f);
  const root=el('g',{},svg);
  el('circle',{cx:0,cy:0,r:140,fill:'#FFE27A',filter:`url(#${id}g)`,opacity:.55},root);
  const body=el('g',{},root);
  const pts=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i/10*Math.PI*2;const r=i%2?78:112;pts.push(`${Math.cos(a)*r},${Math.sin(a)*r}`);}
  el('polygon',{points:pts.join(' '),fill:`url(#${id}b)`,stroke:'#E58A00','stroke-width':6,'stroke-linejoin':'round'},body);
  // 偵探帽
  const hat=el('g',{transform:'translate(0,-92) rotate(-8)'},body);
  el('path',{d:'M-78 18 Q0 -6 78 18 Q60 30 0 26 Q-60 30 -78 18Z',fill:'#7A4A22',stroke:'#3E2410','stroke-width':4},hat);
  el('path',{d:'M-52 16 Q-50 -40 0 -44 Q50 -40 52 16Z',fill:'#A8743F',stroke:'#3E2410','stroke-width':4},hat);
  el('path',{d:'M-52 6 Q0 -4 52 6',fill:'none',stroke:'#3E2410','stroke-width':9},hat);
  [[-30,-20],[-6,-30],[20,-24],[-18,0],[10,-6],[36,2]].forEach(([x,y])=>el('circle',{cx:x,cy:y,r:3,fill:'#5A3416'},hat));
  // 眼睛
  const eyes=el('g',{},body);
  [-30,30].forEach(x=>{const e=el('g',{},eyes);el('ellipse',{cx:x,cy:-4,rx:17,ry:25,fill:'#2B1B4A'},e);el('ellipse',{cx:x,cy:4,rx:13,ry:15,fill:`url(#${id}e)`},e);
    el('ellipse',{cx:x-6,cy:-13,rx:7,ry:9,fill:'#fff'},e);el('circle',{cx:x+6,cy:8,r:3.5,fill:'#fff'},e);});
  const brow=el('path',{d:'M-46 -36 L-16 -30 M16 -30 L46 -36',stroke:'#7A4A12','stroke-width':5,'stroke-linecap':'round',opacity:0},body);
  el('ellipse',{cx:-56,cy:26,rx:15,ry:8,fill:'#FF8FB0',opacity:.8},body);el('ellipse',{cx:56,cy:26,rx:15,ry:8,fill:'#FF8FB0',opacity:.8},body);
  const mouth=el('path',{d:'M-12 30 Q0 44 12 30',fill:'#B03050',stroke:'#5A1630','stroke-width':4,'stroke-linejoin':'round'},body);
  // 手：左手揮、右手拿放大鏡
  const armL=el('path',{d:'M-80 30 q-30 10 -40 -14',fill:'none',stroke:'#E58A00','stroke-width':12,'stroke-linecap':'round'},body);
  const armR=el('g',{},body);
  el('path',{d:'M80 30 q24 6 36 -10',fill:'none',stroke:'#E58A00','stroke-width':12,'stroke-linecap':'round'},armR);
  el('line',{x1:116,y1:-12,x2:136,y2:-40,stroke:'#5A3416','stroke-width':12,'stroke-linecap':'round'},armR);
  el('circle',{cx:150,cy:-62,r:30,fill:'rgba(200,240,255,.35)',stroke:'#C9A227','stroke-width':9},armR);
  el('path',{d:'M138 -74 q8 -8 18 -6',fill:'none',stroke:'#fff','stroke-width':5,'stroke-linecap':'round'},armR);
  const spk=el('g',{},root);
  [[-140,-90],[150,-110],[130,110],[-150,100]].forEach(([x,y],i)=>el('path',{d:`M${x} ${y-20} L${x+6} ${y-6} L${x+20} ${y} L${x+6} ${y+6} L${x} ${y+20} L${x-6} ${y+6} L${x-20} ${y} L${x-6} ${y-6}Z`,fill:i%2?'#FFFFFF':'#FFE14D'},spk));
  return {root,eyes,mouth,armL,armR,brow,spk};
}
function mount(parent,o){
  o=o||{};const size=o.size||170;
  const wrap=document.createElement('div');wrap.className='koko';
  wrap.innerHTML='<div class="kb"></div>';
  const svg=el('svg',{viewBox:'-200 -200 400 400',width:size,height:size,'aria-label':'光光偵探'});wrap.appendChild(svg);
  parent.appendChild(wrap);
  const P=build(svg);const bub=wrap.querySelector('.kb');
  let mood='happy',t0=performance.now(),jump=0;
  function frame(now){const t=(now-t0)/1000;
    const j=Math.max(0,jump-(now-t0)/1000);const hop=j>0?-Math.sin(j*Math.PI/0.35*0.35)*0:0;
    const bob=Math.sin(t*2.6)*8;const rot=mood==='think'?-8+Math.sin(t*1.3)*3:Math.sin(t*1.8)*5;
    P.root.setAttribute('transform',`translate(0,${bob+hop}) rotate(${rot})`);
    const blink=(t%3.1)<.12?.12:1;P.eyes.setAttribute('transform',`translate(0,${-4*(1-blink)}) scale(1,${blink})`);
    const w=mood==='happy'?Math.sin(t*9)*24:mood==='wow'?-30:0;P.armL.setAttribute('transform',`rotate(${-w} -80 30)`);
    const pr=mood==='point'?-25+Math.sin(t*6)*6:mood==='think'?20:Math.sin(t*2)*6;P.armR.setAttribute('transform',`rotate(${pr} 80 30)`);
    P.mouth.setAttribute('d',mood==='wow'?'M-12 26 Q0 58 12 26 Q0 32 -12 26Z':mood==='think'?'M-10 34 Q4 30 14 36':'M-14 28 Q0 48 14 28');
    P.brow.setAttribute('opacity',mood==='think'?1:0);
    P.spk.setAttribute('opacity',mood==='wow'?1:.45+.4*Math.sin(t*5));P.spk.setAttribute('transform',`rotate(${t*25})`);
    requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
  return {el:wrap,
    say(text,m){mood=m||'happy';bub.textContent=text||'';bub.style.display=text?'block':'none';
      wrap.classList.remove('pop');void wrap.offsetWidth;wrap.classList.add('pop');},
    mood(m){mood=m;}};
}
window.Koko={mount};
})();
