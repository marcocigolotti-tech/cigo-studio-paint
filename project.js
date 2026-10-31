// Verifica i progetti prima di allocare canvas e decodificare immagini.
export function validateProject(d){
 if(!d||d.format!=='CIGO_STUDIO_PAINT')throw Error('Formato progetto non riconosciuto');
 if(!Number.isInteger(d.width)||!Number.isInteger(d.height)||d.width<64||d.height<64||d.width>4096||d.height>4096)throw Error('Dimensioni non valide');
 if(!Array.isArray(d.layers)||d.layers.length<1||d.layers.length>40)throw Error('Numero livelli non valido');
 for(const l of d.layers){if(typeof l.png!=='string'||!l.png.startsWith('data:image/png;base64,')||l.png.length>50000000)throw Error('Immagine livello non valida')}
 return true;
}
