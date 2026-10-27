// Balken-Tool: Stützmomente, Feldmomente und Auflagerkräfte gegen Tabellenwerte und eine unabhängige FE-Rechnung.
// Start: node _tests/balken-momente.test.js   (optional Pfad zur HTML-Datei als Argument)
const fs=require('fs');
const path=require('path');
const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','public','tools','balken','index.html'),'utf8');
const code=html.slice(html.indexOf('/*CALC-START*/'),html.indexOf('/*CALC-END*/'));
const solve=new Function(code+';return solve;')();
let fails=0;
const chk=(name,got,exp,tol=1e-6)=>{const ok=Math.abs(got-exp)<=tol*Math.max(1,Math.abs(exp));if(!ok)fails++;console.log((ok?'OK  ':'FAIL')+' '+name+': '+got.toFixed(5)+' (soll '+exp.toFixed(5)+')');};

// FE: Knoten an allen Auflagern, Lasten, Abschnittsgrenzen + feine Teilung
function fe(m){
  const n=m.spans.length,s=[m.a];for(const sp of m.spans)s.push(s[s.length-1]+sp.L);const tot=s[n]+m.b;
  let xs=new Set([0,tot,...s,...m.points.map(p=>p.x)]);for(let i=0;i<=2000;i++)xs.add(tot*i/2000);
  xs=[...xs].filter(x=>x>=0&&x<=tot).sort((a,b)=>a-b).filter((x,i,a)=>i===0||x-a[i-1]>1e-9);
  const N=xs.length,dof=2*N,K=Array.from({length:dof},()=>new Float64Array(dof)),F=new Float64Array(dof);
  const q=x=>{if(x<m.a)return m.qa;if(x>s[n])return m.qb;for(let i=0;i<n;i++)if(x>=s[i]&&x<=s[i+1])return m.spans[i].q;return 0;};
  for(let e=0;e<N-1;e++){const L=xs[e+1]-xs[e],k=[[12,6*L,-12,6*L],[6*L,4*L*L,-6*L,2*L*L],[-12,-6*L,12,-6*L],[6*L,2*L*L,-6*L,4*L*L]].map(r=>r.map(v=>v/L**3));
    const w=q((xs[e]+xs[e+1])/2),f=[-w*L/2,-w*L*L/12,-w*L/2,w*L*L/12],id=[2*e,2*e+1,2*e+2,2*e+3];
    for(let i=0;i<4;i++){F[id[i]]+=f[i];for(let j=0;j<4;j++)K[id[i]][id[j]]+=k[i][j];}}
  for(const p of m.points){const i=xs.findIndex(x=>Math.abs(x-p.x)<1e-9);F[2*i]-=p.P;}
  const sup=s.map(x=>xs.findIndex(v=>Math.abs(v-x)<1e-9)),fixed=new Set(sup.map(i=>2*i));
  const free=[...Array(dof).keys()].filter(i=>!fixed.has(i));
  const A=free.map(i=>free.map(j=>K[i][j])),b=free.map(i=>F[i]);
  for(let c=0;c<A.length;c++){let p=c;for(let r=c+1;r<A.length;r++)if(Math.abs(A[r][c])>Math.abs(A[p][c]))p=r;[A[c],A[p]]=[A[p],A[c]];[b[c],b[p]]=[b[p],b[c]];
    for(let r=c+1;r<A.length;r++){const f=A[r][c]/A[c][c];if(!f)continue;for(let k=c;k<A.length;k++)A[r][k]-=f*A[c][k];b[r]-=f*b[c];}}
  const u=new Float64Array(dof),x=new Array(A.length);for(let r=A.length-1;r>=0;r--){let t=b[r];for(let k=r+1;k<A.length;k++)t-=A[r][k]*x[k];x[r]=t/A[r][r];}
  free.forEach((d,i)=>u[d]=x[i]);
  // Reaktionen
  const R=sup.map(i=>{let r=-F[2*i];for(let j=0;j<dof;j++)r+=K[2*i][j]*u[j];return r;});
  // Stützmomente: Element rechts vom Knoten (bzw. links am rechten Ende), Moment = EI*w'' am Knoten
  const Msup=sup.map(i=>{const e=i<N-1?i:i-1,L=xs[e+1]-xs[e],ue=[u[2*e],u[2*e+1],u[2*e+2],u[2*e+3]],xi=i<N-1?0:1;
    const B=[(-6+12*xi)/L**2,(-4+6*xi)/L,(6-12*xi)/L**2,(-2+6*xi)/L];let M=B.reduce((a,v,k)=>a+v*ue[k],0);
    const w=q(xs[e]+L/2);M+= i<N-1? -w*L*L/12 : -w*L*L/12;return -(-M);});
  return {R};
}
const qL2=(q,L)=>q*L*L;
// 1) Tabellenwerte
let r=solve({a:0,b:0,qa:0,qb:0,spans:[{L:6,q:10},{L:6,q:10}],points:[]});
chk('Zweifeld Gleichlast M_B',r.Ms[1],-qL2(10,6)/8); chk('Zweifeld max M_F',r.Mpos.v,9/128*qL2(10,6),1e-4);
r=solve({a:0,b:0,qa:0,qb:0,spans:[{L:5,q:4},{L:5,q:4},{L:5,q:4}],points:[]});
chk('Dreifeld M_B',r.Ms[1],-0.1*qL2(4,5)); chk('Dreifeld M_C',r.Ms[2],-0.1*qL2(4,5)); chk('Dreifeld Endfeld',r.spanMax[0].v,0.08*qL2(4,5),1e-3); chk('Dreifeld Mittelfeld',r.spanMax[1].v,0.025*qL2(4,5),1e-3);
r=solve({a:0,b:0,qa:0,qb:0,spans:[{L:8,q:0},{L:8,q:0}],points:[{x:4,P:30}]});
chk('Zweifeld Einzellast Mitte Feld 1: M_B',r.Ms[1],-3*30*8/32); // Einzellast nur Feld 1: -3PL/32
r=solve({a:2,b:0,qa:5,qb:0,spans:[{L:6,q:0}],points:[{x:0,P:10}]});
chk('Kragarm M_A = -(q a²/2 + P a)',r.Ms[0],-(5*4/2+10*2)); chk('Kragarm R_B',r.R[1],-(5*4/2+10*2)/6);
// 2) FE-Vergleich, beliebige Fälle
const cases=[
 {a:1.2,qa:6,b:0,qb:0,spans:[{L:5,q:6},{L:4,q:6},{L:5,q:6}],points:[{x:8.2,P:25},{x:0,P:10}]},
 {a:1.5,qa:5,b:1,qb:0,spans:[{L:5,q:2}],points:[{x:4,P:20},{x:7.5,P:15},{x:5.5,P:8}]},
 {a:0.8,qa:3,b:2.2,qb:4,spans:[{L:3.1,q:0},{L:7.4,q:9},{L:2.3,q:1.5},{L:5.6,q:0}],points:[{x:2.0,P:12},{x:11.3,P:40},{x:18.0,P:7},{x:21.4,P:5}]},
];
cases.forEach((m,c)=>{const a=solve(m),b=fe(m);a.R.forEach((v,j)=>chk('Fall '+(c+1)+' R'+String.fromCharCode(65+j)+' vs FE',v,b.R[j],1e-4));
  const sumR=a.R.reduce((x,y)=>x+y,0);chk('Fall '+(c+1)+' ΣR = ΣF',sumR,a.F);});
console.log(fails?fails+' FEHLER':'Alle Tests bestanden');
process.exitCode=fails?1:0;
