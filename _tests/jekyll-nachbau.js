// Grobe Jekyll-Simulation für lokale Tests: Front Matter, defaults, Layouts, Includes und die verwendeten Filter.
// Start: node _tests/jekyll-nachbau.js <Quellordner> <Zielordner>   (z. B. von _tests aus: npm run build)
// Grenzen: Markdown nur sehr einfach (Absätze, Überschriften), {% seo %} nur als Platzhalter, keine Plugins.
// Massgebend bleibt der echte Build auf GitHub.
const fs=require('fs'),path=require('path'),yaml=require('js-yaml');const {Liquid}=require('liquidjs');
const SRC=process.argv[2], OUT=process.argv[3];
const cfg=yaml.load(fs.readFileSync(path.join(SRC,'_config.yml'),'utf8'));
const data={i18n:yaml.load(fs.readFileSync(path.join(SRC,'_data/i18n.yml'),'utf8')),tools:yaml.load(fs.readFileSync(path.join(SRC,'_data/tools.yml'),'utf8'))};
const liquid=new Liquid({root:[path.join(SRC,'_includes')],extname:'',jekyllInclude:true,dynamicPartials:false});
liquid.registerFilter('absolute_url',u=>cfg.url+u);liquid.registerFilter('relative_url',u=>u);
liquid.registerFilter('xml_escape',s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'));
liquid.registerFilter('number_of_words',s=>String(s).trim().split(/\s+/).filter(Boolean).length);liquid.registerFilter('jsonify',v=>JSON.stringify(v));liquid.registerFilter('date_to_xmlschema',d=>new Date(d).toISOString());
liquid.registerTag('seo',{parse(){},render(ctx){const p=ctx.getSync(['page']);return `<title>${p.title||cfg.title}</title><meta property="og:locale" content="${p.locale}"><meta name="description" content="${p.description||cfg.description}">`}});
function fm(f){const s=fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');const m=s.match(/^---\n([\s\S]*?)---\n?/);return m?{fm:yaml.load(m[1])||{},body:s.slice(m[0].length)}:null}
function defaults(rel,type){let v={};for(const d of cfg.defaults){const p=d.scope.path||'';if(d.scope.type&&d.scope.type!==type)continue;if(p===''||rel===p||rel.startsWith(p+'/'))Object.assign(v,d.values)}return v}
const posts=[],pages=[];
function walk(dir){for(const e of fs.readdirSync(path.join(SRC,dir),{withFileTypes:true})){const rel=dir?dir+'/'+e.name:e.name;if(e.name.startsWith('.')||(e.name.startsWith('_')&&e.name!=='_posts')||['node_modules','public','dist','src'].includes(e.name))continue;if(e.isDirectory()){walk(rel);continue}
 const r=fm(path.join(SRC,rel));if(!r)continue;
 if(rel.startsWith('_posts/')){const b=path.basename(rel,'.md');const m=b.match(/^(\d{4}-\d{2}-\d{2})-(.*)$/);const d=defaults(rel,'posts');const pg={...d,...r.fm,date:new Date(m[1]+'T12:00:00'),slug:m[2],collection:'posts',body:r.body,rel};pg.url=(pg.permalink||cfg.permalink).replace(':title',m[2]);posts.push(pg)}
 else{const d=defaults(rel,'pages');const pg={...d,...r.fm,body:r.body,rel};pg.url=pg.permalink||('/'+rel.replace(/index\.html$/,''));pages.push(pg)}}}
walk('');posts.sort((a,b)=>b.date-a.date);
const site={...cfg,data,posts,pages,time:new Date()};
const md=s=>s.split(/\n\n+/).map(p=>p.startsWith('#')?`<h2>${p.replace(/^#+\s*/,'')}</h2>`:`<p>${p}</p>`).join('\n');
(async()=>{
 for(const p of posts){p.content=md(await liquid.parseAndRender(p.body,{site,page:p}))}
 for(const p of [...posts,...pages]){let html=p.collection?p.content:await liquid.parseAndRender(p.body,{site,page:p});let lay=p.layout;
  while(lay&&lay!=='null'){const L=fm(path.join(SRC,'_layouts',lay+'.html'))||{fm:{},body:fs.readFileSync(path.join(SRC,'_layouts',lay+'.html'),'utf8')};html=await liquid.parseAndRender(L.body,{site,page:p,content:html});lay=L.fm.layout}
  let out=path.join(OUT,p.url.endsWith('/')?p.url+'index.html':p.url);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,html);console.log(p.url,'lang='+p.lang,'ref='+p.ref)}
 for(const f of ['style.css','favicon.svg','images/profil.jpg','images/projekte/qr-tool.png','images/projekte/weather-bot.jpg']){const o=path.join(OUT,f);fs.mkdirSync(path.dirname(o),{recursive:true});fs.copyFileSync(path.join(SRC,'public',f),o)}
})().catch(e=>{console.error(e);process.exit(1)});
