// CIGO STUDIO Paint 6.1.8 — motore pennelli artistici (Canvas 2D, senza librerie).
// Le texture sono generate localmente, non usano immagini esterne.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function hash(n){let x=Math.sin(n*127.1+78.233)*43758.5453;return x-Math.floor(x)}
export function strokeSegment(ctx,a,b,{tool,color,size,opacity,hardness,flow=.65,grain=.55,pressure=1,paper="medium"}){
 const w=Math.max(.5,size*clamp(pressure,.1,1.8)*(tool==='pencil'?.34:tool==='marker'?1.4:1));
 ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=w;
 if(tool==='eraser'){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();if(Math.hypot(b.x-a.x,b.y-a.y)<.5){ctx.beginPath();ctx.arc(b.x,b.y,w/2,0,Math.PI*2);ctx.fill()}return}
 if(tool==='pencil'){
  // Grafite: nessun nucleo opaco e uniforme (effetto pennarello).
  // Fibre longitudinali discontinue + microdepositi su una trama di carta stabile.
  const f=clamp(flow,.01,1),g=clamp(grain,0,1),h=clamp(hardness,0,1);
  const power=clamp(pressure,.1,1.8);
  const len=Math.hypot(b.x-a.x,b.y-a.y);
  const tx=len>0?(b.x-a.x)/len:1,ty=len>0?(b.y-a.y)/len:0;
  const nx=-ty,ny=tx;
  const width=Math.max(1.1,w*(.9+.18*h));
  const count=Math.max(1,Math.ceil(len/.55));
  // Molte fibre sottili: maggiore flusso = maggiore densità, non linea solida.
  const fibers=Math.min(35,Math.max(7,Math.round(width*(2.3+f*2))));
  const alpha=clamp(opacity,0,1);
  for(let i=0;i<=count;i++){
   const t=i/count,cx=a.x+(b.x-a.x)*t,cy=a.y+(b.y-a.y)*t;
   for(let j=0;j<fibers;j++){
    const offset=(j/(fibers-1)-.5)*width;
    const x=cx+nx*offset,y=cy+ny*offset;
    // Rumore legato alle coordinate del foglio, non al numero del segmento.
    const cellX=Math.floor(x*2.3),cellY=Math.floor(y*2.3);
    const paper=hash(cellX*103.17+cellY*297.31);
    const fleck=hash(cellX*13.7+cellY*71.3+j*7.1);
    const edge=Math.pow(Math.max(0,1-Math.abs(offset)/(width*.55)),.6+.7*(1-h));
    const tooth=.24+.76*paper;
    const coverage=clamp((.32+.64*f)*(.74+.26*power)*edge*(1-g*.60)+.08,0,1);
    if(fleck>coverage*tooth)continue;
    ctx.globalAlpha=alpha*(.16+.35*f)*(.65+.35*power)*(.65+.35*paper);
    const strokeLen=.55+1.1*hash(cellX*5.1+cellY*17.9+j);
    ctx.fillRect(x-.23,y-.23,Math.max(.34,Math.abs(tx)*strokeLen+.25),Math.max(.34,Math.abs(ty)*strokeLen+.25));
   }
  }
  // Pochissime fibre scure intermittenti per una grafite decisa senza contorno netto.
  if(f>.58){
   const tracks=Math.max(2,Math.round(width*.55));
   for(let k=0;k<tracks;k++){
    const off=(k/(tracks-1)-.5)*width*.75;
    const x1=a.x+nx*off,y1=a.y+ny*off,x2=b.x+nx*off,y2=b.y+ny*off;
    const noise=hash(Math.floor((x1+x2)*.7)*41+Math.floor((y1+y2)*.7)*53+k*19);
    if(noise<g*.38)continue;
    ctx.globalAlpha=alpha*(.035+.085*f)*(.6+.4*power);
    ctx.lineWidth=.32+.25*h;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
   }
  }
  ctx.globalAlpha=opacity;
  return;
 }
 if(tool==='pastel'){
  // Pastello spesso: pigmento cromaticamente pieno, bordi morbidi e grana visibile.
  // Il colore originale non viene schiarito o desaturato: è la copertura a variare.
  const f=clamp(flow,.01,1),g=clamp(grain,0,1),h=clamp(hardness,0,1);
  const scale=paper==='rough'?.68:paper==='fine'?2.0:1.15;
  const radius=Math.max(1,w*.5),distance=Math.hypot(b.x-a.x,b.y-a.y);
  const steps=Math.max(1,Math.ceil(distance/Math.max(.8,radius*.17)));
  const press=clamp(pressure,.12,1.8);
  for(let i=0;i<=steps;i++){
   const t=i/steps,cx=a.x+(b.x-a.x)*t,cy=a.y+(b.y-a.y)*t;
   // Strato morbido e corposo: non crea una riga netta come il pennarello.
   const deposits=Math.min(500,Math.max(55,Math.round(radius*radius*(1.8+f*2.4))));
   for(let j=0;j<deposits;j++){
    const seed=Math.floor(cx*4.71+cy*9.83+i*193+j*127);
    const rad=Math.sqrt(hash(seed))*radius,ang=hash(seed+17)*Math.PI*2;
    const x=cx+Math.cos(ang)*rad,y=cy+Math.sin(ang)*rad;
    const px=Math.floor(x*scale),py=Math.floor(y*scale);
    const tooth=hash(px*73.17+py*113.81),fleck=hash(px*17.31+py*41.71+j*3.19);
    const edge=Math.pow(Math.max(0,1-rad/radius),.28+(1-h)*.6);
    // Parte della trama resta scoperta, soprattutto con grana ruvida.
    const cover=clamp(.95-g*.27+f*.13+edge*.10,0,1);
    if(fleck>cover || tooth<g*.10)continue;
    ctx.globalAlpha=clamp(opacity*(.19+.33*f)*(.60+.40*edge)*(.68+.32*tooth)*press,0,.9);
    const speck=Math.max(.85,Math.min(3.4,radius*.075))*(.8+.6*hash(seed+31));
    ctx.fillRect(x-speck/2,y-speck/2,speck,speck*(.8+.45*hash(seed+41)));
   }
  }
  ctx.globalAlpha=opacity;
  return;
 }
 if(tool==='charcoal'){
  // Deposito granulare sulla trama del foglio: il rumore dipende dalle
  // coordinate assolute, quindi non cambia casualmente a ogni passaggio.
  const isCharcoal=tool==='charcoal';
  const d=Math.hypot(b.x-a.x,b.y-a.y);
  const f=clamp(flow,.01,1),g=clamp(grain,0,1),h=clamp(hardness,0,1);
  const paperScale=paper==='rough'?0.56:paper==='fine'?2.1:1.05;
  const radius=Math.max(.6,w*.5),step=Math.max(.75,Math.min(3,radius*.24));
  const count=Math.max(1,Math.ceil(d/step));
  const cell=Math.max(.7,Math.min(2.5,radius/13));
  for(let i=0;i<=count;i++){
   const t=i/count,cx=a.x+(b.x-a.x)*t,cy=a.y+(b.y-a.y)*t;
   const particles=Math.min(145,Math.max(20,Math.ceil(radius*radius*(isCharcoal?1.18:1.00)*(.45+.55*f))));
   for(let j=0;j<particles;j++){
    const seed=Math.floor(cx*3.7+cy*9.1+i*97+j*131);
    const rad=Math.sqrt(hash(seed))*radius,ang=hash(seed+13)*Math.PI*2;
    const x=cx+Math.cos(ang)*rad,y=cy+Math.sin(ang)*rad;
    const px=Math.floor(x*paperScale),py=Math.floor(y*paperScale);
    const tooth=hash(px*71.13+py*131.71);
    const fiber=hash(px*23.71+py*39.37+11);
    // I solchi della carta restano più chiari; le creste raccolgono pigmento.
    const coverage=(.68+.30*f)*(1-g*.43)+.12;
    if(tooth>coverage||fiber<g*.20)continue;
    const edge=Math.pow(Math.max(0,1-rad/radius),.35+(1-h)*.85);
    const alpha=clamp(opacity*(.35+.65*f)*(isCharcoal?.48:.36)*(.52+.48*tooth)*(.42+.58*edge)*pressure,0,.85);
    if(alpha<.006)continue;
    ctx.globalAlpha=alpha;
    const speck=cell*(isCharcoal?.95:1.15)*(.75+.65*hash(seed+37));
    ctx.fillRect(x-speck/2,y-speck/2,speck,speck*(isCharcoal?.70:1.05));
   }
  }
  ctx.globalAlpha=opacity;
  return;
 }
 if(tool==='air'){
  const d=Math.hypot(b.x-a.x,b.y-a.y),steps=Math.max(1,Math.ceil(d/3));
  for(let i=0;i<=steps;i++){const t=i/steps,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;
   for(let j=0;j<Math.min(70,Math.max(8,size));j++){const rad=Math.sqrt(Math.random())*size/2,ang=Math.random()*Math.PI*2;ctx.globalAlpha=opacity*.1*flow;ctx.fillRect(x+Math.cos(ang)*rad,y+Math.sin(ang)*rad,1.4,1.4)}}return;
 }
 ctx.globalAlpha=opacity*(tool==='marker'?1:flow);
 if(tool==='brush'&&hardness<.6){ctx.shadowColor=color;ctx.shadowBlur=(1-hardness)*w*.7}
 ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
 if(Math.hypot(b.x-a.x,b.y-a.y)<.5){ctx.beginPath();ctx.arc(b.x,b.y,w/2,0,Math.PI*2);ctx.fill()}
}
