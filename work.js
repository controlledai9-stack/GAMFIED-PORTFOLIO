(() => {
 const page=document.getElementById('work'),canvas=document.getElementById('workScene'),ctx=canvas.getContext('2d');
 const chapters=[...page.querySelectorAll('.work-chapter')],links=[...page.querySelectorAll('.work-index a')];
 const total=133,frames=new Array(total),requested=new Set(),queue=[];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let loading=0,started=false,pending=false,lastFrame=-1,targetFrame=0;
 let transition=0,animating=false,lastWheel=-Infinity;
 function anchors(){
  const max=Math.max(0,page.scrollHeight-innerHeight);
  return [0,...chapters.map(s=>Math.min(max,Math.max(0,s.offsetTop+s.offsetHeight/2-innerHeight/2))),max];
 }
 function nearestAnchor(){
  const points=anchors();
  return points.reduce((best,y,i)=>Math.abs(y-scrollY)<Math.abs(points[best]-scrollY)?i:best,0);
 }
 function goToAnchor(index,instant=false){
  cancelAnimationFrame(transition);
  const points=anchors(),next=Math.max(0,Math.min(points.length-1,index));
  const start=scrollY,end=points[next],startedAt=performance.now();
  animating=false;
  if(instant||reduced.matches||Math.abs(end-start)<1){window.scrollTo(0,end);schedule();return}
  animating=true;
  const duration=800;
  function step(now){
   if(page.hidden){animating=false;return}
   const t=Math.min(1,(now-startedAt)/duration),ease=t*t*(3-2*t);
   window.scrollTo(0,start+(end-start)*ease);
   if(t<1)transition=requestAnimationFrame(step);
   else{animating=false;schedule()}
  }
  transition=requestAnimationFrame(step);
 }
 // One wheel/trackpad gesture advances one stop. Ignore its momentum tail.
 window.addEventListener('wheel',e=>{
  if(document.getElementById('projectPreview')?.open||page.hidden||page.dataset.fighting==='true'||e.ctrlKey||e.metaKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||Math.abs(e.deltaY)<1)return;
  // On short screens retain natural scrolling when a project is taller than the view.
  const current=nearestAnchor(),copy=chapters[current-1]?.querySelector('.work-copy');
  if(copy&&copy.offsetHeight>innerHeight-100)return;
  e.preventDefault();
  const now=performance.now(),continuing=now-lastWheel<200;lastWheel=now;
  if(animating||continuing)return;
  goToAnchor(current+Math.sign(e.deltaY));
 },{passive:false});
 window.addEventListener('keydown',e=>{
  if(document.getElementById('projectPreview')?.open||page.hidden||page.dataset.fighting==='true'||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,button,a,[contenteditable="true"]'))return;
  const direction=({ArrowDown:1,PageDown:1,ArrowUp:-1,PageUp:-1})[e.key]||(e.code==='Space'?(e.shiftKey?-1:1):0);
  if(!direction&&e.key!=='Home'&&e.key!=='End')return;
  e.preventDefault();if(e.repeat||animating)return;
  goToAnchor(e.key==='Home'?0:e.key==='End'?7:nearestAnchor()+direction);
 });
 window.focusWorkArena=()=>goToAnchor(7,true);
 function loadFrames(){
  if(started)return;started=true;
  // First/last and reading stops arrive first; the rest fill in progressively.
  for(const n of [0,132,12,28,48,66,86,105,...Array.from({length:total},(_,i)=>i)])if(!requested.has(n)){requested.add(n);queue.push(n)}
  pump();
 }
 function pump(){
  while(loading<4&&queue.length){
   const n=queue.shift(),img=new Image();loading++;
   img.onload=()=>{frames[n]=img;loading--;schedule();pump()};
   img.onerror=()=>{loading--;pump()};
   img.src=`work-frames/frame-${String(n+1).padStart(3,'0')}.webp`;
  }
 }
 function sizeCanvas(){
  const dpr=Math.min(devicePixelRatio||1,1.5),w=Math.round(innerWidth*dpr),h=Math.round(innerHeight*dpr);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;lastFrame=-1}
 }
 function draw(n){
  let available=n;
  if(!frames[available]){
   for(let d=1;d<total;d++){if(frames[n-d]){available=n-d;break}if(frames[n+d]){available=n+d;break}}
  }
  const img=frames[available];if(!img||lastFrame===available)return;
  lastFrame=available;
  const scale=Math.max(canvas.width/img.width,canvas.height/img.height),w=img.width*scale,h=img.height*scale;
  ctx.drawImage(img,(canvas.width-w)/2,(canvas.height-h)/2,w,h);
 }
 function update(){
  pending=false;if(page.hidden)return;
  sizeCanvas();
  const max=Math.max(1,page.scrollHeight-innerHeight),y=Math.max(0,Math.min(max,scrollY));
  const stops=[[0,0],...chapters.map((s,i)=>[s.offsetTop+s.offsetHeight/2-innerHeight/2,[.07,.19,.32,.45,.59,.73][i]]),[max,1]];
  let progress=1;
  for(let i=1;i<stops.length;i++)if(y<=stops[i][0]){
   const [from,a]=stops[i-1],[to,b]=stops[i];progress=a+(b-a)*Math.max(0,(y-from)/(to-from));break;
  }
  targetFrame=Math.round(progress*(total-1));
  draw(reduced.matches?(progress>.84?132:0):targetFrame);
  page.querySelector('.work-progress').style.width=(y/max*100)+'%';
  let nearest=-1,distance=Infinity;
  chapters.forEach((s,i)=>{const d=Math.abs(s.getBoundingClientRect().top+s.offsetHeight/2-innerHeight/2);if(d<distance){distance=d;nearest=i}});
  links.forEach((a,i)=>a.setAttribute('aria-current',String(i===nearest&&distance<innerHeight*.6)));
 }
 function schedule(){if(!pending&&!page.hidden){pending=true;requestAnimationFrame(update)}}
 function traveler(){if(sprites[1]?.width===20)document.getElementById('workTraveler').src=sprites[1].toDataURL()}
 hero.addEventListener('load',traveler);traveler();
 window.openWork=()=>{const contact=document.getElementById('contact');if(contact){contact.hidden=true;contact.inert=true}
  const entering=page.hidden;
  cancelAnimationFrame(transition);animating=false;lastWheel=-Infinity;
  active=false;directions=[];villageDirection=0;
  stage.hidden=true;course.hidden=true;home.hidden=true;home.inert=true;page.hidden=false;page.inert=false;
  loadFrames();traveler();
  const slug=location.hash.split('/')[1],target=slug&&document.getElementById('work-'+slug);
  if(target&&target.classList.contains('work-chapter'))goToAnchor(chapters.indexOf(target)+1,true);
  else if(entering||location.hash==='#work'){window.scrollTo(0,0);document.getElementById('workTitle').focus({preventScroll:true})}
  schedule();
 };
 page.addEventListener('click',e=>{
  const link=e.target.closest('[data-work-stop],[data-work-top]');if(!link)return;
  e.preventDefault();
  const slug=link.dataset.workStop;
  history.replaceState(null,'',slug?'#work/'+slug:'#work');
  goToAnchor(slug?chapters.indexOf(document.getElementById('work-'+slug))+1:0);
 });
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);reduced.addEventListener('change',schedule);
 route();
})();
