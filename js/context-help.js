// CIGO STUDIO Paint 6.4.0 - guida contestuale, non modifica il motore grafico.
(()=>{'use strict';
const data={
brush:['🖌 Pennello','Pennellata pittorica regolabile, adatta a contorni e campiture.','Scegli il colore e trascina sul foglio. Lavora su un livello dedicato per correggere facilmente.','Dimensione 15–35 px; opacità 70–100%; per bordi morbidi abbassa la durezza.'],
pencil:['✏️ Matita','Grafite granulosa per schizzo, tratteggio e chiaroscuro.','Scegli la gradazione in Regolazioni artistiche; ripassa più volte per intensificare le ombre.','HB per schizzi, 2B–4B per ombre, 6B per scuri profondi; prova 6–14 px.'],
marker:['🖍 Pennarello','Tratto regolare, coprente e dai bordi definiti.','Disegna linee continue o campiture; usa un nuovo livello per separare i colori.','Dimensione 8–25 px; opacità alta; durezza elevata.'],
charcoal:['⬛ Carboncino','Pigmento irregolare per ombre e studi tonali.','Sovrapponi i tratti per scurire; usa lo sfumino e la gomma pane per i passaggi di luce.','Dimensione 18–40 px; grana medio-alta; carta ruvida.'],
pastel:['🟣 Pastello','Pigmento colorato, morbido o secco, con trama visibile.','Scegli tipo, punta/lato e sovrapposizione in Regolazioni artistiche; lavora a strati.','Dimensione 30–55 px; flusso alto per il morbido; carta ruvida per grana evidente.'],
air:['☁️ Aerografo','Nebulizzazione di colore per sfumature leggere.','Muovi lentamente il puntatore; ripassa per aumentare la copertura.','Dimensione 35–65 px; opacità moderata; flusso basso.'],
smudge:['☝ Sfumino','Trascina e ammorbidisce il pigmento già presente sul livello attivo.','Passa tra due campiture sullo stesso livello; regola carico e conservazione grana.','Dimensione 25–45 px; intensità 45–70%; grana 50–75%.'],
mixer:['🎨 Miscelatore','Mescola il colore scelto con i pigmenti del livello attivo.','Seleziona il colore e sfuma lungo il bordo della campitura; i colori devono stare sullo stesso livello.','Dimensione 35–60 px; intensità 80–100% per una fusione più marcata.'],
eraser:['⌫ Gomma','Rimuove o alleggerisce il colore sul livello selezionato.','Scegli Classica, Morbida o Pane nel menu Regolazioni artistiche.','Classica per cancellare; Pane per luci progressive; Morbida per bordi sfumati.'],
line:['／ Linea','Crea segmenti rettilinei.','Trascina dal punto iniziale a quello finale; tieni premuto Maiusc per vincolare l’angolo.','Scegli prima colore, spessore e opacità.'],
arrow:['➜ Freccia','Disegna frecce per schemi e annotazioni.','Trascina dall’origine verso la direzione desiderata.','Dimensione 3–10 px per diagrammi leggibili.'],
rect:['▭ Rettangolo','Crea rettangoli con contorno oppure pieni.','Trascina sulla tela; attiva Forma piena per una campitura; Maiusc per un quadrato.','Dimensione 2–8 px per il contorno.'],
roundrect:['▢ Angoli tondi','Disegna rettangoli con angoli arrotondati.','Trascina sulla tela e scegli se lasciare il contorno o riempire.','Dimensione 2–8 px per il contorno.'],
ellipse:['◯ Ellisse','Disegna ovali e cerchi.','Trascina sulla tela; tieni Maiusc per ottenere un cerchio.','Dimensione 2–8 px; Forma piena per dischi colorati.'],
fill:['▧ Secchiello','Riempie una zona con il colore selezionato.','Scegli un colore e fai clic nella regione da riempire.','Verifica il livello attivo e i contorni prima di riempire.'],
pick:['◉ Contagocce','Preleva un colore già visibile nell’immagine.','Fai clic su un punto del disegno: il colore selezionato viene aggiornato.','Utile per mantenere una tavolozza coerente.'],
text:['T Testo','Inserisce scritte modificabili su livelli dedicati.','Imposta carattere, dimensione e stile; fai clic sul foglio. Doppio clic su un testo esistente per modificarlo.','Per titoli prova 40–70 px; usa contrasto elevato.'],
select:['▣ Seleziona','Delimita una zona rettangolare da trasformare.','Trascina per selezionare, poi usa i comandi di copia, taglia o trasformazione.','Lavora sul livello corretto e annulla la selezione quando hai finito.'],
move:['✥ Sposta livello','Sposta il contenuto del livello attivo.','Trascina sulla tela; non sposta automaticamente gli altri livelli.','Controlla il livello selezionato prima di trascinare.'],
hand:['✋ Mano','Naviga la tela quando è ingrandita.','Trascina per spostare la vista senza alterare il disegno.','Usa Adatta per tornare a vedere tutto il foglio.']
};
const $=id=>document.getElementById(id),panel=$('contextHelp'),toggle=$('contextHelpToggle'),body=$('contextHelpBody');if(!panel||!toggle||!body)return;
const key='cigo-context-help-open';let open=false;try{open=localStorage.getItem(key)==='1'}catch(_){}
function setOpen(v){open=!!v;body.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.querySelector('span').textContent=open?'▴':'▾';try{localStorage.setItem(key,open?'1':'0')}catch(_){}}
function refresh(){const active=document.querySelector('#tools [data-tool].active');const id=active?.dataset.tool||'brush';const item=data[id]||data.brush; $('contextHelpName').textContent=item[0];$('contextHelpDescription').textContent=item[1];$('contextHelpUsage').textContent=item[2];$('contextHelpSettings').textContent=item[3]}
toggle.addEventListener('click',()=>setOpen(!open));$('contextHelpManual').addEventListener('click',()=>window.openCigoGuide?.());
// Osserva la classe active: funziona anche per scorciatoie e preset, non solo per clic.
const tools=$('tools');const observer=new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'&&r.attributeName==='class'))refresh()});observer.observe(tools,{subtree:true,attributes:true,attributeFilter:['class']});
setOpen(open);refresh();
})();
