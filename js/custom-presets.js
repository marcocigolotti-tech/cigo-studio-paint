// CIGO STUDIO Paint 6.3.2 - preset personali, salvati esclusivamente nel browser.
(()=>{'use strict';
const $=id=>document.getElementById(id),key='cigo-paint-custom-presets-v1';
const fields=['color','size','opacity','hardness','paintFlow','paintGrain','paperTexture','pastelType','pastelContact','pastelOverlay','eraserMode','strokeStabilizer','mousePressure','penPressure','penTilt','graphiteGrade','smudgePickup','smudgeGrain','pigmentStrength','pigmentSoftness'];
const select=$('customPresetSelect'),message=$('customPresetMessage');if(!select)return;
function notice(t){message.textContent=t}
function read(){try{let v=JSON.parse(localStorage.getItem(key)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}catch{return {}}}
function write(v){try{localStorage.setItem(key,JSON.stringify(v));return true}catch{notice('Impossibile salvare: memoria locale non disponibile.');return false}}
function refresh(selected=''){const data=read();select.replaceChildren(new Option('Scegli un preset salvato…',''));Object.keys(data).sort((a,b)=>a.localeCompare(b,'it')).forEach(n=>select.add(new Option(n,n)));select.value=selected in data?selected:''}
function activeTool(){return document.querySelector('[data-tool].active')?.dataset.tool||null}
$('customPresetSave').addEventListener('click',()=>{const name=prompt('Nome del preset personale (es. Carboncino ombre):');if(name===null)return;const n=name.trim().slice(0,55);if(!n){notice('Inserisci un nome.');return}const data=read();if(data[n]&&!confirm('Sostituire il preset «'+n+'»?'))return;if(!data[n]&&Object.keys(data).length>=30){notice('Massimo 30 preset. Elimina uno dei precedenti.');return}const values={};for(const id of fields){const el=$(id);if(el)values[id]=el.value}data[n]={tool:activeTool(),values};if(write(data)){refresh(n);notice('Preset «'+n+'» salvato in questo browser.')}});
$('customPresetLoad').addEventListener('click',()=>{const name=select.value,entry=read()[name];if(!entry){notice('Seleziona prima un preset.');return}if(entry.tool){const btn=[...document.querySelectorAll('[data-tool]')].find(b=>b.dataset.tool===entry.tool);if(btn)btn.click()}for(const id of fields){const el=$(id),v=entry.values?.[id];if(!el||v===undefined)continue;if(el.tagName==='SELECT'&&![...el.options].some(o=>o.value===v))continue;el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));const lab=$(id+'Label');if(lab)lab.textContent=v+(id==='size'?' px':'%')}document.querySelectorAll('[data-mouse-pressure]').forEach(b=>b.classList.toggle('active',b.dataset.mousePressure===$('mousePressure')?.value));notice('Preset «'+name+'» richiamato.');});
$('customPresetDelete').addEventListener('click',()=>{const n=select.value;if(!n)return;if(!confirm('Eliminare il preset «'+n+'»?'))return;const d=read();delete d[n];if(write(d)){refresh();notice('Preset eliminato.')}});
refresh();
})();
