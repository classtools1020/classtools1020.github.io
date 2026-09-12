/* 光線特勤隊 獎勵特效引擎 fx.js — 純內嵌、無外部依賴
   FX.chest({title,gem,onDone})  FX.mascot({emoji,name,lines,onDone})  FX.stamp({text,onDone})
   FX.wheel({title,prizes,onDone})  FX.levelup({level,label})  FX.fireworks(ms)  FX.balloons(ms)
   FX.badge({id,emoji,name,desc})  FX.getBadges()  FX.speak(zh,en)  FX.sound.*                       */
(function(){
  const FX={};
  /* ---------- audio ---------- */
  let AC;const ac=()=>{if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}return AC;};
  const tone=(f,t,d,ty="triangle",v=.22)=>{const a=ac();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=ty;o.frequency.setValueAtTime(f,t);
    o.connect(g);g.connect(a.destination);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.start(t);o.stop(t+d);};
  const glide=(f1,f2,t,d,ty="sine",v=.2)=>{const a=ac();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=ty;o.frequency.setValueAtTime(f1,t);
    o.frequency.exponentialRampToValueAtTime(f2,t+d);o.connect(g);g.connect(a.destination);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.start(t);o.stop(t+d);};
  const noise=(t,d,v=.15,hp=800)=>{const a=ac();if(!a)return;const n=Math.floor(a.sampleRate*d),buf=a.createBuffer(1,n,a.sampleRate),ch=buf.getChannelData(0);
    for(let i=0;i<n;i++)ch[i]=(Math.random()*2-1)*(1-i/n);const s=a.createBufferSource();s.buffer=buf;const f=a.createBiquadFilter();f.type="highpass";f.frequency.value=hp;
    const g=a.createGain();g.gain.value=v;s.connect(f);f.connect(g);g.connect(a.destination);s.start(t);};
  const now=()=>{const a=ac();return a?a.currentTime:0;};
  FX.sound={
    click(){tone(880,now(),.06,"square",.12);},
    rattle(){const t=now();for(let i=0;i<6;i++){noise(t+i*.07,.06,.14,1200);tone(240+i*30,t+i*.07,.05,"square",.08);}},
    creak(){glide(180,420,now(),.5,"sawtooth",.08);},
    sparkle(){const t=now();[1568,1976,2349,2637,3136].forEach((f,i)=>tone(f,t+i*.06,.25,"sine",.14));},
    coin(){const t=now();tone(1568,t,.08,"square",.2);tone(2093,t+.07,.16,"square",.18);},
    right(){const t=now();[523,659,784,1047].forEach((f,i)=>tone(f,t+i*.08,.2,"triangle",.28));tone(2093,t+.34,.25,"sine",.12);},
    wrong(){glide(360,220,now(),.28,"sine",.18);},
    stamp(){const t=now();noise(t,.08,.25,300);tone(90,t,.18,"sine",.35);tone(60,t+.02,.25,"sine",.25);},
    whoosh(){const t=now();noise(t,.35,.12,600);glide(300,1200,t,.3,"sine",.1);},
    pop(){const t=now();glide(600,1200,t,.08,"sine",.2);},
    tick(){tone(1200,now(),.03,"square",.1);},
    fanfare(){const t=now();[[523,0],[523,.12],[523,.24],[659,.38],[784,.54],[1047,.72]].forEach(([f,dt])=>tone(f,t+dt,.3,"triangle",.3));noise(t+.8,.3,.08,3000);},
    levelup(){const t=now();[392,523,659,784,1047,1319].forEach((f,i)=>tone(f,t+i*.07,.35,"triangle",.25));glide(1000,2500,t+.5,.4,"sine",.12);},
    boom(){const t=now();if(FX.calm){glide(523,784,t,.25,"sine",.12);glide(659,988,t+.12,.3,"sine",.1);return;}noise(t,.5,.22,120);glide(120,40,t,.5,"sine",.3);},
    robot(){const t=now();[440,660,550,880].forEach((f,i)=>tone(f,t+i*.09,.12,"square",.12));glide(300,900,t+.4,.25,"sawtooth",.06);},
  };
  /* 🍄 瑪利歐風清脆音效（方波＋短包絡） */
  const sq=(f,t,d,v=.13)=>tone(f,t,d,"square",v);
  FX.sound.coin=()=>{const t=now();sq(988,t,.07,.14);sq(1319,t+.07,.32,.14);};                       // 叮～
  FX.sound.jump=()=>{const t=now();glide(330,880,t,.14,"square",.1);};                               // 啾
  FX.sound.powerup=()=>{const t=now();[523,659,784,1047,1319,1568,2093].forEach((f,i)=>sq(f,t+i*.045,.06,.12));};  // 吃蘑菇
  FX.sound.oneup=()=>{const t=now();[1319,1568,2637,2093,2349,3136].forEach((f,i)=>sq(f,t+i*.09,.1,.12));};      // 1UP
  FX.sound.clear=()=>{const t=now();[[784,0],[1047,.1],[1319,.2],[1568,.3],[2093,.45],[1568,.6],[2093,.7]].forEach(([f,dt])=>sq(f,t+dt,.14,.13));
    [[1047,.95],[1319,1.05],[1568,1.15],[2093,1.3]].forEach(([f,dt])=>tone(f,t+dt,.5,"triangle",.16));};        // 過關
  FX.sound.blip=()=>{sq(1200,now(),.04,.09);};
  FX.sound.wrongsoft=()=>{const t=now();sq(392,t,.1,.1);sq(311,t+.11,.18,.1);};
  // 舊名稱改接新音色，所有頁面自動變清脆
  FX.sound.right=FX.sound.powerup; FX.sound.fanfare=FX.sound.clear; FX.sound.levelup=FX.sound.oneup; FX.sound.sparkle=FX.sound.coin; FX.sound.click=FX.sound.blip; FX.sound.wrong=FX.sound.wrongsoft; FX.sound.pop=FX.sound.jump;

  /* 🔇 旁白預設關閉（老師：太吵）；右下角 🔈 可開啟 */
  FX.voiceOn=()=>{try{return localStorage.getItem("voice")==="on";}catch(e){return false;}};
  // 溫和模式（預設開）：爆炸音改成柔和鈴聲，避免嚇到對聲音敏感的同學；localStorage calm="off" 可關
  FX.calm=(()=>{try{return localStorage.getItem("calm")!=="off";}catch(e){return true;}})();
  FX.speak=(zh,en)=>{if(!FX.voiceOn())return;if(!('speechSynthesis'in window))return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(zh);u.lang="zh-TW";u.rate=.9;
    u.onend=()=>{if(en){const e=new SpeechSynthesisUtterance(en);e.lang="en-US";e.rate=.85;speechSynthesis.speak(e);}};speechSynthesis.speak(u);}catch(e){}};

  /* ---------- styles ---------- */
  const css=`
  .fx-ov{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;
    background:rgba(4,8,18,.92);font-family:'Noto Sans TC','Microsoft JhengHei',system-ui,sans-serif;color:#eaf6ff;animation:fxfade .25s}
  @keyframes fxfade{from{opacity:0}to{opacity:1}}
  .fx-title{font-size:min(8vw,40px);font-weight:900;margin:0 0 10px;text-shadow:0 4px 14px rgba(0,0,0,.6)}
  .fx-sub{font-size:min(5vw,22px);font-weight:900;color:#ffc93c;margin:6px 0}
  .fx-btn{margin-top:18px;font-weight:900;font-size:20px;border:none;border-radius:16px;padding:14px 28px;cursor:pointer;background:linear-gradient(180deg,#ffc93c,#ff9f1c);color:#08131f;box-shadow:0 6px 0 #c9860f}
  .fx-btn:active{transform:translateY(4px);box-shadow:0 2px 0 #c9860f}
  .fx-canvas{position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9100}
  /* chest */
  .fx-chest{position:relative;width:min(60vw,260px);height:min(46vw,200px);margin:10px auto;cursor:pointer}
  .fx-chest .base{position:absolute;left:0;right:0;bottom:0;height:58%;background:linear-gradient(180deg,#8a5a2b,#5b3717);border-radius:14px;border:4px solid #3d2410;box-shadow:inset 0 0 30px rgba(0,0,0,.4)}
  .fx-chest .base::after{content:"";position:absolute;left:50%;top:-6px;width:34px;height:40px;transform:translateX(-50%);background:linear-gradient(180deg,#ffd45a,#b8860b);border-radius:8px;border:3px solid #6b4a00}
  .fx-chest .lid{position:absolute;left:0;right:0;top:0;height:48%;background:linear-gradient(180deg,#a86d33,#7a4a1e);border-radius:60px 60px 10px 10px;border:4px solid #3d2410;transform-origin:50% 100%;transition:transform .7s cubic-bezier(.2,1.4,.4,1)}
  .fx-chest.shake{animation:fxshake .6s}
  @keyframes fxshake{0%,100%{transform:rotate(0)}20%{transform:rotate(-6deg) translateY(-4px)}40%{transform:rotate(6deg)}60%{transform:rotate(-5deg) translateY(-6px)}80%{transform:rotate(4deg)}}
  .fx-chest.open .lid{transform:rotateX(-115deg)}
  .fx-glow{position:absolute;left:50%;bottom:40%;width:10px;height:10px;border-radius:50%;background:#fff;opacity:0;transform:translateX(-50%);box-shadow:0 0 0 0 rgba(255,230,120,.9)}
  .fx-chest.open .fx-glow{animation:fxglow 1.2s ease-out forwards}
  @keyframes fxglow{0%{opacity:1;box-shadow:0 0 0 0 rgba(255,230,120,.9)}100%{opacity:0;box-shadow:0 0 0 220px rgba(255,230,120,0)}}
  .fx-gem{font-size:min(20vw,96px);line-height:1;filter:drop-shadow(0 10px 20px rgba(0,0,0,.6));animation:fxrise .9s cubic-bezier(.2,1.3,.4,1) both;margin-top:-30px}
  @keyframes fxrise{0%{transform:translateY(80px) scale(.2);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}
  .fx-tap{font-size:18px;font-weight:900;color:#ffe08a;animation:fxpulse 1s infinite}
  @keyframes fxpulse{0%,100%{opacity:1}50%{opacity:.4}}
  /* mascot */
  .fx-mascot{position:fixed;left:-30vw;bottom:8vh;z-index:9200;display:flex;align-items:flex-end;gap:12px;pointer-events:none}
  .fx-mascot .m{font-size:min(30vw,150px);line-height:1;filter:drop-shadow(0 12px 20px rgba(0,0,0,.6));animation:fxbob 1s ease-in-out infinite}
  @keyframes fxbob{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-16px) rotate(3deg)}}
  .fx-mascot .bub{background:#fff;color:#0b2a44;font-weight:900;font-size:min(5vw,24px);border-radius:22px;padding:14px 18px;max-width:52vw;position:relative;margin-bottom:60px;box-shadow:0 10px 24px rgba(0,0,0,.5);animation:fxrise .5s both}
  .fx-mascot .bub::after{content:"";position:absolute;left:-14px;bottom:18px;border:10px solid transparent;border-right-color:#fff}
  .fx-mascot.in{animation:fxfly 1.1s cubic-bezier(.2,1.1,.3,1) forwards}
  @keyframes fxfly{0%{left:-30vw}100%{left:6vw}}
  .fx-mascot.out{animation:fxflyout .8s ease-in forwards}
  @keyframes fxflyout{0%{left:6vw}100%{left:110vw}}
  /* stamp */
  .fx-stamp{position:fixed;inset:0;z-index:9200;display:flex;align-items:center;justify-content:center;pointer-events:none}
  .fx-stamp .s{font-size:min(22vw,120px);font-weight:900;color:#e0243c;border:10px solid #e0243c;border-radius:22px;padding:6px 26px;transform:rotate(-14deg) scale(6);opacity:0;
    font-family:'Noto Sans TC','Microsoft JhengHei',sans-serif;letter-spacing:.1em;background:rgba(255,255,255,.08);animation:fxslam .5s cubic-bezier(.2,1.3,.3,1) forwards;text-shadow:0 0 12px rgba(224,36,60,.4)}
  @keyframes fxslam{0%{transform:rotate(-14deg) scale(6);opacity:0}60%{transform:rotate(-14deg) scale(.9);opacity:1}100%{transform:rotate(-14deg) scale(1);opacity:1}}
  /* wheel */
  .fx-wheelwrap{position:relative;width:min(80vw,340px);height:min(80vw,340px);margin:8px auto}
  .fx-wheelwrap canvas{width:100%;height:100%;border-radius:50%;box-shadow:0 12px 30px rgba(0,0,0,.6);transition:transform 4.2s cubic-bezier(.12,.75,.15,1)}
  .fx-wheelwrap .ptr{position:absolute;left:50%;top:-14px;transform:translateX(-50%);font-size:44px;filter:drop-shadow(0 4px 6px rgba(0,0,0,.6))}
  /* level */
  .fx-lv{font-size:min(14vw,72px);font-weight:900;color:#ffc93c;text-shadow:0 0 30px rgba(255,201,60,.8);animation:fxrise .6s both}
  .fx-bar{width:min(80vw,420px);height:22px;border-radius:999px;background:#1a2a44;overflow:hidden;margin:14px auto;border:2px solid #3a5a86}
  .fx-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#42e0c8,#ffc93c);transition:width 1.4s ease-out}
  /* badge */
  .fx-badge{font-size:min(28vw,130px);line-height:1;animation:fxspin 1s cubic-bezier(.2,1.3,.4,1) both;filter:drop-shadow(0 12px 24px rgba(0,0,0,.6))}
  @keyframes fxspin{0%{transform:rotateY(540deg) scale(.2);opacity:0}100%{transform:rotateY(0) scale(1);opacity:1}}
  .fx-ring{width:min(46vw,210px);height:min(46vw,210px);border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;
    background:radial-gradient(circle,#ffe58a,#ffb01c 60%,#b8700a);box-shadow:0 0 0 8px #6b4a00,0 0 40px rgba(255,201,60,.8)}
  `;
  const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

  /* ---------- particles (confetti / fireworks / balloons) ---------- */
  let cv,cx,parts=[],raf=null;
  function canvas(){if(cv)return;cv=document.createElement("canvas");cv.className="fx-canvas";document.body.appendChild(cv);cx=cv.getContext("2d");
    const sz=()=>{cv.width=innerWidth;cv.height=innerHeight;};sz();addEventListener("resize",sz);}
  function run(){if(!raf)raf=requestAnimationFrame(loop);}
  function loop(){cx.clearRect(0,0,cv.width,cv.height);
    parts.forEach(p=>{p.vy+=p.g;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.life++;cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.globalAlpha=p.a!=null?Math.max(0,p.a-p.life/p.max):1;
      if(p.t==="txt"){cx.font=p.s+"px serif";cx.textAlign="center";cx.fillText(p.c,0,0);}else{cx.fillStyle=p.c;cx.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);}cx.restore();});
    parts=parts.filter(p=>p.y<cv.height+40&&p.y>-60&&p.life<p.max);if(parts.length)raf=requestAnimationFrame(loop);else{raf=null;cx.clearRect(0,0,cv.width,cv.height);}}
  const COL=["#ff4d4d","#3aa0ff","#ffc93c","#28c76f","#ff8a5b","#c77dff","#fff"];
  FX.confetti=(n=90,x,y)=>{canvas();for(let i=0;i<n;i++)parts.push({x:(x||innerWidth/2)+(Math.random()-.5)*240,y:y||innerHeight*.35,vx:(Math.random()-.5)*10,vy:Math.random()*-9-3,g:.3,s:6+Math.random()*8,c:COL[Math.floor(Math.random()*COL.length)],r:Math.random()*6,vr:(Math.random()-.5)*.4,life:0,max:260});run();};
  FX.emojiBurst=(emoji,n=30,x,y)=>{canvas();for(let i=0;i<n;i++)parts.push({t:"txt",x:(x||innerWidth/2),y:(y||innerHeight*.5),vx:(Math.random()-.5)*14,vy:Math.random()*-12-4,g:.35,s:22+Math.random()*22,c:emoji,r:0,vr:(Math.random()-.5)*.3,life:0,max:200,a:1.2});run();};
  FX.fireworks=(ms=2600)=>{canvas();FX.sound.boom();const t0=Date.now();(function shot(){if(Date.now()-t0>ms)return;const x=innerWidth*(.15+Math.random()*.7),y=innerHeight*(.15+Math.random()*.4),c=COL[Math.floor(Math.random()*COL.length)];
    for(let i=0;i<70;i++){const a=Math.random()*6.283,sp=2+Math.random()*7;parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,g:.08,s:4+Math.random()*4,c,r:0,vr:0,life:0,max:90,a:1.1});}
    run();FX.sound.pop();setTimeout(shot,380+Math.random()*300);})();};
  FX.balloons=(ms=3000)=>{canvas();const t0=Date.now();(function b(){if(Date.now()-t0>ms)return;parts.push({t:"txt",x:Math.random()*innerWidth,y:innerHeight+30,vx:(Math.random()-.5)*1.2,vy:-2-Math.random()*2,g:-.01,s:36+Math.random()*30,c:"🎈",r:0,vr:(Math.random()-.5)*.02,life:0,max:600});run();setTimeout(b,140);})();FX.sound.whoosh();};

  /* ---------- overlay helper ---------- */
  function overlay(html){const o=document.createElement("div");o.className="fx-ov";o.innerHTML=html;document.body.appendChild(o);return o;}
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

  /* ---------- 🎁 chest ---------- */
  FX.chest=({title="開寶箱！",gem="💎",gemName="寶石",gemColor="",sub="",onDone}={})=>{
    ac();const o=overlay(`<div class="fx-title">${esc(title)}</div><div class="fx-chest" id="fxc"><div class="base"></div><div class="lid"></div><div class="fx-glow"></div></div>
      <div class="fx-tap" id="fxtap">👆 點寶箱打開</div><div id="fxgem"></div>`);
    const c=o.querySelector("#fxc");let opened=false;
    const open=()=>{if(opened)return;opened=true;c.classList.add("shake");FX.sound.rattle();
      setTimeout(()=>{c.classList.remove("shake");c.classList.add("open");FX.sound.creak();setTimeout(()=>{FX.sound.sparkle();FX.sound.coin();FX.emojiBurst("🪙",26,innerWidth/2,innerHeight*.55);FX.confetti(80);
        o.querySelector("#fxtap").textContent="";o.querySelector("#fxgem").innerHTML=`<div class="fx-gem" style="${gemColor?'filter:drop-shadow(0 0 24px '+gemColor+')':''}">${gem}</div><div class="fx-sub">獲得：${esc(gemName)}</div>${sub?'<div style="font-weight:800;color:#cfe4f5">'+esc(sub)+'</div>':''}<button class="fx-btn" id="fxok">收下 ✨</button>`;
        FX.speak("獲得"+gemName,"");o.querySelector("#fxok").onclick=()=>{FX.sound.click();o.remove();onDone&&onDone();};},700);},650);};
    c.onclick=open;setTimeout(()=>{if(!opened)c.classList.add("shake");},1800);
  };

  /* ---------- 🤖 mascot fly-in ---------- */
  FX.mascot=({emoji="🤖",name="機器人小幫手",lines=["太棒了！"],stay=3800,onDone}={})=>{
    ac();const m=document.createElement("div");m.className="fx-mascot";m.innerHTML=`<div class="m">${emoji}</div><div class="bub"><b>${esc(name)}：</b>${esc(lines[0])}</div>`;
    document.body.appendChild(m);FX.sound.whoosh();requestAnimationFrame(()=>m.classList.add("in"));
    setTimeout(()=>{FX.sound.robot();FX.speak(lines.join("，"),"");FX.confetti(60,innerWidth*.3);},900);
    let i=1;const iv=setInterval(()=>{if(i<lines.length){m.querySelector(".bub").innerHTML=`<b>${esc(name)}：</b>${esc(lines[i++])}`;FX.sound.pop();}},1600);
    setTimeout(()=>{clearInterval(iv);m.classList.remove("in");m.classList.add("out");FX.sound.whoosh();setTimeout(()=>{m.remove();onDone&&onDone();},800);},stay+lines.length*600);
  };

  /* ---------- 🔖 stamp ---------- */
  FX.stamp=({text="破案",onDone}={})=>{ac();const s=document.createElement("div");s.className="fx-stamp";s.innerHTML=`<div class="s">${esc(text)}</div>`;document.body.appendChild(s);
    setTimeout(()=>{FX.sound.stamp();FX.confetti(40);},280);setTimeout(()=>{s.style.transition="opacity .4s";s.style.opacity="0";setTimeout(()=>{s.remove();onDone&&onDone();},400);},1500);};

  /* ---------- 🎡 wheel ---------- */
  FX.wheel=({title="幸運轉盤",prizes=["🌟 全班掌聲","🎵 老師放一首歌","🏅 貼紙一張","🎉 撒花加倍","🤖 機器人跳舞","🍬 神秘小獎"],onDone}={})=>{
    ac();const o=overlay(`<div class="fx-title">${esc(title)}</div><div class="fx-wheelwrap"><div class="ptr">🔻</div><canvas id="fxw" width="600" height="600"></canvas></div><button class="fx-btn" id="fxspin">🎡 轉！</button><div class="fx-sub" id="fxres"></div>`);
    const c=o.querySelector("#fxw"),x=c.getContext("2d"),n=prizes.length,seg=6.283/n,cols=["#ff4d4d","#3aa0ff","#ffc93c","#28c76f","#ff8a5b","#c77dff","#42e0c8","#ff5d8f"];
    for(let i=0;i<n;i++){x.beginPath();x.moveTo(300,300);x.arc(300,300,290,i*seg-1.5708,(i+1)*seg-1.5708);x.closePath();x.fillStyle=cols[i%cols.length];x.fill();x.strokeStyle="#fff";x.lineWidth=4;x.stroke();
      x.save();x.translate(300,300);x.rotate(i*seg+seg/2-1.5708);x.textAlign="right";x.fillStyle="#08131f";x.font="bold 30px 'Noto Sans TC',sans-serif";x.fillText(prizes[i],270,10);x.restore();}
    x.beginPath();x.arc(300,300,34,0,6.283);x.fillStyle="#fff";x.fill();
    let spun=false;o.querySelector("#fxspin").onclick=()=>{if(spun)return;spun=true;const win=Math.floor(Math.random()*n);const turns=5+Math.random()*2;const deg=turns*360+(360-(win*360/n+180/n));
      c.style.transform=`rotate(${deg}deg)`;let k=0;const tk=setInterval(()=>{FX.sound.tick();if(++k>40)clearInterval(tk);},100);
      setTimeout(()=>{FX.sound.fanfare();FX.confetti(120);o.querySelector("#fxres").innerHTML=`🎉 ${esc(prizes[win])}<br><button class="fx-btn" id="fxok">太棒了！</button>`;FX.speak(prizes[win].replace(/^\S+\s/,""),"");
        o.querySelector("#fxok").onclick=()=>{o.remove();onDone&&onDone(prizes[win]);};},4400);};
  };

  /* ---------- ⬆️ level up ---------- */
  FX.levelup=({level=2,label="等級提升！",onDone}={})=>{ac();const o=overlay(`<div class="fx-lv">LEVEL UP!</div><div class="fx-sub">${esc(label)}　Lv.${level}</div><div class="fx-bar"><i id="fxb"></i></div><button class="fx-btn" id="fxok">繼續 ➡</button>`);
    FX.sound.levelup();setTimeout(()=>o.querySelector("#fxb").style.width="100%",50);FX.confetti(70);o.querySelector("#fxok").onclick=()=>{o.remove();onDone&&onDone();};};

  /* ---------- 🏅 badge (localStorage) ---------- */
  const KEY="lightBadges";
  FX.getBadges=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}");}catch(e){return {};}};
  FX.badge=({id,emoji="🏅",name="勳章",desc="",onDone}={})=>{ac();let b=FX.getBadges();const isNew=!b[id];if(id){b[id]={emoji,name,desc,t:Date.now()};try{localStorage.setItem(KEY,JSON.stringify(b));}catch(e){}}
    const o=overlay(`<div class="fx-title">${isNew?"🎉 解鎖新勳章！":"🏅 勳章"}</div><div class="fx-ring"><div class="fx-badge">${emoji}</div></div><div class="fx-sub" style="font-size:min(7vw,32px)">${esc(name)}</div><div style="font-weight:800;color:#cfe4f5">${esc(desc)}</div><button class="fx-btn" id="fxok">收進勳章牆 🗂️</button>`);
    FX.sound.fanfare();FX.fireworks(1800);FX.speak("解鎖勳章，"+name,"");o.querySelector("#fxok").onclick=()=>{o.remove();onDone&&onDone();};};

  /* ---------- 🔔 集合口令（拍手節奏＋語音，班級太吵時用） ---------- */
  const clap=(t,v=.5)=>{const a=ac();if(!a)return;noise(t,.09,v,1500);tone(220,t,.05,"triangle",.12);};
  FX.attention=({call="光線特勤隊！",response="集合！",pattern=[0,.32,.64,.9,1.06]}={})=>{ac();const t=now();
    pattern.forEach(dt=>clap(t+dt));                       // 拍手：X X X XX（學生跟著拍）
    setTimeout(()=>{FX.speak(call,"");},1400);
    const o=document.createElement("div");o.className="fx-stamp";o.style.pointerEvents="none";
    o.innerHTML=`<div class="s" style="color:#42e0c8;border-color:#42e0c8;font-size:min(14vw,80px);transform:rotate(0) scale(1);animation:none;line-height:1.2">👏 ${esc(call)}<br><span style="font-size:.6em;color:#ffc93c">→ ${esc(response)}</span></div>`;
    document.body.appendChild(o);setTimeout(()=>o.remove(),3200);};
  // 每個載入 fx.js 的頁面自動有一顆浮動 🔔 按鈕（右下角）
  function bell(){if(document.getElementById("fxbell"))return;const b=document.createElement("button");b.id="fxbell";b.title="集合口令";b.textContent="🔔";
    b.style.cssText="position:fixed;right:14px;bottom:84px;z-index:9500;width:56px;height:56px;border-radius:50%;border:3px solid #42e0c8;background:#0f2841;font-size:26px;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,.5)";
    b.onclick=()=>FX.attention();document.body.appendChild(b);
    const v=document.createElement("button");v.id="fxvoice";v.title="旁白開關";
    v.style.cssText="position:fixed;right:14px;bottom:150px;z-index:9500;width:44px;height:44px;border-radius:50%;border:2px solid rgba(120,170,210,.5);background:#0f2841;font-size:20px;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,.5)";
    const paint=()=>{v.textContent=FX.voiceOn()?"🔈":"🔇";v.style.opacity=FX.voiceOn()?"1":".7";};paint();
    v.onclick=()=>{try{localStorage.setItem("voice",FX.voiceOn()?"off":"on");}catch(e){}paint();FX.sound.blip();if(FX.voiceOn())FX.speak("旁白開啟","");};
    document.body.appendChild(v);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bell);else bell();

  /* ---------- 📍 今日流程自動串聯（主入口「開始這堂課」→ 每頁底部導覽列） ---------- */
  const norm=u=>{try{const a=new URL(u,location.href);return (a.origin+a.pathname).replace(/index\.html$/,"");}catch(e){return u;}};
  FX.flowStart=(title,steps)=>{try{localStorage.setItem("flow",JSON.stringify({title,steps,i:0,t:Date.now()}));}catch(e){}
    const u=steps[0].url;if(/gamma\.app|youtube\.com|\.docx$/i.test(u)){window.open(u,"_blank");}else{location.href=u;}};
  FX.flowEnd=()=>{try{localStorage.removeItem("flow");}catch(e){}const b=document.getElementById("fxflow");if(b)b.remove();};
  function flowBar(){let f=null;try{f=JSON.parse(localStorage.getItem("flow")||"null");}catch(e){}if(!f||!f.steps||!f.steps.length)return;
    if(Date.now()-(f.t||0)>12*3600*1000){FX.flowEnd();return;}          // 超過 12 小時自動結束
    const here=norm(location.href);const k=f.steps.findIndex(s=>norm(s.url)===here);if(k>=0){f.i=k;try{localStorage.setItem("flow",JSON.stringify(f));}catch(e){}}
    const i=f.i,n=f.steps.length,cur=f.steps[i],nx=f.steps[i+1],pv=f.steps[i-1];
    const bar=document.createElement("div");bar.id="fxflow";
    bar.style.cssText="position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:9400;background:rgba(8,20,36,.96);border:2px solid #ffc93c;border-radius:18px;padding:10px 14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center;max-width:min(96vw,760px);box-shadow:0 10px 26px rgba(0,0,0,.6);font-family:'Noto Sans TC','Microsoft JhengHei',system-ui,sans-serif;color:#eaf6ff";
    const btn=(t,c)=>`<button style="font-weight:900;font-size:15px;border:none;border-radius:12px;padding:10px 14px;cursor:pointer;background:${c};color:#08131f">${t}</button>`;
    bar.innerHTML=`<span style="font-weight:900;font-size:14px;color:#ffe08a">📍 ${esc(f.title)}　第 ${i+1}/${n} 步：${esc(cur.label)}</span>`+
      (pv?btn("⬅ 上一步","#9db8cf"):"")+(nx?btn("下一步 ➡ "+esc(nx.label),"#ffc93c"):btn("🏁 這堂上完了","#42e0c8"))+`<button id="fxflowx" title="結束流程" style="border:none;background:transparent;color:#9db8cf;font-weight:900;cursor:pointer">✖</button>`;
    document.body.appendChild(bar);
    const go=(j)=>{f.i=j;try{localStorage.setItem("flow",JSON.stringify(f));}catch(e){}const u=f.steps[j].url;FX.sound.jump();
      if(/gamma\.app|youtube\.com|\.docx$/i.test(u)){window.open(u,"_blank");bar.remove();flowBar();}else{location.href=u;}};
    const bs=bar.querySelectorAll("button");let bi=0;if(pv){bs[bi++].onclick=()=>go(i-1);}
    bs[bi++].onclick=()=>{if(nx)go(i+1);else{FX.sound.clear();FX.confetti(160);FX.fireworks(2500);setTimeout(FX.flowEnd,2600);}};
    bar.querySelector("#fxflowx").onclick=FX.flowEnd;}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",flowBar);else flowBar();

  window.FX=FX;
})();
