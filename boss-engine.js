/* Deterministic combat rules, shared by the browser and simulation checks. */
(function(root){
 class WardenFight {
  constructor(width=1200){this.width=width;this.time=0;this.status='playing';this.phase=1;this.events=[];this.player={x:width*.28,z:0,vz:0,hp:90,face:1,inv:0,cool:0,dodge:0,dodgeCool:0,slash:0};this.boss={x:width*.72,hp:540,state:'intro',age:0,face:-1,cycle:0,hit:false};}
  emit(type,data={}){this.events.push({type,...data})}
  attack(){const p=this.player,b=this.boss;if(this.status!=='playing'||p.cool>0||b.state==='intro'||b.state==='transform')return;p.cool=.46;p.slash=.25;this.emit('sword');if(Math.abs(p.x-b.x)<145&&p.z<150&&(b.x-p.x)*p.face>-25){const damage=b.state==='recover'?16:5;b.hp=Math.max(0,b.hp-damage);this.emit('hit',{x:b.x,damage});if(b.hp===0){this.status='won';this.emit('won')}else if(b.hp<=270&&this.phase===1){this.phase=2;this.enter('transform');this.emit('transform')}}}
  jump(){const p=this.player;if(this.status==='playing'&&p.z===0){p.vz=560;this.emit('jump')}}
  dodge(){const p=this.player;if(this.status==='playing'&&p.dodgeCool===0){p.dodge=.25;p.inv=.32;p.dodgeCool=1.2;this.emit('dodge')}}
  enter(state){this.boss.state=state;this.boss.age=0;this.boss.hit=false;this.boss.second=false}
  hurt(amount){const p=this.player;if(p.inv>0)return;p.hp=Math.max(0,p.hp-amount);p.inv=1;this.emit('hurt');if(!p.hp){this.status='lost';this.emit('lost',{reason:'The guardian held the gate.'})}}
  strike(second=false){const b=this.boss,p=this.player;this.emit('impact',{x:b.type==='rift'?b.target:b.x,kind:b.type});let hit=false;
   if(b.type==='rift')hit=Math.abs(p.x-b.target)<65;
   else if(b.type==='slam')hit=Math.abs(p.x-b.x)<250&&p.z<48;
   else hit=Math.abs(p.x-b.x)<(b.type==='dash'?125:165)&&p.z<115&&(p.x-b.x)*b.face>-32;
   if(hit)this.hurt(this.phase===1?13:11.375);
  }
  attackZone(){const b=this.boss;let left,right,height=115;
   if(b.type==='slam'){left=b.x-250;right=b.x+250;height=48}
   else if(b.type==='rift'){left=b.target-65;right=b.target+65;height=10000}
   else if(b.type==='dash'){const origin=b.origin??b.x,end=Math.max(65,Math.min(this.width-65,origin+b.face*672*.48));left=Math.min(origin,end)-125;right=Math.max(origin,end)+125}
   else{left=b.x+(b.face===1?-32:-165);right=b.x+(b.face===1?165:32)}
   return {left:Math.max(0,left),right:Math.min(this.width,right),height};
  }
  tick(dt,move=0){if(this.status!=='playing')return;this.time+=dt;dt=Math.min(dt,.04);const p=this.player,b=this.boss;
   if(this.time>=120){this.status='lost';this.emit('lost',{reason:'The storm closed the gate. Try again.'});return}
   for(const key of ['inv','cool','dodge','dodgeCool','slash'])p[key]=Math.max(0,p[key]-dt);
   if(move)p.face=Math.sign(move);p.x=Math.max(35,Math.min(this.width-35,p.x+(p.dodge>0?p.face*650:move*245)*dt));
   p.vz-=1450*dt;p.z=Math.max(0,p.z+p.vz*dt);if(p.z===0)p.vz=0;
   b.age+=dt;
   if(b.state==='intro'||b.state==='transform'){if(b.age>(b.state==='intro'?1.4:1.8))this.enter('chase');return}
   if(b.state==='chase'){
    b.face=p.x<b.x?-1:1;const distance=Math.abs(p.x-b.x);if(distance>112)b.x+=b.face*(this.phase===1?125.4:186)*dt;
    const patterns=this.phase===1?['sweep','slam','dash']:['combo','rift','dash'];
    const nextAttack=patterns[b.cycle%3],range={sweep:145,combo:145,slam:220,dash:300,rift:420}[nextAttack];
    if(b.age>(this.phase===1?1.15:.8)&&distance<=range){
     b.type=nextAttack;b.cycle++;b.target=p.x;b.origin=b.x;b.face=p.x<b.x?-1:1;this.enter('windup');this.emit('warning',{kind:b.type});
    }
   }else if(b.state==='windup'){
    if(b.age>(this.phase===1?.85:.65))this.enter('strike');
   }else if(b.state==='strike'){
    if(b.type==='dash')b.x=Math.max(65,Math.min(this.width-65,b.x+b.face*672*dt));
    if(!b.hit&&b.age>({sweep:.22,slam:.26,dash:.12,combo:.20,rift:.30}[b.type]||.22)){b.hit=true;this.strike()}
    if(b.type==='combo'&&!b.second&&b.age>.58){b.second=true;this.strike(true)}
    if(b.type==='dash'&&b.age>.12&&Math.abs(p.x-b.x)<105&&p.z<115)this.hurt(11.375);
    if(b.age>({sweep:.52,slam:.62,dash:.48,combo:.86,rift:.65}[b.type]))this.enter('recover');
   }else if(b.state==='recover'&&b.age>(this.phase===1?1.5:1.25))this.enter('chase');
  }
 }
 if(typeof module!=='undefined')module.exports=WardenFight;else root.WardenFight=WardenFight;
})(globalThis);
