// Angles are in radians. Each pose controls torso, shoulders, wrists, and stance.
(function(root){
 const idle={lean:0,crouch:0,arm:-.2,off:.2,blade:.3,offBlade:-.3,step:0};
 const poses={
  sweep:[{lean:-.16,crouch:5,arm:2.5,off:.4,blade:-1.1,step:-6},{lean:.28,crouch:13,arm:-1.5,off:-.5,blade:2.4,step:18}],
  slam:[{lean:-.12,crouch:-9,arm:3,off:-2.7,blade:-.25,step:-4},{lean:.32,crouch:26,arm:-.9,off:-1,blade:2.8,step:12}],
  dash:[{lean:-.2,crouch:24,arm:.7,off:.8,blade:-1,step:-12},{lean:.38,crouch:18,arm:-1.45,off:1.1,blade:1.57,step:24}],
  combo:[{lean:-.18,crouch:12,arm:2.1,off:-2,blade:-1,offBlade:1,step:-7},{lean:.25,crouch:14,arm:-1.6,off:.8,blade:2,offBlade:-1,step:16}],
  rift:[{lean:-.1,crouch:-5,arm:2.5,off:-2.5,blade:-.4,offBlade:.4,step:0},{lean:.15,crouch:20,arm:-.65,off:.65,blade:2.8,offBlade:-2.8,step:8}]
 };
 function mix(a,b,t){t=Math.max(0,Math.min(1,t));t=t*t*(3-2*t);const p={};for(const k of Object.keys(idle))p[k]=(a[k]??idle[k])+((b[k]??idle[k])-(a[k]??idle[k]))*t;return p}
 function pose(b,phase,time){const pair=poses[b.type]||poses.sweep,windup=phase===1?.85:.65;
  if(b.state==='windup')return mix(idle,pair[0],b.age/windup);
  if(b.state==='strike'){
   if(b.type==='combo'&&b.age>.36){const back={...pair[0],arm:-.9,off:2.4,blade:1.4,offBlade:-1.2};const hit={...pair[1],lean:-.22,arm:.7,off:-1.7,blade:-.8,offBlade:2.3};return b.age<.46?mix(pair[1],back,(b.age-.36)/.10):mix(back,hit,(b.age-.46)/.15)}
   return mix(pair[0],pair[1],b.age/({slam:.28,rift:.30,dash:.12}[b.type]||.24));
  }
  if(b.state==='recover'){const end=b.type==='combo'?{...pair[1],lean:-.22,arm:.7,off:-1.7,blade:-.8,offBlade:2.3}:pair[1];return mix(end,idle,b.age/.75)}
  const p={...idle};if(b.state==='chase'){p.step=Math.sin(time*11)*7;p.arm+=Math.sin(time*11)*.12;p.off-=Math.sin(time*11)*.12;p.crouch=Math.abs(Math.sin(time*11))*2}else p.crouch=Math.sin(time*2)*1.5;
  if(phase===2&&b.state==='chase'){p.blade+=Math.sin(time*5)*.07;p.offBlade-=Math.sin(time*5)*.07}
  if(b.state==='transform'){p.arm=2;p.off=-2;p.blade=-.8;p.offBlade=.8;p.crouch=-7}return p;
 }
 if(typeof module!=='undefined')module.exports={pose};else root.WardenAnimation={pose};
})(globalThis);
