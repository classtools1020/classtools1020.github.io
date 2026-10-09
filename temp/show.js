/* 溫度特勤隊 網頁簡報引擎：點畫面／→／簡報筆 下一步；data-f＝第幾步出現、data-a＝怎麼出現、data-s＝音效
   data-at＋data-cls：到第幾步加 class；data-ok：揭曉時標出正確選項；data-href：點了開網頁 */
(function(){
  if(/[?&]cap=1/.test(location.search))document.documentElement.classList.add('cap');
  const stage=document.getElementById('stage'), slides=[...document.querySelectorAll('.slide')];
  let cur=0, step=0;
  function fit(){if(document.documentElement.classList.contains('cap'))return;const r=innerHeight<520?56:72;const s=Math.min(innerWidth/1600,(innerHeight-r)/900);stage.style.transform=`scale(${s})`;stage.parentElement.style.paddingBottom=r+'px';}
  addEventListener('resize',fit);fit();
  let AC,muted=false,unl=false;
  function ac(){if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();}if(AC.state!=='running')AC.resume();return AC;}
  function unlock(){try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){}try{ac();}catch(e){}if(unl)return;unl=true;}
  addEventListener('pointerdown',unlock,true);addEventListener('keydown',unlock,true);
  function tone(f,d,type='sine',vol=.12,t0=0,f2){if(muted)return;try{const a=ac(),o=a.createOscillator(),g=a.createGain(),s=a.currentTime+t0;o.type=type;o.frequency.setValueAtTime(f,s);if(f2)o.frequency.exponentialRampToValueAtTime(f2,s+d);g.gain.setValueAtTime(.0001,s);g.gain.exponentialRampToValueAtTime(vol,s+.015);g.gain.exponentialRampToValueAtTime(.0001,s+d);o.connect(g).connect(a.destination);o.start(s);o.stop(s+d+.05);}catch(e){}}
  let NB;function noise(d,vol,f1,f2){if(muted)return;try{const a=ac();if(!NB){NB=a.createBuffer(1,a.sampleRate,a.sampleRate);const c=NB.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=Math.random()*2-1;}const s=a.createBufferSource(),bp=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime;s.buffer=NB;bp.type='bandpass';bp.Q.value=1.2;bp.frequency.setValueAtTime(f1,t);bp.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(bp).connect(g).connect(a.destination);s.start();s.stop(t+d+.05);}catch(e){}}
  const SFX={page(){noise(.35,.12,600,2400);},whoosh(){noise(.6,.14,300,2200);tone(330,.6,'sine',.04,0,660);},pop(){tone(520,.12,'sine',.12,0,900);},
    ding(){tone(1046,.4,'triangle',.1);tone(1568,.5,'sine',.06,.08);},ok(){[523,659,784,1046].forEach((f,i)=>tone(f,.32,'triangle',.11,i*.08));},
    warn(){tone(440,.18,'square',.05);tone(440,.18,'square',.05,.25);},fan(){[523,659,784,659,784,1046].forEach((f,i)=>tone(f,.38,'triangle',.12,i*.14));},
    beep(){tone(2200,.1,'square',.05);tone(2200,.1,'square',.05,.18);},tick(){tone(1200,.05,'square',.05);},
    stamp(){noise(.12,.25,200,400);tone(90,.2,'sine',.3);}};
  const maxStep=s=>Math.max(0,...[...s.querySelectorAll('[data-f],[data-at]')].map(e=>+(e.dataset.f??e.dataset.at)));
  function apply(k){const s=slides[cur];s.querySelectorAll('[data-f]').forEach(e=>e.classList.toggle('show',+e.dataset.f<=k));
    s.querySelectorAll('[data-at]').forEach(e=>e.classList.toggle(e.dataset.cls||'show',+e.dataset.at<=k));
    s.querySelectorAll('.op').forEach(o=>o.classList.remove('ok','no'));
    s.querySelectorAll('[data-ok]').forEach(e=>{if(+(e.dataset.f??e.dataset.at)<=k){const ok=document.getElementById(e.dataset.ok);s.querySelectorAll('.op').forEach(o=>o.classList.add(o===ok?'ok':'no'));}});}
  function sound(k){const e=[...slides[cur].querySelectorAll('[data-f="'+k+'"][data-s],[data-at="'+k+'"][data-s]')][0];if(e&&SFX[e.dataset.s])SFX[e.dataset.s]();}
  function go(i,full){if(i<0||i>=slides.length)return;const old=slides[cur];if(old!==slides[i]){old.classList.remove('on');old.classList.add('out');setTimeout(()=>old.classList.remove('out'),650);}
    cur=i;const s=slides[cur];s.classList.add('on');step=full?maxStep(s):0;apply(step);ui();SFX.page();if(step===0)setTimeout(()=>sound(0),150);
    try{history.replaceState(null,'','#'+(cur+1));}catch(e){}}
  function setStep(k){step=k;apply(k);}
  function next(){const s=slides[cur];if(step<maxStep(s)){step++;apply(step);sound(step);ui();}else go(cur+1);}
  function prev(){go(cur-1,true);}
  function ui(){const pg=document.getElementById('pg');if(!pg)return;pg.textContent=(cur+1)+' / '+slides.length;document.querySelectorAll('#dots i').forEach((d,j)=>d.classList.toggle('on',j===cur));
    document.getElementById('next').textContent=(cur===slides.length-1&&step>=maxStep(slides[cur]))?'結束 ✓':'下一步 ›';}
  const dots=document.getElementById('dots');if(dots)dots.innerHTML=slides.map(()=>'<i></i>').join('');
  const $=id=>document.getElementById(id);
  if($('next')){$('next').onclick=e=>{e.stopPropagation();next();};$('prev').onclick=e=>{e.stopPropagation();prev();};
    $('snd').onclick=e=>{e.stopPropagation();muted=!muted;e.target.textContent=muted?'🔇':'🔊';};
    $('fs').onclick=e=>{e.stopPropagation();const d=document.documentElement;(document.fullscreenElement?document.exitFullscreen():(d.requestFullscreen||d.webkitRequestFullscreen||(()=>{})).call(d));};}
  /* 連結：流程頁、按鈕 */
  document.querySelectorAll('[data-href]').forEach(a=>a.addEventListener('click',e=>{e.stopPropagation();const u=a.dataset.href;
    if(/\.(pdf|pptx)(\?|$)|^https?:\/\/(?!classtools1020)/.test(u))window.open(u,'_blank');else location.href=u;}));
  /* 流程頁：跳到第幾頁 */
  document.querySelectorAll('[data-goto]').forEach(a=>a.addEventListener('click',e=>{e.stopPropagation();go(+a.dataset.goto-1);}));
  stage.addEventListener('click',()=>next());
  addEventListener('keydown',e=>{if(['ArrowRight','PageDown',' ','Enter'].includes(e.key)){e.preventDefault();next();}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();prev();}});
  const h=parseInt((location.hash||'').slice(1));
  slides.forEach(s=>s.classList.remove('on'));
  cur=(h>0&&h<=slides.length)?h-1:0;slides[cur].classList.add('on');apply(0);ui();
  window.__show={next,prev,go,setStep,maxStep:i=>maxStep(slides[i]),get n(){return slides.length;},get cur(){return cur;},get step(){return step;}};
})();
