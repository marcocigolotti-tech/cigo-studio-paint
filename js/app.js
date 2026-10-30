
import {strokeSegment} from './brushes.js';
import {pigmentStroke} from './pigment.js';
import {validateProject} from './project.js';
(()=>{'use strict';
const $=id=>document.getElementById(id), stage=$('stage'),overlay=$('overlay'),ov=overlay.getContext('2d'),work=$('work');
const TOOLS=[['brush','🖌 Pennello'],['pencil','✏️ Matita'],['marker','🖍 Pennarello'],['air','☁️ Aerografo'],['smudge','☝ Sfumino'],['mixer','🎨 Miscelatore'],['eraser','⌫ Gomma'],['line','／ Linea'],['arrow','➜ Freccia'],['rect','▭ Rettangolo'],['roundrect','▢ Angoli tondi'],['ellipse','◯ Ellisse'],['fill','▧ Secchiello'],['pick','◉ Contagocce'],['text','T Testo'],['select','▣ Seleziona'],['move','✥ Sposta livello'],['hand','✋ Mano']];
let W=1200,H=900,layers=[],active=0,tool='brush',zoom=1,history=[],historyIndex=-1,selection=null,clipboard=null,gesture=null,dirty=false,projectName='Senza titolo',showGrid=false,mirrorPaint=false;
const MAX_HISTORY=12;let uid=0;
function say(s){$('status').textContent=s}
function canvas(w=W,h=H){let c=document.createElement('canvas');c.width=w;c.height=h;return c}
function layer(name,c=canvas()){return {id:++uid,name,canvas:c,visible:true,locked:false,opacity:1,blend:'source-over'}}
function current(){return layers[active]}
function setupStage(){stage.style.width=Math.round(W*zoom)+'px';stage.style.height=Math.round(H*zoom)+'px';overlay.width=W;overlay.height=H;stage.style.zoom='1';$('zoomLabel').textContent=Math.round(zoom*100)+'%';$('width').value=W;$('height').value=H;$('docInfo').textContent=W+' × '+H+' px · '+layers.length+' livelli'}
function render(){stage.querySelectorAll('canvas.paintlayer').forEach(n=>n.remove());layers.forEach((l,i)=>{l.canvas.className='paintlayer';l.canvas.style.zIndex=i+1;l.canvas.style.display=l.visible?'block':'none';l.canvas.style.opacity=l.opacity;l.canvas.style.mixBlendMode=l.blend==='source-over'?'normal':l.blend;stage.insertBefore(l.canvas,overlay)});drawOverlay();$('docInfo').textContent=W+' × '+H+' px · '+layers.length+' livelli'}
function drawOverlay(rect){ov.clearRect(0,0,W,H);if(showGrid){ov.save();ov.strokeStyle='rgba(25,72,110,.24)';ov.lineWidth=1;const step=50;ov.beginPath();for(let x=step;x<W;x+=step){ov.moveTo(x+.5,0);ov.lineTo(x+.5,H)}for(let y=step;y<H;y+=step){ov.moveTo(0,y+.5);ov.lineTo(W,y+.5)}ov.stroke();ov.restore()}if(mirrorPaint){ov.save();ov.strokeStyle='rgba(210,55,90,.75)';ov.setLineDash([9,6]);ov.lineWidth=1.5;ov.beginPath();ov.moveTo(W/2,0);ov.lineTo(W/2,H);ov.stroke();ov.restore()}if(selection){ov.save();ov.setLineDash([7,5]);ov.strokeStyle='#111';ov.lineWidth=2;ov.strokeRect(selection.x+.5,selection.y+.5,selection.w,selection.h);ov.strokeStyle='#fff';ov.lineDashOffset=6;ov.strokeRect(selection.x+.5,selection.y+.5,selection.w,selection.h);ov.restore()}if(rect){ov.save();ov.strokeStyle='#fff';ov.lineWidth=2;ov.setLineDash([7,5]);ov.strokeRect(rect.x,rect.y,rect.w,rect.h);ov.restore()}}
function layersUI(){$('layers').replaceChildren();for(let i=layers.length-1;i>=0;i--){let l=layers[i],el=document.createElement('div');el.className='layer'+(i===active?' selected':'');let row=document.createElement('div');row.className='layerhead';let eye=document.createElement('button');eye.textContent=l.visible?'👁':'○';eye.title='Mostra o nascondi';eye.onclick=()=>{l.visible=!l.visible;commit('Visibilità livello')};let lock=document.createElement('button');lock.textContent=l.locked?'🔒':'🔓';lock.title='Blocca o sblocca';lock.onclick=()=>{l.locked=!l.locked;commit('Blocco livello')};let title=document.createElement('strong');title.textContent=l.name;title.title='Clic per selezionare, doppio clic per rinominare';title.style.cursor='pointer';title.onclick=()=>{active=i;layersUI()};title.ondblclick=()=>{let name=prompt('Nome del livello',l.name);if(name&&name.trim()){l.name=name.trim().slice(0,80);commit('Nome livello')}};row.append(eye,lock,title);el.append(row);$('layers').append(el)}$('layerOpacity').value=Math.round(current().opacity*100);$('layerOpacityLabel').textContent=Math.round(current().opacity*100)+'%';$('blend').value=current().blend}
function snapshot(){return {W,H,active,selection:selection?{...selection}:null,layers:layers.map(l=>({name:l.name,visible:l.visible,locked:l.locked,opacity:l.opacity,blend:l.blend,png:l.canvas.toDataURL('image/png'),textData:l.textData?{...l.textData}:null}))}}
function commit(msg){history=history.slice(0,historyIndex+1);history.push(snapshot());if(history.length>MAX_HISTORY)history.shift();historyIndex=history.length-1;dirty=true;render();layersUI();say(msg||'Modifica salvata nella cronologia');updateUndo()}
function updateUndo(){$('undo').disabled=historyIndex<=0;$('redo').disabled=historyIndex>=history.length-1}
async function restore(s){W=s.W;H=s.H;let arr=[];for(let entry of s.layers){let c=canvas(W,H);await paintData(c,entry.png);arr.push({...entry,id:++uid,canvas:c,textData:entry.textData||null})}layers=arr;active=Math.min(s.active,layers.length-1);selection=s.selection||null;setupStage();render();layersUI();updateUndo()}
function paintData(c,url){return new Promise((resolve,reject)=>{let im=new Image();im.onload=()=>{c.getContext('2d').drawImage(im,0,0);resolve()};im.onerror=()=>reject(Error('Immagine non leggibile'));im.src=url})}
async function undoRedo(delta){let idx=historyIndex+delta;if(idx<0||idx>=history.length)return;historyIndex=idx;try{await restore(history[idx]);say('Cronologia aggiornata')}catch(e){say('Errore cronologia: '+e.message)}}
function newDoc(w=1200,h=900){W=w;H=h;layers=[layer('Sfondo')];layers[0].canvas.getContext('2d').fillStyle='#ffffff';layers[0].canvas.getContext('2d').fillRect(0,0,W,H);layers.push(layer('Disegno'));active=1;selection=null;history=[];historyIndex=-1;projectName='Senza titolo';zoom=1;setupStage();commit('Nuovo documento')}
function download(blob,name){let a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000)}
function baseName(){return projectName.replace(/[^\w\-À-ÿ ]/g,'').trim().replace(/\s+/g,'_')||'CIGO_Paint'}
function saveProject(){let data={format:'CIGO_STUDIO_PAINT',version:5,projectName,width:W,height:H,active,mode:$('mode').value,layers:layers.map(l=>({name:l.name,visible:l.visible,locked:l.locked,opacity:l.opacity,blend:l.blend,png:l.canvas.toDataURL('image/png'),textData:l.textData?{...l.textData}:null}))};download(new Blob([JSON.stringify(data)],{type:'application/json'}),baseName()+'.cigopaint');dirty=false;say('Progetto .cigopaint scaricato')}
async function loadProject(file){if(!file)return;try{if(file.size>100*1024*1024)throw Error('File troppo grande');let d=JSON.parse(await file.text());validateProject(d);if(d.format!=='CIGO_STUDIO_PAINT'||!Array.isArray(d.layers)||!d.layers.length)throw Error('Formato progetto non valido');if(!Number.isInteger(d.width)||!Number.isInteger(d.height)||d.width<64||d.height<64||d.width>4096||d.height>4096||d.layers.length>80)throw Error('Dimensioni o livelli non validi');if(d.layers.some(l=>typeof l.png!=='string'||!l.png.startsWith('data:image/png;base64,')||l.png.length>40_000_000))throw Error('Immagini non valide');W=d.width;H=d.height;layers=[];for(let item of d.layers){let c=canvas();await paintData(c,item.png);layers.push({id:++uid,name:String(item.name||'Livello').slice(0,80),visible:item.visible!==false,locked:!!item.locked,opacity:Math.max(0,Math.min(1,Number(item.opacity??1))),blend:['source-over','multiply','screen','overlay','darken','lighten'].includes(item.blend)?item.blend:'source-over',canvas:c,textData:validTextData(item.textData)?item.textData:null})}active=Math.max(0,Math.min(layers.length-1,Number(d.active)||0));projectName=String(d.projectName||file.name.replace(/\.cigopaint$/i,''));selection=null;history=[];historyIndex=-1;zoom=1;setupStage();commit('Progetto caricato');dirty=false;if(d.mode==='school')$('mode').value='school';else $('mode').value='studio';modeChange()}catch(e){alert('Impossibile aprire il progetto: '+e.message)}finally{$('fileProject').value=''}}
function flatten(){let c=canvas(),ctx=c.getContext('2d');layers.forEach(l=>{if(!l.visible)return;ctx.save();ctx.globalAlpha=l.opacity;ctx.globalCompositeOperation=l.blend;ctx.drawImage(l.canvas,0,0);ctx.restore()});return c}
function exportImage(type){let c=flatten();if(type==='image/jpeg'){let bg=canvas(),x=bg.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,W,H);x.drawImage(c,0,0);c=bg}c.toBlob(b=>{if(b)download(b,baseName()+(type==='image/png'?'.png':'.jpg'));else alert('Esportazione non riuscita')},type,.92)}
// Gruppi di strumenti: un pulsante per gruppo e un menu contestuale accessibile.
const TOOL_GROUPS=[
 {id:'paint',label:'🖌 Pittura',tools:['brush','pencil','marker','air']},
 {id:'pigment',label:'🎨 Sfumature',tools:['smudge','mixer']},
 {id:'shapes',label:'▭ Forme',tools:['line','arrow','rect','roundrect','ellipse']},
 {id:'retouch',label:'◈ Ritocco',tools:['eraser','fill','pick']},
 {id:'graphics',label:'T Grafica',tools:['text','select']},
 {id:'navigation',label:'✥ Navigazione',tools:['move','hand']}
];
const toolGroups=new Map(), toolButtons=new Map();
let openGroup=null;
function closeToolMenus(){for(const g of toolGroups.values()){g.menu.hidden=true;g.button.setAttribute('aria-expanded','false')}openGroup=null}
function setTool(t){
 if(gesture)finishGesture(gesture.prev);
 if(!TOOLS.some(x=>x[0]===t))return;
 tool=t;document.body.classList.toggle('text-tool-active',t==='text');document.body.classList.toggle('pigment-tool-active',['smudge','mixer'].includes(t));
 for(const [id,b] of toolButtons)b.classList.toggle('active',id===t);
 for(const g of TOOL_GROUPS){const ui=toolGroups.get(g.id),active=g.tools.includes(t);ui.button.classList.toggle('active',active);if(active){ui.selected.textContent=TOOLS.find(x=>x[0]===t)[1];ui.button.title='Strumento attivo: '+ui.selected.textContent+' — clicca per cambiare'}}
 closeToolMenus();
 overlay.style.cursor=t==='hand'?'grab':t==='move'?'move':t==='text'?'text':'crosshair';
 say('Strumento: '+TOOLS.find(x=>x[0]===t)?.[1]);
}
for(const g of TOOL_GROUPS){
 const container=document.createElement('div');container.className='tool-group';
 const b=document.createElement('button');b.type='button';b.className='tool-group-button';b.setAttribute('aria-haspopup','true');b.setAttribute('aria-expanded','false');
 const heading=document.createElement('span');heading.className='tool-group-title';heading.textContent=g.label;
 const selected=document.createElement('span');selected.className='tool-group-current';
 const arrow=document.createElement('span');arrow.className='tool-group-arrow';arrow.textContent='▾';
 b.append(heading,selected,arrow);
 const menu=document.createElement('div');menu.className='tool-flyout';menu.hidden=true;menu.setAttribute('role','group');menu.setAttribute('aria-label',g.label);
 for(const id of g.tools){const name=TOOLS.find(x=>x[0]===id)[1];const item=document.createElement('button');item.type='button';item.dataset.tool=id;item.textContent=name;item.onclick=()=>setTool(id);menu.append(item);toolButtons.set(id,item)}
 b.onclick=()=>{const willOpen=menu.hidden;closeToolMenus();if(willOpen){menu.hidden=false;b.setAttribute('aria-expanded','true');openGroup=g.id}};
 container.append(b,menu);$('tools').append(container);toolGroups.set(g.id,{container,button:b,menu,selected});
}
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#tools'))closeToolMenus()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeToolMenus()});
setTool('brush');
function pos(e){let r=overlay.getBoundingClientRect();return {x:Math.max(0,Math.min(W,(e.clientX-r.left)*W/r.width)),y:Math.max(0,Math.min(H,(e.clientY-r.top)*H/r.height))}}
function rect(a,b){let x=Math.round(Math.min(a.x,b.x)),y=Math.round(Math.min(a.y,b.y));return{x,y,w:Math.round(Math.abs(a.x-b.x)),h:Math.round(Math.abs(a.y-b.y))}}
function clipping(ctx){if(selection){ctx.beginPath();ctx.rect(selection.x,selection.y,selection.w,selection.h);ctx.clip()}}
function paintStroke(ctx,a,b,e){ctx.save();clipping(ctx);strokeSegment(ctx,a,b,{tool,color:$('color').value,size:+$('size').value,opacity:gesture?.strokeCanvas?1:+$('opacity').value/100,hardness:+$('hardness').value/100,pressure:e?.pointerType==='pen'?Math.max(.1,e.pressure||.5):1});if(mirrorPaint&&['brush','pencil','marker','air','eraser'].includes(tool)){ctx.save();ctx.translate(W,0);ctx.scale(-1,1);strokeSegment(ctx,a,b,{tool,color:$('color').value,size:+$('size').value,opacity:gesture?.strokeCanvas?1:+$('opacity').value/100,hardness:+$('hardness').value/100,pressure:e?.pointerType==='pen'?Math.max(.1,e.pressure||.5):1});ctx.restore()}ctx.restore()}
function pigmentMove(a,b){
 const ctx=current().canvas.getContext('2d',{willReadFrequently:true});
 pigmentStroke(ctx,a,b,{kind:tool,size:+$('size').value,strength:+$('pigmentStrength').value/100,softness:+$('pigmentSoftness').value/100,color:$('color').value,selection});
}
function previewStroke(){drawOverlay();if(gesture?.strokeCanvas){ov.save();ov.globalAlpha=gesture.strokeOpacity;ov.drawImage(gesture.strokeCanvas,0,0);ov.restore()}}
function finishGesture(p){if(!gesture)return;const g=gesture;gesture=null;if(g.kind==='select'){let r=rect(g.start,p);selection=r.w>2&&r.h>2?r:null;drawOverlay();say(selection?'Area selezionata':'Selezione rimossa')}else if(['line','arrow','rect','roundrect','ellipse'].includes(g.kind)){if(Math.hypot(p.x-g.start.x,p.y-g.start.y)>1){const old=tool;tool=g.kind;drawShape(current().canvas.getContext('2d'),g.start,p);tool=old;drawOverlay();commit('Forma disegnata')}else drawOverlay()}else if(g.strokeCanvas){const ctx=current().canvas.getContext('2d');ctx.save();ctx.globalAlpha=g.strokeOpacity;ctx.globalCompositeOperation=g.kind==='eraser'?'destination-out':'source-over';ctx.drawImage(g.strokeCanvas,0,0);ctx.restore();drawOverlay();commit('Tratto disegnato')}else if(['smudge','mixer'].includes(g.kind)){drawOverlay();commit(g.kind==='smudge'?'Sfumatura pigmento':'Colori miscelati')}else if(g.kind==='move'){commit('Livello spostato')}else drawOverlay()}

