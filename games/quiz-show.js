/* 環島搶答 2.0：驚喜卡（Bamboozle 式）＋雙倍站＋夜間舞台
   接在原本遊戲的 <script> 後面載入；包住 show／finish／score／finale，不改原本題目。 */
(function(){
  const $=id=>document.getElementById(id);
  const isTemp=/temp-quiz/.test(location.pathname);
  const isCls=typeof CLS!=='undefined'&&CLS;
  const CHANT=isTemp?'「嗶！一聲就知道！」':'「Snap！折一下！」';
  const POSE=isTemp?'全班比出量額溫第一步：撥開瀏海':'全班比出「折一下」手勢 🫰';
  const NM={r:'紅隊',b:'藍隊',all:'全班'};
  document.body.classList.add('qs');
  document.querySelectorAll('.ticket .ts small').forEach(s=>s.textContent='分');
  const sub=document.querySelector('header h1 small');if(sub)sub.textContent='答對抽驚喜卡！🔥 雙倍站答對多 1 分';
  const sp=document.querySelector('#start .cbox p');if(sp)sp.insertAdjacentHTML('afterend','<div class="qsNew">🎁 新玩法：答對就抽一張驚喜卡 ｜ 🔥 地圖上藏著雙倍站</div>');

  /* ---------- 分數＝站數＋加分 ---------- */
  let bonus={r:0,b:0,all:0};
  const cnt=t=>owner.filter(o=>o===t).length;
  const total=t=>Math.max(0,cnt(t)+bonus[t]);
  score=function(){[['sR','r'],['sB','b'],['sG','all']].forEach(([id,t])=>{const e=$(id);if(e)e.textContent=total(t);});};
  function bump(t){const tk=$(t==='r'?'tkR':t==='b'?'tkB':'tkG');if(!tk)return;tk.classList.remove('bump');void tk.offsetWidth;tk.classList.add('bump');}
  function floatTxt(t,txt,color){const tk=$(t==='r'?'tkR':t==='b'?'tkB':'tkG');if(!tk)return;const r=tk.getBoundingClientRect();
    const d=document.createElement('div');d.className='qsFloat';d.textContent=txt;d.style.color=color||'#ffd46b';d.style.left=(r.left+r.width/2-30)+'px';d.style.top=(r.top+10)+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),1500);}

  /* ---------- 雙倍站 ---------- */
  let HOT=new Set();
  function pickHot(){HOT=new Set();const pool=[1,2,3,4,5,6,7,8];while(HOT.size<2){HOT.add(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);}}
  pickHot();
  const panel=$('panel');const hotEl=document.createElement('div');hotEl.className='qsHot';hotEl.textContent='🔥 雙倍站！這題答對，再多 1 分';panel.insertBefore(hotEl,panel.firstChild);
  const _show=show;
  show=function(){_show();const h=HOT.has(idx);hotEl.classList.toggle('on',h);if(h){try{tone(880,.12,0,.1,'square');tone(1175,.18,.12,.1,'square');}catch(e){}}};
  hotEl.classList.toggle('on',HOT.has(idx));

  /* ---------- 驚喜卡 ---------- */
  const box=document.createElement('div');box.className='qsBox';
  box.innerHTML='<h3 id="qsT">🎁 選一張驚喜卡！<small></small></h3><div class="qsCards" id="qsCards"></div><button class="qsGo" id="qsGo">繼續 ➜</button>';
  document.body.appendChild(box);
  function deck(t){
    if(t==='all')return[
      {ic:'⭐',b:'加碼 +1',s:'全班表現很棒！',w:3,f:()=>bonus.all+=1,d:'+1'},
      {ic:'🌟',b:'超級加碼 +2',s:'太厲害了！',w:2,f:()=>bonus.all+=2,d:'+2'},
      {ic:'🎤',b:'全班一起喊',s:CHANT+'喊完 +2',w:2,f:()=>bonus.all+=2,d:'+2'},
      {ic:'💪',b:'動作挑戰',s:POSE+'，做到 +1',w:2,f:()=>bonus.all+=1,d:'+1'},
      {ic:'👏',b:'掌聲鼓勵',s:'給剛剛答題的同學三下掌聲 +1',w:2,f:()=>bonus.all+=1,d:'+1'}];
    const o=t==='r'?'b':'r';
    const L=[
      {ic:'⭐',b:'加碼 +1',s:NM[t]+'多拿 1 分',w:3,f:()=>bonus[t]+=1,d:'+1'},
      {ic:'🌟',b:'超級加碼 +2',s:NM[t]+'多拿 2 分',w:2,f:()=>bonus[t]+=2,d:'+2'},
      {ic:'🧲',b:'磁鐵',s:'從'+NM[o]+'吸走 1 分',w:2,f:()=>{if(total(o)>0){bonus[o]-=1;bump(o);floatTxt(o,'-1','#ff8b80');}bonus[t]+=1;},d:'+1'},
      {ic:'🎤',b:'全隊一起喊',s:CHANT+'喊完 +1',w:2,f:()=>bonus[t]+=1,d:'+1'},
      {ic:'💣',b:'炸彈！',s:NM[t]+'扣 1 分（別難過，下一題拿回來）',w:1,bad:1,f:()=>{if(total(t)>0)bonus[t]-=1;},d:'-1'}];
    if(total(t)<total(o))L.push({ic:'🔄',b:'大逆轉',s:'兩隊分數交換！',w:2,f:()=>{const a=total(t),c=total(o);bonus[t]+=c-a;bonus[o]+=a-c;bump(o);},d:'⇄'});
    return L;}
  function draw3(t){const D=deck(t),bag=[];D.forEach(c=>{for(let i=0;i<c.w;i++)bag.push(c);});const out=[];
    while(out.length<3){const c=bag[Math.floor(Math.random()*bag.length)];if(!out.includes(c)||D.length<3)out.push(c);}return out;}
  function openBox(t,done){
    const cards=draw3(t);let chosen=false;
    $('qsT').innerHTML=`🎁 ${NM[t]}答對了！選一張驚喜卡<small>${t==='all'?'請一位同學上來選':'請'+NM[t]+'派一位同學上來選'}</small>`;
    $('qsCards').innerHTML=cards.map((c,i)=>`<button class="qsCard" data-i="${i}"><div class="in"><div class="bk">?</div><div class="ft"><div class="ic">${c.ic}</div><b>${c.b}</b><small>${c.s}</small></div></div></button>`).join('');
    $('qsGo').classList.remove('on');box.classList.add('on');
    try{[523,659,784].forEach((f,i)=>tone(f,.15,i*.07,.08,'triangle'));}catch(e){}
    $('qsCards').querySelectorAll('.qsCard').forEach(btn=>btn.onclick=()=>{
      if(chosen)return;chosen=true;const c=cards[+btn.dataset.i];
      btn.classList.add('flip','pick');if(c.bad)btn.classList.add('bad');
      try{tone(440,.08,0,.08,'square');tone(660,.08,.08,.08,'square');}catch(e){}
      setTimeout(()=>{
        c.f();score();bump(t);floatTxt(t,c.d,c.bad?'#ff8b80':'#ffd46b');
        if(c.bad){box.classList.add('qsShake');setTimeout(()=>box.classList.remove('qsShake'),520);try{noise(.4,0,.3,180);tone(80,.4,0,.3);}catch(e){}}
        else{try{SND.ok();const r=btn.getBoundingClientRect();FX.confetti(120,r.left+r.width/2,r.top+r.height/2);}catch(e){}}
        setTimeout(()=>{$('qsCards').querySelectorAll('.qsCard').forEach(b=>{if(b!==btn){b.classList.add('flip','dim');}});},700);
        setTimeout(()=>$('qsGo').classList.add('on'),1100);
      },650);
    });
    $('qsGo').onclick=()=>{box.classList.remove('on');try{SND.tap();}catch(e){}done();};
  }
  const _finish=finish;
  finish=function(){const t=owner[idx];
    if(!t){_finish();return;}
    if(HOT.has(idx)){bonus[t]+=1;score();setTimeout(()=>{bump(t);floatTxt(t,'🔥+1','#ffb020');},500);}
    setTimeout(()=>openBox(t,_finish),900);};

  /* ---------- 結束：用總分判冠軍 ---------- */
  const _fin=finale;
  finale=function(){_fin();if(isCls){const e=$('endT');if(e)e.textContent=`環島成功！全班拿到 ${total('all')} 分`;return;}
    const r=total('r'),b=total('b');const e=$('endT');if(e)e.textContent=r>b?'紅隊環島冠軍！':b>r?'藍隊環島冠軍！':'兩隊平手，都是冠軍！';};
  const ag=$('againBtn');if(ag)ag.addEventListener('click',()=>{bonus={r:0,b:0,all:0};pickHot();score();hotEl.classList.toggle('on',HOT.has(idx));});
  score();
})();
