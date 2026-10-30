// Pennelli raster, senza dipendenze esterne.
export function strokeSegment(ctx,a,b,{tool,color,size,opacity,hardness,pressure=1}){
 const width=Math.max(.5,size*pressure*(tool==='pencil'?.34:tool==='marker'?1.4:1));
 ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=width;ctx.globalAlpha=opacity;
 if(tool==='eraser'){ctx.globalCompositeOperation='destination-out';ctx.globalAlpha=1}
 if(tool==='air'){const d=Math.hypot(b.x-a.x,b.y-a.y),steps=Math.max(1,Math.ceil(d/3));for(let i=0;i<=steps;i++){const t=i/steps,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;for(let j=0;j<Math.min(70,Math.max(8,size));j++){const rad=Math.sqrt(Math.random())*size/2,ang=Math.random()*Math.PI*2;ctx.globalAlpha=opacity*.1;ctx.fillRect(x+Math.cos(ang)*rad,y+Math.sin(ang)*rad,1.4,1.4)}}return}
 if(tool==='marker')ctx.globalAlpha=opacity;
 if(tool==='brush'&&hardness<.6){ctx.shadowColor=color;ctx.shadowBlur=(1-hardness)*width*.7}
 ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
 if(Math.hypot(b.x-a.x,b.y-a.y)<.5){ctx.beginPath();ctx.arc(b.x,b.y,width/2,0,Math.PI*2);ctx.fill()}
}
