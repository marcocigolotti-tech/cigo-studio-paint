// CIGO STUDIO Paint 6.0 — motore locale di sfumatura e miscelazione.
// Opera esclusivamente sul livello attivo; il progetto resta compatibile.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
export function pigmentStroke(ctx,a,b,{kind,size,strength,softness,color,selection}){
 const radius=clamp(Math.round(size/2),1,60),step=Math.max(1,radius*.27);
 const distance=Math.hypot(b.x-a.x,b.y-a.y),n=Math.max(1,Math.ceil(distance/step));
 const ink=rgb(color),W=ctx.canvas.width,H=ctx.canvas.height;
 // Per lo sfumino, preleva il colore dal punto di partenza e trascinalo.
 // Il campione viene aggiornato lungo il percorso, simulando la diffusione del pigmento.
 let pickup=null;
 for(let k=0;k<=n;k++){
  const t=k/n,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;
  const sx=clamp(Math.floor(x-radius),0,W-1),sy=clamp(Math.floor(y-radius),0,H-1);
  const ex=clamp(Math.ceil(x+radius+1),1,W),ey=clamp(Math.ceil(y+radius+1),1,H);
  if(ex<=sx||ey<=sy)continue;
  const w=ex-sx,h=ey-sy,im=ctx.getImageData(sx,sy,w,h),data=im.data;
  const cx=clamp(Math.floor(x)-sx,0,w-1),cy=clamp(Math.floor(y)-sy,0,h-1);
  const ci=(cy*w+cx)*4;
  if(kind==='smudge'){
   const now=[data[ci],data[ci+1],data[ci+2],data[ci+3]];
   if(!pickup)pickup=now;
   else for(let c=0;c<4;c++)pickup[c]=pickup[c]*.72+now[c]*.28;
  }
  for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
   const px=sx+xx,py=sy+yy;
   if(selection&&(px<selection.x||py<selection.y||px>=selection.x+selection.w||py>=selection.y+selection.h))continue;
   const d=Math.hypot(px+.5-x,py+.5-y)/radius;
   if(d>=1)continue;
   const edge=softness*(1-d)+(1-softness)*(d<.82?1:(1-d)/.18);
   const amt=clamp(strength*edge*.55,0,.8),i=(yy*w+xx)*4;
   if(kind==='mixer'){
    // Miscelazione di pigmento scelto e colore già presente, rispettando l'alpha.
    const oldA=data[i+3]/255,newA=oldA+(1-oldA)*amt;
    for(let c=0;c<3;c++)data[i+c]=Math.round((data[i+c]*oldA*(1-amt)+ink[c]*amt)/Math.max(newA,1e-6));
    data[i+3]=Math.round(newA*255);
   }else if(pickup){
    const pA=pickup[3]/255,oldA=data[i+3]/255,newA=oldA*(1-amt)+pA*amt;
    for(let c=0;c<3;c++)data[i+c]=Math.round((data[i+c]*oldA*(1-amt)+pickup[c]*pA*amt)/Math.max(newA,1e-6));
    data[i+3]=Math.round(newA*255);
   }
  }
  ctx.putImageData(im,sx,sy);
 }
}
