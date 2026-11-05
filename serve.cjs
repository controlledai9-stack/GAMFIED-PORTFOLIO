const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.wav':'audio/wav','.mp3':'audio/mpeg','.pdf':'application/pdf'};
http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname;
 const file=name==='/'?'index.html':/^\/(game\.js|progress-state\.js|journey-progress\.js|portfolio-details\.js|portfolio-details\.css|project-captures\.js|aarya-resume\.pdf|project-shots\/[a-z-]+\.png|work\.js|work\.css|bruh\.mp3|boss-theme\.mp3|adventure-theme\.mp3|platform-oof\.mp3|bro\.wav|fight-call\.wav|sanctuary-music\.js|guardian-scene\.js|guardian-scene\.css|journey\.css|journey\.js|contact\.css|contact\.js|boss\.js|boss-engine\.js|boss\.css|boss-atlas\.png|boss-rig\.png|boss-animation\.js|work-frames\/frame-\d{3}\.webp)$/.test(name)?name.slice(1):null;
 if(!file){res.writeHead(404);return res.end('Not found');}
 const target=path.join(__dirname,file);
 if(!fs.existsSync(target)){res.writeHead(404);return res.end('Not found');}
 res.setHeader('Content-Type',types[path.extname(file)]);
 res.setHeader('Cache-Control',file.endsWith('.webp')?'public, max-age=86400':'no-cache');
 fs.createReadStream(target).pipe(res);
}).listen(4180,'127.0.0.1',()=>console.log('Local portfolio: http://127.0.0.1:4180/#work'));
