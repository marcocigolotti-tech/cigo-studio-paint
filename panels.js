/* Pannelli separati: nessuna modifica al motore grafico o al formato .cigopaint. */
(()=>{
 const tabs=[...document.querySelectorAll('[data-panel-tab]')];
 function activate(key,focus=false){
  for(const b of tabs){const selected=b.dataset.panelTab===key;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;const panel=document.getElementById('panel-'+b.dataset.panelTab);if(panel)panel.hidden=!selected;}
  if(focus)tabs.find(b=>b.dataset.panelTab===key)?.focus();
 }
 for(let i=0;i<tabs.length;i++){
  tabs[i].addEventListener('click',()=>activate(tabs[i].dataset.panelTab));
  tabs[i].addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();let next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;activate(tabs[next].dataset.panelTab,true)});
 }
 activate('livelli');
})();