function constrainedEnd(a,b,kind,shift){
 if(!shift)return b;
 let dx=b.x-a.x,dy=b.y-a.y;
 if(kind==='line'||kind==='arrow'){
  let length=Math.hypot(dx,dy),angle=Math.round(Math.atan2(dy,dx)/(Math.PI/4))*(Math.PI/4);
  return {x:a.x+Math.cos(angle)*length,y:a.y+Math.sin(angle)*length};
 }
 let d=Math.max(Math.abs(dx),Math.abs(dy));
 return {x:a.x+Math.sign(dx||1)*d,y:a.y+Math.sign(dy||1)*d};
}
function drawShape(ctx,a,b,kind=tool){
 ctx.save();clipping(ctx);ctx.globalAlpha=+$('opacity').value/100;
 ctx.strokeStyle=$('color').value;ctx.fillStyle=$('color').value;
 ctx.lineWidth=+$('size').value;ctx.lineCap='round';ctx.lineJoin='round';
 const r=rect(a,b);ctx.beginPath();
 if(kind==='line'||kind==='arrow'){
  ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  if(kind==='arrow'){
   const angle=Math.atan2(b.y-a.y,b.x-a.x),head=Math.max(12,Math.min(65,ctx.lineWidth*3));
   ctx.beginPath();ctx.moveTo(b.x,b.y);
   ctx.lineTo(b.x-head*Math.cos(angle-Math.PI/6),b.y-head*Math.sin(angle-Math.PI/6));
   ctx.moveTo(b.x,b.y);
   ctx.lineTo(b.x-head*Math.cos(angle+Math.PI/6),b.y-head*Math.sin(angle+Math.PI/6));ctx.stroke();
  }
 }else{
  if(kind==='rect')ctx.rect(r.x,r.y,r.w,r.h);
  if(kind==='roundrect')ctx.roundRect(r.x,r.y,r.w,r.h,Math.min(24,r.w/4,r.h/4));
  if(kind==='ellipse')ctx.ellipse(r.x+r.w/2,r.y+r.h/2,Math.max(.01,r.w/2),Math.max(.01,r.h/2),0,0,Math.PI*2);
  if($('fillShape').checked)ctx.fill();else ctx.stroke();
 }
 ctx.restore();
}
function floodFill(c,x,y,color){let ctx=c.getContext('2d'),im=ctx.getImageData(0,0,W,H),d=im.data,idx=(Math.floor(y)*W+Math.floor(x))*4,old=[...d.slice(idx,idx+4)],newc=[parseInt(color.slice(1,3),16),parseInt(color.slice(3,5),16),parseInt(color.slice(5,7),16),255];if(old.every((v,i)=>v===newc[i]))return false;let stack=[Math.floor(y)*W+Math.floor(x)],seen=new Uint8Array(W*H),count=0;while(stack.length){let p=stack.pop();if(seen[p])continue;seen[p]=1;let px=p%W,py=(p/W)|0;if(selection&&(px<selection.x||py<selection.y||px>=selection.x+selection.w||py>=selection.y+selection.h))continue;let j=p*4;if(Math.abs(d[j]-old[0])>8||Math.abs(d[j+1]-old[1])>8||Math.abs(d[j+2]-old[2])>8||Math.abs(d[j+3]-old[3])>8)continue;d.set(newc,j);count++;if(px>0)stack.push(p-1);if(px<W-1)stack.push(p+1);if(py>0)stack.push(p-W);if(py<H-1)stack.push(p+W)}if(count)ctx.putImageData(im,0,0);return count>0}
function validTextData(d){return !!d&&typeof d==='object'&&typeof d.text==='string'&&d.text.length<=4000&&Number.isFinite(d.x)&&Number.isFinite(d.y)&&Number.isFinite(d.size)&&d.size>=8&&d.size<=240&&['left','center','right'].includes(d.align)&&['Arial','Verdana','Georgia','Times New Roman','Trebuchet MS','Courier New','Comic Sans MS','Tahoma'].includes(d.family)&&/^#[0-9a-fA-F]{6}$/.test(d.color)}
function textSettings(){return {family:$('fontFamily').value,size:Math.max(8,Math.min(240,Number($('fontSize').value)||48)),bold:$('textBold').checked,italic:$('textItalic').checked,underline:$('textUnderline').checked,align:$('textAlign').value,lineHeight:Math.max(.8,Math.min(2.2,Number($('textLineHeight').value)/100)),color:$('color').value,opacity:Number($('opacity').value)/100}}
function drawTextLayer(l){if(!l.textData)return;const d=l.textData,ctx=l.canvas.getContext('2d');ctx.clearRect(0,0,W,H);ctx.save();ctx.globalAlpha=d.opacity??1;ctx.fillStyle=d.color;ctx.strokeStyle=d.color;ctx.font=`${d.italic?'italic ':''}${d.bold?'bold ':''}${d.size}px "${d.family}"`;ctx.textAlign=d.align;ctx.textBaseline='top';const lines=d.text.split('\n'),lh=d.size*(d.lineHeight||1.25);lines.forEach((line,i)=>{const y=d.y+i*lh;ctx.fillText(line,d.x,y);if(d.underline){const width=ctx.measureText(line).width;let x=d.x;if(d.align==='center')x-=width/2;if(d.align==='right')x-=width;ctx.lineWidth=Math.max(1,d.size/20);ctx.beginPath();ctx.moveTo(x,y+d.size*1.04);ctx.lineTo(x+width,y+d.size*1.04);ctx.stroke()}});ctx.restore()}
function setTextControls(d){$('fontFamily').value=d.family;$('fontSize').value=d.size;$('textBold').checked=!!d.bold;$('textItalic').checked=!!d.italic;$('textUnderline').checked=!!d.underline;$('textAlign').value=d.align;$('textLineHeight').value=Math.round((d.lineHeight||1.25)*100);$('textLineHeightLabel').textContent=$('textLineHeight').value+'%';$('color').value=d.color}
function editText(){const l=current();if(l.locked){say('Sblocca il livello per modificare il testo');return}if(!l.textData){say('Seleziona un livello di testo creato con la versione 5.8');return}setTextControls(l.textData);const text=prompt('Modifica il testo (Invio per confermare)',l.textData.text);if(text===null)return;if(!text.trim()){say('Testo vuoto: modifica annullata');return}l.textData={...l.textData,...textSettings(),text:text.slice(0,4000)};drawTextLayer(l);commit('Testo modificato')}
// Riconoscimento del testo visibile sotto il puntatore, dal livello superiore a quello inferiore.
function textLayerAt(p){
 for(let i=layers.length-1;i>=0;i--){const l=layers[i];if(!l.visible||!l.textData)continue;
  const x=Math.max(0,Math.min(W-1,Math.floor(p.x))),y=Math.max(0,Math.min(H-1,Math.floor(p.y)));
  const d=l.canvas.getContext('2d',{willReadFrequently:true}).getImageData(x,y,1,1).data;
  if(d[3]>8)return i;
  // Consente di selezionare anche negli spazi interni delle lettere.
  const t=l.textData,ctx=l.canvas.getContext('2d');ctx.save();ctx.font=`${t.italic?'italic ':''}${t.bold?'bold ':''}${t.size}px "${t.family}"`;
  const lines=t.text.split('\n'),width=Math.max(0,...lines.map(v=>ctx.measureText(v).width));ctx.restore();
  let left=t.x;if(t.align==='center')left-=width/2;if(t.align==='right')left-=width;
  if(p.x>=left&&p.x<=left+width&&p.y>=t.y&&p.y<=t.y+lines.length*t.size*(t.lineHeight||1.25))return i;
 }
 return -1;
}
function editTextInline(){const l=current();if(!l.textData||l.locked){say('Seleziona un livello di testo sbloccato');return}
 setTextControls(l.textData);const d=l.textData;
 const area=document.createElement('textarea');area.className='canvas-text-editor';area.value=d.text;
 area.setAttribute('aria-label','Modifica testo direttamente sulla tela');
 const r=overlay.getBoundingClientRect(),sx=r.width/W,sy=r.height/H;
 area.style.left=(d.x*sx)+'px';area.style.top=(d.y*sy)+'px';
 area.style.font=`${d.italic?'italic ':''}${d.bold?'bold ':''}${Math.max(12,d.size*sy)}px "${d.family}"`;
 area.style.color=d.color;area.style.textAlign=d.align;
 area.style.lineHeight=String(d.lineHeight||1.25);
 area.style.width=Math.max(170,Math.min(r.width-d.x*sx-8,420))+'px';
 area.style.height=Math.max(70,d.text.split('\n').length*d.size*sy*(d.lineHeight||1.25)+22)+'px';
 const actions=document.createElement('div');actions.className='canvas-text-actions';
 actions.style.left=area.style.left;actions.style.top=(d.y*sy+parseFloat(area.style.height)+5)+'px';
 const ok=document.createElement('button');ok.textContent='✓ Applica';ok.type='button';
 const cancel=document.createElement('button');cancel.textContent='✕ Annulla';cancel.type='button';actions.append(ok,cancel);
 stage.append(area,actions);area.focus();area.select();
 const close=()=>{area.remove();actions.remove()};
 ok.onclick=()=>{if(!area.value.trim()){say('Il testo non può essere vuoto');return}l.textData={...l.textData,...textSettings(),text:area.value.slice(0,4000)};drawTextLayer(l);close();commit('Testo modificato sulla tela')};
 cancel.onclick=close;area.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close()}if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();ok.click()}});
}
overlay.addEventListener('dblclick',e=>{if(tool!=='text')return;const i=textLayerAt(pos(e));if(i<0)return;active=i;layersUI();editTextInline()});
$('editText').onclick=()=>current().textData?editTextInline():editText();
$('textLineHeight').oninput=e=>$('textLineHeightLabel').textContent=e.target.value+'%';
function pointerDown(e){if(e.button!==0&&e.pointerType==='mouse')return;let p=pos(e);if(tool==='pick'){let d=flatten().getContext('2d').getImageData(Math.min(W-1,p.x|0),Math.min(H-1,p.y|0),1,1).data;$('color').value='#'+[d[0],d[1],d[2]].map(x=>x.toString(16).padStart(2,'0')).join('');say('Colore prelevato');return}if(tool==='text'){const hit=textLayerAt(p);if(hit>=0){active=hit;layersUI();setTextControls(current().textData);say('Testo selezionato: doppio clic per modificarlo');return}if(current().locked){say('Livello bloccato');return}const t=prompt('Scrivi il testo (puoi modificarlo in seguito)');if(t&&t.trim()){const l=layer('Testo: '+t.trim().slice(0,25));l.textData={...textSettings(),text:t.slice(0,4000),x:p.x,y:p.y};drawTextLayer(l);layers.splice(active+1,0,l);active++;commit('Livello di testo aggiunto')}return}if(tool==='fill'){if(current().locked){say('Livello bloccato');return}try{if(floodFill(current().canvas,p.x,p.y,$('color').value))commit('Riempimento')}catch(err){alert('Riempimento non disponibile: '+err.message)}return}if(tool!=='hand'&&tool!=='select'&&current().locked){say('Sblocca il livello per modificarlo');return}overlay.setPointerCapture(e.pointerId);gesture={kind:tool,pointerId:e.pointerId,strokeCanvas:null,strokeOpacity:1,start:p,prev:p,originX:work.scrollLeft,originY:work.scrollTop,clientX:e.clientX,clientY:e.clientY,base:null,moved:false};if(['smudge','mixer'].includes(tool)){pigmentMove(p,p)}if(tool==='move'){gesture.base=canvas();gesture.base.getContext('2d').drawImage(current().canvas,0,0)}if(['brush','pencil','marker','air','eraser'].includes(tool)){gesture.strokeCanvas=canvas();gesture.strokeOpacity=+$('opacity').value/100;paintStroke(gesture.strokeCanvas.getContext('2d'),p,p,e);previewStroke()}}
function pointerMove(e){if(!gesture||e.pointerId!==gesture.pointerId)return;let p=pos(e),g=gesture;g.moved=true;if(tool==='hand'){work.scrollLeft=g.originX-(e.clientX-g.clientX);work.scrollTop=g.originY-(e.clientY-g.clientY)}else if(['brush','pencil','marker','air','eraser'].includes(tool)){paintStroke(g.strokeCanvas.getContext('2d'),g.prev,p,e);previewStroke()}else if(['smudge','mixer'].includes(tool)){pigmentMove(g.prev,p)}else if(tool==='select'){drawOverlay(rect(g.start,p))}else if(tool==='move'){let ctx=current().canvas.getContext('2d');ctx.clearRect(0,0,W,H);ctx.drawImage(g.base,p.x-g.start.x,p.y-g.start.y);if(current().textData){current().textData.x+=p.x-g.prev.x;current().textData.y+=p.y-g.prev.y}}else if(['line','arrow','rect','roundrect','ellipse'].includes(tool)){drawOverlay();ov.save();drawShape(ov,g.start,constrainedEnd(g.start,p,tool,e.shiftKey),tool);ov.restore()}g.prev=['line','arrow','rect','roundrect','ellipse'].includes(tool)?constrainedEnd(g.start,p,tool,e.shiftKey):p}
function pointerUp(e){if(!gesture||e.pointerId!==gesture.pointerId)return;const id=gesture.pointerId;finishGesture(constrainedEnd(gesture.start,pos(e),gesture.kind,e.shiftKey));try{if(overlay.hasPointerCapture(id))overlay.releasePointerCapture(id)}catch{}}
overlay.addEventListener('pointerdown',pointerDown);overlay.addEventListener('pointermove',pointerMove);overlay.addEventListener('pointerup',pointerUp);overlay.addEventListener('pointercancel',pointerUp);window.addEventListener('pointerup',pointerUp);window.addEventListener('blur',()=>{if(gesture)finishGesture(gesture.prev)});
function addLayer(name='Nuovo livello'){layers.splice(active+1,0,layer(name));active++;commit('Livello aggiunto')}
function selectionCopy(cut){if(!selection){say('Seleziona prima un’area');return}if(current().locked){say('Livello bloccato');return}let r=selection,src=current().canvas,copy=canvas(r.w,r.h);copy.getContext('2d').drawImage(src,r.x,r.y,r.w,r.h,0,0,r.w,r.h);clipboard=copy;if(cut){current().canvas.getContext('2d').clearRect(r.x,r.y,r.w,r.h);commit('Selezione tagliata')}else say('Selezione copiata')}
function paste(){if(!clipboard){say('Niente da incollare');return}let c=canvas(),p=selection||{x:Math.round(W/2-clipboard.width/2),y:Math.round(H/2-clipboard.height/2)};c.getContext('2d').drawImage(clipboard,p.x,p.y);layers.splice(active+1,0,layer('Selezione incollata',c));active++;commit('Selezione incollata')}
// Trasformazioni raster non distruttive per gli altri livelli: operano solo sul livello attivo.
function transformSelection(kind){
 if(!selection){say('Prima seleziona un’area rettangolare');return}
 if(current().locked){say('Sblocca il livello prima di trasformare');return}
 const r={x:Math.max(0,Math.floor(selection.x)),y:Math.max(0,Math.floor(selection.y)),w:Math.floor(selection.w),h:Math.floor(selection.h)};
 r.w=Math.min(r.w,W-r.x);r.h=Math.min(r.h,H-r.y);
 if(r.w<1||r.h<1)return;
 const source=canvas(r.w,r.h),sc=source.getContext('2d');
 sc.drawImage(current().canvas,r.x,r.y,r.w,r.h,0,0,r.w,r.h);
 if(kind==='extract'){
  const cut=canvas(W,H);cut.getContext('2d').drawImage(source,r.x,r.y);
  current().canvas.getContext('2d').clearRect(r.x,r.y,r.w,r.h);
  layers.splice(active+1,0,layer('Ritaglio trasformabile',cut));active++;
  commit('Selezione estratta in un livello');return;
 }
 let tw=r.w,th=r.h;
 if(kind==='left'||kind==='right'){tw=r.h;th=r.w}
 if(kind==='small'){tw=Math.max(1,Math.round(r.w*.5));th=Math.max(1,Math.round(r.h*.5))}
 if(kind==='large'){tw=Math.max(1,Math.round(r.w*1.5));th=Math.max(1,Math.round(r.h*1.5))}
 const transformed=canvas(tw,th),tc=transformed.getContext('2d');
 if(kind==='left'){tc.translate(0,th);tc.rotate(-Math.PI/2);tc.drawImage(source,0,0)}
 else if(kind==='right'){tc.translate(tw,0);tc.rotate(Math.PI/2);tc.drawImage(source,0,0)}
 else if(kind==='flipH'){tc.translate(tw,0);tc.scale(-1,1);tc.drawImage(source,0,0)}
 else if(kind==='flipV'){tc.translate(0,th);tc.scale(1,-1);tc.drawImage(source,0,0)}
 else tc.drawImage(source,0,0,tw,th);
 const x=Math.round(r.x+r.w/2-tw/2),y=Math.round(r.y+r.h/2-th/2);
 const ctx=current().canvas.getContext('2d');ctx.clearRect(r.x,r.y,r.w,r.h);ctx.drawImage(transformed,x,y);
 selection={x:Math.max(0,x),y:Math.max(0,y),w:Math.min(tw,W-Math.max(0,x)),h:Math.min(th,H-Math.max(0,y))};
 if(selection.w<=0||selection.h<=0)selection=null;
 commit('Trasformazione: '+kind);
}
function filterLayer(){if(current().locked){say('Livello bloccato');return}let filters={grayscale:'grayscale(1)',sepia:'sepia(1)',invert:'invert(1)',brightness:'brightness(1.2)',contrast:'contrast(1.25)',saturate:'saturate(1.4)',blur:'blur(3px)'},ctx=current().canvas.getContext('2d'),temp=canvas();temp.getContext('2d').drawImage(current().canvas,0,0);ctx.save();clipping(ctx);ctx.clearRect(selection?.x||0,selection?.y||0,selection?.w||W,selection?.h||H);ctx.filter=filters[$('filter').value];ctx.drawImage(temp,0,0);ctx.restore();commit('Filtro applicato')}
function modeChange(){let school=$('mode').value==='school';$('app').classList.toggle('school',school);$('schoolHint').classList.toggle('hide',!school);document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('advanced',school&&!['brush','pencil','marker','eraser','line','rect','ellipse','fill','pick','text'].includes(b.dataset.tool)));if(school&&['move','select','hand','air','arrow','roundrect','smudge','mixer'].includes(tool))setTool('brush');closeToolMenus()}
function resizeDoc(){let w=+$('width').value,h=+$('height').value;if(!Number.isInteger(w)||!Number.isInteger(h)||w<64||h<64||w>4096||h>4096){alert('Dimensioni consentite: 64–4096 pixel');return}if(w===W&&h===H)return;if(!confirm('Ridimensionare la tela? I pixel fuori dai nuovi margini verranno tagliati.'))return;layers=layers.map(l=>{let c=canvas(w,h);c.getContext('2d').drawImage(l.canvas,0,0);return{...l,canvas:c}});W=w;H=h;selection=null;setupStage();commit('Tela ridimensionata')}
function fit(){let avail=Math.max(180,work.clientWidth-70);zoom=Math.max(.1,Math.min(2,avail/W,(work.clientHeight-70)/H));setupStage();render()}
$('new').onclick=()=>{if(!dirty||confirm('Creare un nuovo documento? Salva prima il lavoro corrente.'))newDoc()};$('save').onclick=saveProject;$('open').onclick=()=>$('fileProject').click();$('fileProject').onchange=e=>loadProject(e.target.files[0]);$('png').onclick=()=>exportImage('image/png');$('jpg').onclick=()=>exportImage('image/jpeg');$('undo').onclick=()=>undoRedo(-1);$('redo').onclick=()=>undoRedo(1);$('import').onclick=()=>$('fileImage').click();$('fileImage').onchange=async e=>{let f=e.target.files[0];if(!f)return;try{if(f.size>25*1024*1024)throw Error('Immagine troppo grande');let u=URL.createObjectURL(f),im=new Image();try{await new Promise((resolve,reject)=>{im.onload=resolve;im.onerror=()=>reject(Error('Immagine non valida'));im.src=u});let c=canvas(),ctx=c.getContext('2d'),scale=Math.min(1,W/im.width,H/im.height);ctx.drawImage(im,0,0,im.width*scale,im.height*scale);layers.splice(active+1,0,layer(f.name.slice(0,80),c));active++;commit('Immagine importata')}finally{URL.revokeObjectURL(u)}}catch(err){alert(err.message)}e.target.value=''};
$('addLayer').onclick=()=>addLayer();$('duplicate').onclick=()=>{let l=current(),c=canvas();c.getContext('2d').drawImage(l.canvas,0,0);layers.splice(active+1,0,{...l,id:++uid,name:l.name+' copia',canvas:c,locked:false});active++;commit('Livello duplicato')};$('deleteLayer').onclick=()=>{if(layers.length===1){say('Deve restare almeno un livello');return}if(!confirm('Eliminare il livello selezionato?'))return;layers.splice(active,1);active=Math.min(active,layers.length-1);commit('Livello eliminato')};$('up').onclick=()=>{if(active>=layers.length-1)return;[layers[active],layers[active+1]]=[layers[active+1],layers[active]];active++;commit('Livello spostato')};$('down').onclick=()=>{if(active<=0)return;[layers[active],layers[active-1]]=[layers[active-1],layers[active]];active--;commit('Livello spostato')};
$('showGrid').addEventListener('change',e=>{showGrid=e.target.checked;drawOverlay();say(showGrid?'Griglia attiva (non esportata)':'Griglia nascosta')});
$('mirrorPaint').addEventListener('change',e=>{mirrorPaint=e.target.checked;drawOverlay();say(mirrorPaint?'Disegno simmetrico attivo':'Disegno simmetrico disattivato')});
$('layerOpacity').oninput=e=>{current().opacity=+e.target.value/100;$('layerOpacityLabel').textContent=e.target.value+'%';current().canvas.style.opacity=current().opacity};$('layerOpacity').onchange=()=>commit('Opacità livello');$('blend').onchange=e=>{current().blend=e.target.value;commit('Fusione livello')};$('applyFilter').onclick=filterLayer;$('resize').onclick=resizeDoc;$('selectAll').onclick=()=>{selection={x:0,y:0,w:W,h:H};drawOverlay()};$('clearSelection').onclick=()=>{selection=null;drawOverlay()};$('copySelection').onclick=()=>selectionCopy(false);$('cutSelection').onclick=()=>selectionCopy(true);$('pasteSelection').onclick=paste;
$('extractSelection').onclick=()=>transformSelection('extract');
$('rotateLeft').onclick=()=>transformSelection('left');
$('rotateRight').onclick=()=>transformSelection('right');
$('flipH').onclick=()=>transformSelection('flipH');
$('flipV').onclick=()=>transformSelection('flipV');
$('scaleDown').onclick=()=>transformSelection('small');
$('scaleUp').onclick=()=>transformSelection('large');
$('mode').onchange=modeChange;$('fit').onclick=fit;$('zoomIn').onclick=()=>{zoom=Math.min(3,zoom*1.25);setupStage();render()};$('zoomOut').onclick=()=>{zoom=Math.max(.1,zoom/1.25);setupStage();render()};for(let id of ['size','opacity','hardness'])$(id).oninput=e=>{$(id+'Label').textContent=e.target.value+(id==='size'?' px':'%')};document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-preset]').forEach(x=>x.classList.remove('active'));b.classList.add('active');const p=b.dataset.preset;setTool(p==='charcoal'?'pencil':p==='soft'?'brush':p==='spray'?'air':'marker');$('size').value=p==='charcoal'?8:p==='soft'?38:p==='spray'?52:18;$('hardness').value=p==='soft'?15:p==='charcoal'?65:75;$('opacity').value=p==='soft'?42:p==='charcoal'?65:85;for(const id of ['size','hardness','opacity'])$(id+'Label').textContent=$(id).value+(id==='size'?' px':'%');say('Preset '+b.textContent) }));$('help').onclick=()=>alert('CIGO STUDIO Paint 6.0\n\nDisegna sulla tela, organizza i livelli a destra.\nSalva .cigopaint per continuare a modificare i livelli; PNG/JPEG per esportare.\nScorciatoie: Ctrl+Z annulla, Ctrl+Y ripristina, Ctrl+S salva progetto, B pennello, E gomma, V sposta.\nIl salvataggio è locale: scarica regolarmente il progetto.');
document.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName))return;let ctrl=e.ctrlKey||e.metaKey;if(ctrl&&e.key.toLowerCase()==='s'){e.preventDefault();saveProject()}else if(ctrl&&e.key.toLowerCase()==='z'){e.preventDefault();undoRedo(e.shiftKey?1:-1)}else if(ctrl&&e.key.toLowerCase()==='y'){e.preventDefault();undoRedo(1)}else if(!ctrl&&e.key.toLowerCase()==='b')setTool('brush');else if(!ctrl&&e.key.toLowerCase()==='e')setTool('eraser');else if(!ctrl&&e.key.toLowerCase()==='v')setTool('move')});window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
newDoc();fit();dirty=false;say('Pronto · salva spesso il progetto .cigopaint');
})();

for(const id of ['pigmentStrength','pigmentSoftness'])$(id).addEventListener('input',e=>{$(id+'Label').textContent=e.target.value+'%'});
