# CIGO STUDIO Paint 4.0 Complete

Web app di pittura, grafica e fotoritocco, con modalità Studio e Scuola.

**Ideato, progettato e creato dal Prof. Marco Cigolotti. Sviluppato con il supporto dell'intelligenza artificiale. © 2026.**

## Pubblicazione su GitHub Pages

1. Apri il repository `cigo-studio-paint`.
2. Carica `index.html` nella cartella principale del ramo `main`, sostituendo il precedente.
3. In Settings > Pages seleziona `Deploy from a branch`, ramo `main`, cartella `/(root)`.
4. Apri `https://marcocigolotti-tech.github.io/cigo-studio-paint/` dopo la pubblicazione.

Non sono necessari server, librerie esterne o account per disegnare.

## Salvataggio

- **Salva .cigopaint** scarica un progetto JSON contenente le immagini PNG di tutti i livelli e le impostazioni.
- **Apri progetto** ricarica il file `.cigopaint` e ricostruisce i livelli.
- **PNG/JPEG** esportano l'immagine composita (il JPEG usa uno sfondo bianco).
- Il browser non salva automaticamente: scarica regolarmente il progetto. Il salvataggio non usa servizi cloud.

## Strumenti

Pennello, matita, pennarello, aerografo, gomma, linee, rettangoli, ellissi, riempimento, contagocce, testo, selezione rettangolare, spostamento livello, mano. Livelli con visibilità, blocco, opacità, modalità di fusione, duplicazione e riordino. Filtri base sul livello attivo. Cronologia fino a 16 stati.

## Limiti dichiarati

Non è un sostituto di Photoshop. Le selezioni sono rettangolari, non sono presenti maschere o vettori modificabili. La cronologia memorizza copie PNG e può usare molta RAM con tele grandi. L'app è pensata inizialmente per tele medio-piccole e deve essere provata nel browser di destinazione. La pressione della penna non è ancora implementata.
