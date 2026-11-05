(() => {
 const opening=document.getElementById('opening'),next=document.getElementById('openingNext'),veil=document.getElementById('chapterVeil');
 let introStep=0,travelling=false;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 function dismiss(){opening.hidden=true;stage.inert=false}
 const resume=document.createElement('button');resume.id='resumeJourney';resume.hidden=true;resume.disabled=true;opening.append(resume);
 const savedDestination=window.JourneyProgress?.resume()||'';
 const savedLabel=savedDestination==='#contact'?'Contact':savedDestination.startsWith('#work')?'Work':savedDestination==='#home'?'the village':savedDestination==='#parkour'?'parkour':'the crystal game';
 resume.textContent='Resume at '+savedLabel;
 resume.addEventListener('click',async()=>{if(resume.disabled)return;resume.disabled=true;next.disabled=true;window.GameAudio?.unlock();if(savedDestination){dismiss();location.hash=savedDestination}else{opening.classList.add('leaving');await delay(reduced()?20:800);dismiss();keys=[];last=performance.now()}});

 if(location.hash){dismiss()}else{
  stage.inert=true;
  Promise.all([delay(2300),map.decode(),hero.decode()]).then(()=>{if(opening.hidden)return;next.disabled=false;next.textContent=window.JourneyProgress?.hasProgress?'Start a new journey':'Press to continue';resume.hidden=!window.JourneyProgress?.hasProgress;resume.disabled=false;next.focus({preventScroll:true})}).catch(()=>{next.disabled=false;next.textContent='Reload the sanctuary';next.onclick=()=>location.reload()});
 }
 next.addEventListener('click',async()=>{
  if(next.disabled)return;
  if(introStep===0&&window.JourneyProgress?.hasProgress){JourneyProgress.reset();x=830;y=900;held=-1;target=-1;taps=0;done.clear();keys=[];ending=0;fx=0;lastTap=0;el('quest').hidden=false;resume.hidden=true;}

  if(introStep===0){introStep=1;opening.classList.add('instructions');document.getElementById('openingTitle').textContent='Clear the mini-games to move through the portfolio.';opening.querySelector('.opening-name').textContent='YOUR JOURNEY STARTS HERE';next.textContent='Press to continue';return}
  next.disabled=true;opening.classList.add('leaving');await delay(reduced()?20:800);dismiss();keys=[];last=performance.now();
 });
 window.addEventListener('hashchange',()=>{if(location.hash&&!opening.hidden)dismiss()});
 window.travelTo=async(hash,before)=>{
  if(travelling)return;travelling=true;veil.hidden=false;await new Promise(requestAnimationFrame);veil.classList.add('covered');
  await delay(reduced()?20:390);before?.();location.hash=hash;
  await delay(reduced()?20:180);veil.classList.remove('covered');await delay(reduced()?20:400);veil.hidden=true;travelling=false;
 };
 // Reparent the existing adventurer at the well; never render a duplicate traveler.
 window.positionVillageHero=()=>{
  if(home.hidden)return;const pond=document.getElementById('pond'),gate=document.querySelector('#home .gate');
  if(gate.getBoundingClientRect().top<innerHeight*.72){if(roadHero.parentElement!==pond)pond.append(roadHero)}
  else if(roadHero.parentElement!==scenery){scenery.append(roadHero)}
 };
 window.addEventListener('scroll',window.positionVillageHero,{passive:true});window.addEventListener('resize',window.positionVillageHero);window.positionVillageHero();
 for(const side of ['left','right']){const vine=document.createElement('div');vine.className='frame-vine '+side;vine.setAttribute('aria-hidden','true');for(let i=0;i<24;i++){const leaf=document.createElement('i');leaf.style.setProperty('--leaf-y',(i*4.3)+'%');leaf.style.setProperty('--leaf-angle',(i%2?-35:55)+'deg');vine.append(leaf)}stage.append(vine)}
})();
