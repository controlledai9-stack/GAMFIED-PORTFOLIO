(() => {
 const progress=window.JourneyProgress;
 const saved=progress.saved.crystals;
 if(saved&&!progress.saved.completed.crystals){done=new Set(saved.done);held=saved.held;if(walkable(saved.x,saved.y)){x=saved.x;y=saved.y}target=-1;taps=0;last=performance.now()}
 function snapshot(){if(!stage.hidden&&!stage.inert&&document.getElementById('opening').hidden&&!ending)progress.crystals({x,y,held,done:[...done]})}
 setInterval(snapshot,1000);window.addEventListener('pagehide',()=>{snapshot();progress.visit(location.hash)});document.addEventListener('visibilitychange',()=>{if(document.hidden)snapshot()});
 window.addEventListener('hashchange',()=>progress.visit(location.hash));progress.visit(location.hash);
 function addSkip(parent,id,destination,cleanup){const button=document.createElement('button');button.type='button';button.className='skip-game';button.id='skip-'+id;button.textContent='Skip game →';button.setAttribute('aria-label','Skip '+({crystals:'crystal collection',parkour:'parkour',boss:'boss fight'})[id]+' and continue');button.onclick=()=>{if(button.disabled)return;button.disabled=true;progress.complete(id,'skipped');cleanup();window.GameAudio?.stop();window.travelTo(destination).finally(()=>button.disabled=false)};parent.append(button)}
 addSkip(stage,'crystals','home',()=>{keys=[];target=-1;stage.inert=true});
 addSkip(course,'parkour','work',()=>{active=false;directions=[]});
 addSkip(document.querySelector('#bossLayer .boss-actions'),'boss','contact',()=>window.closeBossFight());
})();
