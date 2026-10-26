// Balken-Tool: Querkraft und Durchbiegung gegen Formeln und eine unabhängige FE-Rechnung.
// Start: node _tests/balken-querkraft-durchbiegung.test.js   (optional Pfad zur HTML-Datei als Argument)
const fs=require('fs');
const path=require('path');
const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','public','tools','balken','index.html'),'utf8');
const solve=new Function(html.slice(html.indexOf('/*CALC-START*/'),html.indexOf('/*CALC-END*/'))+';return solve;')();
let fails=0;
const chk=(n,g,e,tol=1e-6)=>{const ok=Math.abs(g-e)<=tol*Math.max(1e-9,Math.abs(e))||Math.abs(g-e)<1e-12;if(!ok)fails++;console.log((ok?'OK  ':'FAIL')+' '+n+': '+g.toPrecision(7)+' (soll '+e.toPrecision(7)+')');};
function fe(m,EI){
  const n=m.spans.length,s=[m.a];for(const sp of m.spans)s.push(s[s.length-1]+sp.L);const tot=s[n]+m.b;
  let xs=new Set([0,tot,...s,...m.points.map(p=>p.x)]);for(let i=0;i<=1200;i++)xs.add(tot*i/1200);
  xs=[...xs].filter(x=>x>=0&&x<=tot).sort((a,b)=>a-b).filter((x,i,a)=>i===0||x-a[i-1]>1e-9);
  const N=xs.length,dof=2*N,K=Array.from({length:dof},()=>new Float64Array(dof)),F=new Float64Array(dof);
  const q=x=>{if(x<m.a)return m.qa;if(x>s[n])return m.qb;for(let i=0;i<n;i++)if(x>=s[i]&&x<=s[i+1])return m.spans[i].q;return 0;};
  for(let e=0;e<N-1;e++){const L=xs[e+1]-xs[e],k=[[12,6*L,-12,6*L],[6*L,4*L*L,-6*L,2*L*L],[-12,-6*L,12,-6*L],[6*L,2*L*L,-6*L,4*L*L]].map(r=>r.map(v=>v*EI/L**3));
    const w=q((xs[e]+xs[e+1])/2),f=[w*L/2,w*L*L/12,w*L/2,-w*L*L/12],id=[2*e,2*e+1,2*e+2,2*e+3]; // w positiv nach unten
    for(let i=0;i<4;i++){F[id[i]]+=f[i];for(let j=0;j<4;j++)K[id[i]][id[j]]+=k[i][j];}}
  for(const p of m.points){const i=xs.findIndex(x=>Math.abs(x-p.x)<1e-9);F[2*i]+=p.P;}
  const sup=s.map(x=>xs.findIndex(v=>Math.abs(v-x)<1e-9)),fixed=new Set(sup.map(i=>2*i));
  const free=[...Array(dof).keys()].filter(i=>!fixed.has(i));
  const A=free.map(i=>free.map(j=>K[i][j])),b=free.map(i=>F[i]);
  for(let c=0;c<A.length;c++){let p=c;for(let r=c+1;r<A.length;r++)if(Math.abs(A[r][c])>Math.abs(A[p][c]))p=r;[A[c],A[p]]=[A[p],A[c]];[b[c],b[p]]=[b[p],b[c]];
    for(let r=c+1;r<A.length;r++){const f=A[r][c]/A[c][c];if(!f)continue;for(let k=c;k<A.length;k++)A[r][k]-=f*A[c][k];b[r]-=f*b[c];}}
  const u=new Float64Array(dof),x=new Array(A.length);for(let r=A.length-1;r>=0;r--){let t=b[r];for(let k=r+1;k<A.length;k++)t-=A[r][k]*x[k];x[r]=t/A[r][r];}
  free.forEach((d,i)=>u[d]=x[i]);
  const R=sup.map(i=>{let r=-F[2*i];for(let j=0;j<dof;j++)r+=K[2*i][j]*u[j];return -r;}); // Reaktion nach oben positiv
  return {xs,w:xs.map((_,i)=>u[2*i]),R};
}
const EI=5000;
// Formeln
let r=solve({a:0,b:0,qa:0,qb:0,spans:[{L:6,q:10}],points:[],EI});
chk('Einfeld Gleichlast w_max = 5qL⁴/384EI',r.defl.max.v,5*10*6**4/(384*EI)); chk('  Lage L/2',r.defl.max.x,3,1e-5);
chk('Einfeld Gleichlast Q_A = qL/2',r.QR[0],30); chk('Einfeld Gleichlast Q_B = −qL/2',r.QL[1],-30);
r=solve({a:0,b:2,qa:0,qb:0,spans:[{L:5,q:0}],points:[{x:7,P:10}],EI});
// Kragarm am Einfeldträger: w_tip = P a² (L + a)/(3EI)
chk('Kragarm Spitze w = P·b²·(L+b)/(3EI)',r.defl.tipR,10*4*(5+2)/(3*EI));
chk('Kragarm Q rechts von B = P',r.QR[1],10);
r=solve({a:0,b:0,qa:0,qb:0,spans:[{L:5,q:8},{L:5,q:8}],points:[],EI});
chk('Zweifeld Gleichlast max w = 0.005416·qL⁴/EI',r.defl.max.v,0.0054159*8*5**4/EI,1e-3);
chk('Zweifeld Innenauflager w = 0',r.defl.res+1,1,1e-9);
chk('Zweifeld Q links B = −5qL/8',r.QL[1],-5*8*5/8); chk('Zweifeld Q rechts B = +5qL/8',r.QR[1],5*8*5/8);
chk('Zweifeld Q_max = 5qL/8',r.Qmax.v,25); chk('Zweifeld Q_min = −5qL/8',r.Qmin.v,-25);
// FE-Vergleich
const cases=[
 {a:1.2,qa:6,b:0,qb:0,spans:[{L:5,q:6},{L:4,q:6},{L:5,q:6}],points:[{x:8.2,P:25},{x:0,P:10}]},
 {a:1.5,qa:5,b:1,qb:0,spans:[{L:5,q:2}],points:[{x:4,P:20},{x:7.5,P:15},{x:5.5,P:8}]},
 {a:0.8,qa:3,b:2.2,qb:4,spans:[{L:3.1,q:0},{L:7.4,q:9},{L:2.3,q:1.5},{L:5.6,q:0}],points:[{x:2.0,P:12},{x:11.3,P:40},{x:18.0,P:7},{x:21.4,P:5}]},
];
cases.forEach((m,c)=>{
  const a=solve({...m,EI}), b=fe(m,EI);
  let maxErr=0,maxW=0; b.xs.forEach((x,i)=>{maxErr=Math.max(maxErr,Math.abs(a.defl.W(x)-b.w[i]));maxW=Math.max(maxW,Math.abs(b.w[i]));});
  chk('Fall '+(c+1)+' w(x) überall vs FE (rel. Fehler < 1e-5)',maxErr/maxW+1,1,1e-5);
  let feMax=-Infinity,feMin=Infinity; b.w.forEach(v=>{feMax=Math.max(feMax,v);feMin=Math.min(feMin,v);});
  chk('Fall '+(c+1)+' w_max vs FE',a.defl.max.v,feMax,1e-4); chk('Fall '+(c+1)+' w_min vs FE',a.defl.min.v,feMin,1e-4);
  // Querkraft: Sprung an jedem Auflager = Auflagerkraft
  a.R.forEach((R,j)=>chk('Fall '+(c+1)+' Q-Sprung '+String.fromCharCode(65+j)+' = R',a.QR[j]-a.QL[j],R+(m.points.filter(p=>Math.abs(p.x-a.s[j])<1e-9).reduce((s,p)=>s-p.P,0)),1e-6));
  chk('Fall '+(c+1)+' R_A vs FE',a.R[0],b.R[0],1e-4);
});
console.log(fails?fails+' FEHLER':'Alle Tests bestanden');
process.exitCode=fails?1:0;
