// CIGO STUDIO Paint 6.1 — motore pennelli artistici (Canvas 2D, senza librerie).
// Le texture sono generate localmente, non usano immagini esterne.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function hash(n){let x=Math.sin(n*127.1+78.233)*43758.5453;return x-Math.floor(x)}
export function strokeSegment(ctx,a,b,{tool,color,size,opacity,hardness,flow=.65,grain=.55,pressure=1}){
 const w=Math.max(.5,size*clamp(pressure,.1,1.8)*(tool==='pencil'?.34:tool==='marker'?1.4:1));
 ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=w;
 if(tool==='eraser'){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();if(Math.hypot(b.x-a.x,b.y-a.y)<.5){ctx.beginPath();ctx.arc(b.x,b.y,w/2,0,Math.PI*2);ctx.fill()}return}
 if(tool==='charcoal'||tool==='pastel'||tool==='pencil'){
  // Una pennellata è composta da minuscoli depositi irregolari: pressione,
  // flusso e grana cambiano copertura e densità. Passate successive accumulano pigmento.
  const length=Math.hypot(b.x-a.x,b.y-a.y),spacing=Math.max(.75,w*.105),count=Math.max(1,Math.ceil(length/spacing));
  const density=tool==='pencil'?0.34:tool==='charcoal'?0.72:0.90;
  const radius=w*.5,grainFactor=clamp(grain,0,1),f=clamp(flow,.01,1);
  ctx.globalAlpha=clamp(opacity,0,1);
  for(let i=0;i<=count;i++){
   const t=count?i/count:0,cx=a.x+(b.x-a.x)*t,cy=a.y+(b.y-a.y)*t;
   const particles=Math.min(110,Math.max(8,Math.ceil(w*w*.12*density*f)));
   for(let j=0;j<particles;j++){
    const seed=Math.floor(cx*7+cy*11+i*97+j*271),u=hash(seed),v=hash(seed+13);
    const rad=Math.sqrt(u)*radius,ang=v*Math.PI*2,x=cx+Math.cos(ang)*rad,y=cy+Math.sin(ang)*rad;
    const texture=hash(Math.floor(x*1.8)*71+Math.floor(y*1.8)*131);
    if(texture<grainFactor*.58)continue;
    const edge=clamp((radius-rad)/(radius*.32+.1),.12,1);
    ctx.globalAlpha=opacity*f*(tool==='pencil'?.19:tool==='charcoal'?.26:.22)*edge;
    const r=tool==='pastel'?Math.max(.5,w*.055):tool==='charcoal'?Math.max(.4,w*.035):Math.max(.25,w*.018);
    ctx.fillRect(x-r/2,y-r/2,r,r);
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
