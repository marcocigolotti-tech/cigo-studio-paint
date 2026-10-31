// CIGO STUDIO Paint 6.2.4 — motore locale di sfumatura e miscelazione.
// Opera esclusivamente sul livello attivo; il progetto resta compatibile.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
// Interpolazione cromatica: mantiene la saturazione e passa per il verde fra giallo e blu.
function hsv(c){let r=c[0]/255,g=c[1]/255,b=c[2]/255,max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,h=0;if(d){switch(max){case r:h=((g-b)/d)%6;break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4}h=(h*60+360)%360}return [h,max?d/max:0,max]}
function fromHsv(h,s,v){let c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c,a=[0,0,0];if(h<60)a=[c,x,0];else if(h<120)a=[x,c,0];else if(h<180)a=[0,c,x];else if(h<240)a=[0,x,c];else if(h<300)a=[x,0,c];else a=[c,0,x];return a.map(q=>Math.round((q+m)*255))}
function mixPigment(old,ink,t){const a=hsv(old),b=hsv(ink);if(a[1]<.07||b[1]<.07)return old.map((v,i)=>Math.round(v*(1-t)+ink[i]*t));let dh=((b[0]-a[0]+540)%360)-180;return fromHsv((a[0]+dh*t+360)%360,a[1]*(1-t)+b[1]*t,a[2]*(1-t)+b[2]*t)}
export function pigmentStroke(ctx,a,b,{kind,size,strength,softness,color,selection,state=null,grainPreserve=.65}){
 const radius=clamp(Math.round(size/2),1,60),step=Math.max(1,radius*.27);
 const distance=Math.hypot(b.x-a.x,b.y-a.y),n=Math.max(1,Math.ceil(distance/step));
 const ink=rgb(color),W=ctx.canvas.width,H=ctx.canvas.height;
 // Per lo sfumino, preleva il colore dal punto di partenza e trascinalo.
 // Il campione viene aggiornato lungo il percorso, simulando la diffusione del pigmento.
 let pickup=state?.pickup||null;
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
   else for(let c=0;c<4;c++)pickup[c]=pickup[c]*.88+now[c]*.12;
  }
  for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
   const px=sx+xx,py=sy+yy;
   if(selection&&(px<selection.x||py<selection.y||px>=selection.x+selection.w||py>=selection.y+selection.h))continue;
   const d=Math.hypot(px+.5-x,py+.5-y)/radius;
   if(d>=1)continue;
   const edge=softness*(1-d)+(1-softness)*(d<.82?1:(1-d)/.18);
   const grain=(Math.sin(px*12.9898+py*78.233)*43758.5453)%1;
   const tooth=Math.abs(grain);
   const preserve=kind==='smudge'?1-clamp(grainPreserve,0,1)*(.15+.55*tooth):1;
   const amt=clamp(strength*edge*(kind==='mixer'?1.0:.65)*preserve,0,.95),i=(yy*w+xx)*4;
   if(kind==='mixer'){
    // Non dipingere sul vuoto: il miscelatore agisce SOLO sul pigmento esistente.
    const oldA=data[i+3]/255;
    if(oldA<.06)continue;
    const mixed=mixPigment([data[i],data[i+1],data[i+2]],ink,amt);
    for(let c=0;c<3;c++)data[i+c]=mixed[c];
    // Conserva la trasparenza del livello originale.
    data[i+3]=Math.round(oldA*255);
   }else if(pickup){
    const pA=pickup[3]/255,oldA=data[i+3]/255,newA=oldA*(1-amt)+pA*amt;
    for(let c=0;c<3;c++)data[i+c]=Math.round((data[i+c]*oldA*(1-amt)+pickup[c]*pA*amt)/Math.max(newA,1e-6));
    data[i+3]=Math.round(newA*255);
   }
  }
  ctx.putImageData(im,sx,sy);
 }
 if(state&&kind==='smudge')state.pickup=pickup;
}
