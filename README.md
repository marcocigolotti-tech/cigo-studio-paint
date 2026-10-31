CIGO STUDIO Paint 6.2.7 — Sfumino a grana controllata

- Nuovo controllo Conservazione grana (0–100%, default 65%).
- Il campione di colore trascinato dallo sfumino resta continuo durante l’intero gesto, anche tra eventi del puntatore.
- Intensità e morbidezza esistenti mantenute; il Miscelatore resta indipendente.
- Tutte le altre funzioni della 6.2.7 conservate.

Nota: lo sfumino agisce sui pigmenti del livello attivo, non su altri livelli.

CIGO STUDIO Paint 6.2.7 — Pastello di punta e di lato

NOVITÀ: menu «Contatto del pastello» (Punta/Lato). La modalità Lato aumenta la larghezza e la grana del tratto per campiture, senza alterare gli altri strumenti. Punta mantiene il comportamento 6.2.7.

# CIGO STUDIO Paint 6.2.7 — Pastello brillante e corposo

- Pastello con tratto più ampio, pigmento intenso e cromaticamente brillante.
- Depositi granulari con trama carta fine/media/ruvida e bordi non uniformi.
- Preset pastello: dimensione 44 px, opacità 100%, flusso 92%, grana 48%.
- Carboncino e matite 2H, HB, 2B, 4B, 6B invariati.
- Il colore resta quello selezionato: per un pastello più brillante scegliere una tinta satura nel selettore colore.

## Installazione GitHub Pages
Sostituire i file nella radice del repository, mantenendo le cartelle css e js. Ricaricare con Ctrl+Maiusc+R.

CIGO STUDIO Paint 6.1.7 — Pigmento intenso

Correzione del carboncino e del pastello: deposito più visibile e accumulo con passate successive. Preset carboncino: opacità 90%, flusso 72%; pastello: opacità 82%, flusso 70%. La grana resta attiva.

# CIGO STUDIO Paint 6.1.6 — Texture artistiche

Aggiornamento incrementale della versione 6.1.5, destinato a GitHub Pages.

## Novità
- Carboncino e pastello: depositi irregolari su grana di carta deterministica, con maggiore controllo dei bordi.
- Nuovo selettore **Trama della carta**: Fine, Media, Ruvida.
- Confermate matite 2H, HB, 2B, 4B e 6B, sfumino, miscelatore, gomma, forme, livelli e testi.

La texture è simulata nel tratto, non è un'immagine di carta sottostante. Per confrontare le trame usa lo stesso colore e gli stessi parametri su un livello nuovo.

## Pubblicazione
Carica tutti i file e le cartelle nel repository GitHub Pages, sostituendo la versione precedente. Apri il sito con Ctrl+Maiusc+R.

Ideato, progettato e creato dal Prof. Marco Cigolotti · Sviluppato con il supporto dell'intelligenza artificiale · © 2026


## 6.2.7 — Pastello più granuloso
Texture del pastello con pori della carta più visibili e granuli più piccoli, mantenendo intensità e brillantezza del colore.


## Novità 6.2.7 — Due consistenze del pastello
Seleziona **Tipo di pastello**: Morbido (coprente e brillante) o Secco (granuloso, con micro-vuoti più visibili). Le gradazioni di grafite e gli altri strumenti restano invariati.


## Novità 6.2.7 — sovrapposizione pastelli
Nel pannello artistico, scegliere Naturale, Velatura o Fusione. La modalità Fusione usa la composizione Canvas `multiply` per una mescolanza ottica (non simula la chimica dei pigmenti). Velatura riduce la copertura del tratto. La modalità scelta viene fissata all’inizio del tratto. Il Miscelatore rimane lo strumento per trascinare e fondere il colore sul livello attivo.


## Novità 6.2.7 — Inclinazione pastello
- Nuovo cursore Effetto inclinazione penna (0–100%).
- Su dispositivi Pointer Events che trasmettono tiltX/tiltY, il pastello assume un’impronta più ampia e orientata in base alla penna.
- La pressione continua a influire sulla quantità e dimensione del deposito.
- Con mouse o penna senza tilt la resa è identica alla 6.2.7.


## Versione 6.2.7 — Carico pigmento dello sfumino
Nuovo controllo **Carico pigmento sfumino** (0–100%). Modula il trascinamento e il rinnovo del campione cromatico lungo la pennellata. A ogni nuovo tratto il campione viene azzerato; il controllo agisce solo sullo sfumino, non sul miscelatore. Compatibilità `.cigopaint` invariata.


## Novità 6.2.7
Tutti i controlli artistici avanzati (grafite, pastelli, carta, pressione, inclinazione, stabilizzazione e sfumino/miscelatore) sono raccolti nel menu espandibile «Regolazioni artistiche». Il menu è inizialmente chiuso e si apre cliccando sul titolo. Le impostazioni e il motore di disegno sono invariati.


## Novità 6.2.7 — Gomme artistiche
Nel menu Regolazioni artistiche: Gomma classica, Morbida e Pane. Le gomme agiscono sul livello attivo; per alleggerire gradualmente il pigmento, usare Pane e ripassare.


## Versione 6.2.8 — pressione simulata con mouse
Nel menu Regolazioni artistiche è disponibile un controllo 0–100% per matita, carboncino e pastello. A 0% il comportamento è identico alla 6.2.7; a valori superiori la velocità del mouse modula la pressione simulata. La pressione della tavoletta grafica resta indipendente.
