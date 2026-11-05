(() => {
 const work=document.getElementById('work'),arena=document.getElementById('work-arena');
 const start=document.createElement('button');start.id='awakenBoss';start.textContent='Enter the last page';arena.querySelector('.final-caption').append(start);
 const layer=document.createElement('section');layer.id='bossLayer';layer.hidden=true;layer.setAttribute('aria-label','Guardian boss fight');
 layer.innerHTML=`<canvas id="bossCanvas" tabindex="0" aria-label="Battle arena. A and D move, Space jumps, J attacks, Shift dodges, Escape pauses."></canvas><div id="fightSplash" hidden aria-live="assertive"><strong>FIGHT!</strong></div><div class="player-hud">ADVENTURER<progress id="playerHealth" value="90" max="90" aria-label="Player health"></progress><span id="dodgeStatus">Dodge ready</span></div><div class="boss-hud"><h2>THE RIFT WARDEN</h2><div class="boss-meter" role="progressbar" aria-label="Boss health" aria-valuemin="0" aria-valuemax="540"><i></i></div><p id="bossPhase">I · ARMORED GUARDIAN</p><span id="battleTime">2:00</span></div><div class="boss-actions"><button id="battlePause">Pause</button><button id="battleSound" aria-pressed="true">Sound on</button><button id="battleExit">Leave</button></div><div id="battleNotice" role="status" aria-live="polite"></div><div class="battle-help">A / D · Move &nbsp; SPACE · Jump &nbsp; J / Click · Sword &nbsp; SHIFT · Dodge</div><div class="boss-touch"><div><button data-move="-1" aria-label="Move left">←</button><button data-move="1" aria-label="Move right">→</button></div><div><button data-action="jump">Jump</button><button data-action="dodge">Dodge</button><button data-action="attack">Sword</button></div></div><div class="battle-dialog" hidden><h2></h2><p></p><div class="dialog-buttons"><button id="battleContact" hidden>Enter the gate → Contact</button><button id="battleAgain">Try again</button><button id="battleReturn">Return to Work</button></div></div>`;
 work.append(layer);
 const $=s=>layer.querySelector(s),canvas=$('#bossCanvas'),ctx=canvas.getContext('2d'),atlas=new Image(),art=[];
 atlas.src='boss-rig.png';
 // Isolate the eight transparent rig pieces; keep each arm and weapon independent.
 atlas.onload=()=>{const c=document.createElement('canvas');c.width=atlas.width;c.height=atlas.height;const g=c.getContext('2d');g.drawImage(atlas,0,0);const data=g.getImageData(0,0,c.width,c.height).data;const cuts=[0,.30,.50,.73,1];for(let row=0;row<2;row++)for(let col=0;col<4;col++){let l=c.width,t=c.height,r=0,b=0;for(let y=Math.floor(row*c.height/2);y<(row+1)*c.height/2;y++)for(let x=Math.floor(cuts[col]*c.width);x<cuts[col+1]*c.width;x++)if(data[(y*c.width+x)*4+3]>128){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y)}art.push({x:l,y:t,w:r-l+1,h:b-t+1})}};
 let fight=null,running=false,paused=false,musicStarted=false,raf=0,previous=0,scale=1,W=1200,H=720,floor=570,particles=[],scars=[],impacts=[],noticeTime=0,sound=true,audioContext=null;
 const bladeTrails=[[],[]];
 const keys=new Set(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function resize(){const old=W;W=Math.max(640,innerWidth);scale=innerWidth/W;H=innerHeight/scale;floor=H*.79;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;if(fight){fight.player.x*=W/old;fight.boss.x*=W/old;if(Number.isFinite(fight.boss.target))fight.boss.target*=W/old;if(Number.isFinite(fight.boss.origin))fight.boss.origin*=W/old;fight.width=W}ctx.setTransform(dpr*scale,0,0,dpr*scale,0,0)}
 function tone(freq,duration=.12,type='triangle',volume=.05){if(!sound)return;try{audioContext??=new AudioContext();if(audioContext.state==='suspended')audioContext.resume();const o=audioContext.createOscillator(),g=audioContext.createGain();o.type=type;o.frequency.setValueAtTime(freq,audioContext.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(30,freq*.4),audioContext.currentTime+duration);g.gain.setValueAtTime(volume*1.5,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration);o.connect(g).connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+duration)}catch{}}
 function notice(text,time=1.6){$('#battleNotice').textContent=text;noticeTime=time}
 function burst(x,y,color,n=14){if(reduced.matches)return;for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*280,vy:-Math.random()*250,life:.5+Math.random()*.5,color})}
 function begin(){if(!art.length||!sprites[0]?.width){notice('The guardian is still loading.');start.textContent='Opening the gate…';atlas.decode().then(()=>{start.textContent='Enter the last page';if(art.length)begin()}).catch(()=>{start.textContent='Asset unavailable — refresh to retry'});return}
  window.focusWorkArena();work.dataset.fighting='true';document.body.classList.add('boss-active');layer.hidden=false;resize();fight=new WardenFight(W);running=true;paused=false;musicStarted=false;$('#fightSplash').hidden=false;window.GameAudio?.bossSound(sound);window.GameAudio?.fight();bladeTrails[0]=[];bladeTrails[1]=[];keys.clear();particles=[];scars=[];impacts=[];$('.battle-dialog').hidden=true;layer.classList.remove('boss-phase-two');$('#bossPhase').textContent='I · ARMORED GUARDIAN';$('#battlePause').textContent='Pause';$('#battleContact').hidden=true;cancelAnimationFrame(raf);previous=performance.now();notice('The gate awakens. Ready your sword.',1.6);tone(100,.6);canvas.focus({preventScroll:true});raf=requestAnimationFrame(loop);
 }
 function leave(){window.GameAudio?.stop();$('#fightSplash').hidden=true;running=false;paused=false;cancelAnimationFrame(raf);keys.clear();layer.hidden=true;work.dataset.fighting='false';document.body.classList.remove('boss-active');start.focus({preventScroll:true})}
 function dialog(title,text,button){$('.battle-dialog h2').textContent=title;$('.battle-dialog p').textContent=text;$('#battleAgain').textContent=button;$('.battle-dialog').hidden=false;$('#battleAgain').focus({preventScroll:true})}
 function pause(){if(!running||fight.status!=='playing'||paused)return;paused=true;window.GameAudio?.pause();keys.clear();dialog('Storm on hold','Take a breath. The battle timer is paused.','Resume')}
 function finish(win,reason){if(win)window.JourneyProgress?.complete('boss');window.GameAudio?.stop();keys.clear();$('#battleContact').hidden=!win;dialog(win?'The gate is restored':"The guardian stands",win?'You broke the armor and defeated its unleashed form.':reason,win?'Fight again':'Try again');if(win){$('#battleContact').focus({preventScroll:true});if(window.guardianScene){$('.battle-dialog').hidden=true;window.guardianScene('outro',()=>window.travelTo('contact',leave))}}tone(win?620:90,.6)}
 function events(){for(const e of fight.events.splice(0)){
  if(e.type==='sword')tone(420,.09);
  if(e.type==='hit'){burst(e.x,floor-105,'#c0fff4',8);tone(190,.08)}
  if(e.type==='hurt'){burst(fight.player.x,floor-fight.player.z-30,'#ffd5a0',12);tone(70,.15,'sawtooth',.035)}
  if(e.type==='dodge')tone(260,.08);
  if(e.type==='warning'){notice(({sweep:'Sword sweep — dodge through!',slam:'Ground slam — jump!',dash:'Charging — jump or dodge!',combo:'Two slashes — keep clear!',rift:'Lightning marked — move!'})[e.kind],1.2);tone(310,.15)}
  if(e.type==='impact'){impacts.push({x:e.x,kind:e.kind,age:0});tone(60,.22,'triangle',.09);burst(e.x,floor-8,fight.phase===1?'#95e9dd':'#d8a2ff',22);scars.push({x:e.x,seed:Math.random()});if(scars.length>12)scars.shift();}
  if(e.type==='transform'){layer.classList.add('boss-phase-two');$('#bossPhase').textContent='II · UNLEASHED';notice('50% · THE MASK BREAKS',1.8);burst(fight.boss.x,floor-120,'#df9aff',45);tone(80,.9,'sawtooth',.04)}
  if(e.type==='won'){burst(fight.boss.x,floor-100,'#c8fff0',55);finish(true)}
  if(e.type==='lost')finish(false,e.reason);
 }}
 function hud(){const b=fight.boss,p=fight.player;$('.boss-meter i').style.width=(b.hp/540*100)+'%';$('.boss-meter').setAttribute('aria-valuenow',b.hp);$('#playerHealth').value=p.hp;$('#dodgeStatus').textContent=p.dodgeCool>0?'Dodge recharging':'Dodge ready';const time=Math.max(0,Math.ceil(120-fight.time));$('#battleTime').textContent=Math.floor(time/60)+':'+String(time%60).padStart(2,'0')}
 function shadow(x,width){ctx.fillStyle='#03101d66';ctx.beginPath();ctx.ellipse(x,floor+3,width,8,0,0,Math.PI*2);ctx.fill()}
 function part(i,x,y,w,h){const a=art[(fight.phase-1)*4+i];if(a)ctx.drawImage(atlas,a.x,a.y,a.w,a.h,x,y,w,h)}
 function bossDraw(){const b=fight.boss,a=art[(fight.phase-1)*4];if(!a)return;const p=WardenAnimation.pose(b,fight.phase,fight.time),height=190,width=height*a.w/a.h;shadow(b.x,65);
  ctx.save();ctx.translate(b.x,floor);ctx.scale(b.face,1);
  if(fight.status==='won'){ctx.globalAlpha=.25;ctx.rotate(.6)}
  // Legs stay planted while the torso crouches and shoulders twist into the blow.
  const split=.73;
  for(let side=0;side<2;side++){const stride=side?p.step:-p.step;ctx.drawImage(atlas,a.x+side*a.w/2,a.y+a.h*split,a.w/2,a.h*(1-split),-width/2+side*width/2+stride*.35,-height*(1-split)-Math.max(0,stride)*.25,width/2,height*(1-split))}
  ctx.translate(0,p.crouch);ctx.translate(0,-45);ctx.rotate(p.lean);ctx.translate(0,45);
  function arm(off){const angle=off?p.off:p.arm,x=off?-43:43,y=-132;const hx=x-Math.sin(angle)*64,hy=y+Math.cos(angle)*64;
   ctx.save();ctx.translate(x,y);ctx.rotate(angle);part(off?3:1,-23,-13,46,93);ctx.restore();
   if(!off||fight.phase===2){ctx.save();ctx.translate(hx,hy);ctx.rotate(off?p.offBlade:p.blade);const len=fight.phase===1?132:105;part(2,-len*.18,-len*.88,len*.36,len);if(b.state==='strike'&&!paused){const m=ctx.getTransform(),sx=canvas.width/W,sy=canvas.height/H;const trail=bladeTrails[off?1:0];trail.push({x:(m.c*(-len*.88)+m.e)/sx,y:(m.d*(-len*.88)+m.f)/sy,hx:m.e/sx,hy:m.f/sy,time:fight.time});while(trail.length>8||trail.length&&fight.time-trail[0].time>.1)trail.shift()}ctx.restore();
    // The gauntlet overlaps the hilt so the sword stays visibly held.
    const gauntlet=art[(fight.phase-1)*4+(off?3:1)];ctx.drawImage(atlas,gauntlet.x,gauntlet.y+gauntlet.h*.8,gauntlet.w,gauntlet.h*.2,hx-16,hy-8,32,20);
   }
  }
  arm(true);ctx.drawImage(atlas,a.x,a.y,a.w,a.h*split,-width/2,-height,width,height*split);arm(false);ctx.restore();
  if(b.state==='strike'){
   for(const trail of bladeTrails){for(let i=1;i<trail.length;i++){const a=trail[i-1],z=trail[i];ctx.fillStyle=fight.phase===1?'#ff7f3670':'#dc72ff70';ctx.beginPath();ctx.moveTo(a.hx,a.hy);ctx.lineTo(a.x,a.y);ctx.lineTo(z.x,z.y);ctx.lineTo(z.hx,z.hy);ctx.closePath();ctx.fill();ctx.strokeStyle='#fff2ce';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(z.x,z.y);ctx.stroke()}}
  }else{bladeTrails[0]=[];bladeTrails[1]=[]}

 }
 function dangerZone(){const b=fight.boss;if(!['windup','strike'].includes(b.state))return;const z=fight.attackZone(),height=Math.min(z.height,floor),active=b.state==='strike',charge=active?1:Math.min(1,b.age/(fight.phase===1?.85:.65));
  const top=floor-height,w=z.right-z.left;ctx.save();
  const glow=ctx.createLinearGradient(0,top,0,floor+8);glow.addColorStop(0,active?'#ff605424':'#ff605410');glow.addColorStop(.65,active?'#f3374550':'#ef3d3e28');glow.addColorStop(1,active?'#ff463b99':'#ff594b66');
  ctx.fillStyle=glow;ctx.beginPath();ctx.roundRect(z.left,top,w,height+8,Math.min(10,height/4));ctx.fill();
  ctx.strokeStyle=active?'#ffb094':'#ff655bbb';ctx.lineWidth=active?2.5:1.5;ctx.stroke();
  ctx.shadowColor='#ff4938';ctx.shadowBlur=reduced.matches?0:12;ctx.strokeStyle='#ff8b73';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(z.left+5,floor+8);ctx.lineTo(z.left+5+(w-10)*charge,floor+8);ctx.stroke();ctx.shadowBlur=0;
  ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff1df';ctx.fillText(b.type==='slam'?'JUMP · GROUND WAVE':b.type==='rift'?'MOVE · LIGHTNING':b.type==='dash'?'DASH PATH':'SWORD RANGE',(z.left+z.right)/2,Math.max(175,top-12));ctx.restore();
 }
 function attackEffects(dt){for(const e of impacts){if(!paused)e.age+=dt;const t=e.age/.65;if(t>1)continue;ctx.save();ctx.globalAlpha=1-t;
  if(e.kind==='slam'){ctx.strokeStyle='#ff6639';ctx.lineWidth=12*(1-t)+2;ctx.beginPath();ctx.ellipse(e.x,floor,250*Math.min(1,t*2),18+25*t,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#ffe2a7';ctx.lineWidth=3;ctx.stroke();for(let i=-2;i<=2;i++){const x=e.x+i*85;ctx.fillStyle='#ffab54';ctx.fillRect(x,floor-55*(1-t),6,55*(1-t))}}
  else if(e.kind==='rift'){ctx.strokeStyle='#a452ff';ctx.lineWidth=23;ctx.beginPath();ctx.moveTo(e.x-20,0);ctx.lineTo(e.x+18,floor*.32);ctx.lineTo(e.x-24,floor*.54);ctx.lineTo(e.x+12,floor*.7);ctx.lineTo(e.x,floor);ctx.stroke();ctx.strokeStyle='#fff0f7';ctx.lineWidth=6;ctx.stroke();ctx.strokeStyle='#e488ff';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(e.x,floor,65+t*25,12+t*10,0,0,Math.PI*2);ctx.stroke()}
  ctx.restore();}impacts=impacts.filter(e=>e.age<.65);
 }
 function playerDraw(){const p=fight.player,moving=keys.has('a')||keys.has('d')||keys.has('arrowleft')||keys.has('arrowright');shadow(p.x,23);ctx.save();if(p.inv>0)ctx.globalAlpha=reduced.matches?.7:.65+.35*Math.cos(fight.time*35);
  const s=sprites[p.face<0?2:3],walk=moving?Math.sin(fight.time*18)*3:0,y=floor-p.z,t=p.slash>0?1-p.slash/.25:0,swing=p.slash>0?Math.sin(t*Math.PI):0;
  for(let i=0;i<2;i++)ctx.drawImage(s,i*10,25,10,7,p.x-20+i*20+(p.z?i*2-1:0),y-14+(p.z?0:(i?walk:-walk)),20,14);
  ctx.save();ctx.translate(p.x,y-15);ctx.rotate(p.face*(p.dodge>0?.3:swing*.17));ctx.drawImage(s,0,0,20,25,-20,-49+(moving?Math.abs(walk)*.35:0),40,50);ctx.restore();
  const angle=p.slash>0?-1.25+3.4*(t*t*(3-2*t)):.5;
  ctx.translate(p.x+p.face*(12+swing*6),y-32);ctx.scale(p.face,1);ctx.rotate(angle);
  // Sleeve and hand travel with the hilt; the wrist leads the blade through its arc.
  ctx.fillStyle='#25666b';ctx.fillRect(-7,0,12,13);ctx.fillStyle='#e7b080';ctx.fillRect(-5,-4,10,10);
  ctx.fillStyle='#e0faff';ctx.fillRect(-3,-49,6,44);ctx.fillStyle='#e9c47b';ctx.fillRect(-10,-8,20,4);ctx.fillStyle='#614c3b';ctx.fillRect(-3,-4,6,14);
  if(p.slash>0&&t>.22){ctx.strokeStyle='#d6fff1aa';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,49,-Math.PI/2-.55,-Math.PI/2);ctx.stroke()}ctx.restore();
 }
 function draw(dt){ctx.clearRect(0,0,W,H);ctx.imageSmoothingEnabled=false;const b=fight.boss;
  for(const scar of scars){ctx.strokeStyle='#18152c99';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(scar.x-40,floor+13);ctx.lineTo(scar.x+4,floor+22);ctx.lineTo(scar.x-12,floor+40);ctx.lineTo(scar.x+40,floor+56);ctx.stroke()}
  dangerZone();
  bossDraw();playerDraw();attackEffects(dt);for(const p of particles){if(!paused){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=500*dt}ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,5,5)}ctx.globalAlpha=1;particles=particles.filter(p=>p.life>0);
 }
 function loop(now){if(!running)return;if(work.hidden){leave();return}const dt=(now-previous)/1000;previous=now;if(!paused){const move=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);fight.tick(dt,move);events();if(fight.boss.state!=='intro'){$('#fightSplash').hidden=true;if(!musicStarted&&fight.status==='playing'){musicStarted=true;window.GameAudio?.boss()}}if(noticeTime>0){noticeTime-=dt;if(noticeTime<=0)$('#battleNotice').textContent=''}}draw(Math.min(dt,.04));hud();raf=requestAnimationFrame(loop)}
 function action(name){if(!running||paused)return;fight[name]();events()}
 window.closeBossFight=leave;$('#battleContact').onclick=()=>{if(window.travelTo)window.travelTo('contact',leave);else{leave();location.hash='contact'}};
 start.onclick=()=>window.JourneyProgress?.saved.completed.boss?window.travelTo('contact'):window.guardianScene?window.guardianScene('intro',begin):begin();$('#battleExit').onclick=leave;$('#battleReturn').onclick=leave;$('#battlePause').onclick=pause;$('#battleAgain').onclick=()=>{if(paused){paused=false;window.GameAudio?.resume();$('.battle-dialog').hidden=true;previous=performance.now();canvas.focus({preventScroll:true})}else begin()};$('#battleSound').onclick=()=>{sound=!sound;window.GameAudio?.bossSound(sound);$('#battleSound').textContent=sound?'Sound on':'Sound off';$('#battleSound').setAttribute('aria-pressed',sound)};
 canvas.onclick=()=>action('attack');
 window.addEventListener('keydown',e=>{if(!running)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();pause();return}if(e.target.closest('button'))return;const key=e.key.toLowerCase();if(['a','d','arrowleft','arrowright','w','arrowup','j','shift',' '].includes(key)){e.preventDefault();e.stopImmediatePropagation();if(paused)return;keys.add(key);if(!e.repeat){if(['w','arrowup',' '].includes(key))action('jump');if(key==='j')action('attack');if(key==='shift')action('dodge')}}},true);
 window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});window.addEventListener('resize',()=>{if(running){resize();pause()}});
 window.addEventListener('wheel',e=>{if(running)e.preventDefault()},{capture:true,passive:false});
 for(const b of layer.querySelectorAll('[data-move]')){b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.move==='1'?'d':'a')};b.onlostpointercapture=()=>keys.delete(b.dataset.move==='1'?'d':'a')}
 for(const b of layer.querySelectorAll('[data-action]'))b.onpointerdown=e=>{e.preventDefault();action(b.dataset.action)};
})();
